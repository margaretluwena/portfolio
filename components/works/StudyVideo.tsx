"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  Recorded product footage for a case study (Traeco, 2026-10-29): muted,
  looping, inline, no controls. The file is not requested until the figure
  is near the viewport, and playback follows visibility so nothing runs
  off-screen. Under prefers-reduced-motion the poster stands in for the
  clip. `label` is the accessible name; the visible caption lives beside it.
*/
export default function StudyVideo({ src, poster, aspect, label }: { src: string; poster: string; aspect: string; label: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setNear(true);
          if (e.isIntersecting && e.intersectionRatio > 0.25) el.play().catch(() => {});
          else el.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: [0, 0.25] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  if (reduce) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} className="block w-full rounded-[4px] bg-placeholder/40" style={{ aspectRatio: aspect }} />;
  }
  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className="block w-full rounded-[4px] bg-placeholder/40"
      style={{ aspectRatio: aspect }}
    />
  );
}
