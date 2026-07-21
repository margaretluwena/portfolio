"use client";

import Image from "next/image";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";

/*
  Top nav band. In Figma it sits between two hairlines (y81..y111 on the 1728
  canvas): nav links at the content inset (x161), scribble mark on center, and
  the contextual label ("- selected works -") right. Text-only so it can sit
  over the interactive texture.

  Small caps read best tracked OUT (+0.06em) — the inverse of the wordmark's
  tight display tracking. All links: proximity hover + soft page transition.
*/

const links = [
  { label: "ABOUT", href: "/" }, // the main page IS the about
  { label: "WORKS", href: "/works" },
  { label: "PLAY", href: "/play" },
  { label: "RESUME", href: "/resume" },
];

export default function Nav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40" style={{ paddingTop: "var(--nav-top)" }}>
      <div className="border-y border-ink/25">
        <div className="pointer-events-auto relative flex items-center justify-between px-[var(--inset-left)] py-[0.35rem]">
          {/* left: nav links, joined by + like the design */}
          <nav className="text-body-lg tracking-[0.06em]">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mx-2 select-none text-ink/40">+</span>}
                <Prox baseOpacity={0.55} maxScale={1.08} radius={110}>
                  <TransitionLink
                    href={l.href}
                    className="text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {l.label}
                  </TransitionLink>
                </Prox>
              </span>
            ))}
          </nav>

          {/* center: the hand-drawn scribble mark (Figma 99:33), pinned to true center */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Prox maxScale={1.15} radius={100}>
              <TransitionLink
                href="/"
                aria-label="Home"
                className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Image src="/assets/scribble-mark.svg" alt="" width={42} height={33} priority />
              </TransitionLink>
            </Prox>
          </span>

          {/* right: contextual label, e.g. "- selected works -" or the live index */}
          <div className="min-w-[12ch] text-right text-body-lg italic text-ink">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
