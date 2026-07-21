"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";

/*
  Wraps BOTH the page content and the parallel @modal slot in one LayoutGroup so a
  motion element with layoutId in WorkList can morph into the same layoutId in the
  works overlay. Lives at the root layout because that's the common ancestor of both.

  The modal slot is gated by its own segment and keyed inside AnimatePresence:
  when the route exits the intercepted state, the keyed wrapper leaves the tree,
  AnimatePresence retains it for its exit animation, and the layoutId image morphs
  back to its card in the list.
*/
export default function RouteMotion({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const modalSegment = useSelectedLayoutSegment("modal");
  const modalActive = modalSegment !== null && modalSegment !== "__DEFAULT__";

  return (
    <LayoutGroup>
      {children}
      <AnimatePresence>
        {modalActive && <div key="works-overlay">{modal}</div>}
      </AnimatePresence>
    </LayoutGroup>
  );
}
