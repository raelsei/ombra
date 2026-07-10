import type { RefObject } from 'react'
import type { Motion } from '../hooks/useFilmStage'

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>
  glowRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  mode: Motion
}

const BASE = import.meta.env.BASE_URL

// contrast crushes compression noise in the blacks so the footage's black
// background merges with the page. brightness + opacity soften the figure off
// pure-white, and a touch of sepia warms it toward the bone palette so it sits
// in the theme rather than glaring white.
const FILM_FILTER = 'contrast(1.08) brightness(0.82) saturate(0) sepia(0.3) opacity(0.78)'

/**
 * The film as a fixed BACKDROP (z-index 1, beneath <main> at z3): the figure
 * lives in the page's negative space, and the content's translucent panels and
 * photography pass over it — the stage recedes, the collection leads.
 *
 * The inversion signature survives at the typographic level: the big display
 * headings carry `mix-blend-mode: difference`, so wherever the bright figure
 * walks behind them the letters flip dark — a quiet echo of the negative
 * instead of a full-page effect.
 */
export function FilmStage({ canvasRef, glowRef, videoRef, mode }: Props) {
  const filmLayer: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    filter: FILM_FILTER,
    transform: 'scale(1.04)',
    transition: 'opacity .6s ease',
    pointerEvents: 'none',
    zIndex: 1,
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

      {/* LIGHT SEEP — a blurred, screen-blended copy of the film ABOVE the
          content (z4): where the figure walks behind a panel or a photograph,
          its light bleeds through like a lamp behind fabric. Quarter-res canvas;
          the heavy CSS blur does the diffusion. */}
      <canvas
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 4,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.5,
          filter: 'blur(clamp(28px,4vw,56px)) brightness(0.9) saturate(0) sepia(0.35)',
          transform: 'scale(1.08)',
        }}
      />

      {/* grain + vignette ride above the film, below the content (z2) */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}
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
