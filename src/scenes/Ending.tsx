import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, useOrient, inset, rel, union, pick, float, pop, type Rect } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

const E = C.ending
const CONFETTI = ['#f5c431', '#e5483b', '#4fae4a', '#3a7fd6', '#9a62d8', '#ff9f43']

export default function Ending({ onMap }: { onMap: () => void }) {
  const L = useArt('p1-home')
  const o = useOrient()
  const btn = [L('button-wood'), L('icon-play'), L('sparkles')]
  const asta = pick<Rect>(o, { x: 0, y: 700, w: 486, h: 542 }, L('asta-wave'))
  const bubble = pick<Rect>(o, { x: 380, y: 610, w: 500, h: 300 }, { x: 1010, y: 260, w: 540, h: 300 })
  return (
    <>
      {Array.from({ length: 36 }, (_, i) => (
        <motion.span
          key={i}
          className="layer confetti"
          style={{ left: `${(i * 37) % 100}%`, top: -40, background: CONFETTI[i % CONFETTI.length] }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: pick(o, 1700, 1000), rotate: 360 * (i % 2 ? 1 : -1), opacity: [1, 1, 0] }}
          transition={{ duration: 3 + (i % 5) * 0.5, delay: (i % 9) * 0.25, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <Img r={L('fence')} />
      <Img r={L('signpost')} />
      <Img r={{ ...asta, src: L('asta-wave').src }} {...float(0, 16, 1.6)} />
      <motion.div className="layer" style={{ left: L('title-sign').x, top: L('title-sign').y, width: L('title-sign').w, height: L('title-sign').h }} {...pop(0.1)}>
        <Img r={rel(L('title-sign'), L('title-sign'))} bleed={false} />
        <Box r={inset(rel(L('title-sign'), L('title-sign')), [130, 70, 60, 70])} className="center col t-logo-box" fit>
          <span className="t-logo">{E.title}</span>
          <span className="t-tagline">{E.tagline}</span>
        </Box>
      </motion.div>
      <Box r={bubble} className="center t-body speech-box" fit {...pop(0.6)}>
        {E.speech}
      </Box>
      <Btn layers={btn} label={E.button} onClick={() => (sfx('tap'), onMap())} className="pulse">
        <Box r={inset(rel(L('button-wood'), union(btn)), [14, 30, 34, 166])} className="center t-button nowrap" fit>
          {E.button}
        </Box>
      </Btn>
      <Img r={L('bush-left')} />
      <Img r={L('bush-flowers-right')} />
    </>
  )
}
