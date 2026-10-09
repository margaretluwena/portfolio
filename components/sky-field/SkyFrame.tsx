"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import SkyFieldBackground from "@/components/sky-field/SkyFieldBackground";

/*
  Route-aware frame around Margaret's Sky Field (components/sky-field, her
  files, untouched). The canvas itself is fixed + z-index -1 inside; this
  wrapper only fades it:

    home                                      -> sky at 0.75
    about / works index / play / 404          -> sky at 0.35 (Margaret,
                                                 2026-10-08: lower everywhere
                                                 but the main page)
    /works/[slug] (the case studies)          -> sky fades out (0.6s)

  Case studies are long-form reading on a plain white page (Margaret's
  2026-10-08 template), so the sky bows out there - including under the
  home overlay, whose 95% paper backdrop covers it anyway.

  The wrapper is the fixed viewport layer and rides UP by --sky-lift, which
  SiteFooter publishes as the height of the band currently in the viewport:
  scrolling the footer in pushes the hills and the dog up ahead of it, so
  the footer sits below them instead of showing them through its frost
  (Margaret, 2026-10-08).

  `cover` 0.74 + `wind` 1.5 keep more clouds in motion at once (Margaret,
  2026-10-08). `depth` 0.4 pins the sky gradient to the top ~27vh, leaving
  the identity block at 24vh on sparse specks and the bio/cards on open
  white, with the flower hills along the bottom - the arrangement in the
  Figma main page (190:642). `hills` 0.55 keeps those hills to the bottom
  ~15vh while `bumps` 1.7 keeps them rolling ("a little more bumpy"),
  `hillTexture` 0.45 calms the dither on them, `flowers` 0.5 thins
  the meadow, `cellSize` 7 makes the whole grid finer, `ballX` 0.17 parks
  the ball under the bio in the left column - the works column covers the
  original 0.62 with card links, which made it ungrabbable (Margaret,
  2026-10-08).
*/

/* every visitor who throws the ball gets a player number, once, from the
   global counter (app/api/throws) and keeps it in localStorage - so the
   dog greets the same person with the same number on later visits */
const PLAYER_KEY = "sky:player";
const stored = () => {
  try { const v = Number(localStorage.getItem(PLAYER_KEY)); return v > 0 ? v : null; } catch { return null; }
};
async function countThrow(): Promise<number> {
  const have = stored();
  if (have) return have;
  const r = await fetch("/api/throws", { method: "POST" });
  const j = (await r.json()) as { throws: number | null };
  if (typeof j.throws !== "number") throw new Error("no count");
  try { localStorage.setItem(PLAYER_KEY, String(j.throws)); } catch {}
  return j.throws;
}
async function readCount(): Promise<number> {
  const have = stored();
  if (!have) throw new Error("not a player yet");
  return have;
}

export default function SkyFrame() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const study = /^\/works\/[^/]+/.test(pathname);
  const home = pathname === "/";
  const strength = study ? 0 : home ? 0.75 : 0.35;

  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: strength }}
      transition={{ duration: reduce ? 0 : 0.6, ease: "easeOut" }}
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ transform: "translateY(calc(var(--sky-lift, 0px) * -1))", willChange: "transform" }}
    >
      <SkyFieldBackground
        cellSize={7}
        cover={0.74}
        wind={1.5}
        depth={0.4}
        hills={0.55}
        bumps={1.7}
        hillTexture={0.45}
        flowers={0.5}
        ballX={0.17}
        onThrow={countThrow}
        onCount={readCount}
      />
    </motion.div>
  );
}
