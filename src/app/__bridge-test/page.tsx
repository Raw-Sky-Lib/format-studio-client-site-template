'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Test harness for the editing bridge. Visit /__bridge-test in dev to:
//   - Embed the template at /?portal=edit in an iframe (simulating the portal)
//   - Send PORTAL_ACTIVATE / PORTAL_DEACTIVATE / PORTAL_UPDATE_SECTIONS / etc.
//   - See messages the iframe posts back (BRIDGE_READY, FIELD_CHANGE, …)
//
// This page is intentionally crude — it's a development tool, not a polished UI.
// Safe in production builds (it doesn't expose any data), but you can route-guard
// it behind NODE_ENV if you'd rather not ship it. For v1 we leave it in.

import { useEffect, useRef, useState } from 'react'

const SAMPLE_SECTIONS = [
  {
    type: 'hero',
    headline: 'Hello from the harness',
    subheadline: 'Edited live via PORTAL_UPDATE_SECTIONS',
    cta_label: 'Click me',
    cta_url: '#',
    // image_url intentionally omitted — picsum.photos isn't in next.config and
    // testing image swap is better done against your real hero image anyway.
  },
  {
    type: 'features',
    title: 'Features',
    items: [
      { icon: 'sparkles', title: 'First feature', description: 'Bridge-driven content' },
      { icon: 'zap',      title: 'Second feature', description: 'Hot-swapped without reload' },
    ],
  },
  {
    type: 'about',
    title: 'About harness',
    body: '<p>This body is rendered via <code>dangerouslySetInnerHTML</code>. Inline editing of rich text is deferred to v1.1; the title above is contentEditable.</p>',
  },
  {
    type: 'testimonials',
    title: 'What people say',
    items: [
      { quote: 'Bridge makes the editor feel native.', author: 'A. Tester', role: 'Reviewer' },
      { quote: 'No more clicking and waiting.',        author: 'B. Tester', role: 'Reviewer' },
    ],
  },
  {
    type: 'cta',
    headline: 'Ready to start?',
    subheadline: 'Try the bridge today.',
    button_label: 'Go',
    button_url: '#',
  },
]

type LogEntry = { dir: 'in' | 'out'; ts: string; data: unknown }

export default function BridgeTestPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [sections, setSections] = useState<unknown[]>(SAMPLE_SECTIONS)

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'object') return
      if (typeof (e.data as any).type !== 'string') return
      if (!(e.data as any).type.toString().match(/^(BRIDGE|FIELD|REQUEST|LIST|SECTION)/)) return
      setLog(prev => [{ dir: 'in' as const, ts: new Date().toLocaleTimeString(), data: e.data }, ...prev].slice(0, 50))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  function send(msg: Record<string, unknown>) {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
    setLog(prev => [{ dir: 'out' as const, ts: new Date().toLocaleTimeString(), data: msg }, ...prev].slice(0, 50))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100vh', font: '14px/1.4 system-ui' }}>
      <iframe
        ref={iframeRef}
        src="/?portal=edit"
        style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
        title="Template under test"
      />

      <aside style={{ borderLeft: '1px solid #e5e5e5', padding: '14px', overflowY: 'auto', background: '#fafafa' }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>Bridge test harness</h2>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#666' }}>
          Iframe loads <code>/?portal=edit</code>. Use the buttons below to simulate the portal.
        </p>

        <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
          <button onClick={() => send({ type: 'PORTAL_ACTIVATE', protocolVersion: 1 })} style={btn}>
            PORTAL_ACTIVATE
          </button>
          <button onClick={() => send({ type: 'PORTAL_DEACTIVATE', protocolVersion: 1 })} style={btn}>
            PORTAL_DEACTIVATE
          </button>
          <button
            onClick={() => send({ type: 'PORTAL_UPDATE_SECTIONS', protocolVersion: 1, sections })}
            style={btn}
          >
            PORTAL_UPDATE_SECTIONS (sample)
          </button>
          <button
            onClick={() => send({ type: 'PORTAL_SCROLL_TO', protocolVersion: 1, sectionType: 'features' })}
            style={btn}
          >
            PORTAL_SCROLL_TO &quot;features&quot;
          </button>
          <button
            onClick={() => send({ type: 'PORTAL_FOCUS_FIELD', protocolVersion: 1, path: 'hero.headline' })}
            style={btn}
          >
            PORTAL_FOCUS_FIELD &quot;hero.headline&quot;
          </button>
        </div>

        <details style={{ marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Sample sections (editable JSON)</summary>
          <textarea
            value={JSON.stringify(sections, null, 2)}
            onChange={(e) => {
              try { setSections(JSON.parse(e.target.value)) } catch { /* keep typing */ }
            }}
            rows={10}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: 11, padding: 6 }}
          />
        </details>

        <h3 style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700 }}>Message log</h3>
        <div style={{ display: 'grid', gap: 4 }}>
          {log.length === 0 && <p style={{ fontSize: 11, color: '#999' }}>No messages yet.</p>}
          {log.map((entry, i) => (
            <pre key={i} style={{
              margin: 0,
              padding: 6,
              fontSize: 10,
              background: entry.dir === 'in' ? '#eef6ff' : '#fff8e7',
              borderLeft: `3px solid ${entry.dir === 'in' ? '#3b82f6' : '#d97706'}`,
              borderRadius: 2,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowX: 'auto',
            }}>
              <span style={{ color: '#999' }}>{entry.ts} · {entry.dir === 'in' ? '← iframe' : '→ iframe'}</span>
              {'\n'}
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          ))}
        </div>
      </aside>
    </div>
  )
}

const btn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '6px 10px',
  background: '#1c1c1a',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'monospace',
}
