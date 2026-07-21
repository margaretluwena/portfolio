import Link from "next/link";
import { works } from "@/lib/works";
import Nav from "@/components/nav/Nav";

/*
  WORKS index — every project (the home page shows only `featured`; this lists all).
  Simple, legible list. Add thumbnails per work when assets exist.
*/
export default function WorksIndex() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<Link href="/">LOGO</Link>} />
      <section className="px-[var(--margin-outer)] pt-[22vh] pb-[18vh]">
        <h1 className="wordmark text-title mb-10 text-ink">Works</h1>
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {works.map((w) => (
            <li key={w.slug}>
              <Link href={`/works/${w.slug}`} className="group flex items-baseline justify-between py-5 text-body-lg">
                <span className="wordmark text-ink transition-opacity group-hover:opacity-60">{w.title}</span>
                <span className="text-ink/50">{w.category} · {w.year}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
