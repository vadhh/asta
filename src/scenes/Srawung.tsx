import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Img, Box, useArt, useOrient, box, pick, float, pop, artSrc, type Rect, scaledPlank } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'
import D from '../srawung-cards.json'
import { PlankBtn } from './ui'
import './srawung.css'

const S = C.srawung
const WOOD = 'layers/p1-home/button-wood.webp'
const BORDER = 14 // card border, frame px (kept in sync with .sc-face in srawung.css)
type Card = (typeof D.cards)[number]
const EMO = D.emotions as Record<string, (typeof D.emotions)['senang']>

const shuffle = <T,>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Sahabat Hewan: a facilitator-led guessing game on one shared screen. Guide → one random animal card face up →
 *  the children guess the animal and how it feels → the facilitator flips it to read the emotion and Aksi tips
 *  together → next card. No repeats until all 32 are seen; no score, nothing stored. */
export default function Srawung({ onDone }: { onDone: () => void }) {
  const L = useArt('p6-reronce')
  const o = useOrient()
  const [deck, setDeck] = useState<Card[] | null>(null) // null = guide page
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const start = () => {
    sfx('page')
    setDeck(shuffle(D.cards))
    setI(0)
  }
  const next = () => {
    sfx('page')
    setFlipped(false)
    if (i + 1 < deck!.length) return setI(i + 1)
    // Whole deck seen: reshuffle, without showing the same card twice in a row.
    const d = shuffle(D.cards)
    if (d[0].id === deck![i].id) d.push(d.shift()!)
    setDeck(d)
    setI(0)
  }
  const flip = () => {
    sfx('card-flip')
    setFlipped(true)
  }
  const back = () => (sfx('tap'), onDone())

  // Portrait gets a bigger plank: the frame is narrow, so its subtitle would otherwise be tiny on phones.
  const tp = L('title-plank')
  const P = scaledPlank(tp, pick(o, 1.45, 1.4))
  // The card takes the whole width (no Asta) so the back's text stays big enough to read together.
  const card = pick<Rect>(o, { x: 80, y: 272, w: 740, h: 1088 }, { x: 150, y: 226, w: 1300, h: 548 })
  const actions = pick<Rect>(o, { x: 80, y: 1394, w: 740, h: 120 }, { x: 150, y: 790, w: 1300, h: 100 })

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

      {deck ? (
        <>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={deck[i].id}
              className="layer sc"
              style={box(card)}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -120, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CardFaces card={deck[i]} flipped={flipped} r={card} />
            </motion.div>
          </AnimatePresence>
          <div className="layer sc-actions" style={box(actions)}>
            <Plank onClick={back}>{S.card.back}</Plank>
            {flipped ? (
              <Plank onClick={next}>{S.card.next}</Plank>
            ) : (
              <Plank onClick={flip} className="pulse">
                {S.card.flip}
              </Plank>
            )}
          </div>
        </>
      ) : (
        <>
          <motion.div className={`layer box sh ${o}`} style={box(pick<Rect>(o, { x: 40, y: 272, w: 820, h: 960 }, { x: 420, y: 200, w: 1070, h: 650 }))} {...pop(0.05)}>
            <h2 className="t-heading">{S.guide.heading}</h2>
            <ol className="t-body sh-steps">
              {S.guide.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="sh-tip">
              <b>{S.pendamping}</b> {S.guide.tip}
            </p>
            <Plank onClick={start} className="sh-start">
              {S.guide.start}
            </Plank>
          </motion.div>
          <Box r={pick<Rect>(o, { x: 250, y: 1375, w: 610, h: 160 }, { x: 40, y: 200, w: 330, h: 150 })} className="center t-small speech-box" fit {...pop(0.4)}>
            {S.guide.speech}
          </Box>
          <Img r={L('asta-wave')} {...float(0.3, 10)} />
        </>
      )}
    </>
  )
}

function Plank({ onClick, className = '', children }: { onClick: () => void; className?: string; children: string }) {
  return (
    <PlankBtn src={WOOD} slice={56} pad={[62, 62]} padY={[4, 14]} className={`choice ${className}`} onClick={onClick}>
      {children}
    </PlankBtn>
  )
}

/** The card: front = the animal photo and a guessing prompt; back = name, emotion, what it means and Aksi tips. */
function CardFaces({ card, flipped, r }: { card: Card; flipped: boolean; r: Rect }) {
  const o = useOrient()
  const e = EMO[card.emotion]
  const inner = { x: 0, y: 0, w: r.w - 2 * BORDER, h: r.h - 2 * BORDER }
  return (
    <motion.div className="flip-inner" initial={false} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
      <div className={`sc-face sc-front ${o}`} aria-hidden={flipped}>
        <img className="sc-photo" src={artSrc(`layers/extra/animal-${card.id}.webp`)} alt="" />
        <p className="t-question">{S.card.prompt}</p>
      </div>
      <div className={`sc-face sc-back ${o}`} aria-hidden={!flipped} role="status">
        <Box r={inner} className={`sc-back-box ${o}`} fit>
          <div className={`sc-info ${o}`}>
            <div className="sc-about">
              <div className="sc-head">
                <h2>{card.name}</h2>
                <span className="sc-chip">
                  {e.emoji} {e.label}
                </span>
              </div>
              <p className="sc-desc">{e.desc}</p>
            </div>
            <div className="sc-aksi">
              <h3>{S.card.aksi} 💡</h3>
              <ul>
                {e.aksi.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </Box>
      </div>
    </motion.div>
  )
}
