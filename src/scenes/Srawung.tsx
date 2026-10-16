import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Img, Box, useArt, useOrient, box, pick, float, pop, artSrc, type Rect, scaledPlank } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'
import Memory, { MatchTip, shuffle } from './srawung/Memory'
import './srawung.css'

const S = C.srawung
type Step = 'intro' | 'rules' | 'modes' | 'play' | 'done'
type Mode = (typeof S.modeList)[number]

/** Sahabat Hewan (PRD fitur 8): a guide for a physical card game played in a small group with a companion.
 *  Intro → rules → pick a mode → draw challenge cards one at a time (or play the digital memory match) → done.
 *  No scores; any challenge can be skipped; the game can be replayed or stopped at any time. */
export default function Srawung({ onDone }: { onDone: () => void }) {
  const L = useArt('p6-reronce')
  const o = useOrient()
  const [step, setStep] = useState<Step>('intro')
  const [mode, setMode] = useState<Mode | null>(null)
  const [round, setRound] = useState(0) // remounts the game, so a repeat gets a fresh shuffle
  const [animal, setAnimal] = useState<number | null>(null)

  const go = (s: Step) => {
    sfx('page')
    if (s === 'play') setRound((r) => r + 1)
    setStep(s)
  }
  const showAnimal = (i: number) => {
    sfx('card-flip')
    setAnimal(i)
  }

  // Portrait gets a bigger plank: the frame is narrow, so its subtitle would otherwise be tiny on phones.
  const tp = L('title-plank')
  const P = scaledPlank(tp, pick(o, 1.45, 1.4))
  const panel = pick<Rect>(o, { x: 40, y: 255, w: 820, h: step === 'play' ? 1300 : 1090 }, { x: 420, y: 200, w: 1070, h: 650 })
  const speech = pick<Rect>(o, { x: 250, y: 1375, w: 610, h: 160 }, { x: 40, y: 200, w: 330, h: 150 })
  const memory = step === 'play' && mode?.id === 'digital'

  const animals = (
    <div className="sh-animals">
      {S.pairs.map((p, i) => (
        <motion.button key={p.animal} className="sh-animal" aria-label={p.animalName} onClick={() => showAnimal(i)} whileTap={{ scale: 0.93 }}>
          <img src={artSrc(`layers/extra/animal-${p.animal}.webp`)} alt="" />
          <span>{p.animalName}</span>
        </motion.button>
      ))}
    </div>
  )

  return (
    <>
      {o === 'landscape' && <Img r={L('panel')} />}
      <Img r={{ ...P.plank, src: tp.src }} bleed={false} {...pop(0)} />
      <Img r={L('binder-clip')} />
      <Box r={P.title} className="center t-plank-dark nowrap" fit>
        {S.title}
      </Box>
      <Box r={P.sub} className="center t-plank-sub nowrap" fit>
        {S.sub}
      </Box>

      {memory ? (
        <Memory key={round} onFinish={() => go('done')} />
      ) : (
        <>
          <motion.div key={step} className={`layer box sh ${o} sh-${step}`} style={box(panel)} {...pop(0.05)}>
            {step === 'intro' && (
              <>
                <h2 className="t-heading">{S.intro.heading}</h2>
                <p className="t-body sh-goal">{S.intro.goal}</p>
                <div className="sh-cards">
                  <p className="t-small sh-label">{S.intro.animals}</p>
                  {animals}
                </div>
                <Tip text={S.intro.tip} />
                <button className="pill green" onClick={() => go('rules')}>
                  {S.intro.button}
                </button>
              </>
            )}
            {step === 'rules' && (
              <>
                <h2 className="t-heading">{S.rules.heading}</h2>
                <ol className="t-body sh-list sh-scroll">
                  {S.rules.items.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ol>
                <Tip text={S.rules.tip} />
                <button className="pill green" onClick={() => go('modes')}>
                  {S.rules.button}
                </button>
              </>
            )}
            {step === 'modes' && (
              <>
                <h2 className="t-heading">{S.modes.heading}</h2>
                <div className="sh-mode-grid">
                  {S.modeList.map((m) => (
                    <motion.button
                      key={m.id}
                      className={`sh-mode ${mode?.id === m.id ? 'on' : ''}`}
                      aria-pressed={mode?.id === m.id}
                      onClick={() => (sfx('emotion-select'), buzz(), setMode(m))}
                      whileTap={{ scale: 0.95 }}
                    >
                      {m.id === 'digital' ? (
                        <span className="sh-mini-back">
                          <img src={artSrc('layers/p3-emotion/asta-head-badge.webp')} alt="" />
                        </span>
                      ) : (
                        <img src={artSrc(`layers/extra/animal-${m.animal}.webp`)} alt="" />
                      )}
                      <span className="sh-mode-text">
                        <span className="t-card">{m.name}</span>
                        <span className="t-small">{m.desc}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
                {mode ? <Tip text={mode.tip} /> : <div className="sh-tip-space" />}
                <button className={`pill green ${mode ? 'pulse' : ''}`} disabled={!mode} onClick={() => go('play')}>
                  {S.modes.start}
                </button>
              </>
            )}
            {step === 'play' && mode?.cards && <Play key={round} mode={mode} animals={animals} onFinish={() => go('done')} />}
            {step === 'done' && (
              <>
                <h2 className="t-heading">{S.finish.heading}</h2>
                <img className="sh-done-art" src={artSrc('layers/p3-emotion/asta-head-badge.webp')} alt="" />
                <p className="t-body">{S.finish.text}</p>
                <Tip text={S.finish.tip} />
                <div className="sh-actions">
                  <button className="pill blue" onClick={() => go('modes')}>
                    {S.finish.again}
                  </button>
                  <button className="pill green" onClick={() => (sfx('tap'), onDone())}>
                    {S.finish.done}
                  </button>
                </div>
              </>
            )}
          </motion.div>
          {step !== 'play' && <Speech r={speech} text={{ intro: S.intro.speech, rules: S.rules.speech, modes: S.modes.speech, done: S.finish.speech }[step]} />}
          {(step !== 'play' || o === 'landscape') && <Img r={L('asta-wave')} {...float(0.3, 10)} />}
        </>
      )}

      <AnimatePresence>
        {animal !== null && <MatchTip key={animal} pair={animal} label={S.play.close} onNext={() => (sfx('tap'), setAnimal(null))} />}
      </AnimatePresence>
    </>
  )
}

/** Challenge cards drawn one at a time. Skipping is always fine and never counted; the deck ends at "done". */
function Play({ mode, animals, onFinish }: { mode: Mode; animals: ReactNode; onFinish: () => void }) {
  const o = useOrient()
  const [deck] = useState(() => shuffle(mode.cards ?? []))
  const [i, setI] = useState(-1)
  const [skipped, setSkipped] = useState(false)
  const draw = (skip = false) => {
    sfx(skip ? 'tap' : 'card-flip')
    setSkipped(skip)
    if (i + 1 < deck.length) setI(i + 1)
    else onFinish()
  }
  return (
    <>
      <div className="sh-head">
        <h2 className="t-heading">{mode.name}</h2>
        <p className="t-small t-muted">{skipped ? S.play.skipSpeech : S.play.hint}</p>
      </div>
      <AnimatePresence mode="wait">
        {i < 0 ? (
          <motion.button key="back" className="sh-card back" onClick={() => draw()} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <img src={artSrc('layers/p3-emotion/asta-head-badge.webp')} alt="" />
            <span className="t-label-light">{S.play.draw}</span>
          </motion.button>
        ) : (
          <motion.div
            key={i}
            className="sh-card"
            role="status"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="t-question">{deck[i]}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="sh-cards">
        <p className="t-small sh-label">{S.play.animals}</p>
        {animals}
      </div>
      <Tip text={mode.tip} />
      <div className={`sh-actions ${o}`}>
        {i >= 0 && (
          <>
            <button className="pill brown" onClick={() => draw(true)}>
              {S.play.skip}
            </button>
            <button className="pill blue" onClick={() => draw()}>
              {S.play.next}
            </button>
          </>
        )}
        <button className="pill green" onClick={() => (sfx('tap'), onFinish())}>
          {S.play.done}
        </button>
      </div>
    </>
  )
}

function Tip({ text }: { text: string }) {
  return (
    <p className="sh-tip">
      <b>{S.pendamping}</b> {text}
    </p>
  )
}

function Speech({ r, text }: { r: Rect; text: string }) {
  return (
    <Box key={text} r={r} className="center t-small speech-box" fit {...pop(0.4)}>
      {text}
    </Box>
  )
}
