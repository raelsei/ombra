import { useEffect, useRef, type RefObject } from 'react'
import meta from '../frames-meta.json'

export type Motion = 'scrub' | 'drift'

interface Centroid {
  0: number
  1: number
  2: number
}
const CENTROIDS = meta.centroids as unknown as Centroid[]
const FRAME_COUNT = meta.count
const DURATION = meta.count / meta.fps // ≈ 60.8s
const BASE = import.meta.env.BASE_URL

const frameUrl = (i: number) => `${BASE}frames/${String(i + 1).padStart(3, '0')}.jpg`

interface Opts {
  mode: Motion
  baseSpeed: number
  reduced: boolean
  /** live ref — read inside the loop without re-initialising */
  showFigureData: boolean
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** blurred screen-blend copy above the content — "light seeping through" */
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
 * The whole reactive film engine, driven from ONE requestAnimationFrame loop
 * (no per-node listeners, no layout thrash — everything flows through CSS vars
 * on <html> and a handful of textContent writes).
 *
 * scrub  — draw the nearest pre-decoded frame to <canvas>, eased float index,
 *          redraw only on index change. Centroid comes from the build-time lookup.
 * drift  — the <video> plays natively; scroll velocity ramps playbackRate.
 *          Centroid is sampled live from a 48×27 offscreen canvas.
 * reduced-motion — freeze on a still frame, no rAF; chrome updates on scroll only.
 */
export function useFilmStage(opts: Opts) {
  const { mode, baseSpeed, reduced, canvasRef, glowRef, videoRef, onReady } = opts

  // read-only refs so config that shouldn't re-init the loop stays fresh
  const showFigRef = useRef(opts.showFigureData)
  showFigRef.current = opts.showFigureData
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const root = document.documentElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // --- status-bar readouts (fixed ids) ---
    const $ = (id: string) => document.getElementById(id)
    const figX = $('fig-x'),
      figY = $('fig-y'),
      scrubEl = $('scrub'),
      durEl = $('dur'),
      idxCur = $('idx-cur'),
      idxTot = $('idx-tot'),
      pbar = $('pbar')
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-screen-label]'))
    if (idxTot) idxTot.textContent = String(sections.length).padStart(2, '0')
    if (durEl) durEl.textContent = mmss(DURATION)

    // The film lives in the opening. It stays fully visible through the hero and
    // the Apparition beat, then fades out as the Collection rises into view so
    // the content sections read clean and undistracted. Keyed to the collection's
    // live viewport position → resize-proof.
    const collectionEl = document.getElementById('collection')
    const writeFilmFade = () => {
      let fade = 1
      if (collectionEl) {
        const vh = window.innerHeight || 1
        const top = collectionEl.getBoundingClientRect().top
        // top ≥ 1.3vh (far below) → 1;  top ≤ 0.4vh (arriving) → 0
        fade = clamp((top - vh * 0.4) / (vh * 0.9), 0, 1)
      }
      root.style.setProperty('--film-fade', fade.toFixed(3))
    }

    // --- reactive state ---
    let mx = 0.5,
      my = 0.5,
      mp = 0
    let progress = 0
    let lastY = window.scrollY
    let scrollVel = 0
    let rate: number | null = null
    let floatFrame = 0
    let lastIdx = -1
    let trailHeat = 0
    let lastScale = 1.04
    let disposed = false

    // --- cover-fit canvases (main + blurred glow copy) ---
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const glow = glowRef.current
    const gctx = glow ? glow.getContext('2d') : null
    let curImg: HTMLImageElement | null = null
    const sizeCanvas = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      if (glow) {
        // quarter-res is plenty — the CSS blur erases any detail anyway
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
      // glow always gets a plain stamp (no trail compositing) — the light that
      // seeps through the content follows the figure, not its ghosts
      if (gctx && glow) drawCoverTo(gctx, glow.width, glow.height, img, img.naturalWidth, img.naturalHeight)
      curImg = img
    }
    sizeCanvas()

    // --- frame preload (scrub + reduced) ---
    const images: HTMLImageElement[] = []
    let readyFired = false
    const fireReady = () => {
      if (readyFired || disposed) return
      readyFired = true
      onReadyRef.current()
    }

    // Stream every frame in (they are ~8.5KB each). We DON'T force-decode all
    // of them — that would pin ~2MB × N of RGBA in RAM. Instead each frame is
    // decoded on demand by drawImage (the browser keeps a bounded LRU decode
    // cache), and readiness fires as soon as frame 0 lands so the loader clears
    // fast while the rest keep loading in the background.
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
      root.style.setProperty('--my', my.toFixed(4))
      root.style.setProperty('--mp', mp.toFixed(4))
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

    // ================= REDUCED MOTION — frozen still, no rAF =================
    if (reduced) {
      const first = new Image()
      first.src = frameUrl(0)
      first.decode().catch(() => {}).finally(() => {
        drawImageCover(first)
        fireReady()
      })
      window.setTimeout(fireReady, 2600)
      const c0 = CENTROIDS[0]
      mx = c0[0]
      my = c0[1]
      mp = c0[2]
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
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onResize)
      }
    }

    // ================= MOTION — one rAF loop =================
    // offscreen sampler for live centroid (drift mode)
    const sc = document.createElement('canvas')
    sc.width = 48
    sc.height = 27
    const sctx = sc.getContext('2d', { willReadFrequently: true })

    if (mode === 'scrub') {
      preloadAll()
    } else {
      // drift — the video is the visible layer
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
      }
    }
    // reveal the design even if decode/preload stalls
    const failsafe = window.setTimeout(fireReady, 2600)

    const onResize = () => {
      sizeCanvas()
      if (curImg) drawImageCover(curImg)
    }
    window.addEventListener('resize', onResize)

    // depth pass — [data-parallax] media drifts at its own speed relative to
    // the viewport centre. We subtract the already-applied translate before
    // measuring so the fixed point is the untransformed layout position.
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
        ty = 0.5,
        tp = 0
      let curTime = 0

      if (mode === 'scrub') {
        const fTarget = progress * (FRAME_COUNT - 1)
        floatFrame = lerp(floatFrame, fTarget, 0.2)
        const idx = clamp(Math.round(floatFrame), 0, FRAME_COUNT - 1)
        const img = images[idx]

        // APPARITION TRAIL — the signature. Scroll velocity smears the figure
        // into fading ghosts of itself: each frame the canvas is dimmed by a
        // velocity-dependent veil (fast scroll → thin veil → long trail), then
        // the current frame is stamped with `lighten` so only the bright figure
        // accumulates. At rest the ghosts dissolve in under a second and one
        // clean silhouette remains — the garment cut for the shape left behind.
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

        // stage breathing — the frame inhales slightly while the figure moves
        const scale = 1.04 + trailHeat * 0.02
        if (Math.abs(scale - lastScale) > 0.0005) {
          canvas.style.transform = `scale(${scale.toFixed(4)})`
          lastScale = scale
        }
        curTime = progress * DURATION
        const c = CENTROIDS[idx]
        tx = c[0]
        ty = c[1]
        tp = c[2]
      } else {
        // drift — native playback, scroll ramps the rate
        const boost = Math.min(3.4, scrollVel * 0.06)
        const target = baseSpeed + boost
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
                ysum = 0,
                bright = 0
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
                    bright++
                  }
                }
              if (wsum > 0) {
                tx = xsum / wsum / (sc.width - 1)
                ty = ysum / wsum / (sc.height - 1)
                tp = Math.min(1, bright / (sc.width * sc.height) / 0.24)
              }
            } catch {
              /* cross-origin / not decodable */
            }
          }
        }
      }

      mx = lerp(mx, tx, 0.11)
      my = lerp(my, ty, 0.11)
      mp = lerp(mp, tp, 0.09)

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
    }
  }, [mode, baseSpeed, reduced, canvasRef, videoRef])
}
