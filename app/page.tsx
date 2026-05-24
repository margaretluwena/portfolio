import Image from 'next/image'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'
import FadeInOnScroll from '@/components/FadeInOnScroll'
import { projects } from '@/lib/projects'

const SKILLS = [
  'UX / UI Design',
  'Product Design',
  'Website Design',
  'Brand Identity',
  'Brand Strategy',
  'Design Systems',
  'Art Direction',
  'Pitch Deck Design',
  'Illustration',
]

export default function Home() {
  const displayProjects = projects.filter((p) => p.slug !== 'impeccable-chicken')

  return (
    <main className="bg-black min-h-screen">
      {/* Intro */}
      <FadeInOnScroll>
        <section className="px-6 md:px-12 py-16 max-w-3xl">
          <p className="text-white/70 font-inter text-sm leading-relaxed">
            Hi, my name is Margaret! I&apos;m currently a student at USC with a passion for
            UI/UX, design, and creative direction.
          </p>
        </section>
      </FadeInOnScroll>

      {/* Project grid */}
      <section id="works" className="px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
          {displayProjects.map((project, i) => (
            <FadeInOnScroll key={project.slug} delay={i * 60}>
              <ProjectCard project={project} />
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* About */}
      <FadeInOnScroll>
      <section id="info" className="px-6 md:px-12 py-24 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Text */}
          <div>
            <p className="eyebrow mb-6">
              More about me!
            </p>
            <p className="text-white/80 font-inter text-sm leading-relaxed mb-4">
              I love making digital experiences by blending design and a distinct story. My approach
              combines creativity with innovation, and I strive to deliver work that feels both
              functional and inspiring. Primary tools involve Figma, Procreate, and Claude Code.
            </p>
            <p className="text-white/80 font-inter text-sm leading-relaxed">
              From startups to the Fortune 500, I work diligently on projects to bring ideas to
              life, shaping interactive experiences that connect with audiences. Every project is
              more than just that—it&apos;s my own journey of transforming a vision into digital
              realities that (hopefully) leave a lasting impression.
            </p>
          </div>

          {/* Photos — matched height, bottom-aligned */}
          <div className="flex items-end gap-6">
            <div className="h-60 flex-shrink-0">
              <Image
                src="/images/margaret-photo.jpg"
                alt="Margaret Luwena"
                width={414}
                height={450}
                className="h-full w-auto object-cover"
              />
            </div>
            <div className="h-60 flex-shrink-0">
              <Image
                src="/images/margaret-chibi.png"
                alt="Margaret illustration"
                width={1180}
                height={1668}
                className="h-full w-auto"
              />
            </div>
          </div>
        </div>
      </section>
      </FadeInOnScroll>

      {/* What I do — eyebrow left, list locked right */}
      <FadeInOnScroll>
      <section className="px-6 md:px-12 py-16 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <p className="eyebrow">What I do</p>
          <div className="flex flex-col gap-2">
            {SKILLS.map((skill) => (
              <p
                key={skill}
                className="text-white font-roboto-condensed text-lg tracking-wide uppercase"
              >
                {skill}
              </p>
            ))}
          </div>
        </div>
      </section>
      </FadeInOnScroll>
    </main>
  )
}
