// Dispatches a PageSection to the correct section component.
// To add a new section type:
//   1. Create src/components/sections/XxxSection.tsx
//   2. Add the type to PageSection in src/types/content.ts
//   3. Add a case here

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
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />
    case 'features':
      return <FeaturesSection section={section} />
    case 'about':
      return <AboutSection section={section} />
    case 'testimonials':
      return <TestimonialsSection section={section} />
    case 'cta':
      return <CTASection section={section} />
    default:
      return null
  }
}
