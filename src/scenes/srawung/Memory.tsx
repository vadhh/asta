import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Img, Box, useArt, useOrient, box, pick, float, pop, artSrc, type Rect } from '../../stage'
import { sfx, buzz } from '../../audio'
import C from '../../content.json'

const S = C.srawung
type Card = { pair: number; kind: 'animal' | 'emotion' }

export const shuffle = <T,>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Digital-card mode: memory match where each animal pairs with the emotion it shows; a match reveals how to
 *  support that friend. Mount with a new `key` to replay with a fresh shuffle. */
export default function Memory({ onFinish }: { onFinish: () => void }) {
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
    if (matched.length === S.pairs.length) onFinish()
  }

  // Grid stays clear of Asta (portrait: bottom-left, landscape: left of the panel).
  const grid = pick<Rect>(o, { x: 70, y: 250, w: 760, h: 970 }, { x: 450, y: 200, w: 960, h: 520 })
  const cols = pick(o, 2, 4)
  const rows = deck.length / cols
  const gap = 24
  const cw = (grid.w - gap * (cols - 1)) / cols
  const ch = (grid.h - gap * (rows - 1)) / rows
  const cell = (i: number): Rect => ({ x: grid.x + (i % cols) * (cw + gap), y: grid.y + Math.floor(i / cols) * (ch + gap), w: cw, h: ch })

  return (
    <>
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

      <Box r={pick<Rect>(o, { x: 250, y: 1350, w: 380, h: 150 }, { x: 40, y: 200, w: 300, h: 150 })} className="center t-small speech-box" fit {...pop(0.6)}>
        {S.speech.text}
      </Box>
      <Img r={L('asta-wave')} {...float(0.3, 10)} />
      <button
        className="layer pill green"
        style={box(pick<Rect>(o, { x: 650, y: 1365, w: 220, h: 120 }, { x: 1210, y: 735, w: 200, h: 90 }))}
        onClick={() => (sfx('tap'), onFinish())}
      >
        {S.play.done}
      </button>

      <AnimatePresence>
        {tip !== null && <MatchTip key={tip} pair={tip} onNext={closeTip} />}
      </AnimatePresence>
    </>
  )
}

/** An animal card: the animal, the emotion it shows, and Aksi tips for supporting a friend who feels it. */
export function MatchTip({ pair, onNext, label = S.next }: { pair: number; onNext: () => void; label?: string }) {
  const o = useOrient()
  const p = S.pairs[pair]
  const r = pick<Rect>(o, { x: 60, y: 230, w: 780, h: 1140 }, { x: 230, y: 60, w: 1140, h: 790 })
  return (
    <>
      <motion.div className="layer scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className={`layer tip-card ${o}`} role="dialog" aria-label={`${p.animalName} ${p.emotionName}`} style={{ ...box(r), height: 'auto', maxHeight: r.h, top: r.y + r.h / 2, y: '-50%' }} {...pop(0.05)}>
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
          {label}
        </button>
      </motion.div>
    </>
  )
}
