"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
  THE CLOTHESLINE (Play, 2026-11-03).

  The play pieces hang on a line like washing. They start folded in a
  basket that sits on the sky's hills at the foot of the window; the
  filter you pick lifts the matching ones up onto the line, where each
  hangs from a peg under the rope's sag, and the rest drop back into the
  basket. On a wide window the line runs in as many rows as the pieces
  need. Hovering a hung piece sets it swinging on its peg; clicking opens
  it large.

  Geometry is computed, not laid out: the rope is a quadratic curve with
  a little sag and every piece's hang point is a point on it. The basket
  is a STICKY layer at the end of the stage, pinned so its floor sits on
  the front hill (93vh) while the line scrolls behind it, and scrolling
  away with the stage's end. The poles' feet are in that layer too, so
  they stand on the hill with it; their posts run on up the stage. A piece lives in whichever of the two it
  belongs to; the move between them is a shared-layout flight on its
  `layoutId` (Motion measures both in window space, so a piece lifts from
  the pinned basket to wherever its row is). Reduced motion: pieces
  appear where they belong, nothing springs or sways.

  The rope, the pegs, the poles and the basket are drawn in the sky's
  own language: glyphs on the sky's cell grid (9px Plex Mono, 11px
  rows). The stage canvas, under the hung pieces, carries the poles at
  either end (= cap, || post, an o knot where each rope ties on) and the
  ropes between them stepping from - to _ as they sag, with a peg (n over
  |) at every hang point. The basket layer has two: its back (the poles'
  lower run and = feet, the dotted inside, the = handle) under the folded
  pieces, and its front over them (a paper fill so they read as inside
  it, a staggered wicker of - and |, slanted sides, the rim).
*/

export type PlayItem = { src: string; w: number; h: number; group: string; alt?: string };

const HANG_H = 128;         // a hung piece's height on desktop
const HANG_H_SM = 92;       // on phones
const MAX_W = 230, MAX_W_SM = 150;
const GAP = 22;             // between pieces on the line
const ROW_GAP = 84;         // between rows, rope to rope
const ROPE_SAG = 26;
const TOP = 96;             // the first rope's ends, from the top of the stage
const BASKET_W = 400, BASKET_H = 150;
const RIM = 110;            // the rim's y inside the basket layer (handle and folded tops above it)
const FLOOR_Y = RIM + BASKET_H; // the basket's floor and the poles' feet, inside the layer
const FLOOR_VH = 0.93;      // the floor, as a share of the window: on the front hill
// the layer runs on under the feet to the window's bottom (7vh, at least a
// glyph row), with paper under each foot so the stage's posts stop there
const FOLD = 0.55;          // a folded piece's size, as a share of its hung size

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 1000) / 1000; };

type Placed = { item: PlayItem; w: number; h: number; x: number; y: number; rot: number; hung: boolean; delay: number; peg: number };

function ropeY(rowTop: number, x: number, width: number) {
  const t = Math.min(1, Math.max(0, x / width));
  return rowTop + 2 * t * (1 - t) * ROPE_SAG;
}

/* ---------- the sky's cell, and a grid of glyphs on it ---------- */

const CELL_FONT = 9, CELL_H = 11; // the sky's 9px mono face, rows 1.18 of that (sky-field.js)
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

/* the basket's trapezoid: its left and right x at a row's share k (0 rim, 1 floor) */
const basketEdge = (bx: number, bw: number, k: number) => [bx - bw / 2 + 28 * k, bx + bw / 2 - 28 * k] as const;

export default function Clothesline({ items, groups }: { items: PlayItem[]; groups: string[] }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [floorMin, setFloorMin] = useState(0); // the stage height that puts the basket's floor on the hill
  const [under, setUnder] = useState(14);      // the layer's run under the feet, to the window's bottom
  const [filter, setFilter] = useState<string>("All");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<PlayItem | null>(null);
  const [font, setFont] = useState(SKY_FONT_FALLBACK);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = stage.current; if (!el) return;
    const measure = () => {
      setWidth(el.clientWidth);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const u = Math.max(14, Math.ceil(window.innerHeight * (1 - FLOOR_VH)));
      setUnder(u);
      setFloorMin(Math.max(0, window.innerHeight * FLOOR_VH - top + u));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el); measure();
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  // the first lift happens a beat after the page is in
  useEffect(() => { const t = setTimeout(() => setMounted(true), reduce ? 0 : 500); return () => clearTimeout(t); }, [reduce]);
  // the sky's face, resolved from <body> like the sky itself does
  useEffect(() => {
    try { const f = getComputedStyle(document.body).getPropertyValue("--font-sky").trim(); if (f) setFont(`${f}, ${SKY_FONT_FALLBACK}`); } catch {}
  }, []);

  const small = width < 640;
  const H = small ? HANG_H_SM : HANG_H;
  const LAYER_H = FLOOR_Y + under;
  const BW = Math.min(BASKET_W, Math.max(200, width - 90)); // between the poles on a phone

  const { placed, rows, height } = useMemo(() => {
    const maxW = small ? MAX_W_SM : MAX_W;
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
        const p: Placed = { item: it, w, h: H, x: cx - w / 2, y: ropeY(rowTop, cx, width) + 8, rot: (hash(it.src) - 0.5) * 5, hung: true, delay: (r * 6 + i) * 0.06, peg: cx };
        placed.push(p); sideOf.set(it.src, p); x += w + GAP;
      });
    });
    const linesH = rowsOf.length ? TOP + (rowsOf.length - 1) * (H + ROW_GAP) + H + 40 : TOP;
    // the stage holds the rows, then the basket layer; at least tall enough
    // for the pinned basket to reach the hill
    const height = Math.max(linesH + LAYER_H, floorMin);
    // the rest sit in the basket, small and turned, stacked toward its
    // middle; positions are inside the basket layer, folded over the rim:
    // the tops show above the basket's front, the rest is behind it
    const rest = items.filter((it) => !sideOf.has(it.src));
    rest.forEach((it, i) => {
      const w = Math.min(maxW, H * (it.w / it.h)) * FOLD, h = H * FOLD;
      const spread = Math.min(rest.length - 1, 9) * 14;
      const cx = width / 2 + (rest.length > 1 ? (i / (rest.length - 1) - 0.5) * spread : 0) + (hash(it.src + "x") - 0.5) * 24;
      placed.push({ item: it, w, h, x: cx - w / 2, y: RIM - h * 0.55 + hash(it.src + "y") * 18, rot: (hash(it.src + "r") - 0.5) * 28, hung: false, delay: i * 0.03, peg: 0 });
    });
    return { placed, rows: rowsOf.length, height };
  }, [items, filter, width, mounted, small, H, floorMin, LAYER_H]);

  /* the poles, ropes and pegs on the stage; the basket in its layer */
  useEffect(() => {
    const line = lineRef.current, back = backRef.current, front = frontRef.current;
    if (!line || !back || !front || width <= 0) return;
    let raf = 0;
    const render = () => {
      const lctx = sizeCanvas(line, width, height, font), bctx = sizeCanvas(back, width, LAYER_H, font), fctx = sizeCanvas(front, width, LAYER_H, font);
      if (!lctx || !bctx || !fctx) return;
      const cw = lctx.measureText("M").width || CELL_FONT * 0.6, ch = CELL_H;
      const cols = Math.ceil(width / cw);

      const g = new Grid(cw, ch, cols);
      // the poles at either end: a = cap, a || post running down the
      // stage (the feet are in the basket layer), and an o knot on the
      // inner face where each rope ties on
      const poleL = 1, poleR = cols - 3; // the inner columns are poleL + 1 and poleR
      const capR = Math.floor((TOP - 3 * ch) / ch), lastR = Math.floor(height / ch);
      for (const c of [poleL, poleR]) {
        for (let r = capR + 1; r <= lastR; r++) { g.set(c, r, "|", WOOD); g.set(c + 1, r, "|", WOOD); }
        for (let d = -1; d <= 2; d++) g.set(c + d, capR, "=", WOOD);
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
      g.draw(lctx);

      // the basket's back: its inside, dotted, and the handle over it;
      // the poles' lower run beside it, standing on = feet level with
      // the floor (their stage posts continue under the same columns)
      const bx = width / 2, by = RIM;
      const b = new Grid(cw, ch, cols);
      const [, r0] = b.at(bx, by), rN = Math.floor(FLOOR_Y / ch);
      bctx.fillStyle = "#fff";
      for (const c of [poleL, poleR]) {
        for (let r = 0; r < rN; r++) { b.set(c, r, "|", WOOD); b.set(c + 1, r, "|", WOOD); }
        for (let d = -1; d <= 2; d++) b.set(c + d, rN, "=", WOOD);
        bctx.fillRect((c - 1) * cw, (rN + 1) * ch - 2, 4 * cw, LAYER_H); // paper under the foot
      }
      for (let r = r0 + 1; r < rN; r++) {
        const [l, rr] = basketEdge(bx, BW, (r - r0) / (rN - r0));
        const c0 = Math.ceil(l / cw) + 1, c1 = Math.floor(rr / cw) - 1;
        for (let c = c0; c <= c1; c++) if ((c + r) % 2 === 0) b.set(c, r, ".", INSIDE);
      }
      b.plot((t) => { const [l, rr] = basketEdge(bx, BW, 0); const xa = l + BW * 0.28, xb = rr - BW * 0.28, u = 1 - t; return [u * u * xa + 2 * u * t * bx + t * t * xb, u * u * by + 2 * u * t * (by - 78) + t * t * by]; }, WOOD, 300, true);
      b.draw(bctx);

      // the basket's front: paper under a wicker, slanted sides, the rim
      const f = new Grid(cw, ch, cols);
      fctx.fillStyle = "#fff";
      fctx.beginPath();
      { const [l0, r0x] = basketEdge(bx, BW, 0), [l1, r1x] = basketEdge(bx, BW, 1);
        fctx.moveTo(l0, by); fctx.lineTo(l1, by + BASKET_H); fctx.lineTo(r1x, by + BASKET_H); fctx.lineTo(r0x, by); fctx.closePath(); fctx.fill(); }
      for (let r = r0 + 1; r <= rN; r++) {
        const [l, rr] = basketEdge(bx, BW, (r - r0) / (rN - r0));
        const c0 = Math.ceil(l / cw), c1 = Math.floor(rr / cw);
        for (let c = c0; c <= c1; c++) {
          const stake = (c + (r % 2 ? 2 : 0)) % 4 === 0;
          f.set(c, r, r === rN ? "=" : stake ? "|" : "-", r === rN ? WOOD : WICKER);
        }
      }
      f.plot((t) => [basketEdge(bx, BW, t)[0], by + BASKET_H * t], WOOD, 200);
      f.plot((t) => [basketEdge(bx, BW, t)[1], by + BASKET_H * t], WOOD, 200);
      { const [l, rr] = basketEdge(bx, BW, 0); const cA = Math.floor(l / cw) - 1, cB = Math.ceil(rr / cw) + 1;
        for (let c = cA; c <= cB; c++) f.set(c, r0, c === cA ? "(" : c === cB ? ")" : "=", WOOD); }
      f.draw(fctx);
    };
    // fonts may land after the first paint: draw now, and again once they are ready
    render();
    if (document.fonts?.ready) document.fonts.ready.then(() => { raf = requestAnimationFrame(render); });
    return () => cancelAnimationFrame(raf);
  }, [placed, rows, width, height, H, font, LAYER_H, BW]);

  const flight = (p: Placed) => reduce ? { duration: 0 } : p.hung
    ? { type: "spring" as const, stiffness: 110, damping: 15, mass: 0.9, delay: p.delay }
    : { type: "spring" as const, stiffness: 160, damping: 13, mass: 0.8, delay: p.delay };

  /* a piece, hung or folded: the outer div is the one Motion flies (its
     layoutId is shared between the two homes), the inner one turns on
     its peg and swings on hover */
  const piece = (p: Placed) => (
    <motion.div
      key={p.item.src}
      layoutId={p.item.src}
      layout
      initial={false}
      transition={{ layout: flight(p) }}
      className="absolute cursor-pointer"
      style={{ left: p.x, top: p.y, width: p.w, height: p.h, zIndex: p.hung ? 3 : 2 }}
      onClick={() => p.hung && setOpen(p.item)}
      role={p.hung ? "button" : undefined}
      tabIndex={p.hung ? 0 : -1}
      aria-label={p.hung ? `Open ${p.item.alt || p.item.group}` : undefined}
      onKeyDown={(e) => { if (p.hung && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(p.item); } }}
    >
      <motion.div
        className="h-full w-full"
        style={{ transformOrigin: "top center" }}
        initial={false}
        animate={{ rotate: p.rot }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 14, delay: p.delay }}
        whileHover={p.hung && !reduce ? { rotate: [p.rot, p.rot + 6, p.rot - 5, p.rot + 3, p.rot - 1, p.rot], transition: { duration: 1.4, ease: "easeInOut" } } : undefined}
      >
        <Image
          src={p.item.src}
          alt={p.item.alt ?? ""}
          width={p.item.w}
          height={p.item.h}
          sizes={p.hung ? "240px" : "140px"}
          className="block h-full w-full rounded-[3px] object-cover shadow-[0_8px_26px_rgba(0,0,0,0.12)]"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );

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
        {/* the poles, ropes and pegs, in glyphs, under the hung pieces */}
        <canvas ref={lineRef} className="pointer-events-none absolute left-0 top-0" aria-hidden />

        {/* the hung pieces */}
        {width > 0 && placed.filter((p) => p.hung).map(piece)}

        {/* the basket layer: in the stage's flow, pinned so its floor sits
            on the front hill, scrolling away with the stage's end */}
        <div
          className="sticky w-full"
          style={{ top: `calc(${FLOOR_VH * 100}vh - ${FLOOR_Y}px)`, height: LAYER_H, zIndex: 5 }}
        >
          <canvas ref={backRef} className="pointer-events-none absolute left-0 top-0" aria-hidden />
          {width > 0 && placed.filter((p) => !p.hung).map(piece)}
          <canvas ref={frontRef} className="pointer-events-none absolute left-0 top-0" aria-hidden style={{ zIndex: 4 }} />
        </div>
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
