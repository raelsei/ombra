/** The ids below are written imperatively by the rAF loop in useFilmStage;
 *  the `0.00` / `--:--` / `--` values are only placeholders until it runs. */
export function StatusBar() {
  const dim = 'rgba(236,230,218,.8)'
  return (
    <>
      <div
        id="statusbar"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '16px clamp(18px,5vw,72px)',
          fontSize: '10px',
          letterSpacing: '.24em',
          textTransform: 'uppercase',
          color: 'rgba(236,230,218,.52)',
          textShadow: '0 1px 14px rgba(0,0,0,.8)',
        }}
      >
        <div id="stat-figure" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: 'var(--live)' }}>FIGURE</span>
          <span>
            X <span id="fig-x" style={{ color: dim }}>0.00</span>
          </span>
          <span>
            Y <span id="fig-y" style={{ color: dim }}>0.00</span>
          </span>
        </div>
        <div style={{ letterSpacing: '.28em' }}>
          <span id="scrub" style={{ color: 'rgba(236,230,218,.85)' }}>
            00:00
          </span>{' '}
          / <span id="dur">--:--</span>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span>
            <span id="idx-cur" style={{ color: 'rgba(236,230,218,.85)' }}>
              00
            </span>{' '}
            / <span id="idx-tot">--</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--live)' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--live)',
                animation: 'rmBlink 1.4s steps(1) infinite',
              }}
            />
            REC
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          height: '1px',
          background: 'rgba(236,230,218,.08)',
        }}
      >
        <div
          id="pbar"
          style={{
            height: '100%',
            width: '100%',
            background: 'var(--live)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
          }}
        />
      </div>
    </>
  )
}
