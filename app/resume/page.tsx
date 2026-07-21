import Nav from "@/components/nav/Nav";
import Prox from "@/components/ui/Prox";
import { PageEnter } from "@/components/providers/PageTransition";

/*
  RESUME. Two easy options — pick one:
  1. Drop resume.pdf into /public and embed it below (current setup).
  2. Or delete this route and point Nav's RESUME link straight at "/resume.pdf".
*/
export default function ResumePage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav rightSlot={<span>&ndash; resume &ndash;</span>} />
      <PageEnter className="px-[var(--margin-outer)] pt-[20vh] pb-[10vh]">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="wordmark text-title text-ink">Resume</h1>
          <Prox baseOpacity={0.5} maxScale={1} radius={140}>
            <a href="/resume.pdf" className="text-body-lg text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink" download>
              Download PDF ↓
            </a>
          </Prox>
        </div>
        {/* embed the PDF once /public/resume.pdf exists */}
        <object data="/resume.pdf" type="application/pdf" className="h-[80vh] w-full border border-ink/10">
          <p className="p-6 text-body-lg text-ink/60">
            Add <code>resume.pdf</code> to <code>/public</code>. <a className="underline" href="/resume.pdf">Open it here.</a>
          </p>
        </object>
      </PageEnter>
    </main>
  );
}
