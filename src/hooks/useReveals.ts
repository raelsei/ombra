import { useEffect, type RefObject } from 'react'

/**
 * Reveals `[data-reveal]` elements inside `rootRef` on intersection.
 * Anything already in the first viewport is shown at once — the observer alone
 * would leave above-the-fold content hidden until the first scroll.
 * The 6s timeout is a safety net so nothing stays invisible if a callback never
 * fires. `active` holds the first run back until the loader has faded.
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
