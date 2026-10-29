"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useStudyDials, toTransition } from "@/components/dev/dials";
import { registerTransport } from "@/components/dev/transport";
import defaults from "@/lib/dials/before-after-slider.json";

/* ─────────────────────────────────────────────────────────
 * BEFORE / AFTER SLIDER (Traeco, Problem 2)
 *
 *    0s   waiting for scroll into view, handle at startPosition
 *    +nudgeDelay   handle eases out by nudgeDistance and back (nudgeSpring)
 *    then it is the visitor's: drag, or arrow keys on the handle
 * ───────────────────────────────────────────────────────── */

/* both screenshots are 1440 wide with the sidebar on the left; the frames
   below show only the content column, top-aligned, so the two line up */
const BEFORE = { src: "/images/traeco/dashboard-home.png", sidebar: 220, alt: "The earlier Traeco home: a banner, a recommendation card, five tiles and a chart all at the top" };
const AFTER = { src: "/images/traeco/home-after.png", sidebar: 252, alt: "The shipped Traeco home: four tiles, then savings available and the top recommendations" };
const PAGE_W = 1440;

export default function BeforeAfterSlider() {
  const d = useStudyDials("BeforeAfterSlider", "before-after-slider", {
    startPosition: [defaults.startPosition, 20, 80, 1],
    nudgeDistance: [defaults.nudgeDistance, 0, 20, 1],
    nudgeDelay: [defaults.nudgeDelay, 0, 2, 0.1],
    nudgeSpring: defaults.nudgeSpring as { type: "spring"; visualDuration: number; bounce: number },
    triggerThreshold: [defaults.triggerThreshold, 0, 1, 0.05],
  });
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: d.triggerThreshold, once: true });
  const pos = useMotionValue(d.startPosition);
  const clip = useMotionTemplate`inset(0 0 0 ${pos}%)`;
  const left = useMotionTemplate`${pos}%`;
  const taken = useRef(false);

  useEffect(() => { if (!taken.current) pos.set(d.startPosition); }, [d.startPosition, pos]);

  useEffect(() => {
    if (!inView || reduce || taken.current) return;
    const seq = animate([
      [pos, d.startPosition + d.nudgeDistance, { ...toTransition(d.nudgeSpring), at: d.nudgeDelay }],
      [pos, d.startPosition, { ...toTransition(d.nudgeSpring) }],
    ]);
    const unregister = registerTransport({
      id: "before-after-slider",
      label: "Before / after nudge",
      duration: () => seq.duration,
      getTime: () => seq.time,
      setTime: (t) => { seq.time = t; },
      play: () => seq.play(),
      pause: () => seq.pause(),
      restart: () => { seq.time = 0; seq.play(); },
      setSpeed: (s) => { seq.speed = s; },
      isPlaying: () => seq.state === "running",
    });
    return () => { seq.stop(); unregister(); };
  }, [inView, reduce, pos, d.startPosition, d.nudgeDistance, d.nudgeDelay, d.nudgeSpring]);

  const setFromPointer = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    pos.set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };
  const onDown = (e: React.PointerEvent) => {
    taken.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromPointer(e);
  };
  const onMove = (e: React.PointerEvent) => { if (e.buttons & 1) setFromPointer(e); };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault(); taken.current = true;
      pos.set(Math.max(0, Math.min(100, pos.get() + (e.key === "ArrowLeft" ? -step : step))));
    }
  };

  const frame = (img: typeof BEFORE) => ({
    width: `${(PAGE_W / (PAGE_W - img.sidebar)) * 100}%`,
    left: `${(-img.sidebar / (PAGE_W - img.sidebar)) * 100}%`,
  });

  return (
    <div
      ref={ref}
      className="relative w-full touch-none select-none overflow-hidden rounded-[4px] bg-placeholder/40"
      style={{ aspectRatio: "1180 / 820" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BEFORE.src} alt={BEFORE.alt} className="absolute top-0 max-w-none" style={frame(BEFORE)} draggable={false} />
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AFTER.src} alt={AFTER.alt} className="absolute top-0 max-w-none" style={frame(AFTER)} draggable={false} />
      </motion.div>
      <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-label uppercase text-ink/70 backdrop-blur">Before</span>
      <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-label uppercase text-ink/70 backdrop-blur">After</span>
      {/* the handle: a hairline with a grip, keyboard-operable */}
      <motion.div
        role="slider"
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos.get())}
        tabIndex={0}
        onKeyDown={onKey}
        className="absolute inset-y-0 w-0 cursor-ew-resize focus-visible:outline-none"
        style={{ left }}
      >
        <div className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
        <div className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden><path d="M5 2 1 6l4 4M9 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </motion.div>
    </div>
  );
}
