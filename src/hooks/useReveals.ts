import { useEffect, type RefObject } from 'react'

/**
 * Reveals `[data-reveal]` elements inside `rootRef` as their rect enters the
 * viewport. `active` holds the first pass back until the loader has faded.
 *
 * A scroll-driven rect check rather than an IntersectionObserver, deliberately:
 * the mask-rise headings sit at `translateY(115%)` inside an `overflow: hidden`
 * wrapper, so an observer on the target measures an intersection ratio of zero
 * — ancestor clipping — and never fires for exactly the elements that matter.
 */
export function useReveals(rootRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    let pending = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    let raf = 0

    const detach = () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }

    const pass = () => {
      raf = 0
      const limit = window.innerHeight * 0.96
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top >= limit) return true
        el.style.opacity = '1'
        el.style.transform = 'none'
        el.style.filter = 'none'
        return false
      })
      if (pending.length === 0) detach()
    }

    // one rect pass per frame at most, however fast the scroll events arrive
    function schedule() {
      if (!raf) raf = requestAnimationFrame(pass)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    pass()

    return () => {
      detach()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [rootRef, active])
}
