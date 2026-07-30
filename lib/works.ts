/*
  Works data. Slugs match the CURRENT live site (margaretluwena.net/works/[slug])
  so existing links, routing, and SEO carry over. Keep the slugs.

  Content ported from the live site (lib/projects.ts on main), edited for the
  redesign: tightened, no em dashes, first person voice kept.

  The `study` object drives the case-study template:
    - left / right → the two columns flanking the centered hero (Figma 97:17)
    - blocks       → the long-form body that stacks below the fold
  `protected` works open freely (the morph plays, intro + flanks visible) but
  the blocks below are gated behind a password (NdaGate + /api/unlock).
  `play` works feed the PLAY page instead of the works index.

  Covers for the home column are intentionally NOT set yet (new covers coming;
  square vs rectangle still being decided).
*/

export type Block =
  | { type: "text"; heading?: string; body: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "pair"; left: string; right: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "link"; href: string; label: string };

export type Study = {
  summary: string;       // sits under the title in the left column
  role: string;
  timeline: string;
  team?: string;
  deliverables: string[];
  left: string[];        // left flank: what it is / the problem
  right: string[];       // right flank: my role / what shipped
  blocks: Block[];
};

/*
  Cover art for the home cards. Placement differs per card, so each layer
  carries its own geometry as % of the card box (taken from that card's
  Figma frame on "Portfolio Revamp" — 972 × 678 each), and holds at any
  card width. Layers render in array order (first = bottom).
*/
export type CoverLayer = {
  src: string;
  left: string;   // % of card width
  top: string;    // % of card height
  width: string;  // % of card width
  height: string; // % of card height
};

export type Work = {
  slug: string;
  title: string;
  category: string;
  year: string;
  role?: string;         // works-index meta
  cover?: string;        // single-image cover (fills the card) — cases without layered art
  coverArt?: CoverLayer[]; // layered cover art, per-card placement from Figma
  wordmark?: string;       // SVG lockup for the home card; title text is the alt/SR label
  wordmarkWidth?: string;  // % of card width (scale by width, natural aspect; default 16%)
  featured?: boolean;
  protected?: boolean;   // blocks gated behind password
  play?: boolean;        // shown on PLAY, not in the works index
  study?: Study;
};

export const works: Work[] = [
  {
    slug: "mark",
    title: "Mark",
    category: "AI Hardware",
    year: "2025",
    role: "Designer",
    featured: true,
    protected: true,
    wordmark: "/images/wordmarks/mark.svg",   // Figma 127:3003, 155/972 of card width
    wordmarkWidth: "15.9%",
    // Figma "Mark card" 139:544: halftone hand (139:545) under the device (139:546)
    coverArt: [
      { src: "/images/covers/mark-hand.png", left: "12.86%", top: "31.6%", width: "68.09%", height: "68.54%" },
      { src: "/images/covers/mark-device.png", left: "31.38%", top: "6.49%", width: "37.98%", height: "78.3%" },
    ],
    study: {
      summary: "A reading companion that carries the act of underlining a sentence into your digital life.",
      role: "Designer, TroyLabs BUILD",
      timeline: "2025",
      team: "Founded by Eason Tang",
      deliverables: ["UI/UX Design", "Brand System", "Merchandise", "Pitch Deck"],
      left: [
        "Mark is a small hardware device that captures highlights and handwritten notes from whatever you are reading, paired with an app that organizes them by book, by category, and by your own reading habits.",
        "I joined Eason's team through TroyLabs' BUILD program and led design across the app, the brand identity, the packaging and merchandise, and the pitch deck presented at LAUNCH.",
      ],
      right: [
        "The work below covers the process end to end: the research that shaped the product, the brand foundation, the app itself, and the physical pieces that taught us what the brand really was.",
        "This project is covered by an NDA, so the full study sits behind a password.",
      ],
      blocks: [
        {
          type: "text",
          heading: "Joining the team",
          body: "When I joined Mark's team, my first instinct was to wait before designing. BUILD moves fast, and the temptation when you come in mid-build is to make your mark early (no pun intended). I sat in on Eason's calls, read everything I could find about what he was building, and asked a lot of questions before I opened Figma.",
        },
        {
          type: "text",
          heading: "Listening before designing",
          body: "To design for the people Mark was built for, I spent a couple of weeks listening before producing. I sat in on calls with potential users, watched how people actually mark up the books they read, and tried the adjacent products those readers already knew (Readwise, Notion, Apple Notes) to understand what they expected from a digital surface.\n\nThe biggest thing that surfaced: nobody wanted another inbox. They wanted their highlights to come back to them in moments that felt useful. A flashcard review on a commute, a search across every book while writing, a category they could trust without retagging by hand. That insight shaped almost every screen.",
        },
        {
          type: "text",
          heading: "Brand foundation",
          body: "The brand starts with the wordmark: a square and a vertical bar followed by the letters MARK. Simple, modular, square. Everything else falls out from there. The typographic system, the palette of cream with a single warm yellow accent, the paper textures and photographic imagery. The goal was grounded and tactile, not slick.",
        },
        { type: "image", src: "/images/mark/stickers.png", alt: "Mark sticker sheet" },
        {
          type: "text",
          heading: "The app",
          body: "The app organizes everything the hardware captures: a Home that surfaces what's most recent alongside a daily reading session card, a Notes view that flips through highlights like flashcards, and a Scans view that groups notes by book and category.\n\nEarly versions tried to surface too much state at once. I learned to trust empty space and let the user's own content (the quote, the highlight, the photo) be the foreground. The home and notes flows ended up as paired panels with the wordmark anchored in the corner, so the product feels like one continuous object across screens.",
        },
        { type: "image", src: "/images/mark/home-thumbnails.png", alt: "Mark app home screens" },
        { type: "image", src: "/images/mark/home-thumbnails-detail.png", alt: "Mark app home detail" },
        { type: "image", src: "/images/mark/share-screens.png", alt: "Mark share screens" },
        {
          type: "text",
          heading: "Merch and posters",
          body: "The poster series runs on a recurring \"Make Your / On Your / My Words\" framing. Each pair has a blank version and a version with imagery, so one template can carry different campaigns. The t-shirts use the logo modularly: tiny and centered, large and offset, or paired with imagery from the brand library. The point was a kit Eason could remix, not a fixed set of one-offs.",
        },
        { type: "image", src: "/images/mark/shirts.png", alt: "Mark t-shirt designs" },
        {
          type: "text",
          heading: "Print and packaging",
          body: "The envelope, postcard, and sticky note pieces were the most fun, and the most useful for figuring out the brand. A physical artifact forces you to commit in ways screen design lets you defer. Once the envelope worked, the digital pieces got easier: the brand had a body in the real world to refer back to.",
        },
        { type: "image", src: "/images/mark/packaging.png", alt: "Mark print and packaging" },
        {
          type: "text",
          heading: "What I took away",
          body: "Two things stuck with me. First, the value of front-loading research even under pressure to produce: the weeks spent listening were the highest-leverage weeks of the project. Second, the value of a brand that lives in physical artifacts as much as on screen. When the envelope and the app share the same logic, people trust both more.",
        },
      ],
    },
  },
  {
    slug: "impeccable-chicken",
    title: "Impeccable Chicken",
    category: "Brand / Deck",
    year: "2025",
    role: "Pitch Deck Design",
    featured: true,
    protected: true,
    study: {
      summary: "Pitch deck and brand system. Case study in progress.",
      role: "Pitch Deck Design",
      timeline: "2025",
      deliverables: ["Pitch Deck", "Brand System"],
      left: ["Case study in progress. Content coming soon."],
      right: [],
      blocks: [
        { type: "text", body: "Case study in progress. Content coming soon." },
      ],
    },
  },
  {
    slug: "traeco",
    title: "Traeco",
    category: "AI B2B SaaS",
    year: "2026",
    role: "Cofounder & CPO",
    featured: true,
    wordmark: "/images/wordmarks/traeco.svg", // Figma 140:694, 164/972 of card width
    wordmarkWidth: "16.9%",
    // Figma "Traeco card" 139:559: MacBook mockup group (140:717), clipped to card width
    coverArt: [
      { src: "/images/covers/traeco-mockup.png", left: "0%", top: "9.29%", width: "100%", height: "86.06%" },
    ],
    study: {
      summary: "Cost visibility and governance for teams shipping AI. One pane of glass for LLM spend.",
      role: "Cofounder & CPO",
      timeline: "2026, ongoing",
      deliverables: ["Product Design", "Website Design", "Design System", "Brand Identity", "Pitch Deck"],
      left: [
        "Engineering teams shipping AI products were flying blind on cost. Token spend sat scattered across three or four provider dashboards, none of which tied cost back to the agents, teams, or workflows driving it. Surprise bills were the norm; finance asked questions engineering couldn't answer.",
        "Traeco makes that legible and prescriptive. Not just \"here's what you spent,\" but \"here's the $4,200 you'd save this month if you swapped these three calls to a smaller model.\"",
      ],
      right: [
        "As cofounder and CPO I own the end-to-end design surface: brand identity, marketing site, product UI, design system, and the pitch deck we took to investors.",
        "Shipped to production; the marketing site is live at traeco.dev.",
      ],
      blocks: [
        { type: "link", href: "https://traeco.dev", label: "Visit the live site (traeco.dev)" },
        {
          type: "text",
          heading: "Who we designed for",
          body: "I ran a discovery round of seven user interviews across three personas before sketching a single screen: engineering managers (the buyers), technical PMs (the daily users), and finance leads (the auditors). Each persona holds a different mental model of cost. Engineers think in tokens and latency; finance thinks in dollars per team. The product had to speak both languages at once without picking a side.\n\nThe interviews surfaced three jobs that shaped the IA: real-time and historical cost visibility, prescriptive optimization recommendations, and chargeback-ready attribution per team member.",
        },
        {
          type: "text",
          heading: "Design principles",
          body: "Before any screen, I wrote a short set of non-negotiables to anchor every decision:\n\n• Dark-first. Everything lives on one deep neutral surface; depth comes from layered fills, not shadows. Finance-grade clarity, not consumer flash.\n• Money is the hero. Dollar values get the largest type in the scale. Savings render green, prefix and arrow always visible.\n• Yellow is scarce. The accent is reserved for the primary CTA and active nav. Sprinkling it dilutes affordance.\n• Tabular alignment. Numbers right-aligned so columns scan vertically without effort.\n• Motion supports data. Stats count up, bars grow in, status dots pulse. No decorative transitions; every animation has an informational job.",
        },
        { type: "image", src: "/images/traeco/dashboard.png", alt: "Traeco dashboard" },
        {
          type: "text",
          heading: "Design system",
          body: "Four layered surfaces (app, sidebar, card, elevated card), a four-step type scale, and a deliberately narrow palette: white-to-muted text, green for savings, amber for warnings, red only for cost increases. Seven reusable components do 90% of the work.\n\nDocumenting them in Figma with the same token names as the codebase removed an entire class of design-engineering friction. Handoffs became \"build this with the existing components\" instead of \"please match this exactly.\"",
        },
        {
          type: "text",
          heading: "Iteration and feedback",
          body: "I ran weekly design crits with engineering and bi-weekly sessions with three pilot users. Two iterations stand out.\n\nThe Recommendations card went through four versions. V1 led with the priority badge; testers fixated on \"high\" without reading the savings. V4 leads with the dollar amount, demotes the badge to a text label, and adds an inline Apply affordance. Conversion to action in usability tests went from 22% to 71%.\n\nThe agent trace table started as a flat list of steps. A finance reviewer in our second pilot couldn't tell where the money went. I added a sticky cost column with a running subtotal and color-coded the latency cell. Same data, completely different read.",
        },
        { type: "image", src: "/images/traeco/website.png", alt: "Traeco marketing site" },
        {
          type: "text",
          heading: "Marketing site",
          body: "The site mirrors the product's voice: quiet, data-dense, trustworthy. The hero leads with the outcome (\"Stop overpaying for AI\") rather than a feature list, and the dashboard mockup below it is the product's own UI rendered at scale. Everything below the fold earns its place by being concrete: real numbers, real agent names, real time-to-value. Same type ramp and surface tokens as the product, so a visitor who clicks into a demo feels zero context switch.",
        },
        {
          type: "text",
          heading: "Outcome",
          body: "Shipped the dashboard, marketing site, and full design system to production, and took the pitch deck through seed-stage conversations. The biggest learning was structural: starting from a written principles doc and a token cheat sheet, before any high-fidelity screens, paid back in every subsequent decision and made cross-functional review meaningfully faster.",
        },
      ],
    },
  },
  {
    slug: "atlix",
    title: "Atlix",
    category: "AI B2B SaaS",
    year: "2026",
    role: "Cofounder",
    featured: true,
    study: {
      summary: "Narrative intelligence: what young Californians are actually talking about, surfaced in real time.",
      role: "Cofounder, design lead",
      timeline: "2026",
      deliverables: ["Product Design", "Design System", "Brand Identity", "Pitch Deck"],
      left: [
        "Polling lags. By the time a report goes out, the conversation has moved. Atlix pulls public discourse from across California's regions and surfaces what's gaining traction, what's losing it, and how people frame the issues that affect them.",
        "Built for advocacy groups and policy researchers who need to read demographic discourse without waiting for a quarterly report.",
      ],
      right: [
        "I led design across product, brand, pitch deck, and design system.",
        "The dashboard and deck took us to the global finalist round of the Asian Leadership Conference, past hundreds of teams from Stanford, Harvard, Cornell, and UC Berkeley.",
      ],
      blocks: [
        {
          type: "text",
          heading: "Early research",
          body: "Before designing screens, I spent a few weeks reading the reports people in this space already work from, talking to researchers and advocacy folks, and mapping what their day actually looks like. The pattern: nobody wanted yet another data tool. They wanted summaries they could trust, with the source one click away. That shaped the whole product. Cards first, summaries upfront, citations always visible.",
        },
        {
          type: "text",
          heading: "Designing the dashboard",
          body: "The first version was much busier. Filters everywhere, charts on charts, every card saying too much at once. After feedback from the researchers I'd interviewed, I cut it back to what matters in the first three seconds: what's the topic, where is it happening, how fast is it growing, who's talking about it. Everything else moved to the detail view.\n\nThe current layout: left-rail filters for region and issue, a tab row for sort order (most pressing, volume, fastest growing), and a card grid where each card commits to a single narrative.",
        },
        { type: "image", src: "/images/atlix/dashboard.png", alt: "Atlix dashboard" },
        {
          type: "text",
          heading: "The pitch deck",
          body: "The deck went through a lot of versions. Early drafts overexplained the technical side and underexplained the why. The version that landed leads with the gap between when people are talking and when researchers find out, then shows the dashboard in a few screenshots. Low slide density throughout: one idea per slide, one image, very few words.",
        },
        { type: "video", src: "/videos/atlix-pitch.mp4", poster: "/images/atlix/hero.png" },
        {
          type: "text",
          heading: "Brand",
          body: "Atlix sits in a category where tools look either academic and beige or aggressively tech. I wanted a third option: dark navy, a single accent, type-forward, quiet. The wordmark is a clean sans because the product should be the loudest thing in any deck or screenshot.",
        },
        {
          type: "text",
          heading: "Outcome",
          body: "Global finalist at the Asian Leadership Conference. The bigger lesson: research before design isn't a checkbox. Every time I shortcut it and started designing first, I threw work away. Every conversation before opening Figma made the design work faster, because half the decisions were already made. And restraint compounds: cutting a field off a card felt scary, but it made the whole grid more confident than adding one ever would have.",
        },
      ],
    },
  },
  {
    slug: "glance",
    title: "Glance",
    category: "Productivity",
    year: "2025",
    role: "Designer",
    featured: true,
    study: {
      summary: "Website and logo design for a productivity startup in TroyLabs' BUILD program.",
      role: "Designer, TroyLabs BUILD",
      timeline: "2025",
      deliverables: ["Website Design", "Logo Design", "UI/UX Design", "Framer Development"],
      left: [
        "I worked with Glance's founders as a designer on their team during TroyLabs' BUILD program. Most of my time went to the website and to rounds of logo exploration.",
      ],
      right: [
        "The site itself is no longer accessible, so what survives here is the logo process: the sketches and iterations that got us to the final mark.",
      ],
      blocks: [
        { type: "image", src: "/images/glance-content.png", alt: "Glance logo iterations" },
      ],
    },
  },
  {
    slug: "mountaindew",
    title: "Mountain Dew",
    category: "CPG",
    year: "2024",
    role: "Design Consultant",
    study: {
      summary: "Bottle redesigns and brand strategy for Mountain Dew with Avenues Consulting Group.",
      role: "Design Consultant, Avenues Consulting Group",
      timeline: "2024",
      deliverables: ["Product Design", "Brand Strategy", "Slide Deck"],
      left: [
        "Mountain Dew came to Avenues Consulting Group as a client. On their team I spearheaded market research and strategy, bottle redesigns built around their new logo, and the final deck presented alongside my team.",
      ],
      right: [
        "Below: previews of the slide deck and the bottle redesigns.",
      ],
      blocks: [
        { type: "pair", left: "/images/mountaindew-1.png", right: "/images/mountaindew-2.png" },
      ],
    },
  },
  {
    slug: "charitablefoundation",
    title: "Ichioka and Nakao",
    category: "Nonprofit",
    year: "2024",
    role: "Design Consultant",
    study: {
      summary: "Brand and website redesign for the Ichioka and Nakao Charitable Foundation.",
      role: "Design Consultant, Avenues Consulting Group",
      timeline: "2024",
      deliverables: ["Logo Design", "Website Design", "Branding", "Slide Deck"],
      left: [
        "The Ichioka and Nakao Charitable Foundation came to Avenues Consulting Group for a refresh. On their team I spearheaded a brand and website redesign, presented in a deck alongside my team.",
      ],
      right: [],
      blocks: [
        { type: "pair", left: "/images/ichioka-1.png", right: "/images/ichioka-hero.png" },
        { type: "image", src: "/images/ichioka-2.jpeg", alt: "Ichioka and Nakao website redesign" },
        { type: "image", src: "/images/ichioka-3.jpeg", alt: "Ichioka and Nakao brand redesign" },
      ],
    },
  },

  /* ---- PLAY collections (not in the works index) ---- */
  {
    slug: "graphics",
    title: "Graphics",
    category: "Graphic Design",
    year: "2023–2025",
    role: "Designer / Illustrator",
    play: true,
    study: {
      summary: "Miscellaneous graphics from over the years: Instagram posts, flyers, and illustrative work made for fun.",
      role: "Designer / Illustrator",
      timeline: "2023–2025",
      deliverables: ["Art Direction", "Graphic Design", "Illustration"],
      left: [],
      right: [],
      blocks: [
        { type: "pair", left: "/images/graphics-hero.webp", right: "/images/graphics-2.webp" },
        { type: "image", src: "/images/graphics-3.webp" },
        { type: "pair", left: "/images/graphics-4.webp", right: "/images/graphics-5.png" },
        { type: "image", src: "/images/graphics-6.png" },
        { type: "image", src: "/images/graphics-7.png" },
      ],
    },
  },
  {
    slug: "smallworks",
    title: "Small Works",
    category: "Personal",
    year: "2023–2025",
    role: "Designer",
    play: true,
    study: {
      summary: "Projects from hackathons, design challenges, and class projects that don't quite warrant their own page.",
      role: "Designer",
      timeline: "2023–2025",
      deliverables: ["UI/UX Design", "Website Design", "Branding"],
      left: [],
      right: [],
      blocks: [
        { type: "pair", left: "/images/smallworks-1.webp", right: "/images/smallworks-2.webp" },
        { type: "image", src: "/images/smallworks-3.png" },
      ],
    },
  },
];

export const featuredWorks = works.filter((w) => w.featured);
export const indexWorks = works.filter((w) => !w.play);
export const playWorks = works.filter((w) => w.play);
export const PROTECTED_SLUGS = works.filter((w) => w.protected).map((w) => w.slug);
export const getWork = (slug: string) => works.find((w) => w.slug === slug);
