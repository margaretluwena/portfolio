import Image from "next/image";
import { PageEnter } from "@/components/providers/PageTransition";
import { playWorks, type Block } from "@/lib/works";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Play", description: "Graphics, flyers, illustrations, and small projects, made for fun." };

/*
  PLAY - grid only, per the A3 Prompt B spec: section header, one line of
  copy, the snippet images, no titles, no links, no case studies. The
  images are pulled straight from the play collections in lib/works.ts;
  anything needing a write-up doesn't belong here.
*/

function flatImages(blocks: Block[] = []): string[] {
  return blocks.flatMap((b) => (b.type === "artifactGrid" ? b.media.map((m) => m.src) : []));
}

const snippets = playWorks.flatMap((w) => flatImages(w.blocks));

export default function PlayPage() {
  return (
    <main className="min-h-screen">
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[18vh]">
        {/* no header and no intro line (Margaret, 2026-10-20); the pill already says PLAY */}
        <h1 className="sr-only">Play</h1>

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
