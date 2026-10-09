"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { TransitionLink } from "@/components/providers/PageTransition";
import { socials } from "@/components/shell/PortfolioShell";

/*
  Site footer (Margaret's references, 2026-10-08): a proper closing block
  rather than a one-line colophon. Three columns on a frosted band:

    MARGARET LUWENA              About            Let's chat!
    ◐ 5:49 PM  Los Angeles, CA   Works            luwena@usc.edu
                                 Play             [in] [x] [ig]

           Designed in Figma. Built with Claude Code.
           © 2026 MARGARET LUWENA · LAST UPDATED 10-08-26

  Two modes:
    reveal - HOME: fixed and parked below the viewport until the works
             column is scrolled to its very end, then it rises in;
             scrolling back up tucks it away. "The end" is read from scroll
             events in the capture phase, so it works whether the scroller
             is the column (desktop) or the window (phones). The column
             keeps bottom padding equal to this band's height.
    static - EVERY OTHER PAGE: in flow at the very bottom of the page
             (FooterSwitch in the root layout mounts it).

  In reveal mode the band is only as tall as the room under the home bio
  ([data-bio] - "...BUILD at TroyLabs."): its top edge stops just below
  that last line (Margaret, 2026-10-08). The measured height is published
  as --footer-h so the works column can pad its end to match. Phones and
  short windows fall back to the fixed clamp.

  Both modes publish --sky-lift: how much of the band is inside the
  viewport, in px. SkyFrame translates the sky up by it, so the hills and
  the dog ride up ahead of the footer instead of showing through it
  (Margaret, 2026-10-08). Static mode reads it on scroll; reveal mode also
  reads it every frame of the band's rise.
*/

const EMAIL = "luwena@usc.edu";
const links = [
  { label: "About", href: "/about" },
  { label: "Works", href: "/works" },
  { label: "Play", href: "/play" },
];
const BUILT = process.env.NEXT_PUBLIC_BUILD_DATE;

export const FOOTER_H = "clamp(300px, 36vh, 420px)";
const GAP_UNDER_BIO = 24; // px between the bio's last line and the band's top edge
const MIN_H = 176;        // the columns + colophon at their tightest padding - never taller than
                          // the room under the bio on a short window (it covered the bio at 260)

export default function SiteFooter({ mode = "static" }: { mode?: "reveal" | "static" }) {
  const reduce = useReducedMotion();
  const [atEnd, setAtEnd] = useState(false);
  const [height, setHeight] = useState<string>(FOOTER_H);
  const reveal = mode === "reveal";
  const ref = useRef<HTMLElement>(null);

  // how much of the band is in view -> --sky-lift (the sky rides up by it)
  const publishLift = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const lift = Math.max(0, Math.min(r.height, window.innerHeight - r.top));
    document.documentElement.style.setProperty("--sky-lift", `${Math.round(lift)}px`);
  }, []);
  useEffect(() => {
    publishLift();
    document.addEventListener("scroll", publishLift, { capture: true, passive: true });
    window.addEventListener("resize", publishLift);
    return () => {
      document.removeEventListener("scroll", publishLift, { capture: true });
      window.removeEventListener("resize", publishLift);
      document.documentElement.style.removeProperty("--sky-lift");
    };
  }, [publishLift]);

  // reveal mode: size the band to the space under the bio, and tell the works column
  useEffect(() => {
    if (!reveal) return;
    const measure = () => {
      const bio = document.querySelector("[data-bio]");
      const wide = window.innerWidth >= 768;
      let h = FOOTER_H;
      if (bio && wide) {
        const room = window.innerHeight - bio.getBoundingClientRect().bottom - GAP_UNDER_BIO;
        h = `${Math.max(MIN_H, Math.round(room))}px`;
      }
      setHeight(h);
      document.documentElement.style.setProperty("--footer-h", h);
    };
    measure();
    const t = setTimeout(measure, 1200); // after the bio's entrance settles
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      document.documentElement.style.removeProperty("--footer-h");
    };
  }, [reveal]);

  useEffect(() => {
    if (!reveal) return;
    const onScroll = (e: Event) => {
      const t = e.target;
      const el = t === document ? document.scrollingElement : (t as Element);
      if (!el || !(el instanceof Element)) return;
      setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [reveal]);

  const link =
    "text-ink/45 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

  return (
    <motion.footer
      ref={ref}
      initial={false}
      animate={reveal ? { y: atEnd ? "0%" : "100%" } : undefined}
      onUpdate={reveal ? publishLift : undefined}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={reveal ? { height } : undefined}
      className={`${
        reveal ? "fixed inset-x-0 bottom-0 z-30 pb-[clamp(10px,2.5vh,28px)] pt-[clamp(14px,4vh,44px)]" : "relative mt-[14vh] gap-[8vh] pb-[5vh] pt-[6vh]"
      } flex flex-col justify-between border-t border-hairline bg-white/75 px-[var(--inset)] text-body text-ink backdrop-blur-xl`}
    >
      <div className="grid gap-8 md:grid-cols-[1fr_auto_auto] md:gap-x-20 md:gap-y-0">
        {/* who / where / when */}
        <div>
          <p className="font-display text-name text-ink">MARGARET LUWENA</p>
          {/* two clocks: where she is, and home - each with a sun or moon for its own hour */}
          <Clock zone="America/Los_Angeles" place="Los Angeles, CA" className="mt-2" />
          <Clock zone="Asia/Jakarta" place="Jakarta, ID" className="mt-1" />
        </div>

        {/* the site */}
        <nav aria-label="Footer" className="flex flex-col gap-1.5 md:items-end md:text-right">
          {links.map((l) => (
            <TransitionLink key={l.href} href={l.href} className={`w-fit ${link}`}>
              {l.label}
            </TransitionLink>
          ))}
        </nav>

        {/* reach */}
        <div className="md:text-right">
          <p className="text-ink/45">Let&apos;s chat!</p>
          <a href={`mailto:${EMAIL}`} className={`mt-1.5 block w-fit text-ink md:ml-auto ${link.replace("text-ink/45 ", "")}`}>
            {EMAIL}
          </a>
          <ul className="mt-5 flex items-center gap-4 md:justify-end">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="block opacity-45 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  <Image src={s.icon} alt="" width={22} height={22} className="w-auto" style={{ height: 22 / s.ink }} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* colophon */}
      <div className="pt-3 text-center leading-relaxed">
        <p className="text-ink/60">
          Designed in Figma. Built with <span className="text-ink">Claude Code</span>.
        </p>
        <p className="mt-1 text-label uppercase tracking-[0.08em] text-ink/40">
          © {new Date().getFullYear()} Margaret Luwena{BUILT && <> · Last updated {BUILT}</>}
        </p>
      </div>
    </motion.footer>
  );
}

/* a live clock for one time zone; the icon follows that zone's hour -
   sun from 6am to 6pm, moon otherwise (Margaret, 2026-10-08) */
function Clock({ zone, place, className = "" }: { zone: string; place: string; className?: string }) {
  const [now, setNow] = useState<{ text: string; hour: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const text = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: zone });
      const hour = Number(d.toLocaleTimeString("en-US", { hour: "numeric", hour12: false, timeZone: zone }).slice(0, 2)) % 24;
      setNow({ text, hour });
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [zone]);
  const day = now ? now.hour >= 6 && now.hour < 18 : true;
  return (
    <p className={`flex items-center gap-2 text-ink/45 ${className}`} suppressHydrationWarning>
      <span aria-hidden className="inline-flex w-[14px] justify-center">
        {day ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
      <span>
        <span className="sr-only">{day ? "Daytime" : "Night"} in {place}: </span>
        {now?.text ?? "…"} &nbsp;{place}
      </span>
    </p>
  );
}
