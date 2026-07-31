"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getWork } from "@/lib/works";
import CaseStudyContent from "@/components/works/CaseStudyContent";

/*
  INTERCEPTING OVERLAY.
  The (.)works/[slug] segment intercepts client-side navigation from "/" to
  "/works/[slug]" and renders this overlay INSTEAD of a full page load - so the
  home page stays mounted underneath and the WorkList image can fly to center
  (shared layoutId). A hard load / direct link skips this and hits the real page.

  Close = router.back() (restores the home page). Esc and backdrop click both close.
  Exit animations run because RouteMotion keys this slot inside AnimatePresence.

  IMPORTANT: the scrolling panel has NO opacity/transform animation of its own -
  the shared-layout image inside it must stay fully visible while it flies, and an
  animated ancestor would drag or fade it mid-morph. The flanks fade individually.
*/
export default function WorkOverlay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const work = getWork(slug);

  // Esc closes; body scroll locks while the overlay is up
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [router]);

  if (!work) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={() => router.back()}
        className="absolute inset-0 bg-paper/95 backdrop-blur-md"
      />
      {/* panel - static wrapper; content inside animates */}
      <div className="absolute inset-0 overflow-y-auto">
        {/* Close: 44px solid circle, mounted instantly at full opacity (no
            fade in - the reader launches the overlay intending to use it).
            Right edge sits on the mirrored --inset line, top edge on the nav
            band's top hairline (7.25vh), so it shares the page grid with the
            nav and the rail. Press = scale 0.985 on a 250/25 spring, no
            bounce, no hover animation. The ::after extends the hit area to
            the viewport's top-right corner (corners are infinite targets);
            visual size unchanged. */}
        <div className="fixed right-[var(--inset)] top-[7.25vh] z-10">
          <motion.button
            onClick={() => router.back()}
            aria-label="Close"
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-ink after:absolute after:bottom-[-8px] after:left-[-8px] after:right-[calc(var(--inset)*-1)] after:top-[calc(7.25vh*-1)] after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>
        <div className="px-[var(--inset-left)] pt-[18vh]">
          <CaseStudyContent work={work} variant="overlay" />
        </div>
      </div>
    </div>
  );
}
