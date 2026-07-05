#!/usr/bin/env bash
#
# upgrade-editing-bridge.sh
# Bring a STALE client clone (bootstrapped before the inline-editing bridge existed)
# up to the current editing surface. Run from the template repo root.
#
#   Usage:  scripts/upgrade-editing-bridge.sh <path-to-client-clone>
#
# It syncs the client-agnostic editing surface as a SET (partial ports are the #1
# cause of "the editor half-works" — e.g. the pickers dying because the legacy
# PortalBridge lacks the ?portal=edit stand-down guard). It does NOT touch files
# that carry per-client design (layout.tsx fonts, globals.css) — those get manual
# steps printed at the end.
#
set -euo pipefail

TEMPLATE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:?Usage: $0 <path-to-client-clone>}"
TARGET="$(cd "$TARGET" && pwd)"
[ -d "$TARGET/src" ] || { echo "error: '$TARGET' has no src/ — not a client site repo"; exit 1; }

echo "Template : $TEMPLATE_ROOT"
echo "Target   : $TARGET"
echo

# --- Directories synced wholesale (pure infra + section components) ---
for d in \
  src/lib/editing-bridge \
  src/lib/icons \
  src/components/sections
do
  rm -rf "${TARGET:?}/$d"
  mkdir -p "$(dirname "$TARGET/$d")"
  cp -R "$TEMPLATE_ROOT/$d" "$TARGET/$d"
  echo "  synced dir   $d/"
done

# --- Individual client-agnostic files ---
for f in \
  src/contexts/preview-context.tsx \
  src/components/layout/PortalBridge.tsx \
  src/types/content.ts
do
  cp "$TEMPLATE_ROOT/$f" "$TARGET/$f"
  echo "  synced file  $f"
done

# --- Icon dependencies (EditableIcon needs these; a stale clone lacks them) ---
echo
echo "Installing icon dependencies in target..."
( cd "$TARGET" && pnpm add \
    @heroicons/react@^2.2.0 \
    @phosphor-icons/react@^2.1.10 \
    @tabler/icons-react@^3.44.0 \
    lucide-react@^1.14.0 )

cat <<'EOF'

──────────────────────────────────────────────────────────────────────────
MANUAL STEPS (files carrying per-client design were NOT overwritten):

1. src/app/layout.tsx — mount the provider around the existing tree:
     import { EditingBridgeProvider } from '@/lib/editing-bridge'
     ...
     <EditingBridgeProvider>
       <PreviewProvider>
         <PortalBridge />
         {children}
       </PreviewProvider>
     </EditingBridgeProvider>
   (Keep the client's next/font wiring on <html>.)

2. If any section component was visually customized for this client, re-apply
   those tweaks — but prefer moving per-client styling into globals.css tokens.

3. Restart the dev server so the new deps + client components load:
     rm -rf .next && pnpm dev

Then open the portal editor under ?portal=edit and confirm the icon picker,
image picker (REQUEST_MEDIA_PICKER), and link/button editors all respond.
──────────────────────────────────────────────────────────────────────────
EOF
