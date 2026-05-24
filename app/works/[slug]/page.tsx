import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { projects, getProject, getNextProject } from '@/lib/projects'
import PasswordGate from '@/components/PasswordGate'

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
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <span
              className="font-unbounded font-black text-white/90 uppercase leading-none text-center"
              style={{ fontSize: 'clamp(3rem, 12vw, 12rem)', letterSpacing: '-0.05em' }}
            >
              {project.title}
            </span>
          </div>
        )}
      </div>

      {/* Project header */}
      <section className="px-6 md:px-12 py-12 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <h1 className="font-unbounded font-black text-white text-3xl md:text-5xl">
            {project.title}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <span className="text-[10px] font-roboto-condensed tracking-widest text-white border border-white px-2 py-0.5">
              {project.category}
            </span>
            <span className="text-[10px] font-roboto-condensed tracking-widest text-white border border-white px-2 py-0.5">
              {project.year}
            </span>
          </div>
        </div>
      </section>

      {/* Intro + deliverables */}
      <section className="px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10">
        <div className="md:col-span-2">
          <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-4">
            Intro
          </p>
          <p className="text-white/80 font-inter text-sm leading-relaxed">{project.intro}</p>
        </div>
        <div>
          <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-4">
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
              <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-1">
                Role
              </p>
              <p className="text-white/80 font-roboto-condensed text-sm">{project.role}</p>
            </div>
          )}
          <div className="mt-4">
            <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-1">
              Year
            </p>
            <p className="text-white/80 font-roboto-condensed text-sm">{project.year}</p>
          </div>
          <div className="mt-4">
            <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-1">
              Client
            </p>
            <p className="text-white/80 font-roboto-condensed text-sm">{project.client}</p>
          </div>
        </div>
      </section>

      {/* Content images — natural aspect ratio, no cropping */}
      {project.content.length > 0 && (
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
      )}

      {/* Next project */}
      {nextProject && (
        <section className="px-6 md:px-12 py-16 border-t border-white/10">
          <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-4">
            Next work
          </p>
          <Link
            href={`/works/${nextProject.slug}`}
            className="font-unbounded font-bold text-white text-2xl md:text-4xl hover:text-white/60 transition-colors"
          >
            {nextProject.title}
          </Link>
        </section>
      )}

    </main>
  )
}
