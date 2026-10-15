import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Img, Box, Btn, useArt, useOrient, inset, box, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'

const T = C.titen
type Option = { text: string; icon?: string; correct?: boolean; feedback?: string }

export default function Titen({ onDone }: { onDone: () => void }) {
  const L = useArt('p8-titen')
  const o = useOrient()
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const q = T.questions[qi]
  const options = q.options as Option[]
  const solved = picked !== null && options[picked].correct

  // Option slots follow the exported cards; all use card-b's size (card-a is the selected art with its green ring).
  const b = L('card-b')
  const slots: Rect[] = ['card-a-selected', 'card-b', 'card-c'].map((n) => {
    const c = L(n)
    return { x: c.x + c.w / 2 - b.w / 2, y: c.y + c.h - b.h, w: b.w, h: b.h }
  })

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return
    setPicked(i)
    if (options[i].correct) {
      sfx('correct')
      buzz(40)
    } else {
      sfx('try-again')
      setWrong((w) => [...w, i])
    }
  }
  const next = () => {
    sfx('page')
    if (qi + 1 >= T.questions.length) return onDone()
    setQi(qi + 1)
    setPicked(null)
    setWrong([])
  }

  const tipText = picked === null ? T.pick.text : solved ? q.explain : options[picked].feedback
  const question = pick<Rect>(o, { x: 60, y: 172, w: 780, h: 150 }, { x: 250, y: 158, w: 1100, h: 116 })

  return (
    <>
      {o === 'landscape' && <Img r={L('panel')} />}
      <Img r={L('binder-clip')} />
      <Img r={L('title-plank')} {...pop(0)} />
      <Img r={L('leaf-1')} />
      <Img r={L('leaf-2')} />
      <Box r={inset(L('title-plank'), [14, 80, 24, 80])} className="center t-plank-dark t-sm-caps nowrap" fit>
        {T.title} • {T.sub}
      </Box>
      <AnimatePresence mode="wait">
        <motion.div key={qi} className="layer fill" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}>
          <Box r={question} className={`center t-question ${o === 'portrait' ? 'speech-box' : ''}`} fit>
            {q.q}
          </Box>
          {options.map((opt, i) => {
            const s = slots[i]
            const isRight = solved && i === picked
            const isWrong = wrong.includes(i)
            return (
              <motion.button
                key={i}
                className={`layer option ${isWrong ? 'wrong' : ''}`}
                style={box(s)}
                onClick={() => choose(i)}
                aria-pressed={i === picked}
                disabled={isWrong || !!solved}
                animate={isWrong && i === picked ? { x: [0, -14, 14, -8, 8, 0] } : isRight ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.45 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  className="layer"
                  src={artSrc(isRight ? 'layers/p8-titen/card-a-selected.webp' : 'layers/p8-titen/card-b.webp')}
                  alt=""
                  style={isRight ? { left: 0, top: -10, width: s.w, height: s.h + 20 } : { inset: 0, width: '100%', height: '100%' }}
                />
                {isRight && <img className="layer check" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" style={{ right: -26, top: -40, width: 96, height: 76 }} />}
                <span className={`opt-body ${opt.icon ? '' : 'text-only'}`}>
                  {opt.icon && <img src={artSrc(`layers/p8-titen/${opt.icon}.webp`)} alt="" />}
                  <span className="t-option">
                    {'ABC'[i]}. {opt.text}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>

      <Img r={L('tip-panel')} />
      <Img r={L('leaf-3')} />
      <Img r={L('tip-header')} />
      <Img r={L('sparkles')} />
      <Box r={inset(L('tip-header'), [8, 20, 16, 40])} className="center-y t-chip-dark" fit>
        {T.tipTitle}
      </Box>
      <Box
          key={`${qi}-${picked}`}
          r={inset(L('tip-panel'), [L('tip-header').h + 28, 50, 24, 70])}
          className="t-body"
          fit
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          aria-live="polite"
        >
          {tipText}
        </Box>
      <div className="layer dots" style={box(pick<Rect>(o, { x: 300, y: 1310, w: 300, h: 40 }, { x: 650, y: 775, w: 300, h: 40 }))} aria-label={`Soal ${qi + 1} dari ${T.questions.length}`}>
        {T.questions.map((_, i) => (
          <span key={i} className={i <= qi ? 'on' : ''} />
        ))}
      </div>

      <Img r={L('asta-wave')} {...float(0.2, 10)} />
      <Btn layers={[L('button-green-round'), L('icon-arrow')]} label="Lanjut" disabled={!solved} className={solved ? 'pulse' : 'dim'} onClick={next} />
    </>
  )
}
