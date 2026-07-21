"use client";

import Link from "next/link";

/*
  Top nav band. In Figma it sits between two hairlines (y81..y111) and spans the
  full width: nav links left, center logo mark, "- selected works -" right.
  On the main page this bar overlays the interactive texture, so keep it text-only.
*/

const links = [
  { label: "ABOUT", href: "/about" },
  { label: "WORKS", href: "/works" },
  { label: "PLAY", href: "/play" },
  { label: "RESUME", href: "/resume" },
];

export default function Nav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="border-b border-ink/15">
        <div
          className="pointer-events-auto flex items-center justify-between px-[var(--margin-outer)]"
          style={{ paddingTop: "var(--nav-top)", paddingBottom: "0.6rem" }}
        >
          {/* left: nav links, joined by + like the design */}
          <nav className="text-body-lg text-ink/70">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mx-2 select-none">+</span>}
                <Link href={l.href} className="transition-opacity hover:opacity-60">
                  {l.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* center: the scribble logo mark (imgVector1 in Figma). Swap in the SVG. */}
          <Link href="/" aria-label="Home" className="transition-transform hover:rotate-6">
            <ScribbleMark />
          </Link>

          {/* right: contextual label, e.g. "- selected works -" */}
          <div className="text-body-lg italic text-ink min-w-[12ch] text-right">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}

/* Placeholder for the hand-drawn mark. Replace `d` with the path exported
   from Figma (node 99:33 / imgVector1) or drop the SVG file in and <img> it. */
function ScribbleMark() {
  return (
    <svg width="42" height="34" viewBox="0 0 54 42" fill="none" className="text-ink">
      <path
        d="M8 21c6-14 20-16 26-6 4 7-4 16-12 14-6-2-6-11 1-13 8-2 16 5 16 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
