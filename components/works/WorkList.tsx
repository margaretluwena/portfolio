"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { featuredWorks } from "@/lib/works";
import Prox from "@/components/ui/Prox";
import CardVideo from "@/components/works/CardVideo";

/*
  The right-hand scrolling column. Each work is a white card (Figma card
  frames, 972 × 678 - aspect 1.434, radius 10, shadow 0 23px 50px /10%
  scaled to render size): layered cover art placed per-card via coverArt
  (geometry from each card's own frame), a white fade into the text zone
  (Figma "Rectangle 814": transparent → white at 77.9%), then the wordmark
  at 77.7% / description at 84.8%, both inset 7% of card width. Clicking a
  work routes to /works/[slug]; the intercepting overlay flies the COVER
  REGION to center via the shared layoutId - the white shell stays put, so
  the morph is untouched. (Plain <Link>, NOT TransitionLink - the overlay
  morph replaces the page exit.)
*/

export default function WorkList({ reveal = true }: { reveal?: boolean }) {
  const reduce = useReducedMotion();

  return (
    <ul className="space-y-[var(--card-gap)]">
      {featuredWorks.map((work, i) => {
        /* load entrance: the visible cards rise from below in a stagger
           (Motion choreography: elements move at different times, not in
           concert), joining the left column's assembly gesture after the
           wordmark lands. No scroll-reveal ramp: below-fold cards render
           fully visible the moment they're scrolled to, so nothing the
           reader is about to interact with fades in on them. */
        const coverInner = (
          <div
            className={`absolute inset-0 ${
              work.comingSoon ? "" : "transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            }`}
          >
                  {work.coverArt ? (
                    /* art layers ride the surface directly: the overlay hero
                       lands at the card's own 972/678 shape, so the morph
                       never changes aspect and the contents need no separate
                       scale-correction (an inner `layout` child here used to
                       run its own second animation on close - that was the
                       "content animates back in by itself" bug) */
                    <div className="absolute inset-x-0 top-0 aspect-[972/678]">
                      {work.coverArt.map((layer) => (
                        <div
                          key={layer.poster ?? layer.src}
                          className="absolute"
                          style={{ left: layer.left, top: layer.top, width: layer.width, height: layer.height }}
                        >
                          {layer.video ? (
                            <CardVideo layer={layer} />
                          ) : (
                            <Image src={layer.src} alt="" fill sizes="45vw" className="object-contain" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : work.cover && work.cover.src !== "NEED" ? (
                    <Image src={work.cover.src} alt={work.cover.alt} fill sizes="45vw" className="object-cover" />
                  ) : (
                    <div
                      className={`absolute inset-0 grid place-items-center bg-placeholder/50 text-secondary text-ink/30 ${
                        work.comingSoon ? "transition-opacity duration-300 group-hover:opacity-0" : ""
                      }`}
                    >
                      {work.title}
                    </div>
                  )}
                  {/* fade into the text zone - per-card color (Figma card frames):
                      white cards melt to white, Traeco's dark frame to #242428 */}
                  <div
                    className="absolute inset-0"
                    style={{ background: work.cardFade ?? "linear-gradient(to bottom, transparent, #fff 77.9%)" }}
                  />
          </div>
        );

        const card = (
            <motion.article
              aria-disabled={work.comingSoon || undefined}
              className="relative aspect-[972/678] w-full overflow-hidden rounded-[10px] shadow-[0_15px_33px_rgba(0,0,0,0.1)]"
              style={{ background: work.cardBg ?? "#fff" }}
              initial={{ opacity: 0, y: 56 }}
              animate={reveal ? { opacity: 1, y: 0 } : undefined}
              transition={{
                opacity: { duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.6 + i * 0.09 },
                y: { duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.6 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              {/* cover - the shared element that flies to center. comingSoon
                  cards get a plain div: no layoutId, so there is no dangling
                  shared-layout target for a card that cannot open */}
              {work.comingSoon ? (
                <div className="absolute inset-0 overflow-hidden">{coverInner}</div>
              ) : (
                <motion.div layoutId={`work-${work.slug}`} className="absolute inset-0 overflow-hidden">
                  {coverInner}
                </motion.div>
              )}

              {/* wordmark + description - % of the card box so they hold at any width.
                  Real SVG lockups scale by width (natural aspect preserved) and
                  bottom-align 12px above the description's top edge (84.8%) -
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
              <p
                className={`absolute left-[7%] top-[84.8%] w-[46.2%] line-clamp-2 text-secondary ${
                  work.cardText === "light" ? "text-white/50" : "text-ink-50"
                }`}
              >
                {work.blurb ?? work.lede}
              </p>

              {/* "Coming soon": real DOM text (screen readers announce it, and
                  aria-disabled marks the card). Desktop reveals on hover
                  (opacity only); below md it is persistently visible, since
                  touch has no hover and the card would otherwise be a dead
                  surface with no explanation. */}
              {work.comingSoon && (
                <span
                  className={`absolute inset-0 grid place-items-center text-label uppercase ${
                    work.cardText === "light" ? "text-white/80" : "text-ink/50"
                  } opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100`}
                >
                  Coming soon
                </span>
              )}
            </motion.article>
        );
        return (
          <li key={work.slug} data-work={work.slug}>
            {work.comingSoon ? (
              /* no case study yet (for now): same card, not a link */
              <div className="group block">{card}</div>
            ) : (
              <Link
                href={`/works/${work.slug}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {card}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
