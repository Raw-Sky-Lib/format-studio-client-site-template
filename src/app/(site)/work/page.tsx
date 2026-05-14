import type { Metadata } from 'next'
import { getPublishedProjects } from '@/lib/queries'
import ProjectCard from '@/components/work/ProjectCard'

export const metadata: Metadata = {
  title: 'Work',
}

export default async function WorkPage() {
  const projects = await getPublishedProjects()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="mb-12 text-4xl font-bold tracking-tight text-[var(--color-text)]">Work</h1>

      {projects.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No projects yet.</p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
