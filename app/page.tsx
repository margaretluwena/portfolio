import Image from 'next/image'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'
import FadeInOnScroll from '@/components/FadeInOnScroll'
import { projects } from '@/lib/projects'

const SKILLS = [
  'Website Design',
  'Graphic Design',
  'Branding',
  'UX / UI Design',
  'Brand Strategy',
  'Decking',
  'Design System',
  'Illustration',
]

export default function Home() {
  const displayProjects = projects.filter((p) => p.slug !== 'impeccable-chicken')

  return (
    <main className="bg-black min-h-screen">
      {/* Hero title */}
      <section className="relative flex items-end justify-center h-screen overflow-hidden">
        <h1
          className="font-unbounded font-black text-white uppercase leading-none select-none w-full text-center pb-8"
          style={{ fontSize: 'clamp(3rem, 14vw, 18rem)' }}
        >
          MARGARET LUWENA
        </h1>
      </section>

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
            <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-6">
              More about me!
            </p>
            <p className="text-white/80 font-inter text-sm leading-relaxed mb-4">
              I love making digital experiences by blending design and a distinct story. My approach
              combines creativity with innovation, and I strive to deliver work that feels both
              functional and inspiring. Primary tools involve Figma, Procreate, and Framer.
            </p>
            <p className="text-white/80 font-inter text-sm leading-relaxed">
              From startups to the Fortune 500, I work diligently on projects to bring ideas to
              life, shaping interactive experiences that connect with audiences. Every project is
              more than just that—it&apos;s my own journey of transforming a vision into digital
              realities that (hopefully) leave a lasting impression.
            </p>
          </div>

          {/* Photos */}
          <div className="flex items-end gap-6">
            <div className="w-48 flex-shrink-0">
              <Image
                src="/images/margaret-photo.jpg"
                alt="Margaret Luwena"
                width={400}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="w-28 flex-shrink-0">
              <Image
                src="/images/margaret-chibi.png"
                alt="Margaret illustration"
                width={200}
                height={300}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      </FadeInOnScroll>

      {/* What I do */}
      <FadeInOnScroll>
      <section className="px-6 md:px-12 py-16 border-t border-white/10">
        <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-8">
          What I do
        </p>
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
      </section>
      </FadeInOnScroll>
    </main>
  )
}
