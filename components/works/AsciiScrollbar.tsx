"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";

/*
  ASCII minimap for the case studies (Margaret, 2026-10-21; ref
  devouringdetails.com's tick minimap). Once the nav pill has left, this is
  the piece of the site's own language that stays on the page. It lives in
  the LEFT gutter, the rail's labels sitting on it:

    track    one "·" per row in the sky's mono face, 9px rows, so the
             column is dense
    lens     where you are: the project's accent (--study-blue) drawn in
             the sky's dither characters, swelling from one cell at its
             ends to nine at its middle. It follows the scroll on a SPRING,
             so it lags a touch and settles, and its pattern walks with
             time like a cloud rim - it reads as alive, not pasted on
    pointer  ">" to the left of the lens's centre row
    markers  a section's row is a short dash; its name sits beside the
             track at that row, so the labels line up with the scroll
             itself. When the lens crosses one the row bursts wide for a
             beat and the name turns to ink
    up       an arrow pill at the foot of the track: back to the top

  Interactive: click anywhere on the track to go there, drag the lens,
  click a name to jump to that section. The native scrollbar is hidden on
  studies (globals.css) while this is mounted. Reduced motion: no spring,
  no walk, no burst. Phones keep the native bar (md+ only).
*/

const CELL = 9;
const TRACK = "·";
const RAMP = [":", "+", "x", "#"];
const hash = (a: number, b: number) => (((Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0) % 1000) / 1000;

type Section = { id: string; name: string };

export default function AsciiScrollbar({ sections = [] }: { sections?: Section[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [rows, setRows] = useState(0);
  const [frac, setFrac] = useState(1); // viewport / page
  const [marks, setMarks] = useState<{ id: string; name: string; p: number }[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [burst, setBurst] = useState<{ row: number; at: number } | null>(null);
  const drag = useRef(false);

  /* scroll progress, and the lens's springed copy of it */
  const progress = useMotionValue(0);
  const lens = useSpring(progress, reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 110, damping: 16, mass: 0.9 });
  const [sp, setSp] = useState(0);
  useMotionValueEvent(lens, "change", (v) => setSp(v));

  useEffect(() => {
    const measure = () => {
      const el = document.scrollingElement ?? document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setFrac(Math.min(1, el.clientHeight / Math.max(1, el.scrollHeight)));
      progress.set(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
      if (ref.current) setRows(Math.max(12, Math.floor(ref.current.clientHeight / CELL)));
      /* a section's marker sits where the lens's centre will be when the
         section's top reaches the reading line (30% down the viewport) */
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
    const t = setTimeout(measure, 700);
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
    const id = setInterval(() => setTick((t) => t + 1), 160);
    return () => clearInterval(id);
  }, [reduce]);

  const thumb = Math.max(9, Math.round(rows * frac));
  const span = Math.max(1, rows - thumb);
  const start = Math.round(span * sp);
  const centre = start + (thumb - 1) / 2;
  const rowFor = (p: number) => Math.round(span * p) + (thumb - 1) / 2; // the row a section's marker sits on
  const activeIdx = (() => {
    let a = -1;
    marks.forEach((m, i) => { if (sp >= m.p - 0.003) a = i; });
    return a;
  })();

  /* the burst: when the lens crosses a marker, that row flares for a beat */
  const lastActive = useRef(-1);
  useEffect(() => {
    if (activeIdx === lastActive.current) return;
    const crossed = activeIdx > lastActive.current ? activeIdx : lastActive.current;
    lastActive.current = activeIdx;
    if (reduce || crossed < 0 || !marks[crossed]) return;
    setBurst({ row: Math.round(rowFor(marks[crossed].p)), at: performance.now() });
    const ids = [60, 140, 240, 360, 520].map((ms) => window.setTimeout(() => setTick((t) => t + 1), ms));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);
  const burstAmt = burst ? Math.max(0, 1 - (performance.now() - burst.at) / 520) : 0;

  const scrollToP = (p: number, smooth: boolean) => {
    const el = document.scrollingElement ?? document.documentElement;
    window.scrollTo({ top: p * (el.scrollHeight - el.clientHeight), behavior: smooth && !reduce ? "smooth" : "auto" });
  };
  const seek = (clientY: number, smooth: boolean) => {
    const box = ref.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const usable = Math.max(1, r.height - thumb * CELL);
    scrollToP(Math.min(1, Math.max(0, (clientY - r.top - (thumb * CELL) / 2) / usable)), smooth);
  };
  const rowAt = (clientY: number) => {
    const box = ref.current;
    return box ? Math.floor((clientY - box.getBoundingClientRect().top) / CELL) : null;
  };

  if (frac >= 1) return null;

  return (
    <div
      className="fixed bottom-[12vh] left-[calc(var(--inset)*0.18)] top-[18vh] z-30 hidden md:block"
      style={{ fontFamily: "var(--font-sky), ui-monospace, Menlo, monospace" }}
    >
      {/* the track, with the pointer column to its left */}
      <div
        ref={ref}
        aria-hidden
        className="absolute bottom-0 left-0 top-0 w-[64px] cursor-pointer select-none text-[9px] leading-[9px]"
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
          const isMark = marks.some((m) => Math.round(rowFor(m.p)) === i);
          const flare = burst && Math.abs(i - burst.row) <= 2 ? burstAmt * (1 - Math.abs(i - burst.row) / 3) : 0;
          const isCentre = Math.round(centre) === i;
          /* every row is [pointer cell][11-cell field], the field centred on the track's axis */
          let field = "";
          let cls = "text-ink/25";
          if (inThumb) {
            const d = Math.abs(i - centre) / Math.max(1, (thumb - 1) / 2); // 0 centre .. 1 end
            const width = Math.min(11, 1 + 2 * Math.round(4 * Math.pow(Math.max(0, 1 - d), 1.5) + flare * 2));
            for (let k = 0; k < width; k++) {
              const c = Math.abs(k - (width - 1) / 2) / Math.max(1, (width - 1) / 2);
              const n = hash(i * 7 + k * 13, reduce ? 0 : tick) * 0.45 + (1 - c) * 0.6;
              field += RAMP[Math.min(RAMP.length - 1, Math.floor(n * RAMP.length))];
            }
            cls = "text-[var(--study-blue)]";
          } else if (isMark || flare > 0) {
            const w = Math.min(11, 3 + Math.round(flare * 8));
            field = "-".repeat(w);
            cls = flare > 0 ? "text-[var(--study-blue)]" : "text-ink/60";
          } else {
            field = near ? ":" : TRACK;
            cls = near ? "text-ink/60" : "text-ink/25";
          }
          const pad = Math.max(0, Math.floor((11 - field.length) / 2));
          return (
            <span key={i} className={`block whitespace-pre ${cls}`} style={{ height: CELL }}>
              <span className={isCentre ? "text-[var(--study-blue)]" : "text-transparent"}>{">"}</span>
              {" ".repeat(pad) + field}
            </span>
          );
        })}
      </div>

      {/* section names beside the track, at their rows */}
      <div className="absolute bottom-0 left-[72px] top-0 w-[120px]">
        {marks.map((m, i) => {
          const on = i === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => scrollToP(m.p, true)}
              className={`absolute left-0 block whitespace-nowrap font-body text-body transition-all duration-300 ${
                on ? "translate-x-[4px] text-ink" : "text-ink/40 hover:text-ink/70"
              }`}
              style={{ top: rowFor(m.p) * CELL - 9 }}
            >
              {m.name}
            </button>
          );
        })}
      </div>

      {/* back to the top */}
      <button
        type="button"
        onClick={() => scrollToP(0, true)}
        aria-label="Back to top"
        className="absolute -bottom-[40px] left-[18px] grid h-[28px] w-[28px] place-items-center rounded-full border border-black/[0.12] bg-white/90 text-ink/60 shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-colors hover:text-ink"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
