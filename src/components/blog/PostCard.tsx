import Link from 'next/link'
import Image from 'next/image'
import { formatDate, truncate } from '@/lib/utils'
import type { Post } from '@/types/content'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col gap-4">
      {post.cover_image_url && (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </Link>
      )}

      <div className="flex flex-col gap-2">
        {post.published_at && (
          <time
            dateTime={post.published_at}
            className="text-xs text-[var(--color-text-muted)]"
          >
            {formatDate(post.published_at)}
          </time>
        )}

        <h2 className="text-xl font-semibold leading-snug text-[var(--color-text)]">
          <Link href={`/blog/${post.slug}`} className="hover:opacity-70 transition-opacity">
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="text-sm text-[var(--color-text-muted)]">
            {truncate(post.excerpt, 160)}
          </p>
        )}

        {post.author_name && (
          <p className="text-xs text-[var(--color-text-muted)]">By {post.author_name}</p>
        )}
      </div>
    </article>
  )
}
