export type ContentBlock =
  | { type: 'two-column'; left: string; right: string }
  | { type: 'full-width'; image: string }
  | { type: 'placeholder'; message: string }

export interface Project {
  slug: string
  title: string
  category: string
  year: string
  client: string
  intro: string
  deliverables: string[]
  heroImage: string
  content: ContentBlock[]
  isProtected: boolean
  nextSlug: string
}

export const projects: Project[] = [
  {
    slug: 'mark',
    title: 'Mark',
    category: 'AI Hardware',
    year: '2025',
    client: 'Mark',
    intro:
      "I had the opportunity to work with Mark's founder, Eason Tang, as a designer on his team when Mark was part of TroyLab's build program. The majority of my time was spent on UI/UX of the app, packaging designs, merchandise designs, and the final pitch deck that was to be presented at LAUNCH. Unfortunately, I did sign an NDA regarding these designs, but I'd be happy to discuss more about it in real life :)",
    deliverables: ['UI/UX Design', 'Merchandise', 'Pitch/Slide Deck'],
    heroImage: '/images/mark-hero.png',
    content: [],
    isProtected: true,
    nextSlug: 'glance',
  },
  {
    slug: 'glance',
    title: 'Glance',
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
    category: 'Graphic Design',
    year: '2023–2025',
    client: 'Varied',
    intro:
      "This is a collection of all the miscellaneous graphics I've created over the course of several years! This collection spans graphics made for Instagram posts, flyers, and even illustrative work, combined with graphic design elements made for fun :)",
    deliverables: ['Art Direction', 'Graphic Design', 'Illustration'],
    heroImage: '/images/graphics-hero.webp',
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
    category: 'Branding',
    year: '2025',
    client: 'Impeccable Chicken',
    intro: 'Coming soon.',
    deliverables: [],
    heroImage: '/images/mark-hero.png',
    content: [
      { type: 'placeholder', message: 'Content coming soon.' },
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
