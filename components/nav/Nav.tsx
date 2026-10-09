"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TransitionLink, usePendingRoute } from "@/components/providers/PageTransition";
import { useNav } from "@/components/nav/NavContext";
import { getWork } from "@/lib/works";

/*
  Top nav PILL (Figma 190:642 "Rectangle 2444", 2026-10-08): one fixed
  capsule from --inset to --align-r, white at 96% over the sky (88% in
  Figma; raised 2026-10-08 for legibility over the finer grid), 1px
  ink/17 edge, soft drop (0 8px 19px /6%). Replaces the two-hairline band.

  Mounted ONCE in the root layout, outside the page-transition wrapper, so
  it persists across routes and its contents slide instead of remounting:

    home  [ ABOUT + WORKS + PLAY ..................... 1/6 - SELECTED WORKS ]
    sub   [ MARGARET LUWENA ...... ABOUT + WORKS + PLAY ........... ALL WORKS ]

  Three-column grid (1fr auto 1fr). The link group changes column with the
  route and `layout="position"` animates the move; the name fades in on the
  left; the contextual label crossfades on the right - italic on subpages,
  upright on home (Figma 195:772 vs 190:652). The slide starts on CLICK via
  the transition provider's pending route, in parallel with the page lifting
  away, so the nav leads the page change rather than trailing it.

  Everything is --type-label (13px, +0.06em, uppercase). Interactable text
  (name, links) rests at ink/40 and comes up to full ink on hover/focus
  (Margaret, 2026-10-08 - a real hover, not the proximity fade); the
  contextual label is not a control and stays at ink/70. Home state (hidden
  during the intro, live counter) comes from NavContext; subpage labels
  derive from the pathname here.

  Below sm a subpage pill can't seat all three (name 156px + links 105px +
  label), so it keeps the way home and the links - name left, links right -
  and drops the label; home keeps links + the bare counter.

  SCROLL: on a CASE STUDY only, the pill lifts out of the way on scroll
  down and returns on the first scroll up (Margaret, 2026-10-08; ref
  emmiwu.com). Everywhere else it is pinned - it never moves. Scroll
  events are read in the capture phase on the document so the study's
  scroller counts whether it is the window or the overlay panel.
*/

const links: { label: string; href: string; external?: boolean }[] = [
  { label: "ABOUT", href: "/about" }, // the letter page - /contact redirects here
  { label: "WORKS", href: "/works" },
  { label: "PLAY", href: "/play" },
  /* RESUME hidden for the application weekend (Margaret, 2026-08-01) -
     restore by uncommenting; the /resume.pdf slot and data stay as-is */
  // { label: "RESUME", href: "/resume.pdf", external: true }, // PDF in /public, no page
];

const LABELS: Record<string, string> = {
  "/about": "ABOUT ME",   // Figma 221:522
  "/works": "ALL WORKS",  // Figma 195:772
  "/play": "PLAYGROUND", // case-study mockup (2026-10-08)
};

/* true while the reader is scrolling down past the top band; any upward
   scroll or returning near the top brings the pill back */
function useScrollState() {
  const [away, setAway] = useState(false);
  const [scrolled, setScrolled] = useState(false); // the page has left the top at all - the veil's cue
  useEffect(() => {
    const last = new WeakMap<EventTarget, number>();
    const onScroll = (e: Event) => {
      const t = e.target;
      const el = t === document ? document.scrollingElement : (t as Element);
      if (!el || !(el instanceof Element)) return;
      /* first event on a scroller compares against 0, not itself - a
         single big wheel tick must still read as "down" */
      const y = el.scrollTop, prev = last.get(el) ?? 0;
      last.set(el, y);
      setScrolled(y > 24);
      if (y < 80) setAway(false);
      else if (y > prev + 2) setAway(true);
      else if (y < prev - 2) setAway(false);
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);
  return { away, scrolled };
}

function labelFor(route: string): string {
  if (LABELS[route]) return LABELS[route];
  const m = route.match(/^\/works\/([^/]+)/);
  if (m) return getWork(m[1])?.title.toUpperCase() ?? "WORK";
  return "LOST"; // 404
}

const linkClass =
  "text-ink/40 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default function Nav() {
  const pathname = usePathname();
  const pending = usePendingRoute();
  const { nav } = useNav();
  const reduce = useReducedMotion();

  /* pending wins (slide starts on click); otherwise "home" means the home
     page is mounted - true under the works overlay too */
  const route = pending ?? pathname;
  const onHome = pending ? pending === "/" : nav.home || pathname === "/";
  const hidden = onHome && nav.hidden;

  /* only a case study (page route, not the overlay over home) hides the pill */
  const study = !onHome && /^\/works\/[^/]+/.test(route);
  const scroll = useScrollState();
  const away = scroll.away && study;

  const slide = reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
  const fade = reduce ? { duration: 0 } : { duration: 0.3, ease: "easeOut" as const };

  return (
    <>
    {/* the veil: once anything has scrolled under the pill, a very soft
        white gradient fades the top of the page so content slips behind
        the nav instead of hitting it (Margaret, 2026-10-08). Below the
        pill, above everything else; never catches the pointer. */}
    <motion.div
      aria-hidden
      data-scrolled={scroll.scrolled || undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[18vh]"
      style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 45%, rgba(255,255,255,0) 100%)" }}
      initial={false}
      animate={{ opacity: scroll.scrolled && !hidden ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: "easeOut" }}
    />
    <motion.header
      className="fixed left-[var(--inset)] right-[var(--inset)] top-[6.36vh] z-40 md:right-[calc(100vw-var(--align-r))]"
      initial={false}
      animate={{ opacity: hidden ? 0 : 1, y: away ? "-160%" : "0%" }}
      transition={{
        opacity: { duration: 0.6, delay: hidden || reduce ? 0 : 0.5 },
        y: reduce ? { duration: 0 } : { duration: 0.45, ease: [0.7, 0, 0.2, 1] },
      }}
      style={{ pointerEvents: hidden || away ? "none" : "auto" }}
    >
      <div className="grid h-10 grid-cols-[1fr_auto_1fr] items-center rounded-full border border-black/[0.17] bg-white/[0.96] px-[18px] shadow-[0_8px_19px_rgba(0,0,0,0.06)]">
        {/* name - subpages only; on "/" the name owns the left column of the
            page, so the pill stays links + counter and nothing else */}
        <div className="col-start-1 row-start-1 justify-self-start">
          <AnimatePresence initial={false}>
            {!onHome && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={fade}
              >
                {/* phones: the name steps down to label size so name + links
                    share the pill (155px + 155px would not) */}
                <TransitionLink
                  href="/"
                  className={`font-display text-name whitespace-nowrap max-sm:text-[12px] max-sm:tracking-[-0.01em] ${linkClass}`}
                >
                  MARGARET LUWENA
                </TransitionLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* nav links, joined by + like the design - col 1 on home, col 2
            (centered) on subpages; the column change is what animates */}
        <motion.nav
          layout="position"
          transition={slide}
          className={`row-start-1 whitespace-nowrap text-label uppercase ${
            onHome
              ? "col-start-1 justify-self-start"
              : "col-start-3 justify-self-end sm:col-start-2 sm:justify-self-center"
          }`}
        >
          {links.map((l, i) => (
            <span key={l.href}>
              {i > 0 && <span className="mx-1.5 select-none text-ink/25 md:mx-2">+</span>}
              {l.external ? (
                <a href={l.href} target="_blank" rel="noreferrer" className={linkClass}>
                  {l.label}
                </a>
              ) : (
                <TransitionLink href={l.href} className={linkClass}>
                  {l.label}
                </TransitionLink>
              )}
            </span>
          ))}
        </motion.nav>

        {/* right: contextual label - the live counter on home, the page's
            name elsewhere. Keyed by MODE, not content, so the counter ticks
            in place and only route changes crossfade. */}
        <div
          className={`col-start-3 row-start-1 justify-self-end whitespace-nowrap text-right text-label uppercase text-ink/70 ${
            onHome ? "" : "hidden sm:block"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={onHome ? "home" : labelFor(route)}
              className={onHome ? "block" : "block italic"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={fade}
            >
              {onHome ? nav.counter : labelFor(route)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
    </>
  );
}
