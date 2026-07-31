"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { featuredWorks } from "@/lib/works";
import Prox from "@/components/ui/Prox";

/*
  The right-hand scrolling column. Each work is a white card (Figma card
  frames, 972 × 678 — aspect 1.434, radius 10, shadow 0 23px 50px /10%
  scaled to render size): layered cover art placed per-card via coverArt
  (geometry from each card's own frame), a white fade into the text zone
  (Figma "Rectangle 814": transparent → white at 77.9%), then the wordmark
  at 77.7% / description at 84.8%, both inset 7% of card width. Clicking a
  work routes to /works/[slug]; the intercepting overlay flies the COVER
  REGION to center via the shared layoutId — the white shell stays put, so
  the morph is untouched. (Plain <Link>, NOT TransitionLink — the overlay
  morph replaces the page exit.)
*/

export default function WorkList() {
  return (
    <ul className="space-y-[var(--card-gap)]">
      {featuredWorks.map((work) => (
        <li key={work.slug} data-work={work.slug}>
          <Link href={`/works/${work.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            <motion.article
              data-cursor="view"
              className="relative aspect-[972/678] w-full cursor-none overflow-hidden rounded-[10px] shadow-[0_15px_33px_rgba(0,0,0,0.1)]"
              style={{ background: work.cardBg ?? "#fff" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* cover — the shared element that flies to center. data-cursor
                  sits on the ARTICLE so the VIEW disc stays on over the
                  wordmark and description too, not just the art */}
              <motion.div
                layoutId={`work-${work.slug}`}
                className="absolute inset-0 overflow-hidden"
              >
                {/* inner wrapper carries the hover zoom so it never fights the
                    morph transform on the parent */}
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025]">
                  {work.coverArt ? (
                    /* aspect-locked inner container: the morph animates the
                       SURFACE (card 1.434 -> hero 0.727); without this the art
                       layers stretch with it. The `layout` child keeps its own
                       972/678 box (motion scale-corrects it per frame), so the
                       art holds its proportions while the parent resizes around
                       it — the surface morphs, the contents don't. Transition
                       matches the overlay hero so both move as one. */
                    <motion.div
                      layout
                      transition={{ layout: { duration: 0.8, ease: [0.7, 0, 0.2, 1] } }}
                      className="absolute inset-x-0 top-0 aspect-[972/678]"
                    >
                      {work.coverArt.map((layer) => (
                        <div
                          key={layer.src}
                          className="absolute"
                          style={{ left: layer.left, top: layer.top, width: layer.width, height: layer.height }}
                        >
                          <Image src={layer.src} alt="" fill sizes="45vw" className="object-contain" />
                        </div>
                      ))}
                    </motion.div>
                  ) : work.cover ? (
                    <Image src={work.cover} alt="" fill sizes="45vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-placeholder/50 text-secondary text-ink/30">
                      {work.title}
                    </div>
                  )}
                  {/* fade into the text zone — per-card color (Figma card frames):
                      white cards melt to white, Traeco's dark frame to #242428 */}
                  <div
                    className="absolute inset-0"
                    style={{ background: work.cardFade ?? "linear-gradient(to bottom, transparent, #fff 77.9%)" }}
                  />
                </div>
              </motion.div>

              {/* wordmark + description — % of the card box so they hold at any width.
                  Real SVG lockups scale by width (natural aspect preserved) and
                  bottom-align 12px above the description's top edge (84.8%) —
                  normalized; the Figma frames drift 21px vs 9px, not intent.
                  Cards without art keep the Nohemi text treatment. */}
              {work.wordmark ? (
                <div
                  className="absolute left-[7%]"
                  style={{ bottom: "calc(15.2% + 12px)", width: work.wordmarkWidth ?? "16%" }}
                >
                  <Prox baseOpacity={0.9} maxScale={1} radius={120}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- local static SVG, no optimization pass needed */}
                    <img
                      src={work.wordmark}
                      alt={work.title}
                      className="block h-auto w-full"
                      style={work.wordmarkGlow ? { filter: work.wordmarkGlow } : undefined}
                    />
                  </Prox>
                </div>
              ) : (
                <div className="absolute left-[7%] top-[77.7%]">
                  <Prox baseOpacity={0.9} maxScale={1} radius={120}>
                    <span className="font-display text-name text-ink">{work.title}</span>
                  </Prox>
                </div>
              )}
              {work.study?.summary && (
                <p
                  className={`absolute left-[7%] top-[84.8%] w-[46.2%] line-clamp-2 text-secondary ${
                    work.cardText === "light" ? "text-white/50" : "text-ink-50"
                  }`}
                >
                  {work.study.summary}
                </p>
              )}
            </motion.article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
