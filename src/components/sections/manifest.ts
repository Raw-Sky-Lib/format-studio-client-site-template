// Section manifest — single source of truth for all editable section types.
// The client-portal reads this to generate its editor UI automatically.
// Rules:
//   - Every section type that exists in SectionRenderer must appear here.
//   - Every field the client should be able to edit must appear here.
//   - Field types: 'text' | 'textarea' | 'url' | 'image' | 'list'
//   - For 'list' fields, define the shape of each item under `item`.

export type ScalarFieldType = 'text' | 'textarea' | 'url' | 'image'

export interface ScalarField {
  type: ScalarFieldType
  label: string
  required?: boolean
  placeholder?: string
}

export interface ListField {
  type: 'list'
  label: string
  item: Record<string, ScalarField>
}

export type FieldDef = ScalarField | ListField

export interface SectionDef {
  label: string
  fields: Record<string, FieldDef>
}

export type SectionManifest = Record<string, SectionDef>

export const sectionManifest = {
  hero: {
    label: 'Hero',
    fields: {
      headline:    { type: 'text',     label: 'Headline',    required: true, placeholder: 'Your compelling headline' },
      subheadline: { type: 'textarea', label: 'Subheadline', placeholder: 'Supporting text beneath the headline' },
      cta_label:   { type: 'text',     label: 'Button text', placeholder: 'Get started' },
      cta_url:     { type: 'url',      label: 'Button URL',  placeholder: '/contact' },
      image_url:   { type: 'image',    label: 'Hero image' },
    },
  },

  features: {
    label: 'Features',
    fields: {
      title: { type: 'text', label: 'Heading', placeholder: 'Why choose us' },
      items: {
        type: 'list',
        label: 'Feature cards',
        item: {
          icon:        { type: 'text',     label: 'Icon name',   placeholder: 'star' },
          title:       { type: 'text',     label: 'Title',       required: true },
          description: { type: 'textarea', label: 'Description', required: true },
        },
      },
    },
  },

  about: {
    label: 'About',
    fields: {
      title:     { type: 'text',     label: 'Heading',   placeholder: 'About us' },
      body:      { type: 'textarea', label: 'Body text', required: true },
      image_url: { type: 'image',    label: 'Image' },
    },
  },

  testimonials: {
    label: 'Testimonials',
    fields: {
      title: { type: 'text', label: 'Heading', placeholder: 'What our clients say' },
      items: {
        type: 'list',
        label: 'Testimonials',
        item: {
          quote:      { type: 'textarea', label: 'Quote',       required: true },
          author:     { type: 'text',     label: 'Author name', required: true },
          role:       { type: 'text',     label: 'Role / company' },
          avatar_url: { type: 'image',    label: 'Avatar' },
        },
      },
    },
  },

  cta: {
    label: 'Call to Action',
    fields: {
      headline:     { type: 'text',     label: 'Headline',     required: true },
      subheadline:  { type: 'textarea', label: 'Subheadline' },
      button_label: { type: 'text',     label: 'Button text',  placeholder: 'Get in touch' },
      button_url:   { type: 'url',      label: 'Button URL',   placeholder: '/contact' },
    },
  },

  why_us: {
    label: 'Why Us',
    fields: {
      title:    { type: 'text',     label: 'Heading',  placeholder: 'Why work with us' },
      subtitle: { type: 'textarea', label: 'Subtitle' },
      items: {
        type: 'list',
        label: 'Reasons',
        item: {
          icon:        { type: 'text',     label: 'Icon (emoji or name)' },
          title:       { type: 'text',     label: 'Title',       required: true },
          description: { type: 'textarea', label: 'Description', required: true },
        },
      },
    },
  },

  process: {
    label: 'Process',
    fields: {
      title:    { type: 'text',     label: 'Heading',  placeholder: 'How we work' },
      subtitle: { type: 'textarea', label: 'Subtitle' },
      steps: {
        type: 'list',
        label: 'Steps',
        item: {
          number:      { type: 'text',     label: 'Step number', placeholder: '01' },
          title:       { type: 'text',     label: 'Title',       required: true },
          description: { type: 'textarea', label: 'Description', required: true },
        },
      },
    },
  },

  featured_projects: {
    label: 'Featured Projects (CTA)',
    fields: {
      title:     { type: 'text',     label: 'Heading',     placeholder: 'See our work' },
      subtitle:  { type: 'textarea', label: 'Subtitle' },
      cta_label: { type: 'text',     label: 'Button text', placeholder: 'View projects' },
      cta_url:   { type: 'url',      label: 'Button URL',  placeholder: '/work' },
    },
  },

  contact: {
    label: 'Contact',
    fields: {
      title:     { type: 'text',     label: 'Heading',   placeholder: 'Get in touch' },
      image_url: { type: 'image',    label: 'Image' },
      address:   { type: 'textarea', label: 'Address' },
      email:     { type: 'text',     label: 'Email' },
      phone:     { type: 'text',     label: 'Phone' },
      map_embed: { type: 'textarea', label: 'Map embed HTML', placeholder: '<iframe src="..." />' },
    },
  },

  embed: {
    label: 'Embed',
    fields: {
      embed_code: { type: 'textarea', label: 'Embed HTML', required: true, placeholder: '<iframe src="..." />' },
      caption:    { type: 'text',     label: 'Caption' },
    },
  },
} satisfies SectionManifest
