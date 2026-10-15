import { useEffect, useState, type ReactElement } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Viewport, asset, type Art } from './stage'
import { playMusic, sfx, isMuted, setMuted, MUSIC_VOL, type Track } from './audio'
import C from './content.json'
import Home from './scenes/Home'
import Greeting from './scenes/Greeting'
import Emotion from './scenes/Emotion'
import MapScene from './scenes/MapScene'
import Tataati from './scenes/Tataati'
import Reronce from './scenes/Reronce'
import Srawung from './scenes/Srawung'
import Titen from './scenes/Titen'
import Ending from './scenes/Ending'
import Complete from './scenes/Complete'

export type Island = 'tataati' | 'reronce' | 'srawung' | 'titen'
export type Scene = 'home' | 'greeting' | 'emotion' | 'map' | Island | 'ending'
export const ISLANDS: Island[] = ['reronce', 'titen', 'tataati', 'srawung']

const ART: Record<Scene, Art> = {
  home: 'p1-home', greeting: 'p2-greeting', emotion: 'p3-emotion', map: 'p4-map',
  tataati: 'p5-tataati', reronce: 'p6-reronce', srawung: 'p6-reronce', titen: 'p8-titen', ending: 'p1-home',
}
const MUSIC: Record<Scene, Track> = {
  home: 'title', greeting: 'cottage', emotion: 'cottage', map: 'map',
  tataati: 'breathing', reronce: 'games', srawung: 'games', titen: 'games', ending: 'title',
}

const PROGRESS_KEY = 'asta.done'
const loadDone = (): Island[] => {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export default function App() {
  // Dev shortcut: ?scene=titen jumps straight to a screen.
  const [scene, setScene] = useState<Scene>(() => (import.meta.env.DEV && (new URLSearchParams(location.search).get('scene') as Scene)) || 'home')
  const [done, setDone] = useState<Island[]>(loadDone)
  const [celebrate, setCelebrate] = useState<Island | null>(null)
  const [muted, setMutedState] = useState(isMuted)

  // Browsers keep audio locked until the first tap (Mulai); Howler plays the queued track then.
  useEffect(() => playMusic(MUSIC[scene], scene === 'tataati' ? 0.25 : MUSIC_VOL), [scene])

  const go = (s: Scene) => setScene(s)
  const complete = (island: Island) => {
    sfx('complete')
    setCelebrate(island)
  }
  const leaveCelebration = () => {
    const island = celebrate!
    const next = done.includes(island) ? done : [...done, island]
    setDone(next)
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
    } catch {
      /* progress lasts for this visit only */
    }
    setCelebrate(null)
    sfx('island-unlock')
    go(next.length === ISLANDS.length && !done.includes(island) ? 'ending' : 'map')
  }

  const isIsland = (ISLANDS as Scene[]).includes(scene)
  const screens: Record<Scene, ReactElement> = {
    home: <Home onStart={() => go('greeting')} />,
    greeting: <Greeting onNext={() => go('emotion')} />,
    emotion: <Emotion onNext={() => go('map')} />,
    map: <MapScene done={done} onOpen={go} />,
    tataati: <Tataati onDone={() => complete('tataati')} />,
    reronce: <Reronce onDone={() => complete('reronce')} />,
    srawung: <Srawung onDone={() => complete('srawung')} />,
    titen: <Titen onDone={() => complete('titen')} />,
    ending: <Ending onMap={() => go('map')} />,
  }

  return (
    <MotionConfig reducedMotion="user">
      <Viewport art={ART[scene]}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            className="scene"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {screens[scene]}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>{celebrate && <Complete key="done" island={celebrate} onBack={leaveCelebration} />}</AnimatePresence>
      </Viewport>
      <div className="hud">
        {isIsland && !celebrate ? (
          <button className="hud-btn" aria-label={C.hud.map} onClick={() => (sfx('tap'), go('map'))}>
            <img src={asset('art/layers/p4-map/compass.webp')} alt="" />
          </button>
        ) : (
          <span />
        )}
        <button
          className="hud-btn"
          aria-label={muted ? C.hud.unmute : C.hud.mute}
          aria-pressed={muted}
          onClick={() => {
            setMuted(!muted)
            setMutedState(!muted)
          }}
        >
          <SpeakerIcon muted={muted} />
        </button>
      </div>
    </MotionConfig>
  )
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
    </svg>
  )
}
