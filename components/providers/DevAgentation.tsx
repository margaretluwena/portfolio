"use client";

import { Agentation } from "agentation";

/*
  Agentation (agentation.com) - visual feedback for coding agents: click
  elements on the running site, annotate, copy structured markdown with
  selectors. Dev-only; renders nothing in production builds.
*/
export default function DevAgentation() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation />;
}
