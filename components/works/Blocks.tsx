"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import type { Block, Media, Work } from "@/lib/works";
import { getWork } from "@/lib/works";
import NdaGate from "@/components/works/NdaGate";
import Prox from "@/components/ui/Prox";

/*
  Case-study spine v2 renderers. One component per block type, dispatched
  by <Blocks/>; adding a work is a data edit only (lib/works.ts).

  The password gate is PARKED: gate blocks render nothing while
  GATE_ENABLED is false. NdaGate and /api/unlock stay intact - flip the
  flag to bring the lock back.

  Reduced motion: nothing here animates (blocks render static; the rail
  jump falls back from smooth to instant scrolling). Embeds never
  autoplay; video uses native keyboard-operable controls.
*/

const GATE_ENABLED = false;

/* rail: derived from blocks, context/problem/solution/gate only -
   wip and artifactGrid render inline but never appear in the rail */
const RAIL_TYPES = ["context", "problem", "solution", "gate"] as const;
const RAIL_NAMES: Record<string, string> = {
  context: "Context",
  problem: "Problem",
  solution: "Solution",
  gate: "Full study",
};

export function visibleBlocks(work: Work): Block[] {
  return GATE_ENABLED ? work.blocks : work.blocks.filter((b) => b.type !== "gate");
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

export function NeedText({ label, lines = 1, className = "" }: { label: string; lines?: number; className?: string }) {
  return (
    <span
      className={`grid w-full place-items-center bg-placeholder/50 ${className}`}
      style={{ minHeight: `${lines * 2.5}rem` }}
    >
      <span className="px-4 py-2 text-center text-label uppercase text-ink/40">NEED · {label}</span>
    </span>
  );
}

/* ---------- media ---------- */

function MediaView({ media, sizes = "(min-width: 768px) 640px, 100vw" }: { media: Media; sizes?: string }) {
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
    return (
      <div className="grid aspect-[3/2] w-full place-items-center bg-placeholder/50">
        <span className="px-4 text-center text-label uppercase text-ink/40">NEED · {media.alt}</span>
      </div>
    );
  }
  if (media.video) {
    return <video src={media.src} poster={media.poster} controls className="w-full" />;
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      width={1280}
      height={853}
      sizes={sizes}
      className="h-auto w-full"
    />
  );
}

/* ---------- blocks ---------- */

function ContextBlock({ block }: { block: Extract<Block, { type: "context" }> }) {
  return (
    <section className="space-y-8">
      <p className="whitespace-pre-line text-body-lg leading-relaxed text-ink/80">{block.body}</p>
      {block.media && <MediaView media={block.media} />}
    </section>
  );
}

function ProblemBlock({ block }: { block: Extract<Block, { type: "problem" }> }) {
  return (
    <section className="space-y-8">
      {isNeed(block.headline) ? (
        <NeedText label="problem headline" className="max-w-[440px]" />
      ) : (
        <h2 className="wordmark text-title text-ink">{block.headline}</h2>
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
        <p className="whitespace-pre-line text-body-lg leading-relaxed text-ink/80">{block.body}</p>
      )}
      {block.media && <MediaView media={block.media} />}
    </section>
  );
}

function SolutionBlock({ block }: { block: Extract<Block, { type: "solution" }> }) {
  return (
    <section className="space-y-16">
      {block.pieces.map((piece, i) => (
        <div key={`${i}-${piece.name}`} className="space-y-4">
          {isNeed(piece.name) ? (
            <NeedText label="piece name" className="max-w-[220px]" />
          ) : (
            <h3 className="text-label uppercase text-ink/50">{piece.name}</h3>
          )}
          {isNeed(piece.caption) ? (
            <NeedText label="caption" lines={2} className="max-w-[62ch]" />
          ) : (
            <p className="max-w-[62ch] text-body text-ink">{piece.caption}</p>
          )}
          <MediaView media={piece.media} />
        </div>
      ))}
    </section>
  );
}

function ArtifactGridBlock({ block }: { block: Extract<Block, { type: "artifactGrid" }> }) {
  return (
    <section className="grid grid-cols-2 gap-4">
      {block.media.map((m) => (
        <MediaView key={m.src + m.alt} media={m} sizes="(min-width: 768px) 320px, 50vw" />
      ))}
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

function GateBlock({ block, slug, title }: { block: Extract<Block, { type: "gate" }>; slug: string; title: string }) {
  if (!GATE_ENABLED) return null;
  return (
    <NdaGate slug={slug} title={title}>
      <p className="text-body-lg text-ink/60">{block.hint}</p>
    </NdaGate>
  );
}

export function Blocks({ work }: { work: Work }) {
  return (
    <div className="space-y-[12vh]">
      {visibleBlocks(work).map((b, i) => {
        const id = `block-${i}-${b.type}`;
        switch (b.type) {
          case "context":
            return <div key={id} id={id}><ContextBlock block={b} /></div>;
          case "problem":
            return <div key={id} id={id}><ProblemBlock block={b} /></div>;
          case "solution":
            return <div key={id} id={id}><SolutionBlock block={b} /></div>;
          case "artifactGrid":
            return <div key={id} id={id}><ArtifactGridBlock block={b} /></div>;
          case "wip":
            return <div key={id} id={id}><WipBlock block={b} /></div>;
          case "gate":
            return <div key={id} id={id}><GateBlock block={b} slug={work.slug} title={work.title} /></div>;
        }
      })}
    </div>
  );
}

/* ---------- section rail ---------- */

export function SectionRail({ work }: { work: Work }) {
  const entries = railEntries(work);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    if (entries.length < 2) return;
    const io = new IntersectionObserver(
      (obs) => {
        const hit = obs.filter((o) => o.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px" }
    );
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work.slug]);

  /* a rail with one entry tells the reader nothing - thin works skip it */
  if (entries.length < 2) return null;

  return (
    /* fixed to the far-left gutter (the --inset line the nav shares) so the
       case-study column stays centered on the page independent of the rail */
    <nav
      aria-label="Case study sections"
      className="fixed left-[var(--inset)] top-[34vh] z-10 hidden md:block"
    >
      <ol className="space-y-2">
        {entries.map((e) => {
          const current = e.id === active;
          return (
            <li key={e.id}>
              <button
                type="button"
                aria-current={current || undefined}
                onClick={() =>
                  document.getElementById(e.id)?.scrollIntoView({
                    behavior: reduce ? "auto" : "smooth",
                    block: "start",
                  })
                }
                className={`text-label italic transition-colors duration-500 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  current ? "text-ink" : "text-ink/40"
                }`}
              >
                {/* reserved dash slot - the counter language without the
                    layout jump that made the state change feel jarring */}
                <span className="inline-block w-3">{current ? "-" : ""}</span>
                {e.name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- next ---------- */

export function NextWork({ slug }: { slug: string }) {
  const target = getWork(slug);
  if (!target) return null;
  return (
    <p className="mt-[8vh] border-t border-hairline pt-6">
      <Prox baseOpacity={0.6} maxScale={1} radius={140}>
        <Link
          href={`/works/${target.slug}`}
          className="text-label uppercase text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Next · {target.title}
        </Link>
      </Prox>
    </p>
  );
}
