"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion, motionValue, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";

/*
  THE CLOTHESLINE (Play, 2026-11-03).

  The play pieces hang on a line like washing. They start folded in a
  basket on the sky's hills; the filter you pick lifts the matching ones
  up onto the line, where each hangs from a peg under the rope's sag, and
  the rest drop back into the basket. Hovering a hung piece sets it
  swinging on its peg; clicking opens it large.

  The whole thing is a SCENE the height of the window, a FIXED layer
  that rides up by --sky-lift exactly as the sky does when the footer
  scrolls in (the page is sized so the footer enters on the first pixel
  of scroll), so the poles and the basket never leave the hills
  (Margaret, 2026-11-03: "keep the poles and basket stuck to the
  floor"; a sticky scene moved ahead of them through the footer's top
  margin): two poles planted on the front hill (93vh), the basket on
  the ground at the right, a welcome line standing on the ground at the
  left with the filters as pills inside its sentence ("This is where
  (all) my smaller things are, including (graphics) and (ui/ux)...",
  Margaret, 2026-11-03), and the line strung between the poles above.
  The ground never moves; when there are more rows than fit, the LINE
  scrolls (wheel, trackpad, touch) inside a band that ends just above
  the basket's handle, so no scroll puts a piece into the basket
  (Margaret, 2026-11-03), and the band fades at an end only while the
  line runs on past it. Scrolling past
  the line's end hands the wheel back to the page for the footer, which
  carries the scene and the hills up together.

  Geometry is computed, not laid out: the rope is a quadratic curve with
  a little sag and every piece's hang point is a point on it. Each hung
  piece is a little PENDULUM on its peg (Margaret, 2026-11-03): a damped
  swing, linked to its neighbours on the rope so a push spreads along
  the line, nudged by the pointer as it passes (its sideways motion is
  the push, so brushing back and forth pumps the swing), and leaned on
  by a GUST that travels across the line every six to fifteen seconds.
  One frame loop writes every piece's angle to a motion value. The rows
  hang in a column, each line strung just under the hem of the one
  above, clear of it (Margaret, 2026-11-03, after trying them overlapped
  in depth: "no more overlap"). A piece lives in the line group (hung)
  or the scene (folded); the move between
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
const HANG_H_SM = 100;      // on phones
const MAX_W = 230, MAX_W_SM = 150;
const GAP = 22, GAP_SM = 12;          // between pieces on the line
const ROW_GAP = 28, ROW_GAP_SM = 18;  // from a row's hem to the next rope below it: the lines hang clear of each other
const ROPE_SAG = 26;
const TOP = 44, TOP_SM = 24;          // the first rope's ends, from the top of the line band
const BASKET_W = 320, BASKET_H = 106, HANDLE = 64; // smaller again (Margaret, 2026-11-03): nine rows of wicker
const FLOOR_VH = 0.93;      // the ground: the front hill's line, as a share of the window
const FOLD_H = 60, FOLD_H_SM = 46; // a folded piece's height in the basket
const H_MIN = 72, H_MIN_SM = 80;    // how small the hung pieces may go to fit the band (phones keep them readable and let the line scroll instead, 2026-11-03)
const FADE = 28;            // the band's fade at either end
const INSET = 30;           // the least the basket and the welcome line keep from the poles; they align to the nav pill's ends when it is wider
/* the swing: a pendulum about a second long, lightly damped, pulled toward
   its neighbours; the pointer's sideways motion is a push; a gust is a
   bell of sideways force sweeping the line */
const SWING_K = 42, SWING_C = 1.4, LINK = 14, OMEGA_MAX = 2.6, PUSH = 0.012, PUSH_MAX = 0.5, GUST = 2.4, GUST_W = 260, GUST_V = 900;

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 1000) / 1000; };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Placed = { item: PlayItem; w: number; h: number; x: number; y: number; rot: number; hung: boolean; delay: number; peg: number; row: number };

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
  const descRef = useRef<HTMLParagraphElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, descH: 0, navL: 0, navR: 0 });
  const [filter, setFilter] = useState<string>("All");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<PlayItem | null>(null);
  /* opening a hung piece: it jolts on its peg first (Margaret, 2026-11-03:
     "pegs that squeak"), then opens large a beat later */
  const pick = (p: Placed) => {
    if (!p.hung) return;
    if (reduce) { setOpen(p.item); return; }
    push.current.set(p.item.src, (hash(p.item.src + "k") < 0.5 ? 1 : -1) * 1.1);
    setTimeout(() => setOpen(p.item), 170);
  };
  /* the pieces on the line, in order, for the modal to walk */
  const gallery = useMemo(() => (mounted ? items.filter((it) => filter === "All" || it.group === filter) : []), [items, filter, mounted]);
  const step = useCallback((d: number) => {
    setOpen((cur) => { if (!cur || gallery.length < 2) return cur; const i = gallery.indexOf(cur); return gallery[(i + d + gallery.length) % gallery.length]; });
  }, [gallery]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);
  const [font, setFont] = useState(SKY_FONT_FALLBACK);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  /* every piece's angle, written by the swing loop (hung) or settled by a
     spring (folded); the loop's state and the pointer's pending pushes */
  const swayRef = useRef(new Map<string, MotionValue<number>>());
  const swayOf = (src: string, base: number) => { let v = swayRef.current.get(src); if (!v) { v = motionValue(base); swayRef.current.set(src, v); } return v; };
  const sim = useRef<{ src: string; theta: number; omega: number }[]>([]);
  const push = useRef(new Map<string, number>());
  /* each row's rope, with how far across it is strung (0 at the left pole,
     1 tied to the right): a new row's rope runs across, a row that goes
     pulls its rope back (Margaret, 2026-11-03) */
  const ropes = useRef<{ y: number; ext: MotionValue<number>; live: boolean }[]>([]);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = scene.current; if (!el) return;
    // the nav pill's ends, in the scene's coordinates: the welcome line
    // starts on its left end and the basket ends on its right one
    const measure = () => {
      const r = el.getBoundingClientRect(), nav = document.querySelector("header")?.getBoundingClientRect();
      setSize({ w: el.clientWidth, h: el.clientHeight, descH: descRef.current?.clientHeight ?? 0, navL: nav ? nav.left - r.left : 0, navR: nav ? nav.right - r.left : el.clientWidth });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el); if (descRef.current) ro.observe(descRef.current); measure();
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
  const gap = small ? GAP_SM : GAP, rowGap = small ? ROW_GAP_SM : ROW_GAP, top0 = small ? TOP_SM : TOP;
  const BW = Math.min(BASKET_W, Math.max(200, width - 90)); // between the poles on a phone
  /* the ground, the basket at the right, the welcome line at the left
     (above the basket on a phone), and the band the line scrolls in */
  const floorY = Math.round(vh * FLOOR_VH);
  const rimY = floorY - BASKET_H;
  const textL = Math.max(INSET, size.navL);
  const bx = Math.min(width - INSET, size.navR || width) - BW / 2;
  const descBottom = small ? rimY - HANDLE - 10 : floorY;
  const descTop = descBottom - size.descH;
  const lineTop = Math.round(vh * 0.17);
  const lineBottom = Math.min(rimY - HANDLE, size.descH ? descTop : rimY - HANDLE) - 12;
  const bandH = Math.max(0, lineBottom - lineTop);

  const { placed, rows, linesH, hFit } = useMemo(() => {
    const hung = mounted ? items.filter((it) => filter === "All" || it.group === filter) : [];
    // pack the hung pieces into rows, left to right, at a given height
    const pack = (h: number) => {
      const maxW = (small ? MAX_W_SM : MAX_W) * (h / H);
      const rowsOf: { items: PlayItem[]; widths: number[]; total: number }[] = [];
      for (const it of hung) {
        const w = Math.min(maxW, h * (it.w / it.h));
        const row = rowsOf[rowsOf.length - 1];
        if (row && row.total + gap + w <= width) { row.items.push(it); row.widths.push(w); row.total += gap + w; }
        else rowsOf.push({ items: [it], widths: [w], total: w });
      }
      // the rows run down the band, each rope ROW_GAP under the hem of the row above
      const pitch = 8 + h + rowGap;
      const linesH = rowsOf.length ? top0 + (rowsOf.length - 1) * pitch + 8 + h + 16 : top0;
      return { rowsOf, pitch, linesH };
    };
    // the pieces shrink, down to H_MIN, until every row fits the band: the
    // band then has nothing to hide and no fade shows (Margaret, 2026-11-03:
    // the second row's hem faded into the white). Past H_MIN the line scrolls.
    let hFit = H, packed = pack(H);
    const hMin = small ? H_MIN_SM : H_MIN;
    for (let k = 0; k < 6 && bandH > 0 && packed.linesH > bandH && hFit > hMin; k++) {
      hFit = Math.max(hMin, Math.floor(hFit * Math.min(0.96, bandH / packed.linesH)));
      packed = pack(hFit);
    }
    const { rowsOf, pitch, linesH } = packed;
    const placed: Placed[] = [];
    const sideOf = new Map<string, Placed>();
    rowsOf.forEach((row, r) => {
      const rowTop = top0 + r * pitch;
      let x = (width - row.total) / 2;
      row.items.forEach((it, i) => {
        const w = row.widths[i], cx = x + w / 2;
        const p: Placed = { item: it, w, h: hFit, x: cx - w / 2, y: ropeY(rowTop, cx, width) + 8, rot: (hash(it.src) - 0.5) * 5, hung: true, delay: (r * 6 + i) * 0.06, peg: cx, row: r };
        placed.push(p); sideOf.set(it.src, p); x += w + gap;
      });
    });
    // the rest lie in the basket, laid across its width at odd depths and
    // tilts, each folded over the rim by its own amount: some peek out,
    // some are nearly down inside (scene coordinates)
    const rest = items.filter((it) => !sideOf.has(it.src));
    const fh = small ? FOLD_H_SM : FOLD_H;
    rest.forEach((it, i) => {
      const h = fh, rot = (hash(it.src + "r") - 0.5) * 28;
      const peek = 0.15 + (i % 3) * 0.1 + hash(it.src + "y") * 0.1; // how much shows above the rim, staggered along the pile
      // the basket's sides taper in; at the depth this piece's hem reaches,
      // this much of the rim's width is left, and the piece's TILTED box
      // (corners and all) must fit inside it (Margaret, 2026-11-03: no
      // piece may show outside the basket's outline)
      const depth = h * (1 - peek);
      const [l, rr] = basketEdge(bx, BW, Math.min(1, depth / BASKET_H));
      const room = rr - l - 12;
      const cos = Math.cos((rot * Math.PI) / 180), sin = Math.abs(Math.sin((rot * Math.PI) / 180));
      let w = Math.min(fh * 1.9, h * (it.w / it.h));
      w = Math.min(w, Math.max(24, (room - h * sin) / cos));
      const half = (w / 2) * cos + (h / 2) * sin;
      // laid evenly along the basket, in order, a touch off each slot, so
      // they never bunch in a corner (Margaret, 2026-11-03)
      const lo = l + 6 + half, hi = rr - 6 - half;
      const slot = rest.length > 1 ? i / (rest.length - 1) : 0.5;
      const cx = clamp(lo + slot * Math.max(0, hi - lo) + (hash(it.src + "x") - 0.5) * 12, lo, hi);
      placed.push({ item: it, w, h, x: cx - w / 2, y: rimY - h * peek, rot, hung: false, delay: i * 0.03, peg: 0, row: 0 });
    });
    return { placed, rows: rowsOf.length, linesH, hFit };
  }, [items, filter, width, mounted, small, H, gap, rowGap, top0, rimY, bx, BW, bandH]);

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

  /* the swing loop */
  useEffect(() => {
    const folded = placed.filter((p) => !p.hung);
    for (const p of folded) {
      const v = swayOf(p.item.src, p.rot);
      if (reduce) v.set(p.rot); else animate(v, p.rot, { type: "spring", stiffness: 120, damping: 14 });
    }
    const hung = placed.filter((p) => p.hung);
    if (reduce) { for (const p of hung) swayOf(p.item.src, p.rot).set(p.rot); return; }
    // a piece keeps its swing across a repack; one just lifted starts from
    // the angle it lay at, and swings down to rest on its peg
    const prev = new Map(sim.current.map((st) => [st.src, st]));
    sim.current = hung.map((p) => {
      const was = prev.get(p.item.src);
      return was ?? { src: p.item.src, theta: ((swayOf(p.item.src, p.rot).get() - p.rot) * Math.PI) / 180, omega: 0 };
    });
    // the rope links a piece to the next and the previous on its row
    const nb = hung.map((p, i) => [i > 0 && hung[i - 1].row === p.row ? i - 1 : -1, i < hung.length - 1 && hung[i + 1].row === p.row ? i + 1 : -1] as const);
    let raf = 0, last = performance.now();
    let gust: { t0: number; dir: number } | null = null;
    let next = last + 2500 + Math.random() * 4000;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!gust && now > next) gust = { t0: now, dir: Math.random() < 0.5 ? 1 : -1 };
      let front = 0, env = 0;
      if (gust) {
        const t = (now - gust.t0) / 1000, T = (width + 2 * GUST_W) / GUST_V;
        if (t > T) { gust = null; next = now + 6000 + Math.random() * 9000; }
        else { env = Math.sin((Math.PI * t) / T); front = gust.dir > 0 ? -GUST_W + GUST_V * t : width + GUST_W - GUST_V * t; }
      }
      const st = sim.current;
      for (let i = 0; i < st.length; i++) {
        const p = hung[i], me = st[i];
        let a = -SWING_K * me.theta - SWING_C * me.omega;
        const [l, r] = nb[i];
        if (l >= 0) a += LINK * (st[l].theta - me.theta);
        if (r >= 0) a += LINK * (st[r].theta - me.theta);
        if (gust) { const d = (front - p.peg) / GUST_W; a += GUST * gust.dir * env * Math.exp(-d * d); }
        const k = push.current.get(p.item.src);
        if (k) { me.omega += k; push.current.delete(p.item.src); }
        me.omega = clamp(me.omega + a * dt, -OMEGA_MAX, OMEGA_MAX);
        me.theta += me.omega * dt;
        swayOf(p.item.src, p.rot).set(p.rot + (me.theta * 180) / Math.PI);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [placed, reduce, width]);

  /* the glyphs: poles and basket on the scene, ropes and pegs on the line */
  useEffect(() => {
    const sc = sceneRef.current, line = lineRef.current, front = frontRef.current;
    if (!sc || !line || !front || width <= 0 || vh <= 0) return;
    let raf = 0, raf2 = 0;
    // the ropes: one per row, strung across as the row appears, pulled back
    // as it goes; a row that is gone keeps its rope until it has pulled back
    const rp = ropes.current;
    while (rp.length > Math.max(1, rows) && !rp[rp.length - 1].live && rp[rp.length - 1].ext.get() < 0.001) rp.pop();
    for (let r = 0; r < Math.max(1, rows); r++) {
      const y = top0 + r * (8 + hFit + rowGap);
      if (!rp[r]) { rp[r] = { y, ext: motionValue(reduce ? 1 : 0), live: true }; }
      rp[r].y = y;
      if (!rp[r].live || rp[r].ext.get() < 1) { rp[r].live = true; if (reduce) rp[r].ext.set(1); else animate(rp[r].ext, 1, { duration: 0.8, ease: [0.22, 1, 0.36, 1] }); }
    }
    for (let r = Math.max(1, rows); r < rp.length; r++) {
      if (rp[r].live) { rp[r].live = false; if (reduce) rp[r].ext.set(0); else animate(rp[r].ext, 0, { duration: 0.6, ease: [0.4, 0, 0.8, 0.4] }); }
    }
    // the line: ropes pole to pole as far as each is strung, a knot on the
    // pole where one ties on (paper under it, since the pole is on the
    // canvas beneath), a peg at every hung piece the rope has reached
    const drawLine = () => {
      const lctx = sizeCanvas(line, width, linesH, font); if (!lctx) return;
      const cw = lctx.measureText("M").width || CELL_FONT * 0.6, ch = CELL_H;
      const cols = Math.ceil(width / cw), poleL = 1, poleR = cols - 3;
      const ln = new Grid(cw, ch, cols);
      const x0 = (poleL + 2) * cw, x1 = poleR * cw;
      ropes.current.forEach((rope, r) => {
        const e = clamp(rope.ext.get(), 0, 1); if (e <= 0) return;
        const y = rope.y;
        ln.plot((t) => { const x = x0 + t * e * (x1 - x0); return [x, ropeY(y, x, width)]; }, INK, Math.max(2, Math.ceil((width * e) / 2)));
        const [, kr] = ln.at(x0, y);
        ln.set(poleL + 1, kr, "o", WOOD, true);
        if (e > 0.985) ln.set(poleR, kr, "o", WOOD, true);
        for (const p of placed) {
          if (!p.hung || p.row !== r || p.peg > x0 + e * (x1 - x0)) continue;
          const [c, pr] = ln.at(p.peg, p.y - 8);
          ln.set(c, pr - 1, "n", WOOD); ln.set(c, pr, "|", WOOD); ln.set(c, pr + 1, "|", WOOD);
        }
      });
      ln.draw(lctx);
    };
    const schedule = () => { if (!raf2) raf2 = requestAnimationFrame(() => { raf2 = 0; drawLine(); }); };
    const unsubs = ropes.current.map((rope) => rope.ext.on("change", schedule));
    const render = () => {
      const sctx = sizeCanvas(sc, width, vh, font), fctx = sizeCanvas(front, width, vh, font);
      if (!sctx || !fctx) return;
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
      const by = rimY;
      const [, r0] = g.at(bx, by), rN = Math.floor(floorY / ch);
      for (let r = r0 + 1; r < rN; r++) {
        const [l, rr] = basketEdge(bx, BW, (r - r0) / (rN - r0));
        const c0 = Math.ceil(l / cw) + 1, c1 = Math.floor(rr / cw) - 1;
        for (let c = c0; c <= c1; c++) if ((c + r) % 2 === 0) g.set(c, r, ".", INSIDE);
      }
      g.plot((t) => { const [l, rr] = basketEdge(bx, BW, 0); const xa = l + BW * 0.28, xb = rr - BW * 0.28, u = 1 - t; return [u * u * xa + 2 * u * t * bx + t * t * xb, u * u * by + 2 * u * t * (by - HANDLE) + t * t * by]; }, WOOD, 300, true);
      g.draw(sctx);

      drawLine();

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
      // the sides: a | at each row's edge, stepping in with the taper
      for (let r = r0 + 1; r <= rN; r++) {
        const [l, rr] = basketEdge(bx, BW, (r - r0) / (rN - r0));
        f.set(Math.ceil(l / cw) - 1, r, "|", WOOD); f.set(Math.floor(rr / cw) + 1, r, "|", WOOD);
      }
      { const [l, rr] = basketEdge(bx, BW, 0); const cA = Math.floor(l / cw) - 1, cB = Math.ceil(rr / cw) + 1;
        for (let c = cA; c <= cB; c++) f.set(c, r0, c === cA ? "(" : c === cB ? ")" : "=", WOOD); }
      f.draw(fctx);
    };
    // fonts may land after the first paint: draw now, and again once they are ready
    render();
    if (document.fonts?.ready) document.fonts.ready.then(() => { raf = requestAnimationFrame(render); });
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(raf2); unsubs.forEach((u) => u()); };
  }, [placed, rows, linesH, width, vh, hFit, font, BW, bx, lineTop, rimY, floorY, reduce, top0, rowGap]);

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
      onClick={() => pick(p)}
      role={p.hung ? "button" : undefined}
      tabIndex={p.hung ? 0 : -1}
      aria-label={p.hung ? `Open ${p.item.alt || p.item.group}` : undefined}
      onKeyDown={(e) => { if (p.hung && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(p); } }}
      // the pointer's sideways motion over a hung piece pushes it
      onPointerMove={(e) => { if (p.hung && !reduce) push.current.set(p.item.src, clamp((push.current.get(p.item.src) ?? 0) + e.movementX * PUSH, -PUSH_MAX, PUSH_MAX)); }}
    >
      <motion.div
        className="h-full w-full"
        style={{ transformOrigin: "top center", rotate: swayOf(p.item.src, p.rot) }}
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

  /* a filter, as a pill inside the welcome line */
  const pill = (g: string) => (
    <button
      key={g}
      type="button"
      aria-pressed={filter === g}
      onClick={() => setFilter(g)}
      className={`mx-[3px] inline-block rounded-full border px-[10px] py-[2px] align-baseline lowercase leading-[1.3] transition-colors ${filter === g ? "border-ink bg-ink text-paper" : "border-black/[0.2] bg-white/70 text-ink/70 hover:text-ink"}`}
    >
      {g}
    </button>
  );
  // "graphics and ui/ux", "graphics, ui/ux and zines": the collections, joined
  const named = groups.flatMap((g, i) => [i === 0 ? null : i === groups.length - 1 ? " and " : ", ", pill(g)]);

  // the band's fades, only where the line runs on past an edge: the top one
  // grows in as the line is pulled up, the bottom one goes as its end comes
  // up to the basket's handle; a line that fits has none (Margaret saw the
  // second row's hem fading into nothing, 2026-11-03)
  const mask = useTransform(() => {
    const v = eased.get();
    const ft = clamp(v, 0, FADE), fb = clamp(maxScroll - v, 0, FADE);
    return `linear-gradient(to bottom, transparent ${lineTop}px, #000 ${lineTop + ft}px, #000 ${lineBottom - fb}px, transparent ${lineBottom}px)`;
  });

  return (
    <>
    <div
      ref={scene}
      data-scene
      className="fixed top-0 overflow-hidden"
      style={{ left: "var(--margin-outer)", right: "var(--margin-outer)", height: "100dvh", transform: "translateY(calc(var(--sky-lift, 0px) * -1))", willChange: "transform" }}
    >
      {/* the welcome line, standing on the ground at the left; the filters
          are the pills in its sentence: the line is the list, this is
          what you hang on it */}
      <p
        ref={descRef}
        className={`absolute text-ink ${small ? "text-secondary leading-[1.9]" : "text-body leading-[2.05]"}`}
        style={{ left: textL, right: small ? INSET : undefined, maxWidth: small ? undefined : 440, top: descTop, zIndex: 6 }}
        role="group" aria-label="Hang"
      >
        Hey, welcome to the playground! This is where {pill("All")} my smaller things are, including {named} that didn{"\u2019"}t make it into my main works :)
      </p>

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

    </div>

      {/* the piece, large: a sibling of the scene, clear of its lift
          transform. Arrows and the keyboard walk the hung pieces, dots
          below show how many and which (Margaret, 2026-11-03) */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            onClick={() => setOpen(null)}
            role="dialog" aria-modal="true" aria-label={`${open.alt || open.group}, ${gallery.indexOf(open) + 1} of ${gallery.length}`}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="max-h-[80vh] max-w-[88vw]"
              style={{ aspectRatio: `${open.w} / ${open.h}`, width: `min(88vw, calc(80vh * ${open.w / open.h}))` }}
            >
              <motion.div key={open.src} className="h-full w-full" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
                <Image src={open.src} alt={open.alt ?? ""} width={open.w} height={open.h} sizes="92vw" className="block h-full w-full rounded-[4px] object-contain shadow-[0_30px_80px_rgba(0,0,0,0.35)]" priority />
              </motion.div>
            </motion.div>
            {gallery.length > 1 && (
              <>
                {(["prev", "next"] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    aria-label={dir === "prev" ? "Previous piece" : "Next piece"}
                    onClick={(e) => { e.stopPropagation(); step(dir === "prev" ? -1 : 1); }}
                    className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-[background-color,transform] duration-200 hover:bg-white/25 active:scale-95 ${dir === "prev" ? "left-4 md:left-8" : "right-4 md:right-8"}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden style={{ transform: dir === "prev" ? "scaleX(-1)" : undefined }}>
                      <path d="M6 3l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
                <div className="absolute inset-x-0 bottom-6 flex justify-center gap-[7px]" role="tablist" aria-label="Pieces">
                  {gallery.map((it, i) => (
                    <button
                      key={it.src}
                      type="button"
                      role="tab"
                      aria-selected={it === open}
                      aria-label={`Piece ${i + 1}`}
                      onClick={(e) => { e.stopPropagation(); setOpen(it); }}
                      className="grid h-5 w-5 place-items-center"
                    >
                      <span className={`block h-[6px] rounded-full bg-white transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${it === open ? "w-[18px] opacity-100" : "w-[6px] opacity-40 hover:opacity-70"}`} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
