const EASE = 'cubic-bezier(.16,.84,.3,1)'

/** 01 · APPARITION — right-aligned slogan beat; heading dodges toward the figure. */
export function Apparition() {
  return (
    <section
      data-screen-label="Apparition"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '140px clamp(40px,7vw,120px)',
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 'clamp(20px,4vh,44px)',
          transform: 'translateX(calc((var(--mx) - 0.5) * 3vw))',
          transition: 'transform .6s ease-out',
        }}
      >
        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            transition: 'all .9s ease',
            fontSize: '10.5px',
            letterSpacing: '.34em',
            textTransform: 'uppercase',
            color: 'rgba(236,230,218,.5)',
            alignSelf: 'flex-start',
          }}
        >
          Statement
        </div>

        <div style={{ overflow: 'hidden', alignSelf: 'stretch' }}>
          <h2
            data-reveal=""
            style={{
              margin: 0,
              textAlign: 'right',
              transform: 'translateY(115%)',
              transition: `transform 1.2s ${EASE}`,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(44px,9vw,132px)',
              lineHeight: 0.9,
              letterSpacing: '-.035em',
              color: '#ECE6DA',
            }}
          >
            Silhouette
          </h2>
        </div>

        <p
          data-reveal=""
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            filter: 'blur(5px)',
            transition: 'all 1s ease',
            transitionDelay: '.2s',
            maxWidth: '440px',
            textAlign: 'right',
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.95,
            color: 'rgba(236,230,218,.6)',
          }}
        >
          Garments cut for the shape a figure leaves in a room once it has gone. Worn by no one, seen by all.
        </p>
      </div>
    </section>
  )
}
