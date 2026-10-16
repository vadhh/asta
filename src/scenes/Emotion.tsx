import { useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, Panel, useArt, useOrient, inset, box, rel, union, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx, buzz } from '../audio'
import type { Target } from '../App'
import Validation from './Validation'
import { face } from './ui'
import C from '../content.json'

// Tiles are drawn in CSS on the exported card grid, in PRD order (the export's own card names don't match).
const SLOTS = ['card-senang', 'card-sedih-selected', 'card-marah', 'card-takut', 'card-cemas', 'card-bingung', 'card-kesepian', 'card-lelah']

/** Emotional Check-in, then its validation. Nothing picked here is stored. */
export default function Emotion({ onOpen, onMap }: { onOpen: (t: Target) => void; onMap: () => void }) {
  const L = useArt('p3-emotion')
  const o = useOrient()
  const [picked, setPicked] = useState<string | null>(null)
  const [validate, setValidate] = useState(false)
  const item = C.emotion.items.find((e) => e.id === picked)
  if (validate && item) return <Validation item={item} onOpen={onOpen} onMap={onMap} />
  // Landscape: the tip panel grows downward (9-slice) for readable text, so the Lanjut button moves down with it.
  const next = [L('button-green'), L('icon-arrow-white')].map((l) => pick(o, l, { ...l, y: l.y + 30 }))
  const skip = { ...next[0], layer: 'skip', src: 'layers/p1-home/button-wood.webp', x: next[0].x - pick(o, 260, 262), slice: 46 }
  // Portrait: the exported board leaves a tall empty strip under the tiles, so shorten the board and grow the tip
  // panel (9-slice, no stretching) for the emotion's description. Landscape: lift the board and shorten the tiles
  // (same 16 px gaps) to make room for a taller tip panel above the buttons.
  const lift = pick(o, 0, -50)
  const tileH = pick(o, 188, 143) // slot height; tiles are inset 8 px, so gaps stay 16
  const slot = (i: number): Rect => pick(o, L(SLOTS[i]), { ...L(SLOTS[i]), y: L('card-senang').y + lift + (i >> 2) * tileH, h: tileH })
  const board = pick<Rect>(o, { ...L('board'), h: 530 }, { ...L('board'), y: L('board').y + lift, h: L('board').h - lift })
  const tip = pick<Rect>(o, { x: 50, y: 735, w: 800, h: 410 }, { x: 594, y: 431, w: 891, h: 364 })
  // The tip-panel art has a halo for Asta's badge on its left; after 9-slice its right edge lands at haloR (frame px
  // from the panel's left). Chip and text share the column between the halo and the inner frame line (30 px in);
  // landscape text fills its box down to the bottom-right leaf, so there the column stops at the leaf (53 px in).
  const haloR = 48 + (149 * (tip.w - 96)) / 667
  const gap = pick(o, 14, 10)
  const col = { x: tip.x + haloR + gap, w: tip.w - haloR - pick(o, 30, 53) - 2 * gap }
  const tipHeader = { ...col, y: tip.y + 17, h: pick(o, 66, 60) }
  // Text box keeps 14 px to the chip above and to the inner frame line below (24 px up from the panel's bottom).
  const tipText = { ...col, y: tipHeader.y + tipHeader.h + 14, h: tip.y + tip.h - 38 - (tipHeader.y + tipHeader.h + 14) }
  const badge = { ...L('asta-head-badge'), x: tip.x + (43 + haloR) / 2 - 135 / 2, y: tip.y + (tip.h + 27) / 2 - 150 / 2, w: 135, h: 150 }
  const bubble = pick<Rect>(o, { x: 345, y: 1185, w: 360, h: 202 }, { x: 372, y: 128, w: 334, h: 188 }) // uniform scale-up for legible text
  return (
    <>
      <Img r={L('plant-desk-left')} />
      <Img r={L('plant-right')} />
      <Img r={L('title-plank')} />
      <Box r={inset(L('title-plank'), [16, 40, 24, 40])} className="center t-plank nowrap" fit>
        {C.emotion.title}
      </Box>
      <Panel r={board} src={L('board').src} slice={70} />
      <Img r={{ ...L('board-header'), y: L('board-header').y + lift }} />
      <Box r={inset({ ...L('board-header'), y: L('board-header').y + lift }, [16, 40, 22, 40])} className="center t-heading nowrap" fit>
        {C.emotion.question}
      </Box>
      {C.emotion.items.map((e, i) => {
        const on = e.id === picked
        return (
          <motion.button
            key={e.id}
            className={`layer tile ${on ? 'on' : ''}`}
            style={box(inset(slot(i), [8, 8, 8, 8]))}
            aria-pressed={on}
            aria-label={e.label}
            onClick={() => (sfx('emotion-select'), buzz(), setPicked(e.id))}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: on ? 1.08 : 1, opacity: 1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17, delay: on ? 0 : 0.1 + i * 0.04 }}
          >
            <img src={artSrc(face(e.id))} alt="" draggable={false} />
            <span>{e.label}</span>
            {on && <img className="check" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" />}
          </motion.button>
        )
      })}
      {/* Cream underlay: the 9-slice seams would otherwise show the room through as hairlines behind the text. */}
      <div className="layer tip-under" style={box(inset(tip, [16, 16, 16, 16]))} />
      <Panel r={tip} src={L('tip-panel').src} slice={48} />
      <Panel r={tipHeader} src={L('tip-header').src} slice={28} />
      <Img r={{ ...badge, src: L('asta-head-badge').src }} animate={{ rotate: picked ? [0, -8, 8, 0] : 0 }} key={`badge-${picked}`} />
      <motion.div key={picked ?? 'none'} className="layer fill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} aria-live="polite">
        <Box r={inset(tipHeader, [4, 28, 10, 28])} className="center t-chip nowrap" fit>
          {item?.label ?? C.emotion.hint.title}
        </Box>
        <Box r={tipText} className="center t-body t-tip" fit>
          {item?.description ?? C.emotion.hint.text}
        </Box>
      </motion.div>
      <Img r={L('asta-full')} {...float(0, 10)} />
      <Img r={{ ...bubble, src: L('speech-bubble').src }} {...pop(0.5)} />
      <Box r={inset(bubble, [24, 26, 56, 32])} className="center t-small" fit {...pop(0.55)}>
        {C.emotion.speech}
      </Box>
      <Btn layers={[skip]} label={C.emotion.skip} onClick={() => (sfx('tap'), onMap())}>
        <Box r={inset(rel(skip, skip), [8, 20, 18, 20])} className="center t-button t-button-sm nowrap" fit>
          {C.emotion.skip}
        </Box>
      </Btn>
      <Btn layers={next} label={C.emotion.next} disabled={!picked} onClick={() => (sfx('tap'), setValidate(true))} className={picked ? 'pulse' : 'dim'}>
        <Box r={inset(rel(next[0], union(next)), [10, 80, 22, 24])} className="center t-button t-button-sm" fit>
          {C.emotion.next}
        </Box>
      </Btn>
    </>
  )
}
