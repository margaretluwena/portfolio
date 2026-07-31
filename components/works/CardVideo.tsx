"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import type { CoverLayer } from "@/lib/works";

/*
  Autoplaying card-cover video. Playback is automatic and not
  user-controllable: no controls, pointer-events none (clicks pass through
  to the card link), tabIndex -1 (not a tab stop). The card stays the only
  interactive element.

  - Plays only while in the viewport (IntersectionObserver); pausing keeps
    currentTime, so scroll-out then scroll-in resumes rather than resets.
  - preload="metadata", WebM first with MP4 fallback, poster always set so
    the card never flashes empty on load.
  - Poster-only branches mount NO video element at all (nothing downloads):
    coarse pointers / small screens (battery, data, iOS Low Power Mode) and
    prefers-reduced-motion (autoplaying loops are a vestibular trigger -
    this branch is an OS accessibility setting, not a UI toggle, and stays).

  THE MORPH RULE: a playing video never rides the layoutId flight. While
  the route is off "/" (overlay opening/open) the video pauses under a
  static poster image, and playback resumes about a second after returning,
  once the flight has settled. No layoutId or flight logic lives here.
*/

/* Approximation, not real settle detection: the return flight is a 0.8s
   tween, so resuming 1s after the route lands on "/" clears it. Revisit
   with a proper onLayoutAnimationComplete hook after Sunday when the
   interaction queue unfreezes. */
const MORPH_SETTLE_MS = 1000;

export default function CardVideo({ layer }: { layer: CoverLayer }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const ref = useRef<HTMLVideoElement>(null);
  const [posterOnly, setPosterOnly] = useState(true); // poster-first until the media query resolves
  const [inView, setInView] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(hover: none), (pointer: coarse), (max-width: 767px)");
    const apply = () => setPosterOnly(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* morph freeze via route state only - no flight internals touched */
  useEffect(() => {
    if (pathname !== "/") {
      setSettled(false);
      return;
    }
    const t = setTimeout(() => setSettled(true), MORPH_SETTLE_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  const active = !reduce && !posterOnly && layer.src !== "NEED";

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const io = new IntersectionObserver(([o]) => setInView(o.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && inView && settled) el.play().catch(() => {});
    else el.pause();
  }, [active, inView, settled]);

  if (!active) {
    return layer.poster ? (
      <Image src={layer.poster} alt="" fill sizes="45vw" className="object-cover" />
    ) : null;
  }

  return (
    <>
      {/* no autoPlay: with it set, below-the-fold cards start downloading
          and playing before the observer pauses them. The IO's .play() at
          the 25% threshold is the only thing that starts playback. */}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={layer.poster}
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        {layer.srcWebm && <source src={layer.srcWebm} type="video/webm" />}
        <source src={layer.src} type="video/mp4" />
      </video>
      {/* during the flight the morph animates this still, not a decoding video */}
      {!settled && layer.poster && (
        <Image src={layer.poster} alt="" fill sizes="45vw" className="object-cover" />
      )}
    </>
  );
}
