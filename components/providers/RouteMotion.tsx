"use client";

import { LayoutGroup } from "motion/react";

/*
  Wraps BOTH the page content and the parallel @modal slot in one LayoutGroup so a
  motion element with layoutId in WorkList can morph into the same layoutId in the
  works overlay. Lives at the root layout because that's the common ancestor of both.
*/
export default function RouteMotion({ children }: { children: React.ReactNode }) {
  return <LayoutGroup>{children}</LayoutGroup>;
}
