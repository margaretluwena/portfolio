"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
  THE NAME, IN THE SKY'S OWN LANGUAGE (2026-11-03).

  "MARGARET LUWENA" is sampled once from its real face (Nohemi, the
  wordmark's computed font) into a grid of cells at the sky's 6:11 cell
  shape, and drawn on a canvas over the page as the sky's dither glyphs
  (.:-=+xX), densest where the letterforms are solid, thinnest at the
  edges.

    assemble   the cells rise into place a few at a time, in a Bayer
               order with a little noise, from a couple of rows below;
               once every cell is home the real text crossfades in over it
    flight     while the wordmark flies to its corner (Framer's shared
               layout) the canvas follows the live rect of the moving
               element and redraws the cells inside it, shedding and
               regathering a few per frame like the dog in motion, and
               leaving a thinning trail where it has just been
    resolve    on landing the flicker settles over ~350ms and the real
               corner text fades in

  The DOM text is kept in the tree the whole time (it is what Framer
  measures and moves); its opacity is what the host toggles. Reduced
  motion never mounts this.
*/

export type DitherMode = "assemble" | "flight" | "resolve" | "off";

const RAMP = ".:-=+xX";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const ROWS = 14; // cells down the cap height of the big name
const CELL_ASPECT = 6 / 11; // the sky's cell, width over height
const ASSEMBLE_MS = 1100;
const RESOLVE_MS = 380;

const hash = (a: number, b: number) => {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

type Grid = {
  gw: number; gh: number; d: Float32Array; thr: Float32Array;
  /* where the ink sits relative to the text's inline box, in the sample's
     units: the box's advance width and its ascent+descent height, and the
     ink's offset and size inside it. Scaled to the live span's rect each
     frame, so the cells land on the letters whatever size or transform
     the text is drawn at (the mismatch read as the name "not lined up",
     Margaret, 2026-11-03) */
  adv: number; asc: number; ix: number; iy: number; iw: number; ih: number;
};

/* sample the word's ink into a cell grid; the font comes from the element itself */
function sample(el: HTMLElement, text: string): Grid | null {
  const cs = getComputedStyle(el);
  const size = 200;
  const off = document.createElement("canvas");
  const ctx = off.getContext("2d");
  if (!ctx) return null;
  const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  ctx.font = font;
  const ls = parseFloat(cs.letterSpacing);
  const em = parseFloat(cs.fontSize) || 1;
  const track = isNaN(ls) ? 0 : (ls / em) * size;
  if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${track}px`;
  const m = ctx.measureText(text);
  const w = Math.ceil(m.width + size), h = Math.ceil(size * 1.5);
  off.width = w; off.height = h;
  ctx.font = font; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#000";
  if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${track}px`;
  const base = Math.round(size * 1.1);
  const fba = m.fontBoundingBoxAscent || size * 0.9, fbd = m.fontBoundingBoxDescent || size * 0.25;
  ctx.fillText(text, size / 2, base);
  const img = ctx.getImageData(0, 0, w, h).data;
  // the ink's own box
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (img[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0) return null;
  const iw = x1 - x0 + 1, ih = y1 - y0 + 1;
  const sh = ih / ROWS, sw = sh * CELL_ASPECT, gw = Math.ceil(iw / sw), gh = ROWS;
  const d = new Float32Array(gw * gh), thr = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let sum = 0, n = 0;
    const px0 = x0 + gx * sw, py0 = y0 + gy * sh;
    for (let y = Math.floor(py0); y < Math.min(h, py0 + sh); y++) for (let x = Math.floor(px0); x < Math.min(w, px0 + sw); x++) { sum += img[(y * w + x) * 4 + 3]; n++; }
    d[gy * gw + gx] = n ? sum / n / 255 : 0;
    thr[gy * gw + gx] = 0.55 * (BAYER[(gx & 3) + (gy & 3) * 4] / 16) + 0.45 * hash(gx * 7 + 1, gy * 13 + 3);
  }
  return { gw, gh, d, thr, adv: m.width, asc: fba + fbd, ix: x0 - size / 2, iy: y0 - (base - fba), iw, ih };
}

export default function DitherWordmark({ mode, target, text, font, onAssembled, onResolved }: {
  mode: DitherMode;
  target: RefObject<HTMLElement | null>;
  text: string;
  /* the sky's mono face, for the glyphs */
  font: string;
  onAssembled?: () => void;
  onResolved?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<{ el: HTMLElement; grid: Grid | null } | null>(null);
  const trail = useRef<{ x: number; y: number; w: number; h: number; t: number }[]>([]);
  const cb = useRef({ onAssembled, onResolved });
  cb.current = { onAssembled, onResolved };

  useEffect(() => {
    if (mode === "off") return;
    const canvas = canvasRef.current, el = target.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, alive = true;
    const start = performance.now();
    let fired = false;

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    addEventListener("resize", fit);

    // sampled once per element: the intro's hero and the corner text share
    // a face and tracking, but each is measured on its own
    const ensureGrid = () => {
      if (!gridRef.current || gridRef.current.el !== el) gridRef.current = { el, grid: sample(el, text) };
      return gridRef.current.grid;
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const g = ensureGrid();
      if (!g) return;
      // the ink box: the inner span's rect is the text's inline box (its
      // advance by the font's ascent+descent), transforms included, so
      // the sampled ink offsets scale straight onto it
      const r = (el.querySelector("span") ?? el).getBoundingClientRect();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const kx = r.width / g.adv, ky = r.height / g.asc;
      const bx = r.left + g.ix * kx, by = r.top + g.iy * ky, bw = g.iw * kx, bh = g.ih * ky;
      const cellW = bw / g.gw, cellH = bh / g.gh;
      const fs = Math.max(4, cellH * 1.02);
      ctx.font = `500 ${fs}px ${font}`; ctx.textBaseline = "top"; ctx.textAlign = "center";
      const t = (now - start) / 1000;
      const fr = Math.floor(now / 1000 * 18);
      const elapsed = now - start;
      let p = 1, flick = 0, settle = 1;
      if (mode === "assemble") { p = Math.min(1, elapsed / ASSEMBLE_MS); if (p >= 1 && !fired) { fired = true; cb.current.onAssembled?.(); } }
      if (mode === "flight") { flick = 1; settle = 0; }
      if (mode === "resolve") { settle = Math.min(1, elapsed / RESOLVE_MS); flick = 1 - settle; if (settle >= 1 && !fired) { fired = true; cb.current.onResolved?.(); } }

      // the trail: where the word just was, thinning out
      if (mode === "flight") {
        const tr = trail.current; tr.push({ x: bx, y: by, w: bw, h: bh, t: now });
        while (tr.length && now - tr[0].t > 320) tr.shift();
        for (const s of tr) {
          const age = (now - s.t) / 320; if (age < 0.15) continue;
          const cw2 = s.w / g.gw, ch2 = s.h / g.gh;
          ctx.fillStyle = `rgba(0,0,0,${(1 - age) * 0.35})`;
          ctx.font = `500 ${Math.max(3, ch2 * 0.8)}px ${font}`;
          for (let gy = 0; gy < g.gh; gy++) for (let gx = 0; gx < g.gw; gx++) {
            const dd = g.d[gy * g.gw + gx]; if (dd < 0.5) continue;
            if (hash(gx * 3 + fr, gy * 5 + Math.floor(s.t)) > 0.12) continue;
            ctx.fillText(".", s.x + (gx + 0.5) * cw2, s.y + gy * ch2);
          }
        }
        ctx.font = `500 ${fs}px ${font}`;
      }

      ctx.fillStyle = "#000";
      for (let gy = 0; gy < g.gh; gy++) for (let gx = 0; gx < g.gw; gx++) {
        const i = gy * g.gw + gx, dd = g.d[i]; if (dd < 0.08) continue;
        const th = g.thr[i];
        let alpha = 1, dy = 0, glyphD = dd;
        if (mode === "assemble") {
          alpha = smooth(th, th + 0.12, p); if (alpha <= 0) continue;
          dy = (1 - smooth(th, th + 0.3, p)) * cellH * 2.6;
        }
        if (flick > 0) {
          const n = hash(gx * 31 + fr * 7, gy * 17 + fr);
          if (n < 0.16 * flick) continue; // shed this frame
          if (n < 0.34 * flick) glyphD = dd * 0.35; // regathering: drawn small
        }
        const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(glyphD * (RAMP.length - 0.01)))];
        ctx.globalAlpha = alpha * (0.72 + 0.28 * Math.min(1, dd * 1.6));
        ctx.fillText(glyph, bx + (gx + 0.5) * cellW, by + gy * cellH + dy);
      }
      ctx.globalAlpha = 1;
      void t; void settle;
    };
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("resize", fit); ctx.clearRect(0, 0, innerWidth, innerHeight); };
  }, [mode, target, text, font]);

  if (mode === "off") return null;
  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[19]" />;
}
