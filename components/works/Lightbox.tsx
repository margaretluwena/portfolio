"use client";

import { useEffect, useState } from "react";

/*
  Click an image in a case study to see it large (Michelle Liu's review,
  2026-11-14: "if I click on it, then it would do the lightbox thing").
  One listener on the study's sections: any <img> that is not inside a link
  or a control opens here at its full pixel size, fitted to the window.
  Click anywhere, or press Escape, to close.
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

export default function Lightbox({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const [open, setOpen] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!(t instanceof HTMLImageElement)) return;
      if (t.closest("a, button, [data-no-zoom]")) return;
      setOpen({ src: original(t), alt: t.alt });
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

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={open.alt || "Image"}
      onClick={() => setOpen(null)}
      className="fixed inset-0 z-[60] grid cursor-zoom-out place-items-center bg-white/90 p-[4vmin] backdrop-blur-md"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={open.src} alt={open.alt} className="max-h-full max-w-full rounded-[6px] object-contain shadow-[0_20px_80px_rgba(0,0,0,0.18)]" />
    </div>
  );
}
