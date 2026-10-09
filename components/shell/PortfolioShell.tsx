"use client";

import Image from "next/image";
import { motion } from "motion/react";
import WorksColumn from "@/components/works/WorksColumn";
import RotatingTitle from "@/components/shell/RotatingTitle";
import StickerWord from "@/components/shell/StickerWord";
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

  The wordmark is NOT inside the fading group: it must stay fully opaque while
  it flies in from the intro (shared layoutId). Everything else enters after it
  lands - a staggered rise, top to bottom, so the page assembles around the name.
*/

/* `ink` = how much of each PNG's height the glyph actually fills (LinkedIn
   is edge to edge, X and Instagram carry transparent padding) - the
   rendered height is divided by it so all three glyphs read the same size */
export const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/margaretluwena/", icon: "/assets/icon-linkedin.png", ink: 0.993 },
  // X at nominal size: its dense glyph read too big at equal ink height (Margaret, 2026-10-09; was 0.844)
  { label: "X", href: "https://x.com/marluwena", icon: "/assets/icon-x.png", ink: 1 },
  { label: "Instagram", href: "https://www.instagram.com/margaret.luwena/", icon: "/assets/icon-instagram.png", ink: 0.813 },
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
      <div className="relative z-10">
        {/* LEFT - fixed on desktop, first block in normal flow on mobile */}
        {/* the column runs to the works gutter (not a fixed 300px) so the
            longest tagline has room before it wraps; the bio keeps its own cap */}
        <aside className="px-[var(--inset)] pt-[36vh] md:fixed md:inset-y-0 md:left-[var(--inset)] md:w-[calc(var(--col-right)-var(--inset)-56px)] md:px-0 md:pt-0">
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
              <p className="font-body text-display italic leading-tight">
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
                      <Image src={s.icon} alt="" width={24} height={24} className="w-auto" style={{ height: 24 / s.ink }} />
                    </a>
                  </Prox>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* bio - business-facing copy (2026-07-31); 245px cap keeps both
              paragraphs at the artboard's 3-4 short lines. 46vh, up from the
              artboard's 50.1vh (Margaret, 2026-10-08: "a little bit") */}
          <motion.div
            {...enter(0.8)}
            data-bio
            className="mt-12 max-w-[245px] space-y-6 text-body text-ink md:absolute md:top-[46vh] md:mt-0"
          >
            {/* Margaret's copy verbatim (Figma 190:653, 2026-10-08): "USC"
                in place of the full name, with the three hover stickers
                (fight on / Traeco / TroyLabs) that pop out after their
                word. Program links dropped (Margaret, 2026-10-08) - only the
                venture links (Traeco, BUILD) remain; first line reads one
                step larger than body, still a <p> */}
            <p className="text-[17px] leading-snug">
              Building for fun, work, and life.
            </p>
            <p>
              Currently at{" "}
              <StickerWord src="/assets/stickers/fight-on.svg" height="1.35em" tilt={-18}>
                USC
              </StickerWord>{" "}
              studying economics and business administration and entrepreneurship and
              innovation. Cofounding{" "}
              <StickerWord src="/assets/stickers/traeco.svg" height="1.15em" tilt={14}>
                <a
                  href="https://traeco.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
                >
                  Traeco
                </a>
              </StickerWord>{" "}
              and running{" "}
              <a
                href="https://www.troylabs.vc"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
              >
                BUILD
              </a>{" "}
              at{" "}
              <StickerWord src="/assets/stickers/troylabs.svg" height="1.15em" tilt={-12}>
                TroyLabs.
              </StickerWord>
            </p>
          </motion.div>

        </aside>

        {/* RIGHT - fixed scroll context on desktop (.works-column in
            globals.css); normal flow on mobile. */}
        <motion.section {...enter(0.6)}>
          <WorksColumn onIndex={onWorksIndex} reveal={reveal} />
        </motion.section>
      </div>
    </div>
  );
}
