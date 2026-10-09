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
  notes). The password gate is data-present but rendering is parked behind
  GATE_ENABLED in the block renderer; NdaGate + /api/unlock stay intact.
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
  | { type: "problem"; headline: string; evidence: string[]; body: string; media?: Media }
  | { type: "solution"; pieces: { name: string; caption: string; media: Media }[] }
  | { type: "artifactGrid"; media: Media[] }  // 2-6 images, no captions
  | { type: "wip"; email: string }
  | { type: "gate"; hint: string };           // requires `protected`; rendering parked

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
  protected?: boolean;     // gate blocks + /api/unlock passwords
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
  indexOnly?: boolean;     // non-link index row; parked study redirects home, no Coming soon label
};

const WIP_EMAIL = "luwena@usc.edu";

export const works: Work[] = [
  /* ---- Mark - canonical content: docs/content/mark.md ---- */
  {
    slug: "mark",
    title: "Mark",
    lede: "A reading companion that turns the act of underlining into something you'd want to share",
    blurb: "Packaging, UI/UX software, and brand for a reading companion",
    credits: [
      { label: "Role", value: "Designer, TroyLabs BUILD" },
      { label: "Timeline", value: "2025" },
      { label: "Team", value: "Founded by Eason Tang" },
      { label: "Disciplines", value: "UI/UX Design, Brand System, Merchandise, Pitch Deck" },
    ],
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/mark-device.png", alt: "Mark device" },
    next: "traeco",
    category: "AI Hardware",
    year: "2025",
    role: "Designer",
    featured: true,
    protected: true,
    accent: "#0b1215",                        // Mark's near-black (the lockup)
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
            media: { src: "/images/mark/app-share.png", alt: "Mark share screens" },
          },
          {
            name: "From page to library",
            caption: "Logging a highlight on the device without leaving the page, then sorting captures against books, categories, and notes written in the app. Organised by reading habit rather than by file.",
            media: { src: "/images/mark/app-notes.png", alt: "Mark notes library screens" },
          },
          {
            name: "Twenty, then three, then colour",
            caption: "Twenty rough packaging concepts narrowed to three, then iterated in depth before any colour went on. Yellow was load-bearing in the early identity, so it came last and on purpose rather than as a starting constraint.",
            media: { src: "/images/mark/packaging-sleeves-2.jpg", alt: "Mark packaging sleeves, second round" },
          },
          {
            name: "LAUNCH",
            caption: "The three-minute pitch presented at TroyLabs' end-of-semester LAUNCH summit.",
            /* Margaret's screen recording of the deck (2026-10-08), last 3s
               trimmed, re-encoded 1280 wide for the web; poster is frame 2s in */
            media: { src: "/videos/mark-pitch.mp4", alt: "Mark pitch deck, as presented at LAUNCH", video: true, poster: "/images/mark/pitch-poster.jpg" },
          },
        ],
      },
      {
        type: "artifactGrid",
        media: [
          { src: "/images/mark/merch-stickers.jpg", alt: "Mark sticker sheet" },
          { src: "/images/mark/merch-shirts.png", alt: "Mark shirt variants" },
          { src: "/images/mark/merch-tote.jpg", alt: "Mark tote bags" },
          { src: "/images/mark/packaging-sleeves-1.jpg", alt: "Mark packaging sleeves, first round" },
          { src: "/images/mark/packaging-unitbox-1.jpg", alt: "Mark unit box explorations, first round" },
          { src: "NEED", alt: "Make your mark wordplay" },
        ],
      },
      {
        type: "artifactGrid",
        media: [
          { src: "/images/mark/app-home.png", alt: "Mark app home screen" },
          { src: "/images/mark/app-notes-inside.png", alt: "Mark note detail screen" },
          { src: "/images/mark/app-share-funky.png", alt: "Mark share card variants" },
        ],
      },
      { type: "gate", hint: "The full study sits behind a password under NDA." },
    ],
  },

  /* ---- Traeco - full spine, canonical content: docs/content/traeco.md.
     Text values of exactly "NEED" and media src "NEED" render as gray
     placeholders; bracketed authoring guidance never ships. The evidence
     lines are verified factual claims and ship exactly as written. ---- */
  {
    slug: "traeco",
    title: "Traeco",
    lede: "Teams are spending more on AI agents than they can see.",
    blurb: "Brand, product, and web for an AI cost platform",
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/traeco-dashboard.png", alt: "Traeco dashboard" },
    /* the study opens on the brand hero (moved up from the context block) */
    hero: { src: "/images/traeco/hero.png", alt: "Traeco brand hero" },
    credits: [
      { label: "Role", value: "Co-founder & CPO" },
      { label: "Timeline", value: "2026" },
      { label: "Team", value: "Mehek Mandal, Kyna Rochlani, Sania Gupta" }, // roles confirmed by traeco.dev/about (2026-10-09)
      { label: "Disciplines", value: "Product, Brand System, UI/UX, Web, Pitch" },
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
    cardBg: "#303036",
    cardFade: "linear-gradient(to bottom, rgba(36,36,40,0), rgba(36,36,40,0.03) 37.5%, #242428 77.9%)",
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
    blocks: [
      {
        type: "context",
        // outcomes sentences appended 2026-08-01, verbatim from the old
        // live-site Traeco copy (main:lib/projects.ts) per Margaret's order
        body: "Traeco is observability and cost management for AI agents, founded with my co-founders through LavaLab, USC's largest incubator. I'm co-founder and CPO, and was the only designer: the brand, the product, the site, and the decks are all mine. Live at traeco.dev. We won Audience Choice at the closing summit. Shipped the dashboard, marketing site, and full design system to production. Conversion to action in usability tests went from 22% to 71%.",
        // prior live-site asset, surfaced per the v2 file rule (veto and it reverts to NEED)
      },
      {
        type: "problem",
        headline: "AI agents are getting expensive faster than anyone can see them.",
        evidence: [
          "Alphabet posted its first negative quarterly free cash flow since its 2004 IPO, $5.9B, on $44.9B of AI capex",
          "Uber exhausted its entire 2026 AI budget by April and now caps engineers at $1,500 a month per tool",
          "Across 50+ calls in 11 industries, the teams closest to it told us it wasn't urgent yet, and that they knew it would be",
        ],
        body: "We spent weeks looking for a problem before we found this one. Fifty plus calls across eleven industries: semiconductors and hardware, aerospace and defense, entertainment, AR/VR, product, architecture, branding, research, finance, data infrastructure. The last stretch of calls was entirely agentic AI, which is where we stopped.\n\nWhat those founders told us was more useful than agreement. Agent cost was not their most pressing problem yet. They could see it coming, and they were certain it would land on everyone. That changed the brief. Building for someone already in pain is easy, because they will tolerate friction when they are desperate. Building for someone who does not feel it yet means the product has to cost almost nothing to adopt, has to show value before there is a crisis, and has to make an invisible cost visible before anyone thinks to ask.",
        media: { src: "NEED", alt: "outreach tracker screenshot, industry column converging to agentic AI" },
      },
      {
        type: "solution",
        pieces: [
          {
            name: "The dashboard",
            caption: "I scoped the dashboard against user conversations rather than a feature list. Two questions ran in parallel: what has to be here for this to be usable, and what has to be here for someone to pay for it. Those produce different lists, and the second one is shorter. The timing insight above set the constraint: this had to earn attention from people who were not yet in pain.",
            // the 2026-10-08 revamp (Figma Traeco-Revamp 48:6630): the home screen leads
            media: { src: "/images/traeco/dashboard-home.png", alt: "Traeco dashboard: savings available, top recommendations, spend breakdown" },
          },
          {
            name: "The brand system",
            // the "one idea" line and the site piece below are DRAFTS read off
            // traeco.dev on 2026-10-09 (Margaret's order: build the study from the
            // live site); she edits in her pass. The brand sheet itself is still
            // hers to supply - the About page stands in for it meanwhile.
            caption: "Built from nothing as the only designer on the team: identity, system, and every application of it. The system runs on one rule: near-black everywhere and a single green, so the only colour on any screen is the thing that matters, whether that is a saving, a verdict, or the second line of a headline. The mark is four lobes off one stem, drawn to hold at favicon size and, on the site, to scale up until it fills a whole hero.",
            media: { src: "/images/traeco/site-about.jpg", alt: "traeco.dev About page: the display face, the one green, the mark in the nav" },
          },
          {
            name: "traeco.dev",
            caption: "The site carries the argument in the order a buyer meets it. The bill first: your AI agents are bleeding money. Then the gap the product fills: observability tells you what happened, nobody tells you what it should cost. Then the four steps from traces to savings, connect, visualize, optimize, monitor, and three pricing tiers. Integrates in two lines is the promise repeated on every screen.",
            media: { src: "/images/traeco/site-hero.jpg", alt: "traeco.dev hero: the mark scaled to full bleed behind the headline" },
          },
          {
            name: "Two decks, two jobs",
            caption: "Two decks for two jobs. One built to be presented live, with us speaking over it, sparse enough that the room watches us instead of reading the slide. One built to survive alone in an investor's inbox, carrying the whole argument without a presenter. Different density, different job.",
            /* Margaret's screen recording of the pitch deck (2026-10-08),
               re-encoded 1280 wide for the web; poster is frame 2s in */
            media: { src: "/videos/traeco-pitch.mp4", alt: "Traeco pitch deck", video: true, poster: "/images/traeco/pitch-poster.jpg" },
          },
        ],
      },
      {
        /* the rest of the revamp, the three screens that carry the product's
           argument (Margaret: "pick maybe the most important ones"): the
           recommendation queue, an agent's quality drift + verdict, and the
           quality budgets that gate every verdict. The agents list, team,
           member, and onboarding screens were left out on purpose. */
        type: "artifactGrid",
        media: [
          { src: "/images/traeco/recommendations.png", alt: "Recommendations: cost, quality, and confidence side by side, with accept / canary / reject / defer" },
          { src: "/images/traeco/agent-detail.png", alt: "Support Agent: six-week quality drift and the recommendation for this agent" },
          { src: "/images/traeco/quality-budgets.png", alt: "Settings: quality budgets and the budget.yaml they ship as" },
        ],
      },
      {
        type: "artifactGrid",
        media: [
          // prior live-site asset, surfaced per the v2 file rule: an earlier
          // round of the hero ("wasting tokens", before "bleeding money")
          { src: "/images/traeco/website.png", alt: "traeco.dev, an earlier round of the hero" },
          { src: "/images/traeco/site-pricing.jpg", alt: "traeco.dev pricing: Starter, Growth, Enterprise" },
          { src: "NEED", alt: "deck spreads" },
        ],
      },
      { type: "wip", email: WIP_EMAIL },
    ],
  },

  /* ---- Atlix - canonical content: docs/content/atlix.md. Built out
     2026-08-01 on Margaret's order from OLD live-site copy (main:lib/
     projects.ts) - compressions and deletions only, nothing invented.
     California framing deleted from the problem copy (the lede still
     carries it - her call). Competition name, Team, and the pitch-deck
     section stay NEED/absent (mp4 does not ship). Retired outcome line
     ("hundreds of teams from Stanford...") must not return. ---- */
  {
    slug: "atlix",
    title: "Atlix",
    lede: "Narrative intelligence: what young Californians are actually talking about, surfaced in real time",
    blurb: "Brand and interface for a narrative intelligence platform",
    /* poster stand-in until the real export lands */
    cover: { src: "/images/covers/atlix-poster.png", alt: "Atlix cover" },
    credits: [
      { label: "Role", value: "Co-founder, design lead" },
      { label: "Timeline", value: "2026" },
      { label: "Team", value: "NEED" },
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
        type: "context",
        // DRAFT from docs/content/atlix.md; replaces the old-site context,
        // whose outcome line the file's notes explicitly retire
        body: "Atlix came out of a global student startup competition based in Seoul, where we were the first team to represent USC. The brief was to empower the next generation through social media. We chose youth political engagement, in part because one of our co-founders came from a political science background, and spent the run-up validating the problem with local politicians. The final stretch was a sprint in Korea: the pitch deck, the product, and a set of design partners. We finished as finalists.",
        // prior live-site asset surfaced instead of a placeholder; veto reverts to NEED
        media: { src: "/images/atlix/hero.png", alt: "Atlix hero" },
      },
      {
        type: "problem",
        // old-site "Where the idea came from", California framing deleted
        headline: "Polling and survey data lag behind",
        evidence: [
          "Nobody wanted yet another data tool",
          "Summaries they could trust, with the source still one click away",
          "Cards first, summaries upfront, citations always visible",
        ],
        body: "By the time a report goes out, the conversation has already shifted. I wanted to build something that listened to what young people were actually saying in real time. The product had to be useful for advocacy groups, policy researchers, and anyone who needs to read demographic discourse without waiting for a quarterly report.",
      },
      {
        type: "solution",
        pieces: [
          {
            // old-site "Designing the dashboard", compressed
            name: "The dashboard",
            caption: "The first version was much busier: filters everywhere, charts on charts, every card trying to say too much at once. Feedback from the researchers cut it back to what actually matters in the first three seconds: what's the topic, where is it happening, how much is it growing, and who's talking about it. Left rail filters for region and issue, a tab row for sort order, and a card grid where each card commits to a single narrative.",
            media: { src: "/images/atlix/dashboard.png", alt: "Atlix dashboard" },
          },
          {
            // old-site "Early research and interviews", compressed
            name: "Research before screens",
            caption: "A few weeks reading the kinds of reports people in this space already work from, talking to researchers and advocacy folks, and mapping out what their day actually looks like. The biggest pattern: nobody wanted yet another data tool. They wanted summaries they could trust, with the source still one click away.",
            media: { src: "NEED", alt: "research notes or report excerpts" },
          },
          {
            // old-site "Brand", compressed
            name: "Brand",
            caption: "Most tools in the category look either academic and beige or aggressively tech. Atlix is a third option: dark navy with a single accent, type forward, and quiet. The wordmark is a clean sans-serif because the product itself should be the loudest thing in any deck or screenshot.",
            media: { src: "NEED", alt: "brand sheet or wordmark lockup" },
          },
          {
            // old-site "Outcome" heading + learnings; the competition-name
            // sentence removed whole (carries the retired line and the
            // unconfirmed name)
            name: "Outcome",
            caption: "The biggest thing I learned was that research before design isn't a checkbox. Every time I shortcut it and started designing first, I had to throw work away. The reverse was also true: every conversation I had before opening Figma made the actual design work go faster, because half the decisions were already made. I also learned a lot about restraint. Cutting a field off a card felt scary at first, but it ended up making the whole grid feel more confident than adding one ever would have.",
            media: { src: "NEED", alt: "competition or team photo" },
          },
        ],
      },
      { type: "wip", email: WIP_EMAIL },
    ],
  },

  /* ---- Impeccable Chicken - thin until content exists ---- */
  {
    slug: "impeccable-chicken",
    title: "Impeccable Chicken",
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
    protected: true,
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
    cardBg: "#c94512",
    // white fade like Glance and Mountain Dew for now (Margaret, 2026-10-09);
    // the Figma orange fade was: linear-gradient(to bottom, rgba(241,95,38,0), #f15f26 77.889%) with cardText "light"
    coverArt: [
      { src: "/images/covers/ic-photo.png", left: "6.48%", top: "0%", width: "93.52%", height: "100%" },
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
    cardBg: "#0f1116",
    coverArt: [
      { src: "/images/glance-hero.png", left: "-18.11%", top: "-24%", width: "136.22%", height: "124%" },
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
    cardBg: "#0a8a3a",
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
  /* ---- Prosaic Intelligence - drafted 2026-10-09 from three screenshots
     Margaret sent (the home page, the AI Safety Index header, the General
     use chart) and her README line; she edits in her pass. The site is
     NEVER linked from here (her instruction). Role / timeline / disciplines
     are inferred - confirm. ---- */
  {
    slug: "prosaic-intelligence",
    title: "Prosaic Intelligence",
    lede: "A public index of consumer AI safety evaluations",
    blurb: "Brand, site, and data design for a consumer AI safety index",
    cover: { src: "/images/covers/prosaic-site.jpg", alt: "Prosaic Intelligence home" },
    credits: [
      { label: "Role", value: "Design and build" },
      { label: "Timeline", value: "2026" },
      { label: "Disciplines", value: "Brand, Web, Data Visualization" },
    ],
    next: "mark", // AANC parked 2026-10-09 (Margaret fills it in later)
    category: "AI Safety",
    year: "2026",
    role: "Designer",
    comingSoon: true, // parked until the images land (Margaret, 2026-10-09); the study below is ready
    accent: "#2d6fd1", // the index's pill blue
    blocks: [
      {
        type: "context",
        body: "Prosaic Intelligence is a public index of consumer AI safety evaluations: sixteen consumer AI products, from ChatGPT and Gemini to Snap AI and Character AI, scored on how safely they behave, and published for the people who use them rather than the people who build them. The site is two things. A front door that says what it is for, building a safer future for consumers, and the index itself, with the methodology beside it.",
        media: { src: "/images/prosaic/home.jpg", alt: "Prosaic Intelligence home: the serif lockup on a dark card over the dot-screen artwork" },
      },
      {
        type: "problem",
        headline: "There is no single safest model, only the one that is safest for what you care about.",
        evidence: [
          "Sixteen consumer AI products scored on one index",
          "For general use, three of the sixteen cluster within five points of each other",
          "A composite is a weighted average, and a model can hold a respectable overall score while failing one category badly",
        ],
        body: "Safety rankings flatten. A single leaderboard number invites the wrong question, which model is safest, when the honest answer depends on what you are using it for: a long conversation, a hard night, a quick lookup. The index had to show that without turning into a spreadsheet, and it had to make the gap between a composite score and the risks underneath it impossible to miss.",
        media: { src: "/images/prosaic/index-header.jpg", alt: "AI Safety Index: which AI is safest for, with the use-case pills" },
      },
      {
        type: "solution",
        pieces: [
          {
            name: "Safest for what",
            caption: "The question comes first, as a sentence you finish: WHICH AI IS SAFEST FOR, then a row of use cases, general use, someone having a hard time, looking things up, everyday. Pick one and the index re-ranks around it. The pills and the dotted strands behind them are the brand's whole vocabulary: one blue, a serif for the headlines, a mono for the numbers.",
            media: { src: "/images/prosaic/index-header.jpg", alt: "The use-case pills under the AI Safety Index headline" },
          },
          {
            name: "Sixteen bars, one honest line",
            caption: "Each product is a bar in its own colour with its logo at the base, the score inside, and the headroom to 100 in a paler tint of the same colour. A dotted line marks the index average, so a glance separates the pack from the rest. Under the chart sits the footnote that matters: the composite tells you who leads for this use case, not where the one you are considering gives way.",
            media: { src: "/images/prosaic/general-use.jpg", alt: "General use: sixteen models as bars against the index average" },
          },
          {
            name: "A front door",
            caption: "The home page is a dark card over a dot-screen painting: the lockup, one line of purpose, and three pills, the index, the methodology, X. Everything the site has to say fits above the fold, and the artwork does the rest.",
            media: { src: "/images/prosaic/home.jpg", alt: "Prosaic Intelligence home page" },
          },
        ],
      },
      { type: "wip", email: WIP_EMAIL },
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
export const PROTECTED_SLUGS = works.filter((w) => w.protected).map((w) => w.slug);
export const getWork = (slug: string) => works.find((w) => w.slug === slug);

/* build-time spine checks - warnings, never failures (thin works are
   sanctioned; the warning is the honest "unfinished" marker) */
if (process.env.NODE_ENV !== "production" || process.env.npm_lifecycle_event === "build") {
  for (const w of works) {
    if (w.play) continue;
    if (!w.blocks.some((b) => b.type === "problem")) {
      console.warn(`[works] ${w.slug}: no problem block - case study reads as unfinished`);
    }
    if (w.blocks.length > 7) {
      console.warn(`[works] ${w.slug}: ${w.blocks.length} blocks exceeds the 7-block cap`);
    }
    if (w.featured && !w.blurb && w.lede.length > 72) {
      console.warn(`[works] ${w.slug}: no blurb and lede is ${w.lede.length} chars - will clamp on the home card`);
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
