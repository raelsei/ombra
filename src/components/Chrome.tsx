import type { CSSProperties } from 'react'

const tick = (corner: 'tl' | 'tr' | 'bl' | 'br'): CSSProperties => {
  const line = '1px solid rgba(236,230,218,.35)'
  return {
    position: 'fixed',
    zIndex: 80,
    width: '9px',
    height: '9px',
    pointerEvents: 'none',
    top: corner[0] === 't' ? '22px' : undefined,
    bottom: corner[0] === 'b' ? '22px' : undefined,
    left: corner[1] === 'l' ? '22px' : undefined,
    right: corner[1] === 'r' ? '22px' : undefined,
    borderTop: corner[0] === 't' ? line : undefined,
    borderBottom: corner[0] === 'b' ? line : undefined,
    borderLeft: corner[1] === 'l' ? line : undefined,
    borderRight: corner[1] === 'r' ? line : undefined,
  }
}

const railBase: CSSProperties = {
  position: 'fixed',
  top: '50%',
  writingMode: 'vertical-rl',
  zIndex: 80,
  fontSize: '9.5px',
  letterSpacing: '.42em',
  textTransform: 'uppercase',
  color: 'rgba(236,230,218,.38)',
  pointerEvents: 'none',
  textShadow: '0 0 10px rgba(0,0,0,.9)',
}

/** Decorative frame: hairline inset border, corner ticks, rotated side rails. */
export function Chrome() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: '14px',
          zIndex: 80,
          border: '1px solid rgba(236,230,218,.10)',
          pointerEvents: 'none',
        }}
      />
      <div aria-hidden="true" style={tick('tl')} />
      <div aria-hidden="true" style={tick('tr')} />
      <div aria-hidden="true" style={tick('bl')} />
      <div aria-hidden="true" style={tick('br')} />

      <div
        id="rail-l"
        aria-hidden="true"
        style={{ ...railBase, left: '20px', transform: 'translateY(-50%) rotate(180deg)' }}
      >
        Maison OMBRA · Antwerp / Paris
      </div>
      <div
        id="rail-r"
        aria-hidden="true"
        style={{ ...railBase, right: '20px', transform: 'translateY(-50%)' }}
      >
        Apparition · Autumn·Winter 2026
      </div>
    </>
  )
}
