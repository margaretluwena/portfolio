"use client";

import { use } from "react";
import Link from "next/link";
import { getWork } from "@/lib/works";
import Nav from "@/components/nav/Nav";
import CaseStudyContent from "@/components/works/CaseStudyContent";

/*
  Standalone case study — the destination URL (direct links, refresh, SEO).
  When opened by clicking a work on the home page, the intercepting overlay
  (app/@modal/(.)works/[slug]) shows instead, with the fly-to-center morph.
*/
export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const work = getWork(slug);

  if (!work) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper text-body-lg">
        <p>Not found. <Link href="/" className="underline">Back home</Link></p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<Link href="/">LOGO</Link>} />
      <div className="px-[var(--margin-outer)] pt-[22vh]">
        <CaseStudyContent work={work} variant="page" />
        <footer className="pb-[10vh]">
          <Link href="/" className="text-body-lg text-ink/50 hover:text-ink">&#8592; All works</Link>
        </footer>
      </div>
    </main>
  );
}
