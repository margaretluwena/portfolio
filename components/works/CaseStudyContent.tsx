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
      /* md+ (Michelle Liu, 2026-11-14, full review): the column no longer centres itself. The rail's labels start at --inset, where the nav's text starts, and the column runs to --align-r, where the nav's text ends. It starts at 28vw: at 20vw it read as too big and too close to the rail (Margaret, same day). */
      className="study-zoom mx-auto w-[calc(100%-2*var(--inset))] max-w-[760px] lg:mx-0 lg:ml-[max(28vw,calc(var(--inset)+200px))] lg:mr-[calc(100vw-var(--align-r))] lg:w-auto" /* below lg (phones AND tablets) there is no side rail: the column is centred between the page insets, so a 768px tablet is not left with a 390px column beside a 280px rail. 760px: text and visuals share one width and one left edge, like the reference (2026-11-14); click a visual to see it large */
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
        {/* "The point." line removed from under the title (Margaret, 2026-11-14: it felt arbitrary). Each study says the same sentence again as the second paragraph of its Setup section, a screen below, so here it was a repeat. The `point` field stays in lib/works.ts. */}
      </motion.div>

      {/* credits - four columns on desktop, two on phones */}
      <motion.dl
        {...fade(isOverlay ? 0.5 : 0.45)}
        className="mt-[5vh] grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4"
      >
        {credits.map((c) => (
          <div key={c.label}>
            <dt className="study-label">{c.label}</dt>
            <dd className="study-body mt-1 text-ink/70">{c.value}</dd>
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
