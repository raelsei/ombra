import { NAV_LINKS } from '../data'

/** Fixed top navigation. */
export function Nav() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // 3 equal-flanked columns → the middle menu is truly centred on the
        // viewport regardless of the logo / AW·26 widths.
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '24px',
        padding: '28px clamp(18px,5vw,72px)',
        textShadow: '0 1px 14px rgba(0,0,0,.75)',
      }}
    >
      <a
        href="#top"
        style={{
          justifySelf: 'start',
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: '16px',
          letterSpacing: '.46em',
          paddingLeft: '.46em',
          color: '#ECE6DA',
        }}
      >
        OMBRA
      </a>
      <nav
        id="topnav"
        aria-label="Primary"
        style={{
          justifySelf: 'center',
          display: 'flex',
          gap: 'clamp(18px,2.4vw,38px)',
          fontSize: '10.5px',
          letterSpacing: '.28em',
          textTransform: 'uppercase',
          color: 'rgba(236,230,218,.72)',
        }}
      >
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <div
        style={{
          justifySelf: 'end',
          fontSize: '10.5px',
          letterSpacing: '.3em',
          color: 'rgba(236,230,218,.55)',
          whiteSpace: 'nowrap',
        }}
      >
        AW·26
      </div>
    </header>
  )
}
