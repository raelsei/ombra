import { useEffect, type RefObject } from 'react'

/**
 * Reveals every `[data-reveal]` element inside `rootRef`.
 *  - Anything already in the first viewport is revealed immediately.
 *  - The rest are revealed on intersection (fade + rise + de-blur, or a
 *    mask-rise for elements that start at translateY(115%)).
 *  - A safety net force-reveals everything after 6s so nothing sticks hidden.
 *
 * `active` gates the first run so the reveal choreography plays *after* the
 * loader fades (matches the prototype), or fires straight away for reduced motion.
 * The reveal only mutates inline style, so it composes with each element's own
 * transition timing declared in JSX.
 */
export function useReveals(rootRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const show = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
      el.style.filter = 'none'
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px -8% 0px' },
    )

    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) show(el)
      else io.observe(el)
    })

    const safety = window.setTimeout(() => els.forEach(show), 6000)

    return () => {
      io.disconnect()
      window.clearTimeout(safety)
    }
  }, [rootRef, active])
}
