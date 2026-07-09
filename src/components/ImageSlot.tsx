import { useState } from 'react'

const BASE = import.meta.env.BASE_URL

interface Props {
  /** slot id — resolves to `/images/<id>.jpg` unless `src` is given */
  id: string
  alt: string
  /** empty-state label */
  placeholder: string
  /** optional explicit source, overriding the id convention */
  src?: string
}

/**
 * Production image slot. Renders the real photograph if one exists at
 * `public/images/<id>.jpg` (or an explicit `src`); otherwise shows a refined
 * empty well so the layout reads intentionally before the art is wired.
 * Drop correctly-named files into `public/images/` and they appear.
 */
export function ImageSlot({ id, alt, placeholder, src }: Props) {
  const [failed, setFailed] = useState(false)
  const resolved = src ?? `${BASE}images/${id}.jpg`

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {/* empty-state well (always behind the image) */}
      <div
        aria-hidden={!failed}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: '#0a0a0a',
        }}
      >
        <div style={{ position: 'relative', width: '20px', height: '20px', opacity: 0.4 }}>
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgba(236,230,218,.5)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(236,230,218,.5)',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '.28em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.34)',
          }}
        >
          {placeholder}
        </span>
      </div>

      {!failed && (
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(0)',
          }}
        />
      )}
    </div>
  )
}
