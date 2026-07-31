"use client";

import Image from "next/image";
import { motion } from "motion/react";
import WorksColumn from "@/components/works/WorksColumn";
import RotatingTitle from "@/components/shell/RotatingTitle";
import Prox from "@/components/ui/Prox";

/*
  MAIN PAGE.
  Asymmetric split, all layout viewport-relative (see globals.css tokens).
  Vertical anchors from Figma 128:503 (÷1117), each element pinned separately:
    LEFT  - position:fixed at --inset: identity group anchored at 24.2vh
            (name, tagline +6px, socials +14px - fixed gaps, not vh), bio
            at 50.1vh with a 245px cap. Contact moved to the nav (ABOUT).
    RIGHT - work cards from --col-right, --card-w wide, first top at 19.7vh;
            its own scroll container with rubber-band overscroll
            (WorksColumn), scrolling under the fixed nav band.
  Two full-height vertical hairlines sit at --edge from each viewport edge,
  fixed, above the background texture.

  The wordmark is NOT inside the fading group: it must stay fully opaque while
  it flies in from the intro (shared layoutId). Everything else enters after it
  lands - a staggered rise, top to bottom, so the page assembles around the name.
*/

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/margaretluwena/", icon: "/assets/icon-linkedin.png" },
  { label: "X", href: "https://x.com/marluwena", icon: "/assets/icon-x.png" },
  { label: "Instagram", href: "https://www.instagram.com/margaret.luwena/", icon: "/assets/icon-instagram.png" },
];

export default function PortfolioShell({ reveal, reduce, onWorksIndex }: { reveal: boolean; reduce: boolean; onWorksIndex?: (i: number) => void }) {
  // staggered entrance: fade + rise, sequenced after the wordmark lands (~1.1s flight)
  const enter = (delay: number) => ({
    initial: false as const,
    animate: { opacity: reveal ? 1 : 0, y: reveal ? 0 : 16 },
    transition: {
      opacity: { duration: reduce ? 0 : 0.55, delay: reduce ? 0 : delay },
      y: { duration: reduce ? 0 : 0.65, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
    },
  });

  return (
    <div className="relative md:h-screen md:overflow-hidden">
      {/* full-height vertical hairlines at --edge - fixed, above the texture, desktop only */}
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-[var(--edge)] z-20 hidden w-px bg-hairline md:block" />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-[var(--edge)] z-20 hidden w-px bg-hairline md:block" />

      <div className="relative z-10">
        {/* LEFT - fixed on desktop, first block in normal flow on mobile */}
        <aside className="px-[var(--inset)] pt-[36vh] md:fixed md:inset-y-0 md:left-[var(--inset)] md:w-[300px] md:px-0 md:pt-0">
          {/* identity group - anchored once at 24.2vh, then FIXED px gaps so
              the name/tagline/icons rhythm doesn't stretch with viewport
              height (separate vh anchors read as uneven spacing) */}
          <div className="md:absolute md:top-[24.2vh]">
            {/* the wordmark lands HERE - shared layoutId with the intro; never faded */}
            {reveal && (
              <motion.p
                layoutId="wordmark"
                className="font-display text-name text-ink w-fit"
                transition={{ layout: { duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] } }}
              >
                MARGARET LUWENA
              </motion.p>
            )}

            {/* tagline - body face italic (Figma 128:507 specs Inter Italic), NOT Nohemi */}
            <motion.div {...enter(0.55)} className="mt-[6px]">
              <p className="font-body text-display italic whitespace-nowrap">
                <RotatingTitle active={reveal} />
              </p>
            </motion.div>

            <motion.ul {...enter(0.68)} className="mt-[14px] flex items-center gap-[14px]">
              {socials.map((s) => (
                <li key={s.label}>
                  <Prox maxScale={1.12} radius={55}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      target="_blank"
                      rel="noreferrer"
                      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <Image src={s.icon} alt="" width={24} height={24} className="h-[24px] w-auto" />
                    </a>
                  </Prox>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* bio - business-facing copy (2026-07-31); 245px cap keeps both
              paragraphs at the artboard's 3-4 short lines */}
          <motion.div
            {...enter(0.8)}
            className="mt-12 max-w-[245px] space-y-6 text-body text-ink md:absolute md:top-[50.1vh] md:mt-0"
          >
            <p>Design thinking from problem to pixel: research, systems, and interfaces that actually ship.</p>
            <p>Economics and Business at USC, head of BUILD at TroyLabs, cofounder and CPO at Traeco. Fluent in the deck and the design file alike.</p>
          </motion.div>

        </aside>

        {/* RIGHT - fixed scroll context on desktop (.works-column in
            globals.css); normal flow on mobile. */}
        <motion.section {...enter(0.6)}>
          <WorksColumn onIndex={onWorksIndex} />
        </motion.section>
      </div>
    </div>
  );
}
