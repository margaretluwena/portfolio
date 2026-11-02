"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useAnimate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { useStudyDials, toTransition } from "@/components/dev/dials";
import { registerTransport } from "@/components/dev/transport";
import defaults from "@/lib/dials/integration-snippet.json";

/* ─────────────────────────────────────────────────────────
 * INTEGRATION SNIPPET (Traeco, Problem 1)
 *
 *    0s   waiting for scroll into view
 *    0s   line 1 types itself (typingSpeed chars/s)
 *    +lineGap   line 2 types itself
 *    +dashboardDelay   the captured home rises in (dashboardSpring) over
 *                      the empty dashboard that was there all along
 *    +loopPause   reset and play again (0 = play once)
 *
 * The right side is never blank (Margaret, 2026-11-02): an empty dashboard,
 * the home's layout as muted blocks, sits there while the code types, and
 * turns into the full dashboard when the run finishes.
 * ───────────────────────────────────────────────────────── */

const CONTEXT = ["import os", "from anthropic import Anthropic", "from traeco import init, wrap", ""];
const LINE_1 = 'init(api_key=os.environ["TRAECO_API_KEY"], agent_name="my_agent")';
const LINE_2 = "client = wrap(Anthropic())   # read-only: logs tokens, cost, latency";
/* then the run, typed at the prompt below the file; the dashboard is what comes back */
const RUN = "python agent.py";

export default function IntegrationSnippet() {
  const d = useStudyDials("IntegrationSnippet", "integration-snippet", {
    typingSpeed: [defaults.typingSpeed, 10, 80, 5],
    lineGap: [defaults.lineGap, 0, 1.5, 0.05],
    dashboardDelay: [defaults.dashboardDelay, 0, 1, 0.05],
    dashboardSpring: defaults.dashboardSpring as { type: "spring"; visualDuration: number; bounce: number },
    dashboardRise: [defaults.dashboardRise, 0, 40, 1],
    loopPause: [defaults.loopPause, 0, 6, 0.5],
    triggerThreshold: [defaults.triggerThreshold, 0, 1, 0.05],
  });
  const reduce = useReducedMotion();
  const [scope, animateScope] = useAnimate();
  const inView = useInView(scope, { amount: d.triggerThreshold });
  const chars = useMotionValue(0);
  const [typed, setTyped] = useState(0);
  useMotionValueEvent(chars, "change", (v) => setTyped(Math.round(v)));
  const total = LINE_1.length + LINE_2.length + RUN.length;
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce) {
      chars.set(total);
      animateScope("[data-shot]", { opacity: 1, y: 0 }, { duration: 0 });
      return;
    }
    if (!inView) return;
    let stopped = false;
    let seq: ReturnType<typeof animate> | null = null;
    const reset = () => {
      chars.set(0);
      animateScope("[data-shot]", { opacity: 0, y: d.dashboardRise }, { duration: 0 });
    };
    const run = () => {
      reset();
      seq = animate([
        [chars, LINE_1.length, { duration: LINE_1.length / d.typingSpeed, ease: "linear" }],
        [chars, LINE_1.length + LINE_2.length, { duration: LINE_2.length / d.typingSpeed, ease: "linear", at: `+${d.lineGap}` }],
        [chars, total, { duration: RUN.length / d.typingSpeed, ease: "linear", at: `+${d.lineGap * 1.5}` }],
        [scope.current.querySelector("[data-shot]")!, { opacity: 1, y: 0 }, { ...toTransition(d.dashboardSpring), at: `+${d.dashboardDelay}` }],
      ]);
      seq.then(() => {
        if (stopped || d.loopPause <= 0) return;
        loopTimer.current = setTimeout(() => { if (!stopped) run(); }, d.loopPause * 1000);
      });
      register();
    };
    const register = () => {
      unregister?.();
      unregister = registerTransport({
        id: "integration-snippet",
        label: "Integration snippet",
        duration: () => seq?.duration ?? 0,
        getTime: () => seq?.time ?? 0,
        setTime: (t) => { if (seq) seq.time = t; },
        play: () => seq?.play(),
        pause: () => seq?.pause(),
        restart: () => { if (loopTimer.current) clearTimeout(loopTimer.current); run(); },
        setSpeed: (s) => { if (seq) seq.speed = s; },
        isPlaying: () => !!seq && seq.state === "running",
      });
    };
    let unregister: (() => void) | undefined;
    run();
    return () => {
      stopped = true;
      if (loopTimer.current) clearTimeout(loopTimer.current);
      seq?.stop();
      unregister?.();
    };
    // every dial is a dependency on purpose: a change rebuilds the sequence
  }, [inView, reduce, chars, total, scope, animateScope, d.typingSpeed, d.lineGap, d.dashboardDelay, d.dashboardSpring, d.dashboardRise, d.loopPause]);

  const t1 = LINE_1.slice(0, Math.min(typed, LINE_1.length));
  const t2 = typed > LINE_1.length ? LINE_2.slice(0, Math.min(typed - LINE_1.length, LINE_2.length)) : "";
  const t3 = typed > LINE_1.length + LINE_2.length ? RUN.slice(0, typed - LINE_1.length - LINE_2.length) : "";
  const caretOn = typed < total ? (typed <= LINE_1.length ? 1 : typed <= LINE_1.length + LINE_2.length ? 2 : 3) : 0;

  return (
    <div ref={scope} className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-6">
      {/* a terminal window: title bar with the file name, the two lines in the
          site's mono face on ink, the typed lines in the study's accent. On md+
          it is absolutely placed in its cell so the still beside it sets the
          row's height and is never cropped (Margaret, 2026-10-29). */}
      <div className="relative md:min-h-0">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-[6px] bg-ink md:absolute md:inset-0" aria-label="Two-line Traeco integration">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <span className="h-[9px] w-[9px] rounded-full bg-white/25" />
          <span className="h-[9px] w-[9px] rounded-full bg-white/25" />
          <span className="h-[9px] w-[9px] rounded-full bg-white/25" />
          <span className="ml-2 font-mono text-[11px] text-white/45">agent.py</span>
        </div>
        <pre className="flex-1 whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-[1.7] text-white/55 md:text-[13px]">
          {CONTEXT.map((l, i) => <span key={i} className="block">{l || NBSP}</span>)}
          <span className="block text-[var(--study-blue)]">{t1}{caretOn === 1 && <Caret />}</span>
          <span className="block text-[var(--study-blue)]">{t2 || (caretOn === 2 ? "" : NBSP)}{caretOn === 2 && <Caret />}</span>
        </pre>
        {/* the prompt: the run that produces the dashboard beside it */}
        <div className="border-t border-white/10 px-4 py-3 font-mono text-[12px] leading-[1.7] text-white/80 md:text-[13px]">
          <span className="text-white/40">$ </span>{t3}{caretOn === 3 && <Caret />}
        </div>
      </div>
      </div>
      {/* the dashboard: empty while the code types (the home's layout as
          muted blocks, breathing), then the still of the home with the
          sidebar collapsed, down through the top recommendations, fades in
          over it when the run finishes */}
      <div className="relative overflow-hidden rounded-[6px] bg-[#111214]" style={{ aspectRatio: "1128 / 900" }}>
        <EmptyDashboard />
        <div data-shot className="absolute inset-0" style={{ opacity: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/traeco/home-still.png" alt="Traeco home after the first traces arrive: savings available and the top recommendations" className="block h-full w-full object-cover object-top" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

/* the home with nothing in it yet: the collapsed rail, the greeting line,
   the two-by-two of stat cards, the savings card and three recommendation
   rows, every value a muted block. Proportions follow home-still.png. The
   blocks breathe slowly (none under reduced motion) so it reads as waiting
   for traces, not as a broken image. */
function EmptyDashboard() {
  const block = "rounded-[3px] bg-white/[0.08]";
  const faint = "rounded-[3px] bg-white/[0.05]";
  const card = "rounded-[6px] border border-white/[0.06] bg-white/[0.03]";
  return (
    <div aria-hidden className="absolute inset-0 flex motion-safe:animate-[pulse_3.2s_ease-in-out_infinite]">
      {/* the rail */}
      <div className="flex w-[5.6%] shrink-0 flex-col items-center gap-[7%] border-r border-white/[0.06] pt-[6%]">
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--study-blue)]/60" />
        <span className="h-[8px] w-[8px] rounded-[2px] bg-white/[0.12]" />
        <span className="h-[8px] w-[8px] rounded-[2px] bg-white/[0.08]" />
        <span className="h-[8px] w-[8px] rounded-[2px] bg-white/[0.08]" />
        <span className="h-[8px] w-[8px] rounded-[2px] bg-white/[0.08]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[2.4%] px-[4%] pt-[4.4%]">
        {/* greeting and the one-line summary */}
        <div className={`${block} h-[3.2%] w-[28%]`} />
        <div className={`${faint} -mt-[0.8%] h-[1.6%] w-[64%]`} />
        {/* two by two stat cards */}
        <div className="mt-[1%] grid grid-cols-2 gap-[2.4%]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${card} flex flex-col gap-[6%] px-[5%] py-[6%]`}>
              <div className={`${faint} h-[6px] w-[34%]`} />
              <div className={`${block} h-[12px] w-[48%]`} />
              {i === 0 && <div className="h-[3px] w-full rounded-full bg-white/[0.06]"><div className="h-full w-[48%] rounded-full bg-[var(--study-blue)]/50" /></div>}
              <div className={`${faint} h-[5px] w-[42%]`} />
            </div>
          ))}
        </div>
        {/* savings, then the three recommendations */}
        <div className={`${card} flex flex-1 flex-col px-[3.4%] pt-[3.4%]`}>
          <div className="h-[6px] w-[18%] rounded-[3px] bg-[var(--study-blue)]/45" />
          <div className="mt-[3%] flex items-end gap-[2%]">
            <div className={`${block} h-[20px] w-[26%]`} />
            <div className={`${faint} h-[6px] w-[30%]`} />
          </div>
          <div className={`${faint} mt-[2.4%] h-[5px] w-[70%]`} />
          <div className="mt-[4%] flex flex-1 flex-col divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-1 items-center gap-[3%]">
                <div className={`${faint} h-[5px] w-[3%]`} />
                <div className="flex flex-1 flex-col gap-[6px]">
                  <div className={`${block} h-[7px] w-[58%]`} />
                  <div className={`${faint} h-[5px] w-[30%]`} />
                </div>
                <div className="h-[7px] w-[9%] rounded-[3px] bg-[var(--study-blue)]/40" />
                <div className="h-[16px] w-[11%] rounded-[4px] bg-white/[0.08]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const NBSP = String.fromCharCode(160);
const Caret = () => <span aria-hidden className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-[var(--study-blue)] align-baseline" />;
