"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  ASCII scrollbar for the case studies (Margaret, 2026-10-21): once the nav
  pill has left, this is the piece of the site's own language that stays on
  the page. A column of small cells in the sky's mono face, pinned to the
  right gutter on desktop:

    track    "·" in faint ink, one cell per row
    thumb    the project's accent (--study-blue), drawn in the sky's dither
             characters; it BULGES - widest at its middle, a single cell at
             its ends - so where you are reads at a glance; the pattern
             walks with time like a cloud rim
    markers  each rail section (Context, Brief, ...) sits beside the track
             at the row its top lands on, so the labels line up with the
             scroll itself; the one you're in reads in ink
    up       a small arrow pill at the foot of the track: back to the top

  Interactive: click anywhere on the track to go there, drag the thumb,
  click a marker to jump to that section. The native scrollbar is hidden on
  studies (globals.css) while this is mounted; the page still scrolls every
  normal way. Reduced motion: the pattern holds still. Phones keep the
  native bar (this is md+ only).
*/

const CELL = 9; // px per row (small, so the column is dense)
const TRACK = "·";
const RAMP = [":", "+", "x", "#"];
const hash = (a: number, b: number) => (((Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0) % 1000) / 1000;

type Section = { id: string; name: string };

export default function AsciiScrollbar({ sections = [] }: { sections?: Section[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [rows, setRows] = useState(0);
  const [prog, setProg] = useState(0); // 0..1 through the page
  const [frac, setFrac] = useState(1); // viewport / page
  const [marks, setMarks] = useState<{ id: string; name: string; p: number }[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const drag = useRef(false);

  useEffect(() => {
    const measure = () => {
      const el = document.scrollingElement ?? document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setFrac(Math.min(1, el.clientHeight / Math.max(1, el.scrollHeight)));
      setProg(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
      if (ref.current) setRows(Math.max(12, Math.floor(ref.current.clientHeight / CELL)));
      /* a section's marker sits where the thumb's top will be when that
         section's top reaches the rail's reading line (30% down the viewport) */
      setMarks(
        sections.flatMap((s) => {
          const node = document.getElementById(s.id);
          if (!node) return [];
          const top = node.getBoundingClientRect().top + el.scrollTop - el.clientHeight * 0.3;
          return [{ id: s.id, name: s.name, p: max > 0 ? Math.min(1, Math.max(0, top / max)) : 0 }];
        })
      );
    };
    measure();
    const t = setTimeout(measure, 700); // after the study's own entrance settles
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join("|")]);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [reduce]);

  const thumb = Math.max(9, Math.round(rows * frac));
  const start = Math.round((rows - thumb) * prog);
  const rowFor = (p: number) => Math.round((rows - thumb) * p);
  const activeIdx = (() => {
    let a = -1;
    marks.forEach((m, i) => { if (prog >= m.p - 0.002) a = i; });
    return a;
  })();

  const seek = (clientY: number, smooth: boolean) => {
    const box = ref.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const usable = Math.max(1, r.height - thumb * CELL);
    const p = Math.min(1, Math.max(0, (clientY - r.top - (thumb * CELL) / 2) / usable));
    scrollToP(p, smooth);
  };
  const scrollToP = (p: number, smooth: boolean) => {
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
      aria-hidden
      className="fixed bottom-[12vh] right-[max(10px,calc(var(--inset)*0.3))] top-[14vh] z-30 hidden md:block"
      style={{ fontFamily: "var(--font-sky), ui-monospace, Menlo, monospace" }}
    >
      {/* section markers, beside the track at their rows */}
      <div className="absolute bottom-0 right-[60px] top-0 w-[96px]">
        {marks.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => scrollToP(m.p, true)}
            className={`absolute right-0 block whitespace-nowrap text-right text-[11px] leading-none tracking-[0.04em] transition-colors duration-300 ${
              i === activeIdx ? "text-ink" : "text-ink/35 hover:text-ink/70"
            }`}
            style={{ top: rowFor(m.p) * CELL + CELL / 2 - 5 }}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* the track */}
      <div
        ref={ref}
        className="absolute bottom-0 right-0 top-0 w-[56px] cursor-pointer select-none text-center text-[9px] leading-[9px]"
        style={{ touchAction: "none" }}
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
          const isMark = marks.some((m) => rowFor(m.p) === i);
          if (inThumb) {
            /* the bulge: cell count per row follows a lens, 1 at the ends, 9 at the
               middle, the swell exaggerated so the position reads at a glance */
            const d = Math.abs((i - start) - (thumb - 1) / 2) / Math.max(1, (thumb - 1) / 2); // 0 centre .. 1 end
            const width = 1 + 2 * Math.round(4 * Math.pow(1 - d, 1.5));
            let line = "";
            for (let k = 0; k < width; k++) {
              const c = Math.abs(k - (width - 1) / 2) / Math.max(1, (width - 1) / 2); // 0 centre .. 1 edge
              const n = hash(i * 7 + k * 13, reduce ? 0 : tick) * 0.45 + (1 - c) * 0.6;
              line += RAMP[Math.min(RAMP.length - 1, Math.floor(n * RAMP.length))];
            }
            return (
              <span key={i} className="block whitespace-pre text-[var(--study-blue)]" style={{ height: CELL }}>
                {line}
              </span>
            );
          }
          return (
            <span
              key={i}
              className={`block transition-colors duration-200 ${isMark ? "text-ink/70" : near ? "text-ink/60" : "text-ink/25"}`}
              style={{ height: CELL }}
            >
              {isMark ? "-" : near ? ":" : TRACK}
            </span>
          );
        })}
      </div>

      {/* back to the top */}
      <button
        type="button"
        onClick={() => scrollToP(0, true)}
        aria-label="Back to top"
        className="absolute -bottom-[38px] right-[14px] grid h-[28px] w-[28px] place-items-center rounded-full border border-black/[0.12] bg-white/90 text-ink/60 shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-colors hover:text-ink"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
