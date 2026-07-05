// TypeScript interfaces for all CMS content types.
// These mirror the Supabase schema exactly — keep in sync with migrations.

// ---------------------------------------------------------------------------
// Site Settings & Nav
// ---------------------------------------------------------------------------

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  updated_at: string
}

/** Flattened map of all site_settings rows — use this in components. */
export interface SiteConfig {
  site_name: string
  site_description: string
  seo_title: string
  seo_description: string
  og_image_url: string
  contact_email: string
  contact_phone: string
  address: string
  social_instagram: string
  social_twitter: string
  social_linkedin: string
  social_facebook: string
  logo_url: string
  footer_text: string
  [key: string]: string
}

export interface NavItem {
  id: string
  label: string
  url: string
  order: number
  is_external: boolean
}

// ---------------------------------------------------------------------------
// Pages & Sections
// ---------------------------------------------------------------------------

export type SectionType =
  | 'hero'
  | 'features'
  | 'about'
  | 'testimonials'
  | 'cta'
  | 'why_us'
  | 'process'
  | 'featured_projects'
  | 'contact'
  | 'embed'

export interface HeroSection {
  type: 'hero'
  headline: string
  subheadline?: string
  cta_label?: string
  cta_url?: string
  image_url?: string
}

export interface FeatureItem {
  icon?: string
  title: string
  description: string
}

export interface FeaturesSection {
  type: 'features'
  title?: string
  items: FeatureItem[]
}

export interface AboutSection {
  type: 'about'
  title?: string
  body: string
  image_url?: string
}

export interface TestimonialItem {
  quote: string
  author: string
  role?: string
  avatar_url?: string
}

export interface TestimonialsSection {
  type: 'testimonials'
  title?: string
  items: TestimonialItem[]
}

export interface CTASection {
  type: 'cta'
  headline: string
  subheadline?: string
  button_label?: string
  button_url?: string
}

// ─── Additional section types (parity with portal types/index.ts) ───────────

export interface WhyUsItem {
  icon?: string
  title: string
  description: string
}

export interface WhyUsSection {
  type: 'why_us'
  title?: string
  subtitle?: string
  items: WhyUsItem[]
}

export interface ProcessStep {
  number?: string | number
  title: string
  description: string
}

export interface ProcessSection {
  type: 'process'
  title?: string
  subtitle?: string
  steps: ProcessStep[]
}

export interface FeaturedProjectsSection {
  type: 'featured_projects'
  title?: string
  subtitle?: string
  cta_label?: string
  cta_url?: string
}

export interface ContactSection {
  type: 'contact'
  title?: string
  image_url?: string
  address?: string
  email?: string
  phone?: string
  map_embed?: string
}

export interface EmbedSection {
  type: 'embed'
  embed_code: string
  caption?: string
}

export type PageSection =
  | HeroSection
  | FeaturesSection
  | AboutSection
  | TestimonialsSection
  | CTASection
  | WhyUsSection
  | ProcessSection
  | FeaturedProjectsSection
  | ContactSection
  | EmbedSection

export interface Page {
  id: string
  slug: string
  title: string
  sections: PageSection[]
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  is_published: boolean
  updated_at: string
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  author_name: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Portfolio (optional module — see 004_portfolio.sql)
// ---------------------------------------------------------------------------

export interface Project {
  id: string
  slug: string
  title: string
  category: string | null
  description: string | null
  cover_image_url: string | null
  is_featured: boolean
  is_published: boolean
  year: number | null
  client_name: string | null
  created_at: string
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  url: string
  alt: string
  order: number
  created_at: string
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export interface ContactFormData {
  name: string
  email: string
  message: string
  [key: string]: string
}

export interface FormSubmission {
  id: string
  form_name: string
  data: Record<string, unknown>
  is_read: boolean
  submitted_at: string
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export interface Media {
  id: string
  filename: string
  url: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_at: string
}
