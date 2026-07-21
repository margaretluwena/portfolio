/*
  Works data. Slugs match the CURRENT live site (margaretluwena.net/works/[slug])
  so existing links, routing, and SEO carry over. Keep the slugs.

  The `study` object drives the case-study template (app/works/[slug]/page.tsx):
    - left / right  → the two columns flanking the centered hero image (Figma 97:17)
    - sections      → the "compiled" recap that stacks below the fold
  Content below is DRAFT scaffolding — real structure, replace the prose per project.
*/

export type StudySection = {
  id: string;
  title: string;
  body: string;
  media?: string; // /assets/... image for this section
};

export type Study = {
  summary: string;       // sits under the title in the left column
  role: string;
  timeline: string;
  team?: string;
  left: string[];        // left flank: context / problem
  right: string[];       // right flank: role / outcome
  sections: StudySection[];
};

export type Work = {
  slug: string;
  title: string;
  category: string;
  year: string;
  cover?: string;        // right-column image on the main page + case-study hero
  featured?: boolean;
  study?: Study;
};

export const works: Work[] = [
  {
    slug: "mark",
    title: "MarkAI",
    category: "AI Hardware",
    year: "2025",
    featured: true,
    study: {
      summary: "Brand and product design for an AI hardware startup (NDA).",
      role: "Product & brand design",
      timeline: "2025",
      left: [
        "MarkAI needed an identity and product surface that made new AI hardware feel inevitable rather than experimental.",
      ],
      right: [
        "I led the visual system and core product screens, from first concept through a handoff-ready design system.",
      ],
      sections: [
        { id: "context", title: "Context", body: "Replace with the problem and constraints. What was MarkAI shipping, and to whom?" },
        { id: "approach", title: "Approach", body: "Replace with the design decisions — system, type, motion — and why each served the product." },
        { id: "outcome", title: "Outcome", body: "Replace with results: what shipped, what it unlocked." },
      ],
    },
  },
  {
    slug: "traeco",
    title: "Traeco",
    category: "AI B2B SaaS",
    year: "2026",
    featured: true,
    study: {
      summary: "Cost observability and orchestration for AI-native teams.",
      role: "Cofounder & CPO — design + product",
      timeline: "2026 — ongoing",
      team: "Mehek (CEO), Kyna (CTO)",
      left: [
        "Teams shipping AI features fly blind on spend: costs are opaque, scattered across providers, and impossible to attribute to a feature or a customer.",
        "Traeco makes that legible — a single surface for where AI money goes, and the controls to route it better.",
      ],
      right: [
        "I own product and design end to end: the roadmap arc from cost observability into quality and orchestration, the brand, and the interface.",
        "Shipped the landing, the dashboard system, and the design-partner surface used in early conversations.",
      ],
      sections: [
        { id: "observe", title: "Observe", body: "The first surface: spend broken down by model, feature, and customer, so a team can finally see the bill before it arrives." },
        { id: "quality", title: "Quality", body: "Phase two ties cost to output quality — the tradeoff every AI team is actually making, made visible." },
        { id: "orchestrate", title: "Orchestrate", body: "The end state: route each call to the right model automatically, on a cost-and-quality budget the team sets." },
      ],
    },
  },
  {
    slug: "atlix",
    title: "Atlix",
    category: "AI B2B SaaS",
    year: "2026",
    featured: true,
    study: {
      summary: "Narrative intelligence for policymakers. GSSC Seoul finalist.",
      role: "Cofounder — design + product",
      timeline: "2026",
      left: ["Policymakers drown in narrative — Atlix surfaces the stories moving through a population before they crest."],
      right: ["I built the product story and interface, and took it to the GSSC Seoul stage as a finalist."],
      sections: [
        { id: "context", title: "Context", body: "Replace with the problem space and who Atlix serves." },
        { id: "approach", title: "Approach", body: "Replace with how the product makes narrative legible." },
      ],
    },
  },
  {
    slug: "glance",
    title: "Glance",
    category: "Productivity",
    year: "2025",
    featured: true,
    study: {
      summary: "A productivity surface designed for a single, calm glance.",
      role: "Product design",
      timeline: "2025",
      left: ["Replace with the problem Glance solves."],
      right: ["Replace with your role and what shipped."],
      sections: [{ id: "context", title: "Context", body: "Replace with the case-study body." }],
    },
  },
  {
    slug: "mountaindew",
    title: "Mountain Dew",
    category: "CPG",
    year: "2024",
    featured: true,
    study: {
      summary: "Campaign and brand design work for a CPG giant.",
      role: "Design",
      timeline: "2024",
      left: ["Replace with the brief and constraints."],
      right: ["Replace with your contribution and the outcome."],
      sections: [{ id: "context", title: "Context", body: "Replace with the case-study body." }],
    },
  },
  { slug: "charitablefoundation", title: "Ichioka and Nakao", category: "Nonprofit", year: "2024", featured: false },
  { slug: "smallworks", title: "Small Works", category: "Personal", year: "2023–2025", featured: false },
  { slug: "graphics", title: "Graphics", category: "Graphic Design", year: "2023–2025", featured: false },
];

export const featuredWorks = works.filter((w) => w.featured);
export const getWork = (slug: string) => works.find((w) => w.slug === slug);
