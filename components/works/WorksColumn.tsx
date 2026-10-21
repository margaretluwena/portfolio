"use client";

import { TransitionLink } from "@/components/providers/PageTransition";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "motion/react";
import WorkList from "@/components/works/WorkList";
import { featuredWorks } from "@/lib/works";

/*
  The right-hand works column: its own scroll container (h-screen, hidden
  scrollbar) with iOS-style rubber banding. Wheeling past either end drags the
  list beyond its bounds with resistance; when the wheel goes quiet it springs
  back with a soft bounce. Touch devices keep their native overscroll physics;
  reduced motion keeps plain scrolling.

  Also reports which work is nearest the viewport center (for the nav's live
  "01 / 06" index). The colophon that used to close the column is now the
  page-wide SiteFooter (reveal mode), rising when this column reaches its end; the
  bottom padding here keeps the last card clear of that band.
*/

const MAX_STRETCH = 130;
/* auto-cycle (Margaret, 2026-10-13): the column advances one card every
   CYCLE_MS until the visitor touches it - a wheel, a press, a key - after
   which it is theirs for good. Hovering pauses it. Reduced motion: off. */
const CYCLE_MS = 4000;

export default function WorksColumn({ onIndex, reveal = true }: { onIndex?: (i: number) => void; reveal?: boolean }) {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onWheel(e: React.WheelEvent) {
    if (reduce) return;
    const el = scroller.current;
    if (!el) return;
    const atTop = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    const cur = y.get();

    const pulling = (atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0) || cur !== 0;
    if (!pulling) return;

    y.stop(); // wheeling mid-springback must take over, not fight the spring

    // normalize notchy mouse wheels (trackpads stream small deltas already)
    const d = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60);
    // progressive resistance: generous at rest, asymptotic near full stretch
    const give = 0.26 * Math.pow(1 - Math.min(1, Math.abs(cur) / MAX_STRETCH), 1.4);
    const next = Math.max(-MAX_STRETCH, Math.min(MAX_STRETCH, cur - d * give));
    y.set(next);

    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      animate(y, 0, { type: "spring", stiffness: 200, damping: 15 }); // springs past 0 - the bounce
    }, 90);
  }

  /* card tops in scroll coordinates, from the live layout (offsetTop would
     depend on which ancestor counts as offsetParent under the transform) */
  const cardTops = (el: HTMLElement) => {
    const base = el.getBoundingClientRect().top - el.scrollTop;
    return (Array.from(el.querySelectorAll("li[data-work]")) as HTMLElement[]).map((li) => {
      const r = li.getBoundingClientRect();
      return { top: r.top - base, height: r.height };
    });
  };

  /* the column's end: scroll room past the last card sized so its top can
     reach exactly the line the first card rests on, and no further (Margaret,
     2026-10-20). Recomputed on resize. */
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current, box = inner.current;
    if (!el || !box) return;
    const fit = () => {
      /* only while the column is its own scroller (md+). In normal flow its
         height includes the padding this sets, and the two feed each other
         until the page is 200,000px tall (found 2026-10-20 on a phone). */
      if (!window.matchMedia("(min-width: 768px)").matches) { box.style.paddingBottom = ""; return; }
      const tops = cardTops(el);
      if (tops.length < 2) return;
      const first = tops[0], last = tops[tops.length - 1];
      const tail = box.querySelector<HTMLElement>(".works-tail");
      const tailH = tail ? tail.getBoundingClientRect().height + parseFloat(getComputedStyle(tail).marginTop) : 0;
      box.style.paddingBottom = `${Math.max(el.clientHeight - first.top - last.height - tailH, 0)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // auto-cycle until the visitor takes over
  const taken = useRef(false);
  const hovering = useRef(false);
  useEffect(() => {
    const el = scroller.current;
    if (!el || !reveal || reduce) return;
    let stop: (() => void) | null = null;
    const takeOver = () => { taken.current = true; stop?.(); };
    const over = () => { hovering.current = true; };
    const out = () => { hovering.current = false; };
    el.addEventListener("wheel", takeOver, { passive: true });
    el.addEventListener("pointerdown", takeOver, { passive: true });
    el.addEventListener("touchstart", takeOver, { passive: true });
    el.addEventListener("keydown", takeOver);
    el.addEventListener("pointerenter", over);
    el.addEventListener("pointerleave", out);
    const tick = () => {
      if (taken.current || hovering.current || document.hidden) return;
      const tops = cardTops(el);
      if (tops.length < 2) return;
      const probe = el.scrollTop + el.clientHeight * 0.4;
      let cur = 0, bestD = Infinity;
      tops.forEach((t, i) => { const d = Math.abs(t.top + t.height / 2 - probe); if (d < bestD) { bestD = d; cur = i; } });
      const next = (cur + 1) % tops.length;
      // each card lands where the first one rests: its top at the column's top padding
      const target = Math.min(tops[next].top - tops[0].top, el.scrollHeight - el.clientHeight);
      const ctrl = animate(el.scrollTop, target, { duration: 0.9, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { el.scrollTop = v; } });
      stop = () => ctrl.stop();
    };
    const id = setInterval(tick, CYCLE_MS);
    return () => {
      clearInterval(id);
      stop?.();
      el.removeEventListener("wheel", takeOver);
      el.removeEventListener("pointerdown", takeOver);
      el.removeEventListener("touchstart", takeOver);
      el.removeEventListener("keydown", takeOver);
      el.removeEventListener("pointerenter", over);
      el.removeEventListener("pointerleave", out);
    };
  }, [reveal, reduce]);

  // live index: the work whose card is nearest 40% down the viewport
  function onScroll() {
    if (!onIndex) return;
    const el = scroller.current;
    if (!el) return;
    const probe = el.scrollTop + el.clientHeight * 0.4;
    const items = Array.from(el.querySelectorAll("li[data-work]")) as HTMLElement[];
    let best = 0, bestD = Infinity;
    items.forEach((li, i) => {
      const d = Math.abs(li.offsetTop + li.offsetHeight / 2 - probe);
      if (d < bestD) { bestD = d; best = i; }
    });
    onIndex(best);
  }

  return (
    <div
      ref={scroller}
      onWheel={onWheel}
      onScroll={onScroll}
      tabIndex={0}
      aria-label="Selected works"
      className="no-scrollbar works-column focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink/40"
    >
      {/* first card's top edge at 19.7vh (Figma 128:503: 220/1117 - it scrolls
          under the fixed nav band); width and inset from the layout tokens */}
      <motion.div ref={inner} style={{ y }} className="px-[var(--inset)] pb-0 pt-12 md:px-0 md:pt-[19.7vh]">
        <WorkList reveal={reveal} />
        {/* the way onward once the four are seen (Shub's feedback, 2026-10-13):
            close under the last card, flush with its right edge */}
        <p className="works-tail mt-[2.5vh] text-right text-body">
          <TransitionLink
            href="/works"
            className="inline-flex items-center gap-2 text-ink/45 transition-colors duration-300 hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            See more work
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
              <path d="M3 11 11 3M5 3h6v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </TransitionLink>
        </p>
      </motion.div>
    </div>
  );
}

export { featuredWorks as worksForIndex };
