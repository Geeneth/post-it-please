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
  disabled?: boolean;
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
