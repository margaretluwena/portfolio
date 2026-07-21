"use client";

import { use } from "react";
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
  NOTE for Claude Code: verify the shared-layout morph plays here; if the image
  "pops" instead of flying, ensure RouteMotion's LayoutGroup wraps both slots and
  that WorkList's card and this panel use the exact same layoutId string.
*/
export default function WorkOverlay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const work = getWork(slug);
  if (!work) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => router.back()}
        className="absolute inset-0 bg-paper/80 backdrop-blur-sm"
      />
      {/* panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 overflow-y-auto"
      >
        <button
          onClick={() => router.back()}
          aria-label="Close"
          className="fixed right-[var(--margin-outer)] top-[var(--nav-top)] z-10 text-body-lg text-ink/60 hover:text-ink"
        >
          Close ✕
        </button>
        <div className="px-[var(--margin-outer)] pt-[18vh]">
          <CaseStudyContent work={work} variant="overlay" />
        </div>
      </motion.div>
    </div>
  );
}
