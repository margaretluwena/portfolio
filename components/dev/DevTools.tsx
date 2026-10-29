"use client";

import dynamic from "next/dynamic";

/*
  Development-only tooling for the case studies (2026-10-29): DialKit's
  panel root and the animation transport bar. Both are loaded lazily and
  only when NODE_ENV is development, so production bundles carry neither.
*/
const Dials = dynamic(() => import("@/components/dev/DialMount"), { ssr: false });
const Transport = dynamic(() => import("@/components/dev/StudyTransport"), { ssr: false });

export default function DevTools() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <>
      <Dials />
      <Transport />
    </>
  );
}
