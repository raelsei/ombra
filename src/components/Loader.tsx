interface Props {
  hidden: boolean
}

export function Loader({ hidden }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#000',
        display: hidden ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'opacity .9s ease',
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(30px,7vw,72px)',
            letterSpacing: '.16em',
            paddingLeft: '.16em',
            color: '#ECE6DA',
          }}
        >
          OMBRA
        </div>
      </div>
      <div
        style={{
          width: '1px',
          height: '38px',
          background: 'rgba(236,230,218,.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--live)',
            animation: 'rmDrop 1.5s cubic-bezier(.7,0,.3,1) infinite',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '.4em',
          textTransform: 'uppercase',
          color: 'rgba(236,230,218,.45)',
          animation: 'rmPulse 1.8s ease-in-out infinite',
        }}
      >
        Summoning the figure
      </div>
    </div>
  )
}
