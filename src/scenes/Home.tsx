import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, inset, rel, union, float, box, artSrc } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

export default function Home({ onStart }: { onStart: () => void }) {
  const L = useArt('p1-home')
  return (
    <>
      {/* canopy is pinned to the top-left screen corner; it breathes by scaling from that corner (rotating would
          open a gap along a pinned edge). The lamp post stands still. */}
      <Img r={L('tree-branch')} animate={{ scale: [1, 1.025, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '0 0' }} />
      <Img r={L('lantern')} onBg />
      <Img r={L('signpost')} onBg />
      <Img r={L('fence')} onBg />
      <Img r={L('asta-wave')} {...float(0, 14)} />
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
      <PlayButton L={L} label={C.home.start} onClick={() => (sfx('tap'), onStart())} />
      <Img r={L('bush-left')} />
      <Img r={L('bush-flowers-right')} />
    </>
  )
}


/** Wooden play button: the play icon and label are one group centred on the plank's face, vertically centred together. */
export function PlayButton({ L, label, onClick }: { L: ReturnType<typeof useArt>; label: string; onClick: () => void }) {
  const layers = [L('button-wood'), L('sparkles')]
  return (
    <Btn layers={layers} label={label} onClick={onClick} className="pulse">
      <Box r={inset(rel(L('button-wood'), union(layers)), [12, 34, 30, 34])} className="center t-button nowrap play-label" fit>
        <img src={artSrc(L('icon-play').src)} alt="" draggable={false} />
        <span>{label}</span>
      </Box>
    </Btn>
  )
}
