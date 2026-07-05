// Single injected <style> tag for bridge-edit-mode visuals.
// Kept here (not a CSS module) so the bridge is fully self-contained — the
// template doesn't have to import any stylesheet to get correct edit visuals.

const STYLE_ID = '__editing_bridge_styles'

const CSS = `
.__bridge-editable {
  outline: 1px dashed rgba(0, 102, 255, 0.35);
  outline-offset: 2px;
  cursor: text;
  border-radius: 2px;
  transition: outline-color 0.12s ease;
}
.__bridge-editable:hover { outline-color: rgba(0, 102, 255, 0.6); }
.__bridge-editable:focus {
  outline: 2px solid rgba(0, 102, 255, 0.8);
  outline-offset: 2px;
  background: rgba(0, 102, 255, 0.04);
}
.__bridge-editable:empty::before {
  content: attr(data-placeholder);
  color: currentColor;
  opacity: 0.35;
  font-style: italic;
  pointer-events: none;
}
.__bridge-editable:empty:focus::before {
  content: '';
}

/* ─── Portal-driven selection outline (select mode) ───────────────────────── */
.__bridge-selected,
.__bridge-editable.__bridge-selected,
.__bridge-editable.__bridge-selected:focus {
  outline: 2px dashed rgba(0, 102, 255, 0.95) !important;
  outline-offset: 3px !important;
  background: rgba(0, 102, 255, 0.05) !important;
  border-radius: 3px;
}

.__bridge-editable-image-wrap {
  /*
    Positioning is driven by the component's own classes (relative inline-block
    by default; or an overridden layout via wrapClassName). Adding position /
    display here would lose to wrapClassName because this <style> tag is
    injected at runtime after Tailwind, so it wins specificity ties and stomps
    things like "absolute inset-0".
  */
  outline: 1px dashed rgba(0, 102, 255, 0.35);
  outline-offset: 2px;
  border-radius: 2px;
  transition: outline-color 0.12s ease;
}
.__bridge-editable-image-wrap:hover { outline-color: rgba(0, 102, 255, 0.6); }
.__bridge-change-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  border-radius: 6px;
  font: 500 12px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease;
  z-index: 2;
}
.__bridge-editable-image-wrap:hover .__bridge-change-image-btn { opacity: 1; }
.__bridge-change-image-btn:hover { background: rgba(0, 0, 0, 0.85); }

.__bridge-list { position: relative; }
.__bridge-list-item {
  position: relative;
  outline: 1px dashed transparent;
  outline-offset: 4px;
  transition: outline-color 0.12s ease;
}
.__bridge-list-item:hover { outline-color: rgba(0, 102, 255, 0.4); }
.__bridge-list-toolbar {
  position: absolute;
  top: -10px;
  right: 8px;
  display: none;
  gap: 4px;
  padding: 4px;
  background: #1c1c1a;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 2;
}
.__bridge-list-item:hover .__bridge-list-toolbar { display: inline-flex; }
.__bridge-list-toolbar button {
  background: transparent;
  border: none;
  color: #fff;
  font: 500 11px/1 system-ui, -apple-system, sans-serif;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.__bridge-list-toolbar button:hover { background: rgba(255, 255, 255, 0.12); }
.__bridge-editable-link {
  position: relative;
  /* No display default — caller's className drives layout (inline-flex / block / etc.). */
}

/* ─── URL badge — collapsed state, always visible while editing ───────────── */
.__bridge-url-badge {
  position: absolute;
  bottom: -10px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font: 600 10px/1 system-ui, -apple-system, sans-serif;
  letter-spacing: 0.02em;
  border-radius: 999px;
  cursor: pointer;
  max-width: 240px;
  white-space: nowrap;
  z-index: 3;
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
}
.__bridge-url-badge:hover { transform: translateY(-1px); }
.__bridge-url-badge--empty {
  background: #fff;
  border: 1.5px dashed rgba(0, 102, 255, 0.55);
  color: rgba(0, 102, 255, 0.95);
}
.__bridge-url-badge--empty:hover {
  background: rgba(0, 102, 255, 0.06);
  border-color: rgba(0, 102, 255, 0.85);
}
.__bridge-url-badge--set {
  background: rgba(28, 28, 26, 0.92);
  border: 1.5px solid rgba(28, 28, 26, 0.92);
  color: #fff;
}
.__bridge-url-badge--set:hover {
  background: rgba(0, 102, 255, 0.92);
  border-color: rgba(0, 102, 255, 0.92);
}
.__bridge-url-badge-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Backdrop — closes the panel on outside click ───────────────────────── */
.__bridge-url-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4;
  background: transparent;
  cursor: default;
}

/* ─── Editor panel — placed via inline style for viewport-aware positioning ──
   Width comes from the inline style too so the JS can reason about overflow. */
.__bridge-url-panel {
  position: fixed;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 14px 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  animation: __bridge-url-panel-in 0.14s ease-out;
  color: rgba(28, 28, 26, 0.9);
}
@keyframes __bridge-url-panel-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.__bridge-url-panel-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 700 9.5px/1 system-ui, -apple-system, sans-serif;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(28, 28, 26, 0.5);
}
.__bridge-url-input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font: 500 13px/1.3 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.92);
  background: #fff;
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.__bridge-url-input:focus {
  border-color: rgba(0, 102, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.14);
}
.__bridge-url-input::placeholder {
  color: rgba(28, 28, 26, 0.32);
}
.__bridge-url-panel-hint {
  margin: 0;
  font: 400 11px/1.4 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.5);
}
.__bridge-url-panel-hint code {
  font: 500 10.5px/1 ui-monospace, "SF Mono", Menlo, monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 5px;
  border-radius: 3px;
  color: rgba(28, 28, 26, 0.75);
}
.__bridge-url-panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 2px;
}
.__bridge-url-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  font: 600 11px/1 system-ui, -apple-system, sans-serif;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.__bridge-url-btn--ghost {
  background: transparent;
  color: rgba(28, 28, 26, 0.5);
}
.__bridge-url-btn--ghost:hover {
  color: rgba(28, 28, 26, 0.9);
  background: rgba(0, 0, 0, 0.04);
}
.__bridge-url-btn--primary {
  background: rgba(0, 102, 255, 0.92);
  color: #fff;
}
.__bridge-url-btn--primary:hover { background: rgba(0, 102, 255, 1); }

/* ─── Editable icon — whole icon clickable + tiny Pencil corner hint ─────── */
.__bridge-editable-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  outline: 1px dashed transparent;
  outline-offset: 4px;
  transition: outline-color 0.12s ease, background 0.12s ease;
}
.__bridge-editable-icon-wrap:hover {
  outline-color: rgba(0, 102, 255, 0.45);
  background: rgba(0, 102, 255, 0.04);
}
.__bridge-editable-icon-wrap:focus-visible {
  outline: 2px solid rgba(0, 102, 255, 0.85);
  outline-offset: 4px;
  background: rgba(0, 102, 255, 0.06);
}
.__bridge-editable-icon-hint {
  position: absolute;
  bottom: -7px;
  right: -8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(28, 28, 26, 0.92);
  color: #fff;
  border: 2px solid #fff;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.__bridge-editable-icon-wrap:hover .__bridge-editable-icon-hint,
.__bridge-editable-icon-wrap:focus-visible .__bridge-editable-icon-hint {
  opacity: 1;
  transform: scale(1);
}

.__bridge-icon-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4;
  background: transparent;
  cursor: default;
}
.__bridge-icon-panel {
  position: fixed;
  z-index: 5;
  display: flex;
  flex-direction: column;
  /* overflow:hidden clips the grid to the panel bounds so the scroll
     context on .__bridge-icon-grid actually works */
  overflow: hidden;
  padding: 10px 10px 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: rgba(28, 28, 26, 0.9);
  animation: __bridge-url-panel-in 0.14s ease-out;
}
.__bridge-icon-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 8px;
}
.__bridge-icon-panel-title {
  font: 700 9.5px/1 system-ui, -apple-system, sans-serif;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(28, 28, 26, 0.5);
}
.__bridge-icon-clear {
  font: 600 10px/1 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.45);
  background: transparent;
  border: 1px dashed rgba(28, 28, 26, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.__bridge-icon-clear:hover {
  color: rgba(28, 28, 26, 0.85);
  border-color: rgba(28, 28, 26, 0.5);
}

.__bridge-icon-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  margin-bottom: 8px;
  color: rgba(28, 28, 26, 0.4);
}
.__bridge-icon-search:focus-within {
  border-color: rgba(0, 102, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
  color: rgba(28, 28, 26, 0.7);
}
.__bridge-icon-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font: 500 12px/1.2 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.92);
}
.__bridge-icon-search input::placeholder { color: rgba(28, 28, 26, 0.32); }

.__bridge-icon-grid {
  flex: 1;
  /* min-height:0 lets a flex child shrink below its content height so that
     overflow-y:auto can create a real scroll context within the panel */
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-content: start;
  gap: 3px;
  padding: 2px;
}
.__bridge-icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fixed height (not aspect-ratio) — predictable in any flex/grid container */
  height: 44px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  cursor: pointer;
  color: rgba(28, 28, 26, 0.7);
  transition: background 0.1s ease, border-color 0.1s ease, color 0.1s ease;
}
.__bridge-icon-cell:hover {
  background: rgba(0, 102, 255, 0.07);
  border-color: rgba(0, 102, 255, 0.28);
  color: rgba(0, 102, 255, 0.95);
}
.__bridge-icon-cell--active {
  background: rgba(0, 102, 255, 0.13);
  border-color: rgba(0, 102, 255, 0.7);
  color: rgba(0, 102, 255, 1);
}
.__bridge-icon-empty {
  grid-column: 1 / -1;
  margin: 24px 0;
  text-align: center;
  font: 500 11px/1.4 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.4);
}
.__bridge-icon-cap-hint {
  grid-column: 1 / -1;
  margin: 8px 0 4px;
  text-align: center;
  font: 500 10px/1.4 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.35);
}

/* Picker tabs */
.__bridge-icon-tabs {
  display: flex;
  gap: 2px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  margin: 0 0 8px;
}
.__bridge-icon-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font: 600 10.5px/1 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.55);
  transition: background 0.1s ease, color 0.1s ease;
}
.__bridge-icon-tab:hover { color: rgba(28, 28, 26, 0.85); }
.__bridge-icon-tab--active {
  background: #fff;
  color: rgba(28, 28, 26, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* "Use" button inline in the search input (Emoji tab) */
.__bridge-icon-use {
  padding: 4px 10px;
  background: rgba(0, 102, 255, 0.92);
  color: #fff;
  border: none;
  border-radius: 5px;
  font: 600 10px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
}
.__bridge-icon-use:hover { background: rgba(0, 102, 255, 1); }

/* Emoji grid — bigger cells, 6 columns for one-row scan */
.__bridge-icon-grid--emoji {
  grid-template-columns: repeat(6, 1fr) !important;
}

/* SVG / URL form layouts */
.__bridge-icon-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 2px;
  flex: 1;
  min-height: 0;
}
.__bridge-icon-form-hint {
  margin: 0;
  font: 400 11px/1.5 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.55);
}
.__bridge-icon-form-hint code {
  font: 500 10.5px/1 ui-monospace, "SF Mono", Menlo, monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 1px 5px;
  border-radius: 3px;
  color: rgba(28, 28, 26, 0.75);
}
.__bridge-icon-textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font: 500 11px/1.4 ui-monospace, "SF Mono", Menlo, monospace;
  color: rgba(28, 28, 26, 0.9);
  background: #fff;
  outline: none;
  resize: vertical;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.__bridge-icon-textarea:focus {
  border-color: rgba(0, 102, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
}
.__bridge-icon-input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font: 500 12px/1.3 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.9);
  background: #fff;
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.__bridge-icon-input:focus {
  border-color: rgba(0, 102, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
}
.__bridge-icon-form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}
.__bridge-icon-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  color: rgba(28, 28, 26, 0.7);
}
.__bridge-icon-preview-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: rgba(28, 28, 26, 0.85);
}
.__bridge-icon-preview-box > svg { width: 100%; height: 100%; }
.__bridge-icon-preview-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.__bridge-icon-form-cta {
  padding: 8px 14px;
  background: rgba(0, 102, 255, 0.92);
  color: #fff;
  border: none;
  border-radius: 7px;
  font: 600 11px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
  transition: background 0.12s ease;
}
.__bridge-icon-form-cta:hover:not(:disabled) { background: rgba(0, 102, 255, 1); }
.__bridge-icon-form-cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.__bridge-list-add {
  /*
    grid-column: 1 / -1 makes the button span the full row when the parent
    is a CSS Grid (e.g. features/testimonials with grid-cols-3). On non-grid
    parents this property is silently ignored, so the centered margin still
    applies.
  */
  grid-column: 1 / -1;
  margin: 12px auto 0;
  display: block;
  padding: 8px 14px;
  background: transparent;
  color: rgba(0, 102, 255, 0.85);
  border: 1px dashed rgba(0, 102, 255, 0.5);
  border-radius: 6px;
  font: 500 12px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
}
.__bridge-list-add:hover {
  background: rgba(0, 102, 255, 0.06);
  border-color: rgba(0, 102, 255, 0.8);
}

/* Icon set selector — pill row at the top of the Library tab */
.__bridge-icon-set-row {
  display: flex;
  gap: 3px;
  padding: 3px 0 6px;
}
.__bridge-icon-set-btn {
  flex: 1;
  padding: 5px 4px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font: 600 10px/1 system-ui, -apple-system, sans-serif;
  color: rgba(28, 28, 26, 0.55);
  cursor: pointer;
  transition: background 0.1s ease, border-color 0.1s ease, color 0.1s ease;
}
.__bridge-icon-set-btn:hover {
  color: rgba(28, 28, 26, 0.85);
  border-color: rgba(0, 0, 0, 0.22);
  background: rgba(0, 0, 0, 0.03);
}
.__bridge-icon-set-btn--active {
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.55);
  color: rgba(0, 102, 255, 1);
}
`

export function injectBridgeStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
