'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Pipette, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { rgbToHex } from '@/lib/color'

const LOUPE_SIZE = 128 // on-screen px size of the magnifier loupe
const ZOOM = 8 // magnification factor
const SAMPLE = LOUPE_SIZE / ZOOM // source px sampled per side around the pointer (16)

interface ColorEyedropperProps {
  /** The raw image URL to sample from (data URI or original remote URL - NOT a Next/Image optimizer URL). */
  imageUrl: string
  onPick: (hex: string) => void
  disabled?: boolean
}

/**
 * A subtle button that opens a canvas-based eyedropper overlay on top of the
 * photo it's attached to. While active, moving the pointer over the photo
 * live-previews the pixel color under the cursor in a magnified loupe (with
 * a crosshair on the exact pixel under the cursor) WITHOUT changing the pick.
 * Releasing the pointer (a click, or a press-drag-release to fine-tune
 * against the loupe first) locks in that pixel as the candidate color;
 * "OK" then confirms it.
 */
export function ColorEyedropper({ imageUrl, onPick, disabled }: ColorEyedropperProps) {
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<string | null>(null)
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Mirrors the photo onto a same-size canvas, replicating the `object-cover`
  // crop so on-canvas pixels line up 1:1 with what's visually shown.
  const drawSource = useCallback((): CanvasRenderingContext2D | null => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!container || !canvas || !img || !img.complete || !img.naturalWidth) return null

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const containerRatio = rect.width / rect.height
    const imgRatio = iw / ih

    let sx = 0, sy = 0, sw = iw, sh = ih
    if (imgRatio > containerRatio) {
      sw = ih * containerRatio
      sx = (iw - sw) / 2
    } else {
      sh = iw / containerRatio
      sy = (ih - sh) / 2
    }

    try {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
      return ctx
    } catch {
      setError("Can't read colors from this photo (blocked by the browser).")
      return null
    }
  }, [])

  const drawLoupe = useCallback((ctx: CanvasRenderingContext2D, px: number, py: number) => {
    const loupeCanvas = loupeCanvasRef.current
    const lctx = loupeCanvas?.getContext('2d')
    if (!loupeCanvas || !lctx) return

    const half = Math.floor(SAMPLE / 2)
    let data: ImageData
    try {
      data = ctx.getImageData(px - half, py - half, SAMPLE, SAMPLE)
    } catch {
      setError("Can't read colors from this photo (blocked by the browser).")
      return
    }

    const tmp = document.createElement('canvas')
    tmp.width = SAMPLE
    tmp.height = SAMPLE
    const tctx = tmp.getContext('2d')
    if (!tctx) return
    tctx.putImageData(data, 0, 0)

    lctx.imageSmoothingEnabled = false
    lctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE)
    lctx.drawImage(tmp, 0, 0, SAMPLE, SAMPLE, 0, 0, LOUPE_SIZE, LOUPE_SIZE)

    // Crosshair outlining the exact center pixel that will be picked.
    const cell = LOUPE_SIZE / SAMPLE
    lctx.lineWidth = 2
    lctx.strokeStyle = 'white'
    lctx.strokeRect(LOUPE_SIZE / 2 - cell / 2, LOUPE_SIZE / 2 - cell / 2, cell, cell)
    lctx.lineWidth = 1
    lctx.strokeStyle = 'black'
    lctx.strokeRect(LOUPE_SIZE / 2 - cell / 2, LOUPE_SIZE / 2 - cell / 2, cell, cell)
  }, [])

  // Moves the loupe to live-preview the pixel under the cursor WITHOUT
  // changing the committed candidate - so casually hovering (or dragging
  // before release) never silently overwrites the color that's actually kept.
  const previewAtCss = useCallback((cssX: number, cssY: number) => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const px = Math.floor(cssX * dpr)
    const py = Math.floor(cssY * dpr)

    setLoupePos({ x: cssX, y: cssY })
    drawLoupe(ctx, px, py)
  }, [drawLoupe])

  // Locks in the pixel under the cursor as the committed candidate. Only
  // called on pointer release, so a click (or a press-drag-release to aim
  // via the loupe first) is what determines the kept color - not wherever
  // the mouse happens to end up drifting to afterwards.
  const commitAtCss = useCallback((cssX: number, cssY: number) => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const px = Math.floor(cssX * dpr)
    const py = Math.floor(cssY * dpr)

    try {
      const { data } = ctx.getImageData(px, py, 1, 1)
      setCandidate(rgbToHex(data[0], data[1], data[2]))
      setLoupePos({ x: cssX, y: cssY })
      drawLoupe(ctx, px, py)
    } catch {
      setError("Can't read colors from this photo (blocked by the browser).")
    }
  }, [drawLoupe])

  // Load the image fresh (not reusing the <Image> preview) so we control
  // crossOrigin ourselves, then draw it and preview the center pixel as a
  // sensible default - a PREVIEW only, so simply opening the tool never
  // commits a pick on its own; the user still has to click/release to keep one.
  useEffect(() => {
    if (!active) return

    setLoading(true)
    setError(null)
    setCandidate(null)
    setLoupePos(null)

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setLoading(false)
      drawSource()
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) previewAtCss(rect.width / 2, rect.height / 2)
    }
    img.onerror = () => {
      setLoading(false)
      setError('Could not load this photo for color picking.')
    }
    img.src = imageUrl

    return () => {
      imgRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- previewAtCss/drawSource intentionally excluded to avoid re-loading the image on every render
  }, [active, imageUrl])

  useEffect(() => {
    if (!active) return
    const onResize = () => drawSource()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active, drawSource])

  const close = useCallback(() => {
    setActive(false)
    setCandidate(null)
    setLoupePos(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, close])

  const cssCoordsFromEvent = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      cssX: Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1),
      cssY: Math.min(Math.max(e.clientY - rect.top, 0), rect.height - 1),
    }
  }, [])

  // Pressing down previews and captures the pointer (so a drag that leaves
  // the canvas bounds still reports move/up back to it) - it does NOT commit
  // yet, leaving the loupe free to fine-tune the exact pixel before release.
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || error) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const { cssX, cssY } = cssCoordsFromEvent(e)
    previewAtCss(cssX, cssY)
  }, [error, cssCoordsFromEvent, previewAtCss])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || error) return
    const { cssX, cssY } = cssCoordsFromEvent(e)
    previewAtCss(cssX, cssY)
  }, [error, cssCoordsFromEvent, previewAtCss])

  // Releasing is what actually commits - a plain click previews and commits
  // at essentially the same spot, while a press-drag-release lets the loupe
  // guide you to the exact pixel before it's locked in.
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || error) return
    const { cssX, cssY } = cssCoordsFromEvent(e)
    commitAtCss(cssX, cssY)
  }, [error, cssCoordsFromEvent, commitAtCss])

  const confirm = useCallback(() => {
    if (candidate) onPick(candidate)
    close()
  }, [candidate, onPick, close])

  const loupeStyle = (() => {
    if (!loupePos) return undefined
    const cw = containerRef.current?.clientWidth ?? 0
    const margin = 16
    let left = loupePos.x + margin
    let top = loupePos.y - LOUPE_SIZE - margin
    if (left + LOUPE_SIZE > cw) left = loupePos.x - LOUPE_SIZE - margin
    if (left < 0) left = margin
    if (top < 0) top = loupePos.y + margin
    return { left, top }
  })()

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        disabled={disabled}
        onClick={() => setActive(true)}
        title="Pick exact color from photo"
        aria-label="Pick exact color from photo"
        className="absolute bottom-2 right-2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm"
      >
        <Pipette className="h-4 w-4" />
      </Button>

      {active && (
        <div ref={containerRef} className="absolute inset-0 z-20 overflow-hidden rounded-xl">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setLoupePos(null)}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center">
              <p className="text-sm text-white">{error}</p>
              <Button type="button" size="sm" variant="secondary" onClick={close}>
                Close
              </Button>
            </div>
          )}

          {!error && loupePos && (
            <canvas
              ref={loupeCanvasRef}
              width={LOUPE_SIZE}
              height={LOUPE_SIZE}
              className="pointer-events-none absolute rounded-full border-2 border-white shadow-lg"
              style={loupeStyle}
            />
          )}

          {!error && !loading && (
            <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-lg bg-black/70 p-2 backdrop-blur-sm">
              <div
                className="h-8 w-8 shrink-0 rounded-full border-2 border-white"
                style={{ backgroundColor: candidate ?? 'transparent' }}
              />
              <span className="flex-1 truncate font-mono text-xs text-white">
                {candidate ?? 'Click on the photo to pick a color'}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white hover:bg-white/20 hover:text-white"
                onClick={close}
                title="Cancel"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="h-7 w-7"
                disabled={!candidate}
                onClick={confirm}
                title="Confirm color"
                aria-label="Confirm color"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
