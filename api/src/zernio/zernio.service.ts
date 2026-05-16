import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  ZernioCreatePostRequest,
  ZernioCreatePostResponse,
  ZernioAnalyticsListResponse,
  ZernioAnalyticsPlatform,
  ZernioMediaItem,
  ZernioPlatformTarget,
  ZernioPostAnalyticsRecord,
  ZernioPresignResponse,
} from './types/zernio.types';

interface PublishPostInput {
  mediaFile: Express.Multer.File;
  caption: string;
  platforms: string[];
  scheduledAt?: string;
}

@Injectable()
export class ZernioService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timezone: string;
  private readonly platformAccountIds: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ZERNIO_API_KEY') ?? '';
    this.baseUrl =
      this.configService.get<string>('ZERNIO_BASE_URL') ??
      'https://zernio.com/api/v1';
    this.timezone = this.configService.get<string>('ZERNIO_TIMEZONE') ?? 'UTC';
    this.platformAccountIds = this.parsePlatformAccountIds();
  }

  async publishPost(input: PublishPostInput): Promise<ZernioCreatePostResponse> {
    this.ensureApiKey();

    const mediaItem = await this.uploadMediaToZernio(input.mediaFile);
    return this.createZernioPost({
      caption: input.caption,
      mediaItem,
      platforms: input.platforms,
      scheduledAt: input.scheduledAt,
    });
  }

  async getPostAnalytics(input: {
    platform: ZernioAnalyticsPlatform;
    fromDate: string;
    toDate: string;
    limit?: number;
  }): Promise<ZernioPostAnalyticsRecord[]> {
    this.ensureApiKey();

    const params: Record<string, string | number> = {
      platform: input.platform,
      fromDate: input.fromDate,
      toDate: input.toDate,
      limit: input.limit ?? 100,
    };

    const accountId = this.platformAccountIds[input.platform];

    if (accountId) {
      params.accountId = accountId;
    }

    try {
      const response = await axios.get<ZernioAnalyticsListResponse>(
        `${this.baseUrl}/analytics`,
        {
          headers: this.authHeaders(),
          params,
        },
      );

      return this.normalizeAnalyticsResponse(response.data);
    } catch (error) {
      this.handleZernioError(
        error,
        `Zernio analytics fetch failed for ${input.platform}.`,
      );
    }
  }

  private async uploadMediaToZernio(
    mediaFile: Express.Multer.File,
  ): Promise<ZernioMediaItem> {
    const contentType = mediaFile.mimetype || 'video/mp4';

    try {
      const presignResponse = await axios.post<ZernioPresignResponse>(
        `${this.baseUrl}/media/presign`,
        {
          filename: mediaFile.originalname,
          contentType,
          size: mediaFile.size,
        },
        {
          headers: this.authHeaders(),
        },
      );

      await axios.put(presignResponse.data.uploadUrl, mediaFile.buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': mediaFile.size,
        },
        maxBodyLength: Infinity,
      });

      return {
        url: presignResponse.data.publicUrl,
        type: presignResponse.data.type ?? this.inferMediaType(contentType),
      };
    } catch (error) {
      this.handleZernioError(error, 'Zernio media upload failed.');
    }
  }

  private async createZernioPost(input: {
    caption: string;
    mediaItem: ZernioMediaItem;
    platforms: string[];
    scheduledAt?: string;
  }): Promise<ZernioCreatePostResponse> {
    const payload: ZernioCreatePostRequest = {
      content: input.caption,
      mediaItems: [input.mediaItem],
      platforms: this.buildPlatformTargets(input.platforms),
      timezone: this.timezone,
      ...(input.scheduledAt
        ? { scheduledFor: input.scheduledAt }
        : { publishNow: true }),
    };

    try {
      const response = await axios.post<ZernioCreatePostResponse>(
        `${this.baseUrl}/posts`,
        payload,
        {
          headers: this.authHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      this.handleZernioError(error, 'Zernio post creation failed.');
    }
  }

  private buildPlatformTargets(platforms: string[]): ZernioPlatformTarget[] {
    const missingAccountIds = platforms.filter(
      (platform) => !this.platformAccountIds[platform],
    );

    if (missingAccountIds.length > 0) {
      throw new BadRequestException(
        `Missing Zernio account IDs for: ${missingAccountIds.join(', ')}.`,
      );
    }

    return platforms.map((platform) => ({
      platform,
      accountId: this.platformAccountIds[platform],
    }));
  }

  private authHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private ensureApiKey() {
    if (!this.apiKey) {
      throw new InternalServerErrorException('ZERNIO_API_KEY is not configured.');
    }
  }

  private parsePlatformAccountIds(): Record<string, string> {
    const raw = this.configService.get<string>('ZERNIO_PLATFORM_ACCOUNT_IDS');

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }

      return Object.fromEntries(
        Object.entries(parsed).filter(
          ([, accountId]) => typeof accountId === 'string' && accountId.length > 0,
        ),
      ) as Record<string, string>;
    } catch {
      return {};
    }
  }

  private inferMediaType(contentType: string): ZernioMediaItem['type'] {
    if (contentType.startsWith('image/')) {
      return 'image';
    }

    if (contentType === 'application/pdf') {
      return 'document';
    }

    return 'video';
  }

  private normalizeAnalyticsResponse(
    response: ZernioAnalyticsListResponse,
  ): ZernioPostAnalyticsRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    if ('postId' in response || 'analytics' in response || 'metrics' in response) {
      return [response];
    }

    const paginatedResponse = response as Exclude<
      ZernioAnalyticsListResponse,
      ZernioPostAnalyticsRecord[] | ZernioPostAnalyticsRecord
    >;
    const listKeys = ['data', 'items', 'posts', 'results'] as const;

    for (const key of listKeys) {
      const value = paginatedResponse[key];

      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  }

  private handleZernioError(error: unknown, fallbackMessage: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const status = axiosError.response?.status;
      const zernioMessage =
        axiosError.response?.data?.error || axiosError.response?.data?.message;

      throw new BadGatewayException({
        message: fallbackMessage,
        zernioStatus: status,
        zernioError: zernioMessage ?? 'No error message returned by Zernio.',
      });
    }

    throw new BadGatewayException(fallbackMessage);
  }
}
