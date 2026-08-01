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
          {indexWorks.map((w) => {
            /* one-line row description: the lede, non-featured rows only
               (text pending Margaret's edit - see cuts in session) */
            const desc = !w.featured && w.lede !== "NEED" ? w.lede : null;
            const row = (
              <>
                <div>
                  <Prox baseOpacity={0.85} maxScale={1} radius={140}><span className="wordmark text-ink">{w.title}</span></Prox>
                  {desc && <p className="mt-1 max-w-[52ch] text-[15px] leading-snug text-ink/50">{desc}</p>}
                </div>
                <Prox baseOpacity={0.45} maxScale={1} radius={140}>
                  <span className="text-[13px] tracking-[0.02em] text-ink">
                    {w.role}
                    {w.category !== "NEED" && <> · {w.category}</>} · {w.year}
                    {w.comingSoon && <> · Coming soon</>}
                  </span>
                </Prox>
              </>
            );
            return (
              <li key={w.slug}>
                {w.comingSoon || w.indexOnly ? (
                  /* unreachable study: same row, not a link */
                  <div aria-disabled className="flex items-baseline justify-between py-5 text-body-lg">{row}</div>
                ) : (
                  <Link href={`/works/${w.slug}`} className="group flex items-baseline justify-between py-5 text-body-lg">
                    {row}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </PageEnter>
    </main>
  );
}
