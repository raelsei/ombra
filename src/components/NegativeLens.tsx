/**
 * Figure-tracking negative lens — the signature "negative" motion.
 *
 * A fixed, pointer-transparent layer at z-index 4: above <main> (z3) so it
 * composites over both the film (z1) and the content, but below the chrome
 * (frame z80, nav/status z100) which therefore stays untouched and readable.
 *
 * `mix-blend-mode: difference` + a soft white ellipse centred on the eased
 * figure centroid (--mx/--my). Inside the ellipse the composite inverts: the
 * black ground reads white, the pale figure reads dark — a travelling negative
 * pocket that follows the model as it walks the page. Strength is gated by
 * presence (--mp) and the instruments flag (--instr), and eased upstream in the
 * rAF loop, so it fades in only where a real figure is on screen.
 *
 * Hidden entirely under prefers-reduced-motion (see index.css).
 */
export function NegativeLens() {
  return (
    <div
      id="negative-lens"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
        mixBlendMode: 'difference',
        opacity: 'calc(min(0.62, var(--mp) * 3.4) * var(--instr))',
        background:
          'radial-gradient(22vmin 42vmin at calc(var(--mx)*100%) calc(var(--my)*100%), rgba(255,255,255,.74) 0%, rgba(255,255,255,.42) 24%, transparent 60%)',
        willChange: 'opacity, background',
      }}
    />
  )
}
