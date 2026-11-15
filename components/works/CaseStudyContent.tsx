"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Work } from "@/lib/works";
import { Blocks, SectionRail, NextWork, isNeed, HIDE_NEEDS, railEntries } from "@/components/works/Blocks";
import { CoverArt } from "@/components/works/WorkList";
import AsciiScrollbar from "@/components/works/AsciiScrollbar";
import { useEffect, useRef } from "react";
import Lightbox from "@/components/works/Lightbox";

/*
  The case-study body - Margaret's 2026-10-08 template (general for every
  study). One centered reading column, 56.4vw (1128/2000 on the mockup):

    hero          the cover, full column width, 1128:623
    title row     the lede as the headline, full width (no lockup since 2026-11-02)
    credits       four columns - Timeline / Role / Team / Disciplines -
                  blue labels over grey values
    sections      blue label ("Context") over large body copy (Blocks)
    rail          fixed in the left gutter at --inset: "Return" above the
                  section links (SectionRail)

  Rendered in two places:
    - variant="page"    -> the standalone /works/[slug] route
    - variant="overlay" -> the intercepting-route overlay on the home page

  The study enters on its own (hero rises in, then the rows fade in turn);
  the shared-element flight from the card is gone (Margaret, 2026-10-20),
  and with it the overlay route - variant "overlay" is kept for the type
  but nothing renders it now.

  Type: .study-title / .study-label / .study-body in globals.css, all body
  face (the mockup sets the headline in Manrope, not Nohemi). The label
  colour is the project's own (`work.accent`), set as --study-blue on the
  column; works without one keep the template blue (2026-10-08).
*/

const CREDIT_ORDER = ["Timeline", "Role", "Team", "Disciplines"];

export default function CaseStudyContent({ work, variant }: { work: Work; variant: "page" | "overlay" }) {
  const isOverlay = variant === "overlay";
  const router = useRouter();
  const column = useRef<HTMLDivElement>(null);

  /* the ASCII scrollbar stands in for the native one while a study is up */
  useEffect(() => {
    document.documentElement.classList.add("study-scroll");
    return () => document.documentElement.classList.remove("study-scroll");
  }, []);

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
      /* phones: the column runs between the same insets as every other
         page - 56.4vw of a 375px screen was a 212px reading column, which
         read as confined (Margaret, 2026-10-21) */
      /* lg+: 70vw, up from 56.4vw, so the UI in the visuals is large enough to read (Michelle Liu, 2026-11-14); prose keeps its own measure (Blocks) */
      /* md+ (Michelle Liu, 2026-11-14, full review): the column no longer centres itself. The rail's labels start at --inset, where the nav's text starts, and the column runs from just right of them to --align-r, where the nav's text ends. */
      className="study-zoom mx-auto w-[calc(100%-2*var(--inset))] md:mx-0 md:ml-[max(20vw,calc(var(--inset)+136px))] md:mr-[calc(100vw-var(--align-r))] md:w-auto"
      ref={column}
      style={work.accent ? ({ "--study-blue": work.accent } as React.CSSProperties) : undefined}
    >
      {/* hero - the shared element. A work's own `hero` image wins; else
          layered card art shows here (its 972/678 composition, centered
          and cropped to the template's wider 1128:623); else the cover
          image; NEED keeps the mockup's grey block. */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[1128/623] w-full overflow-hidden rounded-[4px] bg-placeholder"
        style={work.coverArt && !work.hero ? { background: work.cardBg ?? "#fff" } : undefined}
      >
        {work.hero && work.hero.src !== "NEED" ? (
          <Image src={work.hero.src} alt={work.hero.alt} fill sizes="(max-width: 768px) 92vw, 70vw" className="object-cover" priority />
        ) : work.coverArt ? (
          <div className="absolute inset-x-0 top-1/2 aspect-[972/678] -translate-y-1/2">
            <CoverArt work={work} hover={false} sizes="(max-width: 768px) 92vw, 70vw" />
          </div>
        ) : (
          work.cover &&
          work.cover.src !== "NEED" && (
            <Image
              src={work.cover.src}
              alt={work.cover.alt}
              fill
              sizes="(max-width: 768px) 92vw, 70vw"
              className="object-cover"
              priority
            />
          )
        )}
      </motion.div>

      {/* title row: the lede as the headline, full width. The lockup that
          sat right of it is gone (Margaret, 2026-11-02: "awkwardly placed");
          the title text is the work's name for screen readers via the page
          title, and the lockup still heads the home card. */}
      <motion.div {...fade(isOverlay ? 0.4 : 0.35)} className="mt-[6vh] space-y-5">
        <h1 className="study-title text-ink">{isNeed(work.lede) ? work.title : work.lede}</h1>
        {/* "The point": the study's one bold line, from the doc (2026-11-02) */}
        {work.point && <p className="study-lead font-medium text-ink"><span className="text-[var(--study-blue)]">The point. </span>{work.point}</p>}
      </motion.div>

      {/* credits - four columns on desktop, two on phones */}
      <motion.dl
        {...fade(isOverlay ? 0.5 : 0.45)}
        className="mt-[5vh] grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4"
      >
        {credits.map((c) => (
          <div key={c.label}>
            <dt className="study-label">{c.label}</dt>
            <dd className="study-body mt-2 text-ink/60">{c.value}</dd>
          </div>
        ))}
      </motion.dl>

      {/* sections; the rail is fixed to the gutter and renders independently */}
      <section className="mt-[10vh] pb-[10vh]">
        {!isOverlay && <AsciiScrollbar sections={railEntries(work)} />}
        <SectionRail work={work} onReturn={isOverlay ? () => router.back() : undefined} />
        <Blocks work={work} />
        <NextWork slug={work.slug} />
        <Lightbox scope={column} />
      </section>
    </div>
  );
}
