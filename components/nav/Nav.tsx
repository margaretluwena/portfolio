"use client";

import Image from "next/image";
import Link from "next/link";
import Prox from "@/components/ui/Prox";

/*
  Top nav band. In Figma it sits between two hairlines (y81..y111 on the 1728
  canvas): nav links at the content inset (x161), scribble mark on center, and
  the contextual label ("- selected works -") right. Text-only so it can sit
  over the interactive texture.
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
          <nav className="text-body-lg">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mx-2 select-none text-ink/40">+</span>}
                <Prox baseOpacity={0.55} maxScale={1.08} radius={110}>
                  <Link
                    href={l.href}
                    className="text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {l.label}
                  </Link>
                </Prox>
              </span>
            ))}
          </nav>

          {/* center: the hand-drawn scribble mark (Figma 99:33), pinned to true center */}
          <Link
            href="/"
            aria-label="Home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform hover:rotate-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Image src="/assets/scribble-mark.svg" alt="" width={42} height={33} priority />
          </Link>

          {/* right: contextual label, e.g. "- selected works -" */}
          <div className="min-w-[12ch] text-right text-body-lg italic text-ink">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
