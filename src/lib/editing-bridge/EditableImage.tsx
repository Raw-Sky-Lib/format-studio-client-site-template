'use client'

// <EditableImage path="hero.image_url" src={url} alt="…" render={…} />
// In production: renders only the children (or default <img>) — no wrapper.
// In edit mode: wraps with a click target + "Change" affordance. Click posts
// REQUEST_MEDIA_PICKER with the image's bounding rect so the portal can anchor
// its MediaPicker popover.

import { ImageIcon } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useBridgeRegisterPath, useBridgeSend, useEditMode } from './provider'
import { PROTOCOL_VERSION } from './types'

interface EditableImageProps {
  path: string
  src: string | null | undefined
  alt?: string
  /**
   * Optional renderer for the production image. Use this to keep next/image
   * (or any framework wrapper) in the tree:
   *   render={({ src, alt }) => <Image src={src} alt={alt} fill />}
   * If omitted, a plain <img> is used.
   */
  render?: (args: { src: string; alt: string }) => ReactNode
  /**
   * Extra classes appended to the bridge's wrap div in edit mode. Use this when
   * the parent container expects the image to fill it (e.g. an aspect-ratio
   * div with a next/image `fill`): `wrapClassName="absolute inset-0"`.
   * In production (inert mode) the wrap doesn't render, so this is ignored.
   */
  wrapClassName?: string
}

export function EditableImage({ path, src, alt = '', render, wrapClassName }: EditableImageProps) {
  const { active } = useEditMode()
  const send = useBridgeSend()
  const registerPath = useBridgeRegisterPath()
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => registerPath(path), [path, registerPath])

  const image = src
    ? render
      ? render({ src, alt })
      : <img src={src} alt={alt} />
    : null

  if (!active) {
    return <>{image}</>
  }

  return (
    <div
      ref={wrapRef}
      className={
        // When the caller passes wrapClassName (e.g. "absolute inset-0" for a
        // next/image fill setup), use it verbatim and DON'T add our default
        // "relative inline-block" — those would conflict with the caller's
        // positioning. The Change button still anchors correctly because
        // wrapClassName is expected to establish a positioning context.
        wrapClassName
          ? `__bridge-editable-image-wrap ${wrapClassName}`
          : '__bridge-editable-image-wrap relative inline-block'
      }
      data-path={path}
    >
      {image}
      <button
        type="button"
        className="__bridge-change-image-btn"
        onClick={() => {
          const rect = wrapRef.current?.getBoundingClientRect()
          send({
            type: 'REQUEST_MEDIA_PICKER',
            protocolVersion: PROTOCOL_VERSION,
            path,
            currentUrl: src ?? null,
            anchorRect: rect
              ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
              : { top: 0, left: 0, width: 0, height: 0 },
          })
        }}
      >
        <ImageIcon size={12} />
        {src ? 'Change' : 'Add image'}
      </button>
    </div>
  )
}
