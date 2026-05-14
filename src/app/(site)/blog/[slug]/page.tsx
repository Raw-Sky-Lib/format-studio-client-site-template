import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getPostBySlug, getPostSlugs } from '@/lib/queries'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <header className="mb-10 flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
          {post.published_at && (
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          )}
          {post.author_name && <span>By {post.author_name}</span>}
        </div>

        {post.cover_image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
