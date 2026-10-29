/*
  Dev-only registry for the case-study transport bar (2026-10-29). Each
  coded animation registers the playback controls of its Motion sequence
  when it mounts, and the bar drives them: play, pause, restart, scrub,
  speed. Motion's AnimationPlaybackControls expose time, speed and duration
  directly, so scrubbing lands on the exact frame.
*/
export type Transport = {
  id: string;
  label: string;
  duration: () => number;
  getTime: () => number;
  setTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  setSpeed: (s: number) => void;
  isPlaying: () => boolean;
};

const items = new Map<string, Transport>();
const listeners = new Set<() => void>();
let snapshot: Transport[] = [];

const emit = () => {
  snapshot = Array.from(items.values());
  listeners.forEach((fn) => fn());
};

export function registerTransport(t: Transport): () => void {
  items.set(t.id, t);
  emit();
  return () => {
    if (items.get(t.id) === t) { items.delete(t.id); emit(); }
  };
}

export function subscribeTransports(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export const getTransports = () => snapshot;
