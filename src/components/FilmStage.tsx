import type { RefObject } from 'react'
import type { Motion } from '../hooks/useFilmStage'

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>
  glowRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  mode: Motion
}

const BASE = import.meta.env.BASE_URL

// contrast crushes compression noise so the footage's black merges with the
// page; brightness/opacity pull the figure off pure white and the sepia warms
// it toward the bone palette.
const FILM_FILTER = 'contrast(1.08) brightness(0.82) saturate(0) sepia(0.3) opacity(0.78)'

/** The film as a fixed backdrop at z1, beneath <main> at z3. */
export function FilmStage({ canvasRef, glowRef, videoRef, mode }: Props) {
  const filmLayer: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    filter: FILM_FILTER,
    transform: 'translateX(var(--film-x)) scale(var(--film-scale))',
    pointerEvents: 'none',
    zIndex: 1,
  }

  return (
    <>
      {/* frame-scrub renderer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ ...filmLayer, opacity: mode === 'scrub' ? 'var(--film-fade)' : 0 }}
      />

      {/* smooth-drift renderer (?motion=drift) */}
      <video
        ref={videoRef}
        aria-hidden="true"
        muted
        playsInline
        preload={mode === 'drift' ? 'auto' : 'none'}
        poster={`${BASE}film-poster.jpg`}
        style={{ ...filmLayer, objectFit: 'cover', opacity: mode === 'drift' ? 'var(--film-fade)' : 0 }}
      >
        <source src={`${BASE}film.mp4`} type="video/mp4" />
      </video>

      {/* light seep: a blurred, screen-blended copy of the film above the
          content at z4. Half-res — the heavy CSS blur does the diffusion. */}
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
          opacity: 'calc(0.5 * var(--film-fade))',
          filter: 'blur(clamp(28px,4vw,56px)) brightness(0.9) saturate(0) sepia(0.35)',
          transform: 'translateX(var(--film-x)) scale(1.08)',
        }}
      />

      {/* grain + vignette, above the film and below the content (z2) */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}
      >
        <div
          className="grainflicker"
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
