const EASE = 'cubic-bezier(.16,.84,.3,1)'

const maskLine = (delay: string, color?: string) => ({
  display: 'block',
  transform: 'translateY(115%)',
  transition: `transform 1.15s ${EASE}`,
  transitionDelay: delay,
  ...(color ? { color } : {}),
})

/** 00 · HERO — heading dodges horizontally away from the figure (--mx). */
export function Hero() {
  return (
    <section
      data-screen-label="Hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px clamp(40px,7vw,120px) 140px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'min(1100px,86vw)',
          height: '70vh',
          background: 'radial-gradient(60% 55% at 40% 50%, rgba(0,0,0,.62), transparent 72%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          transform: 'translateX(calc((0.5 - var(--mx)) * 2.4vw))',
          transition: 'transform .5s ease-out',
        }}
      >
        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            filter: 'blur(5px)',
            transition: `opacity 1s ${EASE}, transform 1s ${EASE}, filter 1s ease`,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '10.5px',
            letterSpacing: '.34em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.6)',
            marginBottom: 'clamp(24px,4vh,48px)',
          }}
        >
          <span style={{ width: '26px', height: '1px', background: 'var(--live)', display: 'inline-block' }} />
          Conceptual Couture — Antwerp / Paris
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(46px,11.5vw,172px)',
            lineHeight: 0.9,
            letterSpacing: '-.02em',
            color: '#ECE6DA',
          }}
        >
          <span style={{ display: 'block', overflow: 'hidden' }}>
            <span data-reveal="" style={maskLine('0s')}>
              The Body
            </span>
          </span>
          <span style={{ display: 'block', overflow: 'hidden' }}>
            <span data-reveal="" style={maskLine('.09s', 'rgba(236,230,218,.55)')}>
              Is Only
            </span>
          </span>
          <span style={{ display: 'block', overflow: 'hidden' }}>
            <span data-reveal="" style={maskLine('.18s')}>
              A Rumour
            </span>
          </span>
        </h1>

        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            filter: 'blur(5px)',
            transition: 'all 1s ease',
            transitionDelay: '.35s',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px 26px',
            marginTop: 'clamp(28px,4.5vh,56px)',
            fontSize: '11px',
            letterSpacing: '.28em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.55)',
          }}
        >
          <span>APPARITION</span>
          <span style={{ color: 'rgba(236,230,218,.3)' }}>—</span>
          <span>Autumn·Winter 2026</span>
          <span style={{ color: 'rgba(236,230,218,.3)' }}>—</span>
          <span>Edition of Few</span>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '64px',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          opacity: 'calc(1 - var(--p)*7)',
          fontSize: '9.5px',
          letterSpacing: '.34em',
          textTransform: 'uppercase',
          color: 'rgba(236,230,218,.5)',
        }}
      >
        <span>Scroll to summon</span>
        <span style={{ width: '1px', height: '44px', background: 'linear-gradient(180deg, var(--live), transparent)' }} />
      </div>
    </section>
  )
}
