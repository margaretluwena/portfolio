import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { projects, getProject, getNextProject } from '@/lib/projects'
import PasswordGate from '@/components/PasswordGate'
import FadeInOnScroll from '@/components/FadeInOnScroll'

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return { title: `${project.title} — Margaret Luwena` }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const nextProject = getNextProject(slug)

  // Check password gate server-side
  if (project.isProtected) {
    const cookieStore = await cookies()
    const unlocked = cookieStore.get(`unlocked_${slug}`)
    if (!unlocked || unlocked.value !== '1') {
      return <PasswordGate slug={slug} title={project.title} />
    }
  }

  return (
    <main className="bg-black min-h-screen">
      {/* Hero image — full-width, fixed height, intentional cover crop */}
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-zinc-900">
        {project.heroImage ? (
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover"
            style={{ objectPosition: project.heroPosition ?? 'center' }}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <span
              className="font-unbounded font-medium text-white/90 uppercase leading-none text-center"
              style={{ fontSize: 'clamp(3rem, 12vw, 12rem)', letterSpacing: 'var(--tracking-display)' }}
            >
              {project.title}
            </span>
          </div>
        )}
      </div>

      {/* Project header */}
      <FadeInOnScroll>
      <section className="px-6 md:px-12 py-12 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <h1
            className="font-unbounded font-medium text-white text-3xl md:text-5xl"
            style={{ letterSpacing: 'var(--tracking-tight)' }}
          >
            {project.title}
          </h1>
          <div className="flex gap-2 flex-shrink-0 text-white">
            <span className="tag-pill">{project.category}</span>
            <span className="tag-pill">{project.year}</span>
          </div>
        </div>
      </section>
      </FadeInOnScroll>

      {/* Intro + deliverables */}
      <FadeInOnScroll>
      <section className="px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10">
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">
            Intro
          </p>
          <p className="text-white/80 font-inter text-sm leading-relaxed">{project.intro}</p>
        </div>
        <div>
          <p className="eyebrow mb-4">
            Deliverables
          </p>
          <ul className="space-y-1">
            {project.deliverables.map((d) => (
              <li key={d} className="text-white/80 font-roboto-condensed text-sm tracking-wide">
                {d}
              </li>
            ))}
          </ul>
          {project.role && (
            <div className="mt-8">
              <p className="eyebrow mb-1">
                Role
              </p>
              <p className="text-white/80 font-roboto-condensed text-sm">{project.role}</p>
            </div>
          )}
          <div className="mt-4">
            <p className="eyebrow mb-1">
              Year
            </p>
            <p className="text-white/80 font-roboto-condensed text-sm">{project.year}</p>
          </div>
          <div className="mt-4">
            <p className="eyebrow mb-1">
              Client
            </p>
            <p className="text-white/80 font-roboto-condensed text-sm">{project.client}</p>
          </div>
        </div>
      </section>
      </FadeInOnScroll>

      {/* Content images — natural aspect ratio, no cropping */}
      {project.content.length > 0 && (
        <FadeInOnScroll>
        <section className="px-6 md:px-12 py-12 space-y-6">
          {project.content.map((block, i) => {
            if (block.type === 'two-column') {
              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <img src={block.left} alt="" className="w-full h-auto block" />
                  <img src={block.right} alt="" className="w-full h-auto block" />
                </div>
              )
            }
            if (block.type === 'full-width') {
              return (
                <div key={i}>
                  <img src={block.image} alt="" className="w-full h-auto block" />
                </div>
              )
            }
            if (block.type === 'placeholder') {
              return (
                <div
                  key={i}
                  className="border border-white/10 py-24 flex items-center justify-center"
                >
                  <p className="text-white/30 font-roboto-condensed text-xs tracking-widest uppercase">
                    {block.message}
                  </p>
                </div>
              )
            }
            return null
          })}
        </section>
        </FadeInOnScroll>
      )}

      {/* Next project */}
      {nextProject && (
        <FadeInOnScroll>
        <section className="px-6 md:px-12 py-16 border-t border-white/10">
          <p className="eyebrow mb-4">
            Next work
          </p>
          <Link
            href={`/works/${nextProject.slug}`}
            className="font-unbounded font-medium text-white text-2xl md:text-4xl hover:text-white/60 transition-colors t-smooth"
          >
            {nextProject.title}
          </Link>
        </section>
        </FadeInOnScroll>
      )}

    </main>
  )
}
