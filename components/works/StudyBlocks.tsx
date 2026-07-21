"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Block } from "@/lib/works";
import Prox from "@/components/ui/Prox";

/*
  Long-form case-study body: renders the ported content blocks in order.
  text → headed prose (measure capped), image → full width, pair → two-up,
  video → inline player, link → arrow link. Each block reveals on scroll.
*/

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function StudyBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto max-w-[1100px] space-y-[9vh] pb-[10vh]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "text":
            return (
              <Reveal key={i} className="mx-auto max-w-[62ch]">
                {b.heading && <h3 className="wordmark text-title mb-4 text-ink">{b.heading}</h3>}
                <p className="whitespace-pre-line text-body-lg leading-relaxed text-ink/80">{b.body}</p>
              </Reveal>
            );
          case "image":
            return (
              <Reveal key={i}>
                <Image
                  src={b.src}
                  alt={b.alt ?? ""}
                  width={2200}
                  height={1400}
                  sizes="(min-width: 1100px) 1100px, 100vw"
                  className="h-auto w-full"
                />
              </Reveal>
            );
          case "pair":
            return (
              <Reveal key={i} className="grid gap-6 md:grid-cols-2">
                <Image src={b.left} alt="" width={1100} height={1100} sizes="(min-width: 1100px) 550px, 100vw" className="h-auto w-full" />
                <Image src={b.right} alt="" width={1100} height={1100} sizes="(min-width: 1100px) 550px, 100vw" className="h-auto w-full" />
              </Reveal>
            );
          case "video":
            return (
              <Reveal key={i}>
                <video src={b.src} poster={b.poster} controls playsInline preload="metadata" className="w-full" />
              </Reveal>
            );
          case "link":
            return (
              <Reveal key={i} className="mx-auto max-w-[62ch]">
                <Prox baseOpacity={0.7} maxScale={1} radius={140}>
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-body-lg tracking-[0.02em] text-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    {b.label} ↗
                  </a>
                </Prox>
              </Reveal>
            );
        }
      })}
    </div>
  );
}
