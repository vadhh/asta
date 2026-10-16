import { motion } from 'motion/react'
import { useOrient, box, pick, pop, artSrc, type Rect } from '../stage'
import type { Island } from '../App'
import C from '../content.json'

/** Thank-you card shown over the stage when an island is finished. */
export default function Complete({ island, onBack, onClose }: { island: Island; onBack: () => void; onClose: () => void }) {
  const o = useOrient()
  const r = pick<Rect>(o, { x: 40, y: 480, w: 820, h: 640 }, { x: 390, y: 170, w: 820, h: 560 })
  return (
    <>
      <motion.div className="layer scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="layer done-card col center" role="dialog" aria-label={C.complete.title} style={box(r)} {...pop(0.1)}>
        <motion.img
          src={artSrc('layers/p3-emotion/asta-head-badge.webp')}
          alt=""
          animate={{ rotate: [0, -10, 10, -6, 0], y: [0, -16, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
        />
        <h2 className="t-logo t-logo-sm">{C.complete.title}</h2>
        <p className="t-body center-text">{C.complete.messages[island]}</p>
        <div className="nav-row">
          <button className="pill brown" onClick={onClose}>
            {C.complete.close}
          </button>
          <button className="pill green" onClick={onBack} autoFocus>
            {C.complete.back}
          </button>
        </div>
      </motion.div>
    </>
  )
}
