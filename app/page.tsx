"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import InteractiveTexture from "@/components/hero/InteractiveTexture";
import PortfolioShell from "@/components/shell/PortfolioShell";
import Nav from "@/components/nav/Nav";

/*
  THE OPENING.
  1. Full-screen interactive texture + "MARGARET LUWENA" centered (Figma frame 96:4).
  2. After a beat, the texture recedes to a top band and the wordmark TRAVELS to its
     corner slot in the left panel — one element, animated via Framer's shared layout
     (layoutId="wordmark"), so no manual measuring.
  3. The rest of the main page reveals.

  The corner wordmark itself is rendered inside PortfolioShell when `reveal` is true,
  which is what hands the shared-layout element off from center to corner.
*/

const HOLD_MS = 1900;

export default function Page() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "main">("intro");

  useEffect(() => {
    if (reduce) return setPhase("main");
    const t = setTimeout(() => setPhase("main"), HOLD_MS);
    return () => clearTimeout(t);
  }, [reduce]);

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
          animate={{ height: isMain ? "42vh" : "100vh" }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] }}
        >
          <InteractiveTexture className="h-full w-full" />
        </motion.div>

        {/* nav fades in with the main page */}
        <motion.div
          initial={false}
          animate={{ opacity: isMain ? 1 : 0 }}
          transition={{ duration: 0.6, delay: isMain ? 0.5 : 0 }}
          style={{ pointerEvents: isMain ? "auto" : "none" }}
        >
          <Nav rightSlot={isMain ? <span>– selected works –</span> : null} />
        </motion.div>

        {/* intro-position wordmark: present only during intro; layoutId hands it to the corner */}
        {!isMain && (
          <div className="fixed inset-0 z-20 grid place-items-center">
            <motion.h1
              layoutId="wordmark"
              className="wordmark text-hero text-ink px-6 text-center"
              transition={{ layout: { duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] } }}
            >
              MARGARET LUWENA
            </motion.h1>
          </div>
        )}

        {/* main page underneath; renders the corner wordmark when revealed */}
        <PortfolioShell reveal={isMain} reduce={!!reduce} />
      </main>
  );
}
