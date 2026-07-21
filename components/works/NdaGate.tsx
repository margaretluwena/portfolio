"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/*
  Scroll-gate for NDA'd case studies. The overlay opens freely (the morph plays,
  intro and flanks stay public); scrolling down to the body is where this sits.
  Correct password → /api/unlock sets the cookie, we remember it for the session
  and reveal the blocks in place. No route change, no hard switch.
*/

export default function NdaGate({
  slug,
  title,
  children,
}: {
  slug: string;
  title: string;
  children: React.ReactNode; // the gated blocks
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(`unlocked_${slug}`) === "1");
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });
      if (res.ok) {
        sessionStorage.setItem(`unlocked_${slug}`, "1");
        setUnlocked(true);
      } else {
        setError("Incorrect password.");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto max-w-[62ch] py-[6vh] text-center">
      <p className="text-[13px] uppercase tracking-[0.3em] text-ink/40">Protected</p>
      <h3 className="wordmark text-title mt-2 text-ink">{title}</h3>
      <p className="mx-auto mt-4 max-w-[38ch] text-body-lg text-ink/60">
        The full study is covered by an NDA. Enter the password to read on.
      </p>
      <form onSubmit={submit} className="mx-auto mt-8 flex max-w-[320px] flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
          className="w-full border border-ink/25 bg-transparent px-4 py-3 text-body-lg tracking-[0.06em] text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none"
        />
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] text-[hsl(354_72%_44%)]">
            {error}
          </motion.p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="border border-ink px-4 py-3 text-body-lg tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
