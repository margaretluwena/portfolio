"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationSequence, type MotionValue } from "motion/react";
import { useStudyDials, toTransition, transitionLength } from "@/components/dev/dials";
import { registerTransport } from "@/components/dev/transport";
import defaults from "@/lib/dials/research-funnel.json";

/* ─────────────────────────────────────────────────────────
 * RESEARCH FUNNEL (Traeco, "We hit the problem ourselves first")
 *
 *    0s   waiting for scroll into view
 *    0s   52 dots scatter in (scatterSpring)
 *    then each industry gathers its dots, one after another (clusterStagger, clusterSpring)
 *    +narrowDelay   everything but agentic AI fades to fadedOpacity and that
 *                   cluster draws together with one line of copy (narrowEase)
 *    +loopPause   reset and play again (0 = play once)
 * ───────────────────────────────────────────────────────── */

/* 50+ calls across 11 industries; the last stretch was agentic AI */
const INDUSTRIES: { name: string; n: number; focus?: boolean }[] = [
  { name: "Semiconductors & hardware", n: 4 },
  { name: "Aerospace & defense", n: 4 },
  { name: "Entertainment", n: 4 },
  { name: "AR / VR", n: 3 },
  { name: "Product", n: 4 },
  { name: "Architecture", n: 4 },
  { name: "Branding", n: 3 },
  { name: "Research", n: 4 },
  { name: "Finance", n: 5 },
  { name: "Data infrastructure", n: 3 },
  { name: "Agentic AI", n: 14, focus: true },
];
const TOTAL = INDUSTRIES.reduce((s, i) => s + i.n, 0); // 52
const COPY = "The teams closest to it said it wasn't urgent yet, and that they knew it would be.";

/* one seeded random so the scatter is the same on every visit */
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

type Layout = { w: number; h: number; centers: [number, number][]; focus: [number, number]; copyY: number; label: number };
const WIDE: Layout = {
  w: 1128, h: 520,
  centers: [[110, 120], [300, 120], [490, 120], [680, 120], [870, 120], [1030, 120], [110, 330], [300, 330], [490, 330], [680, 330], [920, 330]],
  focus: [920, 300], copyY: 480, label: 13,
};
const NARROW: Layout = {
  w: 600, h: 900,
  centers: [[110, 110], [300, 110], [490, 110], [110, 290], [300, 290], [490, 290], [110, 470], [300, 470], [490, 470], [110, 650], [360, 650]],
  focus: [360, 640], copyY: 860, label: 15,
};

type Dot = { ind: number; scatter: [number, number]; cluster: [number, number]; narrow: [number, number] };

function buildDots(L: Layout): Dot[] {
  const r = rng(7);
  const dots: Dot[] = [];
  INDUSTRIES.forEach((ind, ci) => {
    const [cx, cy] = L.centers[ci];
    for (let k = 0; k < ind.n; k++) {
      const a = (k / ind.n) * Math.PI * 2 + ci, rad = ind.n > 6 ? 22 + (k % 2) * 12 : 14 + (k % 2) * 6;
      const cluster: [number, number] = [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
      const fa = (k / ind.n) * Math.PI * 2, fr = 34 + (k % 3) * 11;
      const narrow: [number, number] = ind.focus ? [L.focus[0] + Math.cos(fa) * fr, L.focus[1] + Math.sin(fa) * fr] : cluster;
      dots.push({ ind: ci, scatter: [40 + r() * (L.w - 80), 40 + r() * (L.h - 120)], cluster, narrow });
    }
  });
  return dots;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function ResearchFunnel() {
  const d = useStudyDials("ResearchFunnel", "research-funnel", {
    scatterSpring: defaults.scatterSpring as { type: "spring"; visualDuration: number; bounce: number },
    clusterStagger: [defaults.clusterStagger, 0, 0.4, 0.02],
    clusterSpring: defaults.clusterSpring as { type: "spring"; visualDuration: number; bounce: number },
    narrowDelay: [defaults.narrowDelay, 0, 2, 0.1],
    narrowEase: defaults.narrowEase as { type: "easing"; duration: number; ease: [number, number, number, number] },
    fadedOpacity: [defaults.fadedOpacity, 0, 0.5, 0.02],
    loopPause: [defaults.loopPause, 0, 8, 0.5],
    triggerThreshold: [defaults.triggerThreshold, 0, 1, 0.05],
  });
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: d.triggerThreshold });
  const [narrowLayout, setNarrowLayout] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrowLayout(e.contentRect.width < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const L = narrowLayout ? NARROW : WIDE;
  const dots = useMemo(() => buildDots(L), [L]);

  const scatter = useMotionValue(0);
  const narrow = useMotionValue(0);
  // one progress value per industry; hooks in a fixed-length loop, order never changes
  const clusters: MotionValue<number>[] = INDUSTRIES.map(() => useMotionValue(0)); // eslint-disable-line react-hooks/rules-of-hooks
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const all = [scatter, ...clusters, narrow];
    if (reduce) { all.forEach((v) => v.set(1)); return; }
    if (!inView) return;
    let stopped = false;
    let seq: ReturnType<typeof animate> | null = null;
    let unregister: (() => void) | undefined;
    const scatterLen = transitionLength(d.scatterSpring);
    const clusterStart = scatterLen * 0.7;
    const clusterLen = transitionLength(d.clusterSpring);
    const narrowAt = clusterStart + (INDUSTRIES.length - 1) * d.clusterStagger + clusterLen + d.narrowDelay;
    const run = () => {
      all.forEach((v) => v.set(0));
      const steps: AnimationSequence = [
        [scatter, 1, { ...toTransition(d.scatterSpring), at: 0 }],
        ...clusters.map((c, i): AnimationSequence[number] => [c, 1, { ...toTransition(d.clusterSpring), at: clusterStart + i * d.clusterStagger }]),
        [narrow, 1, { ...toTransition(d.narrowEase), at: narrowAt }],
      ];
      seq = animate(steps);
      seq.then(() => {
        if (stopped || d.loopPause <= 0) return;
        loopTimer.current = setTimeout(() => { if (!stopped) run(); }, d.loopPause * 1000);
      });
      unregister?.();
      unregister = registerTransport({
        id: "research-funnel",
        label: "Research funnel",
        duration: () => seq?.duration ?? 0,
        getTime: () => seq?.time ?? 0,
        setTime: (t) => { if (seq) seq.time = t; },
        play: () => seq?.play(),
        pause: () => seq?.pause(),
        restart: () => { if (loopTimer.current) clearTimeout(loopTimer.current); run(); },
        setSpeed: (s) => { if (seq) seq.speed = s; },
        isPlaying: () => !!seq && seq.state === "running",
      });
    };
    run();
    return () => {
      stopped = true;
      if (loopTimer.current) clearTimeout(loopTimer.current);
      seq?.stop();
      unregister?.();
    };
    // every dial is a dependency on purpose: a change rebuilds the sequence
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, L, d.scatterSpring, d.clusterStagger, d.clusterSpring, d.narrowDelay, d.narrowEase, d.loopPause]);

  const focusLabelScale = useTransform(narrow, [0, 1], [1, 1.35]);
  const copyOpacity = useTransform(narrow, [0.4, 1], [0, 1]);

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${L.w} ${L.h}`} className="block h-auto w-full" role="img" aria-label={`${TOTAL} calls across ${INDUSTRIES.length} industries, narrowing to agentic AI`}>
        {dots.map((dot, i) => (
          <FunnelDot key={`${L.w}-${i}`} dot={dot} scatter={scatter} cluster={clusters[dot.ind]} narrow={narrow} faded={d.fadedOpacity} focus={!!INDUSTRIES[dot.ind].focus} />
        ))}
        {INDUSTRIES.map((ind, ci) => (
          <FunnelLabel key={`${L.w}-${ind.name}`} name={ind.name} count={ind.n} x={L.centers[ci][0]} y={L.centers[ci][1] + (ind.n > 6 ? 54 : 40)} size={L.label} cluster={clusters[ci]} narrow={narrow} faded={d.fadedOpacity} focus={!!ind.focus} focusScale={focusLabelScale} focusPos={ind.focus ? [L.focus[0], L.focus[1] + 74] : undefined} />
        ))}
        <motion.text x={L.w / 2} y={L.copyY} textAnchor="middle" fontSize={L.label + 1} fill="currentColor" className="text-ink/70" style={{ opacity: copyOpacity, fontFamily: "var(--font-body)" }}>
          {COPY}
        </motion.text>
      </svg>
    </div>
  );
}

function FunnelDot({ dot, scatter, cluster, narrow, faded, focus }: { dot: Dot; scatter: MotionValue<number>; cluster: MotionValue<number>; narrow: MotionValue<number>; faded: number; focus: boolean }) {
  const cx = useTransform([scatter, cluster, narrow], ([s, c, n]: number[]) => lerp(lerp(dot.scatter[0], dot.cluster[0], c), dot.narrow[0], n) + (1 - s) * 18);
  const cy = useTransform([scatter, cluster, narrow], ([s, c, n]: number[]) => lerp(lerp(dot.scatter[1], dot.cluster[1], c), dot.narrow[1], n) - (1 - s) * 18);
  const opacity = useTransform([scatter, narrow], ([s, n]: number[]) => Math.min(1, s) * (focus ? 1 : lerp(1, faded, n)));
  const r = useTransform(narrow, [0, 1], focus ? [5, 6] : [5, 4]);
  return <motion.circle cx={cx} cy={cy} r={r} style={{ opacity }} fill={focus ? "var(--study-blue)" : "currentColor"} className="text-ink/45" />;
}

function FunnelLabel({ name, count, x, y, size, cluster, narrow, faded, focus, focusScale, focusPos }: { name: string; count: number; x: number; y: number; size: number; cluster: MotionValue<number>; narrow: MotionValue<number>; faded: number; focus: boolean; focusScale: MotionValue<number>; focusPos?: [number, number] }) {
  const opacity = useTransform([cluster, narrow], ([c, n]: number[]) => c * (focus ? 1 : lerp(1, faded, n)));
  const lx = useTransform(narrow, [0, 1], [x, focusPos ? focusPos[0] : x]);
  const ly = useTransform(narrow, [0, 1], [y, focusPos ? focusPos[1] : y]);
  return (
    <motion.text x={lx} y={ly} textAnchor="middle" fontSize={size} style={{ opacity, scale: focus ? focusScale : 1, transformOrigin: `${x}px ${y}px`, fontFamily: "var(--font-body)" }} fill="currentColor" className={focus ? "text-ink font-medium" : "text-ink/60"}>
      {name} · {count}
    </motion.text>
  );
}
