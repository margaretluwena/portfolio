"use client";


/*
  WORK EXPERIENCES (Figma "About" 221:520, rows 270:711-731; 2026-10-08).

  The list is long, so it does not sit on the page all at once: the section
  PINS. Scrolling into it holds the heading and the frame still while the
  rows travel up through a fixed window; once the last row is in, the page
  releases and scrolls on. The outer section is as tall as the viewport
  plus the distance the rows have to travel, the inner block is sticky for
  that whole stretch, and the rows' offset follows scroll progress - so
  the wheel always "scrolls the experiences" until they run out. The
  offset is written straight from a scroll listener (no animation loop in
  between), so it tracks the wheel 1:1.

  Geometry from the frame (2164 wide): heading at --inset; org column at
  48.8% of the width; role + dates right-aligned at --align-r; 140px row
  pitch (6.5vw). Multi-role orgs (BNI) hang their second role under the
  first with a hairline, like the frame's "Line 76".

  Phones and reduced motion: no pin - the rows just sit in flow.
*/

type Role = { title: string; dates: string };
type Experience = { org: string; roles: Role[] };

const EXPERIENCES: Experience[] = [
  { org: "Edison International", roles: [{ title: "Product Designer", dates: "May 2026 - June 2026" }] },
  { org: "Impeccable Chicken", roles: [{ title: "Product Designer (Contract)", dates: "March 2026 - October 2026" }] },
  { org: "Traeco", roles: [{ title: "CPO + Founding Designer", dates: "February 2026 - October 2026" }] },
  { org: "Mark", roles: [{ title: "Product Designer", dates: "September 2025 - December 2025" }] },
  {
    org: "BNI Sekuritas",
    roles: [
      { title: "Investment Banking Summer Analyst", dates: "July 2025 - August 2025" },
      { title: "Risk Management Intern", dates: "June 2025 - July 2025" },
    ],
  },
  { org: "Glance", roles: [{ title: "Founding Designer", dates: "February 2025 - May 2025" }] },
  { org: "Sirka (YC S21)", roles: [{ title: "Operations Intern", dates: "May 2024 - August 2024" }] },
  { org: "Indonesia Defence Services", roles: [{ title: "Business Analyst Intern", dates: "May 2023 - August 2023" }] },
];

function Rows() {
  return (
    <ol>
      {EXPERIENCES.map((e) => (
        <li key={e.org} className="grid grid-cols-2 gap-x-6 border-t border-hairline py-5 first:border-t-0 first:pt-0">
          {/* the company carries the weight; the role sits lighter beside it
              (Michelle Liu, 2026-11-14: they were the same size and weight) */}
          <p className="text-body font-bold text-ink">{e.org}</p>
          <div>
            {e.roles.map((r, i) => (
              <div key={r.title} className={i > 0 ? "mt-4" : ""}>
                <p className="text-body text-ink/70">{r.title}</p>
                <p className="mt-0.5 text-label text-ink/45">{r.dates}</p>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* 2026-11-14 (Michelle Liu): the pinned scroll window is gone; the list is
   flat and scrolls with the page. Its two columns sit on the home page's
   grid: the heading at --inset, the rows from --col-right to --align-r. */
export default function AboutExperience() {
  return (
    <section className="grid gap-8 px-[var(--inset)] md:grid-cols-[calc(var(--col-right)-var(--inset))_1fr] md:gap-0 md:pr-[calc(100vw-var(--align-r))]">
      <h2 className="study-title text-ink">Work Experiences</h2>
      <Rows />
    </section>
  );
}
