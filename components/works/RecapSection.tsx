"use client";

import { motion } from "motion/react";
import type { StudySection } from "@/lib/works";

/*
  One block of the "compiled" recap that stacks at the bottom of a case study.
  Alternates image side by index so the stack has rhythm. Reveals on scroll.
*/
export default function RecapSection({ section, index }: { section: StudySection; index: number }) {
  const flip = index % 2 === 1;
  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`grid items-center gap-8 md:grid-cols-2 ${flip ? "md:[direction:rtl]" : ""}`}
    >
      <div className="[direction:ltr]">
        <p className="text-body-lg text-ink/40">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="wordmark text-title mt-1 text-ink">{section.title}</h3>
        <p className="mt-4 max-w-[46ch] text-body-lg text-ink/80">{section.body}</p>
      </div>
      <div className="aspect-[4/3] w-full bg-placeholder [direction:ltr]">
        {/* {section.media && <Image src={section.media} ... />} */}
      </div>
    </motion.article>
  );
}
