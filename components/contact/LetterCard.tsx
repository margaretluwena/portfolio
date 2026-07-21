"use client";

/*
  CONTACT — the 3D letter.
  A card/letter you can push around with the cursor (it tilts toward the pointer,
  parallax on the contents). Pressing "Send" folds the letter, flies it into a
  mailbox, the flag/door closes, and the copy swaps to "Sent."

  This file gives you a working mouse-tilt card (CSS 3D — light, no WebGL needed)
  plus the send-sequence scaffold. If you want a *real* 3D letter with depth,
  shadows, and a paper material, switch the card to react-three-fiber
  (drei <RoundedBox> for card + mailbox, useSpring for the fold) — the state
  machine below stays the same. Ask Claude Code to "promote LetterCard to r3f".

  Send sequence (state machine): idle -> folding -> flying -> closing -> sent
*/

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

type Phase = "idle" | "folding" | "flying" | "closing" | "sent";

export default function LetterCard() {
  const [phase, setPhase] = useState<Phase>("idle");
  const wrap = useRef<HTMLDivElement>(null);

  // pointer -> tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 15 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 15 });

  function onMove(e: React.PointerEvent) {
    if (phase !== "idle") return;
    const r = wrap.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function reset() { mx.set(0); my.set(0); }

  async function send() {
    setPhase("folding");
    await wait(450);
    setPhase("flying");
    await wait(650);
    setPhase("closing");
    await wait(500);
    setPhase("sent");
    // TODO: actually deliver — mailto:, a form endpoint, or Resend/Formspree.
  }

  return (
    <div className="grid min-h-[70vh] place-items-center [perspective:1200px]">
      {/* mailbox target (simplified). Replace with a real drawn/rendered mailbox. */}
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 -z-10 h-40 w-56 -translate-x-1/2 -translate-y-1/2 rounded-md border border-ink/20 bg-paper" />

        <motion.div
          ref={wrap}
          onPointerMove={onMove}
          onPointerLeave={reset}
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          animate={
            phase === "flying" || phase === "closing" || phase === "sent"
              ? { scale: 0.15, y: 0, opacity: phase === "sent" ? 0 : 1 }
              : phase === "folding"
              ? { scaleY: 0.62 }
              : { scale: 1 }
          }
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative h-[293px] w-[420px] rounded-lg border border-ink/10 bg-paper p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]"
        >
          <p className="text-body-lg text-ink">Margaret Luwena is…</p>
          {/* letter body / fields go here */}
          <div className="mt-6 space-y-3 text-body-lg text-ink/60">
            <p>a designer, engineer, and builder.</p>
            <p>Say hello — luwena@usc.edu</p>
          </div>

          {phase === "idle" && (
            <button
              onClick={send}
              className="absolute bottom-6 right-6 rounded-full border border-ink px-5 py-2 text-body-lg transition-colors hover:bg-ink hover:text-paper"
            >
              Send ↗
            </button>
          )}
        </motion.div>

        {phase === "sent" && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 grid place-items-center wordmark text-title text-ink"
          >
            Sent.
          </motion.p>
        )}
      </div>
    </div>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
