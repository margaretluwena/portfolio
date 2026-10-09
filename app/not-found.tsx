import { PageEnter, TransitionLink } from "@/components/providers/PageTransition";

/* 404 - same materials as the front door: the sky (root layout), the type, a way home. */
export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      <PageEnter className="relative z-10 px-[var(--inset-left)] pt-[42vh]">
        <p className="wordmark text-corner text-ink">MARGARET LUWENA</p>
        <p className="text-title italic font-body mt-2" style={{ color: "hsl(298 62% 41%)" }}>
          is elsewhere. This page doesn&apos;t exist.
        </p>
        <TransitionLink
          href="/"
          className="mt-10 inline-block text-body-lg tracking-[0.06em] text-ink/60 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          ← Back home
        </TransitionLink>
      </PageEnter>
    </main>
  );
}
