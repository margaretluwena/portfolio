"use client";

import { useRef } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "motion/react";
import WorkList from "@/components/works/WorkList";

/*
  The right-hand works column: its own scroll container (h-screen, hidden
  scrollbar) with iOS-style rubber banding. Wheeling past either end drags the
  list beyond its bounds with resistance; when the wheel goes quiet it springs
  back with a soft bounce. Touch devices keep their native overscroll physics;
  reduced motion keeps plain scrolling.
*/

const MAX_STRETCH = 130;

export default function WorksColumn() {
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

    // resistance grows as the stretch grows
    const give = 0.38 * (1 - Math.min(1, Math.abs(cur) / MAX_STRETCH));
    const next = Math.max(-MAX_STRETCH, Math.min(MAX_STRETCH, cur - e.deltaY * give));
    y.set(next);

    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      animate(y, 0, { type: "spring", stiffness: 240, damping: 19 }); // the bounce back
    }, 130);
  }

  return (
    <div
      ref={scroller}
      onWheel={onWheel}
      tabIndex={0}
      aria-label="Selected works"
      className="no-scrollbar md:h-screen md:overflow-y-auto focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink/40"
    >
      <motion.div style={{ y }} className="px-[var(--margin-outer)] pt-[16vh] pb-[20vh]">
        <WorkList />
      </motion.div>
    </div>
  );
}
