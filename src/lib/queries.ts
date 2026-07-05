// All Supabase reads for the site.
// Every function uses createServerSupabase() — these run in Server Components only.
// For client-side reads (rare), use createClientSupabase() from lib/supabase/client.ts.

import { createServerSupabase, createStaticSupabase } from '@/lib/supabase/server'
import type {
  SiteConfig,
  NavItem,
  Page,
  Post,
  Project,
  ProjectImage,
} from '@/types/content'

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

/** Fetches all site_settings rows and returns them as a flat key→value map. */
export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ''])) as SiteConfig
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export async function getNavItems(): Promise<NavItem[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('nav_items')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data as Page
}

export async function getPageSlugs(): Promise<string[]> {
  const supabase = createStaticSupabase()
  const { data, error } = await supabase
    .from('pages')
    .select('slug')
    .eq('is_published', true)
    .neq('slug', 'home')
  if (error) return []
  return (data ?? []).map((r) => r.slug)
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data as Post
}

export async function getPostSlugs(): Promise<string[]> {
  const supabase = createStaticSupabase()
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('is_published', true)
  if (error) return []
  return (data ?? []).map((r) => r.slug)
}

// ---------------------------------------------------------------------------
// Portfolio (optional module — requires 004_portfolio.sql)
// ---------------------------------------------------------------------------

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data as Project
}

export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function getProjectSlugs(): Promise<string[]> {
  const supabase = createStaticSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('slug')
    .eq('is_published', true)
  if (error) return []
  return (data ?? []).map((r) => r.slug)
}
