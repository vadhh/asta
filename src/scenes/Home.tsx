import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, inset, rel, union, float, box } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

export default function Home({ onStart }: { onStart: () => void }) {
  const L = useArt('p1-home')
  const btn = [L('button-wood'), L('icon-play'), L('sparkles')]
  const u = union(btn)
  return (
    <>
      {/* whole tree sways gently from its trunk; the lamp post stands still */}
      <Img r={L('tree-branch')} animate={{ rotate: [0, 0.8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '50% 100%' }} />
      <Img r={L('lantern')} />
      <Img r={L('signpost')} />
      <Img r={L('fence')} />
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
      <Btn layers={btn} label={C.home.start} onClick={() => (sfx('tap'), onStart())} className="pulse">
        <Box r={inset(rel(L('button-wood'), u), [14, 30, 34, 166])} className="center t-button nowrap" fit>
          {C.home.start}
        </Box>
      </Btn>
      <Img r={L('bush-left')} />
      <Img r={L('bush-flowers-right')} />
    </>
  )
}

