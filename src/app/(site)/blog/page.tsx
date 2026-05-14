import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/queries'
import PostCard from '@/components/blog/PostCard'

export const metadata: Metadata = {
  title: 'Blog',
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="mb-12 text-4xl font-bold tracking-tight text-[var(--color-text)]">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No posts yet.</p>
      ) : (
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
