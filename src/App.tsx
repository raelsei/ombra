import { useEffect, useRef, useState } from 'react'
import { useFilmStage, type Motion } from './hooks/useFilmStage'
import { useReveals } from './hooks/useReveals'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { FilmStage } from './components/FilmStage'
import { Chrome } from './components/Chrome'
import { Nav } from './components/Nav'
import { StatusBar } from './components/StatusBar'
import { Loader } from './components/Loader'
import { Hero } from './components/sections/Hero'
import { Apparition } from './components/sections/Apparition'
import { Collection } from './components/sections/Collection'
import { Lookbook } from './components/sections/Lookbook'
import { House } from './components/sections/House'
import { FooterSection } from './components/sections/FooterSection'

/* Config — spec defaults, overridable via URL query for review:
   ?motion=drift  ?accent=#C9A227  ?grain=0  ?fig=0  ?speed=0.7 */
const ACCENTS = ['#A9B4C0', '#C9A227', '#B4472E', '#8E97A6', '#E3DCCB']

function readConfig() {
  const q = new URLSearchParams(window.location.search)
  const motion: Motion = q.get('motion') === 'drift' ? 'drift' : 'scrub'
  const accentRaw = q.get('accent')
  const accent = accentRaw && ACCENTS.includes(accentRaw) ? accentRaw : '#A9B4C0'
  const grain = q.get('grain') !== '0'
  const showFigureData = q.get('fig') !== '0'
  const speed = Number(q.get('speed'))
  const baseSpeed = Number.isFinite(speed) && speed > 0 ? Math.min(1.5, Math.max(0.2, speed)) : 0.5
  return { motion, accent, grain, showFigureData, baseSpeed }
}

export default function App() {
  const [cfg] = useState(readConfig)
  const reduced = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // style config → CSS vars
  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--live', cfg.accent)
    r.setProperty('--instr', cfg.showFigureData ? '1' : '0')
    r.setProperty('--grain', cfg.grain ? '1' : '0')
  }, [cfg])

  useFilmStage({
    mode: cfg.motion,
    baseSpeed: cfg.baseSpeed,
    reduced,
    showFigureData: cfg.showFigureData,
    canvasRef,
    videoRef,
    onReady: () => setReady(true),
  })

  // reveals play once the loader clears (or immediately for reduced motion)
  useReveals(rootRef, ready || reduced)

  return (
    <div ref={rootRef} id="top" style={{ position: 'relative', width: '100%' }}>
      <FilmStage canvasRef={canvasRef} videoRef={videoRef} mode={cfg.motion} />
      <Chrome />
      <Nav />
      <StatusBar />
      <Loader hidden={ready} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        <Hero />
        <Apparition />
        <Collection />
        <Lookbook />
        <House />
        <FooterSection />
      </main>
    </div>
  )
}
