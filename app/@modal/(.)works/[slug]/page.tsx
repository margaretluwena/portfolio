"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getWork } from "@/lib/works";
import CaseStudyContent from "@/components/works/CaseStudyContent";

/*
  INTERCEPTING OVERLAY.
  The (.)works/[slug] segment intercepts client-side navigation from "/" to
  "/works/[slug]" and renders this overlay INSTEAD of a full page load — so the
  home page stays mounted underneath and the WorkList image can fly to center
  (shared layoutId). A hard load / direct link skips this and hits the real page.

  Close = router.back() (restores the home page). Esc and backdrop click both close.
  Exit animations run because RouteMotion keys this slot inside AnimatePresence.

  IMPORTANT: the scrolling panel has NO opacity/transform animation of its own —
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
        className="absolute inset-0 bg-paper/80 backdrop-blur-sm"
      />
      {/* panel — static wrapper; content inside animates */}
      <div className="absolute inset-0 overflow-y-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          onClick={() => router.back()}
          aria-label="Close"
          className="fixed right-[var(--margin-outer)] top-[var(--nav-top)] z-10 text-body-lg text-ink/60 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Close ✕
        </motion.button>
        <div className="px-[var(--margin-outer)] pt-[18vh]">
          <CaseStudyContent work={work} variant="overlay" />
        </div>
      </div>
    </div>
  );
}
