"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/*
  THE CLOTHESLINE (Play, 2026-11-03).

  The play pieces hang on a line like washing. They start folded in a
  basket on the sky's hills; the filter you pick lifts the matching ones
  up onto the line, where each hangs from a peg under the rope's sag, and
  the rest drop back into the basket. Hovering a hung piece sets it
  swinging on its peg; clicking opens it large.

  The whole thing is a SCENE the height of the window, stuck to the top
  of the page: two poles planted on the front hill (93vh), the basket on
  the ground between them, and the line strung between the poles above.
  The ground never moves; when there are more rows than fit, the LINE
  scrolls (wheel, trackpad, touch) inside a band that ends just above
  the basket's handle, so no scroll puts a piece into the basket
  (Margaret, 2026-11-03), and the band fades at its ends. Scrolling past
  the line's end hands the wheel back to the page for the footer, which
  carries the scene and the hills up together.

  Geometry is computed, not laid out: the rope is a quadratic curve with
  a little sag and every piece's hang point is a point on it. A piece
  lives in the line group (hung) or the scene (folded); the move between
  them is a shared-layout flight on its `layoutId`. Reduced motion:
  pieces appear where they belong, nothing springs or sways.

  Everything structural is drawn in the sky's own language: glyphs on
  the sky's cell grid (9px Plex Mono, 11px rows). The scene canvas has
  the poles (= cap, || post, ==== feet on the ground), the basket's back
  (dotted inside, = handle); the line canvas, which scrolls with the
  rows, has the ropes stepping from - to _ as they sag, an o knot where
  each ties on, a peg (n over |) at every hang point; the front canvas,
  over the folded pieces, has the basket's front (a paper fill so they
  read as inside it, a staggered wicker of - and |, slanted sides, the
  rim).
*/

export type PlayItem = { src: string; w: number; h: number; group: string; alt?: string };

const HANG_H = 128;         // a hung piece's height on desktop
const HANG_H_SM = 92;       // on phones
const MAX_W = 230, MAX_W_SM = 150;
const GAP = 22;             // between pieces on the line
const ROW_GAP = 84;         // between rows, rope to rope
const ROPE_SAG = 26;
const TOP = 44;             // the first rope's ends, from the top of the line band
const BASKET_W = 400, BASKET_H = 150, HANDLE = 78;
const FLOOR_VH = 0.93;      // the ground: the front hill's line, as a share of the window
const FOLD = 0.55;          // a folded piece's size, as a share of its hung size
const FADE = 28;            // the band's fade at either end

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 1000) / 1000; };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Placed = { item: PlayItem; w: number; h: number; x: number; y: number; rot: number; hung: boolean; delay: number; peg: number };

function ropeY(rowTop: number, x: number, width: number) {
  const t = clamp(x / width, 0, 1);
  return rowTop + 2 * t * (1 - t) * ROPE_SAG;
}

/* ---------- the sky's cell, and a grid of glyphs on it ---------- */

const CELL_FONT = 9, CELL_H = 11; // the sky's 9px mono face, rows 1.18 of that (sky-field.js)
const SKY_FONT_FALLBACK = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const INK = "#111", WOOD = "#8a7350", WICKER = "#b39a6b", INSIDE = "#d9c7a4";

/* a sparse grid of glyphs; a later write to a cell replaces the earlier one */
class Grid {
  cells = new Map<number, { ch: string; color: string; back?: boolean }>();
  constructor(public cw: number, public ch: number, public cols: number) {}
  /* `back` paints the cell paper first, for a glyph that must cover what is under the canvas */
  set(c: number, r: number, ch: string, color: string, back = false) { if (c < 0 || r < 0 || c >= this.cols) return; this.cells.set(r * 100000 + c, { ch, color, back }); }
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
    for (const [k, v] of this.cells) {
      const x = (k % 100000) * this.cw, y = Math.floor(k / 100000) * this.ch;
      if (v.back) { ctx.fillStyle = "#fff"; ctx.fillRect(x, y, this.cw, this.ch); }
      ctx.fillStyle = v.color; ctx.fillText(v.ch, x, y);
    }
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
  const scene = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, filtersH: 40 });
  const [filter, setFilter] = useState<string>("All");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<PlayItem | null>(null);
  const [font, setFont] = useState(SKY_FONT_FALLBACK);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = scene.current; if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight, filtersH: filtersRef.current?.clientHeight ?? 40 });
    const ro = new ResizeObserver(measure);
    ro.observe(el); if (filtersRef.current) ro.observe(filtersRef.current); measure();
    return () => ro.disconnect();
  }, []);
  // the first lift happens a beat after the page is in
  useEffect(() => { const t = setTimeout(() => setMounted(true), reduce ? 0 : 500); return () => clearTimeout(t); }, [reduce]);
  // the sky's face, resolved from <body> like the sky itself does
  useEffect(() => {
    try { const f = getComputedStyle(document.body).getPropertyValue("--font-sky").trim(); if (f) setFont(`${f}, ${SKY_FONT_FALLBACK}`); } catch {}
  }, []);

  const { w: width, h: vh } = size;
  const small = width < 640;
  const H = small ? HANG_H_SM : HANG_H;
  const BW = Math.min(BASKET_W, Math.max(200, width - 90)); // between the poles on a phone
  /* the ground, the basket, and the band the line scrolls in */
  const floorY = Math.round(vh * FLOOR_VH);
  const rimY = floorY - BASKET_H;
  const lineTop = Math.round(vh * 0.17) + size.filtersH + 24;
  const lineBottom = rimY - HANDLE - 12;
  const bandH = Math.max(0, lineBottom - lineTop);

  const { placed, rows, linesH } = useMemo(() => {
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
    // the line's own height: its rows, in the band's coordinates
    const linesH = rowsOf.length ? TOP + (rowsOf.length - 1) * (H + ROW_GAP) + H + 16 : TOP;
    // the rest sit in the basket, small and turned, stacked toward its
    // middle, folded over the rim: the tops show above the basket's
    // front, the rest is behind it (scene coordinates)
    const rest = items.filter((it) => !sideOf.has(it.src));
    rest.forEach((it, i) => {
      const w = Math.min(maxW, H * (it.w / it.h)) * FOLD, h = H * FOLD;
      const spread = Math.min(rest.length - 1, 9) * 14;
      const cx = width / 2 + (rest.length > 1 ? (i / (rest.length - 1) - 0.5) * spread : 0) + (hash(it.src + "x") - 0.5) * 24;
      placed.push({ item: it, w, h, x: cx - w / 2, y: rimY - h * 0.55 + hash(it.src + "y") * 18, rot: (hash(it.src + "r") - 0.5) * 28, hung: false, delay: i * 0.03, peg: 0 });
    });
    return { placed, rows: rowsOf.length, linesH };
  }, [items, filter, width, mounted, small, H, rimY]);

  /* the line's scroll: how far the rows have been pulled up, 0 to maxScroll,
     eased by a spring; the group under the band moves by it */
  const maxScroll = Math.max(0, linesH - bandH);
  const offset = useMotionValue(0);
  const eased = useSpring(offset, reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 260, damping: 36, mass: 0.6 });
  const groupY = useTransform(eased, (v) => lineTop - v);
  useEffect(() => { if (offset.get() > maxScroll) offset.set(maxScroll); }, [maxScroll, offset]);
  const scrollLine = useCallback((dy: number) => {
    const next = clamp(offset.get() + dy, 0, maxScroll);
    const moved = next !== offset.get();
    if (moved) offset.set(next);
    return moved;
  }, [offset, maxScroll]);
  useEffect(() => {
    const el = scene.current; if (!el) return;
    // the wheel pulls the line until it ends, then falls through to the
    // page (the footer); coming back, the page returns to its top first
    const onWheel = (e: WheelEvent) => {
      if (open) return;
      if (e.deltaY < 0 && window.scrollY > 0) return;
      if (scrollLine(e.deltaY)) e.preventDefault();
    };
    let lastY: number | null = null;
    const onTouchStart = (e: TouchEvent) => { lastY = e.touches[0]?.clientY ?? null; };
    const onTouchMove = (e: TouchEvent) => {
      if (lastY == null || open) return;
      const y = e.touches[0]?.clientY ?? lastY, dy = lastY - y; lastY = y;
      if (dy < 0 && window.scrollY > 0) return;
      if (scrollLine(dy)) e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchmove", onTouchMove); };
  }, [scrollLine, open]);

  /* the glyphs: poles and basket on the scene, ropes and pegs on the line */
  useEffect(() => {
    const sc = sceneRef.current, line = lineRef.current, front = frontRef.current;
    if (!sc || !line || !front || width <= 0 || vh <= 0) return;
    let raf = 0;
    const render = () => {
      const sctx = sizeCanvas(sc, width, vh, font), lctx = sizeCanvas(line, width, linesH, font), fctx = sizeCanvas(front, width, vh, font);
      if (!sctx || !lctx || !fctx) return;
      const cw = sctx.measureText("M").width || CELL_FONT * 0.6, ch = CELL_H;
      const cols = Math.ceil(width / cw);
      const poleL = 1, poleR = cols - 3; // the inner columns are poleL + 1 and poleR

      // the scene: the poles planted on the ground, and the basket's back
      const g = new Grid(cw, ch, cols);
      const capR = Math.floor((lineTop - 2 * ch) / ch), footR = Math.floor(floorY / ch);
      for (const c of [poleL, poleR]) {
        for (let r = capR + 1; r < footR; r++) { g.set(c, r, "|", WOOD); g.set(c + 1, r, "|", WOOD); }
        for (let d = -1; d <= 2; d++) { g.set(c + d, capR, "=", WOOD); g.set(c + d, footR, "=", WOOD); }
      }
      const bx = width / 2, by = rimY;
      const [, r0] = g.at(bx, by), rN = Math.floor(floorY / ch);
      for (let r = r0 + 1; r < rN; r++) {
        const [l, rr] = basketEdge(bx, BW, (r - r0) / (rN - r0));
        const c0 = Math.ceil(l / cw) + 1, c1 = Math.floor(rr / cw) - 1;
        for (let c = c0; c <= c1; c++) if ((c + r) % 2 === 0) g.set(c, r, ".", INSIDE);
      }
      g.plot((t) => { const [l, rr] = basketEdge(bx, BW, 0); const xa = l + BW * 0.28, xb = rr - BW * 0.28, u = 1 - t; return [u * u * xa + 2 * u * t * bx + t * t * xb, u * u * by + 2 * u * t * (by - HANDLE) + t * t * by]; }, WOOD, 300, true);
      g.draw(sctx);

      // the line: ropes pole to pole, a knot on the pole where each ties
      // on (paper under it, since the pole is on the canvas beneath), a
      // peg at every hung piece
      const ln = new Grid(cw, ch, cols);
      const x0 = (poleL + 2) * cw, x1 = poleR * cw;
      for (let r = 0; r < Math.max(1, rows); r++) {
        const y = TOP + r * (H + ROW_GAP);
        ln.plot((t) => { const x = x0 + t * (x1 - x0); return [x, ropeY(y, x, width)]; }, INK, Math.ceil(width / 2));
        const [, kr] = ln.at(x0, y);
        ln.set(poleL + 1, kr, "o", WOOD, true); ln.set(poleR, kr, "o", WOOD, true);
      }
      for (const p of placed) {
        if (!p.hung) continue;
        const [c, r] = ln.at(p.peg, p.y - 8);
        ln.set(c, r - 1, "n", WOOD); ln.set(c, r, "|", WOOD); ln.set(c, r + 1, "|", WOOD);
      }
      ln.draw(lctx);

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
  }, [placed, rows, linesH, width, vh, H, font, BW, lineTop, rimY, floorY]);

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
      style={{ left: p.x, top: p.y, width: p.w, height: p.h, zIndex: p.hung ? 2 : 3 }}
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

  // the band's fade, at its top and just above the basket's handle
  const mask = `linear-gradient(to bottom, transparent ${lineTop - FADE}px, #000 ${lineTop}px, #000 ${lineBottom}px, transparent ${lineBottom + FADE}px)`;

  return (
    <div ref={scene} className="sticky top-0 h-screen w-full overflow-hidden" style={{ height: "100dvh" }}>
      {/* the filters: the line is the list, this is what you hang on it */}
      <div ref={filtersRef} className="absolute left-0 right-0 flex flex-wrap gap-2" style={{ top: "17vh", zIndex: 6 }} role="group" aria-label="Hang">
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

      {/* the poles on the ground and the basket's back, in glyphs */}
      <canvas ref={sceneRef} className="pointer-events-none absolute left-0 top-0" aria-hidden style={{ zIndex: 1 }} />

      {/* the line: ropes, pegs and the hung pieces, pulled up by the scroll
          inside a band that fades at its ends */}
      <motion.div className="absolute inset-0" style={{ zIndex: 2, maskImage: mask, WebkitMaskImage: mask }}>
        <motion.div className="absolute left-0 top-0 w-full" style={{ y: groupY, height: linesH }}>
          <canvas ref={lineRef} className="pointer-events-none absolute left-0 top-0" aria-hidden />
          {width > 0 && placed.filter((p) => p.hung).map(piece)}
        </motion.div>
      </motion.div>

      {/* the folded pieces, then the basket's front over them */}
      {width > 0 && placed.filter((p) => !p.hung).map(piece)}
      <canvas ref={frontRef} className="pointer-events-none absolute left-0 top-0" aria-hidden style={{ zIndex: 4 }} />

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
