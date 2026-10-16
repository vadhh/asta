import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react'
import { Img, Box, Btn, Panel, useArt, useOrient, inset, pick, float, pop, asset, type Rect } from '../stage'
import { sfx, playMusic } from '../audio'
import C from '../content.json'
import './activities.css'

// PRD safety rules: no breath-hold, no counting the child must keep up with, stop/pause any time.
type Step = 'intro' | 'breathe' | 'ground' | 'done'
const T = C.tataati
const IN = 4000, OUT = 5000, CYCLE = IN + OUT // slow, gentle guide; no hold
const LENGTH = 90_000 // ~1.5 min of guided breathing, then on to grounding (Selesai ends it sooner)
const LO = 0.94, HI = 1.12
const ease = (x: number) => (1 - Math.cos(Math.PI * x)) / 2
// The breathe cue gets its own Howl (audio.ts's sfx() can't be paused), so Jeda freezes it mid-sound too.
let cue: Howl | undefined
const playCue = () => (cue ??= new Howl({ src: [asset('audio/sfx/breathe.mp3')], volume: 0.7 })).play()

export default function Tataati({ onDone }: { onDone: () => void }) {
  const L = useArt('p5-tataati')
  const o = useOrient()
  const [step, setStep] = useState<Step>('intro')
  const [paused, setPaused] = useState(false)
  const [inhale, setInhale] = useState(true)
  // Breathing is driven by time actually spent breathing, so Jeda freezes Asta, the label and the cue together.
  const t = useRef(0)
  const sound = useRef({ id: 0, held: false })
  const scale = useMotionValue(LO)
  const ringScale = useTransform(scale, [LO, HI], [0.6, 1.15])
  const ringOpacity = useTransform(scale, [LO, HI], [0.25, 0.7])

  useAnimationFrame((_, dt) => {
    if (step !== 'breathe' || paused) return
    const prev = t.current % CYCLE
    t.current += dt
    const p = t.current % CYCLE
    if (p < prev) sound.current.id = playCue() // a new breath begins
    const inh = p < IN
    scale.set(inh ? LO + (HI - LO) * ease(p / IN) : HI - (HI - LO) * ease((p - IN) / OUT))
    if (inh !== inhale) setInhale(inh)
    if (t.current >= LENGTH) setStep('ground')
  })
  useEffect(() => {
    playMusic('breathing', step === 'breathe' ? 0.15 : 0.25) // let the breathing cues lead
  }, [step])

  const next = () => {
    sfx('tap')
    if (step === 'intro') {
      t.current = 0
      scale.set(LO)
      setInhale(true)
      setPaused(false)
      sound.current.id = playCue()
      setStep('breathe')
    } else if (step === 'ground') setStep('done')
    else onDone()
  }

  const togglePause = () => {
    sfx('tap')
    const c = sound.current
    if (!paused) {
      c.held = !!cue?.playing(c.id)
      cue?.pause(c.id)
    } else if (c.held) cue?.play(c.id)
    setPaused(!paused)
  }

  const page = L('paper-page')
  const hp = L('header-plank')
  const header = { ...hp, x: hp.x - 50, w: hp.w + 100 } // widened (9-slice) so its label isn't squeezed by the leaf ends
  // Tarik / Embuskan sit between Asta and the photo's right edge.
  const photo = L('photo-breathing'), asta = L('asta-breathing')
  const labelsX = asta.x + asta.w - 10 // right of the photo's Asta, so the labels never cover her
  const photoLabels = { x: labelsX, y: asta.y + 50, w: photo.x + photo.w - 50 - labelsX, h: 160 }
  const body = inset(page, [L('header-plank').h + 30, 40, 40, 40])
  // Ingat ya! card (done step): the exported one is too small for its text, so it's drawn 9-slice, taller.
  const tc = L('tip-card')
  const tip = pick<Rect>(o, { x: 175, y: 1080, w: 550, h: 290 }, { ...tc, y: tc.y - 60, h: tc.h + 60 })
  const headerText = { intro: T.whatTitle, breathe: T.exerciseTitle.text, ground: T.groundTitle.text, done: T.exerciseTitle.text }[step]
  const label = { intro: T.start, breathe: '', ground: T.next, done: T.done }[step]
  return (
    <>
      {o === 'landscape' && <Img r={L('book-panel')} />}
      <Img r={L('title-plank')} {...pop(0)} />
      <Box r={inset(L('title-plank'), [26, 60, 50, 60])} className="center t-plank-dark nowrap" fit>
        {T.title}
      </Box>
      <Box r={inset(L('title-plank'), [88, 60, 22, 60])} className="center t-plank-sub" fit>
        {T.sub}
      </Box>
      <Img r={L('binder-clip')} />
      <Img r={L('photo-breathing')} {...pop(0.15)} />
      <Img r={L('tape-2')} />
      {step === 'breathe' && (
        <motion.div
          className="layer breath-ring"
          style={{ left: asta.x - 40, top: asta.y + 30, width: asta.w + 80, height: asta.w + 80, scale: ringScale, opacity: ringOpacity }}
        />
      )}
      {step === 'breathe' ? (
        <Img key="asta-breathe" r={asta} style={{ transformOrigin: '50% 85%', scale }} />
      ) : (
        <Img key="asta-idle" r={asta} style={{ transformOrigin: '50% 85%' }} animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      )}
      <Img r={L('wind-swoosh')} animate={{ x: [0, 14, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }} />
      {step === 'intro' && (
        <Box r={photoLabels} className="col t-photo nowrap" fit>
          {T.photo.map((t, i) => (
            // stepped diagonal like the design, kept inside the box
            <motion.span key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.5 }} style={{ alignSelf: i ? 'flex-end' : 'flex-start' }}>
              {t}
            </motion.span>
          ))}
        </Box>
      )}
      <Img r={page} {...pop(0.25)} />
      <Img r={L('tape-1')} />
      <Panel r={header} src={L('header-plank').src} slice={36} />
      {/* keyed remounts, not exit animations: those stall when the tab is in the background */}
      <motion.div key={step} className="layer fill" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Box r={inset(header, [10, 70, 16, 70])} className="center t-chip-dark nowrap" fit>
          {headerText}
        </Box>
        {step === 'intro' && (
          <Box r={body} className="t-body" fit>
            <p className="tt-what">{T.what}</p>
            <p className="tt-note">{T.ready.text}</p>
          </Box>
        )}
        {step === 'ground' && (
          <Box r={body} className="center t-breath-done" fit>
            {T.ground.text}
          </Box>
        )}
        {step === 'done' && (
          <Box r={{ ...body, h: tip.y - 16 - body.y }} className="center t-breath-done" fit>
            {T.doneText.text}
          </Box>
        )}
      </motion.div>
      {step === 'breathe' && (
        <>
          <Box r={{ ...body, h: body.h - 130 }} className="center col">
            <motion.div key={String(inhale)} className="t-breath" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: paused ? 0.4 : 1, scale: 1 }}>
              {inhale ? T.in : T.out.text}
            </motion.div>
            <div className="t-small t-muted center-text">{paused ? T.paused.text : T.follow.text}</div>
          </Box>
          <div className="layer actions tt-actions" style={{ left: body.x, top: body.y + body.h - 110, width: body.w, height: 110 }}>
            <button className="pill blue" onClick={togglePause}>
              {paused ? T.resume : T.pause}
            </button>
            <button className="pill green" onClick={() => (sfx('tap'), cue?.stop(), setStep('ground'))}>
              {T.stop}
            </button>
          </div>
        </>
      )}
      {step === 'done' && (
        <>
          <Panel r={tip} src={L('tip-card').src} slice={40} {...pop(0.1)} />
          <Img r={{ ...L('leaf-1'), x: tip.x + 19, y: tip.y }} />
          {/* cloud peeks over the card's top edge beside the title, clear of the body text */}
          <Img r={{ ...L('cloud-calm'), x: tip.x + tip.w - L('cloud-calm').w - 20, y: tip.y - 24 }} {...float(0, 6, 2.5)} />
          <Box r={inset(tip, [16, 200, tip.h - 82, 80])} className="center-y t-chip-dark nowrap" fit {...pop(0.3)}>
            {T.rememberTitle}
          </Box>
          <Box r={inset(tip, [100, 36, 26, 40])} className="t-body" fit {...pop(0.35)}>
            {T.remember.text}
          </Box>
        </>
      )}
      {/* portrait: Asta's wave would cover the bottom-left of the page text, pills and Ingat ya! card */}
      {o === 'landscape' && <Img r={L('asta-wave')} {...float(0.4, 10)} />}
      {step !== 'breathe' && <Btn layers={[L('button-next-orange'), L('leaf-2')]} label={label} className="pulse" onClick={next} />}
      <span className="sr-only" aria-live="polite">
        {step === 'breathe' ? (paused ? T.paused.text : inhale ? T.in : T.out.text) : ''}
      </span>
    </>
  )
}
