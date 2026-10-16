import { useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, Panel, useArt, useOrient, inset, box, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'
import BANK from '../soal-sahabat-rasa.json'
import './titen.css'

// Kuis Sahabat Rasa (PRD Fitur 9 + the bank's "Panduan Penerapan"): a round of 10 questions drawn at random from the
// whole bank, options shuffled, one at a time. No score, timer or retry-until-right; any answer shows the explanation.
const T = C.titen
type Q = (typeof BANK.categories)[number]['questions'][number] & { cat: string }
const ROUND = 10
const ALL: Q[] = BANK.categories.flatMap((c) => c.questions.map((q) => ({ ...q, cat: c.name })))

const shuffle = <T,>(a: T[]): T[] => {
  a = [...a]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
// Options are shuffled too, so the right answer's position isn't predictable; `answer` follows its option.
const draw = (): Q[] =>
  shuffle(ALL).slice(0, ROUND).map((q) => {
    const order = shuffle([0, 1, 2])
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) }
  })
// Dev shortcut for QA: ?scene=titen&soal=4,36,43 plays those bank numbers (1–48) in bank option order.
const devRound = () => {
  const s = import.meta.env.DEV && new URLSearchParams(location.search).get('soal')
  return s ? s.split(',').map((n) => ALL[Number(n) - 1]) : null
}

// Frame-px layout. Bank text is long, so landscape uses two columns (question + options | explanation).
const LAY = {
  portrait: {
    question: { x: 50, y: 185, w: 800, h: 200 },
    opt: (i: number): Rect => ({ x: 50, y: 400 + i * 166, w: 800, h: 150 }),
    tip: { x: 32, y: 900, w: 837, h: 480 },
    dots: { x: 250, y: 1400, w: 400, h: 40 },
    skip: { x: 300, y: 1460, w: 300, h: 100 },
    next: { x: 700, y: 1400 },
    asta: { x: 0, y: 1390, w: 145, h: 210 },
    end: { x: 80, y: 260, w: 740, h: 380 },
    endBtns: { x: 200, y: 700, w: 500, h: 290 },
  },
  landscape: {
    question: { x: 160, y: 180, w: 700, h: 150 },
    opt: (i: number): Rect => ({ x: 160, y: 345 + i * 155, w: 700, h: 140 }),
    tip: { x: 880, y: 175, w: 600, h: 510 },
    dots: { x: 880, y: 700, w: 400, h: 40 },
    skip: { x: 930, y: 752, w: 300, h: 96 },
    next: { x: 1300, y: 690 },
    asta: null,
    end: { x: 420, y: 230, w: 980, h: 300 },
    endBtns: { x: 520, y: 590, w: 780, h: 130 },
  },
}

export default function Titen({ onDone }: { onDone: () => void }) {
  const L = useArt('p8-titen')
  const o = useOrient()
  const Y = LAY[o]
  const [round, setRound] = useState<Q[]>(() => devRound() ?? draw())
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  const again = () => {
    sfx('tap')
    setRound(draw())
    setQi(0)
    setPicked(null)
  }
  const next = () => {
    sfx('page')
    setQi(qi + 1)
    setPicked(null)
  }

  // Title plank scaled up (art undistorted) so the title and the topic name below it stay readable; leaves follow it.
  // Not scaledPlank(): this plank is a thinner strip, so both lines sit on its face with their own insets.
  const tp = L('title-plank')
  const k = pick(o, 1.15, 1.27) // portrait: wider would run under the HUD buttons on short phones
  const plank = { x: tp.x + tp.w / 2 - (tp.w * k) / 2, y: tp.y - 14, w: tp.w * k, h: tp.h * k }
  const onPlank = (n: string) => {
    const l = L(n)
    return { ...l, x: plank.x + (l.x - tp.x) * k, y: plank.y + (l.y - tp.y) * k, w: l.w * k, h: l.h * k }
  }
  const q = round[qi]

  return (
    <>
      {o === 'landscape' && <Img r={L('panel')} />}
      <Img r={L('binder-clip')} />
      <Img r={{ ...plank, src: tp.src }} bleed={false} {...pop(0)} />
      <Img r={onPlank('leaf-1')} bleed={false} />
      <Img r={onPlank('leaf-2')} bleed={false} />
      <Box r={inset(plank, [20 * k, 70 * k, 50 * k, 70 * k])} className="center t-plank-dark nowrap" fit>
        {T.title}
      </Box>
      <Box r={inset(plank, [61 * k, 80 * k, 19 * k, 80 * k])} className="center t-plank-sub nowrap" fit>
        {q ? q.cat : T.sub}
      </Box>

      {q ? (
        <Question key={`${qi}-${q.q}`} q={q} qi={qi} total={round.length} picked={picked} onPick={setPicked} onNext={next} />
      ) : (
        <End onAgain={again} onDone={() => (sfx('tap'), onDone())} />
      )}

      {(Y.asta || !q) && <Img r={Y.asta ? { ...L('asta-wave'), ...Y.asta } : L('asta-wave')} {...float(0.2, 10)} />}
    </>
  )
}

function Question({ q, qi, total, picked, onPick, onNext }: {
  q: Q; qi: number; total: number; picked: number | null; onPick: (i: number) => void; onNext: () => void
}) {
  const L = useArt('p8-titen')
  const o = useOrient()
  const Y = LAY[o]
  const answered = picked !== null

  const choose = (i: number) => {
    if (answered) return
    onPick(i)
    if (i === q.answer) {
      sfx('correct')
      buzz(40)
    } else sfx('tap') // no "wrong" sound: a different answer is not a failure
  }

  // Explanation panel, with its header tab, leaf and sparkles kept where the export puts them relative to it.
  const tip = Y.tip
  const tp = L('tip-panel')
  const rel = (n: string, dw = 0) => ({ ...L(n), x: tip.x + L(n).x - tp.x, y: tip.y + L(n).y - tp.y, w: L(n).w + dw })
  const header = rel('tip-header', pick(o, 110, 60))
  const sparkles = { ...rel('sparkles'), x: header.x + header.w - 4 }
  const btn = L('button-green-round'), arrow = L('icon-arrow')
  const at = (l: typeof btn) => ({ ...l, x: l.x - btn.x + Y.next.x, y: l.y - btn.y + Y.next.y })

  return (
    <>
      <motion.div className="layer fill" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}>
        <Box r={Y.question} className={`center t-question tn-q ${o === 'portrait' ? 'speech-box' : ''}`} fit>
          {q.q}
        </Box>
        {q.options.map((text, i) => {
          const s = Y.opt(i)
          const right = answered && i === q.answer
          return (
            <motion.button
              key={i}
              className={`layer option tn-opt ${answered && !right ? 'rest' : ''}`}
              style={box(s)}
              onClick={() => choose(i)}
              aria-pressed={i === picked}
              aria-disabled={answered}
              animate={right ? { scale: 1.03 } : { scale: 1 }}
              whileTap={answered ? undefined : { scale: 0.96 }}
            >
              <Panel
                r={right ? { x: 0, y: -8, w: s.w, h: s.h + 16 } : { x: 0, y: 0, w: s.w, h: s.h }}
                src={right ? 'layers/p8-titen/card-a-selected.webp' : 'layers/p8-titen/card-b.webp'}
                slice={34}
              />
              {right && <img className="layer check" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" style={{ right: -22, top: -34, width: 84, height: 66 }} />}
              <Box r={inset({ x: 0, y: 0, w: s.w, h: s.h }, [14, 30, 18, 30])} className="center-y t-option" fit>
                <span className="tn-letter">{'ABC'[i]}.</span> {text}
              </Box>
            </motion.button>
          )
        })}
      </motion.div>

      <Panel r={tip} src={tp.src} slice={50} />
      <Img r={rel('leaf-3')} bleed={false} />
      <Panel r={header} src={L('tip-header').src} slice={30} />
      <Img r={sparkles} bleed={false} />
      <Box r={inset(header, [5, 24, 11, 44])} className="center-y t-chip-dark nowrap" fit>
        {T.tipTitle}
      </Box>
      <Box
        key={String(picked)}
        r={inset(tip, [header.y - tip.y + header.h + 14, 44, 30, 60])}
        className="t-body tn-tip"
        fit
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        aria-live="polite"
      >
        {!answered && T.hint.text}
        {answered && picked !== q.answer && <p className="tn-kind">{T.tryAgain}</p>}
        {answered && <p>{q.edu}</p>}
      </Box>

      <div className="layer dots" style={box(Y.dots)} aria-label={T.progress.text.replace('{n}', String(qi + 1)).replace('{total}', String(total))}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i <= qi ? 'on' : ''} />
        ))}
      </div>
      {answered ? (
        <Btn layers={[at(btn), at(arrow)]} label={T.next} className="pulse" onClick={onNext} />
      ) : (
        <button className="layer pill brown" style={box(Y.skip)} onClick={onNext}>
          {T.skip}
        </button>
      )}
    </>
  )
}

function End({ onAgain, onDone }: { onAgain: () => void; onDone: () => void }) {
  const o = useOrient()
  const Y = LAY[o]
  return (
    <motion.div className="layer fill" {...pop(0)}>
      <Box r={Y.end} className="center t-breath-done speech-box" fit>
        {T.end.text}
      </Box>
      <div className={`layer actions tn-end ${o}`} style={box(Y.endBtns)}>
        <button className="pill green" onClick={onAgain}>
          {T.again}
        </button>
        <button className="pill brown" onClick={onDone}>
          {T.done}
        </button>
      </div>
    </motion.div>
  )
}
