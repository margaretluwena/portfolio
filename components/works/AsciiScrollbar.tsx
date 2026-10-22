"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  ASCII scrollbar for the case studies (Margaret, 2026-10-21): once the nav
  pill has left, this is the piece of the site's own language that stays on
  the page. A column of cells in the sky's mono face, pinned to the right
  gutter on desktop:

    track   "·" in faint ink
    thumb   the project's accent (--study-blue), drawn in the sky's dither
            characters, its pattern walking with time like a cloud rim
    hover   the cells around the pointer wake up (":"), so it reads as
            something you can take hold of

  Interactive: click anywhere on the track to go there, or drag the thumb.
  The native scrollbar is hidden on studies (globals.css) while this one is
  mounted; the page still scrolls every normal way. Reduced motion: the
  pattern holds still. Phones keep the native bar (this is md+ only).
*/

const CELL = 14; // px per row
const TRACK = "·";
const RAMP = [":", "+", "x", "#"];
const hash = (a: number, b: number) => (((Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0) % 1000) / 1000;

export default function AsciiScrollbar() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [rows, setRows] = useState(0);
  const [prog, setProg] = useState(0); // 0..1 through the page
  const [frac, setFrac] = useState(1); // viewport / page
  const [hover, setHover] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const drag = useRef(false);

  useEffect(() => {
    const measure = () => {
      const el = document.scrollingElement ?? document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setFrac(Math.min(1, el.clientHeight / Math.max(1, el.scrollHeight)));
      setProg(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
      if (ref.current) setRows(Math.max(8, Math.floor(ref.current.clientHeight / CELL)));
    };
    measure();
    const t = setTimeout(measure, 600); // after the study's own entrance settles
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 220);
    return () => clearInterval(id);
  }, [reduce]);

  const thumb = Math.max(4, Math.round(rows * frac));
  const start = Math.round((rows - thumb) * prog);

  const seek = (clientY: number, smooth: boolean) => {
    const box = ref.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const usable = Math.max(1, r.height - thumb * CELL);
    const p = Math.min(1, Math.max(0, (clientY - r.top - (thumb * CELL) / 2) / usable));
    const el = document.scrollingElement ?? document.documentElement;
    window.scrollTo({ top: p * (el.scrollHeight - el.clientHeight), behavior: smooth && !reduce ? "smooth" : "auto" });
  };
  const rowAt = (clientY: number) => {
    const box = ref.current;
    if (!box) return null;
    return Math.floor((clientY - box.getBoundingClientRect().top) / CELL);
  };

  if (frac >= 1) return null; // nothing to scroll

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed bottom-[14vh] right-[max(10px,calc(var(--inset)*0.35))] top-[14vh] z-30 hidden w-[20px] cursor-pointer select-none text-center text-[13px] leading-[14px] md:block"
      style={{ fontFamily: "var(--font-sky), ui-monospace, Menlo, monospace", touchAction: "none" }}
      onPointerDown={(e) => {
        drag.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        seek(e.clientY, true);
      }}
      onPointerMove={(e) => {
        setHover(rowAt(e.clientY));
        if (drag.current) seek(e.clientY, false);
      }}
      onPointerUp={(e) => {
        drag.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }}
      onPointerLeave={() => {
        setHover(null);
        drag.current = false;
      }}
    >
      {Array.from({ length: rows }, (_, i) => {
        const inThumb = i >= start && i < start + thumb;
        const near = hover !== null && Math.abs(i - hover) <= 2;
        let ch = TRACK;
        let cls = "text-ink/25";
        if (inThumb) {
          /* denser toward the thumb's middle, the pattern walking with the tick */
          const edge = Math.min(i - start, start + thumb - 1 - i) / Math.max(1, thumb / 2);
          const n = hash(i * 7 + 3, reduce ? 0 : tick) * 0.6 + Math.min(1, edge) * 0.5;
          ch = RAMP[Math.min(RAMP.length - 1, Math.floor(n * RAMP.length))];
          cls = "text-[var(--study-blue)]";
        } else if (near) {
          ch = ":";
          cls = "text-ink/60";
        }
        return (
          <span key={i} className={`block transition-colors duration-200 ${cls}`} style={{ height: CELL }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}
