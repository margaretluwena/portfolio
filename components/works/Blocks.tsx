"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Block, Media, Work } from "@/lib/works";
import { indexWorks } from "@/lib/works";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";
import imageSizes from "@/lib/image-sizes.json";

/*
  Case-study spine v2 renderers. One component per block type, dispatched
  by <Blocks/>; adding a work is a data edit only (lib/works.ts).

  Template (2026-10-08): every rail section opens with its name as a blue
  .study-label and sets its prose in .study-body (see globals.css). The
  rail sits in the left gutter with "Return" above the section links.

  Reduced motion: nothing here animates (blocks render static; the rail
  jump falls back from smooth to instant scrolling). Embeds never
  autoplay; video uses native keyboard-operable controls.
*/

/* rail: derived from blocks, context/problem/solution/gate only -
   wip and artifactGrid render inline but never appear in the rail */
const RAIL_TYPES = ["context", "brief", "problem", "solution", "lessons"] as const;
const RAIL_NAMES: Record<string, string> = {
  context: "Context",
  brief: "Brief",
  problem: "Problem",
  solution: "Solution",
  lessons: "Takeaways",
};

export function visibleBlocks(work: Work): Block[] {
  return work.blocks;
}

export function railEntries(work: Work): { id: string; name: string }[] {
  return visibleBlocks(work)
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => (RAIL_TYPES as readonly string[]).includes(b.type))
    .map(({ b, i }) => ({ id: `block-${i}-${b.type}`, name: RAIL_NAMES[b.type] }));
}

/* ---------- NEED placeholders ----------
   Text fields whose value is exactly "NEED" are unwritten content
   (authoring guidance in docs/content/*.md never ships). They render as
   gray blocks in the same language as NEED media. */

export const isNeed = (s?: string) => s === "NEED";

/* Ship floor for the application weekend (Margaret, 2026-08-01): nothing
   gray ships - NEED text, NEED media, and NEED credit rows render as
   nothing instead of placeholders. Flip to false to see the authoring
   placeholders again. Real assets still replace hidden slots on top. */
export const HIDE_NEEDS = true;

export function NeedText({ label, lines = 1, className = "" }: { label: string; lines?: number; className?: string }) {
  if (HIDE_NEEDS) return null;
  return (
    <span
      className={`grid w-full place-items-center bg-placeholder/50 ${className}`}
      style={{ minHeight: `${lines * 2.5}rem` }}
    >
      <span className="px-4 py-2 text-center text-label uppercase text-ink/40">NEED · {label}</span>
    </span>
  );
}

/* ---------- media ----------
   Every image renders at its REAL aspect (lib/image-sizes.json, built by
   `npm run images`) and never wider than its pixels allow on a 2x screen -
   the 2026-10-08 audit found phone screenshots squashed into a 3:2 box and
   small stand-ins stretched 5x. Portrait images (app screens) sit at under
   half the column, centered; landscape ones take the column. */

const SIZES = imageSizes as unknown as Record<string, [number, number]>;

function MediaView({ media, sizes = "(max-width: 768px) 92vw, 56vw" }: { media: Media; sizes?: string }) {
  if (media.embed) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-placeholder/40">
        <iframe
          src={media.embed}
          title={media.alt}
          className="h-full w-full"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (media.src === "NEED") {
    if (HIDE_NEEDS) return null;
    return (
      <div className="grid aspect-[3/2] w-full place-items-center bg-placeholder/50">
        <span className="px-4 text-center text-label uppercase text-ink/40">NEED · {media.alt}</span>
      </div>
    );
  }
  if (media.video) {
    /* native controls; metadata only until played; inline on phones */
    return (
      <video
        src={media.src}
        poster={media.poster}
        controls
        preload="metadata"
        playsInline
        className="w-full rounded-[4px] bg-placeholder/40"
      />
    );
  }
  const [w, h] = SIZES[media.src] ?? [1280, 853];
  const portrait = isPortrait(media);
  /* portrait images (phone screens, tall packaging shots) are capped at 58vh
     and scale by height, so a 644x1400 screen never towers over its caption
     (Margaret, 2026-10-20: "really long and awkwardly placed") */
  return (
    <Image
      src={media.src}
      alt={media.alt}
      width={w}
      height={h}
      sizes={portrait ? "(max-width: 768px) 60vw, 25vw" : sizes}
      className={`block rounded-[4px] ${portrait ? "" : ""}`}
      /* landscape images take the column's full width (capped at their own
         pixel width) and share the text's left edge - centred, narrower
         images read as misaligned next to left-set copy (Margaret, 2026-10-21) */
      style={
        portrait
          ? { width: "auto", height: "auto", maxHeight: "58vh", maxWidth: `min(100%, ${Math.round(w / 2)}px)` }
          : { width: "100%", height: "auto", maxWidth: `min(100%, ${w}px)` }
      }
    />
  );
}

const isPortrait = (media: Media) => {
  if (media.src === "NEED" || media.video || media.embed) return false;
  const [w, h] = SIZES[media.src] ?? [1280, 853];
  return h > w * 1.15;
};

/* ---------- blocks ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="study-label">{children}</h2>;
}

function ContextBlock({ block }: { block: Extract<Block, { type: "context" }> }) {
  return (
    <section className="space-y-5">
      <SectionLabel>{RAIL_NAMES.context}</SectionLabel>
      <p className="study-body whitespace-pre-line text-ink">{block.body}</p>
      {block.media && <MediaView media={block.media} />}
    </section>
  );
}

function ProblemBlock({ block }: { block: Extract<Block, { type: "problem" }> }) {
  return (
    <section className="space-y-6">
      <SectionLabel>{RAIL_NAMES.problem}</SectionLabel>
      {isNeed(block.headline) ? (
        <NeedText label="problem headline" className="max-w-[440px]" />
      ) : (
        <h3 className="study-body font-medium text-ink">{block.headline}</h3>
      )}
      {/* evidence reads as data, not prose: label treatment, hairline-topped row */}
      <ul className="grid gap-6 md:grid-cols-3">
        {block.evidence.map((fact) => (
          <li key={fact} className="border-t border-hairline pt-3 text-label uppercase leading-relaxed text-ink/60">
            {fact}
          </li>
        ))}
      </ul>
      {isNeed(block.body) ? (
        <NeedText label="problem body" lines={3} />
      ) : (
        <p className="study-body whitespace-pre-line text-ink">{block.body}</p>
      )}
      {block.media && <MediaView media={block.media} />}
    </section>
  );
}

function SolutionBlock({ block }: { block: Extract<Block, { type: "solution" }> }) {
  /* under the ship floor, a piece that is all NEED leaves no empty shell */
  const pieces = HIDE_NEEDS
    ? block.pieces.filter((p) => !(isNeed(p.name) && isNeed(p.caption) && p.media.src === "NEED"))
    : block.pieces;
  return (
    <section className="space-y-[9vh]">
      <SectionLabel>{RAIL_NAMES.solution}</SectionLabel>
      {pieces.map((piece, i) => {
        const tall = isPortrait(piece.media);
        const text = (
          <div className="space-y-4">
            {isNeed(piece.name) ? (
              <NeedText label="piece name" className="max-w-[220px]" />
            ) : (
              <h3 className="study-body font-medium text-ink">{piece.name}</h3>
            )}
            {isNeed(piece.caption) ? (
              <NeedText label="caption" lines={2} className="max-w-[62ch]" />
            ) : (
              <p className="max-w-[48ch] text-[clamp(15px,1.05vw,19px)] leading-[1.45] text-ink/75">{piece.caption}</p>
            )}
          </div>
        );
        /* a tall image sits beside its text instead of under it, so the
           column never carries a phone screen with nothing to its sides
           (Margaret, 2026-10-20) */
        /* a gallery: the piece's extra images in one row, side by side, tops
           aligned, with a clear breath above it (Margaret, 2026-10-21) */
        const gallery = piece.gallery && piece.gallery.length > 0 && (
          <div className="grid grid-cols-3 items-start gap-3 pt-[4vh] md:gap-5">
            {piece.gallery.map((m) => {
              const [w, h] = SIZES[m.src] ?? [1200, 1600];
              return (
                <Image key={m.src} src={m.src} alt={m.alt} width={w} height={h} sizes="(max-width: 768px) 30vw, 18vw" className="block h-auto w-full rounded-[4px]" />
              );
            })}
          </div>
        );
        /* a tall image beside its text sits flush with the column's right edge,
           so the phone screens down the study share one line (Margaret, 2026-10-21) */
        return tall ? (
          <div key={`${i}-${piece.name}`} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,42%)] md:items-start md:gap-10">
              {text}
              <div className="md:flex md:justify-end">
                <MediaView media={piece.media} />
              </div>
            </div>
            {gallery}
          </div>
        ) : (
          <div key={`${i}-${piece.name}`} className="space-y-5">
            {text}
            <MediaView media={piece.media} />
            {gallery}
          </div>
        );
      })}
    </section>
  );
}

function BriefBlock({ block }: { block: Extract<Block, { type: "brief" }> }) {
  return (
    <section className="space-y-6">
      <SectionLabel>{RAIL_NAMES.brief}</SectionLabel>
      <h3 className="study-body font-medium text-ink">{block.objective}</h3>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <h4 className="text-label uppercase text-ink/50">Goals</h4>
          <ul className="mt-3 space-y-2">
            {block.goals.map((g) => (
              <li key={g} className="border-t border-hairline pt-2 text-body text-ink">{g}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-label uppercase text-ink/50">What I did</h4>
          <ul className="mt-3 space-y-2">
            {block.did.map((d) => (
              <li key={d} className="border-t border-hairline pt-2 text-body text-ink">{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LessonsBlock({ block }: { block: Extract<Block, { type: "lessons" }> }) {
  return (
    <section className="space-y-6">
      <SectionLabel>{RAIL_NAMES.lessons}</SectionLabel>
      <ol className="grid gap-8 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] md:gap-10">
        {block.items.map((it, i) => (
          <li key={it.title} className="space-y-2 border-t border-hairline pt-4">
            <span className="text-label uppercase text-ink/40">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="study-body font-medium text-ink">{it.title}</h3>
            <p className="text-body text-ink/70">{it.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ArtifactGridBlock({ block }: { block: Extract<Block, { type: "artifactGrid" }> }) {
  /* a masonry: three columns, every image at its own aspect, stacked -
     nothing cropped or forced into a square (Margaret, 2026-10-08).
     HIDE_NEEDS drops empty slots. */
  const media = HIDE_NEEDS ? block.media.filter((m) => m.src !== "NEED") : block.media;
  return (
    <section className="columns-2 gap-3 md:columns-3 md:gap-4">
      {media.map((m) => {
        const [w, h] = SIZES[m.src] ?? [1200, 900];
        return (
          <div key={m.src + m.alt} className="mb-3 break-inside-avoid overflow-hidden rounded-[4px] bg-placeholder/40 md:mb-4">
            {m.src === "NEED" ? (
              <span className="grid aspect-[4/3] place-items-center px-4 text-center text-label uppercase text-ink/40">NEED · {m.alt}</span>
            ) : (
              <Image src={m.src} alt={m.alt} width={w} height={h} sizes="(max-width: 768px) 46vw, 19vw" className="block h-auto w-full" />
            )}
          </div>
        );
      })}
    </section>
  );
}

function WipBlock({ block }: { block: Extract<Block, { type: "wip" }> }) {
  /* one quiet line - no box, no icon, no emphasis */
  return (
    <p className="text-secondary text-ink/50">
      This study is being written. For the full story in the meantime,{" "}
      <a href={`mailto:${block.email}`} className="underline underline-offset-4 hover:text-ink">
        {block.email}
      </a>
      .
    </p>
  );
}

export function Blocks({ work }: { work: Work }) {
  return (
    <div className="space-y-[10vh]">
      {visibleBlocks(work).map((b, i) => {
        const id = `block-${i}-${b.type}`;
        switch (b.type) {
          case "context":
            return <div key={id} id={id}><ContextBlock block={b} /></div>;
          case "brief":
            return <div key={id} id={id}><BriefBlock block={b} /></div>;
          case "problem":
            return <div key={id} id={id}><ProblemBlock block={b} /></div>;
          case "lessons":
            return <div key={id} id={id}><LessonsBlock block={b} /></div>;
          case "solution":
            return <div key={id} id={id}><SolutionBlock block={b} /></div>;
          case "artifactGrid":
            return <div key={id} id={id}><ArtifactGridBlock block={b} /></div>;
          case "wip":
            return <div key={id} id={id}><WipBlock block={b} /></div>;
        }
      })}
    </div>
  );
}

/* ---------- section rail ---------- */

/* the Return arrow shows once the page has scrolled past where the nav
   pill leaves (the same 160px), rising in; at the top the pill's own
   wordmark is the way home, so the arrow would only double it */
const RETURN_AT = 160;
function useScrolledPast(px: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const read = (e?: Event) => {
      const t = e?.target;
      const el = t && t !== document ? (t as Element) : document.scrollingElement;
      if (!el || !(el instanceof Element)) return;
      setOn(el.scrollTop > px);
    };
    read();
    document.addEventListener("scroll", read, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", read, { capture: true });
  }, [px]);
  return on;
}

export function SectionRail({ work, onReturn }: { work: Work; onReturn?: () => void }) {
  const entries = railEntries(work);
  const reduce = useReducedMotion();
  const on = useScrolledPast(RETURN_AT);
  /* the return arrow (a left hook) on its own - no word (Margaret,
     2026-10-21) and no circle around it either (2026-10-28: "keep the icon,
     remove the button"); the name survives for screen readers */
  const returnLabel = (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
      <path d="M5.5 3.5 2 7l3.5 3.5M2 7h7a3 3 0 0 1 0 6H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  /* a generous hit area, nothing drawn but the icon */
  const bare =
    "grid place-items-center transition-colors duration-300 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
  /* phones: the arrow scrolls over images, so it sits on a soft frosted
     spot - a blur and a little white, no outline, no shadow - that keeps
     it legible over a dark screenshot without reading as a button */
  const phoneBare = `${bare} h-[44px] w-[44px] -ml-[13px] rounded-full bg-white/60 text-ink/80 backdrop-blur-md`;
  const railBare = `${bare} h-[36px] w-[36px] -ml-[9px] text-ink/60`;
  /* rises in once scrolled, and is not a target until it has */
  const reveal = {
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 10 },
    transition: { duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] as const },
    style: { pointerEvents: on ? ("auto" as const) : ("none" as const) },
  };
  /* the section links now live on the ASCII minimap (AsciiScrollbar), at the
     rows their sections land on (Margaret, 2026-10-21); the rail keeps Return,
     above the minimap and aligned with its labels. A thin work with one entry
     has no minimap labels to speak of, so Return is all it shows either way. */
  void entries;

  return (
    <>
    {/* phones: the minimap is hidden and the nav pill leaves on scroll, so the
        Return arrow sits pinned at the bottom-left once the page has scrolled */}
    <motion.div {...reveal} className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-[var(--inset)] z-40 md:hidden">
      {onReturn ? (
        <button type="button" onClick={onReturn} aria-label="Return" className={phoneBare}>
          {returnLabel}
        </button>
      ) : (
        <TransitionLink href="/" aria-label="Return" className={phoneBare}>
          {returnLabel}
        </TransitionLink>
      )}
    </motion.div>
    <motion.nav
      {...reveal}
      aria-label="Case study"
      className="fixed left-[calc(var(--inset)*0.18+72px)] top-[21vh] z-30 hidden md:block"
    >
      {onReturn ? (
        <button type="button" onClick={onReturn} aria-label="Return" className={railBare}>
          {returnLabel}
        </button>
      ) : (
        <TransitionLink href="/" aria-label="Return" className={railBare}>
          {returnLabel}
        </TransitionLink>
      )}
    </motion.nav>
    </>
  );
}

/* ---------- next ---------- */

/* the way on from a study: previous on the left, next on the right, walking
   the open studies in their index order (Margaret, 2026-10-21). Only
   studies with a page count; the first has no previous and the last no next. */
export function NextWork({ slug }: { slug: string }) {
  const open = indexWorks.filter((w) => !w.comingSoon);
  const i = open.findIndex((w) => w.slug === slug);
  const prev = i > 0 ? open[i - 1] : null;
  const next = i >= 0 && i < open.length - 1 ? open[i + 1] : null;
  if (!prev && !next) return null;
  const cls = "text-label uppercase text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
  return (
    <p className="mt-[8vh] flex items-center justify-between gap-6 border-t border-hairline pt-6">
      <span>
        {prev && (
          <Prox baseOpacity={0.6} maxScale={1} radius={140}>
            <TransitionLink href={`/works/${prev.slug}`} className={cls}>
              Previous · {prev.title}
            </TransitionLink>
          </Prox>
        )}
      </span>
      <span className="text-right">
        {next && (
          <Prox baseOpacity={0.6} maxScale={1} radius={140}>
            <TransitionLink href={`/works/${next.slug}`} className={cls}>
              Next · {next.title}
            </TransitionLink>
          </Prox>
        )}
      </span>
    </p>
  );
}
