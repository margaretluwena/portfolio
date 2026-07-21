import Nav from "@/components/nav/Nav";
import { PageEnter } from "@/components/providers/PageTransition";

/*
  PLAY — experiments, side projects, small interactive things.
  A loose grid so it feels like a sketchbook, not a portfolio. Fill `items` with real work.
*/
const items = [
  { title: "Experiment 01", note: "Replace with a real play piece" },
  { title: "Experiment 02", note: "Shader / motion / toy" },
  { title: "Experiment 03", note: "Link out or embed" },
  { title: "Experiment 04", note: "…" },
];

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; play &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[22vh] pb-[18vh]">
        <h1 className="wordmark text-title mb-10 text-ink">Play</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="aspect-square bg-placeholder p-6">
              <p className="wordmark text-body-lg text-ink">{it.title}</p>
              <p className="mt-1 text-body-lg text-ink/50">{it.note}</p>
            </div>
          ))}
        </div>
      </PageEnter>
    </main>
  );
}
