// Wire-level message types for the editing bridge.
// See /Users/dagi/Documents/Github/Matt x Dagim/Client-Management/.claude/EDITING-BRIDGE.md
// Both sides (portal + this template) must conform to these shapes verbatim.

export const PROTOCOL_VERSION = 1 as const

// Lifecycle states the provider can be in.
//   inert                  – no edit-mode request; module is a no-op
//   inert-not-embedded     – ?portal=edit set, but window is top-level (e.g. someone visited the URL directly)
//   awaiting-activation    – embedded + ?portal=edit, BRIDGE_READY sent, waiting for PORTAL_ACTIVATE
//   active                 – portal handshake accepted; editing UI is on
export type BridgeStatus =
  | 'inert'
  | 'inert-not-embedded'
  | 'awaiting-activation'
  | 'active'

export interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export type ListOp =
  | { kind: 'add'; index: number }
  | { kind: 'remove'; index: number }
  | { kind: 'reorder'; from: number; to: number }

export interface Manifest {
  protocolVersion: typeof PROTOCOL_VERSION
  sectionsRendered: string[]
  editablePaths: string[]
}

// Iframe → Portal
export type BridgeOutbound =
  | { type: 'BRIDGE_READY';         protocolVersion: typeof PROTOCOL_VERSION; manifest: Manifest }
  | { type: 'FIELD_CHANGE';         protocolVersion: typeof PROTOCOL_VERSION; path: string; value: string }
  | { type: 'REQUEST_MEDIA_PICKER'; protocolVersion: typeof PROTOCOL_VERSION; path: string; currentUrl: string | null; anchorRect: Rect }
  | { type: 'LIST_OP';              protocolVersion: typeof PROTOCOL_VERSION; path: string; op: ListOp }
  | { type: 'SECTION_FOCUS';        protocolVersion: typeof PROTOCOL_VERSION; sectionType: string; anchorRect?: Rect }
  | { type: 'SECTION_TOGGLE';       protocolVersion: typeof PROTOCOL_VERSION; sectionType: string; visible: boolean }
  | { type: 'FIELD_FOCUS';          protocolVersion: typeof PROTOCOL_VERSION; path: string; anchorRect: Rect }
  | { type: 'FIELD_BLUR';           protocolVersion: typeof PROTOCOL_VERSION; path: string }

// What the portal can mark as selected for the in-page dashed outline.
export type SelectionTarget =
  | { kind: 'section'; sectionType: string }
  | { kind: 'field';   path: string }
  | { kind: 'none' }

// Portal → Iframe. `sections` typed as unknown[] at the protocol boundary; consumers cast after light validation.
export type BridgeInbound =
  | { type: 'PORTAL_ACTIVATE';        protocolVersion: typeof PROTOCOL_VERSION }
  | { type: 'PORTAL_DEACTIVATE';      protocolVersion: typeof PROTOCOL_VERSION }
  | { type: 'PORTAL_UPDATE_SECTIONS'; protocolVersion: typeof PROTOCOL_VERSION; sections: unknown[] }
  | { type: 'PORTAL_SCROLL_TO';       protocolVersion: typeof PROTOCOL_VERSION; sectionType: string }
  | { type: 'PORTAL_FOCUS_FIELD';     protocolVersion: typeof PROTOCOL_VERSION; path: string }
  | { type: 'PORTAL_SET_SELECTION';   protocolVersion: typeof PROTOCOL_VERSION; target: SelectionTarget }
