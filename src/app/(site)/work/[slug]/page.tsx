import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getProjectBySlug, getProjectImages, getProjectSlugs } from '@/lib/queries'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description || undefined,
    openGraph: {
      images: project.cover_image_url ? [{ url: project.cover_image_url }] : [],
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const images = await getProjectImages(project.id)

  return (
    <article className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <header className="mb-12 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
            {project.title}
          </h1>
          {project.year && (
            <span className="mt-2 text-sm text-[var(--color-text-muted)]">{project.year}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
          {project.category && <span>{project.category}</span>}
          {project.client_name && <span>Client: {project.client_name}</span>}
        </div>

        {project.cover_image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      {project.description && (
        <p className="mb-12 max-w-2xl text-lg text-[var(--color-text-muted)]">
          {project.description}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src={img.url} alt={img.alt || project.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
