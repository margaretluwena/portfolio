"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  Recorded product footage for a case study (Traeco, 2026-10-29): muted,
  looping, inline, no controls. The frame owns the size (a sized box in
  the clip's aspect) and the video fills it, so it never renders at the
  element's default 300x150 before metadata arrives (Margaret saw the clip
  "tiny" inside the grey box, 2026-10-29). The file is not requested until
  the figure is near the viewport, playback follows visibility, and under
  prefers-reduced-motion the poster stands in for the clip.
*/
export default function StudyVideo({ src, poster, aspect, label, width = 2256, height = 1246 }: { src: string; poster: string; aspect: string; label: string; width?: number; height?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const showing = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setNear(true);
          showing.current = e.isIntersecting && e.intersectionRatio > 0.25;
          if (showing.current && el.getAttribute("src")) el.play().catch(() => {});
          else el.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: [0, 0.25, 0.5] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // the source lands a render after the observer fired: start it then
  useEffect(() => {
    const el = ref.current;
    if (!el || !near || reduce) return;
    if (showing.current) el.play().catch(() => {});
  }, [near, reduce]);

  return (
    <div className="relative w-full overflow-hidden rounded-[4px] bg-placeholder/40" style={{ aspectRatio: aspect }}>
      {reduce ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video
          ref={ref}
          src={near ? src : undefined}
          poster={poster}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
