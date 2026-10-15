import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Img, Box, useArt, useOrient, inset, box, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'

const S = C.srawung
type Card = { pair: number; kind: 'animal' | 'emotion' }

const shuffle = <T,>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Memory match: each animal pairs with the emotion it shows; a match reveals how to support that friend. */
export default function Srawung({ onDone }: { onDone: () => void }) {
  const L = useArt('p6-reronce')
  const o = useOrient()
  const deck = useMemo(() => shuffle(S.pairs.flatMap((_, pair): Card[] => [{ pair, kind: 'animal' }, { pair, kind: 'emotion' }])), [])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [tip, setTip] = useState<number | null>(null)

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || matched.includes(deck[i].pair)) return
    sfx('card-flip')
    const next = [...open, i]
    setOpen(next)
    if (next.length < 2) return
    const [a, b] = next
    if (deck[a].pair === deck[b].pair) {
      setTimeout(() => {
        setMatched((m) => [...m, deck[a].pair])
        setOpen([])
        sfx('card-match')
        buzz(40)
        setTip(deck[a].pair)
      }, 550)
    } else {
      setTimeout(() => setOpen([]), 1100)
    }
  }
  const closeTip = () => {
    sfx('tap')
    setTip(null)
    if (matched.length === S.pairs.length) onDone()
  }

  const grid = pick<Rect>(o, { x: 70, y: 205, w: 760, h: 1110 }, { x: 360, y: 185, w: 1120, h: 630 })
  const cols = pick(o, 2, 4)
  const rows = deck.length / cols
  const gap = 24
  const cw = (grid.w - gap * (cols - 1)) / cols
  const ch = (grid.h - gap * (rows - 1)) / rows
  const cell = (i: number): Rect => ({ x: grid.x + (i % cols) * (cw + gap), y: grid.y + Math.floor(i / cols) * (ch + gap), w: cw, h: ch })

  return (
    <>
      <Img r={L('title-plank')} {...pop(0)} />
      <Img r={L('binder-clip')} />
      <Box r={inset(L('title-plank'), [30, 60, 62, 60])} className="center t-plank-dark">
        {S.title}
      </Box>
      <Box r={inset(L('title-plank'), [88, 60, 26, 60])} className="center t-plank-sub" fit>
        {S.sub}
      </Box>

      {deck.map((card, i) => {
        const up = open.includes(i) || matched.includes(card.pair)
        const p = S.pairs[card.pair]
        return (
          <motion.button
            key={i}
            className={`layer flip ${matched.includes(card.pair) ? 'matched' : ''}`}
            style={box(cell(i))}
            onClick={() => flip(i)}
            aria-label={up ? (card.kind === 'animal' ? p.animalName : p.emotionName) : `Kartu ${i + 1}`}
            aria-pressed={up}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div className="flip-inner" animate={{ rotateY: up ? 180 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
              <div className="face back">
                <img src={artSrc('layers/p3-emotion/asta-head-badge.webp')} alt="" />
              </div>
              <div className="face front">
                {card.kind === 'animal' ? (
                  <>
                    <img className="photo" src={artSrc(`layers/extra/animal-${p.animal}.webp`)} alt="" />
                    <span className="t-card">{p.animalName}</span>
                  </>
                ) : (
                  <>
                    <img className="emo" src={artSrc(`layers/extra/face-${p.emotion}.webp`)} alt="" />
                    <span className="t-card chip">{p.emotionName}</span>
                  </>
                )}
              </div>
            </motion.div>
          </motion.button>
        )
      })}

      <Box r={pick<Rect>(o, { x: 250, y: 1350, w: 420, h: 130 }, { x: 40, y: 200, w: 300, h: 150 })} className="center t-small speech-box" fit {...pop(0.6)}>
        {S.speech.text}
      </Box>
      <Img r={L('asta-wave')} {...float(0.3, 10)} />

      <AnimatePresence>
        {tip !== null && <MatchTip key={tip} pair={tip} onNext={closeTip} />}
      </AnimatePresence>
    </>
  )
}

function MatchTip({ pair, onNext }: { pair: number; onNext: () => void }) {
  const o = useOrient()
  const p = S.pairs[pair]
  const r = pick<Rect>(o, { x: 60, y: 230, w: 780, h: 1140 }, { x: 280, y: 90, w: 1040, h: 740 })
  return (
    <>
      <motion.div className="layer scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className={`layer tip-card ${o}`} role="dialog" aria-label={`${p.animalName} ${p.emotionName}`} style={box(r)} {...pop(0.05)}>
        <div className="tip-top">
          <img className="photo" src={artSrc(`layers/extra/animal-${p.animal}.webp`)} alt="" />
          <span className="t-heading">+</span>
          <img className="emo" src={artSrc(`layers/extra/face-${p.emotion}.webp`)} alt="" />
          <div className="col">
            <span className="t-heading">{p.animalName}</span>
            <span className="t-card chip">{p.emotionName}</span>
          </div>
        </div>
        <p className="tip-summary t-body">{p.summary}</p>
        <p className="t-heading aksi">{S.aksi} 💡</p>
        <ul className="t-body aksi-list">
          {p.aksi.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <button className="pill green" onClick={onNext} autoFocus>
          {S.next}
        </button>
      </motion.div>
    </>
  )
}
