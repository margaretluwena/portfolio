"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import PortfolioShell from "@/components/shell/PortfolioShell";
import DitherWordmark, { type DitherMode } from "@/components/shell/DitherWordmark";
import { useNav } from "@/components/nav/NavContext";
import { featuredWorks } from "@/lib/works";

/*
  THE OPENING.
  1. "MARGARET LUWENA" centered over the full-page sky (Figma frame 96:4;
     the sky itself is SkyFieldBackground in the root layout, always behind).
  2. After a beat the wordmark TRAVELS to its corner slot in the left panel -
     one element, animated via Framer's shared layout (layoutId="wordmark"),
     so no manual measuring.
  3. The rest of the main page reveals (staggered, inside PortfolioShell).

  The intro plays once per page load - returning to "/" from another page
  within the app goes straight to the main page (a module-level flag, read
  pre-paint). A reload plays it again; it used to be a sessionStorage gate,
  which meant a tab saw it exactly once and every reload after that skipped
  it (Margaret, 2026-11-03: "I don't see the intro at all").

  The old hero texture (InteractiveTexture, which collapsed to a 33vh band
  in step with the flight) is retired by the sky (2026-10-08); the component
  stays parked in components/hero. Skip: click anywhere or press any key.

  The dither (2026-11-03): the name first assembles out of the sky's own
  glyphs, rising cell by cell into place, then the real text crossfades in
  and holds; on the flight to the corner the cells follow the moving
  wordmark, shedding and regathering, and settle into the real text on
  landing (DitherWordmark). Reduced motion skips all of it, as before.
*/

const HOLD_MS = 2500; // the assembly takes ~1.1s, the name then holds ~1.2s
const SKY_FONT_FALLBACK = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const GESTURE = { duration: 1.1, ease: [0.7, 0, 0.2, 1] as const };
let introSeen = false; // this page load has played the intro

export default function Page() {
  const reduce = useReducedMotion();
  const { setNav } = useNav();
  const [phase, setPhase] = useState<"intro" | "main">("intro");
  const [worksIndex, setWorksIndex] = useState(0);
  /* the dither's phase, and whether the real text is showing in each spot */
  const [dither, setDither] = useState<DitherMode>("off");
  const [introVisible, setIntroVisible] = useState(false);
  const [cornerHidden, setCornerHidden] = useState(false);
  const [skyFont, setSkyFont] = useState(SKY_FONT_FALLBACK);
  const introRef = useRef<HTMLHeadingElement>(null);
  const cornerRef = useRef<HTMLParagraphElement>(null);
  const skipped = useRef(false);

  // returning within the session? skip the intro before first paint.
  // Storage access is guarded: a browser that blocks it (private browsing,
  // a locked-down profile) used to throw here and take the whole page down
  // with it - nothing interactive, the ball dead (found 2026-10-21)
  useLayoutEffect(() => {
    if (reduce || introSeen) { setPhase("main"); setIntroVisible(true); skipped.current = true; }
    else { setDither("assemble"); setCornerHidden(true); }
    try { const f = getComputedStyle(document.body).getPropertyValue("--font-sky").trim(); if (f) setSkyFont(`${f}, ${SKY_FONT_FALLBACK}`); } catch {}
  }, [reduce]);

  useEffect(() => {
    if (phase === "main") {
      introSeen = true;
      // the flight: the cells follow the corner wordmark until it lands
      if (!skipped.current) { setIntroVisible(true); setDither("flight"); setCornerHidden(true); }
      return;
    }
    const t = setTimeout(() => setPhase("main"), HOLD_MS);
    const skip = () => setPhase("main");
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
    };
  }, [phase]);

  const isMain = phase === "main";

  // assembled: the real text fades in over the cells, which then clear
  const onAssembled = () => { setIntroVisible(true); setTimeout(() => setDither((m) => (m === "assemble" ? "off" : m)), 260); };
  // landed: the cells fade out as the real corner text fades in under them
  const onLanded = () => { if (!skipped.current) { setDither((m) => (m === "flight" ? "resolve" : m)); setCornerHidden(false); } };
  const onResolved = () => setDither("off");

  // the nav pill lives in the root layout: hide it through the intro, then
  // hand it the live works index; release both when this page unmounts
  useEffect(() => {
    setNav({
      home: true,
      hidden: !isMain,
      /* dot indicators in place of "4/4 - SELECTED WORKS" (Shub's feedback,
         2026-10-13): one dot per featured work, the current one filled */
      counter: (
        <span className="flex items-center gap-[7px] py-[6px]" role="img" aria-label={`Work ${worksIndex + 1} of ${featuredWorks.length}`}>
          {featuredWorks.map((w, k) => (
            <span
              key={w.slug}
              className={`block h-[6px] w-[6px] rounded-full transition-colors duration-300 ${k === worksIndex ? "bg-ink" : "bg-ink/25"}`}
            />
          ))}
        </span>
      ),
    });
  }, [isMain, worksIndex, setNav]);
  useEffect(() => () => setNav({ home: false, hidden: false, counter: null }), [setNav]);

  return (
    <main
      className="relative min-h-screen"
      onClick={() => !isMain && setPhase("main")} /* click to skip */
    >
      {/* intro-position wordmark: present only during intro; layoutId hands it to the corner */}
      {!isMain && (
        <div className="fixed inset-0 z-20 grid place-items-center">
          <motion.h1
            ref={introRef}
            layoutId="wordmark"
            className="wordmark text-hero text-ink whitespace-nowrap px-6 text-center"
            transition={{ layout: reduce ? { duration: 0 } : GESTURE }}
          >
            {/* the text itself is hidden on an inner span: Motion animates the
                element's own opacity through a shared-layout swap, so a style
                there would be overridden and the text ghosted under the dither */}
            <span style={{ opacity: introVisible ? 1 : 0, transition: "opacity 260ms ease" }}>MARGARET LUWENA</span>
          </motion.h1>
        </div>
      )}

      {/* the name in the sky's glyphs: assembling, in flight, settling */}
      <DitherWordmark mode={dither} target={isMain ? cornerRef : introRef} text="MARGARET LUWENA" font={skyFont} onAssembled={onAssembled} onResolved={onResolved} />

      {/* main page underneath; renders the corner wordmark when revealed */}
      <PortfolioShell reveal={isMain} reduce={!!reduce} onWorksIndex={setWorksIndex} wordmarkRef={cornerRef} wordmarkHidden={cornerHidden} onWordmarkLanded={onLanded} />

      {/* no footer on the home page: the works column just ends at Prosaic
          Intelligence (Margaret, 2026-10-09; the fourth card since 2026-11-02). SiteFooter's reveal mode is kept for
          the day it comes back: `{isMain && <SiteFooter mode="reveal" />}` */}
    </main>
  );
}
