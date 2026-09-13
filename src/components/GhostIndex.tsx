import type { CSSProperties } from 'react'

/** zIndex 0 keeps the numeral below section content, which paints above it via
 *  its own position:relative wrapper. */
export function GhostIndex({ n, side }: { n: string; side: 'left' | 'right' }) {
  const style: CSSProperties = {
    position: 'absolute',
    top: 'clamp(0px,2vh,30px)',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(150px,26vw,380px)',
    lineHeight: 0.75,
    letterSpacing: '-.04em',
    color: 'rgba(236,230,218,.05)',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 0,
  }
  if (side === 'left') style.left = 'clamp(4px,2vw,40px)'
  else style.right = 'clamp(4px,2vw,40px)'

  return (
    <div aria-hidden="true" style={style}>
      {n}
    </div>
  )
}
