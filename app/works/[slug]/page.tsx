import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getWork } from "@/lib/works";
import Nav from "@/components/nav/Nav";
import CaseStudyContent from "@/components/works/CaseStudyContent";

/*
  Standalone case study - the destination URL (direct links, refresh, SEO).
  When opened by clicking a work on the home page, the intercepting overlay
  (app/@modal/(.)works/[slug]) shows instead, with the fly-to-center morph.
  Server component so pasted links carry the work's own title.
*/

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work || work.comingSoon || work.indexOnly) return {};
  return { title: work.title, description: work.lede === "NEED" ? undefined : work.lede };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWork(slug);

  /* comingSoon + indexOnly studies aren't reachable: redirect home instead
     of 404 so old-site links and muscle memory stay alive (slug parity is
     deliberate; indexOnly pages stay parked in code) */
  if (work?.comingSoon || work?.indexOnly) redirect("/");

  if (!work) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper text-body-lg">
        <p>Not found. <Link href="/" className="underline">Back home</Link></p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; {work.title.toLowerCase()} &ndash;</span>} />
      <div className="px-[var(--inset-left)] pt-[22vh]">
        <CaseStudyContent work={work} variant="page" />
        <footer className="pb-[10vh]">
          <Link href="/" className="text-body-lg text-ink/50 hover:text-ink">&#8592; All works</Link>
        </footer>
      </div>
    </main>
  );
}
