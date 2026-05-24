export type ContentBlock =
  | { type: 'two-column'; left: string; right: string }
  | { type: 'full-width'; image: string }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'placeholder'; message: string }
  | { type: 'text'; heading?: string; body: string }
  | { type: 'link'; href: string; label: string }

export interface Project {
  slug: string
  title: string
  role: string
  category: string
  year: string
  client: string
  intro: string
  deliverables: string[]
  heroImage: string
  /** object-position for hero/thumbnail crop. Defaults to 'center'. */
  heroPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  content: ContentBlock[]
  isProtected: boolean
  nextSlug: string
}

export const projects: Project[] = [
  {
    slug: 'mark',
    title: 'Mark',
    role: 'Designer',
    category: 'AI Hardware',
    year: '2025',
    client: 'Mark',
    intro:
      "Mark is a reading companion that brings the analog moment of underlining a sentence in a physical book into the digital life you already have. A small hardware device captures highlights and handwritten notes from whatever you're reading, and the companion app organizes them by book, by category, and by your own reading habits. I had the opportunity to work with Mark's founder, Eason Tang, as a designer on his team when Mark was part of TroyLab's build program. I led design across the app's UI/UX, the brand identity, the packaging and merchandise, and the final pitch deck presented at LAUNCH. This case study walks through the process, the iterations, and what I took away.",
    deliverables: ['UI/UX Design', 'Merchandise', 'Pitch/Slide Deck', 'Brand System'],
    heroImage: '/images/mark-hero.png',
    content: [
      {
        type: 'text',
        heading: 'Joining the team',
        body: "When I joined Mark's team, my first instinct was to wait before designing. TroyLab's build program moves fast, and the temptation when you come in mid-build is to make your mark early (no pun intended). I sat in on Eason's calls, read everything I could find about what he was building, and asked a lot of questions before I opened Figma.",
      },
      {
        type: 'text',
        heading: 'Listening before designing',
        body: "To get to a place where I could design for the people Mark was built for, I spent a couple of weeks listening before producing. I sat in on Eason's calls with potential users, watched how people actually mark up the books they're reading, and tried out adjacent products (Readwise, Notion, Apple Notes) to see what those readers already expected from a digital surface. The biggest thing that surfaced was that nobody wanted another inbox. They wanted their highlights to come back to them in moments that felt useful: a flashcard review on a commute, a search across every book when writing, a category they could trust without having to retag by hand. That insight shaped almost every screen.",
      },
      {
        type: 'text',
        heading: 'Brand foundation',
        body: "The brand starts with the wordmark: a square and a vertical bar followed by the letters MARK. Simple, modular, square. From there everything else falls out. The typographic system, the color palette of cream and a single warm yellow accent, the use of paper textures and photographic imagery. The goal was to feel grounded and tactile, not slick.",
      },
      { type: 'full-width', image: '/images/mark/stickers.png' },
      {
        type: 'text',
        heading: 'The app',
        body: "The app organizes everything the hardware captures: a Home that surfaces what's most recent and a daily reading session card, a Notes view that lets you flip through highlights like flashcards, and a Scans view that groups notes by book and category. Early versions tried to surface too much state at once. I learned to trust empty space and let the user's content (the quote, the highlight, the photo) be the foreground. The home and notes flows ended up using a system of paired panels where the wordmark sits as an anchor in the corner, so the product always feels like a continuation of the same object across screens.",
      },
      { type: 'full-width', image: '/images/mark/home-thumbnails.png' },
      { type: 'full-width', image: '/images/mark/home-thumbnails-detail.png' },
      { type: 'full-width', image: '/images/mark/share-screens.png' },
      {
        type: 'text',
        heading: 'Merch and posters',
        body: "The poster series uses a recurring \"Make Your / On Your / My Words\" framing. Each pair has a blank version and a version with imagery, so the same template can carry different campaigns. The t-shirts use the same logo modularly: tiny and centered, or large and offset, or paired with imagery from the brand library. The point was to give Eason a kit he could remix, not a fixed set of one off designs.",
      },
      { type: 'full-width', image: '/images/mark/shirts.png' },
      {
        type: 'text',
        heading: 'Print and packaging',
        body: "The envelope, postcard, and sticky note pieces were the most fun. They were also the most useful for figuring out the brand. Designing a physical artifact forces you to commit in ways that screen design lets you defer. Once the envelope worked, the digital pieces got easier because the brand had a body in the real world to refer back to.",
      },
      { type: 'full-width', image: '/images/mark/packaging.png' },
      {
        type: 'text',
        heading: 'What I took away',
        body: "Two things stuck with me. First, the value of front loading research even when there's pressure to start producing. The weeks I spent listening before designing were the highest leverage weeks of the whole project. Second, the value of a brand that lives in physical artifacts as much as it does on screen. When the envelope and the app share the same logic, the user trusts both more.",
      },
    ],
    isProtected: true,
    nextSlug: 'traeco',
  },
  {
    slug: 'traeco',
    title: 'Traeco',
    role: 'Co-founder & CPO',
    category: 'AI B2B SaaS',
    year: '2026',
    client: 'Traeco',
    intro:
      "Traeco is an AI agent cost visibility and governance platform, a single pane of glass for monitoring, attributing, and optimizing LLM spend across OpenAI, Anthropic, Google, and Cohere. As Co-founder and CPO, I owned the end-to-end design surface: brand identity, marketing site, product UI, design system, and the pitch deck we took to investors. This case study walks through the process: who we built for, how the design system was shaped by the data, and how each surface was iterated against real user feedback.",
    deliverables: ['Website Design', 'Product Design', 'Pitch Deck Design', 'Design System', 'Brand Identity'],
    heroImage: '/images/traeco/hero.png',
    heroPosition: 'center',
    content: [
      { type: 'link', href: 'https://traeco.dev', label: 'Visit live site (traeco.dev)' },
      {
        type: 'text',
        heading: 'The problem',
        body: "Engineering teams shipping AI products were flying blind on cost. Token spend was scattered across three or four provider dashboards, none of which attributed cost back to the agents, teams, or workflows actually driving it. Surprise bills were the norm. Finance asked questions Engineering couldn't answer.\n\nTraeco's job was to make that legible and prescriptive. Not just \"here's what you spent,\" but \"here's the $4,200 you'd save this month if you swapped these three calls to a smaller model.\"",
      },
      {
        type: 'text',
        heading: 'Who we designed for',
        body: "I ran a discovery round of seven user interviews across three personas before sketching a single screen: Engineering Managers (the buyers), Technical PMs (the daily users), and Finance/Ops Leads (the auditors). Each persona has a different mental model of cost. Engineers think in tokens and latency, finance thinks in dollars per team. The product had to speak both languages simultaneously without picking a side.\n\nThe interviews surfaced three jobs-to-be-done that shaped the IA: real-time + historical cost visibility, prescriptive optimization recommendations, and chargeback-ready attribution per team member.",
      },
      {
        type: 'text',
        heading: 'Design principles',
        body: "Before any screen, I wrote a short set of non-negotiable principles to anchor every decision:\n\n• Dark-first. Everything lives on a single deep neutral surface. Depth comes from layered fills, not shadows. Finance grade clarity, not consumer app flash.\n• Money is the hero. Dollar values get the largest type treatment in the type scale (40px bold). Savings render in green, with the prefix and arrow always visible.\n• Yellow is scarce. The brand accent is reserved for the primary CTA and the active nav state. Sprinkling it dilutes affordance.\n• Tabular alignment. Numbers right-aligned with monospace-feel widths so columns scan vertically without effort.\n• Motion supports data. Stats count up, bars grow in, status dots pulse. No decorative transitions. Every animation has an informational job.",
      },
      { type: 'full-width', image: '/images/traeco/dashboard.png' },
      {
        type: 'text',
        heading: 'Design system',
        body: "The system is built on four layered surfaces (app → sidebar → card → elevated card), a four-step type scale, and a deliberately narrow color palette: white-to-muted text, green for savings, amber for warnings, red only for cost increases. Seven reusable components do 90% of the work: StatCard, DataTable, RecommendationCard, TimeRangeToggle, ProgressBar, StatusDot, and SavingsBanner.\n\nDocumenting these in Figma with the same token names as the codebase removed an entire class of design-engineering friction. Handoffs became \"build this with the existing components\" instead of \"please match this exactly.\"",
      },
      {
        type: 'text',
        heading: 'Iteration and feedback',
        body: "I ran weekly design crits with the engineering team and bi-weekly feedback sessions with three pilot users. Two iterations stand out:\n\nThe Recommendations card went through four versions. V1 led with the priority badge. Testers fixated on \"high\" without reading the savings. V4 leads with the dollar amount, demotes the badge to a small text label, and adds an inline \"Apply\" affordance. Conversion to action in usability tests went from 22% to 71%.\n\nThe agent trace table started as a flat list of steps. A finance reviewer in our second pilot couldn't tell where the money went. I added a sticky cost column with a running subtotal and color-coded the latency cell: green for fast, amber for slow. Same data, completely different read.",
      },
      { type: 'full-width', image: '/images/traeco/website.png' },
      {
        type: 'text',
        heading: 'Marketing site',
        body: "The marketing site mirrors the product's voice: quiet, data dense, trustworthy. The hero leads with the outcome (\"Stop overpaying for AI\") rather than the feature list, and the dashboard mockup below it is the product's own UI rendered at scale. Features, ROI proof points, and an integration code snippet sit above the fold sequence; everything below earns its place by being concrete (real numbers, real agent names, real time-to-value).\n\nThe site uses the same type ramp and surface tokens as the product, so visitors who click through into a demo feel zero context switch.",
      },
      {
        type: 'text',
        heading: 'Outcome',
        body: "Shipped the dashboard, marketing site, and full design system to production. The marketing site is live at traeco.dev. Took the pitch deck through Series-Seed conversations. The biggest learning was structural: starting with a written principles doc and a token cheat sheet (before any high fidelity screens) paid back in every subsequent decision and made cross-functional review meaningfully faster.",
      },
    ],
    isProtected: false,
    nextSlug: 'atlix',
  },
  {
    slug: 'atlix',
    title: 'Atlix',
    role: 'Co-founder',
    category: 'AI B2B SaaS',
    year: '2026',
    client: 'Atlix',
    intro:
      "I co-founded Atlix to make sense of what young Californians are actually talking about. Atlix is a narrative intelligence dashboard that pulls public discourse from across regions and surfaces what's gaining traction, what's losing it, and how people are framing the issues that affect them. I led design across product, brand, pitch deck, and design system. This case study walks through the research, the design choices, and what I learned along the way.",
    deliverables: ['Product Design', 'Pitch Deck Design', 'Design System', 'Brand Identity'],
    heroImage: '/images/atlix/hero.png',
    content: [
      {
        type: 'text',
        heading: 'Where the idea came from',
        body: "Polling and survey data lag behind. By the time a report goes out, the conversation has already shifted. I wanted to build something that listened to what young people were actually saying in real time, across the regions of California that don't always get the loudest mic. The product had to be useful for advocacy groups, policy researchers, and anyone who needs to read demographic discourse without waiting for a quarterly report.",
      },
      {
        type: 'text',
        heading: 'Early research and interviews',
        body: "Before designing screens, I spent a few weeks reading the kinds of reports people in this space already work from, talking to researchers and advocacy folks I had access to, and trying to map out what their day actually looks like. The biggest pattern I noticed was that nobody wanted yet another data tool. They wanted summaries they could trust, with the source still one click away. That shaped the whole product: cards first, summaries upfront, citations always visible.",
      },
      {
        type: 'text',
        heading: 'Designing the dashboard',
        body: "The first version of the dashboard was much busier. Filters everywhere, charts on charts, every card trying to say too much at once. After getting feedback from the researchers I'd talked to earlier, I cut it back to what actually matters in the first three seconds: what's the topic, where is it happening, how much is it growing, and who's talking about it. Everything else moved into the detail view. The current layout uses left rail filters for region and issue, a tab row for sort order (most pressing, volume, fastest growing), and a card grid where each card commits to a single narrative.",
      },
      { type: 'full-width', image: '/images/atlix/dashboard.png' },
      {
        type: 'text',
        heading: 'The pitch deck',
        body: "The deck went through a lot of versions. Early drafts overexplained the technical side and underexplained the why. The version that landed leads with the gap between when people are talking and when researchers find out about it, then shows what the dashboard does in a few screenshots. I tried to keep slide density low: one idea per slide, one image, very few words.",
      },
      { type: 'video', src: '/videos/atlix-pitch.mp4', poster: '/images/atlix/hero.png' },
      {
        type: 'text',
        heading: 'Brand',
        body: "Atlix sits in a category where most tools look either academic and beige or aggressively tech. I wanted a third option. The brand is dark navy with a single accent, type forward, and quiet. The wordmark is a clean sans-serif because the product itself should be the loudest thing in any deck or screenshot.",
      },
      {
        type: 'text',
        heading: 'Outcome',
        body: "The dashboard and pitch deck took us to the global finalist round of the Asian Leadership Conference, beating out hundreds of teams from Stanford, Harvard, Cornell, and UC Berkeley along the way. The biggest thing I learned was that research before design isn't a checkbox. Every time I shortcut it and started designing first, I had to throw work away. The reverse was also true: every conversation I had before opening Figma made the actual design work go faster, because half the decisions were already made. I also learned a lot about restraint. Cutting a field off a card felt scary at first, but it ended up making the whole grid feel more confident than adding one ever would have.",
      },
    ],
    isProtected: false,
    nextSlug: 'glance',
  },
  {
    slug: 'glance',
    title: 'Glance',
    role: 'Designer',
    category: 'Productivity Software',
    year: '2025',
    client: 'Glance',
    intro:
      "I had the opportunity to work with Glance's founders as a designer on their team when Glance was part of TroyLab's build program. The majority of my time was spent on website design and iterations of logo designs. Unfortunately, I no longer have access to the website and therefore can't upload any designs for it, but I still have the sketches of the logo iterations.",
    deliverables: ['UI/UX Design', 'Website Design', 'Logo Design', 'Framer Development'],
    heroImage: '/images/glance-hero.png',
    content: [
      { type: 'full-width', image: '/images/glance-content.png' },
    ],
    isProtected: false,
    nextSlug: 'mountaindew',
  },
  {
    slug: 'mountaindew',
    title: 'Mountain Dew',
    role: 'Design Consultant',
    category: 'CPG',
    year: '2024',
    client: 'Mountain Dew',
    intro:
      'I had the opportunity to work with Mountain Dew as a client in Avenues Consulting Group. As a design consultant on their team, I spearheaded market research and strategies, bottle redesigns utilizing their new logo, and presented a slide deck alongside my team. Attached are previews of the slide deck alongside the bottle redesigns.',
    deliverables: ['Product Design', 'Pitch/Slide Deck', 'Brand Strategy'],
    heroImage: '/images/mountaindew-hero.png',
    content: [
      { type: 'two-column', left: '/images/mountaindew-1.png', right: '/images/mountaindew-2.png' },
    ],
    isProtected: false,
    nextSlug: 'charitablefoundation',
  },
  {
    slug: 'charitablefoundation',
    title: 'Ichioka and Nakao',
    role: 'Design Consultant',
    category: 'Nonprofit',
    year: '2024',
    client: 'Ichioka and Nakao Charitable Foundation',
    intro:
      'I had the opportunity to work with the Ichioka and Nakao Charitable Foundation as a client in Avenues Consulting Group. As a design consultant on their team, I spearheaded a brand and website redesign, presenting a slide deck alongside my team.',
    deliverables: ['Logo Design', 'Website Design', 'Pitch/Slide Deck', 'Branding'],
    heroImage: '/images/ichioka-hero.png',
    content: [
      { type: 'two-column', left: '/images/ichioka-1.png', right: '/images/ichioka-hero.png' },
      { type: 'full-width', image: '/images/ichioka-2.jpeg' },
      { type: 'full-width', image: '/images/ichioka-3.jpeg' },
    ],
    isProtected: false,
    nextSlug: 'smallworks',
  },
  {
    slug: 'smallworks',
    title: 'Small Works',
    role: 'Designer',
    category: 'Personal',
    year: '2023–2025',
    client: 'Varied',
    intro:
      "This collection highlights the different small works over the years that don't exactly warrant their own page. Includes projects from hackathons, design challenges, and even class projects.",
    deliverables: ['Figma', 'UI/UX Design', 'Website Design', 'Branding'],
    heroImage: '/images/smallworks-hero.png',
    content: [
      { type: 'two-column', left: '/images/smallworks-1.webp', right: '/images/smallworks-2.webp' },
      { type: 'full-width', image: '/images/smallworks-3.png' },
    ],
    isProtected: false,
    nextSlug: 'graphics',
  },
  {
    slug: 'graphics',
    title: 'Graphics',
    role: 'Designer / Illustrator',
    category: 'Graphic Design',
    year: '2023–2025',
    client: 'Varied',
    intro:
      "This is a collection of all the miscellaneous graphics I've created over the course of several years! This collection spans graphics made for Instagram posts, flyers, and even illustrative work, combined with graphic design elements made for fun :)",
    deliverables: ['Art Direction', 'Graphic Design', 'Illustration'],
    heroImage: '/images/graphics-hero.webp',
    heroPosition: 'top',
    content: [
      { type: 'two-column', left: '/images/graphics-hero.webp', right: '/images/graphics-2.webp' },
      { type: 'full-width', image: '/images/graphics-3.webp' },
      { type: 'two-column', left: '/images/graphics-4.webp', right: '/images/graphics-5.png' },
      { type: 'full-width', image: '/images/graphics-6.png' },
      { type: 'full-width', image: '/images/graphics-7.png' },
    ],
    isProtected: false,
    nextSlug: 'mark',
  },
  {
    slug: 'impeccable-chicken',
    title: 'Impeccable Chicken',
    role: 'Pitch Deck Design',
    category: 'Brand / Deck',
    year: '2025',
    client: 'Impeccable Chicken',
    intro:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy for the Impeccable Chicken pitch deck. Replace with the real story when ready.',
    deliverables: ['Pitch Deck', 'Brand System'],
    heroImage: '',
    content: [
      { type: 'placeholder', message: 'Case study in progress. Content coming soon.' },
    ],
    isProtected: true,
    nextSlug: 'mark',
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getNextProject(slug: string): Project | undefined {
  const current = getProject(slug)
  if (!current) return undefined
  return getProject(current.nextSlug)
}

export const PROTECTED_SLUGS = projects
  .filter((p) => p.isProtected)
  .map((p) => p.slug)
