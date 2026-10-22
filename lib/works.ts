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
  | { type: "wip"; email: string };

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
  /* ---- Mark - canonical content: docs/content/mark.md ---- */
  {
    slug: "mark",
    title: "Mark",
    signal: "Raised $3M+", // Margaret, 2026-10-20
    lede: "A reading companion that turns the act of underlining into something you'd want to share",
    blurb: "Packaging, UI/UX software, and brand for a reading companion",
    credits: [
      { label: "Role", value: "Designer, TroyLabs BUILD" },
      { label: "Timeline", value: "2025" },
      { label: "Team", value: "Founded by Eason Tang" },
      { label: "Disciplines", value: "UI/UX Design, Brand, Merchandise, Packaging, Pitch Deck" },
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
        type: "context",
        body: "Mark is a capture device and companion app built by Eason Tang through TroyLabs' BUILD program. Eason's thesis was that reading should be social, a Spotify Wrapped for what you read, rather than another place to file highlights. I joined as the designer for the semester: the app and its share cards were my focus, I contributed to the brand and built the merch, did the packaging for the final product, and made the deck for LAUNCH.",
        media: { src: "NEED", alt: "device or hero shot" },
      },
      /* brief + takeaways drafted 2026-10-20 from Margaret's own prose above
         (her order: objective, goals, what I did, lessons - after the Sam
         Cheng / Emmi Wu / Karen Lou studies). What she did, in her words
         (2026-10-21): share cards and the app were the focus, contributed to
         the brand, built the merch, made the deck for LAUNCH, packaging for
         the final product. Nothing beyond that list goes in this study. */
      {
        type: "brief",
        objective: "Make reading something you'd want to share, starting with the line you underline.",
        goals: [
          "Capture a line without pulling you out of the book",
          "Make the device, the app, and the share cards feel like one thing",
          "A brand and a box people actually want on their desk",
        ],
        did: [
          "Designed the app and its share cards",
          "Contributed to the brand and built the merch",
          "Packaging for the final product: twenty rough boxes down to one",
          "Made the deck for LAUNCH",
        ],
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
            caption: "Wrapped-style cards that turn a stretch of reading into something you'd post. They're deliberately a bit much. A share screen only works if someone wants to be seen posting it, so I traded restraint for personality. Three styles to pick from: a letter in a yellow envelope, a postcard with a stamp, and a sticky note with the line circled.",
            media: { src: "/images/mark/app-share.png", alt: "Mark share screens" },
            /* the three share styles, side by side (Margaret, 2026-10-21) */
            gallery: [
              { src: "/images/mark/share-envelope.jpg", alt: "Share style one: the quote on paper, signed, in a yellow envelope" },
              { src: "/images/mark/share-postcard.jpg", alt: "Share style two: a postcard, the quote on the back with a stamp and postmark" },
              { src: "/images/mark/share-sticky.jpg", alt: "Share style three: a yellow sticky note, the quote circled in blue" },
            ],
          },
          {
            name: "From page to library",
            caption: "Log a highlight on the device without leaving the page, then sort it in the app by book, by category, or by a note you wrote. It's organised the way people actually read, not the way files are stored.",
            media: { src: "/images/mark/app-notes.png", alt: "Mark notes library screens" },
          },
          {
            name: "Twenty rough ideas",
            /* Margaret, 2026-10-21: this board is the initial ideas; the ones we
               liked got a blue dot, the ones we really liked a pink star */
            caption: "The first board: twenty rough packaging concepts, pinned up and marked. A blue dot meant we liked it. A pink star meant we really did. Those are the ones that went to the next round.",
            media: { src: "/images/mark/packaging-sleeves-1.jpg", alt: "Mark packaging, the first board of twenty ideas, marked with blue dots and pink stars" },
          },
          {
            name: "Then three, then colour",
            caption: "Three went forward and got worked properly before any colour went on. Yellow carried so much of the early identity that I made it the last decision on purpose, not the first constraint.",
            // cropped to the board alone - the lone device render on the right is gone (Margaret, 2026-10-21)
            media: { src: "/images/mark/packaging-sleeves-2-board.jpg", alt: "Mark packaging sleeves, second round" },
          },
          {
            name: "The last round",
            /* Margaret, 2026-10-21: "final final round, closer to what we were looking for" */
            caption: "The last round, and the closest to what we were after. Yellow is finally on, as a glow that fades into cream rather than a flat fill, and the lockup settles small in a corner where it can stay out of the way.",
            media: { src: "/images/mark/packaging-unitbox-1.jpg", alt: "Mark packaging, the last round: six sleeves with yellow on" },
          },
          {
            name: "Merch",
            /* Margaret, 2026-10-21: the three merch sheets are stickers, shirts, totes */
            caption: "Stickers first: the lockup, the two black blocks, and the lines from the share cards, make your mark, on your words. Then the same marks on white shirts, small on the chest, and on canvas totes. Merch was where the brand got to be worn rather than read.",
            media: { src: "/images/mark/merch-stickers.jpg", alt: "Mark sticker sheet: the lockup, the blocks, and the make your mark lines" },
          },
          {
            name: "LAUNCH",
            caption: "The three-minute deck I made for TroyLabs' end-of-semester LAUNCH summit.",
            /* Margaret's screen recording of the deck (2026-10-08), last 3s
               trimmed, re-encoded 1280 wide for the web; poster is frame 2s in */
            media: { src: "/videos/mark-pitch.mp4", alt: "Mark pitch deck, as presented at LAUNCH", video: true, poster: "/images/mark/pitch-poster.jpg" },
          },
        ],
      },
      {
        type: "artifactGrid",
        media: [
          { src: "/images/mark/merch-shirts.png", alt: "Mark shirts: the lockup and the blocks on white tees" },
          { src: "/images/mark/merch-tote.jpg", alt: "Mark canvas totes" },
          { src: "NEED", alt: "Make your mark wordplay" },
        ],
      },
      {
        type: "artifactGrid",
        media: [
          { src: "/images/mark/app-home.png", alt: "Mark app home screen" },
          { src: "/images/mark/app-notes-inside.png", alt: "Mark note detail screen" },
          { src: "/images/mark/app-share-funky.png", alt: "Mark share screen, the envelope version: the quote on paper, signed, in a yellow envelope" },
        ],
      },
      {
        type: "lessons",
        items: [
          { title: "Taking it apart was the design", body: "The device, the app, and the share cards each answered a different question. Most of my job was making the three answers feel like one product instead of three." },
          { title: "Nobody posts something tasteful", body: "The share card had to be worth being seen with. Every time I pulled it back toward restraint it got more forgettable, so I stopped pulling." },
          { title: "Decide colour last", body: "Yellow was doing so much work in the early identity that choosing it first would have locked everything else in. Shapes, then structure, then colour." },
        ],
      },
    ],
  },

  /* ---- Traeco - full spine, canonical content: docs/content/traeco.md.
     Text values of exactly "NEED" and media src "NEED" render as gray
     placeholders; bracketed authoring guidance never ships. The evidence
     lines are verified factual claims and ship exactly as written. ---- */
  {
    slug: "traeco",
    title: "Traeco",
    signal: "Audience Choice winner", // LavaLab closing summit; a traction number would beat this
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
      /* brief + takeaways drafted 2026-10-20 from Margaret's prose below; she edits in her pass */
      {
        type: "brief",
        objective: "Show teams what their AI agents cost before the invoice does.",
        goals: [
          "Two lines to set up, no code changes",
          "Prove useful before anything is on fire",
          "Work out what makes it usable, then what makes it worth paying for",
        ],
        did: [
          "Scoped and designed the dashboard off 50+ customer calls",
          "Built the brand from nothing",
          "Designed and shipped traeco.dev",
          "Two decks: one to present, one to send",
        ],
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
            caption: "I scoped the dashboard against what people told us on calls, not a feature list. Two questions ran side by side: what has to be here for this to be usable, and what has to be here for someone to pay for it? Those give you different lists, and the second one is shorter. The timing insight set the constraint: this had to earn attention from people who weren't in pain yet.",
            // the 2026-10-08 revamp (Figma Traeco-Revamp 48:6630): the home screen leads
            media: { src: "/images/traeco/dashboard-home.png", alt: "Traeco dashboard: savings available, top recommendations, spend breakdown" },
          },
          {
            name: "The brand system",
            // the "one idea" line and the site piece below are DRAFTS read off
            // traeco.dev on 2026-10-09 (Margaret's order: build the study from the
            // live site); she edits in her pass. The brand sheet itself is still
            // hers to supply - the About page stands in for it meanwhile.
            caption: "I was the only designer, so the brand was mine from the first sketch: the identity, the system, every application of it. It runs on one rule. Near-black everywhere and a single green, so the only colour on a screen is the thing that matters, whether that's a saving, a verdict, or the second line of a headline. The mark is four lobes off one stem. It holds at favicon size, and on the site it scales up until it fills the hero.",
            media: { src: "/images/traeco/site-about.jpg", alt: "traeco.dev About page: the display face, the one green, the mark in the nav" },
          },
          {
            name: "traeco.dev",
            caption: "The site makes the argument in the order a buyer meets it. The bill first: your AI agents are bleeding money. Then the gap: observability tells you what happened, nobody tells you what it should cost. Then four steps from traces to savings, and three pricing tiers. \"Integrates in two lines\" is on every screen because it's the promise that matters most.",
            media: { src: "/images/traeco/site-hero.jpg", alt: "traeco.dev hero: the mark scaled to full bleed behind the headline" },
          },
          {
            name: "Two decks, two jobs",
            caption: "Two decks for two jobs. One to present live, with us talking over it, sparse enough that the room watches us instead of reading the slide. One that has to survive alone in an investor's inbox and carry the whole argument without a presenter. Different density, different job.",
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
      {
        type: "lessons",
        items: [
          { title: "Design for the person who isn't in pain yet", body: "Someone whose budget just blew up will put up with friction. The founders we talked to could see it coming but didn't feel it yet, so Traeco had to cost nothing to try and prove itself before anything went wrong." },
          { title: "The paying list is shorter than the usable list", body: "Every screen got the same two questions: does this have to be here for it to be usable, and does it have to be here for someone to pay? The second list is the product. The first is the floor." },
          { title: "A deck you talk over and a deck you send are different objects", body: "Same argument, different density. Trying to make one deck do both jobs is how you end up with slides nobody reads." },
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
    signal: "Finalist, GSSC",
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
      /* brief drafted 2026-10-20 from Margaret's prose; the former "Outcome"
         solution piece now lives as the takeaways */
      {
        type: "brief",
        objective: "Read what young Californians are actually saying, in real time, instead of waiting for a quarterly report.",
        goals: [
          "Summaries people could trust, with the source one click away",
          "Useful to advocacy groups and policy researchers on day one",
          "A brand that wasn't academic beige or aggressively tech",
        ],
        did: [
          "Weeks on reports, researchers, and advocacy people before opening Figma",
          "Designed the dashboard, then cut it back to what matters in the first three seconds",
          "The brand and the design system",
          "The deck for the Seoul final",
        ],
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
        ],
      },
      {
        // the old-site "Outcome" learnings, as takeaways (the competition-name
        // sentence stays out: retired line, unconfirmed name)
        type: "lessons",
        items: [
          { title: "Research first isn't a checkbox", body: "Every time I skipped it and started designing, I threw the work away. Every conversation I had before opening Figma made the design go faster, because half the decisions were already made." },
          { title: "Cutting felt scary and read as confidence", body: "Taking a field off a card felt like losing something. It made the whole grid look more sure of itself than adding one ever did." },
        ],
      },
      { type: "wip", email: WIP_EMAIL },
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
  /* ---- Prosaic Intelligence - drafted 2026-10-09 from three screenshots
     Margaret sent (the home page, the AI Safety Index header, the General
     use chart) and her README line; she edits in her pass. The site is
     NEVER linked from here (her instruction). Role / timeline / disciplines
     are inferred - confirm. ---- */
  {
    slug: "prosaic-intelligence",
    title: "Prosaic Intelligence",
    signal: "AI Safety Index",
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
export const getWork = (slug: string) => works.find((w) => w.slug === slug);

/* build-time spine checks - warnings, never failures (thin works are
   sanctioned; the warning is the honest "unfinished" marker) */
if (process.env.NODE_ENV !== "production" || process.env.npm_lifecycle_event === "build") {
  for (const w of works) {
    if (w.play) continue;
    if (!w.blocks.some((b) => b.type === "problem")) {
      console.warn(`[works] ${w.slug}: no problem block - case study reads as unfinished`);
    }
    if (w.blocks.length > 9) {
      console.warn(`[works] ${w.slug}: ${w.blocks.length} blocks exceeds the 9-block cap`);
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
