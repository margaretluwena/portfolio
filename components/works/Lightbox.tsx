"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
  Click an image in a case study to see it large (Michelle Liu's review,
  2026-11-14). It opens the way a piece does on the playground (Margaret,
  same day: the first version filled the window and was "way too large"):
  a dim backdrop, the image fitted inside 80vh by 88vw at its own shape and
  never drawn larger than its own pixels allow at this screen's density,
  springing up a little as it arrives. Click anywhere, or press Escape, to
  close. One listener on the study's column: any <img> that is not inside
  a link or a control opens here.
*/

/* next/image serves a resized copy; the original path is in its `url` param */
function original(img: HTMLImageElement): string {
  const src = img.currentSrc || img.src;
  try {
    const u = new URL(src, window.location.href);
    const raw = u.pathname.startsWith("/_next/image") ? u.searchParams.get("url") : null;
    return raw ?? src;
  } catch {
    return src;
  }
}

type Open = { src: string; alt: string; w: number; h: number };

export default function Lightbox({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<Open | null>(null);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!(t instanceof HTMLImageElement)) return;
      if (t.closest("a, button, [data-no-zoom]")) return;
      /* the image's own shape, from its width/height attributes (next/image sets them to the source's pixels) */
      const w = Number(t.getAttribute("width")) || t.naturalWidth || 1600;
      const h = Number(t.getAttribute("height")) || t.naturalHeight || 1000;
      setOpen({ src: original(t), alt: t.alt, w, h });
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [scope]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={open.alt || "Image"}
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[60] grid cursor-zoom-out place-items-center bg-black/55 p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
        >
          <motion.div
            initial={reduce ? false : { scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="max-h-[80vh] max-w-[88vw]"
            /* fitted to 80vh x 88vw, and capped at the source's own width so a small screenshot is not blown up soft */
            style={{ aspectRatio: `${open.w} / ${open.h}`, width: `min(88vw, calc(80vh * ${open.w / open.h}), ${open.w}px)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.src} alt={open.alt} draggable={false} className="block h-full w-full rounded-[4px] object-contain shadow-[0_30px_80px_rgba(0,0,0,0.35)]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
