import type { RefObject } from 'react'
import type { Motion } from '../hooks/useFilmStage'

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  mode: Motion
}

const BASE = import.meta.env.BASE_URL

// contrast crushes compression noise in the blacks so the footage's black
// background reads as true 0 (under `difference` = "no change"). brightness +
// opacity soften the figure off pure-white, and a touch of sepia warms it toward
// the bone palette so it sits in the theme rather than glaring white.
const FILM_FILTER = 'contrast(1.06) brightness(0.78) saturate(0) sepia(0.3) opacity(0.62)'

/**
 * The film composited OVER the content with `mix-blend-mode: difference`.
 *
 * Because the ground is pure black:
 *  - over empty black areas the figure reads white (|white − black| = white) —
 *    the same "masked figure floats on black" look,
 *  - over any image, heading, caption or panel, the figure INVERTS it in the
 *    figure's own shape (a travelling negative) — exactly "the model turns what
 *    it passes over to opposite colours".
 *
 * It sits at z-index 5 (above <main> z3) but below the chrome (frame z80,
 * nav/status z100), so the fixed UI stays untouched and readable. A subtle
 * grain + vignette ride above it; there is no soft glow or tracking lens.
 */
export function FilmStage({ canvasRef, videoRef, mode }: Props) {
  const filmLayer: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    filter: FILM_FILTER,
    transform: 'scale(1.04)',
    transition: 'opacity .6s ease',
    mixBlendMode: 'difference',
    pointerEvents: 'none',
    zIndex: 5,
  }

  return (
    <>
      {/* frame-scrub renderer */}
      <canvas ref={canvasRef} aria-hidden="true" style={{ ...filmLayer, opacity: mode === 'scrub' ? 1 : 0 }} />

      {/* smooth-drift renderer */}
      <video
        ref={videoRef}
        aria-hidden="true"
        muted
        playsInline
        preload={mode === 'drift' ? 'auto' : 'none'}
        poster={`${BASE}film-poster.jpg`}
        style={{ ...filmLayer, objectFit: 'cover', opacity: mode === 'drift' ? 1 : 0 }}
      >
        <source src={`${BASE}film.webm`} type="video/webm" />
        <source src={`${BASE}film.mp4`} type="video/mp4" />
      </video>

      {/* grain + vignette ride above the film for cinematic texture (z6, below chrome) */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 6, pointerEvents: 'none', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '150px 150px',
            mixBlendMode: 'overlay',
            opacity: 'calc(0.05 * var(--grain))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(125% 95% at 50% 42%, transparent 58%, rgba(0,0,0,.4) 100%)',
          }}
        />
      </div>
    </>
  )
}
