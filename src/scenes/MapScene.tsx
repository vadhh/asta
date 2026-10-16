import { Img, Box, Btn, useArt, useOrient, inset, rel, union, float, pop, box, pick, artSrc, type Rect } from '../stage'
import { sfx } from '../audio'
import { ISLANDS, type Island, type Scene } from '../App'
import { PlankBtn, face } from './ui'
import C from '../content.json'

const SIGN = 'layers/p4-map/sign-reronce.webp'

/** Dunia ASTA: the hub. Islands open in any order; check-in, help and closing are always one tap away. */
export default function MapScene({ done, onOpen }: { done: Island[]; onOpen: (s: Scene) => void }) {
  const L = useArt('p4-map')
  const o = useOrient()
  const bubble = L('speech-bubble')
  const [checkIn, help, closing] = pick<Rect[]>(
    o,
    [{ x: 370, y: 1340, w: 500, h: 112 }, { x: 370, y: 1466, w: 242, h: 106 }, { x: 628, y: 1466, w: 242, h: 106 }],
    [{ x: 170, y: 762, w: 500, h: 112 }, { x: 686, y: 762, w: 250, h: 112 }, { x: 952, y: 762, w: 250, h: 112 }],
  )
  const tap = (s: Scene) => () => (sfx('tap'), onOpen(s))
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
      {o === 'landscape' && <Img r={L('whale')} {...float(0.6, 8, 2.6)} />}
      {ISLANDS.map((id, i) => {
        // Signs are widened 9-slice so the subtitle stays legible on phones.
        const s0 = L(`sign-${id}`)
        const layers = [L(`island-${id}`), L(`icon-${id}`), { ...s0, x: s0.x - 60, w: s0.w + 120, h: s0.h + 44, slice: 40 }]
        const u = union(layers)
        const sign = rel(layers[2], u)
        const isDone = done.includes(id)
        return (
          <Btn key={id} layers={layers} label={C.map.islands[id].name} onClick={() => (sfx('tap'), onOpen(id))} className={`island float-${i}`}>
            {/* inset to the sign's flat face: its bottom ~40px is the frame and logs */}
            <Box r={inset(sign, [34, 36, 40, 36])} className="center col t-sign" fit>
              <span>{C.map.islands[id].name}</span>
              <span className="t-sign-sub">{C.map.islands[id].sub}</span>
            </Box>
            {isDone && <img className="layer done-badge" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" style={{ left: sign.x + sign.w - 70, top: sign.y - 30, width: 96, height: 76 }} />}
          </Btn>
        )
      })}
      <Img r={bubble} {...pop(0.6)} />
      <Box r={inset(bubble, [26, 26, 62, 26])} className="center t-small" fit {...pop(0.65)}>
        {C.map.speech}
      </Box>
      <Img r={L('asta-peek')} {...float(0, 8)} />
      <PlankBtn src={SIGN} slice={40} icon={face('senang')} className="layer map-btn" style={box(checkIn)} onClick={tap('emotion')}>
        {C.map.checkIn}
      </PlankBtn>
      <PlankBtn src={SIGN} slice={40} className="layer map-btn" style={box(help)} onClick={tap('guide')}>
        {C.map.help}
      </PlankBtn>
      <PlankBtn src={SIGN} slice={40} className="layer map-btn" style={box(closing)} onClick={tap('closing')}>
        {C.map.closing}
      </PlankBtn>
    </>
  )
}
