"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/*
  THE CARDS COME ALIVE ON HOVER (Margaret, 2026-11-03).

  Each featured card has a hover scene drawn over its cover art, in the
  product's own motion:

    Mark      three iPhone screens (home, the library by category, the
              library by book) rise from below the card's middle, upright
              and side by side, one after the other, and sink back when the pointer leaves.
              At rest they sit entirely under the card's bottom edge
              (top: 100%, clipped), so nothing shows until the hover
              (Margaret, 2026-11-03). CSS only: `top` on group-hover with
              staggered delays.

    Traeco    the dashboard opens the way it does in the product
              (app/(dashboard)/page.tsx: stages at 80/160/300/420ms, an
              800ms cubic-out count-up). The four stat cards are rebuilt
              in HTML over the capture at the capture's own pixel
              coordinates (a 3172 x 1960 stage scaled to the layer), so
              the numbers count up, the budget meter fills, the savings
              figure counts, and the "where it went" bars grow. At rest
              the overlay shows the final state and matches the capture.

    Prosaic   the chart's bars grow up from the floor as they do on the
              site: a curtain in the card's paper colour sits over each
              bar in the capture and shrinks to the top, a little later
              for each bar to the right.

  `play` counts the hovers: a change replays the Traeco and Prosaic
  scenes (the elements are keyed by it). Reduced motion: everything at
  rest, nothing moves.
*/

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Mark: the screens rise ---------- */

const PHONES = [
  // upright, side by side with a sliver between (no tilt, no overlap: Margaret, 2026-11-03)
  // the middle one lands a little higher than its neighbours
  { src: "/images/mark/screen-home.png", cx: 31, delay: 0, lift: "group-hover:top-[20%]", rest: "top-[20%]" },
  { src: "/images/mark/screen-categories.png", cx: 50, delay: 70, lift: "group-hover:top-[15%]", rest: "top-[15%]" },
  { src: "/images/mark/screen-books.png", cx: 69, delay: 140, lift: "group-hover:top-[20%]", rest: "top-[20%]" },
];

export function MarkPhones({ hover }: { hover: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[972/678] overflow-hidden" aria-hidden>
      {PHONES.map((p) => (
        <div
          key={p.src}
          className={`absolute transition-[top] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${hover ? `top-[104%] ${p.lift}` : p.rest}`}
          style={{ left: `${p.cx - 8.5}%`, width: "17%", aspectRatio: "284 / 617", transitionDelay: `${p.delay}ms`, opacity: 0.95 /* a touch lighter against the card (Margaret, 2026-11-03) */ }}
        >
          {/* the frame, drawn like the titanium phone: a thin graphite rim with
              a hairline highlight on its edge, a dark bezel inside it, and the
              island at the top of the screen; the shadow is low and soft, so
              it sits on the card instead of cutting into it (Margaret,
              2026-11-03: the black frames read "harsh") */}
          <div
            className="absolute inset-0 rounded-[15.5%/7.1%]"
            style={{
              background: "linear-gradient(160deg, #5d5d62 0%, #3a3a3e 40%, #2b2b2f 100%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.18), 0 22px 44px rgba(0,0,0,0.13), 0 6px 14px rgba(0,0,0,0.08)",
              padding: "2.6%",
            }}
          >
            <div className="h-full w-full rounded-[13.3%/6.1%] bg-[#0c0c0e]" style={{ padding: "3.4%" }}>
              <div className="relative h-full w-full overflow-hidden rounded-[10.5%/4.8%] bg-[#f2f2f2]">
                <Image src={p.src} alt="" fill sizes="12vw" className="object-cover object-top" />
                {/* the island */}
                <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#0c0c0e]" style={{ top: "2.1%", width: "27%", height: "3.6%" }} />
              </div>
            </div>
          </div>
          {/* the side buttons: action and volume on the left, power on the right */}
          <div className="absolute rounded-l-[2px] bg-[#4a4a4e]" style={{ left: "-1.4%", top: "17%", width: "1.6%", height: "3.2%" }} />
          <div className="absolute rounded-l-[2px] bg-[#4a4a4e]" style={{ left: "-1.4%", top: "23.5%", width: "1.6%", height: "6%" }} />
          <div className="absolute rounded-l-[2px] bg-[#4a4a4e]" style={{ left: "-1.4%", top: "31%", width: "1.6%", height: "6%" }} />
          <div className="absolute rounded-r-[2px] bg-[#4a4a4e]" style={{ right: "-1.4%", top: "26%", width: "1.6%", height: "9%" }} />
        </div>
      ))}
    </div>
  );
}

/* ---------- Traeco: the dashboard opens ---------- */

const DASH_W = 3172, DASH_H = 1960; // the capture's pixels
const COUNT_MS = 800;
const ease3 = (p: number) => 1 - Math.pow(1 - p, 3);

function useCount(target: number, go: boolean, reduce: boolean, delay = 0) {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (!go || reduce) { setV(target); return; }
    let raf = 0; const t0 = performance.now() + delay; setV(0);
    const tick = (t: number) => { const p = Math.min(1, Math.max(0, (t - t0) / COUNT_MS)); setV(target * ease3(p)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, go, reduce, delay]);
  return v;
}

const money = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
const num = (v: number) => Math.round(v).toLocaleString("en-US");

const STATS = [
  { x: 576, w: 608, label: "Month to date", value: 2410.55, fmt: money, meter: 0.48, sub: ["48%", " of $5,000 · pace $2,669 by Oct 31"] },
  { x: 1216, w: 606, label: "Last 30 days", value: 3872.4, fmt: money, sub: ["+17.0%", " vs. the 30 before"], red: true },
  { x: 1854, w: 608, label: "Runs", value: 118420, fmt: num, sub: ["$0.0327", " per run"] },
  { x: 2494, w: 606, label: "Last 7 days", value: 769, fmt: money0, sub: ["+7.0%", " vs prior week"], red: true },
];
const WHERE = [
  { y: 720, w: 499, color: "rgb(96,165,250)" },
  { y: 838, w: 329, color: "rgb(167,139,250)" },
  { y: 956, w: 121, color: "rgb(45,212,191)" },
  { y: 1074, w: 79, color: "rgb(251,191,36)" },
  { y: 1192, w: 18, color: "rgb(244,114,182)" },
];

function Stat({ s, i, go, reduce }: { s: (typeof STATS)[number]; i: number; go: boolean; reduce: boolean }) {
  const v = useCount(s.value, go, reduce, 160 + i * 60);
  return (
    <motion.div
      className="absolute overflow-hidden"
      style={{ left: s.x, top: 236, width: s.w, height: 246, borderRadius: 22, background: "rgb(23,24,27)", border: "1.5px solid rgba(255,255,255,0.055)", padding: "46px 56px", color: "rgb(242,242,243)" }}
      initial={go && !reduce ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16 + i * 0.06, ease: EASE }}
    >
      <div style={{ fontSize: 26, color: "rgb(139,139,146)", lineHeight: 1 }}>{s.label}</div>
      <div style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1, marginTop: 24, fontVariantNumeric: "tabular-nums" }}>{s.fmt(v)}</div>
      {s.meter != null ? (
        <>
          <div style={{ position: "relative", height: 8, marginTop: 22, borderRadius: 4, background: "rgb(45,46,50)", overflow: "hidden" }}>
            <motion.div
              style={{ position: "absolute", inset: 0, transformOrigin: "0 50%", background: "rgb(52,211,153)" }}
              initial={go && !reduce ? { scaleX: 0 } : false}
              animate={{ scaleX: s.meter }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            />
          </div>
          <div style={{ fontSize: 24, color: "rgb(107,107,114)", marginTop: 18, lineHeight: 1 }}><b style={{ fontWeight: 500, color: "rgb(201,201,207)" }}>{s.sub[0]}</b>{s.sub[1]}</div>
        </>
      ) : (
        <div style={{ fontSize: 24, color: "rgb(107,107,114)", marginTop: 40, lineHeight: 1 }}><b style={{ fontWeight: 500, color: s.red ? "rgb(248,113,113)" : "rgb(201,201,207)" }}>{s.sub[0]}</b>{s.sub[1]}</div>
      )}
    </motion.div>
  );
}

export function TraecoDashboard({ play }: { play: number }) {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / DASH_W));
    ro.observe(el); setScale(el.clientWidth / DASH_W);
    return () => ro.disconnect();
  }, []);
  const go = play > 0;
  const savings = useCount(1214, go, reduce, 300);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden style={{ fontFamily: "Inter, -apple-system, system-ui, sans-serif", visibility: scale ? "visible" : "hidden" }}>
      <div key={play} style={{ position: "absolute", left: 0, top: 0, width: DASH_W, height: DASH_H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {STATS.map((s, i) => <Stat key={s.label} s={s} i={i} go={go} reduce={reduce} />)}
        {/* the savings figure */}
        <div style={{ position: "absolute", left: 620, top: 608, width: 300, height: 110, background: "rgb(23,24,27)" }}>
          <div style={{ position: "absolute", left: 11, top: 6, fontSize: 98, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, color: "rgb(242,242,243)", fontVariantNumeric: "tabular-nums" }}>{money0(savings)}</div>
        </div>
        {/* where it went: the bars grow */}
        {WHERE.map((b, i) => (
          <div key={b.y} style={{ position: "absolute", left: 2344, top: b.y, width: 499, height: 8, borderRadius: 4, background: "rgb(40,41,45)", overflow: "hidden" }}>
            <motion.div
              style={{ position: "absolute", left: 0, top: 0, height: 8, width: b.w, borderRadius: 4, background: b.color, transformOrigin: "0 50%" }}
              initial={go && !reduce ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.42 + i * 0.06, ease: EASE }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Prosaic: the bars grow ---------- */

const CHART_W = 1884, CHART_H = 1030, FLOOR = 828; // the capture's pixels; the chart's zero line
const PAPER = "rgb(233,229,226)";
/* each bar's column and its top, in the capture (measured 2026-11-03) */
const BARS: [number, number, number][] = [
  [122, 205, 404], [230, 313, 410], [337, 421, 424], [445, 528, 432], [553, 636, 436], [661, 744, 442], [768, 852, 458], [876, 959, 506],
  [984, 1067, 506], [1092, 1175, 511], [1199, 1283, 526], [1307, 1390, 537], [1415, 1498, 552], [1523, 1606, 563], [1630, 1714, 589], [1738, 1821, 594],
];

export function ProsaicBars({ play }: { play: number }) {
  const reduce = !!useReducedMotion();
  const go = play > 0 && !reduce;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {BARS.map(([a, b, top], i) => (
        <motion.div
          key={`${play}-${a}`}
          style={{ position: "absolute", left: `${(a / CHART_W) * 100}%`, width: `${((b - a + 1) / CHART_W) * 100}%`, top: `${((top - 2) / CHART_H) * 100}%`, height: `${((FLOOR - top + 2) / CHART_H) * 100}%`, background: PAPER, transformOrigin: "50% 0%" }}
          initial={go ? { scaleY: 1 } : { scaleY: 0 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: go ? 0.45 + 0.5 * ((FLOOR - top) / 424) : 0, delay: go ? 0.08 + i * 0.035 : 0, ease: EASE }}
        />
      ))}
    </div>
  );
}
