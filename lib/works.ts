/*
  Works data — case-study spine v2 (argument-led).
  Slugs match the CURRENT live site (margaretluwena.net/works/[slug]) so
  existing links, routing, and SEO carry over. Keep the slugs.

  Every case study is: frame -> rail -> context -> problem -> solution ->
  wip -> next, with optional artifactGrid and gate. The rail derives from
  the blocks array. Mark's content is canonical in docs/content/mark.md
  (from Margaret's voice notes); media marked { src: "NEED", ... } renders
  as a labeled placeholder until the asset exists. NEVER fill NEED strings
  with generated text — they are Margaret's to write/supply.

  All prose here is Margaret's (ported from the live site or her voice
  notes). The password gate is data-present but rendering is parked behind
  GATE_ENABLED in the block renderer; NdaGate + /api/unlock stay intact.
*/

export type Media = {
  src: string;      // "NEED" renders a labeled placeholder using alt as the label
  alt: string;
  video?: true;     // local short excerpt only — full pitches are embedded, never in /public
  poster?: string;
  embed?: string;   // unlisted YouTube/Vimeo URL; takes precedence over src
};

export type Block =
  | { type: "context"; body: string; media?: Media }
  | { type: "problem"; headline: string; evidence: string[]; body: string; media?: Media }
  | { type: "solution"; pieces: { name: string; caption: string; media: Media }[] }
  | { type: "artifactGrid"; media: Media[] }  // 2-6 images, no captions
  | { type: "wip"; email: string }
  | { type: "gate"; hint: string };           // requires `protected`; rendering parked

export type Credit = { label: string; value: string };

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
  lede: string;            // one sentence, no second period — the opening line
  blurb?: string;          // home-card teaser; card falls back to lede (clamped) when absent
  credits: Credit[];       // Role / Timeline / Team / Disciplines as rows
  cover?: Media;           // frame visual; hero placeholder until covers exist
  blocks: Block[];
  next: string;            // slug — the "next" line renders from this

  /* home column + routing */
  category: string;
  year: string;
  role?: string;           // works-index meta
  featured?: boolean;
  protected?: boolean;     // gate blocks + /api/unlock passwords
  play?: boolean;          // shown on PLAY, not in the works index
  coverArt?: CoverLayer[]; // layered home-card art, per-card placement from Figma
  wordmark?: string;       // SVG lockup; title text is the alt/SR label
  wordmarkWidth?: string;  // % of card width (scale by width, natural aspect; default 16%)
  wordmarkGlow?: string;   // css filter under the lockup (Figma text-shadow, applied in CSS)
  cardBg?: string;         // card surface — default white (Traeco's frame is #303036)
  cardFade?: string;       // fade-into-text-zone gradient — default transparent -> white 77.9%
  cardText?: "light";      // description tone on dark cards
  comingSoon?: boolean;    // home card reveals "Coming soon" on hover
};

const WIP_EMAIL = "luwena@usc.edu";

export const works: Work[] = [
  /* ---- Mark — canonical content: docs/content/mark.md ---- */
  {
    slug: "mark",
    title: "Mark",
    lede: "A reading companion that turns the act of underlining into something you'd want to share",
    blurb: "Hardware, app, and brand for a reading companion built at TroyLabs BUILD",
    credits: [
      { label: "Role", value: "Designer, TroyLabs BUILD" },
      { label: "Timeline", value: "2025" },
      { label: "Team", value: "Founded by Eason Tang" },
      { label: "Disciplines", value: "UI/UX Design, Brand System, Merchandise, Pitch Deck" },
    ],
    cover: { src: "NEED", alt: "device or hero shot" },
    next: "traeco",
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
    blocks: [
      {
        type: "context",
        body: "Mark is a capture device and companion app built by Eason Tang through TroyLabs' BUILD program. Eason's thesis was that reading should be social, a Spotify Wrapped for what you read, rather than another place to file highlights. I joined as the designer and worked across four surfaces over the semester: the app and its share system, the brand, the physical packaging, and the deck we presented at LAUNCH.",
        media: { src: "NEED", alt: "device or hero shot" },
      },
      {
        type: "problem",
        headline: "Reading is private, and nothing carried it anywhere else",
        evidence: [
          "Capture had to happen without interrupting the reading itself",
          "Nothing connected the device to the app, or the app to a library",
          "A highlight is only interesting to the person who made it",
        ],
        body: "Eason had the thesis before I joined; my problem was making it real. Most of the work was decomposition: the device, the app, and the share layer each answered a different question, and the answers had to add up to one product rather than three.",
        media: { src: "NEED", alt: "early flow or sketch" },
      },
      {
        type: "solution",
        pieces: [
          {
            name: "Reading, made social",
            caption: "Wrapped-style cards that turn a stretch of reading into something postable. Deliberately quirky and over-designed: a share screen only works if someone wants to be seen posting it, so this traded restraint for personality.",
            media: { src: "NEED", alt: "share screens" },
          },
          {
            name: "From page to library",
            caption: "Logging a highlight on the device without leaving the page, then sorting captures against books, categories, and notes written in the app. Organised by reading habit rather than by file.",
            media: { src: "NEED", alt: "app screens, capture to library" },
          },
          {
            name: "Twenty, then three, then colour",
            caption: "Twenty rough packaging concepts narrowed to three, then iterated in depth before any colour went on. Yellow was load-bearing in the early identity, so it came last and on purpose rather than as a starting constraint.",
            media: { src: "NEED", alt: "one wide progression image, 20 to 3 to coloured" },
          },
          {
            name: "LAUNCH",
            caption: "The three-minute pitch presented at TroyLabs' end-of-semester LAUNCH summit.",
            media: { src: "NEED", alt: "pitch video excerpt or unlisted embed" },
          },
        ],
      },
      {
        type: "artifactGrid",
        media: [
          { src: "NEED", alt: "sticker sheet" },
          { src: "NEED", alt: "shirt variants" },
          { src: "NEED", alt: "tote" },
          { src: "NEED", alt: "Make your mark wordplay" },
        ],
      },
      { type: "gate", hint: "The full study sits behind a password under NDA." },
    ],
  },

  /* ---- Traeco — thin until Margaret's dump exists ---- */
  {
    slug: "traeco",
    title: "Traeco",
    lede: "Cost visibility and governance for teams shipping AI: one pane of glass for LLM spend",
    credits: [
      { label: "Role", value: "Cofounder & CPO" },
      { label: "Timeline", value: "2026, ongoing" },
      { label: "Disciplines", value: "Product Design, Website Design, Design System, Brand Identity, Pitch Deck" },
    ],
    next: "impeccable-chicken",
    category: "AI B2B SaaS",
    year: "2026",
    role: "Cofounder & CPO",
    featured: true,
    wordmark: "/images/wordmarks/traeco.svg", // Figma 140:694, 164/972 of card width
    wordmarkWidth: "16.9%",
    wordmarkGlow: "drop-shadow(0 1px 3.5px rgba(27,168,111,0.5))", // Figma 140:692 text-shadow
    // Figma "Traeco card" 139:559 is the dark variant: #303036 surface,
    // fade to #242428, white/50 description
    cardBg: "#303036",
    cardFade: "linear-gradient(to bottom, rgba(36,36,40,0), rgba(36,36,40,0.03) 37.5%, #242428 77.9%)",
    cardText: "light",
    // laptop chrome (140:695) under the floating dashboard (140:715); the
    // dashboard is sized a hair past the white display area so no white
    // sliver shows at its sides
    coverArt: [
      { src: "/images/covers/traeco-laptop.png", left: "0%", top: "9.29%", width: "100%", height: "86.06%" },
      { src: "/images/covers/traeco-dashboard.png", left: "7.92%", top: "11.06%", width: "84.05%", height: "74.42%" },
    ],
    blocks: [
      {
        type: "context",
        body: "Engineering teams shipping AI products were flying blind on cost. Token spend sat scattered across three or four provider dashboards, none of which tied cost back to the agents, teams, or workflows driving it. Surprise bills were the norm; finance asked questions engineering couldn't answer.\n\nTraeco makes that legible and prescriptive. Not just \"here's what you spent,\" but \"here's the $4,200 you'd save this month if you swapped these three calls to a smaller model.\"\n\nShipped to production; the marketing site is live at traeco.dev.",
      },
      { type: "wip", email: WIP_EMAIL },
    ],
  },

  /* ---- Impeccable Chicken — thin until content exists ---- */
  {
    slug: "impeccable-chicken",
    title: "Impeccable Chicken",
    lede: "Pitch deck and brand system",
    credits: [
      { label: "Role", value: "Pitch Deck Design" },
      { label: "Timeline", value: "2025" },
      { label: "Disciplines", value: "Pitch Deck, Brand System" },
    ],
    next: "atlix",
    category: "Brand / Deck",
    year: "2025",
    role: "Pitch Deck Design",
    featured: true,
    protected: true,
    comingSoon: true,
    blocks: [
      { type: "context", body: "Case study in progress. Content coming soon." },
      { type: "wip", email: WIP_EMAIL },
    ],
  },

  /* ---- Atlix — thin until Margaret's dump exists ---- */
  {
    slug: "atlix",
    title: "Atlix",
    lede: "Narrative intelligence: what young Californians are actually talking about, surfaced in real time",
    credits: [
      { label: "Role", value: "Cofounder, design lead" },
      { label: "Timeline", value: "2026" },
      { label: "Disciplines", value: "Product Design, Design System, Brand Identity, Pitch Deck" },
    ],
    next: "mark",
    category: "AI B2B SaaS",
    year: "2026",
    role: "Cofounder",
    featured: true,
    blocks: [
      {
        type: "context",
        body: "Polling lags. By the time a report goes out, the conversation has moved. Atlix pulls public discourse from across California's regions and surfaces what's gaining traction, what's losing it, and how people frame the issues that affect them.\n\nBuilt for advocacy groups and policy researchers who need to read demographic discourse without waiting for a quarterly report.\n\nThe dashboard and deck took us to the global finalist round of the Asian Leadership Conference, past hundreds of teams from Stanford, Harvard, Cornell, and UC Berkeley.",
      },
      { type: "wip", email: WIP_EMAIL },
    ],
  },

  /* ---- Works index only ---- */
  {
    slug: "glance",
    title: "Glance",
    lede: "Website and logo design for a productivity startup in TroyLabs' BUILD program",
    credits: [
      { label: "Role", value: "Designer, TroyLabs BUILD" },
      { label: "Timeline", value: "2025" },
      { label: "Disciplines", value: "Website Design, Logo Design, UI/UX Design, Framer Development" },
    ],
    next: "mountaindew",
    category: "Productivity",
    year: "2025",
    role: "Designer",
    blocks: [
      {
        type: "context",
        body: "I worked with Glance's founders as a designer on their team during TroyLabs' BUILD program. Most of my time went to the website and to rounds of logo exploration.\n\nThe site itself is no longer accessible, so what survives here is the logo process: the sketches and iterations that got us to the final mark.",
        media: { src: "/images/glance-content.png", alt: "Glance logo iterations" },
      },
    ],
  },
  {
    slug: "mountaindew",
    title: "Mountain Dew",
    lede: "Bottle redesigns and brand strategy for Mountain Dew with Avenues Consulting Group",
    credits: [
      { label: "Role", value: "Design Consultant, Avenues Consulting Group" },
      { label: "Timeline", value: "2024" },
      { label: "Disciplines", value: "Product Design, Brand Strategy, Slide Deck" },
    ],
    next: "charitablefoundation",
    category: "CPG",
    year: "2024",
    role: "Design Consultant",
    blocks: [
      {
        type: "context",
        body: "Mountain Dew came to Avenues Consulting Group as a client. On their team I spearheaded market research and strategy, bottle redesigns built around their new logo, and the final deck presented alongside my team.",
      },
      {
        type: "artifactGrid",
        media: [
          { src: "/images/mountaindew-1.png", alt: "Mountain Dew slide deck preview" },
          { src: "/images/mountaindew-2.png", alt: "Mountain Dew bottle redesigns" },
        ],
      },
    ],
  },
  {
    slug: "charitablefoundation",
    title: "Ichioka and Nakao",
    lede: "Brand and website redesign for the Ichioka and Nakao Charitable Foundation",
    credits: [
      { label: "Role", value: "Design Consultant, Avenues Consulting Group" },
      { label: "Timeline", value: "2024" },
      { label: "Disciplines", value: "Logo Design, Website Design, Branding, Slide Deck" },
    ],
    next: "mark",
    category: "Nonprofit",
    year: "2024",
    role: "Design Consultant",
    blocks: [
      {
        type: "context",
        body: "The Ichioka and Nakao Charitable Foundation came to Avenues Consulting Group for a refresh. On their team I spearheaded a brand and website redesign, presented in a deck alongside my team.",
      },
      {
        type: "artifactGrid",
        media: [
          { src: "/images/ichioka-1.png", alt: "Ichioka and Nakao logo redesign" },
          { src: "/images/ichioka-hero.png", alt: "Ichioka and Nakao brand refresh" },
          { src: "/images/ichioka-2.jpeg", alt: "Ichioka and Nakao website redesign" },
          { src: "/images/ichioka-3.jpeg", alt: "Ichioka and Nakao brand redesign" },
        ],
      },
    ],
  },

  /* ---- PLAY collections (grid page, not the works index) ---- */
  {
    slug: "graphics",
    title: "Graphics",
    lede: "Miscellaneous graphics from over the years: Instagram posts, flyers, and illustrative work made for fun",
    credits: [
      { label: "Role", value: "Designer / Illustrator" },
      { label: "Timeline", value: "2023–2025" },
      { label: "Disciplines", value: "Art Direction, Graphic Design, Illustration" },
    ],
    next: "smallworks",
    category: "Graphic Design",
    year: "2023–2025",
    role: "Designer / Illustrator",
    play: true,
    blocks: [
      {
        type: "artifactGrid",
        media: [
          { src: "/images/graphics-hero.webp", alt: "" },
          { src: "/images/graphics-2.webp", alt: "" },
          { src: "/images/graphics-3.webp", alt: "" },
          { src: "/images/graphics-4.webp", alt: "" },
          { src: "/images/graphics-5.png", alt: "" },
          { src: "/images/graphics-6.png", alt: "" },
        ],
      },
      {
        type: "artifactGrid",
        media: [{ src: "/images/graphics-7.png", alt: "" }, { src: "/images/smallworks-hero.png", alt: "" }],
      },
    ],
  },
  {
    slug: "smallworks",
    title: "Small Works",
    lede: "Projects from hackathons, design challenges, and class projects that don't quite warrant their own page",
    credits: [
      { label: "Role", value: "Designer" },
      { label: "Timeline", value: "2023–2025" },
      { label: "Disciplines", value: "UI/UX Design, Website Design, Branding" },
    ],
    next: "graphics",
    category: "Personal",
    year: "2023–2025",
    role: "Designer",
    play: true,
    blocks: [
      {
        type: "artifactGrid",
        media: [
          { src: "/images/smallworks-1.webp", alt: "" },
          { src: "/images/smallworks-2.webp", alt: "" },
          { src: "/images/smallworks-3.png", alt: "" },
        ],
      },
    ],
  },
];

export const featuredWorks = works.filter((w) => w.featured);
export const indexWorks = works.filter((w) => !w.play);
export const playWorks = works.filter((w) => w.play);
export const PROTECTED_SLUGS = works.filter((w) => w.protected).map((w) => w.slug);
export const getWork = (slug: string) => works.find((w) => w.slug === slug);

/* build-time spine checks — warnings, never failures (thin works are
   sanctioned; the warning is the honest "unfinished" marker) */
if (process.env.NODE_ENV !== "production" || process.env.npm_lifecycle_event === "build") {
  for (const w of works) {
    if (w.play) continue;
    if (!w.blocks.some((b) => b.type === "problem")) {
      console.warn(`[works] ${w.slug}: no problem block — case study reads as unfinished`);
    }
    if (w.blocks.length > 7) {
      console.warn(`[works] ${w.slug}: ${w.blocks.length} blocks exceeds the 7-block cap`);
    }
    if (w.featured && !w.blurb && w.lede.length > 72) {
      console.warn(`[works] ${w.slug}: no blurb and lede is ${w.lede.length} chars — will clamp on the home card`);
    }
    for (const b of w.blocks) {
      if (b.type === "artifactGrid" && (b.media.length < 2 || b.media.length > 6)) {
        console.warn(`[works] ${w.slug}: artifactGrid has ${b.media.length} images (spec is 2–6)`);
      }
      if (b.type === "gate" && !w.protected) {
        console.warn(`[works] ${w.slug}: gate block without protected flag`);
      }
    }
  }
}
