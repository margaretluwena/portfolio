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
        <span className="text-xs font-roboto-condensed tracking-wide text-white">
          {project.title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-roboto-condensed tracking-widest text-white border border-white px-2 py-0.5">
            {project.category}
          </span>
          <span className="text-[10px] font-roboto-condensed tracking-widest text-white border border-white px-2 py-0.5">
            {project.year}
          </span>
        </div>
      </div>

      {/* Image — natural aspect ratio, no cropping */}
      <div className="relative w-full overflow-hidden">
        <Image
          src={project.heroImage}
          alt={project.title}
          width={800}
          height={500}
          className="w-full h-auto"
          style={{ display: 'block' }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <span className="text-white text-xs font-roboto-condensed tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-white px-4 py-1.5">
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
