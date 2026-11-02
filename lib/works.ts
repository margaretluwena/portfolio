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
  /* ---- Mark - canonical content: docs/content/mark.md ----
     Restructured 2026-10-26 after Chris Pramana's read (Ramp): the study
     led with brand and packaging and had no narrative. Now: the product
     story (share cards, the library) is the solution; packaging, merch,
     and the LAUNCH deck sit in one "also" strip; the artifact grids are
     gone. The three-round packaging story (2026-10-21) is collapsed to its
     last round on purpose. ---- */
  {
    slug: "mark",
    title: "Mark",
    signal: "Raised $1M+", // Margaret, 2026-10-26 (was $3M+)
    lede: "A reading companion that turns the act of underlining into something you'd want to share",
    blurb: "The app and share cards for a reading companion", // product first (2026-10-26)
    credits: [
      { label: "Role", value: "Designer, TroyLabs BUILD" },
      { label: "Timeline", value: "2025" },
      { label: "Team", value: "Founded by Eason Tang" },
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
        type: "context",
        body: "Mark is a capture device and companion app built by Eason Tang through TroyLabs' BUILD program. Eason's thesis was that reading should be social, a Spotify Wrapped for what you read, rather than another place to file highlights.\n\nI joined as the designer for the semester. This study is about the product: the app and the share cards, and the one question they had to answer. The brand I contributed to, the merch, the packaging, and the LAUNCH deck are at the end.",
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
          "A share card someone would actually want to be seen posting",
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
        body: "Eason had the thesis before I joined; my problem was making it real. The device captures a line. The app has to make that line worth keeping, and the share card has to make it worth showing. Those are two different questions, and the answers had to add up to one product rather than two.",
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
            /* the app's home (today's session, the latest line) and a note's own page (2026-10-26) */
            gallery: [
              { src: "/images/mark/app-home.png", alt: "Mark app home: today's reading session and the latest highlight" },
              { src: "/images/mark/app-notes-inside.png", alt: "Mark note detail: the book, the line, and the tools under it" },
            ],
          },
        ],
      },
      {
        type: "also",
        intro: "Three more things I made for Mark around the product.",
        items: [
          {
            name: "Packaging",
            line: "Twenty rough boxes down to three, then one. Yellow went on last, as a glow that fades into cream, with the lockup small in a corner.",
            media: { src: "/images/mark/packaging-unitbox-1.jpg", alt: "Mark packaging, the last round: six sleeves with yellow on" },
          },
          {
            name: "Merch",
            line: "Stickers, white shirts, and canvas totes carrying the lockup, the two blocks, and the lines from the share cards.",
            media: { src: "/images/mark/merch-stickers.jpg", alt: "Mark sticker sheet: the lockup, the blocks, and the make your mark lines" },
          },
          {
            name: "The LAUNCH deck",
            line: "The three-minute deck I made for TroyLabs' end-of-semester LAUNCH summit.",
            media: { src: "/videos/mark-pitch.mp4", alt: "Mark pitch deck, as presented at LAUNCH", video: true, poster: "/images/mark/pitch-poster.jpg" },
          },
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
          /* both figures re-verified 2026-10-29: Alphabet Q2 2026 (SEC exhibit 99.1), Uber's cap as reported in April 2026 */
          "AI agents are getting expensive faster than anyone can see them. Alphabet posted its first negative quarterly free cash flow since its 2004 IPO, [$5.9B on $44.9B of AI capex](https://www.sec.gov/Archives/edgar/data/0001652044/000165204426000043/googexhibit991q12026.htm), and Uber [exhausted its entire 2026 AI coding budget by April](https://finance.yahoo.com/markets/stocks/articles/uber-stock-drops-reportedly-caps-190100595.html) and now caps engineers at $1,500 a month per tool.",
          "So we built a layer that tells teams what their agents should cost. Most tools in this space stop at observability, showing what an agent did and what it spent, while Traeco goes a step further and recommends what each agent should change to cost less without doing worse work. I was cofounder, CPO and the only designer across the product, brand, site and decks.",
        ],
        visual: { kind: "video", src: "/videos/traeco/hero.mp4", poster: "/images/traeco/posters/hero.jpg", aspect: "1440 / 900", caption: "The finished dashboard. Is something ever finished, though?" },
      },
      {
        type: "stats",
        items: [
          { value: "22% to 71%", label: "conversion to action in usability tests" },
          { value: "Audience Choice", label: "LavaLab closing summit" },
          { value: "traeco.dev", label: "shipped to production", href: "https://traeco.dev" },
        ],
      },
      {
        type: "essay",
        title: "We hit the problem ourselves first",
        rail: "Research",
        body: [
          "We started with 50+ calls across 11 industries, from semiconductors and aerospace to entertainment, finance and data infrastructure, looking for a problem worth building for. Partway through, we ran into one ourselves, as the agents we were using kept getting more expensive in a way that felt exponential and nothing we tried fixed it, so we narrowed the rest of our research to agentic AI to find out whether other teams were feeling the same thing, and they were.",
          "The calls also showed us the gap. Plenty of platforms already offered observability, but almost nobody we found was recommending what someone else's agents should actually do differently to cost less, and that became the part of Traeco only we were building.",
          "The finding that changed the brief: agent cost was not yet anyone's most pressing problem, but they could see it coming and were certain it would land on everyone.",
        ],
        visual: { kind: "animation", name: "research-funnel", caption: "The teams closest to it said we were early." },
        visualAfter: 0, // between "we ran into one ourselves" and "the calls also showed us the gap" (Margaret, 2026-10-29)
      },
      {
        type: "essay",
        title: "Problem 1: Our users did not feel the pain yet",
        rail: "Problems",
        body: [
          "Building for someone already in pain is easy, because they will tolerate friction when they are desperate. Our users were not desperate yet, so the product had to cost almost nothing to adopt, show value before there was a crisis, and make an invisible cost visible before anyone thought to ask.",
          "Decision: On the calls, setup and privacy were the two things that weighed on people before they would try anything, so I made adoption as simple as it could be: a two-line integration that only ever sees token counts, cost and latency, never prompts. And I put savings available at the very top of the dashboard, so the first screen shows money a team can get back rather than a bill. [CHECK]",
        ],
        visual: { kind: "animation", name: "integration-snippet", caption: "Add two lines around an existing client and the first dashboard view fills in from the traces." },
      },
      {
        type: "essay",
        title: "Problem 2: Usable and worth paying for are different lists",
        rail: null,
        body: [
          "I scoped the dashboard against the calls rather than a feature list, with two questions running in parallel: what has to be here for this to be usable, and what has to be here for someone to pay for it. The second list is shorter, and it decided what made the first screen.",
          "Explorations: [MAR: early dashboard versions, each with a one-line caption on what it tried to show]",
          "Decision: Instead of [MAR: the fuller first version], I kept the home screen to savings available, top recommendations and a spend breakdown, and pushed everything else one level deeper. [CHECK]",
        ],
        visual: { kind: "animation", name: "before-after", caption: "Drag to compare my first iteration with the most recent one!" },
      },
      {
        type: "essay",
        title: "Problem 3: Nobody wanted a cheaper agent that does worse work",
        rail: null,
        body: [
          "Recommendations were what made Traeco different, and they were also what made people nervous, because if we told a team to switch a model or trim a prompt and their agent got worse, we would be the ones responsible for the drop in quality. Trust in a recommendation had to come from showing that the work itself was not getting worse, not just that the bill was getting smaller.",
          "What we had to build to earn it: quality monitoring on every agent, evals that check whether output holds up after a change, and orchestration that lets a change roll out gradually, so cost and quality are always measured together. [MAR: one line on how your evals or orchestration actually work, kept simple]",
          "Decision: Instead of recommendations that only show savings, I put cost, quality and confidence side by side on every one, with accept, canary, reject and defer as the choices, so a team can try a change on a slice of traffic and watch quality before committing to it. [MAR: if you explored a savings-only version first, add one line on why it lost]",
          "[MAR: if putting quality next to cost is what moved conversion to action from 22% to 71%, say so here, since that would make this the turn of the whole study]",
        ],
        visual: { kind: "video", src: "/videos/traeco/recommendations.mp4", poster: "/images/traeco/posters/recommendations.jpg", caption: "Open a recommendation to see what it saves, what it does to quality and how sure the judge is, then accept it." },
      },
      {
        type: "essay",
        title: "What shipped",
        rail: "Shipped",
        items: [
          { num: "01", title: "Home", body: "Savings available, top recommendations and a spend breakdown." },
          { num: "02", title: "Recommendations", body: "Cost, quality and confidence side by side, with accept, canary, reject or defer." },
          { num: "03", title: "Agent detail", body: "Six weeks of quality drift and the recommendation for that agent." },
          /* what the repo actually has (checked 2026-10-29): per-agent budgets on the API, GET and POST /budgets/{agent_id}, with defaults of a 2% judge-preference drop, 2% faithfulness drop, zero structure drop and 200ms of p95 latency, alert-only on breach. No settings screen and no budget.yaml yet. */
          { num: "04", title: "Quality budgets", body: "Per-agent limits the API holds every verdict to: how far judge preference, faithfulness, structure and latency may slip before a change is held. Set through the API today; the settings screen is next." },
        ],
        visual: { kind: "video", src: "/videos/traeco/drilldown.mp4", poster: "/images/traeco/posters/drilldown.jpg", caption: "Follow a recommendation into its agent to see which function is spending the money and why." },
      },
      {
        type: "essay",
        title: "Designing in code",
        rail: "In code",
        parts: [
          { title: "The first product I built from scratch and shipped", body: "I have designed in Figma for years, but Traeco was the first time I built something myself and put it in production, and the first time I used Claude Code. I shipped the dashboard, the marketing site and the full design system, and building them taught me how different a shipped product is from a mockup, because I could see quickly what was actually feasible and what only looked good on a canvas. [MAR: one concrete example, such as a screen you redesigned once you saw real data in it]" },
          { title: "Designing a system that scales", body: "Once real agents and real data were flowing through it, every component had to hold up for one agent or hundreds, so the design system stopped being a style guide and became the thing that kept the product consistent as it grew. [MAR: one example, such as a table or chart component that had to work at very different sizes, or quality budgets shipping as a budget.yaml file]" },
        ],
      },
      {
        type: "also",
        intro: "Three more things I made for Traeco around the product.",
        items: [
          {
            name: "Brand system",
            line: "One rule runs it, near-black everywhere and a single green, so the only colour on any screen is the thing that matters, and the mark is four lobes off one stem drawn to hold at favicon size and scale up to fill a hero.",
            /* a sheet of the system itself, rendered from the dashboard's tokens (2026-10-29) */
            media: { src: "/images/traeco/brand-system.png", alt: "The Traeco system: the mark from favicon to hero size, the single green on near-black, the surface steps and the type scale" },
          },
          {
            name: "traeco.dev",
            href: "https://traeco.dev",
            line: "The site carries the argument in the order a buyer meets it: the bill, then the gap, then the four steps from traces to savings, then pricing.",
            media: { src: "/images/traeco/site-hero.jpg", alt: "traeco.dev hero: the mark scaled to full bleed behind the headline" },
          },
          {
            name: "Pitches",
            line: "One sparse enough to present live, one dense enough to survive alone in an investor's inbox.",
            media: { src: "/videos/traeco-pitch.mp4", alt: "Traeco pitch deck", video: true, poster: "/images/traeco/pitch-poster.jpg" },
          },
        ],
      },
      {
        type: "lessons",
        items: [
          { title: "A recommendation is only as good as the trust behind it", body: "Telling someone how to save money was the easy part, and showing them their agent would still do the job was what made them willing to act." },
          { title: "Shipping changes what you design", body: "Building Traeco myself showed me what was feasible and what would scale in a way Figma never had, and I design differently because of it." },
        ],
      },
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
  /* ---- Prosaic Intelligence - preliminary study, 2026-11-02, written
     from the project's own record (README, NEXT, HANDOFF, docs/design-system,
     92 commits from 19 to 20 September 2026) and the "Mar <> Anantika" Figma
     file (brief, four moodboards, type and colour explorations, hero draft).
     Margaret's [MAR] and [CHECK] slots stay highlighted until she fills them.
     The site is NEVER linked from here (her instruction); the index's scores
     are generated placeholders, so no new screenshots of named products'
     numbers are added until real data lands. Still parked (comingSoon). ---- */
  {
    slug: "prosaic-intelligence",
    title: "Prosaic Intelligence",
    signal: "Built in three days",
    lede: "There is no single safest AI, only the one that is safest for what you care about.",
    blurb: "A public index of consumer AI safety, designed and built in a weekend",
    cover: { src: "/images/covers/prosaic-site.jpg", alt: "Prosaic Intelligence home" },
    credits: [
      { label: "Timeline", value: "September 2026, three days" },
      { label: "Role", value: "Design and build" },
      { label: "Team", value: "[CHECK: the founder's name and role, and anyone else on the index]" },
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
          "Prosaic Intelligence is a public index of consumer AI safety: sixteen products people actually use, from ChatGPT and Gemini to Snap AI and Character AI, scored on how they behave when it matters, whether they catch someone in crisis, whether they agree with a claim they should question, whether the protections still hold forty messages in. It does not run its own evaluations. It collects published behavioural results, puts them on one 0 to 100 scale, and groups them into seven risk categories, so studies that were never designed to sit beside each other can.",
          "The brief arrived on a Friday: a founder with the data, media conversations already underway, and a site needed by Sunday that was both an epic design and clear in what it said. [CHECK: this is how the Figma brief reads; confirm the day and the media detail before publishing] I designed and built the whole thing, brand, site, charts and motion, in those three days, and handed it to the team on the Sunday night with the documentation to carry it to launch.",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/home.jpg", alt: "Prosaic Intelligence home: the serif lockup on a dark card over the dot-screen artwork" }, caption: "The front door: one line of purpose, three pills, and the painting." },
      },
      {
        type: "stats",
        items: [
          { value: "3 days", label: "from brief to a deployed site" },
          { value: "16 products, 7 risks", label: "on one scale, re-weighted by use case" },
          { value: "21 of 21", label: "chart colours pass contrast; accessibility 100" },
        ],
      },
      {
        type: "essay",
        title: "What the founder asked for",
        rail: "Brief",
        body: [
          "The brief fit on one card. Make it a genuinely helpful resource, with the display as the main thing. Have a methodology, because the site makes comparative safety claims about named commercial products and every number has to be defensible. A way to follow along and a way to get in touch, and nothing else. [MAR: anything the founder said on the call that shaped it, in a line]",
          "The references were as telling as the brief: an abacus, where every value and every calculation is visible and nothing has hidden state; wood grain, paper, colour that is vibrant but muted; and a note that the site should feel closer to a measurement instrument than to a consumer app. Four moodboards came out of that first evening, from abacus and white space to data-forward monochrome with one vibrant pop to dither and pixel texture.",
        ],
        visual: { kind: "slot", note: "[MAR: the four moodboards from the Figma file, side by side, with one line each on what it tried]" },
      },
      {
        type: "essay",
        title: "Problem 1: A ranking invites the wrong question",
        rail: "Problems",
        body: [
          "A leaderboard asks which model is safest. The honest answer depends on what you are using it for: a long conversation, a hard night, a quick lookup. A composite is a weighted average, and a model can hold a respectable overall score while failing one category badly. The site had to say that without turning into a spreadsheet, and it had to make the gap between the headline number and the risks underneath it impossible to miss.",
          "Decision: The question comes first, as a sentence you finish. WHICH AI IS SAFEST FOR, then a row of use cases: general use, someone having a hard time, looking things up, everyday advice, long conversations. Pick one and the whole index re-ranks around a published weighting, so the reader chooses which harms matter rather than us. General use weights all seven categories equally for the same reason. And the first line under the chart says what the chart cannot: it tells you who leads for this use case, not where the one you are considering gives way.",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/index-header.jpg", alt: "AI Safety Index: which AI is safest for, with the use-case pills" }, caption: "Finish the sentence and the index re-weights around your answer." },
      },
      {
        type: "essay",
        title: "Problem 2: An instrument that feels alive, without feeling like a toy",
        rail: null,
        body: [
          "Safety data about named products needs the register of a measuring instrument. The defaults that read as machine-made were off the table from the start: cream with a terracotta accent, near-black with one acid green, gradient washes as decoration. But a page of bars on cream is also a page nobody stays on, and the founder wanted something people would talk about.",
          "Decision: The abacus became the site's whole vocabulary. Beads on wires carry the navigation and the use cases, and the same beads run loose across the page as decoration, settling under a gentle gravity that follows the pointer, and on an iPhone, the tilt of the phone. The two kinds are different objects before anyone is told: interactive beads take the one signal blue and a real 44px target, decorative beads sit in three neutral tints and ignore the pointer entirely. Over all of it runs a halftone rosette, the dither from the moodboards, so pills warm under the pointer and three paintings, night clouds, a lighthouse, a campfire, sit in the page as dot-screens. Type is a serif for the questions, a grotesk for the interface, and a mono for every numeral.",
          "Each product is a bar in its own colour with its logo at the base, the score inside, and the headroom to 100 in a paler tint of the same colour, so the eye reads how far a model is from safe, not only where it ranks. A dotted line marks the index average. Twenty-one product colours were generated against a contrast check that fails the build if a label falls under 4.5 to 1. [MAR: the one bead or wire moment you are proudest of, in a line]",
        ],
        visual: { kind: "image", media: { src: "/images/prosaic/general-use.jpg", alt: "General use: sixteen models as bars against the index average" }, caption: "Sixteen bars, the headroom to 100 in each one's own tint, and one honest line for the average." },
      },
      {
        type: "essay",
        title: "Problem 3: Three days, and everything had to be defensible",
        rail: null,
        body: [
          "The site publishes numbers about companies that will read it. Every score has to trace to a published result, every colour has to pass contrast, every page has to work on a phone, and all of it had to be true by Sunday with one person building it.",
          "Decision: I designed it in code from the first hour, with Claude Code, and let the build be the referee. Nothing on screen is a literal: every score, source, weight and colour comes from the data layer, and the build fails on bad data or a failing contrast. Seven widths from 320 to 1440 were checked by script, not by eye, in both orientations. The founder's call ran as a phased brief with a propose-first rule on the palette and the header, so the two decisions that could not be undone were chosen from rendered options rather than argued in the abstract. [MAR: one thing that only became obvious once real screens existed, such as the beads piling against the title]",
          "It shipped to a test deploy on the Sunday night with ninety-two commits, twenty-three pages, a methodology with its sources and weights tables, and a handoff that lists every account, variable and launch blocker, so the team could take it from there without me.",
        ],
        visual: { kind: "slot", note: "[MAR: a short recording of the beads settling under the pointer and the tilt on a phone, or the methodology page with its sources and weights tables]" },
      },
      {
        type: "essay",
        title: "What shipped",
        rail: "Shipped",
        items: [
          { num: "01", title: "The index", body: "Finish the question, pick a use case, and sixteen products re-rank on one scale with the average marked." },
          { num: "02", title: "Seven ways a model can fail you", body: "A card per risk category with its own chart, and a page behind each with the finding, the sources and what it does not capture." },
          { num: "03", title: "Methodology", body: "What the index is, where the data comes from, how scores are normalised, how categories are weighted, and what is not measured." },
          { num: "04", title: "Company and use-case pages", body: "Every product name links to its maker, with that company's models across all seven categories." },
        ],
      },
      {
        type: "essay",
        title: "Designing in code",
        rail: "In code",
        parts: [
          { title: "The build as the referee", body: "A data gate and a contrast gate in the build meant I could move fast on a site where being wrong has consequences. The scores in the repo are placeholders, generated to shape the pages, and the build knows it: the site cannot launch until that flag is false." },
          { title: "Motion you can measure", body: "The bead physics took most of the tuning. Beads piling against the title oscillated forever until the type became a solid wall inside the solver; a phone's collapsing address bar re-seeded the layout on every scroll until height-only changes rescaled instead. Every one of those was found with a measurement, not a feeling. [MAR: one line on what it felt like to debug motion with numbers]" },
        ],
      },
      {
        type: "also",
        intro: "Two more things from the same three days.",
        items: [
          {
            name: "Type and colour",
            line: "Newsreader for the questions, Switzer for the interface, Geist Mono for every numeral, and one signal blue on bone, stone and warm grey.",
            media: { src: "NEED", alt: "The type and colour explorations from the Figma file" },
          },
          {
            name: "Handoff",
            line: "A one-page design system, a decisions log, and an ownership file listing every account, variable and launch blocker, written as the work was done.",
            media: { src: "NEED", alt: "The handoff documents" },
          },
        ],
      },
      {
        type: "lessons",
        items: [
          { title: "Publish the question, not just the answer", body: "The most honest thing on the site is the sentence the reader finishes. A ranking without a use case is a number without a meaning." },
          { title: "Let the build hold the line", body: "When the deadline is three days and the subject is other companies' products, the gates that fail a build are what let you move fast and still be right." },
          { title: "Decide the irreversible things from pictures", body: "The palette and the header were chosen from rendered options, and neither was reopened. Everything argued in the abstract that weekend got reopened twice." },
        ],
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
