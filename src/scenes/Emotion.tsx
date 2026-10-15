import { useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, Panel, useArt, useOrient, inset, box, rel, union, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'

export default function Emotion({ onNext }: { onNext: () => void }) {
  const L = useArt('p3-emotion')
  const o = useOrient()
  const [picked, setPicked] = useState<string | null>(null)
  const item = C.emotion.items.find((e) => e.id === picked) ?? C.emotion.empty
  // Only "sedih" was exported in its selected look, so tiles are drawn in CSS on the card grid.
  const tileRect = (id: string) =>
    id === 'sedih' ? { ...L('card-bingung'), y: L('card-senang').y, h: L('card-senang').h } : L(`card-${id}`)
  const next = [L('button-green'), L('icon-arrow-white')]
  // Portrait: the exported board leaves a tall empty strip under the tiles and the tip panel is too
  // small for the response text, so shorten the board and grow the tip panel (9-slice, no stretching).
  const board = pick<Rect>(o, { ...L('board'), h: 530 }, L('board'))
  const tip = pick<Rect>(o, { ...L('tip-panel'), y: 735, h: 300 }, L('tip-panel'))
  const tipHeader = pick<Rect>(o, { x: 150, y: 755, w: 600, h: 60 }, L('tip-header'))
  const bubble = pick<Rect>(o, { x: 345, y: 1150, w: 360, h: 202 }, L('speech-bubble')) // portrait: uniform 1.35x for legible text
  const badge = pick<Rect>(o, { ...L('asta-head-badge'), x: 100, y: 830 }, L('asta-head-badge'))
  return (
    <>
      <Img r={L('plant-desk-left')} />
      <Img r={L('plant-right')} />
      <Img r={L('title-plank')} />
      <Box r={inset(L('title-plank'), [16, 40, 24, 40])} className="center t-plank nowrap" fit>
        {C.emotion.title}
      </Box>
      <Panel r={board} src={L('board').src} slice={70} />
      <Img r={L('board-header')} />
      <Box r={inset(L('board-header'), [16, 40, 22, 40])} className="center t-heading nowrap" fit>
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
            aria-label={e.label}
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
      <Panel r={tip} src={L('tip-panel').src} slice={48} />
      <Panel r={tipHeader} src={L('tip-header').src} slice={28} />
      <Img r={{ ...badge, src: L('asta-head-badge').src }} animate={{ rotate: picked ? [0, -8, 8, 0] : 0 }} key={picked} />
      <motion.div key={picked ?? 'none'} className="layer fill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
        <Box r={inset(tipHeader, [6, 28, 12, 28])} className="center t-chip nowrap" fit>
          {item.title}
        </Box>
        <Box
          r={inset(tip, [tipHeader.y + tipHeader.h - tip.y + 16, 40, 26, badge.x + badge.w - tip.x + 24])}
          className="center-y t-body"
          fit
        >
          {item.text}
        </Box>
      </motion.div>
      <Img r={L('asta-full')} {...float(0, 10)} />
      <Img r={{ ...bubble, src: L('speech-bubble').src }} {...pop(0.5)} />
      <Box r={inset(bubble, [24, 26, 56, 32])} className="center t-small" fit {...pop(0.55)}>
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
