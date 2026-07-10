import { FOOTER_LINKS } from '../../data'

const EASE = 'cubic-bezier(.16,.84,.3,1)'

const eyebrow = {
  fontSize: '10.5px',
  letterSpacing: '.34em',
  textTransform: 'uppercase',
  color: 'var(--live)',
} as const

const fadeRise = (delay: string) =>
  ({
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'all .9s ease',
    transitionDelay: delay,
  }) as const

/** 05 · FOOTER — enquiries + maison nav, a wordmark signature, and a legal bar. */
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
        padding: 'clamp(100px,13vh,150px) clamp(20px,6.5vw,120px) 84px',
        background: 'linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.9) 42%)',
      }}
    >
      {/* enquiries */}
      <div
        style={{ maxWidth: '1300px', margin: '0 auto', width: '100%' }}
      >
        <div data-reveal="" style={{ ...fadeRise('0s'), maxWidth: '520px' }}>
          <div style={{ ...eyebrow, marginBottom: '20px' }}>Enquiries</div>
          <a
            href="mailto:studio@ombra.atelier"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(21px,2.6vw,34px)',
              letterSpacing: '-.01em',
              color: '#ECE6DA',
            }}
          >
            studio@ombra.atelier
          </a>
          <div
            style={{
              marginTop: '18px',
              fontSize: '11px',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'rgba(236,230,218,.5)',
            }}
          >
            By appointment · Antwerp / Paris
          </div>
        </div>
      </div>

      {/* wordmark signature */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div style={{ overflow: 'hidden', paddingBottom: '0.06em' }}>
          <h2
            data-reveal=""
            style={{
              margin: 0,
              transform: 'translateY(112%)',
              transition: `transform 1.2s ${EASE}`,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(42px,11.5vw,178px)',
              lineHeight: 0.9,
              letterSpacing: '.02em',
              paddingLeft: '.02em',
              color: '#ECE6DA',
              mixBlendMode: 'difference',
            }}
          >
            OMBRA
          </h2>
        </div>
      </div>

      {/* nav + legal bar */}
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
          paddingTop: '48px',
          borderTop: '1px solid rgba(236,230,218,.14)',
        }}
      >
        <nav
          aria-label="Footer"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px clamp(18px,2.4vw,34px)',
            fontSize: '11px',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.72)',
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
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(18px,2vw,30px)',
            fontSize: '10px',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.4)',
          }}
        >
          <span>© 2026 Maison OMBRA · Apparition AW26</span>
          <a href="#top" style={{ color: 'rgba(236,230,218,.5)' }}>
            Back to top ↑
          </a>
        </div>
      </div>
    </section>
  )
}
