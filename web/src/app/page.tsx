import { AnalyticsSection } from '@/components/AnalyticsSection';
import { PostForm } from '@/components/PostForm';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-10 top-28 h-28 w-28 rotate-12 rounded-[2rem] border-4 border-grape bg-cream shadow-[8px_8px_0_#b78b00]" />
      <div className="pointer-events-none absolute -right-8 bottom-16 h-36 w-36 -rotate-12 rounded-full border-4 border-grape bg-[#ffaf22] shadow-[8px_8px_0_#b78b00]" />

      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative z-10 pt-8 lg:pt-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-md border-2 border-grape bg-cream px-4 py-2 text-lg font-black text-grape shadow-[5px_5px_0_#3b1287]">
              Post It Please
            </div>
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-[0.95] text-grape drop-shadow-[3px_3px_0_#fff1ad] sm:text-6xl lg:text-7xl">
            Upload once. Post everywhere.
          </h1>
          <p className="mt-6 max-w-md text-lg font-bold leading-7 text-[#6f5a00]">
            Clip in, caption up, and send your short-form post to TikTok or
            Instagram Reels.
          </p>

          <div className="relative mt-10 h-64 max-w-md">
            <div className="absolute left-2 top-8 h-40 w-36 -rotate-6 rounded-lg border-4 border-grape bg-cream shadow-[8px_8px_0_#b78b00]" />
            <div className="absolute left-28 top-0 h-52 w-40 rotate-6 rounded-[2rem] border-4 border-grape bg-[#4b1fa3] shadow-[8px_8px_0_#b78b00]">
              <div className="mx-auto mt-4 h-4 w-16 rounded-full bg-cream" />
              <div className="mx-5 mt-4 flex h-32 items-center justify-center rounded-2xl border-4 border-grape bg-[#ffaf22]">
                <div className="h-16 w-16 rounded-full border-4 border-grape bg-cream shadow-[4px_4px_0_#3b1287]">
                  <div className="ml-5 mt-3 h-0 w-0 border-y-[18px] border-l-[28px] border-y-transparent border-l-grape" />
                </div>
              </div>
              <div className="mx-auto mt-4 h-5 w-5 rounded-full border-4 border-cream" />
            </div>
            <div className="absolute bottom-3 left-0 rounded-full border-4 border-grape bg-[#ff7bbd] px-5 py-3 text-sm font-black text-grape shadow-[6px_6px_0_#b78b00]">
              TikTok
            </div>
            <div className="absolute bottom-9 left-56 rounded-full border-4 border-grape bg-cream px-5 py-3 text-sm font-black text-grape shadow-[6px_6px_0_#b78b00]">
              Reels
            </div>
          </div>
        </section>

        <section className="relative z-10">
          <PostForm />
        </section>
      </div>

      <AnalyticsSection />
    </main>
  );
}
