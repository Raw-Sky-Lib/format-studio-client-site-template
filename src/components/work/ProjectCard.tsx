import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types/content'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex flex-col gap-3">
      <Link href={`/work/${project.slug}`} className="block overflow-hidden rounded-lg">
        <div className="relative aspect-[4/3] w-full bg-[var(--color-surface)]">
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--color-text-muted)] text-sm">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            <Link href={`/work/${project.slug}`} className="hover:opacity-70 transition-opacity">
              {project.title}
            </Link>
          </h2>
          {project.year && (
            <span className="text-xs text-[var(--color-text-muted)]">{project.year}</span>
          )}
        </div>

        {project.category && (
          <p className="text-xs text-[var(--color-text-muted)]">{project.category}</p>
        )}

        {project.description && (
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{project.description}</p>
        )}
      </div>
    </article>
  )
}
