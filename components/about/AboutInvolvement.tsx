"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
  OTHER THINGS I'M INVOLVED WITH :) (Figma "About" 221:520, 270:734-272:798;
  2026-10-08). A column of stickers on the left - TroyLabs, Verci LA,
  LavaLab - and, to the right, a fan of five tilted photos with a caption
  under each, spread across the rest of the content width.

  Selection: ONE sticker and ONE photo are at full strength at a time;
  everything else steps back - WASHED OUT with a filter, not made
  transparent, so the sky never shows through a dimmed sticker and
  overlapping photos never show through each other (Margaret, 2026-10-08). Clicking a sticker swaps in that
  involvement's five photos; clicking a photo brings it to the front and
  lights up its caption. The second photo leads by default, as on the
  frame.

  Photos are per-involvement lists in INVOLVEMENTS ({ src, caption }).
  While a slot has no src it renders the frame's grey placeholder with its
  caption, so the section reads finished and the photos are a data edit
  away.
*/

type Photo = { src?: string; caption: string };
type Involvement = {
  id: string;
  name: string;
  sticker: string;
  w: number;
  photos: Photo[];
  style: React.CSSProperties;
  round?: true;
};

const DEMO: Photo[] = Array.from({ length: 5 }, () => ({ caption: "Demo!" }));

/* TroyLabs photos (Margaret, 2026-10-08), in fan order left to right */
const TROYLABS: Photo[] = [
  { src: "/images/about/troylabs/designers.jpg", caption: "TL designers <3" },
  { src: "/images/about/troylabs/retreat.jpg", caption: "My favorite retreat" },
  { src: "/images/about/troylabs/launch-f25.jpg", caption: "LAUNCH F'25" },
  { src: "/images/about/troylabs/spiegel-keynote.jpg", caption: "Evan Spiegel keynote" },
  { src: "/images/about/troylabs/agt.jpg", caption: "We went to AGT!" },
];

/* LavaLab photos (Margaret, 2026-10-08), in fan order left to right */
const LAVALAB: Photo[] = [
  { src: "/images/about/lavalab/audience-choice.jpg", caption: "We won Audience Choice!" },
  { src: "/images/about/lavalab/retreat-s26.jpg", caption: "Lava retreat S'26" },
  { src: "/images/about/lavalab/claude-meetup.jpg", caption: "Pitching Traeco @ Claude Meetup" },
  { src: "/images/about/lavalab/demo-day.jpg", caption: "Our booth @ Demo Day" },
  { src: "/images/about/lavalab/class.jpg", caption: "Leaving our mark in a class :)" },
];

/* Verci LA photos (Margaret, 2026-10-08): three, spread across the fan */
const VERCI: Photo[] = [
  { src: "/images/about/verci/founding-haul.jpg", caption: "Founding member haul :)" },
  { src: "/images/about/verci/dinner.jpg", caption: "Sick dinner setup" },
  { src: "/images/about/verci/board.jpg", caption: "Find me on the board!" },
];

const INVOLVEMENTS: Involvement[] = [
  /* sticker positions as % of the cluster box (Figma: TL 268,2368 97x135;
     Verci 265,2567 118x118; Lavalab 234,2760 131x86 - origin 234,2368,
     box 150x478) */
  { id: "troylabs", name: "TroyLabs", sticker: "/assets/stickers/troylabs-big.svg", w: 97, photos: TROYLABS, style: { left: "22%", top: "0%", width: "65%" } },
  { id: "verci", name: "Verci LA", sticker: "/assets/stickers/verci.png", w: 118, photos: VERCI, style: { left: "20%", top: "42%", width: "79%" }, round: true },
  { id: "lavalab", name: "LavaLab", sticker: "/assets/stickers/lavalab.svg", w: 131, photos: LAVALAB, style: { left: "0%", top: "82%", width: "87%" } },
];

/* the fan, as % of the photo region (Figma: 554→1924 wide, 2367→2860 tall
   with captions): left, top, width, tilt, and the resting stacking order
   (2 over 1 and 3; 4 over 3 and 5) */
const SLOTS = [
  { left: "0%", top: "0%", w: "29.1%", rot: -3, z: 1 },
  { left: "18.8%", top: "15%", w: "27.4%", rot: 0, z: 3 },
  { left: "38.4%", top: "3.6%", w: "28.5%", rot: 2, z: 2 },
  { left: "61.7%", top: "13.3%", w: "28.7%", rot: -3, z: 3 },
  { left: "70.9%", top: "4.6%", w: "29.1%", rot: 3, z: 2 },
];
/* a set with fewer than five photos spreads across the fan (3 -> slots 1, 3, 5)
   rather than piling up on the left with empty frames after it */
const spread = (n: number) =>
  n >= SLOTS.length ? SLOTS : Array.from({ length: n }, (_, i) => SLOTS[Math.round((i * (SLOTS.length - 1)) / Math.max(n - 1, 1))]);
const lead = (n: number) => Math.min(1, Math.max(n - 1, 0)); // the photo in front when a set first shows
/* stepped-back photos and stickers keep most of their colour - the earlier
   saturate(0.4) / (0.72) read as too washed out (Margaret, 2026-10-08) */
const DIM = "brightness(1.1) saturate(0.7) contrast(0.9)";           // photos stepped back, still opaque
const DIM_STICKER = "brightness(1.03) saturate(0.9) contrast(0.98)";  // stickers only a touch softer
const FULL = "brightness(1) saturate(1) contrast(1)";

export default function AboutInvolvement() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(INVOLVEMENTS[0].id);
  const [front, setFront] = useState(lead(INVOLVEMENTS[0].photos.length));
  const current = INVOLVEMENTS.find((i) => i.id === active) ?? INVOLVEMENTS[0];
  const spring = { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <section className="px-[var(--inset)] md:pr-[calc(100vw-var(--align-r))]">
      <h2 className="study-title text-ink">Other things I&apos;m involved with :)</h2>

      {/* minmax(0,1fr) + self-start: the photo frame sizes from its width; if the row's
          height (the stickers column) reached it, aspect-ratio would blow its width out */}
      <div className="mt-[5vh] grid gap-12 md:grid-cols-[140px_minmax(0,1fr)] md:gap-[4vw]">
        {/* stickers */}
        <div role="tablist" aria-label="Involvements" className="relative aspect-[150/478] w-full max-w-[140px]">
          {INVOLVEMENTS.map((i) => {
            const on = i.id === active;
            return (
              <motion.button
                key={i.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={i.name}
                onClick={() => {
                  setActive(i.id);
                  setFront(lead(i.photos.length));
                }}
                className="absolute block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                style={i.style}
                animate={{ filter: on ? FULL : DIM_STICKER, scale: on ? 1 : 0.94, rotate: on ? 0 : -3 }}
                whileHover={reduce ? undefined : { scale: on ? 1.03 : 0.98, filter: FULL }}
                whileTap={reduce ? undefined : { scale: 0.96 }}
                transition={spring}
              >
                <Image
                  src={i.sticker}
                  alt=""
                  width={i.w}
                  height={i.w}
                  className={`block h-auto w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.12)] ${
                    i.round ? "rounded-full border-[4px] border-white" : ""
                  }`}
                />
              </motion.button>
            );
          })}
        </div>

        {/* the fan of photos */}
        {/* centred on the Verci sticker (the cluster's middle, ~54% down it) */}
        <div className="relative aspect-[1370/500] w-full self-center md:translate-y-[5%]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              role="tabpanel"
              aria-label={`${current.name} photos`}
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {spread(current.photos.length).map((s, k) => {
                const photo = current.photos[k];
                const on = k === front;
                return (
                  <motion.button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    aria-label={photo.caption ? `${photo.caption} - ${current.name} photo ${k + 1}` : `${current.name} photo ${k + 1}`}
                    onClick={() => setFront(k)}
                    className="absolute block text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    style={{ left: s.left, top: s.top, width: s.w, zIndex: on ? 10 : s.z, rotate: `${s.rot}deg` }}
                    animate={{ filter: on ? FULL : DIM, scale: on ? 1 : 0.985 }}
                    whileHover={reduce ? undefined : { filter: FULL }}
                    transition={spring}
                  >
                    {/* polaroid: a white frame, thicker along the bottom, with the caption
                        written in that band (Margaret, 2026-10-08) */}
                    <div className="w-full rounded-[3px] bg-white px-[5%] pb-[5%] pt-[5%] shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                      <div className="relative aspect-[400/424] w-full overflow-hidden bg-[#d9d9d9]">
                        {photo.src && (
                          <Image src={photo.src} alt="" fill sizes="(max-width: 768px) 40vw, 18vw" className="object-cover" />
                        )}
                      </div>
                      {photo.caption && (
                        <p className={`pt-[6%] pb-[2%] text-center text-body transition-colors duration-300 ${on ? "text-ink" : "text-ink/45"}`}>
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
