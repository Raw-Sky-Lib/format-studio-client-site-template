'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  // When resetKey changes, a previously-errored boundary retries — lets the
  // portal editor recover a section once its content is fixed live via the
  // bridge, without a full reload.
  resetKey?: string
}

interface State {
  hasError: boolean
}

// Catches render errors from a single section so one malformed section degrades
// to `fallback` (nothing on the public site) instead of taking down the whole
// page. Section content reaches these components from Supabase, the portal
// editor, and AI applies — any of which can produce an incomplete shape (e.g. a
// section missing its `items` array). This is the backstop that keeps a bad or
// half-formed section from 500-ing the entire route.
export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
