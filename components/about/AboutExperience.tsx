"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  WORK EXPERIENCES (Figma "About" 221:520, rows 270:711-731; 2026-10-08).

  The list is long, so it does not sit on the page all at once: the section
  PINS. Scrolling into it holds the heading and the frame still while the
  rows travel up through a fixed window; once the last row is in, the page
  releases and scrolls on. The outer section is as tall as the viewport
  plus the distance the rows have to travel, the inner block is sticky for
  that whole stretch, and the rows' offset follows scroll progress - so
  the wheel always "scrolls the experiences" until they run out. The
  offset is written straight from a scroll listener (no animation loop in
  between), so it tracks the wheel 1:1.

  Geometry from the frame (2164 wide): heading at --inset; org column at
  48.8% of the width; role + dates right-aligned at --align-r; 140px row
  pitch (6.5vw). Multi-role orgs (BNI) hang their second role under the
  first with a hairline, like the frame's "Line 76".

  Phones and reduced motion: no pin - the rows just sit in flow.
*/

type Role = { title: string; dates: string };
type Experience = { org: string; roles: Role[] };

const EXPERIENCES: Experience[] = [
  { org: "Edison International", roles: [{ title: "Product Designer", dates: "May 2026 - June 2026" }] },
  { org: "Impeccable Chicken", roles: [{ title: "Product Designer (Contract)", dates: "March 2026 - October 2026" }] },
  { org: "Traeco", roles: [{ title: "CPO + Founding Designer", dates: "February 2026 - October 2026" }] },
  { org: "Mark", roles: [{ title: "Product Designer", dates: "September 2025 - December 2025" }] },
  {
    org: "BNI Sekuritas",
    roles: [
      { title: "Investment Banking Summer Analyst", dates: "July 2025 - August 2025" },
      { title: "Risk Management Intern", dates: "June 2025 - July 2025" },
    ],
  },
  { org: "Glance", roles: [{ title: "Founding Designer", dates: "February 2025 - May 2025" }] },
];

const WINDOW_VH = 58; // the visible slice of the list while pinned
const TOP_VH = 22;    // where the pinned block starts - clear of the nav pill (14 sat too close to it, Margaret 2026-10-09)
const BLOCK_VH = TOP_VH + WINDOW_VH + 3; // the pinned block is only as tall as its content, so the
                                          // page releases right under the last row (no empty tail)

function Rows() {
  return (
    <ol>
      {EXPERIENCES.map((e) => (
        <li key={e.org} className="grid grid-cols-[1fr_auto] gap-x-6 py-[3.2vh] first:pt-0">
          {/* the org; with a second role, a hairline drops from under the name
              to the bottom of the roles stack (the frame's "Line 76") */}
          <div className="flex flex-col">
            <p className="text-body-lg text-ink">{e.org}</p>
            {e.roles.length > 1 && <span aria-hidden className="ml-[0.4ch] mt-3 w-px flex-1 bg-hairline" />}
          </div>
          <div className="text-right">
            {e.roles.map((r, i) => (
              <div key={r.title} className={i > 0 ? "mt-[3.2vh]" : ""}>
                <p className="text-body-lg text-ink">{r.title}</p>
                <p className="mt-1 text-body text-ink/45">{r.dates}</p>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function AboutExperience() {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  // how far the rows must move: list height minus the window they show through
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.scrollHeight - window.innerHeight * (WINDOW_VH / 100)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // progress through the pinned stretch -> the rows' offset, 1:1 with the wheel
  useEffect(() => {
    const sec = outer.current, el = list.current;
    if (!sec || !el || !travel) return;
    const onScroll = () => {
      const start = sec.getBoundingClientRect().top + window.scrollY;
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / travel));
      el.style.transform = `translate3d(0, ${-p * travel}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [travel]);

  const heading = <h2 className="study-title text-ink">Work Experiences</h2>;

  if (reduce) {
    return (
      <section className="grid gap-10 px-[var(--inset)] md:grid-cols-[1fr_1.3fr] md:pr-[calc(100vw-var(--align-r))]">
        {heading}
        <Rows />
      </section>
    );
  }

  return (
    <>
      {/* phones: in flow */}
      <section className="px-[var(--inset)] md:hidden">
        {heading}
        <div className="mt-8">
          <Rows />
        </div>
      </section>

      {/* desktop: pinned */}
      <section ref={outer} className="relative hidden md:block" style={{ height: `calc(${BLOCK_VH}vh + ${travel}px)` }}>
        <div
          className="sticky top-0 grid grid-cols-[1fr_1.3fr] gap-10 px-[var(--inset)] pr-[calc(100vw-var(--align-r))]"
          style={{ height: `${BLOCK_VH}vh`, paddingTop: `${TOP_VH}vh` }}
        >
          {heading}
          <div
            className="overflow-hidden"
            style={{
              height: `${WINDOW_VH}vh`,
              /* the first row sits on the heading's baseline: pad by the two line-heights' difference */
              paddingTop: "calc(1.15 * clamp(22px, 2.2vw, 44px) - 1.35 * clamp(1rem, 1.45vw, 1.5625rem))",
              /* rows fade out only at the bottom, where they wait to scroll in - never at the top */
              maskImage: "linear-gradient(to bottom, #000 82%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 82%, transparent)",
            }}
          >
            <div ref={list} className="pb-[8vh] will-change-transform">
              <Rows />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
