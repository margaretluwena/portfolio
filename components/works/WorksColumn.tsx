"use client";

import { useRef } from "react";
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
      {/* end padding was a full footer height while the footer overlaid the
          column; since the whole shell now lifts with the footer (--sky-lift),
          a short breath is enough (Margaret, 2026-10-09) */}
      <motion.div style={{ y }} className="px-[var(--inset)] pb-[8vh] pt-12 md:px-0 md:pt-[19.7vh]">
        <WorkList reveal={reveal} />
      </motion.div>
    </div>
  );
}

export { featuredWorks as worksForIndex };
