import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ZernioAnalyticsMetrics,
  ZernioAnalyticsPlatform,
  ZernioPostAnalyticsRecord,
} from "../zernio/types/zernio.types";
import { ZernioService } from "../zernio/zernio.service";
import { GetAnalyticsDto } from "./dto/get-analytics.dto";

export interface AnalyticsSeriesPoint {
  date: string;
  views: number;
  comments: number;
  likes: number;
  shares: number;
}

export interface PlatformAnalyticsSummary {
  platform: ZernioAnalyticsPlatform;
  label: string;
  totals: AnalyticsSeriesPoint & {
    saves: number;
    reach: number;
    impressions: number;
  };
  series: AnalyticsSeriesPoint[];
}

export interface AnalyticsResponse {
  fromDate: string;
  toDate: string;
  updatedAt: string;
  platforms: PlatformAnalyticsSummary[];
}

@Injectable()
export class AnalyticsService {
  private readonly platforms: Array<{
    platform: ZernioAnalyticsPlatform;
    label: string;
  }> = [
    { platform: "tiktok", label: "TikTok" },
    { platform: "instagram", label: "Instagram Reels" },
  ];

  private readonly isDevelopment: boolean;

  constructor(
    private readonly zernioService: ZernioService,
    private readonly configService: ConfigService,
  ) {
    this.isDevelopment =
      this.configService.get<string>("NODE_ENV") === "development";
  }

  async getAnalytics(query: GetAnalyticsDto): Promise<AnalyticsResponse> {
    const { fromDate, toDate } = this.resolveDateRange(query);

    if (this.isDevelopment) {
      return {
        fromDate,
        toDate,
        updatedAt: new Date().toISOString(),
        platforms: this.platforms.map(({ platform, label }) =>
          this.fakePlatformData(platform, label, fromDate, toDate),
        ),
      };
    }

    const platformSummaries = await Promise.all(
      this.platforms.map(async ({ platform, label }) => {
        const records = await this.zernioService.getPostAnalytics({
          platform,
          fromDate,
          toDate,
        });

        return this.summarizePlatform(platform, label, records);
      }),
    );

    return {
      fromDate,
      toDate,
      updatedAt: new Date().toISOString(),
      platforms: platformSummaries,
    };
  }

  private fakePlatformData(
    platform: ZernioAnalyticsPlatform,
    label: string,
    fromDate: string,
    toDate: string,
  ): PlatformAnalyticsSummary {
    const days = this.daysBetween(fromDate, toDate);
    const series: AnalyticsSeriesPoint[] = [];
    const totals = this.emptyTotals();

    for (let i = 0; i <= days; i++) {
      const date = this.formatDate(
        this.addDays(new Date(`${fromDate}T00:00:00Z`), i),
      );
      const views = Math.floor(Math.random() * 4000) + 500;
      const likes = Math.floor(views * (Math.random() * 0.12 + 0.04));
      const comments = Math.floor(likes * (Math.random() * 0.15 + 0.02));
      const shares = Math.floor(likes * (Math.random() * 0.1 + 0.01));

      series.push({ date, views, likes, comments, shares });

      totals.views += views;
      totals.likes += likes;
      totals.comments += comments;
      totals.shares += shares;
      totals.saves += Math.floor(likes * 0.05);
      totals.reach += Math.floor(views * 1.3);
      totals.impressions += Math.floor(views * 1.6);
    }

    return { platform, label, totals, series };
  }

  private daysBetween(fromDate: string, toDate: string): number {
    const from = new Date(`${fromDate}T00:00:00Z`);
    const to = new Date(`${toDate}T00:00:00Z`);
    return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000));
  }

  private resolveDateRange(query: GetAnalyticsDto) {
    const toDate = query.toDate ?? this.formatDate(new Date());
    const fromDate =
      query.fromDate ??
      this.formatDate(this.addDays(new Date(`${toDate}T00:00:00Z`), -29));

    if (fromDate > toDate) {
      throw new BadRequestException(
        "fromDate must be before or equal to toDate.",
      );
    }

    return { fromDate, toDate };
  }

  private summarizePlatform(
    platform: ZernioAnalyticsPlatform,
    label: string,
    records: ZernioPostAnalyticsRecord[],
  ): PlatformAnalyticsSummary {
    const seriesByDate = new Map<string, AnalyticsSeriesPoint>();
    const totals = this.emptyTotals();

    for (const record of records) {
      const metrics = this.extractMetrics(record);
      const date = this.extractDate(record);
      const point = seriesByDate.get(date) ?? {
        date,
        views: 0,
        comments: 0,
        likes: 0,
        shares: 0,
      };

      point.views += metrics.views ?? 0;
      point.comments += metrics.comments ?? 0;
      point.likes += metrics.likes ?? 0;
      point.shares += metrics.shares ?? 0;
      seriesByDate.set(date, point);

      totals.views += metrics.views ?? 0;
      totals.comments += metrics.comments ?? 0;
      totals.likes += metrics.likes ?? 0;
      totals.shares += metrics.shares ?? 0;
      totals.saves += metrics.saves ?? 0;
      totals.reach += metrics.reach ?? 0;
      totals.impressions += metrics.impressions ?? 0;
    }

    return {
      platform,
      label,
      totals,
      series: [...seriesByDate.values()].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    };
  }

  private extractMetrics(
    record: ZernioPostAnalyticsRecord,
  ): ZernioAnalyticsMetrics {
    return {
      ...record.metrics,
      ...record.analytics,
      views: record.views ?? record.analytics?.views ?? record.metrics?.views,
      comments:
        record.comments ??
        record.analytics?.comments ??
        record.metrics?.comments,
      likes: record.likes ?? record.analytics?.likes ?? record.metrics?.likes,
      shares:
        record.shares ?? record.analytics?.shares ?? record.metrics?.shares,
      saves: record.saves ?? record.analytics?.saves ?? record.metrics?.saves,
      reach: record.reach ?? record.analytics?.reach ?? record.metrics?.reach,
      impressions:
        record.impressions ??
        record.analytics?.impressions ??
        record.metrics?.impressions,
    };
  }

  private extractDate(record: ZernioPostAnalyticsRecord): string {
    const rawDate =
      record.publishedAt ??
      record.scheduledFor ??
      record.updatedAt ??
      record.createdAt ??
      new Date().toISOString();

    return rawDate.slice(0, 10);
  }

  private emptyTotals(): PlatformAnalyticsSummary["totals"] {
    return {
      date: "total",
      views: 0,
      comments: 0,
      likes: 0,
      shares: 0,
      saves: 0,
      reach: 0,
      impressions: 0,
    };
  }

  private addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);
    return nextDate;
  }

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
