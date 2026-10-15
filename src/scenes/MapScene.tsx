import { Img, Box, Btn, useArt, useOrient, inset, rel, union, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx } from '../audio'
import { ISLANDS, type Island } from '../App'
import C from '../content.json'

export default function MapScene({ done, onOpen }: { done: Island[]; onOpen: (i: Island) => void }) {
  const L = useArt('p4-map')
  const bubble = pick<Rect>(useOrient(), { x: 270, y: 1300, w: 316, h: 225 }, { x: 1000, y: 650, w: 295, h: 210 }) // enlarged for legible text
  const decor = ['book-corner', 'dice', 'coin', 'coin-small', 'gem', 'chest', 'spyglass', 'compass']
  return (
    <>
      {decor.map((d) => {
        try {
          return <Img key={d} r={L(d)} />
        } catch {
          return null // portrait layout drops some props
        }
      })}
      <Img r={L('whale')} {...float(0.6, 8, 2.6)} />
      {ISLANDS.map((id, i) => {
        // Signs are widened 9-slice so the subtitle stays legible on phones.
        const s0 = L(`sign-${id}`)
        const layers = [L(`island-${id}`), L(`icon-${id}`), { ...s0, x: s0.x - 40, w: s0.w + 80, h: s0.h + 14, slice: 40 }]
        const u = union(layers)
        const sign = rel(layers[2], u)
        const isDone = done.includes(id)
        return (
          <Btn key={id} layers={layers} label={C.map.islands[id].name} onClick={() => (sfx('tap'), onOpen(id))} className={`island float-${i}`}>
            <Box r={inset(sign, [28, 30, 24, 30])} className="center col t-sign" fit>
              <span>{C.map.islands[id].name}</span>
              <span className="t-sign-sub">{C.map.islands[id].sub}</span>
            </Box>
            {isDone && <img className="layer done-badge" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" style={{ left: sign.x + sign.w - 70, top: sign.y - 30, width: 96, height: 76 }} />}
          </Btn>
        )
      })}
      {/* mirrored so the tail points at Asta, who peeks in from the right */}
      <Img r={{ ...bubble, src: L('speech-bubble').src }} {...pop(0.6)} style={{ scaleX: -1 }} />
      <Box r={inset(bubble, [26, 26, 62, 26])} className="center t-small" fit {...pop(0.65)}>
        {done.length ? C.map.speechProgress.text : C.map.speech}
      </Box>
      <Img r={L('asta-peek')} {...float(0, 8)} />
    </>
  )
}
