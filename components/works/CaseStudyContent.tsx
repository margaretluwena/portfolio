"use client";

import { motion } from "motion/react";
import type { Work } from "@/lib/works";
import StudyBlocks from "@/components/works/StudyBlocks";
import NdaGate from "@/components/works/NdaGate";

/*
  The case-study body, rendered in two places:
    - variant="page"    → the standalone /works/[slug] route (direct links, refresh, SEO)
    - variant="overlay" → the intercepting-route overlay on top of the home page
  Both render the SAME centered image with layoutId={`work-${slug}`}, which is what lets
  the image fly from the WorkList column to center when opened as an overlay.

  Protected works: the intro + flanks stay public; scrolling down hits the
  NdaGate, which reveals the blocks in place on the right password.
*/

export default function CaseStudyContent({ work, variant }: { work: Work; variant: "page" | "overlay" }) {
  const study = work.study;
  const isOverlay = variant === "overlay";

  const body = study?.blocks?.length ? (
    <section className="mt-[14vh]">
      {work.protected ? (
        <NdaGate slug={work.slug} title={work.title}>
          <StudyBlocks blocks={study.blocks} />
        </NdaGate>
      ) : (
        <StudyBlocks blocks={study.blocks} />
      )}
    </section>
  ) : (
    <section className="py-[12vh] text-center text-body-lg text-ink/50">Case study in progress.</section>
  );

  return (
    <>
      <section className="grid grid-cols-1 items-start gap-x-8 gap-y-10 md:grid-cols-[1fr_auto_1fr]">
        {/* LEFT flank */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
          transition={{ duration: 0.6, delay: isOverlay ? 0.4 : 0.35 }}
          className="text-body-lg text-ink/80 md:max-w-[319px] md:justify-self-end md:text-right"
        >
          <h1 className="wordmark text-corner mb-3 text-ink">{work.title}</h1>
          {study?.summary && <p className="mb-6 italic">{study.summary}</p>}
          {study?.left.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
        </motion.aside>

        {/* CENTER image — the shared element */}
        <motion.div
          layoutId={`work-${work.slug}`}
          transition={{ layout: { duration: 0.8, ease: [0.7, 0, 0.2, 1] } }}
          className="aspect-[541/744] w-[min(541px,80vw)] justify-self-center bg-placeholder"
        >
          {/* cover lands here once the new covers are ready */}
        </motion.div>

        {/* RIGHT flank */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
          transition={{ duration: 0.6, delay: isOverlay ? 0.5 : 0.45 }}
          className="text-body-lg text-ink/80 md:max-w-[319px]"
        >
          <dl className="mb-6 space-y-2">
            <Meta k="Role" v={study?.role} />
            <Meta k="Timeline" v={study?.timeline} />
            <Meta k="Team" v={study?.team} />
          </dl>
          {study?.deliverables?.length ? (
            <p className="mb-6 text-[13px] uppercase tracking-[0.06em] text-ink/50">
              {study.deliverables.join(" · ")}
            </p>
          ) : null}
          {study?.right.map((p, i) => <p key={i} className="mb-4">{p}</p>)}
        </motion.aside>
      </section>

      {body}
    </>
  );
}

function Meta({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex gap-3">
      <dt className="text-ink/40">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
