import { PageEnter } from "@/components/providers/PageTransition";
import { playWorks, type Block } from "@/lib/works";
import Clothesline, { type PlayItem } from "@/components/play/Clothesline";
import imageSizes from "@/lib/image-sizes.json";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Play", description: "Graphics, flyers, illustrations, and small projects, made for fun." };

/*
  PLAY - the pieces hang on a clothesline (Margaret, 2026-11-03): a
  window-tall scene with the poles and the basket planted on the sky's
  hills, the pieces starting in the basket, and the filter you pick
  lifting the matching ones up onto the line (which scrolls on its own
  above the basket when the rows outgrow the window). The images and their groups come
  straight from the play collections in lib/works.ts; each collection's
  title is a filter. No titles on the pieces, no case studies.
*/

const SIZES = imageSizes as unknown as Record<string, [number, number]>;

function itemsOf(blocks: Block[] = [], group: string): PlayItem[] {
  return blocks.flatMap((b) => (b.type === "artifactGrid" ? b.media.map((m) => {
    const [w, h] = SIZES[m.src] ?? [1200, 900];
    return { src: m.src, w, h, group, alt: m.alt || undefined };
  }) : []));
}

const groups = playWorks.map((w) => w.title);
const items = playWorks.flatMap((w) => itemsOf(w.blocks, w.title));

export default function PlayPage() {
  return (
    <main className="min-h-screen">
      <PageEnter className="px-[var(--margin-outer)]">
        <h1 className="sr-only">Play</h1>
        <Clothesline items={items} groups={groups} />
      </PageEnter>
    </main>
  );
}
