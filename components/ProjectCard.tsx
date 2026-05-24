import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/lib/projects'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/works/${project.slug}`}
      className="group block relative overflow-hidden bg-zinc-900"
    >
      {/* Header row */}
      <div className="flex items-start justify-between px-3 py-2">
        <span className="text-xs font-roboto-condensed text-white font-medium">
          {project.title}
        </span>
        <div className="flex items-center gap-1.5 text-white">
          <span className="tag-pill">{project.category}</span>
          <span className="tag-pill">{project.year}</span>
        </div>
      </div>

      {/* Image — natural aspect ratio, no cropping */}
      <div className="relative w-full overflow-hidden">
        {project.heroImage ? (
          <Image
            src={project.heroImage}
            alt={project.title}
            width={800}
            height={500}
            className="w-full h-auto"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="w-full aspect-[8/5] bg-zinc-900 border-t border-white/10 flex items-center justify-center px-6">
            <span
              className="font-unbounded font-medium text-white/90 uppercase leading-none text-center"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: 'var(--tracking-display)' }}
            >
              {project.title}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors t-smooth flex items-center justify-center">
          <span className="text-white text-xs font-roboto-condensed tracking-widest opacity-0 group-hover:opacity-100 transition-opacity t-smooth border border-white px-4 py-1.5">
            View project
          </span>
        </div>
        {project.isProtected && (
          <div className="absolute top-2 right-2 text-[9px] font-roboto-condensed tracking-widest text-white/60 border border-white/30 px-1.5 py-0.5">
            NDA
          </div>
        )}
      </div>
    </Link>
  )
}
