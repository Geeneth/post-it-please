export interface AnalyticsSeriesPoint {
  date: string;
  views: number;
  comments: number;
  likes: number;
  shares: number;
}

export interface PlatformAnalytics {
  platform: 'tiktok' | 'instagram';
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
  platforms: PlatformAnalytics[];
}
