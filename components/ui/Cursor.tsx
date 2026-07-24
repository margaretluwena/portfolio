"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from "motion/react";

/*
  Custom cursor. A small ink dot trails the pointer sitewide; over anything
  marked data-cursor="view" (the works images — the primary CTA) it grows into
  a labeled "VIEW" disc and the native cursor hides there (see globals.css).

  Mouse-only: skipped for touch/coarse pointers and for reduced motion.
*/

export default function Cursor() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [mode, setMode] = useState<"idle" | "view">("idle");
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
      const t = e.target as Element | null;
      setMode(t?.closest?.('[data-cursor="view"]') ? "view" : "idle");
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

  const view = mode === "view";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] grid place-items-center rounded-full bg-ink"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: view ? 64 : 8,
        height: view ? 64 : 8,
        opacity: visible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    >
      <AnimatePresence>
        {view && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="text-[11px] tracking-[0.14em] text-paper"
          >
            VIEW
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
