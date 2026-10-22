"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import PortfolioShell from "@/components/shell/PortfolioShell";
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

  The intro plays once per session - returning to "/" via ABOUT goes straight
  to the main page (sessionStorage gate, applied pre-paint).

  The old hero texture (InteractiveTexture, which collapsed to a 33vh band
  in step with the flight) is retired by the sky (2026-10-08); the component
  stays parked in components/hero. Skip: click anywhere or press any key.
*/

const HOLD_MS = 1900;
const GESTURE = { duration: 1.1, ease: [0.7, 0, 0.2, 1] as const };
const SEEN_KEY = "ml-intro-seen";

export default function Page() {
  const reduce = useReducedMotion();
  const { setNav } = useNav();
  const [phase, setPhase] = useState<"intro" | "main">("intro");
  const [worksIndex, setWorksIndex] = useState(0);

  // returning within the session? skip the intro before first paint.
  // Storage access is guarded: a browser that blocks it (private browsing,
  // a locked-down profile) used to throw here and take the whole page down
  // with it - nothing interactive, the ball dead (found 2026-10-21)
  useLayoutEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem(SEEN_KEY); } catch {}
    if (reduce || seen) setPhase("main");
  }, [reduce]);

  useEffect(() => {
    if (phase === "main") {
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
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
            layoutId="wordmark"
            className="wordmark text-hero text-ink px-6 text-center"
            transition={{ layout: reduce ? { duration: 0 } : GESTURE }}
          >
            MARGARET LUWENA
          </motion.h1>
        </div>
      )}

      {/* main page underneath; renders the corner wordmark when revealed */}
      <PortfolioShell reveal={isMain} reduce={!!reduce} onWorksIndex={setWorksIndex} />

      {/* no footer on the home page: the works column just ends at Impeccable
          Chicken (Margaret, 2026-10-09). SiteFooter's reveal mode is kept for
          the day it comes back: `{isMain && <SiteFooter mode="reveal" />}` */}
    </main>
  );
}
