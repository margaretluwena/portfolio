"use client";

import Image from "next/image";
import { motion } from "motion/react";
import WorksColumn from "@/components/works/WorksColumn";
import RotatingTitle from "@/components/shell/RotatingTitle";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";

/*
  MAIN PAGE.
  Asymmetric split, all layout viewport-relative (see globals.css tokens):
    LEFT  — position:fixed at --inset, text max 300px wide, three groups
            anchored vertically: identity ~24vh, bio ~50vh, CONTACT ~8vh
            from the bottom.
    RIGHT — work cards from --col-right (42.5vw), --card-w (47vw) wide; its
            own scroll container with rubber-band overscroll (WorksColumn),
            scrolling under the fixed nav band.
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
        <aside className="px-[var(--inset)] pt-[30vh] md:fixed md:inset-y-0 md:left-[var(--inset)] md:w-[300px] md:px-0 md:pt-0">
          {/* identity: name, magenta line, socials */}
          <div className="md:absolute md:top-[24vh]">
            {/* the wordmark lands HERE — shared layoutId with the intro; never faded */}
            {reveal && (
              <motion.p
                layoutId="wordmark"
                className="font-display text-name text-ink w-fit"
                transition={{ layout: { duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] } }}
              >
                MARGARET LUWENA
              </motion.p>
            )}

            <motion.div {...enter(0.55)}>
              <p className="font-display text-display italic mt-1">
                <RotatingTitle active={reveal} />
              </p>
            </motion.div>

            <motion.ul {...enter(0.68)} className="mt-[16px] flex items-center gap-[14px]">
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

          {/* bio: two short paragraphs — 300px cap keeps them at 3-4 lines */}
          <motion.div
            {...enter(0.8)}
            className="mt-12 max-w-[300px] space-y-6 text-body text-ink md:absolute md:top-[50vh] md:mt-0 md:w-full"
          >
            <p>Exploring the intersection of design, product, and the things in between.</p>
            <p>From startups to the Fortune 500: currently at USC studying Economics and Business, head of BUILD at TroyLabs, and cofounder of Traeco.</p>
          </motion.div>

          {/* CONTACT — anchored near the bottom */}
          <motion.div {...enter(0.92)} className="mt-12 md:absolute md:bottom-[8vh] md:mt-0">
            <Prox baseOpacity={0.7} maxScale={1} radius={160}>
              <TransitionLink
                href="/contact"
                className="inline-flex items-center gap-2 text-label uppercase text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                CONTACT
                <Image src="/assets/contact-arrow.svg" alt="" width={16} height={18} />
              </TransitionLink>
            </Prox>
          </motion.div>
        </aside>

        {/* RIGHT — scrolls inside itself, rubber-bands at the ends */}
        <motion.section {...enter(0.6)} className="md:ml-[var(--col-right)]">
          <WorksColumn onIndex={onWorksIndex} />
        </motion.section>
      </div>
    </div>
  );
}
