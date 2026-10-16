import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, useOrient, inset, rel, union, float, box, pick, pop, artSrc, type Rect } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

export default function Home({ onStart, onGuide }: { onStart: () => void; onGuide: () => void }) {
  const L = useArt('p1-home')
  const o = useOrient()
  // Portrait: Asta steps down a little to make room for the one-line "what is ASTA" under the sign.
  const asta = pick<Rect>(o, { x: 215, y: 730, w: 470, h: 524 }, L('asta-wave'))
  const about = pick<Rect>(o, { x: 70, y: 584, w: 760, h: 140 }, { x: 440, y: 474, w: 720, h: 122 })
  const wood = L('button-wood')
  const guide = { ...wood, layer: 'guide', x: wood.x + wood.w / 2 - 220, y: pick(o, 1408, 770), w: 440, h: 100, slice: 48 }
  return (
    <>
      {/* canopy is pinned to the top-left screen corner; it breathes by scaling from that corner (rotating would
          open a gap along a pinned edge). The lamp post stands still. */}
      <Img r={L('tree-branch')} animate={{ scale: [1, 1.025, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '0 0' }} />
      <Img r={L('lantern')} onBg />
      <Img r={L('signpost')} onBg />
      <Img r={L('fence')} onBg />
      <Img r={{ ...asta, src: L('asta-wave').src }} {...float(0, 14)} />
      <motion.div
        className="layer"
        initial={{ y: -500, rotate: -6 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 11, delay: 0.2 }}
        style={box(L('title-sign'))}
      >
        <Img r={rel(L('title-sign'), L('title-sign'))} bleed={false} />
        <Box r={inset(rel(L('title-sign'), L('title-sign')), [130, 70, 60, 70])} className="center col t-logo-box" fit>
          <span className="t-logo">{C.home.title}</span>
          <span className="t-tagline">{C.home.tagline}</span>
        </Box>
      </motion.div>
      <Img r={L('bush-left')} />
      <Img r={L('bush-flowers-right')} />
      <PlayButton L={L} label={C.home.start} onClick={() => (sfx('tap'), onStart())} />
      {/* after the play button so its sparkles sit behind the text */}
      <Box r={about} className="center t-body speech-box" fit {...pop(0.5)}>
        {C.home.about.text}
      </Box>
      <Btn layers={[guide]} label={C.home.guide} onClick={() => (sfx('tap'), onGuide())}>
        <Box r={inset(rel(guide, guide), [10, 30, 22, 30])} className="center t-button t-button-xs nowrap" fit>
          {C.home.guide}
        </Box>
      </Btn>
    </>
  )
}


/** Wooden play button, widened (9-slice) for the longer label: the play icon and label are one group centred on
 *  the plank's face, vertically centred together. */
function PlayButton({ L, label, onClick }: { L: ReturnType<typeof useArt>; label: string; onClick: () => void }) {
  const g = 80
  const w0 = L('button-wood'), s0 = L('sparkles')
  const wood = { ...w0, x: w0.x - g, w: w0.w + 2 * g, slice: 70 }
  const layers = [wood, { ...s0, x: s0.x + g }]
  return (
    <Btn layers={layers} label={label} onClick={onClick} className="pulse">
      <Box r={inset(rel(wood, union(layers)), [12, 34, 30, 34])} className="center t-button nowrap play-label" fit>
        <img src={artSrc(L('icon-play').src)} alt="" draggable={false} />
        <span>{label}</span>
      </Box>
    </Btn>
  )
}
