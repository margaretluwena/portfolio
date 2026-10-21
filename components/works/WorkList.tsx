"use client";

import Link from "next/link";
import { TransitionLink } from "@/components/providers/PageTransition";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { featuredWorks, type Work } from "@/lib/works";
import Prox from "@/components/ui/Prox";
import CardVideo from "@/components/works/CardVideo";

/*
  The right-hand scrolling column. Each work is a card (Figma card frames,
  972 × 678 - aspect 1.434, radius 10; chrome per the 2026-10-08 "Mark
  card" 255:586: 1px ink/9 edge, shadow 0 10px 50px /5% - the edge is
  invisible on the dark cards and that is fine): layered cover art placed
  per-card via coverArt (geometry from each card's own frame), a fade into
  the text zone (Figma "Rectangle 814": transparent → surface at 77.9%),
  then one text zone measured UP from the card's bottom edge: description
  baseline-block sitting 5.9% above it (40/678), the wordmark 6px above
  that (tightened from 12, 2026-10-08), both inset 4.6% of card width (42-47/972 across the right column
  of Frame 1739326214 - normalized). Bottom-anchored on purpose: the type
  is fixed px while the card scales, so a top-% placement crowded the
  edge on smaller cards (2026-10-08). Clicking a
  work routes to /works/[slug]; the intercepting overlay flies the COVER
  REGION to center via the shared layoutId - the white shell stays put, so
  the morph is untouched. (Plain <Link>, NOT TransitionLink - the overlay
  morph replaces the page exit.)

  The card itself is <WorkCard/>, shared with the works index grid
  (app/works/page.tsx, Figma 195:728) - one card, two layouts. Its art
  region is <CoverArt/>, which the case-study hero reuses so a work looks
  the same on the card and at the top of its study (2026-10-08) - the
  per-work `cover` posters were stand-ins stretched far past their pixels.
*/

/* the layered art (or cover image, or title tile) plus the fade into the
   text zone; fills a positioned parent of the card's 972/678 shape */
export function CoverArt({ work, hover = true, sizes = "45vw", priority = false }: { work: Work; hover?: boolean; sizes?: string; priority?: boolean }) {
  return (
          <div
            className={`absolute inset-0 ${
              hover ? "transition-transform duration-700 ease-out group-hover:scale-[1.025]" : ""
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
                          className={`absolute ${layer.crop ? "overflow-hidden" : ""}`}
                          style={{
                            left: layer.left,
                            top: layer.top,
                            width: layer.width,
                            height: layer.height,
                            /* rotated Figma layers: the box is the unrotated one,
                               turned about its center like the canvas does */
                            transform: layer.rotate ? `rotate(${layer.rotate}deg)` : undefined,
                          }}
                        >
                          {layer.video ? (
                            <CardVideo layer={layer} />
                          ) : layer.crop ? (
                            /* Figma crop fill: the whole image drawn at the crop box, clipped by the layer */
                            <div className="absolute" style={layer.crop}>
                              <Image src={layer.src} alt="" fill sizes={sizes} className="object-fill" priority={priority} />
                            </div>
                          ) : (
                            <Image src={layer.src} alt="" fill sizes={sizes} className="object-contain" priority={priority} />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : work.cover && work.cover.src !== "NEED" ? (
                    <Image src={work.cover.src} alt={work.cover.alt} fill sizes={sizes} className="object-cover" priority={priority} />
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
}

export function WorkCard({ work, index = 0, reveal = true }: { work: Work; index?: number; reveal?: boolean }) {
  const reduce = useReducedMotion();
  const i = index;
  /* unreachable studies (no case study yet, or parked) render the same
     card as a plain surface: no link, no shared-layout target */
  const inert = !!work.comingSoon;
  {
        /* load entrance: the visible cards rise from below in a stagger
           (Motion choreography: elements move at different times, not in
           concert), joining the left column's assembly gesture after the
           wordmark lands. No scroll-reveal ramp: below-fold cards render
           fully visible the moment they're scrolled to, so nothing the
           reader is about to interact with fades in on them. */
        /* the first card is the largest thing above the fold: its art loads eagerly */
        const coverInner = <CoverArt work={work} hover={!work.comingSoon} priority={i === 0} />;

        const card = (
            <motion.article
              aria-disabled={work.comingSoon || undefined}
              className="relative aspect-[972/678] w-full overflow-hidden rounded-[10px] border border-black/[0.09] shadow-[0_10px_50px_rgba(0,0,0,0.05)]"
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
              {inert ? (
                <div className="absolute inset-0 overflow-hidden">{coverInner}</div>
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  {coverInner}
                </div>
              )}

              {/* text zone (Margaret, 2026-10-20): at rest only the lockup row
                  shows (lockup left, signal pill right) sitting 5.9% above the
                  bottom edge; on hover the row rises and the one-line
                  description slides in under it. Below md there is no hover,
                  so the description is always out. */}
              <div
                className="absolute inset-x-0 bottom-[5.9%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-y-[28px] md:group-hover:translate-y-0"
              >
                <div className="flex items-end justify-between gap-4 px-[4.6%]">
                  {/* every card titles itself in text now - the SVG lockups made
                      the set read as four brands and three names (Shub, Margaret
                      2026-10-20). The lockups still head the case studies. */}
                  <Prox baseOpacity={0.9} maxScale={1} radius={120}>
                    <span className={`font-display text-name ${work.cardText === "light" ? "text-white" : "text-ink"}`}>{work.title}</span>
                  </Prox>
                  {/* the signal pill: one fact about the team or the scale (Shub's feedback, 2026-10-09) */}
                  {work.signal && (
                    <span
                      className={`max-w-[46%] shrink-0 truncate rounded-full border px-[10px] py-[5px] text-label uppercase tracking-[0.06em] backdrop-blur-sm ${
                        work.cardText === "light" ? "border-white/15 bg-white/10 text-white/70" : "border-black/[0.08] bg-white/70 text-ink/60"
                      }`}
                    >
                      {work.signal}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-[6px] h-[22px] w-[82%] truncate pl-[4.6%] text-secondary transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${
                    work.cardText === "light" ? "text-white/50" : "text-ink-50"
                  }`}
                >
                  {work.blurb ?? (work.lede === "NEED" ? "" : work.lede)}
                </p>
              </div>

              {/* "Coming soon": on pointer devices the cursor bubble says it, so
                  the card itself stays clean (Margaret, 2026-10-09). Below md it
                  is still printed on the card, since touch has no hover and no
                  bubble, and the card would otherwise be a dead surface with no
                  explanation. Screen readers get it either way, and
                  aria-disabled marks the card. */}
              {work.comingSoon && (
                <span
                  className={`absolute inset-0 grid place-items-center text-label uppercase ${
                    work.cardText === "light" ? "text-white/80" : "text-ink/50"
                  } md:sr-only`}
                >
                  Coming soon
                </span>
              )}
            </motion.article>
        );
        return inert ? (
          /* the cursor bubble names the dead surface (Margaret, 2026-10-09) */
          <div className="group block" data-bubble="Coming soon!">{card}</div>
        ) : (
          /* a plain route change: the page fades out and the study enters on its
             own (the fly-to-centre morph is gone - Margaret, 2026-10-20) */
          <TransitionLink
            href={`/works/${work.slug}`}
            className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {card}
          </TransitionLink>
        );
  }
}

export default function WorkList({ reveal = true }: { reveal?: boolean }) {
  return (
    <ul className="space-y-[var(--card-gap)]">
      {featuredWorks.map((work, i) => (
        <li key={work.slug} data-work={work.slug}>
          <WorkCard work={work} index={i} reveal={reveal} />
        </li>
      ))}
    </ul>
  );
}
