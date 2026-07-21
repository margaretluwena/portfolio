"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import InteractiveTexture from "@/components/hero/InteractiveTexture";
import PortfolioShell from "@/components/shell/PortfolioShell";
import Nav from "@/components/nav/Nav";
import { featuredWorks } from "@/lib/works";

/*
  THE OPENING.
  1. Full-screen interactive texture + "MARGARET LUWENA" centered (Figma frame 96:4).
  2. After a beat, the texture recedes to a top band and the wordmark TRAVELS to its
     corner slot in the left panel — one element, animated via Framer's shared layout
     (layoutId="wordmark"), so no manual measuring.
  3. The rest of the main page reveals (staggered, inside PortfolioShell).

  The intro plays once per session — returning to "/" via ABOUT or the scribble
  goes straight to the main page (sessionStorage gate, applied pre-paint).

  Texture collapse and wordmark flight share ONE duration + ease so they read as
  a single gesture. Skip: click anywhere or press any key.
*/

const HOLD_MS = 1900;
const GESTURE = { duration: 1.1, ease: [0.7, 0, 0.2, 1] as const };
const SEEN_KEY = "ml-intro-seen";

export default function Page() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "main">("intro");
  const [worksIndex, setWorksIndex] = useState(0);

  // returning within the session? skip the intro before first paint
  useLayoutEffect(() => {
    if (reduce || sessionStorage.getItem(SEEN_KEY)) setPhase("main");
  }, [reduce]);

  useEffect(() => {
    if (phase === "main") {
      sessionStorage.setItem(SEEN_KEY, "1");
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

  return (
    <main
      className="relative min-h-screen bg-paper"
      onClick={() => !isMain && setPhase("main")} /* click to skip */
    >
      {/* persistent texture: full screen in intro, collapses to the top band */}
      <motion.div
        className="fixed inset-x-0 top-0 z-0 overflow-hidden"
        initial={false}
        animate={{ height: isMain ? "36vh" : "100vh" }}
        transition={reduce ? { duration: 0 } : GESTURE}
      >
        <InteractiveTexture className="h-full w-full" />
        {/* extra melt-to-white for the collapsed band: the PNG's baked fade sits
            too low in the crop at band aspect, so this synced overlay finishes the job */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 35%, hsl(var(--paper)) 96%)" }}
          initial={false}
          animate={{ opacity: isMain ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : GESTURE}
        />
      </motion.div>

      {/* nav fades in with the main page; right slot = live works index */}
      <motion.div
        initial={false}
        animate={{ opacity: isMain ? 1 : 0 }}
        transition={{ duration: 0.6, delay: isMain && !reduce ? 0.5 : 0 }}
        style={{ pointerEvents: isMain ? "auto" : "none" }}
      >
        <Nav
          rightSlot={
            isMain ? (
              <span className="tabular-nums">
                {String(worksIndex + 1).padStart(2, "0")} / {String(featuredWorks.length).padStart(2, "0")}
                <span className="ml-3 not-italic text-ink/50">&ndash; selected works &ndash;</span>
              </span>
            ) : null
          }
        />
      </motion.div>

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
    </main>
  );
}
