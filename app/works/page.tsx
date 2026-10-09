import { indexWorks } from "@/lib/works";
import { WorkCard } from "@/components/works/WorkList";
import { PageEnter } from "@/components/providers/PageTransition";

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
      <PageEnter className="px-[max(24px,4.16vw)] pt-[17.5vh] pb-[12vh]">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[0.9vw]">
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
