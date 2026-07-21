"use client";

import Image from "next/image";
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

  The wordmark is NOT inside the fading group: it must stay fully opaque while
  it flies in from the intro (shared layoutId). Everything else fades in around it.
*/

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/margaretluwena/", icon: "/assets/icon-linkedin.png" },
  { label: "X", href: "https://x.com/", icon: "/assets/icon-x.png" },
  { label: "Instagram", href: "https://www.instagram.com/margaret.luwena/", icon: "/assets/icon-instagram.png" },
];

export default function PortfolioShell({ reveal, reduce }: { reveal: boolean; reduce: boolean }) {
  const fade = (delay: number) => ({
    initial: false as const,
    animate: { opacity: reveal ? 1 : 0 },
    transition: { duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay },
  });

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
        {/* LEFT — sticky */}
        <aside className="md:sticky md:top-0 md:flex md:h-screen flex-col justify-between px-[var(--inset-left)] pt-[30vh] pb-[calc(var(--margin-outer)+0.5rem)]">
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

            <motion.div {...fade(0.55)}>
              <p className="text-title italic text-accent mt-2 font-body">is a design engineer</p>

              <ul className="mt-5 flex items-center gap-5">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={s.label}
                      target="_blank"
                      rel="noreferrer"
                      className="block transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <Image src={s.icon} alt="" width={26} height={26} className="h-[26px] w-auto" />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-[10vh] max-w-[24ch] space-y-4 text-body-lg text-ink">
                <p>Exploring the intersection of design, product, and the things in between.</p>
                <p>Currently at USC pursuing Economics and Business, head of BUILD at TroyLabs, and a cofounder of Traeco.</p>
              </div>
            </motion.div>
          </div>

          <motion.div {...fade(0.7)}>
            <a
              href="mailto:luwena@usc.edu"
              className="inline-flex items-center gap-2 text-body-lg tracking-wide text-ink/50 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              CONTACT
              <Image src="/assets/contact-arrow.svg" alt="" width={16} height={18} />
            </a>
          </motion.div>
        </aside>

        {/* RIGHT — scrolls */}
        <motion.section {...fade(0.45)} className="px-[var(--margin-outer)] pt-[16vh] pb-[20vh] md:border-l md:border-ink/20">
          <WorkList />
        </motion.section>
      </div>
    </div>
  );
}
