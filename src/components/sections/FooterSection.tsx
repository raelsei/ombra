import { FOOTER_LINKS } from '../../data'

const EASE = 'cubic-bezier(.16,.84,.3,1)'

/** 05 · FOOTER — closing line, giant OMBRA wordmark, links. */
export function FooterSection() {
  return (
    <section
      data-screen-label="Footer"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(100px,14vh,160px) clamp(40px,7vw,120px) 90px',
        background: 'linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.9) 40%)',
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all .9s ease',
            fontSize: '11px',
            letterSpacing: '.3em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.5)',
            marginBottom: 'clamp(30px,5vh,60px)',
          }}
        >
          Nothing to wear. Everything to become.
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h2
            data-reveal=""
            style={{
              margin: 0,
              transform: 'translateY(112%)',
              transition: `transform 1.2s ${EASE}`,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(64px,22vw,340px)',
              lineHeight: 0.82,
              letterSpacing: '.02em',
              color: '#ECE6DA',
              mixBlendMode: 'difference',
            }}
          >
            OMBRA
          </h2>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '24px',
          paddingTop: '60px',
          borderTop: '1px solid rgba(236,230,218,.14)',
        }}
      >
        <nav
          aria-label="Footer"
          style={{
            display: 'flex',
            gap: '26px',
            fontSize: '10.5px',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.7)',
          }}
        >
          {FOOTER_LINKS.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.38)',
            textAlign: 'right',
          }}
        >
          © 2026 OMBRA · Apparition AW26
          <br />
          All figures imagined
        </div>
      </div>
    </section>
  )
}
