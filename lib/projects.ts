export type ContentBlock =
  | { type: 'two-column'; left: string; right: string }
  | { type: 'full-width'; image: string }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'placeholder'; message: string }
  | { type: 'text'; heading?: string; body: string }

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
      "I had the opportunity to work with Mark's founder, Eason Tang, as a designer on his team when Mark was part of TroyLab's build program. The majority of my time was spent on UI/UX of the app, packaging designs, merchandise designs, and the final pitch deck that was to be presented at LAUNCH. Unfortunately, I did sign an NDA regarding these designs, but I'd be happy to discuss more about it in real life :)",
    deliverables: ['UI/UX Design', 'Merchandise', 'Pitch/Slide Deck', 'Brand System'],
    heroImage: '/images/mark-hero.png',
    content: [
      { type: 'full-width', image: '/images/mark/home-thumbnails.png' },
      { type: 'full-width', image: '/images/mark/home-thumbnails-detail.png' },
      { type: 'full-width', image: '/images/mark/share-screens.png' },
      { type: 'full-width', image: '/images/mark/stickers.png' },
      { type: 'full-width', image: '/images/mark/shirts.png' },
      { type: 'full-width', image: '/images/mark/packaging.png' },
    ],
    isProtected: true,
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
      "Traeco is an AI agent cost visibility and governance platform — a single pane of glass for monitoring, attributing, and optimizing LLM spend across OpenAI, Anthropic, Google, and Cohere. As Co-founder and CPO, I owned the end-to-end design surface: brand identity, marketing site, product UI, design system, and the pitch deck we took to investors. This case study walks through the process: who we built for, how the design system was shaped by the data, and how each surface was iterated against real user feedback.",
    deliverables: ['Website Design', 'Product Design', 'Pitch Deck Design', 'Design System', 'Brand Identity'],
    heroImage: '/images/traeco/hero.png',
    heroPosition: 'center',
    content: [
      {
        type: 'text',
        heading: 'The problem',
        body: "Engineering teams shipping AI products were flying blind on cost. Token spend was scattered across three or four provider dashboards, none of which attributed cost back to the agents, teams, or workflows actually driving it. Surprise bills were the norm. Finance asked questions Engineering couldn't answer.\n\nTraeco's job was to make that legible — and prescriptive. Not just \"here's what you spent,\" but \"here's the $4,200 you'd save this month if you swapped these three calls to a smaller model.\"",
      },
      {
        type: 'text',
        heading: 'Who we designed for',
        body: "I ran a discovery round of seven user interviews across three personas before sketching a single screen: Engineering Managers (the buyers), Technical PMs (the daily users), and Finance/Ops Leads (the auditors). Each persona has a different mental model of cost — engineers think in tokens and latency, finance thinks in dollars per team. The product had to speak both languages simultaneously without picking a side.\n\nThe interviews surfaced three jobs-to-be-done that shaped the IA: real-time + historical cost visibility, prescriptive optimization recommendations, and chargeback-ready attribution per team member.",
      },
      {
        type: 'text',
        heading: 'Design principles',
        body: "Before any screen, I wrote a short set of non-negotiable principles to anchor every decision:\n\n• Dark-first. Everything lives on a single deep neutral surface. Depth comes from layered fills, not shadows — finance-grade clarity, not consumer-app flash.\n• Money is the hero. Dollar values get the largest type treatment in the type scale (40px bold). Savings render in green, with the prefix and arrow always visible.\n• Yellow is scarce. The brand accent is reserved for the primary CTA and the active nav state. Sprinkling it dilutes affordance.\n• Tabular alignment. Numbers right-aligned with monospace-feel widths so columns scan vertically without effort.\n• Motion supports data. Stats count up, bars grow in, status dots pulse. No decorative transitions — every animation has an informational job.",
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
        body: "I ran weekly design crits with the engineering team and bi-weekly feedback sessions with three pilot users. Two iterations stand out:\n\nThe Recommendations card went through four versions. V1 led with the priority badge — testers fixated on \"high\" without reading the savings. V4 leads with the dollar amount, demotes the badge to a small text label, and adds an inline \"Apply\" affordance. Conversion to action in usability tests went from 22% to 71%.\n\nThe agent trace table started as a flat list of steps. A finance reviewer in our second pilot couldn't tell where the money went. I added a sticky cost column with a running subtotal and color-coded the latency cell — green for fast, amber for slow. Same data, completely different read.",
      },
      { type: 'full-width', image: '/images/traeco/website.png' },
      {
        type: 'text',
        heading: 'Marketing site',
        body: "The marketing site mirrors the product's voice — quiet, data-dense, trustworthy. The hero leads with the outcome (\"Stop overpaying for AI\") rather than the feature list, and the dashboard mockup below it is the product's own UI rendered at scale. Features, ROI proof points, and an integration code snippet sit above the fold sequence; everything below earns its place by being concrete (real numbers, real agent names, real time-to-value).\n\nThe site uses the same type ramp and surface tokens as the product, so visitors who click through into a demo feel zero context switch.",
      },
      {
        type: 'text',
        heading: 'Outcome',
        body: "Shipped the dashboard, marketing site, and full design system to production. Took the pitch deck through Series-Seed conversations. The biggest learning was structural: starting with a written principles doc and a token cheat sheet — before any high-fidelity screens — paid back in every subsequent decision and made cross-functional review meaningfully faster.",
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
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy for the Atlix case study — replace with the real story when ready. Cover the brief, the constraints, and what shipped.',
    deliverables: ['Product Design', 'Pitch Deck Design', 'Design System', 'Brand Identity'],
    heroImage: '/images/atlix/hero.png',
    content: [
      { type: 'video', src: '/videos/atlix-pitch.mp4', poster: '/images/atlix/hero.png' },
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
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeholder copy for the Impeccable Chicken pitch deck — replace with the real story when ready.',
    deliverables: ['Pitch Deck', 'Brand System'],
    heroImage: '',
    content: [
      { type: 'placeholder', message: 'Case study in progress — content coming soon.' },
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
