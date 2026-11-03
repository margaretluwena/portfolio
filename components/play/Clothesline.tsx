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

  The rope, the pegs and the basket are drawn in the sky's own language
  (Margaret, 2026-11-03): glyphs on the sky's cell grid (9px Plex Mono,
  11px rows), on two canvases. The back one, under the pieces, carries the
  ropes stepping from - to _ as they sag, a peg (n over |) at every
  hang point, the basket's handle and the dotted inside of its back. The
  front one, over the folded pieces, is the basket's front: a paper fill
  so the pieces read as inside it, a staggered wicker of - and | over it,
  its slanted sides, and the rim. A pole stands at either end (= cap, ||
  post down to the basket's floor, an o knot where each rope ties on),
  and the ropes run pole to pole.
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

/* the sky's cell: its 9px mono face, rows 1.18 of that (sky-field.js) */
const CELL_FONT = 9, CELL_H = 11;
const SKY_FONT_FALLBACK = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const INK = "#111", WOOD = "#8a7350", WICKER = "#b39a6b", INSIDE = "#d9c7a4";

/* a sparse grid of glyphs; a later write to a cell replaces the earlier one */
class Grid {
  cells = new Map<number, { ch: string; color: string }>();
  constructor(public cw: number, public ch: number, public cols: number) {}
  set(c: number, r: number, ch: string, color: string) { if (c < 0 || r < 0 || c >= this.cols) return; this.cells.set(r * 100000 + c, { ch, color }); }
  at(x: number, y: number) { return [Math.floor(x / this.cw), Math.floor(y / this.ch)] as const; }
  /* a curve, one glyph per cell it crosses, picked by its slope there:
     flat runs step from - to _ as the line drops through the cell (= all
     the way when heavy), slants are / and \, the steep bits | */
  plot(f: (t: number) => [number, number], color: string, n = 600, heavy = false) {
    let prev = f(0);
    for (let i = 1; i <= n; i++) {
      const [x, y] = f(i / n), dx = x - prev[0], dy = y - prev[1];
      const [c, r] = this.at(x, y);
      const s = Math.abs(dx) < 1e-6 ? 99 : (dy / dx) * (this.cw / this.ch);
      let ch: string;
      if (Math.abs(s) > 2.2) ch = "|";
      else if (Math.abs(s) > 0.28) ch = s > 0 ? "\\" : "/";
      else if (heavy) ch = "=";
      else ch = (y - r * this.ch) / this.ch < 0.5 ? "-" : "_";
      this.set(c, r, ch, color);
      prev = [x, y];
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const [k, v] of this.cells) { ctx.fillStyle = v.color; ctx.fillText(v.ch, (k % 100000) * this.cw, Math.floor(k / 100000) * this.ch); }
  }
}

function sizeCanvas(canvas: HTMLCanvasElement, w: number, h: number, font: string) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d"); if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = `${CELL_FONT}px ${font}`; ctx.textBaseline = "top";
  return ctx;
}

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
  const [font, setFont] = useState(SKY_FONT_FALLBACK);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  // the sky's face, resolved from <body> like the sky itself does
  useEffect(() => {
    try { const f = getComputedStyle(document.body).getPropertyValue("--font-sky").trim(); if (f) setFont(`${f}, ${SKY_FONT_FALLBACK}`); } catch {}
  }, []);

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

  /* the ropes, pegs and basket, in glyphs */
  useEffect(() => {
    const back = backRef.current, front = frontRef.current;
    if (!back || !front || width <= 0) return;
    let raf = 0;
    const render = () => {
      const bctx = sizeCanvas(back, width, height, font), fctx = sizeCanvas(front, width, height, font);
      if (!bctx || !fctx) return;
      const cw = bctx.measureText("M").width || CELL_FONT * 0.6, ch = CELL_H;
      const cols = Math.ceil(width / cw);
      const H = small ? HANG_H_SM : HANG_H;
      const g = new Grid(cw, ch, cols);

      // the poles at either end: a = cap, a || post down to the basket's
      // floor, and an o knot on the inner face where each rope ties on
      const poleL = 1, poleR = cols - 3; // the inner columns are poleL + 1 and poleR
      const capR = Math.floor((TOP - 3 * ch) / ch), footR = Math.floor((basketTop + BASKET_H) / ch);
      for (const c of [poleL, poleR]) {
        for (let r = capR + 1; r <= footR; r++) { g.set(c, r, "|", WOOD); g.set(c + 1, r, "|", WOOD); }
        for (let d = -1; d <= 2; d++) { g.set(c + d, capR, "=", WOOD); g.set(c + d, footR, "=", WOOD); }
      }
      // the ropes, pole to pole
      const x0 = (poleL + 2) * cw, x1 = poleR * cw;
      for (let r = 0; r < Math.max(1, rows); r++) {
        const y = TOP + r * (H + ROW_GAP);
        g.plot((t) => { const x = x0 + t * (x1 - x0); return [x, ropeY(y, x, width)]; }, INK, Math.ceil(width / 2));
        const [, kr] = g.at(x0, y);
        g.set(poleL + 1, kr, "o", WOOD); g.set(poleR, kr, "o", WOOD);
      }
      // a peg on the rope at every hung piece
      for (const p of placed) {
        if (!p.hung) continue;
        const [c, r] = g.at(p.peg, p.y - 8);
        g.set(c, r - 1, "n", WOOD); g.set(c, r, "|", WOOD); g.set(c, r + 1, "|", WOOD);
      }
      // the basket's back: its inside, dotted, and the handle over it
      const bx = width / 2, by = basketTop;
      const [, r0] = g.at(bx, by), rN = Math.floor((by + BASKET_H) / ch);
      for (let r = r0 + 1; r < rN; r++) {
        const k = (r - r0) / (rN - r0), inset = 28 * k;
        const c0 = Math.ceil((bx - BASKET_W / 2 + inset) / cw) + 1, c1 = Math.floor((bx + BASKET_W / 2 - inset) / cw) - 1;
        for (let c = c0; c <= c1; c++) if ((c + r) % 2 === 0) g.set(c, r, ".", INSIDE);
      }
      g.plot((t) => { const x0 = bx - BASKET_W * 0.22, x1 = bx + BASKET_W * 0.22; const u = 1 - t; return [u * u * x0 + 2 * u * t * bx + t * t * x1, u * u * by + 2 * u * t * (by - 78) + t * t * by]; }, WOOD, 300, true);
      g.draw(bctx);

      // the basket's front: paper under a wicker, slanted sides, the rim
      const f = new Grid(cw, ch, cols);
      fctx.fillStyle = "#fff";
      fctx.beginPath();
      fctx.moveTo(bx - BASKET_W / 2, by); fctx.lineTo(bx - BASKET_W / 2 + 28, by + BASKET_H); fctx.lineTo(bx + BASKET_W / 2 - 28, by + BASKET_H); fctx.lineTo(bx + BASKET_W / 2, by); fctx.closePath(); fctx.fill();
      for (let r = r0 + 1; r <= rN; r++) {
        const k = (r - r0) / (rN - r0), inset = 28 * k;
        const c0 = Math.ceil((bx - BASKET_W / 2 + inset) / cw), c1 = Math.floor((bx + BASKET_W / 2 - inset) / cw);
        for (let c = c0; c <= c1; c++) {
          const stake = (c + (r % 2 ? 2 : 0)) % 4 === 0;
          f.set(c, r, r === rN ? "=" : stake ? "|" : "-", r === rN ? WOOD : WICKER);
        }
      }
      f.plot((t) => [bx - BASKET_W / 2 + 28 * t, by + BASKET_H * t], WOOD, 200);
      f.plot((t) => [bx + BASKET_W / 2 - 28 * t, by + BASKET_H * t], WOOD, 200);
      { const cA = Math.floor((bx - BASKET_W / 2) / cw) - 1, cB = Math.ceil((bx + BASKET_W / 2) / cw) + 1;
        for (let c = cA; c <= cB; c++) f.set(c, r0, c === cA ? "(" : c === cB ? ")" : "=", WOOD); }
      f.draw(fctx);
    };
    // fonts may land after the first paint: draw now, and again once they are ready
    render();
    if (document.fonts?.ready) document.fonts.ready.then(() => { raf = requestAnimationFrame(render); });
    return () => cancelAnimationFrame(raf);
  }, [placed, rows, width, height, basketTop, small, font]);

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
        {/* the ropes, pegs and the basket's back, in glyphs, under the pieces */}
        <canvas ref={backRef} className="pointer-events-none absolute left-0 top-0" aria-hidden />

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
        <canvas ref={frontRef} className="pointer-events-none absolute left-0 top-0" aria-hidden style={{ zIndex: 4 }} />
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
