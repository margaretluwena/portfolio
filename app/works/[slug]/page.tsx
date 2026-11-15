import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getWork } from "@/lib/works";
import CaseStudyContent from "@/components/works/CaseStudyContent";

/*
  Standalone case study - the destination URL (direct links, refresh, SEO).
  Cards link straight here (the overlay morph is gone, 2026-10-20). Server
  component so pasted links carry the work's own title.
*/

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work || work.comingSoon) return {};
  const description = work.lede === "NEED" ? undefined : work.lede;
  /* a pasted link previews as the project, not the site: its own title,
     lede and hero (falls back to the site-wide card when a study has no hero) */
  const image = work.hero ?? work.cover;
  const images = image && image.src !== "NEED" ? [{ url: image.src, alt: image.alt || work.title }] : undefined;
  return {
    title: work.title,
    description,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: {
      title: `${work.title} · Margaret Luwena`,
      description,
      url: `/works/${work.slug}`,
      siteName: "Margaret Luwena",
      type: "article",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      creator: "@marluwena",
      title: `${work.title} · Margaret Luwena`,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWork(slug);

  /* comingSoon studies aren't reachable: redirect home instead of 404 so
     old-site links and muscle memory stay alive (slug parity is deliberate) */
  if (work?.comingSoon) redirect("/");

  if (!work) {
    return (
      <main className="grid min-h-screen place-items-center text-body-lg">
        <p>Not found. <Link href="/" className="text-link">Back home</Link></p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* the template's column centers itself; the rail's "Return" is the way back */}
      <div className="pt-[calc(6.36vh+70px)]">
        <CaseStudyContent work={work} variant="page" />
      </div>
    </main>
  );
}
