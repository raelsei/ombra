import { LOOKS } from '../../data'
import { ImageSlot } from '../ImageSlot'
import { GhostIndex } from '../GhostIndex'

const EASE = 'cubic-bezier(.16,.84,.3,1)'

export function Lookbook() {
  return (
    <section
      id="lookbook"
      data-screen-label="Lookbook"
      style={{
        position: 'relative',
        padding: 'clamp(120px,16vh,200px) clamp(20px,6.5vw,120px)',
      }}
    >
      <GhostIndex n="02" side="left" />
      <div style={{ position: 'relative', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: 'clamp(48px,7vh,90px)' }}>
          <div
            data-reveal=""
            style={{
              opacity: 0,
              transform: 'translateY(16px)',
              transition: 'all .8s ease',
              fontSize: '10.5px',
              letterSpacing: '.34em',
              textTransform: 'uppercase',
              color: 'var(--live)',
            }}
          >
            02 · Lookbook
          </div>
          <h2
            data-reveal=""
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              filter: 'blur(5px)',
              transition: 'all 1s ease',
              transitionDelay: '.08s',
              margin: 0,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(38px,7vw,104px)',
              lineHeight: 0.94,
              letterSpacing: '-.02em',
              mixBlendMode: 'difference',
            }}
          >
            In Motion
          </h2>
        </div>

        <div
          id="lookgrid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12,1fr)',
            gap: 'clamp(20px,2.2vw,34px)',
            alignItems: 'start',
          }}
        >
          {LOOKS.map((look, i) => (
            <figure
              key={look.id}
              className="card"
              data-reveal=""
              style={{
                opacity: 0,
                transform: 'translateY(38px)',
                filter: 'blur(6px)',
                transition: `all 1.05s ${EASE}`,
                transitionDelay: `${look.delay}s`,
                gridColumn: look.gridColumn,
                margin: look.margin,
              }}
            >
              <div
                className="well"
                data-parallax={[0.06, 0.11, 0.08, 0.13][i]}
                style={{ position: 'relative', aspectRatio: look.ratio, background: '#0a0a0a', overflow: 'hidden' }}
              >
                <ImageSlot id={look.id} alt={look.alt} placeholder={look.caption.split('·')[0].trim()} />
              </div>
              <figcaption
                className="cap-dim"
                style={{
                  marginTop: '14px',
                  fontSize: '10.5px',
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(236,230,218,.5)',
                }}
              >
                {look.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
