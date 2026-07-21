"use client";

import { motion } from "motion/react";
import WorkList from "@/components/works/WorkList";

/*
  MAIN PAGE.
  50/50 split (Figma center guide at x=864/1728):
    LEFT  — fixed, does not scroll: wordmark (arrives from the intro), tagline,
            socials, bio, CONTACT.
    RIGHT — scrolls: the "selected works" column.
  The interactive texture band and nav are owned by the Stage (app/page.tsx),
  which is also where the wordmark's shared-layout journey ends — here.
*/

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/margaretluwena/" },
  { label: "X", href: "https://x.com/" },
  { label: "Instagram", href: "https://www.instagram.com/margaret.luwena/" },
];

export default function PortfolioShell({ reveal, reduce }: { reveal: boolean; reduce: boolean }) {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
        {/* LEFT — fixed */}
        <motion.aside
          initial={false}
          animate={{ opacity: reveal ? 1 : 0, y: reveal ? 0 : 12 }}
          transition={{ duration: reduce ? 0 : 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="md:sticky md:top-0 md:flex md:h-screen flex-col justify-between px-[var(--inset-left)] pt-[38vh] pb-[var(--margin-outer)]"
        >
          <div>
            {/* the wordmark lands HERE — shared layoutId with the intro */}
            {reveal && (
              <motion.p
                layoutId="wordmark"
                className="wordmark text-corner text-ink"
                transition={{ layout: { duration: reduce ? 0 : 1.1, ease: [0.7, 0, 0.2, 1] } }}
              >
                MARGARET LUWENA
              </motion.p>
            )}

            <p className="text-title italic text-accent mt-2">is a design engineer</p>

            <ul className="mt-4 flex gap-4 text-body-lg">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 max-w-[24ch] space-y-4 text-body-lg text-ink">
              <p>Exploring the intersection of design, product, and the things in between.</p>
              <p>Currently at USC pursuing Economics and Business, head of BUILD at TroyLabs, and a cofounder of Traeco.</p>
            </div>
          </div>

          <a href="mailto:luwena@usc.edu" className="text-body-lg text-ink/50 hover:text-ink transition-colors">
            CONTACT&nbsp;&#8599;
          </a>
        </motion.aside>

        {/* RIGHT — scrolls */}
        <motion.section
          initial={false}
          animate={{ opacity: reveal ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: 0.3 }}
          className="px-[var(--margin-outer)] pt-[38vh] pb-[20vh]"
        >
          <WorkList />
        </motion.section>
      </div>
    </div>
  );
}
