export type ZernioMediaType = 'image' | 'video' | 'document';

export interface ZernioPresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key?: string;
  type?: ZernioMediaType;
}

export interface ZernioPlatformTarget {
  platform: string;
  accountId: string;
}

export interface ZernioMediaItem {
  url: string;
  type: ZernioMediaType;
}

export interface ZernioCreatePostRequest {
  content: string;
  mediaItems: ZernioMediaItem[];
  platforms: ZernioPlatformTarget[];
  timezone: string;
  scheduledFor?: string;
  publishNow?: boolean;
}

export interface ZernioCreatePostResponse {
  post?: {
    _id?: string;
    status?: string;
  };
  message?: string;
}

export type ZernioAnalyticsPlatform = 'tiktok' | 'instagram';

export interface ZernioAnalyticsMetrics {
  views?: number;
  comments?: number;
  likes?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
}

export interface ZernioPostAnalyticsRecord {
  postId?: string;
  platform?: string;
  accountId?: string;
  content?: string;
  publishedAt?: string;
  scheduledFor?: string;
  createdAt?: string;
  updatedAt?: string;
  analytics?: ZernioAnalyticsMetrics;
  metrics?: ZernioAnalyticsMetrics;
  views?: number;
  comments?: number;
  likes?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
}

export type ZernioAnalyticsListResponse =
  | ZernioPostAnalyticsRecord[]
  | {
      data?: ZernioPostAnalyticsRecord[];
      items?: ZernioPostAnalyticsRecord[];
      posts?: ZernioPostAnalyticsRecord[];
      results?: ZernioPostAnalyticsRecord[];
      total?: number;
      page?: number;
      limit?: number;
    }
  | ZernioPostAnalyticsRecord;
