import { HOUSE_SPECS, HOUSE_PORTRAIT_ALT } from '../../data'
import { ImageSlot } from '../ImageSlot'

const EASE = 'cubic-bezier(.16,.84,.3,1)'

const bodyPara = (delay: string) =>
  ({
    opacity: 0,
    transform: 'translateY(20px)',
    filter: 'blur(4px)',
    transition: 'all 1s ease',
    transitionDelay: delay,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 400,
    fontSize: 'clamp(15px,1.4vw,19px)',
    lineHeight: 1.72,
    color: 'rgba(236,230,218,.82)',
  }) as const

/** 04 · HOUSE — portrait + manifesto + spec list. */
export function House() {
  return (
    <section
      id="house"
      data-screen-label="House"
      style={{
        position: 'relative',
        padding: 'clamp(120px,16vh,200px) clamp(40px,7vw,120px)',
        background:
          'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.84) 14%, rgba(0,0,0,.84) 86%, rgba(0,0,0,.35))',
      }}
    >
      <div
        id="housegrid"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
          gap: 'clamp(40px,6vw,96px)',
          alignItems: 'center',
        }}
      >
        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: 'translateY(38px)',
            filter: 'blur(6px)',
            transition: `all 1.1s ${EASE}`,
          }}
        >
          <div style={{ position: 'relative', aspectRatio: '3/4', background: '#0a0a0a', overflow: 'hidden' }}>
            <ImageSlot id="rom-house-portrait" alt={HOUSE_PORTRAIT_ALT} placeholder="Campaign portrait" />
          </div>
        </div>

        <div>
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
              marginBottom: '22px',
            }}
          >
            03 — The House
          </div>
          <h2
            data-reveal=""
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              filter: 'blur(5px)',
              transition: 'all 1s ease',
              transitionDelay: '.06s',
              margin: '0 0 clamp(28px,4vh,46px)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(32px,5vw,72px)',
              lineHeight: 1,
              letterSpacing: '-.02em',
              mixBlendMode: 'difference',
            }}
          >
            Light, and its absence.
          </h2>
          <p data-reveal="" style={{ ...bodyPara('.12s'), margin: '0 0 22px' }}>
            OMBRA is a study in disappearance. Each garment begins where the body ends — cut for the silhouette a
            figure leaves in a room once it has gone.
          </p>
          <p data-reveal="" style={{ ...bodyPara('.18s'), margin: '0 0 clamp(34px,5vh,54px)' }}>
            The house works in a single palette. One collection a year, released in editions of few, photographed in
            motion — never still.
          </p>
          <dl
            data-reveal=""
            style={{
              opacity: 0,
              transform: 'translateY(18px)',
              transition: 'all .9s ease',
              transitionDelay: '.24s',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '14px 30px',
              margin: 0,
              borderTop: '1px solid rgba(236,230,218,.14)',
              paddingTop: '26px',
              fontSize: '11px',
              letterSpacing: '.16em',
              textTransform: 'uppercase',
            }}
          >
            {HOUSE_SPECS.map((s) => (
              <div key={s.term} style={{ display: 'contents' }}>
                <dt style={{ color: 'rgba(236,230,218,.4)' }}>{s.term}</dt>
                <dd style={{ margin: 0, color: 'rgba(236,230,218,.82)' }}>
                  {s.href ? <a href={s.href}>{s.value}</a> : s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
