"use client";

import { motion } from "motion/react";
import type { Work } from "@/lib/works";
import { Blocks, SectionRail, NextWork } from "@/components/works/Blocks";

/*
  The case-study body — spine v2: frame -> rail -> blocks -> next.
  Rendered in two places:
    - variant="page"    -> the standalone /works/[slug] route
    - variant="overlay" -> the intercepting-route overlay on the home page

  FRAME: title + lede left, credits strip right, the SAME centered hero
  with layoutId={`work-${slug}`} between them — the shared element that
  lets the cover fly from the WorkList column when opened as an overlay.
  The layoutId wiring and landing position are deliberately untouched by
  the spine restructure (body only).

  The rail (left, sticky) derives from the blocks array and skips itself
  for thin works (<2 entries), so frame + context + wip reads deliberate.
*/

export default function CaseStudyContent({ work, variant }: { work: Work; variant: "page" | "overlay" }) {
  const isOverlay = variant === "overlay";

  return (
    <>
      <section>
        {/* hero — the shared element, landing centered at the card's own
            size (same 972/678 box as the home column, so the flight is a
            move, not an expansion) */}
        <motion.div
          layoutId={`work-${work.slug}`}
          transition={{ layout: { duration: 0.8, ease: [0.7, 0, 0.2, 1] } }}
          className="mx-auto aspect-[972/678] w-[min(var(--card-w),86vw)] bg-placeholder"
        >
          {/* work.cover lands here once the export exists (NEED for now) */}
        </motion.div>

        {/* below the card, aligned to its edges: title + lede left,
            credits right */}
        <div className="mx-auto mt-8 flex w-[min(var(--card-w),86vw)] flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
            transition={{ duration: 0.6, delay: isOverlay ? 0.4 : 0.35 }}
            className="md:max-w-[46%]"
          >
            <h1 className="wordmark text-corner mb-3 text-ink">{work.title}</h1>
            <p className="text-body-lg text-ink/55">{work.lede}</p>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
            transition={{ duration: 0.6, delay: isOverlay ? 0.5 : 0.45 }}
            className="text-body-lg text-ink/80"
          >
            <dl className="space-y-2">
              {work.credits.map((c) => (
                <div key={c.label} className="flex gap-3 md:justify-end">
                  <dt className="shrink-0 text-ink/40">{c.label}</dt>
                  <dd className="text-ink md:text-right">{c.value}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </div>
      </section>

      {/* BODY: centered column; the rail is fixed to the far left gutter
          and renders independently (it skips itself for thin works, so
          frame + context + wip reads deliberate, not broken) */}
      <section className="mt-[12vh] pb-[10vh] md:mx-auto md:max-w-[640px]">
        <SectionRail work={work} />
        <Blocks work={work} />
        <NextWork slug={work.next} />
      </section>
    </>
  );
}
