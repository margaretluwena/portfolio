"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Work } from "@/lib/works";
import { Blocks, SectionRail, NextWork, isNeed, HIDE_NEEDS } from "@/components/works/Blocks";
import { CoverArt } from "@/components/works/WorkList";

/*
  The case-study body - Margaret's 2026-10-08 template (general for every
  study). One centered reading column, 56.4vw (1128/2000 on the mockup):

    hero          the cover, full column width, 1128:623
    title row     the lede as the headline, the work's lockup right-aligned
    credits       four columns - Timeline / Role / Team / Disciplines -
                  blue labels over grey values
    sections      blue label ("Context") over large body copy (Blocks)
    rail          fixed in the left gutter at --inset: "Return" above the
                  section links (SectionRail)

  Rendered in two places:
    - variant="page"    -> the standalone /works/[slug] route
    - variant="overlay" -> the intercepting-route overlay on the home page

  The hero keeps layoutId={`work-${slug}`} - the shared element that lets
  the cover fly from the WorkList column when opened as an overlay. Its box
  changed shape with the template (wider, 1128:623), so the flight is now a
  move + grow rather than a pure move; motion handles both.

  Type: .study-title / .study-label / .study-body in globals.css, all body
  face (the mockup sets the headline in Manrope, not Nohemi). The label
  colour is the project's own (`work.accent`), set as --study-blue on the
  column; works without one keep the template blue (2026-10-08).
*/

const CREDIT_ORDER = ["Timeline", "Role", "Team", "Disciplines"];

export default function CaseStudyContent({ work, variant }: { work: Work; variant: "page" | "overlay" }) {
  const isOverlay = variant === "overlay";
  const router = useRouter();

  const credits = (HIDE_NEEDS ? work.credits.filter((c) => !isNeed(c.value)) : work.credits)
    .slice()
    .sort((a, b) => CREDIT_ORDER.indexOf(a.label) - CREDIT_ORDER.indexOf(b.label));

  const fade = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0 } },
    transition: { duration: 0.6, delay },
  });

  return (
    <div
      className="mx-auto w-[min(56.4vw,92vw)]"
      style={work.accent ? ({ "--study-blue": work.accent } as React.CSSProperties) : undefined}
    >
      {/* hero - the shared element. A work's own `hero` image wins; else
          layered card art shows here (its 972/678 composition, centered
          and cropped to the template's wider 1128:623); else the cover
          image; NEED keeps the mockup's grey block. */}
      <motion.div
        layoutId={`work-${work.slug}`}
        transition={{ layout: { duration: 0.8, ease: [0.7, 0, 0.2, 1] } }}
        className="relative aspect-[1128/623] w-full overflow-hidden rounded-[4px] bg-placeholder"
        style={work.coverArt && !work.hero ? { background: work.cardBg ?? "#fff" } : undefined}
      >
        {work.hero && work.hero.src !== "NEED" ? (
          <Image src={work.hero.src} alt={work.hero.alt} fill sizes="(max-width: 768px) 92vw, 56vw" className="object-cover" priority />
        ) : work.coverArt ? (
          <div className="absolute inset-x-0 top-1/2 aspect-[972/678] -translate-y-1/2">
            <CoverArt work={work} hover={false} sizes="(max-width: 768px) 92vw, 56vw" />
          </div>
        ) : (
          work.cover &&
          work.cover.src !== "NEED" && (
            <Image
              src={work.cover.src}
              alt={work.cover.alt}
              fill
              sizes="(max-width: 768px) 92vw, 56vw"
              className="object-cover"
              priority
            />
          )
        )}
      </motion.div>

      {/* title row: headline left, lockup right */}
      <motion.div
        {...fade(isOverlay ? 0.4 : 0.35)}
        className="mt-[6vh] flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10"
      >
        <h1 className="study-title text-ink">{isNeed(work.lede) ? work.title : work.lede}</h1>
        {work.wordmark ? (
          /* eslint-disable-next-line @next/next/no-img-element -- local static SVG */
          <img
            src={work.wordmark}
            alt={work.title}
            className="block h-auto w-[max(96px,12.9%)] shrink-0 md:mb-[0.35em]"
            style={work.wordmarkGlow ? { filter: work.wordmarkGlow } : undefined}
          />
        ) : (
          <span className="wordmark text-corner shrink-0 text-ink">{work.title}</span>
        )}
      </motion.div>

      {/* credits - four columns on desktop, two on phones */}
      <motion.dl
        {...fade(isOverlay ? 0.5 : 0.45)}
        className="mt-[5vh] grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4"
      >
        {credits.map((c) => (
          <div key={c.label}>
            <dt className="study-label">{c.label}</dt>
            <dd className="mt-2 text-body text-ink/60">{c.value}</dd>
          </div>
        ))}
      </motion.dl>

      {/* sections; the rail is fixed to the gutter and renders independently */}
      <section className="mt-[10vh] pb-[10vh]">
        <SectionRail work={work} onReturn={isOverlay ? () => router.back() : undefined} />
        <Blocks work={work} />
        <NextWork slug={work.next} />
      </section>
    </div>
  );
}
