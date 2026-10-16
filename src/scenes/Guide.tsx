import { useState } from 'react'
import { Box, Panel, useOrient, inset, box, pick, type Rect } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

const G = C.guide
type Block = { h?: string; p?: string; ul?: string[]; warn?: string }

/** Panduan Pendamping dan Bantuan: an adult reading page. Long sections scroll inside the paper; the page never does. */
export default function Guide({ onBack }: { onBack: () => void }) {
  const o = useOrient()
  const [active, setActive] = useState(0)
  const sec = G.sections[active]
  const plank = pick<Rect>(o, { x: 90, y: 40, w: 720, h: 120 }, { x: 470, y: 18, w: 660, h: 116 })
  const tabs = pick<Rect>(o, { x: 40, y: 180, w: 820, h: 304 }, { x: 30, y: 150, w: 420, h: 626 })
  const paper = pick<Rect>(o, { x: 30, y: 500, w: 840, h: 960 }, { x: 470, y: 146, w: 1100, h: 740 })
  const back = pick<Rect>(o, { x: 250, y: 1478, w: 400, h: 100 }, { x: 30, y: 790, w: 420, h: 96 })
  return (
    <>
      <Panel r={plank} src="layers/p3-emotion/title-plank.webp" slice={44} />
      <Box r={inset(plank, [18, 50, 26, 50])} className="center t-plank nowrap" fit>
        {G.title}
      </Box>
      <div className={`layer guide-tabs ${o}`} role="tablist" style={box(tabs)}>
        {G.sections.map((s, i) => (
          <button key={s.id} role="tab" aria-selected={i === active} className={`pill ${i === active ? 'green' : 'brown'}`} onClick={() => (sfx('page'), setActive(i))}>
            {s.tab}
          </button>
        ))}
      </div>
      <Panel r={paper} src="layers/p5-tataati/paper-page.webp" slice={50} />
      <div key={sec.id} className="layer guide-scroll" role="tabpanel" style={box(inset(paper, [54, 30, 44, 46]))}>
        {(sec.blocks as Block[]).map((b, i) => (
          <section key={i}>
            {b.warn && <p className="warn">{b.warn}</p>}
            {b.h && <h3>{b.h}</h3>}
            {b.p && <p>{b.p}</p>}
            {b.ul && (
              <ul>
                {b.ul.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
      <div className="layer nav-row" style={box(back)}>
        <button className="pill blue" onClick={() => (sfx('tap'), onBack())}>{G.back}</button>
      </div>
    </>
  )
}
