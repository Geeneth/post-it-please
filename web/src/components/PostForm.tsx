'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPost } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CalendarClock, Send, UploadCloud } from 'lucide-react';
import type { PlatformOption, PostResponse } from '@/types/post';

const platformOptions: PlatformOption[] = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram Reels', value: 'instagram' },
  { label: 'YouTube Shorts', value: 'youtube' },
  { label: 'X', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Facebook', value: 'facebook' },
];

export function PostForm() {
  const [media, setMedia] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<PostResponse | null>(null);
  const [error, setError] = useState('');

  const canSubmit = useMemo(
    () => Boolean(media && caption.trim() && platforms.length > 0 && !isSubmitting),
    [caption, isSubmitting, media, platforms.length],
  );

  function setPlatformSelected(platform: string, checked: boolean) {
    setPlatforms((current) =>
      checked
        ? [...new Set([...current, platform])]
        : current.filter((item) => item !== platform),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError('');
    setResponse(null);

    if (!media) {
      setError('Choose a short-form video before posting.');
      return;
    }

    if (!caption.trim()) {
      setError('Write a caption before posting.');
      return;
    }

    if (platforms.length === 0) {
      setError('Select at least one platform.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPost({
        media,
        caption: caption.trim(),
        platforms,
        scheduledAt: scheduledAt || undefined,
      });

      setResponse(result);
      setMedia(null);
      setCaption('');
      setPlatforms([]);
      setScheduledAt('');
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong while posting.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-4 border-grape bg-cream shadow-[10px_10px_0_#3b1287]">
      <CardContent className="p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label
              htmlFor="media"
              className="flex items-center gap-2 text-base font-black text-grape"
            >
              <UploadCloud className="h-5 w-5" />
              Video
            </Label>
            <Input
              id="media"
              type="file"
              accept="video/*"
              onChange={(event) => setMedia(event.target.files?.[0] ?? null)}
              className="h-14 rounded-lg border-2 border-grape bg-field text-grape shadow-[4px_4px_0_#d8ad00] file:bg-grape file:text-white focus-visible:ring-grape"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="caption"
              className="text-base font-black text-grape"
            >
              Caption
            </Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={5}
              placeholder="Write the post caption..."
              className="min-h-32 resize-y rounded-lg border-2 border-grape bg-field text-grape shadow-[4px_4px_0_#d8ad00] placeholder:text-[#8a75a8] focus-visible:ring-grape"
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-base font-black leading-none text-grape">
              Platforms
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {platformOptions.map((platform) => {
                const checkboxId = `platform-${platform.value}`;

                return (
                  <div
                    key={platform.value}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-lg border-2 px-3 py-2 text-sm font-black transition-colors',
                      platforms.includes(platform.value)
                        ? 'border-grape bg-[#ffaf22] text-grape shadow-[4px_4px_0_#3b1287]'
                        : 'border-grape bg-field text-grape shadow-[4px_4px_0_#d8ad00] hover:bg-white',
                    )}
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={platforms.includes(platform.value)}
                      onCheckedChange={(checked) =>
                        setPlatformSelected(platform.value, checked === true)
                      }
                      className="border-2 border-grape data-[state=checked]:bg-grape data-[state=checked]:text-white"
                    />
                    <Label htmlFor={checkboxId} className="flex-1 cursor-pointer">
                      {platform.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label
              htmlFor="scheduledAt"
              className="flex items-center gap-2 text-base font-black text-grape"
            >
              <CalendarClock className="h-5 w-5" />
              Schedule time
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="h-14 rounded-lg border-2 border-grape bg-field text-grape shadow-[4px_4px_0_#d8ad00] focus-visible:ring-grape"
            />
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-14 rounded-lg border-2 border-grape bg-[#ffaf22] text-base font-black text-grape shadow-[5px_5px_0_#3b1287] transition-transform hover:-translate-y-0.5 hover:bg-[#ffc14f] disabled:border-[#9b9b9b] disabled:bg-[#d7d4c4] disabled:text-[#777] disabled:shadow-none"
          >
            <Send className="mr-2 h-5 w-5" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>

          {error ? (
            <p className="rounded-lg border-2 border-red-800 bg-red-100 px-4 py-3 text-sm font-bold text-red-800 shadow-[4px_4px_0_#3b1287]">
              {error}
            </p>
          ) : null}

          {response ? (
            <div className="rounded-lg border-2 border-grape bg-[#c7f7d4] px-4 py-3 text-sm font-bold text-grape shadow-[4px_4px_0_#3b1287]">
              <p className="font-semibold">{response.message}</p>
              {response.zernioPostId ? (
                <p className="mt-1">Zernio post ID: {response.zernioPostId}</p>
              ) : null}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
