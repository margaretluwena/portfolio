/*
  Works data - case-study spine v2 (argument-led).
  Slugs match the CURRENT live site (margaretluwena.net/works/[slug]) so
  existing links, routing, and SEO carry over. Keep the slugs.

  Every case study is: frame -> rail -> context -> problem -> solution ->
  wip -> next, with optional artifactGrid and gate. The rail derives from
  the blocks array. Mark's content is canonical in docs/content/mark.md
  (from Margaret's voice notes); media marked { src: "NEED", ... } renders
  as a labeled placeholder until the asset exists. NEVER fill NEED strings
  with generated text - they are Margaret's to write/supply.

  All prose here is Margaret's (ported from the live site or her voice
  notes), with the 2026-10-20 brief / takeaways drafts marked as such.
*/

export type Media = {
  src: string;      // "NEED" renders a labeled placeholder using alt as the label
  alt: string;
  video?: true;     // local short excerpt only - full pitches are embedded, never in /public
  poster?: string;
  embed?: string;   // unlisted YouTube/Vimeo URL; takes precedence over src
};

export type Block =
  | { type: "context"; body: string; media?: Media }
  /* the brief (2026-10-20, after the reference studies Margaret sent): one
     line on the objective, the goals it broke into, and what she did */
  | { type: "brief"; objective: string; goals: string[]; did: string[] }
  /* takeaways: what she is taking with her, each a claim and a line under it */
  | { type: "lessons"; items: { title: string; body: string }[] }
  | { type: "problem"; headline: string; evidence: string[]; body: string; media?: Media }
  /* a piece may carry a `gallery`: a row of images side by side under its media (the three Mark share styles, 2026-10-21) */
  | { type: "solution"; pieces: { name: string; caption: string; media: Media; gallery?: Media[] }[] }
  | { type: "artifactGrid"; media: Media[] }  // 2-6 images, no captions
  /* the "also" strip (Chris Pramana's feedback, 2026-10-26: show the solution,
     then say "here are a few other things I did"): the work that is not the
     product story, each item an image, a name, and one line, after the
     solution and before the takeaways */
  | { type: "also"; intro?: string; items: { name: string; line: string; media: Media; href?: string }[] }
  /* an essay section (Traeco, 2026-10-29): a titled run of paragraphs with
     an optional visual. `rail` is the minimap's short name. A paragraph
     that starts "Decision:" renders with that word as a label. Text in
     [MAR: ...] or [CHECK ...] brackets is Margaret's placeholder and renders
     highlighted on the page until she fills it. `items` is a numbered list
     (What shipped); `parts` are titled sub-paragraphs (Designing in code). */
  | {
      type: "essay";
      title: string;
      /* the minimap's short name; null keeps the section out of the minimap
         (the second and third problems sit under the first's "Problems") */
      rail?: string | null;
      body?: string[];
      items?: { num: string; title: string; body: string }[];
      parts?: { title: string; body: string }[];
      visual?: Visual;
      /* the visual sits above the body instead of below it */
      visualFirst?: boolean;
      /* or after this paragraph (0-based) instead of at the end */
      visualAfter?: number;
      /* a second visual, always at the end (the first one sits after a paragraph) */
      extraVisual?: Visual;
    }
  /* the outcome strip under the credits: three or four short facts */
  | { type: "stats"; items: { value: string; label: string; href?: string }[] }
  | { type: "wip"; email: string };

/* a section's visual: recorded product footage, one of the coded animations,
   a plain image, or a slot still to be filled */
export type Visual =
  | { kind: "video"; src: string; poster: string; caption: string; aspect?: string }
  | { kind: "animation"; name: "integration-snippet" | "before-after" | "research-funnel"; caption: string }
  | { kind: "image"; media: Media; caption?: string }
  /* a row of images side by side, tops aligned, one caption for the row */
  | { kind: "gallery"; media: Media[]; caption?: string }
  | { kind: "slot"; note: string };

export type Credit = { label: string; value: string };

/*
  Cover art for the home cards. Placement differs per card, so each layer
  carries its own geometry as % of the card box (taken from that card's
  Figma frame on "Portfolio Revamp" - 972 × 678 each), and holds at any
  card width. Layers render in array order (first = bottom).
*/
export type CoverLayer = {
  src: string;    // image src; for video layers the MP4 ("NEED" until the export exists)
  left: string;   // % of card width
  top: string;    // % of card height
  width: string;  // % of card width
  height: string; // % of card height
  /* video cover (the plan for all four cards - adding one is a data edit):
     autoplaying muted loop, poster always set, plays only in viewport,
     poster-only on mobile and reduced motion, poster swap during the morph */
  video?: true;
  poster?: string;  // required for video layers: frame 1 as a static image
  srcWebm?: string; // WebM served first, MP4 as fallback
  /* Figma places some layers rotated. The box above is then the UNROTATED
     box (Figma's own width/height, centered on the rotated node's center)
     and `rotate` turns it about that center - same as the canvas does.
     Never export a rotated node as a PNG: Figma flattens the page's white
     under it and the opaque corners cover whatever sits beneath. */
  rotate?: number;  // degrees, clockwise positive (Figma's sign)
  /* Figma "crop" image fills: the FULL image is drawn at this box (% of
     the layer) and the layer clips it. Omit for plain fit-inside layers. */
  crop?: { left: string; top: string; width: string; height: string };
};

export type Work = {
  slug: string;
  title: string;
  lede: string;            // one sentence, no second period - the opening line
  blurb?: string;          // home-card teaser; card falls back to lede (clamped) when absent
  /* the card's credibility pill (Shub, Granola 2026-10-09: "$X raised", the
     product type, the scale - a signal of the team for the visitor who never
     clicks). One short fact; drafted 2026-10-20 from each study's own prose. */
  signal?: string;
  credits: Credit[];       // Role / Timeline / Team / Disciplines as rows
  cover?: Media;           // frame visual; hero placeholder until covers exist
  hero?: Media;            // case-study hero when it should differ from the card art (Traeco: the brand hero, 2026-10-08)
  blocks: Block[];
  next: string;            // slug - the "next" line renders from this

  /* home column + routing */
  category: string;
  year: string;
  role?: string;           // works-index meta
  featured?: boolean;
  play?: boolean;          // shown on PLAY, not in the works index
  coverArt?: CoverLayer[]; // layered home-card art, per-card placement from Figma
  wordmark?: string;       // SVG lockup; title text is the alt/SR label
  wordmarkWidth?: string;  // % of card width (scale by width, natural aspect; default 16%)
  wordmarkGlow?: string;   // css filter under the lockup (Figma text-shadow, applied in CSS)
  cardBg?: string;         // card surface - default white (Traeco's frame is #303036)
  cardFade?: string;       // fade-into-text-zone gradient - default transparent -> white 77.9%
  cardText?: "light";      // description tone on dark cards
  accent?: string;         // case-study label colour (Context / Problem / Solution, credits) - the project's own; default --study-blue
  comingSoon?: boolean;    // home card reveals "Coming soon" on hover
};

const WIP_EMAIL = "luwena@usc.edu";

export const works: Work[] = [
  /* ---- Mark - copy from Margaret's "Case Studies" doc (2026-11-02):
     the product story (library, share cards) as the decisions, what
     shipped, the physical work in one strip, and her Looking back slot.
     New exports from the Mark iOS Figma file (Design V-3 page: the
     V3.2 library and share explorations, the V3.3 share sketches, the
     Demo V3.3 screens) sit beside the earlier ones. Her [MAR] and
     [CHECK] notes render highlighted until she fills them. ---- */
  {
    slug: "mark",
    title: "Mark",
    signal: "Raised $1M+", // Margaret, 2026-10-26 (was $3M+)
    lede: "The app and share cards for Mark, a reading companion that turns the lines you underline into something you'd want to post.",
    blurb: "The app and share cards for a reading companion", // product first (2026-10-26)
    credits: [
      { label: "Role", value: "Product designer, TroyLabs BUILD" }, // one of the first (the doc, 2026-11-02)
      { label: "Timeline", value: "Fall 2025, eight weeks" },
      { label: "Team", value: "Founder Eason Tang" },
      { label: "Disciplines", value: "Product Design, UI/UX, Brand, Merchandise, Packaging, Pitch Deck" },
    ],
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/mark-device.png", alt: "Mark device" },
    next: "traeco",
    category: "AI Hardware",
    year: "2025",
    role: "Designer",
    featured: true,
    accent: "#2f55d6",                        // royal blue for the labels (the near-black lockup colour read as plain black - Margaret, 2026-10-20)
    wordmark: "/images/wordmarks/mark.svg",   // Figma 127:3003, 155/972 of card width
    wordmarkWidth: "15.9%",
    /* Figma "Mark card" 255:586 (2026-10-08): three layers, the ORIGINAL
       source images (transparent) placed and rotated exactly as the canvas
       does. Bottom to top: the halftone hand (255:588, -3.82°), a second
       device fading off the lower edge (255:589, -12.18°, bleeds past the
       card - the article clips), and the device close-up riding the top
       (255:590, +2.82°, a crop fill - see CoverLayer.crop). */
    coverArt: [
      { src: "/images/covers/mark-hand-tilt.png",    left: "10.02%", top: "27.08%", width: "74.63%", height: "71.33%", rotate: -3.82 },
      { src: "/images/covers/mark-device-lower.png", left: "6.63%",  top: "37.82%", width: "97.28%", height: "78.45%", rotate: -12.18 },
      {
        src: "/images/covers/mark-device-top.png",
        left: "30.35%", top: "4.43%", width: "42.48%", height: "30.79%", rotate: 2.82,
        crop: { left: "-39.56%", top: "-78.8%", width: "139.57%", height: "345.11%" },
      },
    ],
    blocks: [
      {
        type: "essay",
        title: "Setup",
        rail: "Setup",
        body: [
          "Mark's bookmark saves a line the moment you underline it, and the app holds what it saves. Eason Tang built it through TroyLabs' BUILD program, and I joined as one of the first product designers for eight weeks in fall 2025. I explored how the app should hold notes and books, then designed the share cards that carry a line from the page to someone's feed.",
          "The screen that mattered most was the one that leaves the app. A line only brings in new readers if someone is proud to post it.",
          /* the raise is Mark's own announcement (x.com/thinkwithmark, 2026); the TIME listing was not found on time.com's 2026 collection pages on 2026-11-02 */
          "[CHECK: link the TIME listing and thinkwithmark.com]",
        ],
        visual: { kind: "image", media: { src: "/images/mark/app-share.png", alt: "Mark share screens: a quote on paper, in the app and ready to post" }, caption: "The share cards, the screen the whole app points at." },
        visualAfter: 1,
      },
      {
        type: "stats",
        items: [
          { value: "$1M+", label: "raised" },
          { value: "TIME Best Inventions", label: "2026" },
          { value: "8,000", label: "on the waitlist while I worked on it" },
        ],
      },
      {
        type: "essay",
        title: "The problem",
        rail: "Problem",
        body: [
          "Mark's bookmark saves a line the moment you underline it, so capture was already solved. The harder part was what came next: a saved line only mattered to the person who saved it, and Eason wanted reading to feel as shareable as Spotify Wrapped. That left the app with two questions, how to get readers coming back to their lines and how to get anyone else to care about them.",
        ],
        visual: { kind: "slot", note: "[MAR: a camera roll full of book screenshots, the way people saved lines before Mark]" },
      },
      {
        type: "essay",
        title: "The library is organised the way people actually read",
        rail: "Decisions",
        body: [
          "Mark had books, highlights and handwritten notes, which is more than most reading apps hold, so I spent the first few weeks trying different ways to structure them. [MAR: how many directions, and one line on why each lost]",
          "Decision: Any line can be found by book, by category or by the note written beside it, and every line stays with its note so you remember why it mattered.",
          "What I learned: I couldn't find the right structure on paper; it only became obvious after building out the wrong ones. [MAR: confirm]",
        ],
        /* three of the V3.2 library structures (a Recent card over a category grid, a category as a list, a bare grid), then the two tabs that shipped in Demo V3.3 */
        visual: {
          kind: "gallery",
          media: [
            { src: "/images/mark/explore-library-recent.png", alt: "An early Notes screen: the latest line, then a grid of categories" },
            { src: "/images/mark/explore-library-category.png", alt: "An early structure: one category opened as a list of lines" },
            { src: "/images/mark/explore-library-grid.png", alt: "An early structure: categories as a bare grid of cards" },
            { src: "/images/mark/library-categories.png", alt: "The library that shipped: Recent, Categories and Books tabs, categories as covers" },
            { src: "/images/mark/library-books.png", alt: "The library that shipped: the Books tab, every line filed under its book" },
          ],
          caption: "Three of the structures I tried, then the Categories and Books tabs that shipped.",
        },
      },
      {
        type: "essay",
        title: "The share cards are built to be posted",
        rail: null,
        body: [
          "A quote means very little to someone who hasn't read the book, and nobody posts something that looks like a screenshot. Every time I made the cards quieter, they got more forgettable. [MAR: the quieter versions you tried first]",
          "Decision: I went bold and Wrapped-style, with three styles to pick from: a signed letter in a yellow envelope, a stamped postcard and a sticky note with the line circled. [MAR: when each one is used]",
          "What I learned: Restraint isn't always good taste; a card has to be worth being seen with, so personality beat polish.",
        ],
        /* the V3.2 share sheet (the quote on plain paper) beside the three styles that shipped */
        visual: {
          kind: "gallery",
          media: [
            { src: "/images/mark/share-early.png", alt: "The quiet first share card: the quote on plain paper over a share sheet" },
            { src: "/images/mark/share-envelope.jpg", alt: "Share style one: the quote on paper, signed, in a yellow envelope" },
            { src: "/images/mark/share-postcard.jpg", alt: "Share style two: a postcard, the quote on the back with a stamp and postmark" },
            { src: "/images/mark/share-sticky.jpg", alt: "Share style three: a yellow sticky note, the quote circled in blue" },
          ],
          caption: "The quiet first card, then the three that shipped: envelope, postcard, sticky note.",
        },
        visualAfter: 0,
        extraVisual: { kind: "image", media: { src: "/images/mark/share-sketches.png", alt: "Hand-drawn share explorations: stat cards to scroll through, a library card with a tassel, a share quote with tap to edit" }, caption: "The share sketches: stats to pick from, a library card, and the quote card that became the three styles." },
      },
      {
        type: "essay",
        title: "What shipped",
        rail: "Shipped",
        body: ["[MAR: a 15-second recording from the library to a finished share card, to sit above this list]"],
        items: [
          { num: "01", title: "Library", body: "Every line, findable by book, category or note." },
          { num: "02", title: "Note detail", body: "The line next to what you thought about it." },
          { num: "03", title: "Share", body: "Pick a style and post." },
        ],
        visual: {
          kind: "gallery",
          media: [
            { src: "/images/mark/home-recents.png", alt: "Home: the latest line as a full card over a blurred cover, with View Recents and share" },
            { src: "/images/mark/app-notes-inside.png", alt: "Note detail: the book, the line, and the tools under it" },
            { src: "/images/mark/share-envelope-screen.png", alt: "Share quote: the letter in its envelope, with copy link, Messages and Instagram Story" },
          ],
          caption: "Home, a note, and the share screen as they shipped.",
        },
      },
      {
        type: "also",
        intro: "I also carried the brand into everything physical.",
        items: [
          {
            name: "Packaging",
            line: "Twenty rough concepts down to three, with yellow chosen last because it carried so much of the identity.",
            media: { src: "/images/mark/packaging-sleeves-2-board.jpg", alt: "The packaging concept board: the narrowed sleeves laid out together" },
          },
          {
            name: "Merch",
            line: "Stickers, shirts and totes built on the make your mark lines from the cards.",
            media: { src: "/images/mark/merch-stickers.jpg", alt: "Mark sticker sheet: the lockup, the blocks, and the make your mark lines" },
          },
          {
            name: "Pitch deck",
            line: "I turned Mark's idea into the three-minute deck for the LAUNCH summit. [MAR: the arc of the deck]",
            media: { src: "/videos/mark-pitch.mp4", alt: "Mark pitch deck, as presented at LAUNCH", video: true, poster: "/images/mark/pitch-poster.jpg" },
          },
        ],
      },
      {
        type: "essay",
        title: "Looking back",
        rail: "Looking back",
        body: ["[MAR: one or two sentences on what you'd do differently next time, for example putting the share cards in front of real readers sooner]"],
      },
    ],
  },

  /* ---- Traeco - copy from Margaret's "Case Studies" doc (2026-11-02):
     setup, the problem, three decisions each with what she learned, what
     shipped, building it herself, around it, looking back. The recorded
     footage and the three coded animations (2026-10-29) stay where they
     were. Her [MAR] and [CHECK] notes render highlighted until she fills
     them. ---- */
  {
    slug: "traeco",
    title: "Traeco",
    signal: "Audience Choice winner", // LavaLab closing summit; a traction number would beat this
    lede: "A dashboard that shows teams what their AI agents cost and recommends how to spend less without the agents getting worse.",
    blurb: "The dashboard that tells teams what their agents should cost", // product first (2026-10-29)
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/traeco-dashboard.png", alt: "Traeco dashboard" },
    /* the study opens on the brand hero (moved up from the context block) */
    hero: { src: "/images/traeco/hero.png", alt: "Traeco brand hero" },
    credits: [
      { label: "Timeline", value: "2026" },
      { label: "Role", value: "Cofounder and CPO" },
      { label: "Team", value: "Mehek Mandal, Kyna Rochlani, Sania Gupta" }, // roles confirmed by traeco.dev/about (2026-10-09)
      { label: "Scope", value: "Product, design system, web, brand, pitch" },
    ],
    next: "atlix",
    category: "AI B2B SaaS",
    year: "2026",
    role: "Co-founder & CPO",
    featured: true,
    accent: "#1ba86f",                        // Traeco green (the lockup)
    wordmark: "/images/wordmarks/traeco.svg", // Figma 140:694, 164/972 of card width
    wordmarkWidth: "16.9%",
    wordmarkGlow: "drop-shadow(0 1px 3.5px rgba(27,168,111,0.5))", // Figma 140:692 text-shadow
    // Figma "Traeco card" 139:559 is the dark variant: #303036 surface,
    // fade to #242428, white/50 description
    /* the green refresh (2026-10-29): the card sits on the dashboard's own
       near-black (--bg-app) and fades into its sidebar tone, with the new
       home on the laptop screen (scripts/capture: card-cover) */
    cardBg: "#111214",
    cardFade: "linear-gradient(to bottom, rgba(12,13,15,0), rgba(12,13,15,0.03) 37.5%, #0C0D0F 77.9%)",
    cardText: "light",
    // laptop chrome (140:695) under the floating dashboard (140:715); the
    // dashboard is sized a hair past the white display area so no white
    // sliver shows at its sides
    coverArt: [
      /* Figma-exact 2026-08-01: the Mockup bleeds 1.95% past both card
         edges (x=-19 on the 972 frame); clipping it to 0/100% shifted the
         dashboard off the laptop screen */
      { src: "/images/covers/traeco-laptop.png", left: "-1.95%", top: "9.29%", width: "103.81%", height: "86%" },
      { src: "/images/covers/traeco-dashboard.png", left: "8.96%", top: "12.17%", width: "81.55%", height: "72.22%" },
    ],
    /* Restructured 2026-10-29 to Margaret's copy (after Chris Pramana's
       read): Setup, the research story, three problems each with a
       decision and a visual, what shipped, designing in code, around it,
       reflection. Her [MAR: ...] and [CHECK ...] notes are kept verbatim
       and render highlighted on the page until she fills them. Visuals:
       recorded product footage (scripts/capture/traeco.ts) and three coded
       animations (components/works/motion). */
    blocks: [
      {
        type: "essay",
        title: "Setup",
        rail: "Setup",
        body: [
          "Traeco is a dashboard that shows teams what their AI agents cost and recommends how to spend less without the agents getting worse. I was cofounder and CPO with Mehek Mandal, Kyna Rochlani and Sania Gupta, and as the only designer I designed and built the product, the design system and the website, and shipped all of it to production.",
          "Showing teams what they could save was easy. Getting them to act meant proving their agents wouldn't get worse.",
        ],
        visual: { kind: "video", src: "/videos/traeco/hero.mp4", poster: "/images/traeco/posters/hero.jpg", aspect: "1440 / 900", caption: "The dashboard home: savings available, then the top recommendations." },
      },
      {
        type: "stats",
        items: [
          { value: "22% to 71%", label: "acted on a recommendation, in usability tests" },
          { value: "Audience Choice", label: "LavaLab closing summit" },
          { value: "traeco.dev", label: "shipped to production", href: "https://traeco.dev" },
        ],
      },
      {
        type: "essay",
        title: "The problem",
        rail: "Problem",
        body: [
          "We were 50+ calls into looking for a startup idea across 11 industries when our own AI agents started costing us more every week. We narrowed the rest of our research to teams using agents and kept hearing the same thing: it wasn't urgent yet, but everyone knew it would be. Plenty of tools showed what agents had spent, but almost none we found told you what to change.",
          /* the public proof the doc asks for, with its source (re-verified 2026-10-29: Uber's cap as reported in April 2026) */
          "It isn't only startups. Uber [exhausted its entire 2026 AI coding budget by April](https://finance.yahoo.com/markets/stocks/articles/uber-stock-drops-reportedly-caps-190100595.html) and now caps engineers at $1,500 a month per tool.",
        ],
        visual: { kind: "animation", name: "research-funnel", caption: "Fifty-plus calls across eleven industries, narrowing to agentic AI." },
        visualAfter: 0,
      },
      {
        type: "essay",
        title: "Setup takes two lines of code",
        rail: "Decisions",
        body: [
          "Since nobody was in pain yet, nobody would sit through a long setup.",
          /* verified in the repo (2026-11-02): traeco.init() and traeco.wrap() are the whole integration; the dashboard's hero eyebrow reads "Savings available" whenever there are savings */
          "Decision: The integration is two lines of code, and savings available sits at the top of the dashboard, so the first thing a team sees is money they can get back instead of a bill.",
          "What I learned: When a problem isn't urgent yet, every setup step is a reason to say no.",
        ],
        visual: { kind: "animation", name: "integration-snippet", caption: "Add two lines around an existing client and the first dashboard view fills in from the traces." },
      },
      {
        type: "essay",
        title: "The home screen only shows what people would pay for",
        rail: null,
        body: [
          "I sorted everything from the calls into two lists, what makes the product usable and what makes it worth paying for. [MAR: the early versions]",
          "Decision: Home shows savings, top recommendations and a spend breakdown, and everything else is one click deeper.",
          "What I learned: The list of what people would pay for is always shorter, and it makes the better product.",
        ],
        visual: { kind: "animation", name: "before-after", caption: "Drag to compare my first iteration with the most recent one." },
      },
      {
        type: "essay",
        title: "Every recommendation shows that quality holds",
        rail: null,
        body: [
          /* the testing line is drafted from the repo's own record (the SDK's shadow evaluation, AUDIT.md trace 3): a slice of live calls re-run against the candidate model, three judge votes with randomised order, numbers only */
          "Recommendations were what set us apart, and they also made people nervous; if a cheaper setup made an agent worse, that was on us. So we tracked quality on every agent and tested each change before it rolled out: on a slice of live traffic the SDK re-runs the same request on the cheaper model, and three judge votes compare the two outputs, so a recommendation carries a measured preference before anyone accepts it. [CHECK: this is how the SDK's shadow evaluation reads in the repo; keep it in your words]",
          "Decision: Each recommendation shows cost, quality and confidence side by side, and teams can try it on a small share of traffic before switching fully. [MAR: if this is what moved 22% to 71%, say so]",
          "What I learned: A recommendation is only as useful as people's trust in it.",
        ],
        visual: { kind: "video", src: "/videos/traeco/recommendations.mp4", poster: "/images/traeco/posters/recommendations.jpg", caption: "Open a recommendation to see what it saves, what it does to quality and how sure the judge is, then try it on part of the traffic." },
      },
      {
        type: "essay",
        title: "What shipped",
        rail: "Shipped",
        items: [
          { num: "01", title: "Home", body: "Savings, top recommendations and spend." },
          { num: "02", title: "Recommendations", body: "Cost, quality and confidence, with the option to test before committing." },
          { num: "03", title: "Agent detail", body: "Six weeks of quality history for each agent." },
          /* what the repo has (checked 2026-10-29): per-agent budgets on the API, defaults of a 2% judge-preference drop, 2% faithfulness drop, zero structure drop and 200ms of p95 latency, alert-only on breach; no settings screen yet */
          { num: "04", title: "Quality budgets", body: "Limits a team sets once on how far quality may slip, and the product holds every change to them. Set through the API today; the settings screen is next." },
        ],
        visual: { kind: "video", src: "/videos/traeco/drilldown.mp4", poster: "/images/traeco/posters/drilldown.jpg", caption: "Drilling from a recommendation into one agent's six-week quality history." },
      },
      {
        type: "essay",
        title: "Building it myself",
        rail: "In code",
        body: [
          "Traeco was the first product I built from scratch and shipped, and my first time using Claude Code. Seeing real data in it showed me quickly what was feasible and what only worked in Figma, and every component had to hold up for one agent or hundreds. [MAR: one example]",
        ],
      },
      {
        type: "also",
        items: [
          {
            name: "Brand",
            line: "Near-black with a single green, so the only colour on screen is what matters.",
            media: { src: "/images/traeco/brand-system.png", alt: "The Traeco system: the mark from favicon to hero size, the single green on near-black, the surface steps and the type scale" },
          },
          {
            name: "Website",
            href: "https://traeco.dev",
            line: "traeco.dev walks a buyer from the problem to pricing.",
            media: { src: "/images/traeco/site-hero.jpg", alt: "traeco.dev hero: the mark scaled to full bleed behind the headline" },
          },
          {
            name: "Pitch decks",
            line: "One for presenting live and one that works on its own in an inbox.",
            media: { src: "/videos/traeco-pitch.mp4", alt: "Traeco pitch deck", video: true, poster: "/images/traeco/pitch-poster.jpg" },
          },
        ],
      },
      {
        type: "essay",
        title: "Looking back",
        rail: "Looking back",
        body: ["[MAR: one or two sentences on what you'd do differently next time, for example narrowing to agentic AI sooner]"],
      },
    ],
  },

  /* ---- Atlix - copy from Margaret's "Case Studies" doc (2026-11-02):
     setup, the timing problem, two decisions with what she learned, what
     shipped, around it, looking back. Media: the prior dashboard and hero
     exports and the pitch recording; the atlix-landing repo (May 2026,
     Jeff Yang's PRD, public/atlixdemo.mp4) is the later policymaker
     positioning and a 15MB product demo, not pulled in yet. Team names
     stay hers to supply. ---- */
  {
    slug: "atlix",
    title: "Atlix",
    signal: "Finalist, GSSC",
    lede: "A dashboard that shows what young Californians are saying about politics online, in real time, for advocacy groups and policy researchers.",
    blurb: "Brand and interface for a narrative intelligence platform",
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/atlix-poster.png", alt: "Atlix cover" },
    credits: [
      { label: "Role", value: "Cofounder and design lead" },
      { label: "Timeline", value: "2026" },
      { label: "Team", value: "NEED" }, // [MAR: cofounder names]
      { label: "Disciplines", value: "Product Design, Design System, Brand Identity, Pitch Deck" },
    ],
    next: "mark", // skips Impeccable Chicken while its study is unreachable
    category: "AI B2B SaaS",
    year: "2026",
    role: "Co-founder",
    featured: true,
    /* Figma "atlix card" 139:574: navy gradient surface, demo video
       full-bleed across the top (161:749, 972x561 at y=-4), dark fade,
       white/50 description. Video files pending Mar's Figma export -
       drop paths into src / srcWebm below and it goes live (poster
       renders until then). */
    wordmark: "/images/wordmarks/atlix.svg", // Figma 161:747, 154.68/972 of card width
    wordmarkWidth: "15.91%",
    cardBg: "linear-gradient(to bottom, #000615 34.84%, #00245c 131.76%)",
    cardFade: "linear-gradient(to bottom, rgba(19,39,72,0), #041022 77.889%)",
    cardText: "light",
    coverArt: [
      {
        src: "NEED",
        video: true,
        poster: "/images/covers/atlix-poster.png",
        left: "0%",
        top: "-0.59%",
        width: "100%",
        height: "82.74%",
      },
    ],
    blocks: [
      {
        type: "essay",
        title: "Setup",
        rail: "Setup",
        body: [
          "Atlix is a dashboard that shows what young Californians are saying about politics online, in real time, for advocacy groups and policy researchers. I researched how policy teams work, then designed the dashboard, brand and pitch deck, as cofounder and design lead in 2026 with [MAR: cofounder names].",
          "Researchers already had more information than they could read, so most of the design work was deciding what to leave out.",
          "[CHECK: mention the Government of Telangana as a design partner only if it is public]",
        ],
        visual: { kind: "image", media: { src: "/images/atlix/dashboard.png", alt: "The Atlix dashboard: filters on the left, a sort row, and a grid of narrative cards" }, caption: "The dashboard card grid." },
        visualAfter: 1,
      },
      {
        type: "stats",
        items: [
          { value: "Finalist", label: "Global Student Startup Competition, Seoul" },
          { value: "First team", label: "to represent USC there" },
        ],
      },
      {
        type: "essay",
        title: "The problem",
        rail: "Problem",
        body: [
          "The competition asked teams to empower the next generation through social media, so we chose youth political engagement and tested the idea with local politicians first. [MAR: what they told you] The gap was timing; by the time a poll or report comes out, young people's conversation has already moved on.",
        ],
        visual: { kind: "slot", note: "[MAR: a dated quarterly report beside a live card, to show the gap]" },
      },
      {
        type: "essay",
        title: "Summaries come first, with the source always visible",
        rail: "Decisions",
        body: [
          "Before opening Figma, I spent weeks reading the reports policy teams already use and talking to researchers and advocacy groups. They didn't want another data tool to dig through; they wanted summaries they could trust.",
          "Decision: Every card states one narrative in plain words and shows its source, so a researcher can check it in one click.",
          "What I learned: Research isn't a checkbox; every conversation made half the decisions for me.",
        ],
        visual: { kind: "slot", note: "[MAR: one card up close, with its source visible]" },
      },
      {
        type: "essay",
        title: "Each card answers four questions",
        rail: null,
        body: [
          "My first version had filters everywhere and charts on charts, and researchers couldn't tell what it was saying in the first few seconds. [MAR: the early versions]",
          "Decision: Each card answers four things only: the topic, where it's happening, how fast it's growing and who's talking.",
          "What I learned: Cutting felt like losing something, but every field I removed made the grid look more sure of itself.",
        ],
        visual: { kind: "slot", note: "[MAR: the busy first version, to sit beside the final grid]" },
      },
      {
        type: "essay",
        title: "What shipped",
        rail: "Shipped",
        items: [
          { num: "01", title: "Filters", body: "Region and issue." },
          { num: "02", title: "Sorting", body: "[MAR: which sorts]" },
          { num: "03", title: "Cards", body: "One narrative each, with its source." },
        ],
        visual: { kind: "slot", note: "[MAR: a recording of filtering by region and opening a card's source; the demo in the atlix-landing repo could stand in]" },
      },
      {
        type: "also",
        items: [
          {
            name: "Brand",
            line: "Dark navy with one accent and a plain wordmark, so the product stays the focus.",
            media: { src: "/images/atlix/hero.png", alt: "Atlix brand hero: the wordmark on navy" },
          },
          {
            name: "Seoul pitch deck",
            line: "The deck for the final in Seoul, as presented.",
            media: { src: "/videos/atlix-pitch.mp4", alt: "Atlix pitch, as presented in Seoul", video: true, poster: "/images/covers/atlix-poster.png" },
          },
          {
            name: "Design system",
            line: "The components and tokens behind the dashboard.",
            media: { src: "NEED", alt: "one image of the design system" },
          },
        ],
      },
      {
        type: "essay",
        title: "Looking back",
        rail: "Looking back",
        body: ["[MAR: one or two sentences on what you'd do differently next time]"],
      },
    ],
  },

  /* ---- Impeccable Chicken - thin until content exists ---- */
  {
    slug: "impeccable-chicken",
    title: "Impeccable Chicken",
    signal: "Seen on Shark Tank",
    lede: "Brand system and pitch deck for the ready to eat chicken brand that pitched on Shark Tank",
    blurb: "Brand and deck for the ready to eat chicken CPG seen on Shark Tank",
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/ic-photo.png", alt: "Impeccable Chicken photo" },
    credits: [
      { label: "Role", value: "Pitch Deck Design" },
      { label: "Timeline", value: "2025" },
      { label: "Disciplines", value: "Pitch Deck, Brand System" },
    ],
    next: "mark",
    category: "Brand / Deck",
    year: "2025",
    role: "Pitch Deck Design",
    featured: true,
    comingSoon: true,
    /* Figma "impeccable chicken card" 163:758: burnt orange surface, product
       photo full-bleed (163:759, export pre-clipped to the visible region),
       orange fade, white/50 description. Wordmark 163:763 is a TEXT node in
       Monstro; the export outlines it to paths, so it ships as SVG like the
       others (no font file needed). 163:760 skipped (hidden leftover);
       163:762 lorem not ported. Video cover later, same as the others. */
    accent: "#e2531d",                                    // Impeccable Chicken orange
    // the orange copy of the lockup reads on the white fade; the cream
    // original (impeccable-chicken.svg) is for the orange-fade card
    wordmark: "/images/wordmarks/impeccable-chicken-orange.svg", // 168/972 of card width
    wordmarkWidth: "17.28%",
    // white surface + white fade like Glance and Mountain Dew for now (Margaret,
    // 2026-10-09; the orange cardBg read as a harsh ring at the border). The Figma
    // version was cardBg #c94512, fade linear-gradient(to bottom, rgba(241,95,38,0),
    // #f15f26 77.889%), cardText "light", photo at left 6.48% / width 93.52%.
    coverArt: [
      /* the photo (pre-clipped to 93.52% of the card) drawn 6.9% larger as a crop
         fill so it reaches the left edge - no white strip beside it */
      {
        src: "/images/covers/ic-photo.png", left: "0%", top: "0%", width: "100%", height: "100%",
        crop: { left: "0%", top: "-3.46%", width: "106.93%", height: "106.93%" },
      },
    ],
    blocks: [
      { type: "context", body: "Case study in progress. Content coming soon." },
      { type: "wip", email: WIP_EMAIL },
    ],
  },

  /* ---- Works index only ---- */
  {
    slug: "glance",
    title: "Glance",
    signal: "TroyLabs BUILD",
    lede: "Website and logo design for a productivity startup",
    cover: { src: "/images/glance-hero.png", alt: "Glance" },
    credits: [
      { label: "Role", value: "Designer, TroyLabs BUILD" },
      { label: "Timeline", value: "2025" },
      { label: "Disciplines", value: "Website Design, Logo Design, UI/UX Design, Framer Development" },
    ],
    next: "mountaindew",
    category: "Productivity",
    year: "2025",
    role: "Designer",
    comingSoon: true, // parked for now (Margaret, 2026-10-09)
    /* the hero art drawn larger and started above the card, so the logo
       centres ~38% down instead of halfway (Margaret: "shift the logo up") */
    coverArt: [
      /* 0.8x of the Mountain Dew-sized layer, scaled about its centre so the
         logo keeps its height (Margaret, 2026-10-09: "smaller, height is good") */
      { src: "/images/glance-hero.png", left: "-4.49%", top: "-11.60%", width: "108.98%", height: "99.20%" },
    ],
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
    signal: "Avenues Consulting Group",
    lede: "Bottle redesigns and brand strategy for Mountain Dew",
    cover: { src: "/images/mountaindew-hero.png", alt: "Mountain Dew" },
    credits: [
      { label: "Role", value: "Design Consultant, Avenues Consulting Group" },
      { label: "Timeline", value: "2024" },
      { label: "Disciplines", value: "Product Design, Brand Strategy, Slide Deck" },
    ],
    next: "prosaic-intelligence", // Ichioka and Nakao removed 2026-10-09
    category: "CPG",
    year: "2024",
    role: "Design Consultant",
    comingSoon: true, // parked for now (Margaret, 2026-10-09)
    coverArt: [
      { src: "/images/mountaindew-hero.png", left: "-7.95%", top: "-24%", width: "115.90%", height: "124%" },
    ],
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
  /* ---- Prosaic Intelligence - copy from Margaret's "Case Studies" doc
     (2026-11-02), over the preliminary study written the same day from the
     project's own record (README, NEXT, HANDOFF, docs/design-system, 92
     commits from 19 to 20 September 2026) and the "Mar <> Anantika" Figma
     file. The type sheet is that file's "Font choice 1" frame. The site is
     NEVER linked from here (her instruction); the index's scores are
     generated placeholders, so no new screenshots of named products'
     numbers. Unparked so she can read it; her [MAR] and [CHECK] slots
     render highlighted. ---- */
  {
    slug: "prosaic-intelligence",
    title: "Prosaic Intelligence",
    signal: "Built in three days",
    lede: "A public index that scores how sixteen popular AI products handle safety, built so anyone can see which one is safest for what they use it for.",
    blurb: "A public index of consumer AI safety, designed and built in a weekend",
    cover: { src: "/images/covers/prosaic-site.jpg", alt: "Prosaic Intelligence home" },
    credits: [
      { label: "Timeline", value: "September 2026, three days" },
      { label: "Role", value: "Designer and builder" },
      { label: "Team", value: "NEED" }, // [CHECK: the founder's name]
      { label: "Scope", value: "Brand, web, data visualization, motion" },
    ],
    next: "mark",
    category: "AI Safety",
    year: "2026",
    role: "Designer",
    comingSoon: false, // unparked 2026-11-02 so Margaret can read the draft on the site; the site itself stays unlinked
    accent: "#2f6fbf", // the index's signal blue, the one pressable colour on the site
    blocks: [
      {
        type: "essay",
        title: "Setup",
        rail: "Setup",
        body: [
          "Prosaic Intelligence is a public index that scores how sixteen popular AI products handle safety, built so anyone can see which one is safest for what they use it for. I designed and built the whole site, including the brand, charts and motion, in three days with Claude Code, in September 2026, with [CHECK: the founder's name].",
          "There's no single safest AI, only the one that's safest for what you care about, so the site asks your question before it gives you an answer.",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/home.jpg", alt: "Prosaic Intelligence home: the serif lockup on a dark card over the dot-screen artwork" }, caption: "The home page. [MAR: a recording of it scrolling down would replace this still]" },
      },
      {
        type: "stats",
        items: [
          { value: "3 days", label: "from brief to a deployed site" },
          { value: "16 products, 7 risks", label: "on one scale, re-weighted by use case" },
          { value: "23 pages", label: "with a full methodology; every chart colour passes contrast" },
        ],
      },
      {
        type: "essay",
        title: "The problem",
        rail: "Problem",
        body: [
          "The founder had collected published safety results for sixteen AI products, from ChatGPT to Character AI, and the press was already interested. They needed a site by Sunday that anyone could understand and that would hold up to scrutiny, since it names real companies. [CHECK: confirm the timing and the press detail]",
        ],
        visual: { kind: "slot", note: "[MAR: a raw benchmark table beside the index view, to show what the site translates]" },
      },
      {
        type: "essay",
        title: "Readers pick their use case before they see a ranking",
        rail: "Decisions",
        body: [
          "A single safest AI ranking is misleading, because a product can score well overall and still fail badly in one area.",
          "Decision: The page opens with a sentence to finish, Which AI is safest for, with options like long conversations or someone having a hard time, and the ranking reorders around your answer.",
          "What I learned: A ranking without a use case is a number without meaning.",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/index-header.jpg", alt: "AI Safety Index: which AI is safest for, with the use-case pills" }, caption: "Finish the sentence and the index re-weights around your answer. [MAR: a recording of the ranking reordering would replace this still]" },
      },
      {
        type: "essay",
        title: "The site feels like a measuring tool, not an app",
        rail: null,
        body: [
          "The founder wanted something people would talk about, but safety data about real companies also needs to feel precise.",
          "Decision: I built the design around an abacus; beads carry the navigation and move with your cursor or the tilt of your phone, and each bar shows how far a product is from a perfect score, not just its rank. [MAR: the bead moment you're proudest of]",
          "What I learned: A serious subject can still feel alive, as long as the playful parts never get in the way of the data. [MAR: confirm]",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/general-use.jpg", alt: "General use: sixteen models as bars against the index average" }, caption: "Sixteen bars, the headroom to 100 in each one's own tint, and one line for the average." },
      },
      {
        type: "essay",
        title: "The build checks every number",
        rail: null,
        body: [
          "Every score had to trace back to a source and every page had to work on a phone, with one person building in three days.",
          "Decision: I designed directly in code and set the build to fail if any data was wrong or any colour failed contrast, so I could move fast without publishing a mistake. [MAR: one thing you noticed only once real screens existed]",
          "What I learned: Automatic checks are what make a tight deadline safe.",
        ],
        visual: { kind: "slot", note: "[MAR: the methodology page with its sources and weights tables]" },
      },
      {
        type: "essay",
        title: "What shipped",
        rail: "Shipped",
        items: [
          { num: "01", title: "The index", body: "Pick a use case and sixteen products re-rank on one scale." },
          { num: "02", title: "Risk pages", body: "One per category, with the finding, its sources and its limits." },
          { num: "03", title: "Methodology", body: "Where the data comes from and how scores are weighted." },
          { num: "04", title: "Company pages", body: "Each maker's products across all seven risks." },
        ],
        visual: { kind: "slot", note: "[MAR: the index on a phone, since most readers arrive from a news link]" },
      },
      {
        type: "also",
        items: [
          {
            name: "Type and colour",
            line: "Newsreader, Switzer and Geist Mono, with one blue on warm neutrals.",
            media: { src: "/images/prosaic/type.png", alt: "The type sheet: Newsreader for the name, Switzer for the interface, Geist Mono for the numerals" },
          },
          {
            name: "Handoff",
            line: "A design system, a decisions log and an ownership file, so the team could launch without me.",
            media: { src: "NEED", alt: "The handoff documents" },
          },
        ],
      },
      {
        type: "essay",
        title: "Looking back",
        rail: "Looking back",
        body: ["[MAR: one or two sentences on what you'd do differently next time]"],
      },
    ],
  },

  /* ---- PLAY collections (grid page, not the works index) ---- */
  {
    slug: "graphics",
    title: "Graphics",
    lede: "Instagram posts, flyers, and illustration made over the years",
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
    lede: "Projects from hackathons, design challenges, and class projects",
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
export const getWork = (slug: string) => works.find((w) => w.slug === slug);

/* build-time spine checks - warnings, never failures (thin works are
   sanctioned; the warning is the honest "unfinished" marker) */
if (process.env.NODE_ENV !== "production" || process.env.npm_lifecycle_event === "build") {
  for (const w of works) {
    if (w.play) continue;
    if (!w.blocks.some((b) => b.type === "problem")) {
      console.warn(`[works] ${w.slug}: no problem block - case study reads as unfinished`);
    }
    if (w.blocks.length > 12) {
      console.warn(`[works] ${w.slug}: ${w.blocks.length} blocks exceeds the 12-block cap`);
    }
    if (w.featured && !w.blurb && w.lede.length > 72) {
      console.warn(`[works] ${w.slug}: no blurb and lede is ${w.lede.length} chars - will clamp on the home card`);
    }
    for (const b of w.blocks) {
      if (b.type === "artifactGrid" && (b.media.length < 2 || b.media.length > 6)) {
        console.warn(`[works] ${w.slug}: artifactGrid has ${b.media.length} images (spec is 2–6)`);
      }
    }
  }
}
