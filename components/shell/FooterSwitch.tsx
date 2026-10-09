"use client";

import { usePathname } from "next/navigation";
import { useNav } from "@/components/nav/NavContext";
import SiteFooter from "@/components/shell/SiteFooter";

/*
  Mounts the static footer at the bottom of every page EXCEPT home, which
  renders its own reveal-at-the-end variant (and stays mounted under the
  works overlay, where the pathname says /works/[slug] but the home page
  is still the one on screen - hence the NavContext check).
*/
export default function FooterSwitch() {
  const pathname = usePathname();
  const { nav } = useNav();
  if (nav.home || pathname === "/") return null;
  return <SiteFooter mode="static" />;
}
