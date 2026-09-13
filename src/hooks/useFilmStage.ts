import { useEffect, useRef, type RefObject } from 'react'
import meta from '../frames-meta.json'

export type Motion = 'scrub' | 'drift'

/** [x, y] of the bright figure's luminance centroid, 0–1, one per frame. */
type Centroid = [number, number]

const CENTROIDS = meta.centroids as Centroid[]
const FRAME_COUNT = meta.count
const DURATION = meta.count / meta.fps
const BASE = import.meta.env.BASE_URL

const frameUrl = (i: number) => `${BASE}frames/${String(i + 1).padStart(3, '0')}.jpg`

interface Opts {
  mode: Motion
  /** drift idle playback rate */
  baseSpeed: number
  reduced: boolean
  showFigureData: boolean
  canvasRef: RefObject<HTMLCanvasElement | null>
  glowRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  onReady: () => void
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const fmt2 = (n: number) => (n < 0 ? '-' : '') + Math.abs(n).toFixed(2)
const mmss = (s: number) => {
  s = Math.max(0, s || 0)
  return (
    String(Math.floor(s / 60)).padStart(2, '0') +
    ':' +
    String(Math.floor(s % 60)).padStart(2, '0')
  )
}

/**
 * The film engine: one requestAnimationFrame loop that writes CSS custom
 * properties on <html> plus a few textContent updates, so nothing re-renders.
 *
 * scrub  — draw the nearest pre-decoded frame to <canvas>; centroid from the
 *          build-time lookup.
 * drift  — the <video> plays natively, scroll velocity ramps playbackRate;
 *          centroid sampled live from a 48×27 offscreen canvas.
 * reduced — freeze on a still frame, no rAF; chrome updates on scroll only.
 */
export function useFilmStage(opts: Opts) {
  const { mode, reduced, canvasRef, glowRef, videoRef } = opts

  // live refs: config that must not tear down and re-init the loop
  const showFigRef = useRef(opts.showFigureData)
  showFigRef.current = opts.showFigureData
  const baseSpeedRef = useRef(opts.baseSpeed)
  baseSpeedRef.current = opts.baseSpeed
  const onReadyRef = useRef(opts.onReady)
  onReadyRef.current = opts.onReady

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const root = document.documentElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // StatusBar renders these ids; the loop writes them imperatively.
    const figX = document.getElementById('fig-x'),
      figY = document.getElementById('fig-y'),
      scrubEl = document.getElementById('scrub'),
      durEl = document.getElementById('dur'),
      idxCur = document.getElementById('idx-cur'),
      idxTot = document.getElementById('idx-tot'),
      pbar = document.getElementById('pbar')
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-screen-label]'))
    if (idxTot) idxTot.textContent = String(sections.length).padStart(2, '0')
    if (durEl) durEl.textContent = mmss(DURATION)

    // The film belongs to the opening: it fades in over the first screen of
    // scroll and back out as the Collection rises. Keyed to the Collection's
    // live viewport position rather than a pixel offset, so it survives resize.
    const collectionEl = document.getElementById('collection')
    const smooth = (t: number) => t * t * (3 - 2 * t)
    const writeFilmFade = () => {
      const vh = window.innerHeight || 1
      const vw = window.innerWidth || 1
      const fadeIn = smooth(clamp(window.scrollY / (vh * 0.6), 0, 1))
      let fadeOut = 1
      if (collectionEl) {
        const top = collectionEl.getBoundingClientRect().top
        fadeOut = clamp((top - vh * 0.4) / (vh * 0.9), 0, 1)
      }
      root.style.setProperty('--film-fade', Math.min(fadeIn, fadeOut).toFixed(3))
      root.style.setProperty('--film-x', ((1 - fadeIn) * vw * 0.11).toFixed(1) + 'px')
    }

    let mx = 0.5,
      my = 0.5
    let progress = 0
    let lastY = window.scrollY
    let scrollVel = 0
    let rate: number | null = null
    let floatFrame = 0
    let lastIdx = -1
    let trailHeat = 0
    let lastScale = 1.04
    let disposed = false

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const glow = glowRef.current
    const gctx = glow ? glow.getContext('2d') : null
    let curImg: HTMLImageElement | null = null
    const sizeCanvas = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      if (glow) {
        // half-res: the CSS blur erases any detail anyway
        glow.width = Math.round(window.innerWidth * 0.5)
        glow.height = Math.round(window.innerHeight * 0.5)
      }
    }
    const drawCoverTo = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      src: HTMLImageElement | HTMLVideoElement,
      sw: number,
      sh: number,
    ) => {
      if (!sw || !sh) return
      const s = Math.max(w / sw, h / sh)
      c.drawImage(src, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s)
    }
    const drawImageCover = (img: HTMLImageElement) => {
      drawCoverTo(ctx, canvas.width, canvas.height, img, img.naturalWidth, img.naturalHeight)
      // the glow gets a plain stamp, never the trail — the light that seeps
      // through the content follows the figure, not its ghosts
      if (gctx && glow) drawCoverTo(gctx, glow.width, glow.height, img, img.naturalWidth, img.naturalHeight)
      curImg = img
    }
    sizeCanvas()

    const images: HTMLImageElement[] = []
    let readyFired = false
    const fireReady = () => {
      if (readyFired || disposed) return
      readyFired = true
      onReadyRef.current()
    }

    // Frames stream in but are never force-decoded — that would pin ~2MB of
    // RGBA per frame in RAM. drawImage decodes on demand against the browser's
    // bounded cache, and readiness fires on frame 0 so the loader clears early.
    const preloadAll = () => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image()
        img.decoding = 'async'
        images[i] = img
        img.addEventListener(
          'load',
          () => {
            if (i === 0 && !curImg) {
              drawImageCover(img)
              fireReady()
            }
          },
          { once: true },
        )
        img.src = frameUrl(i)
      }
    }

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight || 1
      progress = clamp(window.scrollY / max, 0, 1)
    }

    const writeChrome = (curTime: number) => {
      root.style.setProperty('--mx', mx.toFixed(4))
      root.style.setProperty('--p', progress.toFixed(4))

      const showFig = showFigRef.current
      if (figX) figX.textContent = showFig ? fmt2(mx) : '—'
      if (figY) figY.textContent = showFig ? fmt2(my) : '—'
      if (scrubEl) scrubEl.textContent = mmss(curTime)

      const mid = window.scrollY + window.innerHeight * 0.5
      let cur = 0
      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].getBoundingClientRect().top + window.scrollY
        if (top <= mid) cur = i
      }
      if (idxCur) idxCur.textContent = String(cur).padStart(2, '0')
      if (pbar) pbar.style.transform = 'scaleX(' + progress.toFixed(4) + ')'
    }

    // reduced motion — one still frame, no rAF; chrome follows scroll only
    if (reduced) {
      const first = new Image()
      first.src = frameUrl(0)
      first.decode().catch(() => {}).finally(() => {
        drawImageCover(first)
        fireReady()
      })
      const rmFailsafe = window.setTimeout(fireReady, 2600)
      const c0 = CENTROIDS[0]
      mx = c0[0]
      my = c0[1]
      const onScroll = () => {
        readScroll()
        writeFilmFade()
        writeChrome(progress * DURATION)
      }
      const onResize = () => {
        sizeCanvas()
        if (curImg) drawImageCover(curImg)
        onScroll()
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)
      onScroll()
      return () => {
        disposed = true
        window.clearTimeout(rmFailsafe)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
      }
    }

    // offscreen sampler for the live drift centroid
    const sc = document.createElement('canvas')
    sc.width = 48
    sc.height = 27
    const sctx = sc.getContext('2d', { willReadFrequently: true })

    let detachVideo: (() => void) | null = null
    if (mode === 'scrub') {
      preloadAll()
    } else {
      if (video) {
        video.preload = 'auto'
        video.loop = true
        try {
          video.load()
        } catch {
          /* noop */
        }
        const onCanPlay = () => {
          fireReady()
          const pr = video.play()
          if (pr && pr.catch) pr.catch(() => {})
        }
        video.addEventListener('canplay', onCanPlay)
        video.addEventListener('loadeddata', onCanPlay)
        detachVideo = () => {
          video.removeEventListener('canplay', onCanPlay)
          video.removeEventListener('loadeddata', onCanPlay)
        }
      }
    }
    // reveal the page even if decode or preload stalls
    const failsafe = window.setTimeout(fireReady, 2600)

    const onResize = () => {
      sizeCanvas()
      if (curImg) drawImageCover(curImg)
    }
    window.addEventListener('resize', onResize)

    // [data-parallax] media drifts relative to the viewport centre. The
    // already-applied translate is subtracted before measuring, so the fixed
    // point stays the untransformed layout position.
    const plxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    const plxApplied = new WeakMap<HTMLElement, number>()
    const parallaxPass = () => {
      const vh = window.innerHeight
      for (const el of plxEls) {
        const speed = parseFloat(el.dataset.parallax || '0')
        if (!speed) continue
        const r = el.getBoundingClientRect()
        const cur = plxApplied.get(el) || 0
        const rawMid = r.top + r.height / 2 - cur
        const target = -(rawMid - vh / 2) * speed
        el.style.transform = `translateY(${target.toFixed(1)}px)`
        plxApplied.set(el, target)
      }
    }

    const loop = () => {
      if (disposed) return
      readScroll()

      const y = window.scrollY
      const dY = y - lastY
      lastY = y
      scrollVel = scrollVel * 0.86 + Math.abs(dY) * 0.14

      let tx = 0.5,
        ty = 0.5
      let curTime = 0

      if (mode === 'scrub') {
        const fTarget = progress * (FRAME_COUNT - 1)
        floatFrame = lerp(floatFrame, fTarget, 0.2)
        const idx = clamp(Math.round(floatFrame), 0, FRAME_COUNT - 1)
        const img = images[idx]

        // Apparition trail: each frame the canvas is dimmed by a
        // velocity-dependent veil, then the current frame is stamped with
        // `lighten`, so only the bright figure accumulates. Fast scroll → thin
        // veil → long trail. At rest the ghosts dissolve in under a second.
        const velNorm = Math.min(1, scrollVel / 48)
        trailHeat = Math.max(velNorm, trailHeat * 0.94)
        if (trailHeat > 0.02) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = `rgba(0,0,0,${(0.26 - 0.2 * trailHeat).toFixed(3)})`
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          if (img && img.naturalWidth) {
            ctx.globalCompositeOperation = 'lighten'
            drawImageCover(img)
            ctx.globalCompositeOperation = 'source-over'
          }
          lastIdx = -1 // force one clean stamp once the trail settles
        } else if (idx !== lastIdx) {
          if (img && img.naturalWidth) drawImageCover(img)
          lastIdx = idx
        }

        // the stage inhales slightly while the figure moves
        const scale = 1.04 + trailHeat * 0.02
        if (Math.abs(scale - lastScale) > 0.0005) {
          root.style.setProperty('--film-scale', scale.toFixed(4))
          lastScale = scale
        }
        curTime = progress * DURATION
        const c = CENTROIDS[idx]
        tx = c[0]
        ty = c[1]
      } else {
        // native playback; scroll velocity ramps the rate instead of seeking
        const boost = Math.min(3.4, scrollVel * 0.06)
        const target = baseSpeedRef.current + boost
        rate = rate == null ? target : lerp(rate, target, 0.06)
        if (video && readyFired) {
          try {
            video.playbackRate = clamp(rate, 0.1, 6)
          } catch {
            /* noop */
          }
          curTime = video.currentTime || 0
          if (gctx && glow && video.videoWidth)
            drawCoverTo(gctx, glow.width, glow.height, video, video.videoWidth, video.videoHeight)
          // live luminance centroid
          if (sctx && video.videoWidth) {
            try {
              sctx.drawImage(video, 0, 0, sc.width, sc.height)
              const d = sctx.getImageData(0, 0, sc.width, sc.height).data
              let wsum = 0,
                xsum = 0,
                ysum = 0
              const TH = 62
              for (let py = 0; py < sc.height; py++)
                for (let px = 0; px < sc.width; px++) {
                  const i = (py * sc.width + px) * 4
                  const l = (d[i] + d[i + 1] + d[i + 2]) / 3
                  if (l > TH) {
                    const w = l - TH
                    wsum += w
                    xsum += w * px
                    ysum += w * py
                  }
                }
              if (wsum > 0) {
                tx = xsum / wsum / (sc.width - 1)
                ty = ysum / wsum / (sc.height - 1)
              }
            } catch {
              /* cross-origin / not decodable */
            }
          }
        }
      }

      mx = lerp(mx, tx, 0.11)
      my = lerp(my, ty, 0.11)

      writeChrome(curTime)
      writeFilmFade()
      parallaxPass()
      raf = requestAnimationFrame(loop)
    }
    let raf = requestAnimationFrame(loop)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(failsafe)
      window.removeEventListener('resize', onResize)
      detachVideo?.()
    }
  }, [mode, reduced, canvasRef, glowRef, videoRef])
}
