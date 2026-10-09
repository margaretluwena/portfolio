"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/*
  Cursor bubble (Margaret, 2026-10-09): a small white pill that rides just
  off the pointer and names what the thing under it does - "Coming soon!"
  on a card with no study yet, "Pick it up and shake" over the ball.

  Two ways to put text in it:
    - any element with data-bubble="..." (the pointer's nearest ancestor
      with the attribute wins; leaving it clears the bubble)
    - setCursorBubble(text | null) for things that aren't DOM elements,
      like the sky canvas (it sits behind the page with pointer-events
      none, so its ball and dog are hit-tested by the engine instead)
  A DOM bubble takes precedence over an event one while both apply.

  Mounted once in the root layout. Pointer-only: it never renders on touch
  or coarse pointers, where there is no hover to follow. The position
  springs after the pointer (no lag under reduced motion).
*/

const BUBBLE_EVENT = "cursor-bubble";

export function setCursorBubble(text: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string | null>(BUBBLE_EVENT, { detail: text }));
}

export default function CursorBubble() {
  const reduce = useReducedMotion();
  const [text, setText] = useState<string | null>(null);
  const [fine, setFine] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const spring = reduce ? { stiffness: 2000, damping: 100, mass: 0.1 } : { stiffness: 520, damping: 38, mass: 0.6 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!fine) return;
    let fromDom: string | null = null;
    let fromEvent: string | null = null;
    const apply = () => setText(fromDom ?? fromEvent);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target instanceof Element ? e.target.closest("[data-bubble]") : null;
      const t = el?.getAttribute("data-bubble") || null;
      if (t !== fromDom) {
        fromDom = t;
        apply();
      }
    };
    const clear = () => {
      fromDom = null;
      fromEvent = null;
      apply();
    };
    const onBubble = (e: Event) => {
      fromEvent = (e as CustomEvent<string | null>).detail ?? null;
      apply();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", clear);
    window.addEventListener("blur", clear);
    window.addEventListener(BUBBLE_EVENT, onBubble);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("mouseleave", clear);
      window.removeEventListener("blur", clear);
      window.removeEventListener(BUBBLE_EVENT, onBubble);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <motion.div style={{ x: sx, y: sy }} className="absolute left-0 top-0">
        <AnimatePresence>
          {text && (
            <motion.span
              key={text}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: reduce ? 0 : 0.12 } }}
              transition={{ duration: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[18px] top-[18px] block origin-top-left whitespace-nowrap rounded-full border border-black/[0.06] bg-white px-[14px] py-[7px] text-[13px] leading-none text-ink shadow-[0_6px_22px_rgba(0,0,0,0.14)]"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
