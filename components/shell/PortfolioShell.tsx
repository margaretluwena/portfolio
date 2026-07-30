"use client";

import Image from "next/image";
import { motion } from "motion/react";
import WorksColumn from "@/components/works/WorksColumn";
import RotatingTitle from "@/components/shell/RotatingTitle";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";

/*
  MAIN PAGE.
  Asymmetric split, all layout viewport-relative (see globals.css tokens).
  Vertical anchors from Figma 128:503 (÷1117), each element pinned separately:
    LEFT  — position:fixed at --inset: name 24.2vh, tagline 27.3vh, socials
            33vh, bio 50.1vh (245px cap — "Exploring the intersection of"
            must sit alone on line one), CONTACT 82.7vh.
    RIGHT — work cards from --col-right, --card-w wide, first top at 19.7vh;
            its own scroll container with rubber-band overscroll
            (WorksColumn), scrolling under the fixed nav band.
  Two full-height vertical hairlines sit at --edge from each viewport edge,
  fixed, above the background texture.

  The wordmark is NOT inside the fading group: it must stay fully opaque while
  it flies in from the intro (shared layoutId). Everything else enters after it
  lands — a staggered rise, top to bottom, so the page assembles around the name.
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
      {/* full-height vertical hairlines at --edge — fixed, above the texture, desktop only */}
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-[var(--edge)] z-20 hidden w-px bg-hairline md:block" />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-[var(--edge)] z-20 hidden w-px bg-hairline md:block" />

      <div className="relative z-10">
        {/* LEFT — fixed on desktop, first block in normal flow on mobile */}
        <aside className="px-[var(--inset)] pt-[36vh] md:fixed md:inset-y-0 md:left-[var(--inset)] md:w-[300px] md:px-0 md:pt-0">
          {/* the wordmark lands HERE — shared layoutId with the intro; never faded */}
          {reveal && (
            <motion.p
              layoutId="wordmark"
              className="font-display text-name text-ink w-fit md:absolute md:top-[24.2vh]"
              transition={{ layout: { duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] } }}
            >
              MARGARET LUWENA
            </motion.p>
          )}

          {/* tagline — Inter Italic (Figma 128:507), NOT Nohemi */}
          <motion.div {...enter(0.55)} className="mt-1 md:absolute md:top-[27.3vh] md:mt-0">
            <p className="font-body text-display italic whitespace-nowrap">
              <RotatingTitle active={reveal} />
            </p>
          </motion.div>

          <motion.ul {...enter(0.68)} className="mt-[16px] flex items-center gap-[14px] md:absolute md:top-[33vh] md:mt-0">
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

          {/* bio — 245px cap preserves the artboard wrap ("Exploring the
              intersection of" alone on line one) at 16px type */}
          <motion.div
            {...enter(0.8)}
            className="mt-12 max-w-[245px] space-y-6 text-body text-ink md:absolute md:top-[50.1vh] md:mt-0"
          >
            <p>Exploring the intersection of design, product, and the things in between.</p>
            <p>From startups to the Fortune 500: currently at USC studying Economics and Business, head of BUILD at TroyLabs, and cofounder of Traeco.</p>
          </motion.div>

          {/* CONTACT — 82.7vh, viewport-relative like the rest of the column */}
          <motion.div {...enter(0.92)} className="mt-12 md:absolute md:top-[82.7vh] md:mt-0">
            <Prox baseOpacity={0.7} maxScale={1} radius={160}>
              <TransitionLink
                href="/contact"
                className="inline-flex items-center gap-2 text-label uppercase text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                CONTACT
                <Image src="/assets/contact-arrow.svg" alt="" width={15} height={19} />
              </TransitionLink>
            </Prox>
          </motion.div>
        </aside>

        {/* RIGHT — fixed masked scroll context on desktop (.works-column in
            globals.css); cards dissolve into the texture band as they rise.
            Normal flow on mobile. */}
        <motion.section {...enter(0.6)}>
          <WorksColumn onIndex={onWorksIndex} />
        </motion.section>
      </div>
    </div>
  );
}
