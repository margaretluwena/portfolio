"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  A word with a sticker that pops out on hover (Figma 190:642: "USC ✌️",
  "Traeco ☘", "TroyLabs 🚀" - the bio leaves a gap after each word for it).

  Two springs, one gesture:
    - the SLOT after the word animates width 0 → auto, so the text that
      follows is physically pushed aside rather than overlapped;
    - the STICKER inside it scales 0 → 1 with overshoot and settles its tilt,
      so it pops into existence instead of fading in.
  Hover or keyboard focus (a link inside) pops it, and it STAYS out - the
  bio collects its stickers as you read (Margaret, 2026-10-08). Touch
  devices have no hover, so the sticker is simply always out there;
  reduced motion renders it static too.

  The sticker is decorative (aria-hidden) - the word carries the meaning.
*/

export default function StickerWord({
  src,
  height = "1.2em",
  tilt = -16,
  children,
}: {
  src: string;
  height?: string;   // sticker height in em of the surrounding text
  tilt?: number;     // degrees the sticker leans from before it settles
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [popped, setPopped] = useState(false); // latches on first hover/focus
  const [coarse, setCoarse] = useState(false);

  // no hover available (touch) - keep the sticker out
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const open = popped || coarse || !!reduce;

  const slot = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 26, mass: 0.8 };
  const pop = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 620, damping: 15, mass: 0.7 };

  return (
    <span
      className="inline-flex items-end whitespace-nowrap align-baseline"
      onPointerEnter={() => setPopped(true)}
      onFocus={() => setPopped(true)}
    >
      {children}
      {/* the gap the sticker makes for itself */}
      <motion.span
        aria-hidden
        className="inline-flex items-end"
        style={{ height }}
        initial={false}
        animate={{ width: open ? "auto" : 0, marginLeft: open ? "0.28em" : 0 }}
        transition={slot}
      >
        <motion.img
          src={src}
          alt=""
          draggable={false}
          className="block w-auto max-w-none select-none origin-bottom-left"
          style={{ height }}
          initial={false}
          animate={{ scale: open ? 1 : 0, rotate: open ? 0 : tilt, opacity: open ? 1 : 0 }}
          transition={pop}
        />
      </motion.span>
    </span>
  );
}
