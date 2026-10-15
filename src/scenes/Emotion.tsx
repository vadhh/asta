import { useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, inset, box, rel, union, float, pop, artSrc } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'

export default function Emotion({ onNext }: { onNext: () => void }) {
  const L = useArt('p3-emotion')
  const [picked, setPicked] = useState<string | null>(null)
  const item = C.emotion.items.find((e) => e.id === picked) ?? C.emotion.empty
  // Only "sedih" was exported in its selected look, so tiles are drawn in CSS on the card grid.
  const tileRect = (id: string) =>
    id === 'sedih' ? { ...L('card-bingung'), y: L('card-senang').y, h: L('card-senang').h } : L(`card-${id}`)
  const next = [L('button-green'), L('icon-arrow-white')]
  return (
    <>
      <Img r={L('plant-desk-left')} />
      <Img r={L('plant-right')} />
      <Img r={L('title-plank')} />
      <Box r={inset(L('title-plank'), [12, 40, 22, 40])} className="center t-plank">
        {C.emotion.title}
      </Box>
      <Img r={L('board')} />
      <Img r={L('board-header')} />
      <Box r={inset(L('board-header'), [12, 30, 22, 30])} className="center t-heading" fit>
        {C.emotion.question}
      </Box>
      {C.emotion.items.map((e, i) => {
        const on = e.id === picked
        return (
          <motion.button
            key={e.id}
            className={`layer tile ${on ? 'on' : ''}`}
            style={box(inset(tileRect(e.id), [8, 8, 8, 8]))}
            aria-pressed={on}
            onClick={() => (sfx('emotion-select'), buzz(), setPicked(e.id))}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: on ? 1.08 : 1, opacity: 1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17, delay: on ? 0 : 0.1 + i * 0.04 }}
          >
            <img src={artSrc(`layers/extra/face-${e.id}.webp`)} alt="" draggable={false} />
            <span>{e.label}</span>
            {on && <img className="check" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" />}
          </motion.button>
        )
      })}
      <Img r={L('tip-panel')} />
      <Img r={L('tip-header')} />
      <Img r={L('asta-head-badge')} animate={{ rotate: picked ? [0, -8, 8, 0] : 0 }} key={picked} />
      <motion.div key={picked ?? 'none'} className="layer fill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Box r={inset(L('tip-header'), [6, 20, 12, 20])} className="center t-chip" fit>
          {item.title}
        </Box>
        <Box r={inset(L('tip-panel'), [L('tip-header').h + 26, 40, 22, L('asta-head-badge').w + 50])} className="center-y t-body" fit>
          {item.text}
        </Box>
      </motion.div>
      <Img r={L('asta-full')} {...float(0, 10)} />
      <Img r={L('speech-bubble')} {...pop(0.5)} />
      <Box r={inset(L('speech-bubble'), [22, 26, 44, 26])} className="center t-small" fit {...pop(0.55)}>
        {C.emotion.speech}
      </Box>
      <Btn layers={next} label={C.emotion.next} disabled={!picked} onClick={() => (sfx('tap'), onNext())} className={picked ? 'pulse' : 'dim'}>
        <Box r={inset(rel(L('button-green'), union(next)), [10, 80, 22, 24])} className="center t-button t-button-sm" fit>
          {C.emotion.next}
        </Box>
      </Btn>
    </>
  )
}
