"use client";

import { useEffect, useRef, useState } from "react";
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
  "01 / 06" index) and ends in a small colophon — something for the rubber
  band to bounce against.
*/

const MAX_STRETCH = 130;

export default function WorksColumn({ onIndex }: { onIndex?: (i: number) => void }) {
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
      animate(y, 0, { type: "spring", stiffness: 200, damping: 15 }); // springs past 0 — the bounce
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
      className="no-scrollbar md:h-screen md:overflow-y-auto focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink/40"
    >
      {/* first card's top edge sits 178px from the viewport top (fixed px — it
          scrolls under the fixed nav band); width and inset from the layout tokens */}
      <motion.div style={{ y }} className="px-[var(--inset)] pt-12 md:w-[var(--card-w)] md:px-0 md:pt-[178px]">
        <WorkList />

        {/* colophon — the column's sign-off */}
        <footer className="mt-[7vh] border-t border-hairline pb-[8vh] pt-5 text-label tracking-normal leading-relaxed text-ink/40">
          <p>Designed in Figma. Built with Claude Code.</p>
          <p>
            Los Angeles, CA · <LocalTime /> · © {new Date().getFullYear()} Margaret Luwena
          </p>
        </footer>
      </motion.div>
    </div>
  );
}

function LocalTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      setNow(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }));
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);
  return <span suppressHydrationWarning>{now ?? "…"}</span>;
}

export { featuredWorks as worksForIndex };
