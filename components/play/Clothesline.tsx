"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
  THE CLOTHESLINE (Play, 2026-11-03).

  The play pieces hang on a line like washing. They start folded in a
  basket at the foot of the page; the filter you pick lifts the matching
  ones up onto the line, where each hangs from a peg under the rope's
  sag, and the rest drop back into the basket. On a wide window the line
  runs in as many rows as the pieces need. Hovering a hung piece sets it
  swinging on its peg; clicking opens it large.

  Geometry is computed, not laid out: the rope is a quadratic curve with
  a little sag, every piece's hang point is a point on it, and the basket
  is a stack of small, slightly turned copies behind the basket's front.
  Reduced motion: pieces appear where they belong, nothing springs or sways.
*/

export type PlayItem = { src: string; w: number; h: number; group: string; alt?: string };

const HANG_H = 176;         // a hung piece's height on desktop
const HANG_H_SM = 124;      // on phones
const MAX_W = 320;
const GAP = 30;             // between pieces on the line
const ROW_GAP = 104;        // between rows, rope to rope
const ROPE_SAG = 26;
const TOP = 110;            // the first rope's ends, from the top of the stage
const BASKET_W = 400, BASKET_H = 150;
const EASE = [0.22, 1, 0.36, 1] as const;

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 1000) / 1000; };

type Placed = { item: PlayItem; w: number; h: number; x: number; y: number; rot: number; hung: boolean; delay: number; peg: number };

function ropeY(rowTop: number, x: number, width: number) {
  const t = Math.min(1, Math.max(0, x / width));
  return rowTop + 2 * t * (1 - t) * ROPE_SAG;
}

export default function Clothesline({ items, groups }: { items: PlayItem[]; groups: string[] }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [filter, setFilter] = useState<string>("All");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<PlayItem | null>(null);

  useLayoutEffect(() => {
    const el = stage.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el); setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  // the first lift happens a beat after the page is in
  useEffect(() => { const t = setTimeout(() => setMounted(true), reduce ? 0 : 500); return () => clearTimeout(t); }, [reduce]);

  const { placed, rows, height } = useMemo(() => {
    const small = width < 640;
    const H = small ? HANG_H_SM : HANG_H;
    const maxW = small ? 200 : MAX_W;
    const hung = mounted ? items.filter((it) => filter === "All" || it.group === filter) : [];
    // pack the hung pieces into rows, left to right
    const rowsOf: { items: PlayItem[]; widths: number[]; total: number }[] = [];
    for (const it of hung) {
      const w = Math.min(maxW, H * (it.w / it.h));
      const row = rowsOf[rowsOf.length - 1];
      if (row && row.total + GAP + w <= width) { row.items.push(it); row.widths.push(w); row.total += GAP + w; }
      else rowsOf.push({ items: [it], widths: [w], total: w });
    }
    const placed: Placed[] = [];
    const sideOf = new Map<string, Placed>();
    rowsOf.forEach((row, r) => {
      const rowTop = TOP + r * (H + ROW_GAP);
      let x = (width - row.total) / 2;
      row.items.forEach((it, i) => {
        const w = row.widths[i], cx = x + w / 2;
        const p: Placed = { item: it, w, h: H, x: cx - w / 2, y: ropeY(rowTop, cx, width) + 8, rot: (hash(it.src) - 0.5) * 5, hung: true, delay: (r * 6 + i) * 0.07, peg: cx };
        placed.push(p); sideOf.set(it.src, p); x += w + GAP;
      });
    });
    const linesH = rowsOf.length ? TOP + (rowsOf.length - 1) * (H + ROW_GAP) + H + 40 : TOP;
    const basketTop = Math.max(linesH + 60, small ? 420 : 520);
    const height = basketTop + BASKET_H + 60;
    // the rest sit in the basket, small and turned, stacked toward its middle
    const rest = items.filter((it) => !sideOf.has(it.src));
    rest.forEach((it, i) => {
      const w = Math.min(maxW, H * (it.w / it.h)) * 0.42, h = H * 0.42;
      const spread = Math.min(rest.length - 1, 9) * 14;
      const cx = width / 2 + (rest.length > 1 ? (i / (rest.length - 1) - 0.5) * spread : 0) + (hash(it.src + "x") - 0.5) * 24;
      // folded over the rim: the tops show above the basket's front, the rest is behind it
      placed.push({ item: it, w, h, x: cx - w / 2, y: basketTop - h * 0.55 + (hash(it.src + "y") * 18), rot: (hash(it.src + "r") - 0.5) * 28, hung: false, delay: i * 0.03, peg: 0 });
    });
    return { placed, rows: rowsOf.length, height, basketTop, H };
  }, [items, filter, width, mounted]);

  const basketTop = height - BASKET_H - 60;
  const small = width < 640;

  return (
    <div className="relative">
      {/* the filters: the line is the list, this is what you hang on it */}
      <div className="mb-2 flex flex-wrap gap-2" role="group" aria-label="Hang">
        {["All", ...groups].map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={filter === g}
            onClick={() => setFilter(g)}
            className={`rounded-full border px-[12px] py-[6px] text-label uppercase tracking-[0.06em] transition-colors ${filter === g ? "border-ink bg-ink text-paper" : "border-black/[0.12] bg-white/70 text-ink/60 hover:text-ink"}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div ref={stage} className="relative w-full" style={{ height }}>
        {/* the ropes, one per row, with the pegs */}
        {width > 0 && (
          <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden>
            <defs>
              <pattern id="weave" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="10" height="10" fill="#e8dcc6" />
                <path d="M0 5h10" stroke="#c9b58f" strokeWidth="2.2" />
              </pattern>
            </defs>
            {Array.from({ length: Math.max(1, rows) }).map((_, r) => {
              const y = TOP + r * ((small ? HANG_H_SM : HANG_H) + ROW_GAP);
              return (
                <g key={r}>
                  <path d={`M0 ${y} Q ${width / 2} ${y + ROPE_SAG * 2} ${width} ${y}`} fill="none" stroke="#2b2b2b" strokeWidth="1.6" />
                  <path d={`M0 ${y} Q ${width / 2} ${y + ROPE_SAG * 2} ${width} ${y}`} fill="none" stroke="#2b2b2b" strokeWidth="1" strokeDasharray="2 5" opacity="0.5" transform="translate(0 2)" />
                </g>
              );
            })}
            {placed.filter((p) => p.hung).map((p) => (
              <g key={p.item.src} transform={`translate(${p.peg} ${p.y - 8}) rotate(${p.rot})`}>
                <rect x="-4" y="-10" width="8" height="24" rx="2.5" fill="#d9c7a4" stroke="#8a7350" strokeWidth="1" />
                <path d="M-4 2h8" stroke="#8a7350" strokeWidth="1" />
              </g>
            ))}
            {/* the basket's back */}
            <g transform={`translate(${width / 2} ${basketTop})`}>
              <path d={`M${-BASKET_W / 2} 0 L${-BASKET_W / 2 + 28} ${BASKET_H} L${BASKET_W / 2 - 28} ${BASKET_H} L${BASKET_W / 2} 0 Z`} fill="#efe6d3" stroke="#8a7350" strokeWidth="1.2" />
              <path d={`M${-BASKET_W * 0.22} 0 Q 0 -78 ${BASKET_W * 0.22} 0`} fill="none" stroke="#8a7350" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
        )}

        {/* the pieces */}
        {placed.map((p) => (
          <motion.div
            key={p.item.src}
            className="absolute left-0 top-0 cursor-pointer"
            style={{ width: p.w, height: p.h, transformOrigin: "top center", zIndex: p.hung ? 3 : 2 }}
            initial={false}
            animate={{ x: p.x, y: p.y, rotate: p.rot, opacity: 1 }}
            transition={reduce ? { duration: 0 } : p.hung
              ? { type: "spring", stiffness: 110, damping: 15, mass: 0.9, delay: p.delay }
              : { type: "spring", stiffness: 160, damping: 13, mass: 0.8, delay: p.delay }}
            whileHover={p.hung && !reduce ? { rotate: [p.rot, p.rot + 6, p.rot - 5, p.rot + 3, p.rot - 1, p.rot], transition: { duration: 1.4, ease: "easeInOut" } } : undefined}
            onClick={() => p.hung && setOpen(p.item)}
            role={p.hung ? "button" : undefined}
            tabIndex={p.hung ? 0 : -1}
            aria-label={p.hung ? `Open ${p.item.alt || p.item.group}` : undefined}
            onKeyDown={(e) => { if (p.hung && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(p.item); } }}
          >
            <Image
              src={p.item.src}
              alt={p.item.alt ?? ""}
              width={p.item.w}
              height={p.item.h}
              sizes={p.hung ? "320px" : "140px"}
              className="block h-full w-full rounded-[3px] object-cover shadow-[0_8px_26px_rgba(0,0,0,0.12)]"
              draggable={false}
            />
          </motion.div>
        ))}

        {/* the basket's front, over the folded pieces */}
        {width > 0 && (
          <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden style={{ zIndex: 4 }}>
            <g transform={`translate(${width / 2} ${basketTop})`}>
              <path d={`M${-BASKET_W / 2} 0 L${-BASKET_W / 2 + 28} ${BASKET_H} L${BASKET_W / 2 - 28} ${BASKET_H} L${BASKET_W / 2} 0 Z`} fill="url(#weave)" stroke="#8a7350" strokeWidth="1.2" />
              <rect x={-BASKET_W / 2 - 6} y="-8" width={BASKET_W + 12} height="16" rx="6" fill="#d9c7a4" stroke="#8a7350" strokeWidth="1.2" />
            </g>
          </svg>
        )}
      </div>

      {/* the piece, large */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            onClick={() => setOpen(null)}
            role="dialog" aria-modal="true" aria-label={open.alt || open.group}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="max-h-[86vh] max-w-[92vw]"
              style={{ aspectRatio: `${open.w} / ${open.h}`, width: `min(92vw, calc(86vh * ${open.w / open.h}))` }}
            >
              <Image src={open.src} alt={open.alt ?? ""} width={open.w} height={open.h} sizes="92vw" className="block h-full w-full rounded-[4px] object-contain shadow-[0_30px_80px_rgba(0,0,0,0.35)]" priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
