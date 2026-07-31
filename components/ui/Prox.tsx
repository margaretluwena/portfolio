"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/*
  Proximity hover: elements near the cursor subtly scale up and darken,
  strongest at the center and easing off with distance - no hard hover edge.

  Wrap any inline element:
    <Prox baseOpacity={0.7}><Link …>ABOUT</Link></Prox>

  baseOpacity < 1 gives the "darken as you approach" read for text set in a
  soft tone (render the text at full ink and let Prox hold it at baseOpacity).
  Springs keep it smooth; prefers-reduced-motion disables the effect entirely.
*/

export default function Prox({
  children,
  className,
  radius = 140,
  maxScale = 1.07,
  baseOpacity = 1,
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  maxScale?: number;
  baseOpacity?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const scaleRaw = useMotionValue(1);
  const opacityRaw = useMotionValue(baseOpacity);
  const scale = useSpring(scaleRaw, { stiffness: 320, damping: 26 });
  const opacity = useSpring(opacityRaw, { stiffness: 320, damping: 26 });

  useEffect(() => {
    if (reduce) {
      scaleRaw.set(1);
      opacityRaw.set(1); // keep text fully readable with no interaction
      return;
    }
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      const p = Math.max(0, 1 - d / radius);
      const eased = p * p; // quadratic falloff - subtle until you're close
      scaleRaw.set(1 + (maxScale - 1) * eased);
      opacityRaw.set(baseOpacity + (1 - baseOpacity) * eased);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [radius, maxScale, baseOpacity, reduce, scaleRaw, opacityRaw]);

  return (
    <motion.span ref={ref} style={{ scale, opacity, display: "inline-block" }} className={className}>
      {children}
    </motion.span>
  );
}
