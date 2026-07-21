import { redirect } from "next/navigation";

/* The main page carries the about content (bio, socials, contact) — see
   PortfolioShell. ABOUT in the nav points at "/"; this route just catches
   old links and muscle memory. */
export default function About() {
  redirect("/");
}
