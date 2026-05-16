export type PlatformValue =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'facebook';

export interface PlatformOption {
  label: string;
  value: PlatformValue;
}

export interface CreatePostInput {
  media: File;
  caption: string;
  platforms: string[];
  scheduledAt?: string;
}

export interface PostResponse {
  message: string;
  zernioPostId?: string;
  status?: string;
}
