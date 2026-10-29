"use client";

import "dialkit/styles.css";

/*
  Mounted once by DevTools, development only. The hooks in dials.ts reach
  DialKit through `require` (so production bundles never carry it); the
  root must come from that same copy, or the panels register in one store
  while the root watches another and nothing shows (found 2026-10-29).
*/
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DialRoot } = require("dialkit") as typeof import("dialkit");

export default function DialMount() {
  return <DialRoot position="top-right" defaultOpen={false} theme="light" />;
}
