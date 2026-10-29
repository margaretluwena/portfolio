"use client";

import type { DialConfig, ResolvedValues, TransitionConfig } from "dialkit";

/*
  DialKit for the case-study animations (2026-10-29). In development each
  component gets a panel named after it, persisted under a stable id, with
  a "Save as defaults" button that posts the current values to
  app/api/dials, which writes lib/dials/<id>.json. The components read their
  defaults from those files, so a saved panel is what production ships.

  In production DialKit is not loaded at all: the `require` below is dead
  code once NODE_ENV is inlined, and the hook resolves the config's
  defaults statically. The branch is decided once per build, so the hook
  order never changes between renders.
*/
const DEV = process.env.NODE_ENV === "development";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dk: typeof import("dialkit") | null = DEV ? require("dialkit") : null;

/* a DialKit transition config as Motion wants it */
export function toTransition(t: TransitionConfig): Record<string, unknown> {
  if (t.type === "easing") return { duration: t.duration, ease: t.ease };
  const { type, ...rest } = t;
  return { type, ...rest };
}

/* the length of a transition in seconds, for sequencing clips after it */
export function transitionLength(t: TransitionConfig): number {
  if (t.type === "easing") return t.duration;
  if (t.visualDuration) return t.visualDuration;
  // physics springs: a rough settle estimate, good enough to place the next clip
  const stiffness = t.stiffness ?? 100, damping = t.damping ?? 10, mass = t.mass ?? 1;
  return Math.min(3, Math.max(0.2, (4 * mass) / Math.max(0.5, damping / Math.sqrt(stiffness))));
}

function resolveStatic<T extends DialConfig>(config: T): ResolvedValues<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config)) {
    if (Array.isArray(v)) out[k] = v[0];
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (o.type === "select") out[k] = (o.default as string) ?? ((o.options as unknown[])[0] as string);
      else if (o.type === "color" || o.type === "text") out[k] = o.default ?? "";
      else if (o.type === "action") continue;
      else if (o.type === "spring" || o.type === "easing") out[k] = v;
      else out[k] = resolveStatic(v as DialConfig);
    } else out[k] = v;
  }
  return out as ResolvedValues<T>;
}

async function saveDefaults(id: string, values: unknown) {
  try {
    const r = await fetch("/api/dials", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, values }) });
    const j = await r.json();
    console.info(`[dials] ${r.ok ? "saved" : "failed"} ${id}`, j);
  } catch (e) {
    console.warn("[dials] save failed", e);
  }
}

function useDevDials<T extends DialConfig>(name: string, id: string, config: T): ResolvedValues<T> {
  const withSave = { ...config, saveDefaults: { type: "action" as const, label: "Save as defaults" } };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ctl = dk!.useDialKitController(name, withSave, {
    id,
    persist: true,
    onAction: (action) => {
      if (action !== "saveDefaults") return;
      const { saveDefaults: _skip, ...values } = ctl.getValues() as Record<string, unknown>;
      void _skip;
      void saveDefaults(id, values);
    },
  });
  return ctl.values as unknown as ResolvedValues<T>;
}

export function useStudyDials<T extends DialConfig>(name: string, id: string, config: T): ResolvedValues<T> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return dk ? useDevDials(name, id, config) : resolveStatic(config);
}
