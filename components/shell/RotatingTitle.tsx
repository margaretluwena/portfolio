"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  "is a design engineer" → typed out, held, deleted, replaced — each title in
  its own color, all tuned to the same vibrancy family as the Figma magenta
  (hsl 298 62% 41%): saturation ~62-85%, lightness ≤48% so contrast on white
  stays ≥ 4.5:1.

  Screen readers get one static sentence (aria-hidden on the animation);
  prefers-reduced-motion renders the first title with no animation at all.
*/

const TITLES = [
  { text: "is a design engineer",   color: "hsl(298 62% 41%)" }, // Figma magenta
  { text: "is a founder",           color: "hsl(217 75% 45%)" }, // electric blue
  { text: "is a builder",           color: "hsl(24 85% 42%)"  }, // orange
  { text: "is an illustrator",      color: "hsl(152 65% 34%)" }, // green
  { text: "is a creative director", color: "hsl(354 72% 44%)" }, // red
  { text: "is a storyteller",       color: "hsl(262 70% 48%)" }, // violet
];

const TYPE_MS = 46;
const DELETE_MS = 26;
const HOLD_MS = 2300;
const START_DELAY_MS = 1250; // let the wordmark land + fades finish first

export default function RotatingTitle({ active, className }: { active: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce || !active) return;
    let cancelled = false;
    const tick = (i: number, l: number, dir: 1 | -1, delay: number) => {
      timer.current = setTimeout(() => {
        if (cancelled) return;
        const full = TITLES[i].text.length;
        if (dir === 1) {
          if (l < full) { setLen(l + 1); tick(i, l + 1, 1, TYPE_MS); }
          else tick(i, l, -1, HOLD_MS);            // typed out — hold
        } else {
          if (l > 0) { setLen(l - 1); tick(i, l - 1, -1, DELETE_MS); }
          else {
            const next = (i + 1) % TITLES.length;   // deleted — next title
            setIdx(next); tick(next, 0, 1, TYPE_MS * 3);
          }
        }
      }, delay);
    };
    tick(0, 0, 1, START_DELAY_MS);
    return () => { cancelled = true; if (timer.current) clearTimeout(timer.current); };
  }, [active, reduce]);

  const t = TITLES[idx];

  return (
    <span className={className}>
      {/* one stable sentence for assistive tech */}
      <span className="sr-only">is a design engineer, founder, builder, illustrator, creative director, and storyteller</span>

      {reduce ? (
        <span aria-hidden style={{ color: TITLES[0].color }}>{TITLES[0].text}</span>
      ) : (
        <span aria-hidden style={{ color: t.color }}>
          {t.text.slice(0, len)}
          <span className="tagline-caret" style={{ background: t.color }} />
        </span>
      )}
    </span>
  );
}
