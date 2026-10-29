"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getTransports, subscribeTransports, type Transport } from "@/components/dev/transport";

/*
  Dev-only transport bar for the coded case-study animations (2026-10-29):
  one row per registered animation with play / pause / restart, a scrubber
  across its full duration, and a shared 0.25x / 0.5x / 1x speed. Shift+T
  shows and hides it. Mounted only in development (see DevTools).
*/
const SPEEDS = [0.25, 0.5, 1] as const;

export default function StudyTransport() {
  const transports = useSyncExternalStore(subscribeTransports, getTransports, getTransports);
  const [visible, setVisible] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "T" || e.key === "t") && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { transports.forEach((t) => t.setSpeed(speed)); }, [speed, transports]);

  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-hairline bg-white/92 px-4 py-2 font-mono text-[11px] text-ink backdrop-blur" role="region" aria-label="Animation transport (dev)">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-1.5">
        <div className="flex items-center gap-3 text-ink/50">
          <span>transport · shift+T hides{transports.length === 0 ? " · scroll an animation into view to drive it" : ""}</span>
          <span className="ml-auto flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button key={s} type="button" onClick={() => setSpeed(s)} className={`rounded px-2 py-0.5 ${speed === s ? "bg-ink text-white" : "hover:bg-black/5"}`}>{s}x</button>
            ))}
          </span>
        </div>
        {transports.map((t) => <Row key={t.id} t={t} />)}
      </div>
    </div>
  );
}

function Row({ t }: { t: Transport }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scrubbing = useRef(false);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!scrubbing.current) { setTime(t.getTime()); setPlaying(t.isPlaying()); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [t]);
  const dur = Math.max(0.01, t.duration());
  return (
    <div className="flex items-center gap-2">
      <span className="w-[150px] truncate">{t.label}</span>
      <button type="button" className="rounded px-2 py-0.5 hover:bg-black/5" onClick={() => (playing ? t.pause() : t.play())}>{playing ? "pause" : "play"}</button>
      <button type="button" className="rounded px-2 py-0.5 hover:bg-black/5" onClick={() => t.restart()}>restart</button>
      <input
        type="range"
        min={0}
        max={dur}
        step={0.01}
        value={Math.min(time, dur)}
        onPointerDown={() => { scrubbing.current = true; t.pause(); }}
        onPointerUp={() => { scrubbing.current = false; }}
        onChange={(e) => { const v = Number(e.target.value); t.setTime(v); setTime(v); }}
        className="h-1 flex-1 accent-black"
        aria-label={`Scrub ${t.label}`}
      />
      <span className="w-[90px] text-right tabular-nums text-ink/60">{time.toFixed(2)} / {dur.toFixed(2)}s</span>
    </div>
  );
}
