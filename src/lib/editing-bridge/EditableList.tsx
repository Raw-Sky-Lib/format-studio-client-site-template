'use client'

// <EditableList path="testimonials.items" className="grid grid-cols-3 gap-8">
//   {items.map((t, i) => <Card key={i} {...t} />)}
// </EditableList>
//
// className is applied to the outer container in BOTH modes, so layout (e.g.
// CSS Grid) doesn't break in active mode. In inert mode the wrapper is a plain
// div; in active mode it ALSO carries `__bridge-list` and each child gets
// wrapped with a floating toolbar (⊕ add below, ✕ delete). The wrappers become
// the grid items themselves, preserving layout.
//
// Reorder via drag is reserved (LIST_OP { kind: 'reorder' }) but the UI lands
// when @dnd-kit is wired in CP-11 era.

import { Children, useEffect, type ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { useBridgeRegisterPath, useBridgeSend, useEditMode } from './provider'
import { PROTOCOL_VERSION } from './types'

interface EditableListProps {
  path: string
  children: ReactNode
  /**
   * Applied to the outer container in BOTH modes. Use this to put grid/flex
   * classes on the list itself instead of an extra wrapping div — that extra
   * div would break grid layout in active mode (only the list's direct
   * children become grid items).
   */
  className?: string
}

export function EditableList({ path, children, className }: EditableListProps) {
  const { active } = useEditMode()
  const send = useBridgeSend()
  const registerPath = useBridgeRegisterPath()

  useEffect(() => registerPath(path), [path, registerPath])

  if (!active) {
    return <div className={className}>{children}</div>
  }

  const items = Children.toArray(children)
  const listClass = `__bridge-list${className ? ' ' + className : ''}`

  return (
    <div className={listClass} data-path={path}>
      {items.map((child, i) => (
        <div key={i} className="__bridge-list-item">
          {child}
          <div className="__bridge-list-toolbar">
            <button
              type="button"
              title="Add item below"
              onClick={() =>
                send({
                  type: 'LIST_OP',
                  protocolVersion: PROTOCOL_VERSION,
                  path,
                  op: { kind: 'add', index: i + 1 },
                })
              }
            >
              <Plus size={11} />
              Add
            </button>
            <button
              type="button"
              title="Remove item"
              onClick={() =>
                send({
                  type: 'LIST_OP',
                  protocolVersion: PROTOCOL_VERSION,
                  path,
                  op: { kind: 'remove', index: i },
                })
              }
            >
              <X size={11} />
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="__bridge-list-add"
        onClick={() =>
          send({
            type: 'LIST_OP',
            protocolVersion: PROTOCOL_VERSION,
            path,
            op: { kind: 'add', index: items.length },
          })
        }
      >
        + Add item
      </button>
    </div>
  )
}
