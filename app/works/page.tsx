import Link from "next/link";
import { indexWorks } from "@/lib/works";
import Nav from "@/components/nav/Nav";
import Prox from "@/components/ui/Prox";
import { PageEnter } from "@/components/providers/PageTransition";

/*
  WORKS index - every project (the home page shows only `featured`; this lists all).
  Simple, legible list. Add thumbnails per work when assets exist.
*/
export default function WorksIndex() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; all works &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[18vh]">
        <h1 className="wordmark text-title mb-10 text-ink">Works</h1>
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {indexWorks.map((w) => (
            <li key={w.slug}>
              <Link href={`/works/${w.slug}`} className="group flex items-baseline justify-between py-5 text-body-lg">
                <Prox baseOpacity={0.85} maxScale={1} radius={140}><span className="wordmark text-ink">{w.title}</span></Prox>
                <Prox baseOpacity={0.45} maxScale={1} radius={140}><span className="text-[13px] tracking-[0.02em] text-ink">{w.role} · {w.category} · {w.year}</span></Prox>
              </Link>
            </li>
          ))}
        </ul>
      </PageEnter>
    </main>
  );
}
