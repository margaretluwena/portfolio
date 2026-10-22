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
    markers  the sections are FANNED evenly down the track, a fixed dash
             and the name at each, and the lens travels between them at
             whatever pace the section's length demands - a long section
             moves it slowly, a short one quickly (Margaret, 2026-10-21).
             So the track IS the list. As the lens reaches a marker it
             bulges (the lens alone, never the dash) and the name turns
             to ink
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

  /* the lens is a fixed 9 rows; its centre maps page progress -> track
     position piecewise through the markers' even positions */
  const thumb = 9;
  const n = marks.length;
  const tOf = (i: number) => (n > 1 ? 0.06 + 0.88 * (i / (n - 1)) : 0.5); // a marker's place on the track, 0..1
  const toTrack = (p: number) => {
    if (n === 0) return p;
    const pts = [{ p: 0, t: 0 }, ...marks.map((m, i) => ({ p: m.p, t: tOf(i) })), { p: 1, t: 1 }];
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      if (p <= b.p) return b.p === a.p ? b.t : a.t + ((p - a.p) / (b.p - a.p)) * (b.t - a.t);
    }
    return 1;
  };
  const toPage = (t: number) => {
    if (n === 0) return t;
    const pts = [{ p: 0, t: 0 }, ...marks.map((m, i) => ({ p: m.p, t: tOf(i) })), { p: 1, t: 1 }];
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      if (t <= b.t) return b.t === a.t ? b.p : a.p + ((t - a.t) / (b.t - a.t)) * (b.p - a.p);
    }
    return 1;
  };
  const span = Math.max(1, rows - thumb);
  const start = Math.round(span * toTrack(sp));
  const centre = start + (thumb - 1) / 2;
  void frac;
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
    setBurst({ row: Math.round(span * tOf(crossed)) + Math.floor((thumb - 1) / 2), at: performance.now() });
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
    scrollToP(toPage(Math.min(1, Math.max(0, (clientY - r.top - (thumb * CELL) / 2) / usable))), smooth);
  };
  const rowAt = (clientY: number) => {
    const box = ref.current;
    return box ? Math.floor((clientY - box.getBoundingClientRect().top) / CELL) : null;
  };

  if (frac >= 1) return null;

  return (
    <div
      className="fixed bottom-[18vh] left-[calc(var(--inset)*0.18)] top-[26vh] z-30 hidden md:block"
      style={{ fontFamily: "var(--font-sky), ui-monospace, Menlo, monospace" }}
    >
      {/* the track, with the pointer column to its left */}
      <div
        ref={ref}
        aria-hidden
        className="absolute bottom-0 left-0 top-0 w-[60px] cursor-pointer select-none text-[9px] leading-[9px]"
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
        {/* the lens bulges as it passes a header: 0 away from any marker, 1 on one */}
        {Array.from({ length: rows }, (_, i) => {
          const markerRows = marks.map((_, k) => Math.round(span * tOf(k)) + Math.floor((thumb - 1) / 2));
          const atHeader = markerRows.reduce((m, r) => Math.max(m, 1 - Math.abs(centre - r) / 4), 0);
          const TAIL = 3; // rows past each end that dither off
          const inThumb = i >= start && i < start + thumb;
          const inTail = !inThumb && i >= start - TAIL && i < start + thumb + TAIL;
          const near = hover !== null && Math.abs(i - hover) <= 2;
          const isMark = marks.some((_, k) => Math.round(span * tOf(k)) + Math.floor((thumb - 1) / 2) === i);
          const flare = burst && Math.abs(i - burst.row) <= 2 ? burstAmt * (1 - Math.abs(i - burst.row) / 3) : 0;
          const isCentre = Math.round(centre) === i;
          /* every row is an 11-cell field centred on the track's axis */
          let field = "";
          let cls = "text-ink/25";
          if (inThumb) {
            const d = Math.abs(i - centre) / Math.max(1, (thumb - 1) / 2); // 0 centre .. 1 end
            /* a gentler swell: one cell at the ends, five at the middle, plus up to
               four more while the lens sits on a header (Margaret, 2026-10-21) */
            const width = Math.min(11, 1 + 2 * Math.round((2 + atHeader * 3) * Math.pow(Math.max(0, 1 - d), 1.3) + flare * 1.5));
            for (let k = 0; k < width; k++) {
              const c = Math.abs(k - (width - 1) / 2) / Math.max(1, (width - 1) / 2);
              const n = hash(i * 7 + k * 13, reduce ? 0 : tick) * 0.45 + (1 - c) * 0.6;
              /* the ends dither off: cells near the lens's ends drop out at random */
              const drop = d > 0.55 && hash(i * 3 + k * 17, reduce ? 1 : tick) < (d - 0.55) * 1.6;
              field += drop ? " " : RAMP[Math.min(RAMP.length - 1, Math.floor(n * RAMP.length))];
            }
            cls = "text-[var(--study-blue)]";
          } else if (inTail) {
            /* a sparse tail past each end, thinning with distance */
            const dist = i < start ? start - i : i - (start + thumb - 1);
            const keep = hash(i * 11, reduce ? 1 : tick) < 0.55 - dist * 0.15;
            field = keep ? (hash(i * 5, tick) < 0.5 ? ":" : ".") : TRACK;
            cls = keep ? "text-[var(--study-blue)]" : "text-ink/25";
          } else if (isMark) {
            field = "---"; // a fixed dash; the bulge is the lens's alone
            cls = "text-ink/50";
          } else {
            field = near ? ":" : TRACK;
            cls = near ? "text-ink/60" : "text-ink/25";
          }
          const pad = Math.max(0, Math.floor((11 - field.length) / 2));
          void isCentre;
          return (
            <span key={i} className={`block whitespace-pre ${cls}`} style={{ height: CELL }}>
              {" ".repeat(pad) + field}
            </span>
          );
        })}
      {/* back to the top, centred on the track's axis (half the 11-cell field) */}
      <button
        type="button"
        onClick={() => scrollToP(0, true)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Back to top"
        className="absolute -bottom-[40px] grid h-[28px] w-[28px] -translate-x-1/2 place-items-center rounded-full border border-black/[0.12] bg-white/90 text-ink/60 shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-colors hover:text-ink"
        style={{ left: "5.5ch", fontSize: 9 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      </div>

      {/* section names beside the track, fanned evenly down it at their markers */}
      <div className="absolute bottom-0 left-[72px] top-0 w-[120px]">
        {marks.map((m, i) => {
          const on = i === activeIdx;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => scrollToP(m.p, true)}
              className={`absolute left-0 block -translate-y-1/2 whitespace-nowrap font-body text-body transition-colors duration-300 ${
                on ? "text-ink" : "text-ink/40 hover:text-ink/70"
              }`}
              style={{ top: (Math.round(span * tOf(i)) + Math.floor((thumb - 1) / 2)) * CELL + CELL / 2 }}
            >
              {m.name}
            </button>
          );
        })}
      </div>

    </div>
  );
}
