import type { RefObject } from 'react'
import type { Motion } from '../hooks/useFilmStage'

interface Props {
  canvasRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  mode: Motion
}

const BASE = import.meta.env.BASE_URL

// contrast crushes compression noise in the blacks so the footage's black
// background disappears into the page and only the bright figure reads.
const FILM_FILTER = 'contrast(1.14) brightness(1.03) saturate(0)'

/**
 * Fixed, full-viewport film stage (z-index 1). Pure black so the footage's
 * black background merges with the UI — "masked" figure. Holds both renderers:
 * a <canvas> (frame-scrub) and a <video> (smooth-drift); the active one is
 * cross-faded by the engine. Decorative — hidden from the a11y tree.
 */
export function FilmStage({ canvasRef, videoRef, mode }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        background: '#000',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* frame-scrub renderer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: FILM_FILTER,
          transform: 'scale(1.04)',
          transition: 'opacity .6s ease',
          opacity: mode === 'scrub' ? 1 : 0,
        }}
      />
      {/* smooth-drift renderer */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload={mode === 'drift' ? 'auto' : 'none'}
        poster={`${BASE}film-poster.jpg`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: FILM_FILTER,
          transform: 'scale(1.04)',
          transition: 'opacity .6s ease',
          opacity: mode === 'drift' ? 1 : 0,
        }}
      >
        <source src={`${BASE}film.webm`} type="video/webm" />
        <source src={`${BASE}film.mp4`} type="video/mp4" />
      </video>

      {/* SVG-turbulence grain, overlay-blended */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '150px 150px',
          mixBlendMode: 'overlay',
          opacity: 'calc(0.06 * var(--grain))',
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(125% 95% at 50% 40%, transparent 38%, rgba(0,0,0,.5) 82%, rgba(0,0,0,.85) 100%)',
        }}
      />
      {/* figure-tracking spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'screen',
          opacity: 'calc(var(--mp) * .55 * var(--instr))',
          background:
            'radial-gradient(24vw 24vw at calc(var(--mx)*100%) calc(var(--my)*100%), rgba(169,180,192,.12), transparent 68%)',
        }}
      />
      {/* figure-tracking eyeline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'calc(var(--my)*100%)',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, var(--live) 22%, var(--live) 78%, transparent)',
          opacity: 'calc(var(--mp) * .5 * var(--instr))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: 'calc(var(--mx)*100%)',
            width: '1px',
            height: '11px',
            background: 'var(--live)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-16px',
            left: 'calc(var(--mx)*100%)',
            transform: 'translateX(8px)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '9px',
            letterSpacing: '.2em',
            color: 'var(--live)',
            whiteSpace: 'nowrap',
          }}
        >
          FIGURE
        </div>
      </div>
    </div>
  )
}
