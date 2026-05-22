// Dispatches a PageSection to the correct section component.
// To add a new section type:
//   1. Create src/components/sections/XxxSection.tsx  (accept id?: string, put it on <section>)
//   2. Add the type to PageSection in src/types/content.ts
//   3. Add a case here passing id={section.type}
//   4. Add the section type + fields to manifest.ts (required for portal editor UI)

import type { PageSection } from '@/types/content'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import AboutSection from './AboutSection'
import TestimonialsSection from './TestimonialsSection'
import CTASection from './CTASection'

interface SectionRendererProps {
  section: PageSection
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  // section.type === the JSONB key (e.g. 'hero') — used as the HTML id so the
  // portal CMS can postMessage PORTAL_SCROLL_TO and land on the right element.
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} id={section.type} />
    case 'features':
      return <FeaturesSection section={section} id={section.type} />
    case 'about':
      return <AboutSection section={section} id={section.type} />
    case 'testimonials':
      return <TestimonialsSection section={section} id={section.type} />
    case 'cta':
      return <CTASection section={section} id={section.type} />
    default:
      return null
  }
}
