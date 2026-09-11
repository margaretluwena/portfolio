"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/*
  PARKED (2026-09-10): unmounted from app/layout.tsx on Margaret's order -
  no cursor dot anywhere. Kept unimported, same convention as the thin
  case-study pages; remount <Cursor /> in the root layout to restore.

  Custom cursor: a small ink dot trailing the pointer, identical everywhere
  on the page (the VIEW disc mode is gone by request - no growing, no label).

  Mouse-only: skipped for touch/coarse pointers and for reduced motion.
*/

export default function Cursor() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 60 });
  const sy = useSpring(y, { stiffness: 900, damping: 60 });

  useEffect(() => {
    const mq = matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = () => setFine(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!fine || reduce) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduce, x, y]);

  if (!fine || reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-ink"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ opacity: visible ? 1 : 0 }}
    />
  );
}
