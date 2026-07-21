"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { featuredWorks } from "@/lib/works";

/*
  The right-hand scrolling column. Each work is a large image (placeholder gray
  for now) with a caption. Clicking a work routes to /works/[slug], where the
  case-study "image flies to center" transition happens (see WorkView spec in BRIEF.md).

  Use motion's `layoutId={`work-${slug}`}` on the image here AND on the hero image
  in the case-study page so Framer animates the shared element between routes.
*/

export default function WorkList() {
  return (
    <ul className="space-y-[12vh]">
      {featuredWorks.map((work, i) => (
        <li key={work.slug}>
          <Link href={`/works/${work.slug}`} className="group block">
            <motion.div
              layoutId={`work-${work.slug}`}
              className="relative aspect-[3/4] w-full max-w-[541px] overflow-hidden bg-placeholder"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* <Image src={work.cover} ... /> once assets exist */}
              <div className="absolute inset-0 grid place-items-center text-ink/30 text-body-lg">
                {work.title}
              </div>
            </motion.div>

            <div className="mt-3 flex items-baseline justify-between text-body-lg">
              <span className="wordmark">{work.title}</span>
              <span className="text-ink/50">
                {work.category} · {work.year}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
