"use client";

import Link from "next/link";
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
export function CoverArt({ work, hover = true, sizes = "45vw" }: { work: Work; hover?: boolean; sizes?: string }) {
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
                              <Image src={layer.src} alt="" fill sizes={sizes} className="object-fill" />
                            </div>
                          ) : (
                            <Image src={layer.src} alt="" fill sizes={sizes} className="object-contain" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : work.cover && work.cover.src !== "NEED" ? (
                    <Image src={work.cover.src} alt={work.cover.alt} fill sizes={sizes} className="object-cover" />
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
  const inert = !!(work.comingSoon || work.indexOnly);
  {
        /* load entrance: the visible cards rise from below in a stagger
           (Motion choreography: elements move at different times, not in
           concert), joining the left column's assembly gesture after the
           wordmark lands. No scroll-reveal ramp: below-fold cards render
           fully visible the moment they're scrolled to, so nothing the
           reader is about to interact with fades in on them. */
        const coverInner = <CoverArt work={work} hover={!work.comingSoon} />;

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
                <motion.div layoutId={`work-${work.slug}`} className="absolute inset-0 overflow-hidden">
                  {coverInner}
                </motion.div>
              )}

              {/* wordmark + description. Real SVG lockups scale by width
                  (natural aspect preserved) and sit 6px above the one-line
                  description (text-secondary: 15px x 1.45 = 22px tall), which
                  sits 5.9% above the bottom edge. Cards without art keep the
                  Nohemi text treatment. */}
              {work.wordmark ? (
                <div
                  className="absolute left-[4.6%]"
                  style={{ bottom: "calc(5.9% + 22px + 6px)", width: work.wordmarkWidth ?? "16%" }}
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
                <div className="absolute left-[4.6%]" style={{ bottom: "calc(5.9% + 22px + 6px)" }}>
                  <Prox baseOpacity={0.9} maxScale={1} radius={120}>
                    <span className="font-display text-name text-ink">{work.title}</span>
                  </Prox>
                </div>
              )}
              <p
                className={`absolute bottom-[5.9%] left-[4.6%] w-[82%] truncate text-secondary ${
                  work.cardText === "light" ? "text-white/50" : "text-ink-50"
                }`}
              >
                {work.blurb ?? (work.lede === "NEED" ? "" : work.lede)}
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
        return inert ? (
          <div className="group block">{card}</div>
        ) : (
          <Link
            href={`/works/${work.slug}`}
            className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {card}
          </Link>
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
