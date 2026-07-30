"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { featuredWorks } from "@/lib/works";
import Prox from "@/components/ui/Prox";

/*
  The right-hand scrolling column. Each work is a white card (radius 14, 3:2):
  cover image in the upper two-thirds, then the wordmark and a two-line
  description, both inset 55px from the card's left edge. Clicking a work
  routes to /works/[slug]; the intercepting overlay flies the COVER REGION to
  center via the shared layoutId — the white shell stays put, so the morph is
  untouched. (Plain <Link>, NOT TransitionLink — the overlay morph replaces
  the page exit.)

  Covers are wired through work.cover (assets still to come — gray placeholder
  until then); the description is the study summary, clamped to two lines.
*/

export default function WorkList() {
  return (
    <ul className="space-y-[var(--card-gap)]">
      {featuredWorks.map((work) => (
        <li key={work.slug} data-work={work.slug}>
          <Link href={`/works/${work.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            <motion.article
              className="flex aspect-[3/2] w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_2px_24px_rgba(0,0,0,0.05)]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* cover — upper two-thirds; the shared element that flies to center */}
              <motion.div
                layoutId={`work-${work.slug}`}
                data-cursor="view"
                className="relative h-2/3 w-full cursor-none overflow-hidden"
              >
                {/* inner wrapper carries the hover zoom so it never fights the
                    morph transform on the parent */}
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025]">
                  {work.cover ? (
                    <Image src={work.cover} alt="" fill sizes="47vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-placeholder/50 text-secondary text-ink/30">
                      {work.title}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* wordmark + two-line description, inset 55px, 40px below */}
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 px-6 pb-6 md:px-[55px] md:pb-[40px]">
                <Prox baseOpacity={0.9} maxScale={1} radius={120}>
                  <span className="font-display text-name text-ink">{work.title}</span>
                </Prox>
                {work.study?.summary && (
                  <p className="line-clamp-2 max-w-[46ch] text-secondary text-ink-50">{work.study.summary}</p>
                )}
              </div>
            </motion.article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
