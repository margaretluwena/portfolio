import Image from "next/image";
import Nav from "@/components/nav/Nav";
import { PageEnter } from "@/components/providers/PageTransition";
import { playWorks, type Block } from "@/lib/works";

/*
  PLAY — the sketchbook. Graphics + Small Works collections: Instagram posts,
  flyers, illustration, hackathon and class projects. Loose image flow, minimal
  chrome; the images carry it.
*/

function flatImages(blocks: Block[] = []): string[] {
  return blocks.flatMap((b) =>
    b.type === "image" ? [b.src] : b.type === "pair" ? [b.left, b.right] : []
  );
}

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; play &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[18vh]">
        <h1 className="wordmark text-title mb-3 text-ink">Play</h1>
        <p className="mb-14 max-w-[52ch] text-body-lg text-ink/60">
          The sketchbook: graphics, flyers, illustration, and small projects from
          hackathons, design challenges, and class. Made for fun, kept for the record.
        </p>

        {playWorks.map((w) => (
          <section key={w.slug} className="mb-[14vh]">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="wordmark text-[15px] text-ink">{w.title}</h2>
              <p className="text-[13px] tracking-[0.02em] text-ink/40">
                {w.category} · {w.year}
              </p>
            </div>
            {w.study?.summary && (
              <p className="mb-8 max-w-[52ch] text-body-lg text-ink/60">{w.study.summary}</p>
            )}
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>img]:mb-6">
              {flatImages(w.study?.blocks).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={900}
                  height={900}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full break-inside-avoid"
                />
              ))}
            </div>
          </section>
        ))}
      </PageEnter>
    </main>
  );
}
