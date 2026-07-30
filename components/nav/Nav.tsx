"use client";

import Image from "next/image";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";

/*
  Top nav band: two 1px hairlines 26px apart, the top one at 7.25vh; text
  vertically centered between them (Figma 128:503). Nav links start at the
  content inset (--inset); the counter's RIGHT end sits at --align-r — the
  same edge as the cards, NOT a mirror of --inset. The band is FIXED — the
  works column scrolls underneath it. Text-only so it can sit over the texture.

  Everything in the band is --type-label (13px, +0.06em); the right slot is
  the italic variant. Small caps read best tracked OUT — the inverse of the
  wordmark's tight display tracking. All links: proximity hover + transition.
*/

const links = [
  { label: "ABOUT", href: "/" }, // the main page IS the about
  { label: "WORKS", href: "/works" },
  { label: "PLAY", href: "/play" },
  { label: "RESUME", href: "/resume" },
];

export default function Nav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[7.25vh] z-40">
      <div className="h-[26px] border-y border-hairline">
        <div className="pointer-events-auto relative flex h-full items-center justify-between pl-[var(--inset)] pr-[var(--inset)] md:pr-[calc(100vw-var(--align-r))]">
          {/* left: nav links, joined by + like the design */}
          <nav className="text-label uppercase">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mx-1.5 select-none text-ink/40 md:mx-2">+</span>}
                <Prox baseOpacity={0.7} maxScale={1} radius={110}>
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
          <span className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <Prox maxScale={1.1} radius={100}>
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
          <div className="text-right text-label italic text-ink md:min-w-[12ch]">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
