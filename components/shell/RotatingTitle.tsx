"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  "is a product designer" → typed out, held, deleted, replaced. Set in ink,
  no colour (Margaret, 2026-10-08 - the per-title colours came out).

  Screen readers get one static sentence (aria-hidden on the animation);
  prefers-reduced-motion renders the first title with no animation at all.
*/

/* Margaret's list, 2026-10-08: "margaret luwena is... a product designer,
   a design engineer, obsessed with details, designing interactions, an
   illustrator, a builder" + a founder - each line completes the name above */
const TITLES = [
  "is a product designer",
  "is a design engineer",
  "is a founder",
  "is obsessed with details",
  "is designing interactions",
  "is an illustrator",
  "is a builder",
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
        const full = TITLES[i].length;
        if (dir === 1) {
          if (l < full) { setLen(l + 1); tick(i, l + 1, 1, TYPE_MS); }
          else tick(i, l, -1, HOLD_MS);            // typed out - hold
        } else {
          if (l > 0) { setLen(l - 1); tick(i, l - 1, -1, DELETE_MS); }
          else {
            const next = (i + 1) % TITLES.length;   // deleted - next title
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
      <span className="sr-only">is a product designer, a design engineer, a founder, obsessed with details, designing interactions, an illustrator, and a builder</span>

      {reduce ? (
        <span aria-hidden className="text-ink">{TITLES[0]}</span>
      ) : (
        <span aria-hidden className="text-ink">
          {t.slice(0, len)}
          <span className="tagline-caret bg-ink" />
        </span>
      )}
    </span>
  );
}
