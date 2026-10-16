import { useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Panel, useArt, useOrient, inset, box, pick, pop, float, type Rect } from '../stage'
import { sfx } from '../audio'
import { PlankBtn, ICONS, face } from './ui'
import type { Target } from '../App'
import C from '../content.json'

const V = C.validation
const ALL = Object.keys(V.activities) as Target[]
type Item = (typeof C.emotion.items)[number]

/** Emotional Validation: the PRD message for the picked feeling and 2–3 optional activities. */
export default function Validation({ item, onOpen, onMap }: { item: Item; onOpen: (t: Target) => void; onMap: () => void }) {
  const L = useArt('p3-emotion')
  const o = useOrient()
  const [others, setOthers] = useState(false)
  const recs = item.recs as { to: Target; label: string }[]
  const list = others ? ALL.filter((t) => !recs.some((r) => r.to === t)).map((to) => ({ to, label: V.activities[to] })) : recs

  const board = pick<Rect>(o, { x: 50, y: 180, w: 800, h: 560 }, { x: 40, y: 150, w: 620, h: 720 })
  const header = pick<Rect>(o, { x: 97, y: 200, w: 706, h: 114 }, { x: 70, y: 170, w: 560, h: 104 })
  const faceR = pick<Rect>(o, { x: 350, y: 322, w: 200, h: 200 }, { x: 240, y: 290, w: 220, h: 220 })
  const msg = pick<Rect>(o, { x: 110, y: 525, w: 640, h: 160 }, { x: 90, y: 520, w: 490, h: 270 }) // right side clear of the board's leaf
  const tip = pick<Rect>(o, { x: 40, y: 760, w: 820, h: 620 }, { x: 690, y: 40, w: 770, h: 710 })
  const nav = pick<Rect>(o, { x: 30, y: 1410, w: 840, h: 110 }, { x: 690, y: 770, w: 880, h: 110 })
  return (
    <>
      <Img r={L('title-plank')} />
      <Box r={inset(L('title-plank'), [16, 40, 24, 40])} className="center t-plank nowrap" fit>
        {C.emotion.title}
      </Box>
      <Panel r={board} src={L('board').src} slice={70} {...pop(0.1)} />
      <Panel r={header} src={L('board-header').src} slice={40} {...pop(0.15)} />
      <Box r={inset(header, [14, 40, 22, 40])} className="center t-heading nowrap" fit {...pop(0.15)}>
        {item.label}
      </Box>
      <Img r={{ ...faceR, src: face(item.id) }} className="contain" {...float(0, 8)} />
      <Box r={msg} className="center t-speech valid-msg" fit {...pop(0.3)}>
        {item.validation}
      </Box>
      <Panel r={tip} src="layers/p5-tataati/paper-page.webp" slice={50} {...pop(0.4)} />
      <motion.div key={String(others)} className="layer col rec-list" style={box(inset(tip, [40, 56, 36, 70]))} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="t-heading">{others ? V.copy.othersTitle : V.copy.recTitle}</p>
        <p className="t-small t-muted">{V.copy.note}</p>
        {list.map((r) => (
          <PlankBtn key={r.to} src="layers/p6-reronce/label-draw.webp" slice={30} pad={[34, 44]} padY={[0, 6]} iconSize={60} icon={ICONS[r.to]} className="rec" onClick={() => (sfx('tap'), onOpen(r.to))}>
            {r.label}
          </PlankBtn>
        ))}
      </motion.div>
      <div className="layer nav-row" style={box(nav)}>
        <button className="pill brown" onClick={() => (sfx('tap'), setOthers(!others))}>
          {others ? V.copy.showRecs : V.others}
        </button>
        <button className="pill green" onClick={() => (sfx('tap'), onMap())}>
          {V.back}
        </button>
      </div>
    </>
  )
}
