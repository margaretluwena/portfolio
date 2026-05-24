import ProjectCard from '@/components/ProjectCard'
import { projects } from '@/lib/projects'

export default function WorksPage() {
  return (
    <main className="bg-black min-h-screen pt-20">
      <section className="px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </main>
  )
}
