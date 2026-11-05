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
      /* the visual beside the body, text left and visual right (Mark's Setup) */
      visualSide?: boolean;
    }
  /* the outcome strip under the credits: three or four short facts */
  | { type: "stats"; items: { value: string; label: string; href?: string }[] }
  | { type: "wip"; email: string };

/* a section's visual: recorded product footage, one of the coded animations,
   a plain image, or a slot still to be filled */
export type Visual =
  | { kind: "video"; src: string; poster: string; caption: string; aspect?: string }
  | { kind: "animation"; name: "integration-snippet" | "before-after" | "research-funnel" | "report-vs-live"; caption: string }
  | { kind: "image"; media: Media; caption?: string }
  /* a row of images side by side, tops aligned, one caption for the row */
  | { kind: "gallery"; media?: Media[]; groups?: { label: string; media: Media[]; muted?: boolean }[]; caption?: string }
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
  point?: string;          // the doc's bold "The point" line, under the headline (2026-11-02)
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
    point: "The screen that mattered most was the one that leaves the app; a line only brings in new readers if someone's proud to post it.",
    blurb: "The app and share cards for a reading companion", // product first (2026-10-26)
    credits: [
      { label: "Role", value: "Product designer, TroyLabs BUILD" }, // one of the first (the doc, 2026-11-02)
      { label: "Timeline", value: "Fall 2025, eight weeks" },
      { label: "Team", value: "Eason Tang, Charlotte Chang, Rehaan Anjaria, Peter Kreuter, Eric Park, Carter Davis" }, // Margaret, 2026-11-02
      { label: "Disciplines", value: "Product Design, UI/UX, Brand, Merchandise, Packaging, Pitch Deck" },
    ],
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/mark-device.png", alt: "Mark device" },
    /* the study opens on the product photo: the bookmark on its pad over a
       MSCHF catalogue spread (Margaret's photo, 2026-11-03) */
    hero: { src: "/images/mark/hero.jpg", alt: "The Mark bookmark on its charging pad, resting on an open blue catalogue spread" },
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
      /* Cut to one highlight, the share cards (feedback, 2026-11-04: focus
         each study on one highlight, cut paragraphs, titles that tell the
         story). The library exploration (three early structures, the two
         tabs that shipped) came out; it is in git before this commit. */
      {
        type: "essay",
        title: "A bookmark that saves every line you underline",
        rail: "Setup",
        body: [
          "Mark's bookmark saves a line the moment you underline it, and the app holds what it saves. I joined Eason Tang's team through TroyLabs' BUILD program as one of the first product designers, for eight weeks in fall 2025, and designed the library and the share cards.",
          "Mark is at [thinkwithmark.com](https://www.thinkwithmark.com), and [TIME named it one of the Best Inventions of 2026](https://x.com/thinkwithmark/status/2110796538045931919).",
        ],
        visual: { kind: "video", src: "/videos/mark/phone.mp4", poster: "/images/mark/posters/phone.jpg", aspect: "420 / 760", caption: "The app as it shipped: home, the library, a note, and the three share cards." },
        visualSide: true,
      },
      {
        type: "stats",
        items: [
          { value: "$1M+", label: "raised" },
          { value: "TIME Best Inventions", label: "2026", href: "https://x.com/thinkwithmark/status/2110796538045931919" },
          { value: "8,000", label: "on the waitlist while I worked on it" },
        ],
      },
      {
        type: "essay",
        title: "A saved line only mattered to the person who saved it",
        rail: "Problem",
        body: [
          "Capture was already solved. Eason wanted reading to feel as shareable as Spotify Wrapped, which left two questions: how to get readers back to their lines, and how to get anyone else to care about them.",
        ],
        visual: { kind: "image", media: { src: "/images/mark/reference-board.webp", alt: "The reference board: photos of underlined pages and book dedications saved to camera rolls, library cards, and shelves" }, caption: "How people kept lines before Mark: a camera roll of underlined pages." },
      },
      {
        type: "essay",
        title: "Nobody posts something that looks like a screenshot",
        rail: "Share cards",
        body: [
          "A quote means little to someone who hasn't read the book. I started on paper: stats to scroll through, a library card with a tassel, a quote card you could edit before posting. The first passes put the quote on plain paper, then on the book's cover, and every time the cards got quieter they got more forgettable.",
          "Decision: Bold and Wrapped-style, in three styles for the ways you'd write a thought down: a letter to someone, a postcard, a sticky note.",
          "What I learned: Restraint isn't always good taste. A card has to be worth being seen with, so personality beat polish.",
        ],
        visual: { kind: "image", media: { src: "/images/mark/share-sketches.png", alt: "Hand-drawn share explorations: stat cards to scroll through, a library card with a tassel, a share quote with tap to edit" }, caption: "The share sketches: stats to pick from, a library card, and the quote card that became the three styles." },
        visualAfter: 0,
        extraVisual: {
          kind: "gallery",
          groups: [
            { label: "", muted: true, media: [{ src: "/images/mark/share-second.png", alt: "An earlier share card: the quote over the book's cover, in orange" }] },
            {
              label: "",
              media: [
                { src: "/images/mark/share-envelope.jpg", alt: "Share style one: the quote on paper, signed, in a yellow envelope" },
                { src: "/images/mark/share-postcard.jpg", alt: "Share style two: a postcard, the quote on the back with a stamp and postmark" },
                { src: "/images/mark/share-sticky.jpg", alt: "Share style three: a yellow sticky note, the quote circled in blue" },
              ],
            },
          ],
          caption: "The quote over the cover, then the three that shipped: a letter, a postcard, a sticky note.",
        },
      },
      {
        type: "essay",
        title: "Any line, findable by book, category or note, and ready to post",
        rail: "Shipped",
        items: [
          { num: "01", title: "Library", body: "Every line, findable by book, category or note." },
          { num: "02", title: "Note detail", body: "The line next to what you thought about it." },
          { num: "03", title: "Share", body: "Pick a style and post." },
        ],
        visual: { kind: "video", src: "/videos/mark/swipe.mp4", poster: "/images/mark/posters/swipe.jpg", aspect: "1128 / 700", caption: "From the library to a finished share card: the letter, the postcard, the sticky note." },
        visualFirst: true,
      },
      {
        type: "also",
        intro: "I also carried the brand into everything physical.",
        items: [
          {
            name: "Packaging",
            line: "Twenty rough concepts down to three, with yellow chosen last because it carried so much of the identity.",
            media: { src: "/images/mark/packaging-unitbox-1.jpg", alt: "Mark packaging, the last round: six sleeves with yellow on" },
          },
          {
            name: "Merch",
            line: "Stickers, shirts and totes built on the make your mark lines from the cards.",
            media: { src: "/images/mark/merch-stickers.jpg", alt: "Mark sticker sheet: the lockup, the blocks, and the make your mark lines" },
          },
          {
            name: "Pitch deck",
            line: "I turned Mark's idea into the three-minute deck for the LAUNCH summit.",
            media: { src: "/videos/mark-pitch.mp4", alt: "Mark pitch deck, as presented at LAUNCH", video: true, poster: "/images/mark/pitch-poster.jpg" },
          },
        ],
      },
      {
        type: "essay",
        title: "Next time, real readers sooner",
        rail: "Looking back",
        body: ["Most of my assumptions came from my own reading, and I'm not the only user of this product. Putting the screens in front of readers early would have let me iterate faster and land sooner."],
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
    point: "Showing teams what they could save was easy; getting them to act meant proving their agents wouldn't get worse.",
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
    /* a step lighter than the dashboard's near-black (Margaret, 2026-11-02: "lighten the Traeco card bg a little bit") */
    cardBg: "#1E1F23",
    cardFade: "linear-gradient(to bottom, rgba(24,25,29,0), rgba(24,25,29,0.03) 37.5%, #18191D 77.9%)",
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
       recorded product footage (scripts/capture/capture.ts) and three coded
       animations (components/works/motion). */
    blocks: [
      /* Cut to one highlight, recommendations that show quality holds
         (feedback, 2026-11-04). The two-lines setup animation, the early
         dashboards gallery and "Building it myself" came out; in git before
         this commit. */
      {
        type: "essay",
        title: "Teams could see what their agents cost. Nothing told them what to change.",
        rail: "Setup",
        body: [
          "Traeco shows teams what their AI agents cost and recommends how to spend less without the agents getting worse. I was cofounder and CPO with Mehek Mandal, Kyna Rochlani and Sania Gupta, and as the only designer I designed and built the product, the design system and the website, and shipped all of it to production.",
          "We found the idea when our own agents started costing more every week. Fifty-plus calls across eleven industries narrowed to teams running agents, who all said the same thing: not urgent yet, but it will be. It isn't only startups; Uber [exhausted its entire 2026 AI coding budget by April](https://finance.yahoo.com/markets/stocks/articles/uber-stock-drops-reportedly-caps-190100595.html).",
        ],
        visual: { kind: "video", src: "/videos/traeco/hero.mp4", poster: "/images/traeco/posters/hero.jpg", aspect: "1440 / 900", caption: "The dashboard home: savings available, then the top recommendations." },
        visualAfter: 0,
        extraVisual: { kind: "animation", name: "research-funnel", caption: "Fifty-plus calls across eleven industries, narrowing to agentic AI." },
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
        title: "Nobody acts on a recommendation they don't trust",
        rail: "Recommendations",
        body: [
          "Recommendations set us apart, and they made people nervous: if a cheaper setup made an agent worse, that was on us. So we tracked quality on every agent and tested each change on a slice of live traffic before it rolled out.",
          "Decision: Each recommendation shows cost, quality and confidence side by side, and a team can try it on part of the traffic before switching fully. Quality next to cost is what took the hesitation out of our first users and partners.",
          "What I learned: A recommendation is only as useful as people's trust in it.",
        ],
        visual: { kind: "video", src: "/videos/traeco/recommendations.mp4", poster: "/images/traeco/posters/recommendations.jpg", caption: "Open a recommendation to see what it saves, what it does to quality and how sure the judge is, then try it on part of the traffic." },
      },
      {
        type: "essay",
        title: "The home screen only shows what people would pay for",
        rail: "Home",
        body: [
          "I sorted everything from the calls into two lists, what makes the product usable and what makes it worth paying for, and the second list is the home screen: savings available, the top recommendations, where the spend went. Everything else is one click deeper, and setup is two lines of code.",
          "What I learned: The list of what people would pay for is always shorter, and it makes the better product.",
        ],
        visual: { kind: "animation", name: "before-after", caption: "Drag to compare my first iteration with the most recent one." },
      },
      {
        type: "essay",
        title: "A dashboard that pays for itself",
        rail: "Shipped",
        items: [
          { num: "01", title: "Home", body: "Savings, top recommendations and spend." },
          { num: "02", title: "Recommendations", body: "Cost, quality and confidence, with the option to test before committing." },
          { num: "03", title: "Agent detail", body: "Six weeks of quality history for each agent." },
          { num: "04", title: "Quality budgets", body: "Limits a team sets once on how far quality may slip, and the product holds every change to them. Set through the API today; the settings screen is next." },
        ],
        visual: { kind: "video", src: "/videos/traeco/drilldown.mp4", poster: "/images/traeco/posters/drilldown.jpg", caption: "Drilling from a recommendation into one agent's six-week quality history." },
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
        title: "I wish we had found this idea sooner",
        rail: "Looking back",
        body: [
          "Traeco was the first product I built from scratch and shipped, and my first time designing in code with Claude Code; once I got comfortable I was shipping ten times as much. I enjoyed the earlier explorations and the industries they took us through, but getting here sooner would have let me sit with the product and flesh it out properly.",
        ],
      },
    ],
  },

  /* ---- Atlix - copy from Margaret's "Case Studies" doc (2026-11-02):
     setup, the timing problem, two decisions with what she learned, what
     shipped, around it, looking back. Media: the prior dashboard and hero
     exports, the pitch recording, and the product demo from the
     atlix-landing repo (May 2026, Jeff Yang's PRD, public/atlixdemo.mp4),
     on the home card and under What shipped. Team names stay hers to
     supply. ---- */
  {
    slug: "atlix",
    title: "Atlix",
    signal: "Finalist, GSSC",
    lede: "A dashboard that shows what young Californians are saying about politics online, in real time, for advocacy groups and policy researchers.",
    point: "Researchers already had more information than they could read, so most of the design work was deciding what to leave out.",
    blurb: "Brand and interface for a narrative intelligence platform",
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/atlix-poster.png", alt: "Atlix cover" },
    /* the study opens on the demo's own frame, the dashboard in its glow, rather than the card's video layer cropped to the hero (Margaret, 2026-11-02: "kinda ugly") */
    hero: { src: "/images/atlix/posters/demo.jpg", alt: "The Atlix dashboard: what young Californians are talking about, as a grid of narrative cards" },
    credits: [
      { label: "Role", value: "Cofounder and design lead" },
      { label: "Timeline", value: "2026" },
      { label: "Team", value: "David Han, Vishnu Kadaba, Kirti Subramanian, Eric Ye" },
      { label: "Disciplines", value: "Product Design, Design System, Brand Identity, Pitch Deck" },
    ],
    next: "prosaic-intelligence",
    category: "AI B2B SaaS",
    year: "2026",
    role: "Co-founder",
    featured: true,
    /* Figma "atlix card" 139:574: navy gradient surface, demo video
       full-bleed across the top (161:749, 972x561 at y=-4), dark fade,
       white/50 description. The video is the repo's product demo at 972
       wide, 30fps, 0.8MB (2026-11-02); the poster is its first frame. */
    wordmark: "/images/wordmarks/atlix.svg", // Figma 161:747, 154.68/972 of card width
    wordmarkWidth: "15.91%",
    cardBg: "linear-gradient(to bottom, #000615 34.84%, #00245c 131.76%)",
    cardFade: "linear-gradient(to bottom, rgba(19,39,72,0), #041022 77.889%)",
    cardText: "light",
    coverArt: [
      {
        src: "/videos/atlix/card.mp4",
        video: true,
        poster: "/images/covers/atlix-poster.png",
        left: "0%",
        top: "-0.59%",
        width: "100%",
        height: "82.74%",
      },
    ],
    blocks: [
      /* Cut to one highlight, the card that answers four questions (feedback,
         2026-11-04). The separate "summaries first" section folded into it;
         in git before this commit. */
      {
        type: "essay",
        title: "By the time a report lands, the conversation has moved on",
        rail: "Setup",
        body: [
          "Atlix shows what young Californians are saying about politics online, in real time, for advocacy groups and policy researchers. I researched how policy teams work, then designed the dashboard, brand and pitch deck, as cofounder and design lead in 2026 with David Han, Vishnu Kadaba, Kirti Subramanian and Eric Ye.",
          "Local politicians told us the hard part is pulling data from everywhere into something they can act on, and that by the time a poll or report comes out, young people's conversation has moved on. We came out of the final in Seoul as finalists, with design partners in Taiwan and the Government of Telangana.",
        ],
        visual: { kind: "animation", name: "report-vs-live", caption: "A report lands months after its fieldwork. The card keeps moving." },
      },
      {
        type: "stats",
        items: [
          { value: "Finalist", label: "Global Student Startup Competition, Seoul" },
          { value: "100+ teams", label: "from around the world, Harvard, Stanford and Cornell among them" },
          { value: "First", label: "USC All Star Team at the competition" },
        ],
      },
      {
        type: "essay",
        title: "Each card answers four questions, and shows its source",
        rail: "Cards",
        body: [
          "Before opening Figma I spent weeks reading the reports policy teams already use and talking to researchers. They didn't want another data tool to dig through; they wanted summaries they could trust. My first version still had filters everywhere and charts on charts, and researchers couldn't tell what it was saying in the first few seconds.",
          "Decision: Every card states one narrative in plain words and answers four things only: the topic, where it's happening, how fast it's growing and who's talking, with its sources one click away.",
          "What I learned: Cutting felt like losing something, but every field I removed made the grid look more sure of itself.",
        ],
        visual: { kind: "image", media: { src: "/images/atlix/card-close-framed.png", alt: "One Atlix card, set on a grey from the palette: the narrative, its sentiment split, who is talking, and the sources it came from" }, caption: "One card: the narrative in plain words, its sentiment, who's talking, and the sources one click away." },
        visualAfter: 0,
        extraVisual: {
          kind: "gallery",
          groups: [
            { label: "", muted: true, media: [{ src: "/images/atlix/dashboard-busy.png", alt: "The busy first version: filters down the left, a row of six numbers, three charts, and cards crowded with tags, sparklines and meters" }] },
            { label: "", media: [{ src: "/images/atlix/dashboard.png", alt: "The final grid: filters for region and issue, a sort row, and cards that each commit to one narrative" }] },
          ],
          caption: "The first version, and the grid that shipped.",
        },
      },
      {
        type: "essay",
        title: "A feed you can filter, sort and check",
        rail: "Shipped",
        items: [
          { num: "01", title: "Filters", body: "Region and issue." },
          { num: "02", title: "Sorting", body: "Most pressing, volume, or fastest growing." },
          { num: "03", title: "Cards", body: "One narrative each, with its source." },
        ],
        visual: { kind: "video", src: "/videos/atlix/demo.mp4", poster: "/images/atlix/posters/demo.jpg", aspect: "1440 / 830", caption: "The demo: the feed, filtering by region and issue, and a narrative opened to its sources." },
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
            line: "Ink, card and line, one amber, Inter with a mono for the data.",
            media: { src: "/images/atlix/brand-sheet.png", alt: "The Atlix brand sheet: the wordmark, six swatches, Inter and a mono, the pills and source tags" },
          },
        ],
      },
      {
        type: "essay",
        title: "We went after the big names first",
        rail: "Looking back",
        body: ["Our design partners in Taiwan and Telangana were big names, but we would have made far more of an impact working with as many small politicians as we could and iterating on the product with them before going for the big ones."],
      },
    ],
  },

  /* ---- Prosaic Intelligence - copy from Margaret's "Case Studies" doc
     (2026-11-02), over the preliminary study written the same day from the
     project's own record (README, NEXT, HANDOFF, docs/design-system, 92
     commits from 19 to 20 September 2026) and the "Mar <> Anantika" Figma
     file. The type sheet is that file's "Font choice 1" frame. As of
     2026-11-02 the founder, Anantika Mannby, has cleared the product
     numbers for use, so the site's charts may be shown, and the live site
     (prosaicintelligence.ai, which differs from Margaret's build) may be
     linked. The footage and stills come from her build running locally
     (scripts/capture/prosaic.config.json). Her [MAR] and [CHECK] slots
     render highlighted. Restructured 2026-11-02 to the doc's new copy: the
     point, the social-impact problem, "Every page answers the next question"
     (risk pages, company pages, the methodology) in place of What shipped,
     Why it matters, Looking back. Sits after Atlix in the index and on the
     home column, where Impeccable Chicken was. ---- */
  {
    slug: "prosaic-intelligence",
    title: "Prosaic Intelligence",
    signal: "Raised in 24 hours", // Margaret, 2026-11-02
    lede: "A public index of how safely sixteen popular AI products behave, so anyone can see which one is safest for what they use it for.",
    point: "There's no single safest AI, only the one that's safest for what you care about, so every page helps you ask your own question before it gives you an answer.",
    blurb: "A public index of how safely sixteen popular AI products behave, so anyone can see which one is safest for what they use it for.", // the one-sentence summary, tightened (2026-11-02)
    /* the card is the site's own paper (--color-paper #F7F4EF), with the
       index header full-bleed (the beads on their wires, AI SAFETY INDEX,
       WHICH AI IS SAFEST FOR and its pills) cropped to the card's shape from
       images/prosaic/index-header.jpg, and the fade into the text zone in
       the same paper rather than white (Margaret, 2026-11-02: "get rid of
       that white gradient", "more of the website itself"). The placeholder
       scores at the foot of that screenshot sit under the full paper. */
    cover: { src: "/images/covers/prosaic-index.jpg", alt: "Prosaic Intelligence: the AI Safety Index header, beads on wires over paper" },
    /* the study opens on the chart card whole over the bead field, at the hero's own shape (scripts/capture/prosaic/hero.html, 2026-11-02) */
    hero: { src: "/images/prosaic/hero.png", alt: "Prosaic Intelligence: the general-use chart over the bead field" },
    cardBg: "#F7F4EF",
    cardFade: "linear-gradient(to bottom, rgba(247,244,239,0) 52%, #F7F4EF 86%)",
    /* the general-use chart card straight on, over the bead field alone
       (the hero with its text hidden, at the card's shape), both captured
       from her build (scripts/capture/prosaic.config.json). Margaret,
       2026-11-02: the leaning two-card version was "TOO dynamic"; "show the
       graph straight on for now and have the beads in the background". */
    coverArt: [
      { src: "/images/prosaic/beads.png", left: "0%", top: "0%", width: "100%", height: "100%" },
      { src: "/images/prosaic/chart-card.png", left: "6%", top: "8.5%", width: "88%", height: "68.9%" },
    ],
    credits: [
      { label: "Timeline", value: "September 2026, three days" },
      { label: "Role", value: "Designer and builder" },
      { label: "Team", value: "Anantika Mannby, Harsh Patel, Keegan Wang" },
      { label: "Scope", value: "Brand, web, data visualization, motion" },
    ],
    next: "mark", // wraps: Impeccable Chicken after it is parked
    category: "AI Safety",
    year: "2026",
    role: "Designer",
    featured: true, // on the home column in Impeccable Chicken's place (Margaret, 2026-11-02)
    comingSoon: false, // unparked 2026-11-02 so Margaret can read the draft on the site; the site itself stays unlinked
    accent: "#2f6fbf", // the index's signal blue, the one pressable colour on the site
    blocks: [
      /* Cut to one highlight, the use case before the ranking (feedback,
         2026-11-04). The build checks, the three page-type sections, Why
         it matters and their visuals folded into one What shipped list;
         in git before this commit. */
      {
        type: "essay",
        title: "There is no single safest AI",
        rail: "Setup",
        body: [
          "Prosaic Intelligence is a public index that scores how safely popular AI products behave on the risks everyday users face. I designed and built the site, including the brand, charts, motion and every page type, in three days with Claude Code, in September 2026, with Anantika Mannby, Harsh Patel and Keegan Wang.",
          "[About two billion people use AI](https://menlovc.com/perspective/2026-the-state-of-consumer-ai/) for homework, health, money and relationships, and OpenAI has said [around 1.2 million people a week](https://decrypt.co/346513/openai-reveals-1-million-chatgpt-users-discuss-suicide-weekly) show signs of suicidal intent in ChatGPT conversations. Researchers test for these risks, but the results sit in papers most people will never read. Anantika had collected them and wanted one independent place to compare them, by Sunday.",
        ],
        visual: { kind: "video", src: "/videos/prosaic/home.mp4", poster: "/images/prosaic/posters/home.jpg", aspect: "1128 / 700", caption: "The index, top to bottom: the beads lean toward the pointer, the bars answer it, the seven risk charts ripple, down to the foot of the page." },
        visualAfter: 0,
      },
      {
        type: "stats",
        items: [
          { value: "3 days", label: "from brief to a deployed site" },
          { value: "23 pages", label: "shipped with a full methodology" },
          { value: "prosaicintelligence.ai", label: "live", href: "https://prosaicintelligence.ai" },
        ],
      },
      {
        type: "essay",
        title: "Finish the sentence, and the ranking reorders around you",
        rail: "Use case",
        body: [
          "A single safest-AI ranking is misleading, because a model can score well overall and still fail badly in one area.",
          "Decision: The page opens with a sentence to finish, Which AI is safest for, with options like long conversations or someone having a hard time, and the sixteen bars re-rank around your answer.",
          "What I learned: A ranking without a use case is a number without meaning.",
        ],
        visual: { kind: "video", src: "/videos/prosaic/use-case.mp4", poster: "/images/prosaic/posters/use-case.jpg", aspect: "1128 / 700", caption: "Hover a bar for its readout, then finish the sentence and the sixteen re-rank: someone having a hard time, looking things up, everyday advice." },
      },
      {
        type: "essay",
        title: "An abacus, not a dashboard",
        rail: "Abacus",
        body: [
          "Safety data about real companies has to feel precise, and the founder wanted something people would talk about. So the design is built around an abacus: beads carry the navigation and move with your cursor or the tilt of your phone, and each bar shows how far a product is from a perfect score, not just its rank. Seeing the movement come true on the first test was the best part of the three days.",
          "What I learned: A tech product can still feel human, as long as the playful parts never get in the way of the data.",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/chart-card.png", alt: "The general-use chart: sixteen bars, the headroom to 100 in each one's own tint, and the index average" }, caption: "The index chart: sixteen bars, the headroom to 100 in each one's own tint, and one line for the average." },
        extraVisual: { kind: "image", media: { src: "/images/prosaic/risks-grid.png", alt: "The seven ways a model can fail you: a card per risk category, each with its own small chart of the top models" }, caption: "The seven ways a model can fail you, each with its own chart and a page behind it." },
      },
      {
        type: "essay",
        title: "Every page answers the next question",
        rail: "Pages",
        body: [
          "Readers arrive with one question and leave with three: which AI is safest, why, and what about the one I use. Each page type answers the next one in that chain, and the build fails if any number or any colour's contrast is wrong, so nothing ships by mistake.",
        ],
        items: [
          { num: "01", title: "Risk pages", body: "Seven risks, each from its score to the evidence: the chart, the benchmarks and their weights, real conversations, and the limits stated plainly." },
          { num: "02", title: "Company pages", body: "Is the AI I use safe? One bar per risk for each of a maker's models, so the weak category stands out." },
          { num: "03", title: "Methodology", body: "Where the data comes from, how scores are weighted, what isn't measured, and a changelog so nothing moves quietly." },
        ],
        visual: { kind: "video", src: "/videos/prosaic/risk-page.mp4", poster: "/images/prosaic/posters/risk-page.jpg", aspect: "1128 / 700", caption: "One risk page, top to bottom: the chart, what we found, the benchmarks and their weights, the sources, and the limits." },
      },
      {
        type: "also",
        items: [
          {
            name: "Type and colour",
            line: "Newsreader, Switzer and Geist Mono; paper, charcoal and one signal blue, with sixteen model colours each checked for contrast.",
            media: { src: "/images/prosaic/type-colour.png", alt: "The type and colour sheet: Newsreader, Switzer and Geist Mono over the page colours and the sixteen model colours" },
          },
          {
            name: "prosaicintelligence.ai",
            href: "https://prosaicintelligence.ai",
            line: "The site as it launched. The team took it on from the handoff, so what is live today differs from the build shown here.",
            media: { src: "/images/prosaic/home.jpg", alt: "Prosaic Intelligence home: the serif lockup on a dark card over the dot-screen artwork" },
          },
          {
            name: "Handoff",
            line: "A design system, a decisions log and an ownership file, so the team could launch without me.",
            media: { src: "/images/prosaic/handoff.png", alt: "The handoff: the design system page, where the work stands, and the accounts and deploy checklist" },
          },
        ],
      },
      {
        type: "essay",
        title: "Three days, real consequences",
        rail: "Looking back",
        body: [
          "I narrowed down early and went from lo-fi to hi-fi fast; with more time I would have explored more iterations, and I wish I could have stayed with the team longer. I'm proud of the result.",
        ],
      },
    ],
  },

  /* ---- Impeccable Chicken - thin until content exists; index only ---- */
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
    featured: false, // off the home column: Prosaic Intelligence took the slot (Margaret, 2026-11-02)
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
    next: "mark", // Mountain Dew removed 2026-11-02
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
        media: [{ src: "/images/graphics-7.png", alt: "" }],
      },
    ],
  },
  {
    slug: "smallworks",
    title: "UI/UX", // was "Small Works"; the Play page names it in its welcome line (Margaret, 2026-11-03)
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
          { src: "/images/smallworks-3.png", alt: "" },
          { src: "/images/smallworks-hero.png", alt: "" }, // the Momento gallery site: UI/UX, not graphics (Margaret, 2026-11-03)
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
    /* an essay study carries its problem as the section railed "Problem" (2026-11-02) */
    if (!w.blocks.some((b) => b.type === "problem" || (b.type === "essay" && b.rail === "Problem"))) {
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
