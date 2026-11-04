"use client";

import { useEffect, useRef, useState } from "react";

/*
  The mail icon copies the address (Margaret, 2026-11-03, after
  jochoi.me's small touches): a click puts the address on the clipboard
  and the envelope swaps for a check for a second, the cursor bubble
  saying "Copied!". If the clipboard is not available the click falls
  through to mailto: as before. The address stays in the aria-label and
  title, so it is still readable and still a link.
*/
export default function MailLink({ email, className }: { email: string; className: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const onClick = async (e: React.MouseEvent) => {
    try {
      if (!navigator.clipboard) return;
      e.preventDefault();
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  return (
    <a href={`mailto:${email}`} aria-label={`Email ${email}`} title={email} className={className} data-bubble={copied ? "Copied!" : "Copy email"} onClick={onClick}>
      <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
      <svg width="26" height="24" viewBox="0 0 26 24" fill="none" aria-hidden>
        <g style={{ opacity: copied ? 0 : 1, transition: "opacity 180ms" }}>
          <rect x="1.5" y="4" width="23" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M2.5 6.5 13 13.5 23.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* the check draws itself in */}
        <path
          d="M5 12.5 10.5 18 21 7"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 26, strokeDashoffset: copied ? 0 : 26, opacity: copied ? 1 : 0, transition: copied ? "stroke-dashoffset 320ms cubic-bezier(0.22,1,0.36,1) 80ms, opacity 80ms 80ms" : "opacity 180ms" }}
        />
      </svg>
    </a>
  );
}
