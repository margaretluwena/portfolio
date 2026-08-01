"use client";

import { usePathname } from "next/navigation";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";

/*
  Top nav band: two 1px hairlines 26px apart, the top one at 7.25vh; text
  vertically centered between them (Figma 128:503). Nav links start at the
  content inset (--inset); the counter's RIGHT end sits at --align-r - the
  same edge as the cards, NOT a mirror of --inset. The band is FIXED - the
  works column scrolls underneath it. Text-only so it can sit over the texture.

  Everything in the band is --type-label (13px, +0.06em); the right slot is
  the italic variant. Small caps read best tracked OUT - the inverse of the
  wordmark's tight display tracking. All links: proximity hover + transition.
*/

const links: { label: string; href: string; external?: boolean }[] = [
  { label: "ABOUT", href: "/about" }, // the letter page - /contact redirects here
  { label: "WORKS", href: "/works" },
  { label: "PLAY", href: "/play" },
  /* RESUME hidden for the application weekend (Margaret, 2026-08-01) -
     restore by uncommenting; the /resume.pdf slot and data stay as-is */
  // { label: "RESUME", href: "/resume.pdf", external: true }, // PDF in /public, no page
];

export default function Nav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-[7.25vh] z-40">
      <div className="h-[26px] border-y border-hairline">
        <div className="pointer-events-auto relative flex h-full items-center justify-between pl-[var(--inset)] pr-[var(--inset)] md:pr-[calc(100vw-var(--align-r))]">
          <div className="flex h-full items-center gap-6">
            {/* home link: the name, subpages only - on "/" the name owns the
                left column, so the nav stays links + counter and nothing else */}
            {!onHome && (
              <Prox baseOpacity={0.7} maxScale={1} radius={110}>
                <TransitionLink
                  href="/"
                  className="font-display text-name text-ink whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  MARGARET LUWENA
                </TransitionLink>
              </Prox>
            )}

            {/* nav links, joined by + like the design */}
            <nav className="text-label uppercase">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mx-1.5 select-none text-ink/40 md:mx-2">+</span>}
                <Prox baseOpacity={0.7} maxScale={1} radius={110}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <TransitionLink
                      href={l.href}
                      className="text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {l.label}
                    </TransitionLink>
                  )}
                </Prox>
              </span>
            ))}
            </nav>
          </div>

          {/* right: contextual label, e.g. "- selected works -" or the live index */}
          <div className="text-right text-label italic text-ink md:min-w-[12ch]">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
