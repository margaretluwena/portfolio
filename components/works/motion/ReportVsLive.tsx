"use client";

import { useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/* ─────────────────────────────────────────────────────────
 * REPORT VS LIVE (Atlix, The problem)
 *
 * The timing gap, side by side: a quarterly report, dated and already
 * old when it lands, beside one Atlix card that keeps updating. The
 * report never changes. The card's "updated" clock ticks, its growth
 * figure settles upward and its sentiment bar fills, on a loop. Built
 * on the dashboard's own palette (ink, card, line, amber). Margaret,
 * 2026-11-02: "create this for me".
 * ───────────────────────────────────────────────────────── */

const INK = "#05090f", CARD = "#0d1526", LINE = "#1e3054", AMBER = "#c8922a", TEXT = "#eef1f6", MUTED = "#8fa4be", DIM = "#4a6080";

export default function ReportVsLive() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [secs, setSecs] = useState(12);
  const [growth, setGrowth] = useState(47);

  /* the card's clock: seconds since the last update, rolling over each
     minute, with the growth figure nudging up a point now and then */
  useEffect(() => {
    if (reduce || !inView) return;
    const t = setInterval(() => {
      setSecs((s) => (s >= 58 ? 3 : s + 1));
      setGrowth((g) => (Math.random() < 0.12 ? (g >= 52 ? 46 : g + 1) : g));
    }, 1000);
    return () => clearInterval(t);
  }, [reduce, inView]);

  const on = reduce || inView;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-2 md:gap-6">
      {/* the report: paper, a title, a date, and the admission in the small print */}
      <div className="relative overflow-hidden rounded-[6px] border border-black/[0.08] bg-[#f6f3ec] p-6 md:p-7" style={{ aspectRatio: "1 / 0.92" }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/40">Quarterly report · PDF · 64 pages</div>
        <div className="mt-5 font-display text-[clamp(20px,1.7vw,26px)] leading-[1.1] tracking-[-0.01em] text-ink">
          Youth civic attitudes<br />in California, Q2 2026
        </div>
        <div className="mt-3 text-[12px] text-ink/55">Fieldwork April 3 to 29 · Published August 14</div>
        <div className="mt-6 space-y-2.5">
          {[92, 100, 84, 96, 70, 88, 60].map((w, i) => (
            <div key={i} className="h-[7px] rounded-[2px] bg-ink/[0.08]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between border-t border-ink/10 pt-3 text-[11px] text-ink/45 md:inset-x-7">
          <span>n = 1,204 · ages 18 to 34</span>
          <span className="rounded-[3px] border border-ink/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]">15 weeks old</span>
        </div>
      </div>

      {/* the live card: one narrative, its source, and a clock that does not stop */}
      <div className="relative overflow-hidden rounded-[6px] p-6 md:p-7" style={{ background: CARD, border: `1px solid ${LINE}`, aspectRatio: "1 / 0.92", color: TEXT }}>
        <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: AMBER }} />
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM }}>
          <span>Housing &amp; Rent · LA Metro</span>
          <span className="flex items-center gap-1.5" style={{ color: MUTED }}>
            <motion.span
              aria-hidden
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: "#3ddc84" }}
              animate={on && !reduce ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            Live · updated {secs}s ago
          </span>
        </div>
        <div className="mt-5 text-[clamp(17px,1.35vw,21px)] font-semibold leading-[1.25] tracking-[-0.01em]">
          Rent burden signals driving out-migration among young renters
        </div>
        <div className="mt-3 text-[13px] leading-[1.5]" style={{ color: MUTED }}>
          Young Californians earning median wages report spending 45 to 60% of income on rent. Discourse is shifting from frustration to active planning to leave.
        </div>
        <div className="mt-5 flex items-center gap-3">
          <span className="font-mono text-[15px] font-medium" style={{ color: AMBER }}>↑ {growth}%</span>
          <span className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ borderColor: "rgba(200,146,42,0.4)", color: AMBER }}>Pressing</span>
          <span className="text-[11px]" style={{ color: DIM }}>week over week</span>
        </div>
        <div className="mt-4 flex h-[6px] overflow-hidden rounded-[3px]" style={{ background: "#111d33" }}>
          <motion.span className="block h-full" style={{ background: "#4ade80" }} initial={{ width: 0 }} animate={{ width: on ? "8%" : 0 }} transition={{ duration: reduce ? 0 : 0.9, ease }} />
          <motion.span className="block h-full" style={{ background: "#3a5a8a" }} initial={{ width: 0 }} animate={{ width: on ? "18%" : 0 }} transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.15, ease }} />
          <motion.span className="block h-full" style={{ background: "#f87171" }} initial={{ width: 0 }} animate={{ width: on ? "74%" : 0 }} transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.3, ease }} />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px]" style={{ color: DIM }}>
          <span style={{ color: "#4ade80" }}>8% pos</span><span>18% neu</span><span style={{ color: "#f87171" }}>74% neg</span>
        </div>
        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between border-t pt-3 md:inset-x-7" style={{ borderColor: LINE }}>
          <span className="flex items-center gap-1.5">
            {["RDT", "X", "NEWS"].map((s) => (
              <span key={s} className="rounded-[3px] border px-1.5 py-0.5 font-mono text-[9px]" style={{ borderColor: "#2a4570", color: MUTED }}>{s}</span>
            ))}
            <span className="ml-1 font-mono text-[10px]" style={{ color: DIM }}>4,312 posts</span>
          </span>
          <span className="text-[11px]" style={{ color: MUTED }}>View details →</span>
        </div>
      </div>
    </div>
  );
}
