import Image from "next/image";
import Nav from "@/components/nav/Nav";
import { PageEnter } from "@/components/providers/PageTransition";
import { playWorks, type Block } from "@/lib/works";

/*
  PLAY — grid only, per the A3 Prompt B spec: section header, one line of
  copy, the snippet images, no titles, no links, no case studies. The
  images are pulled straight from the play collections in lib/works.ts;
  anything needing a write-up doesn't belong here.
*/

function flatImages(blocks: Block[] = []): string[] {
  return blocks.flatMap((b) =>
    b.type === "image" ? [b.src] : b.type === "pair" ? [b.left, b.right] : []
  );
}

const snippets = playWorks.flatMap((w) => flatImages(w.study?.blocks));

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; play &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[18vh]">
        <h1 className="wordmark text-title mb-3 text-ink">Play</h1>
        <p className="mb-14 max-w-[52ch] text-body-lg text-ink/60">
          Graphics, flyers, illustration, and small projects, made for fun and kept for the record.
        </p>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>img]:mb-6">
          {snippets.map((src) => (
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
      </PageEnter>
    </main>
  );
}
