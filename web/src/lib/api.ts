import type { CreatePostInput, PostResponse } from '@/types/post';
import type { AnalyticsResponse } from '@/types/analytics';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function createPost(input: CreatePostInput): Promise<PostResponse> {
  const formData = new FormData();
  formData.append('media', input.media);
  formData.append('caption', input.caption);
  formData.append('platforms', JSON.stringify(input.platforms));

  if (input.scheduledAt) {
    formData.append('scheduledAt', input.scheduledAt);
  }

  const response = await fetch(`${apiUrl}/posts`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | (PostResponse & { error?: string; message?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || 'The backend could not create the post.',
    );
  }

  return data ?? { message: 'Post submitted successfully.' };
}

export async function getAnalytics(input?: {
  fromDate?: string;
  toDate?: string;
}): Promise<AnalyticsResponse> {
  const searchParams = new URLSearchParams();

  if (input?.fromDate) {
    searchParams.set('fromDate', input.fromDate);
  }

  if (input?.toDate) {
    searchParams.set('toDate', input.toDate);
  }

  const query = searchParams.toString();
  const response = await fetch(`${apiUrl}/analytics${query ? `?${query}` : ''}`);
  const data = (await response.json().catch(() => null)) as
    | (AnalyticsResponse & { error?: string; message?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || 'The backend could not load analytics.',
    );
  }

  if (!data) {
    throw new Error('The backend returned an empty analytics response.');
  }

  return data;
}
