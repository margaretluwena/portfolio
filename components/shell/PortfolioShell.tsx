"use client";

import Image from "next/image";
import { motion } from "motion/react";
import WorksColumn from "@/components/works/WorksColumn";
import RotatingTitle from "@/components/shell/RotatingTitle";
import Prox from "@/components/ui/Prox";
import { TransitionLink } from "@/components/providers/PageTransition";

/*
  MAIN PAGE.
  50/50 split (Figma center guide at x=864/1728):
    LEFT  — fixed: wordmark (arrives from the intro), rotating tagline,
            socials, bio, CONTACT.
    RIGHT — its own scroll container with rubber-band overscroll (WorksColumn).

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
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
        {/* LEFT — pinned */}
        <aside className="flex flex-col justify-between px-[var(--inset-left)] pt-[30vh] pb-[calc(var(--margin-outer)+0.5rem)] md:h-screen">
          <div>
            {/* the wordmark lands HERE — shared layoutId with the intro; never faded */}
            {reveal && (
              <motion.p
                layoutId="wordmark"
                className="wordmark text-corner text-ink w-fit"
                transition={{ layout: { duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] } }}
              >
                MARGARET LUWENA
              </motion.p>
            )}

            <motion.div {...enter(0.55)}>
              <p className="text-title italic mt-2 font-body">
                <RotatingTitle active={reveal} />
              </p>
            </motion.div>

            <motion.ul {...enter(0.68)} className="mt-5 flex items-center gap-5">
              {socials.map((s) => (
                <li key={s.label}>
                  <Prox maxScale={1.22} radius={120}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      target="_blank"
                      rel="noreferrer"
                      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <Image src={s.icon} alt="" width={26} height={26} className="h-[26px] w-auto" />
                    </a>
                  </Prox>
                </li>
              ))}
            </motion.ul>

            <motion.div {...enter(0.8)} className="mt-[10vh] max-w-[24ch] space-y-4 text-body-lg text-ink">
              <p>Exploring the intersection of design, product, and the things in between.</p>
              <p>Currently at USC pursuing Economics and Business, head of BUILD at TroyLabs, and a cofounder of Traeco.</p>
            </motion.div>
          </div>

          <motion.div {...enter(0.92)}>
            <Prox baseOpacity={0.5} maxScale={1.04} radius={160}>
              <TransitionLink
                href="/contact"
                className="inline-flex items-center gap-2 text-body-lg tracking-[0.06em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                CONTACT
                <Image src="/assets/contact-arrow.svg" alt="" width={16} height={18} />
              </TransitionLink>
            </Prox>
          </motion.div>
        </aside>

        {/* RIGHT — scrolls inside itself, rubber-bands at the ends */}
        <motion.section {...enter(0.6)} className="md:border-l md:border-ink/20">
          <WorksColumn onIndex={onWorksIndex} />
        </motion.section>
      </div>
    </div>
  );
}
