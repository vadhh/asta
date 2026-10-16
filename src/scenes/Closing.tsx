import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Panel, useArt, useOrient, box, pick, float, pop, type Rect } from '../stage'
import { sfx } from '../audio'
import { ISLANDS, type Step } from '../App'
import { PlankBtn, ICONS } from './ui'
import C from '../content.json'

const E = C.closing
const WOOD = 'layers/p1-home/button-wood.webp'

/** Penutup dan Refleksi: thanks without assuming the child feels better, an optional question (never stored), and
 *  what next: keep going, rest, or ask for company. */
export default function Closing({ step, setStep, onMap, onEnd }: { step: Step; setStep: (s: Step) => void; onMap: () => void; onEnd: () => void }) {
  const L = useArt('p1-home')
  const o = useOrient()
  const nav = (r: Rect) => (
    <div className="layer nav-row" style={box(r)}>
      <button className="pill green" onClick={() => (sfx('tap'), onMap())}>{E.back}</button>
      <button className="pill brown" onClick={() => (sfx('tap'), onEnd())}>{E.end}</button>
    </div>
  )
  if (step !== 'ask') return <Note step={step} nav={nav} />

  const asta = pick<Rect>(o, { x: 0, y: 70, w: 330, h: 368 }, { x: 10, y: 440, w: 400, h: 446 })
  const speech = pick<Rect>(o, { x: 320, y: 60, w: 550, h: 400 }, { x: 40, y: 40, w: 560, h: 380 })
  const ask = pick<Rect>(o, { x: 40, y: 480, w: 820, h: 420 }, { x: 640, y: 30, w: 820, h: 344 })
  const choices = pick<Rect>(o, { x: 50, y: 925, w: 800, h: 370 }, { x: 640, y: 420, w: 820, h: 330 })
  return (
    <>
      <Img r={L('bush-left')} />
      <Img r={L('bush-flowers-right')} />
      <Img r={{ ...asta, src: L('asta-wave').src }} {...float(0, 12)} />
      <Box r={speech} className="center t-body speech-box" fit {...pop(0.2)}>
        {E.message}
      </Box>
      <Panel r={ask} src="layers/p5-tataati/paper-page.webp" slice={50} {...pop(0.35)} />
      <Liked r={ask} />
      <motion.div className="layer col choice-list" style={box(choices)} {...pop(0.5)}>
        <PlankBtn src={WOOD} slice={56} pad={[62, 62]} padY={[4, 14]} iconSize={66} icon="layers/p4-map/compass.webp" className="choice" onClick={() => (sfx('tap'), onMap())}>
          {E.choices.continue}
        </PlankBtn>
        <PlankBtn src={WOOD} slice={56} pad={[62, 62]} padY={[4, 14]} iconSize={66} icon={ICONS.rest} className="choice" onClick={() => (sfx('tap'), setStep('rest'))}>
          {E.choices.rest}
        </PlankBtn>
        <PlankBtn src={WOOD} slice={56} pad={[62, 62]} padY={[4, 14]} iconSize={66} icon={ICONS.company} className="choice" onClick={() => (sfx('tap'), setStep('company'))}>
          {E.choices.company}
        </PlankBtn>
      </motion.div>
      {nav(pick<Rect>(o, { x: 30, y: 1315, w: 840, h: 100 }, { x: 640, y: 770, w: 820, h: 100 }))}
    </>
  )
}

/** The optional reflection question: tap any activities you liked. Lives only in this component's state. */
function Liked({ r }: { r: Rect }) {
  const o = useOrient()
  const [liked, setLiked] = useState<string[]>([])
  const Q = E.question
  return (
    <motion.div className={`layer col liked ${o}`} style={box({ x: r.x + 64, y: r.y + 34, w: r.w - 112, h: r.h - 62 })} {...pop(0.4)}>
      <p className="t-heading">{Q.text}</p>
      <p className="t-small t-muted" aria-live="polite">{liked.length ? Q.thanks : Q.hint}</p>
      <div className="chips">
        {ISLANDS.map((id) => {
          const on = liked.includes(id)
          return (
            <button key={id} className={`chip-btn ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => (sfx('emotion-select'), setLiked(on ? liked.filter((l) => l !== id) : [...liked, id]))}>
              {C.validation.activities[id]}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

/** Rest screen and "I want company" screen. */
function Note({ step, nav }: { step: Exclude<Step, 'ask'>; nav: (r: Rect) => ReactNode }) {
  const o = useOrient()
  const pic = pick<Rect>(o, { x: 230, y: 170, w: 440, h: 500 }, { x: 110, y: 170, w: 440, h: 560 })
  const text = pick<Rect>(o, { x: 70, y: 720, w: 760, h: 420 }, { x: 620, y: 150, w: 840, h: 440 })
  const rest = step === 'rest'
  return (
    <>
      {rest ? (
        <>
          <Img r={{ ...pic, src: 'layers/p5-tataati/asta-breathing.webp' }} className="contain" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          <Img r={{ x: pic.x + pic.w - 150, y: pic.y - 60, w: 230, h: 170, src: ICONS.rest }} className="contain" {...float(0, 14, 7)} />
        </>
      ) : (
        <Img r={{ ...pic, src: 'layers/p1-home/asta-wave.webp' }} className="contain" {...float(0, 10)} />
      )}
      <Box r={text} className="center col t-body speech-box note-text" fit {...pop(0.3)}>
        <p className="t-speech">{rest ? E.rest.text : E.company.title}</p>
        <p>{rest ? E.rest.hint.text : E.company.text}</p>
      </Box>
      {nav(pick<Rect>(o, { x: 30, y: 1190, w: 840, h: 100 }, { x: 620, y: 640, w: 840, h: 100 }))}
    </>
  )
}
