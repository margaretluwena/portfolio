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

  THE SETTLE RULE: the video starts about a second after the route it is
  on has landed, under a static poster until then, so a page's entrance
  never animates a decoding video. It used to play only on "/" (a relic
  of the fly-to-centre morph, which is gone) and so sat still on the
  works index (Margaret, 2026-11-04). No layoutId or flight logic lives
  here.
*/

/* the page's entrance is a 0.5s fade plus the cards' rise; 1s clears it */
const SETTLE_MS = 1000;

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

  /* the route landed: settle a second later, on any page */
  useEffect(() => {
    setSettled(false);
    const t = setTimeout(() => setSettled(true), SETTLE_MS);
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
      {/* through the page's entrance this still shows, not a decoding video */}
      {!settled && layer.poster && (
        <Image src={layer.poster} alt="" fill sizes="45vw" className="object-cover" />
      )}
    </>
  );
}
