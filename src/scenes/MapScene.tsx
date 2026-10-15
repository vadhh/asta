import { Img, Box, Btn, useArt, inset, rel, union, float, pop, artSrc } from '../stage'
import { sfx } from '../audio'
import { ISLANDS, type Island } from '../App'
import C from '../content.json'

export default function MapScene({ done, onOpen }: { done: Island[]; onOpen: (i: Island) => void }) {
  const L = useArt('p4-map')
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
        const layers = [L(`island-${id}`), L(`icon-${id}`), L(`sign-${id}`)]
        const u = union(layers)
        const sign = rel(L(`sign-${id}`), u)
        const isDone = done.includes(id)
        return (
          <Btn key={id} layers={layers} label={C.map.islands[id].name} onClick={() => (sfx('tap'), onOpen(id))} className={`island float-${i}`}>
            <Box r={inset(sign, [30, 28, 22, 28])} className="center col t-sign" fit>
              <span>{C.map.islands[id].name}</span>
              <span className="t-sign-sub">{C.map.islands[id].sub}</span>
            </Box>
            {isDone && <img className="layer done-badge" src={artSrc('layers/p8-titen/icon-check.webp')} alt="" style={{ left: sign.x + sign.w - 70, top: sign.y - 30, width: 96, height: 76 }} />}
          </Btn>
        )
      })}
      <Img r={L('speech-bubble')} {...pop(0.6)} />
      <Box r={inset(L('speech-bubble'), [20, 20, 46, 20])} className="center t-small" fit {...pop(0.65)}>
        {done.length ? C.map.speechProgress.text : C.map.speech}
      </Box>
      <Img r={L('asta-peek')} {...float(0, 8)} />
    </>
  )
}
