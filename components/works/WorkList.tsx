"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { featuredWorks } from "@/lib/works";
import Prox from "@/components/ui/Prox";

/*
  The right-hand scrolling column. Each work is a large image (placeholder gray
  for now) with a caption. Clicking a work routes to /works/[slug]; the
  intercepting overlay flies the image to center via the shared layoutId.
  (Plain <Link>, NOT TransitionLink — the overlay morph replaces the page exit.)

  Caption hierarchy: title carries the weight (15px, ink), meta recedes
  (13px, ink/40); the caption hugs the image (mt-2) so the pair reads as one
  object, with the big gap belonging between works.
*/

export default function WorkList() {
  return (
    <ul className="space-y-[12vh]">
      {featuredWorks.map((work, i) => (
        <li key={work.slug} data-work={work.slug}>
          <Link href={`/works/${work.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            <motion.div
              layoutId={`work-${work.slug}`}
              className="relative aspect-[3/4] w-full max-w-[541px] overflow-hidden bg-placeholder"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* inner wrapper carries the hover zoom so it never fights the
                  morph transform on the parent */}
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025]">
                {/* <Image src={work.cover} fill ... /> once assets exist */}
                <div className="absolute inset-0 grid place-items-center text-ink/30 text-body-lg">
                  {work.title}
                </div>
              </div>
            </motion.div>

            <div className="mt-2 flex max-w-[541px] items-baseline justify-between">
              <Prox baseOpacity={0.85} maxScale={1.03} radius={120}>
                <span className="wordmark text-[15px] text-ink">{work.title}</span>
              </Prox>
              <Prox baseOpacity={0.4} maxScale={1.03} radius={120}>
                <span className="text-[13px] tracking-[0.02em] text-ink">
                  {work.category} · {work.year}
                </span>
              </Prox>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
