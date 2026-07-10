import { COLLECTION } from '../../data'
import { ImageSlot } from '../ImageSlot'

const EASE = 'cubic-bezier(.16,.84,.3,1)'

/** 02 · COLLECTION — "Six Objects". auto-fit grid of garment studies. */
export function Collection() {
  return (
    <section
      id="collection"
      data-screen-label="Collection"
      style={{
        position: 'relative',
        padding: 'clamp(120px,16vh,200px) clamp(40px,7vw,120px)',
        background:
          'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.86) 12%, rgba(0,0,0,.86) 88%, rgba(0,0,0,.35))',
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '24px',
            borderBottom: '1px solid rgba(236,230,218,.14)',
            paddingBottom: '30px',
            marginBottom: 'clamp(44px,6vh,76px)',
          }}
        >
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
                marginBottom: '18px',
              }}
            >
              01 · The Collection
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
              }}
            >
              Six Pieces
            </h2>
          </div>
          <p
            data-reveal=""
            style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'all .9s ease',
              transitionDelay: '.15s',
              maxWidth: '340px',
              margin: '0 0 6px',
              fontSize: '12.5px',
              lineHeight: 1.9,
              color: 'rgba(236,230,218,.55)',
            }}
          >
            A wardrobe for the space between presence and its trace. Photographed in motion, never at rest.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 'clamp(22px,2.4vw,40px)',
          }}
        >
          {COLLECTION.map((item) => (
            <article
              key={item.id}
              data-reveal=""
              style={{
                opacity: 0,
                transform: 'translateY(34px)',
                filter: 'blur(6px)',
                transition: `all 1s ${EASE}`,
                transitionDelay: `${item.delay}s`,
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '3/4', background: '#0a0a0a', overflow: 'hidden' }}>
                <ImageSlot id={item.id} alt={`${item.name} — ${item.alt}`} placeholder={`Piece ${item.index}`} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginTop: '14px',
                  fontSize: '10.5px',
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: 'rgba(236,230,218,.78)' }}>
                  {item.index} · {item.name}
                </span>
                <span style={{ color: 'rgba(236,230,218,.34)' }}>{item.material}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
