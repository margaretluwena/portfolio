import { indexWorks } from "@/lib/works";
import { WorkCard } from "@/components/works/WorkList";
import { PageEnter } from "@/components/providers/PageTransition";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Works", description: "Every project: brand, product, and web work, with case studies where they exist." };

/*
  WORKS index - every project (the home column shows only `featured`).
  Figma "All works" 195:728 (2026-10-08): the home card, three to a row,
  from 4.16vw to 95.2vw with a 0.9vw gutter, first row at 17.5vh. Same
  <WorkCard/> as the home column, so a work looks identical in both places;
  unreachable studies (coming soon / parked) are the same card, not a link.
  Two columns on tablets, one on phones.
*/
export default function WorksIndex() {
  return (
    <main className="min-h-screen">
      <PageEnter className="px-[var(--inset)] pt-[17.5vh] pb-[12vh] md:pr-[calc(100vw-var(--align-r))]" /* between the nav's text edges, two cards to a row (2026-11-14; was 4.16vw margins, three to a row) */>
        <h1 className="sr-only">Works</h1>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-[2vw]">
          {indexWorks.map((w, i) => (
            <li key={w.slug} data-work={w.slug}>
              <WorkCard work={w} index={i} />
            </li>
          ))}
        </ul>
      </PageEnter>
    </main>
  );
}
