import { Img, Box, Btn, Panel, useArt, useOrient, inset, pick, float, pop, type Rect } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

export default function Greeting({ onNext }: { onNext: () => void }) {
  const L = useArt('p2-greeting')
  const o = useOrient()
  // The info card is grown (9-slice) so the PRD's full "you may choose / stop" message stays readable.
  const card = pick<Rect>(o, { x: 50, y: 985, w: 800, h: 445 }, { x: 990, y: 190, w: 580, h: 510 })
  const label = { ...L('info-label'), x: card.x + 38, y: card.y }
  const bulb = { ...L('icon-bulb'), x: card.x + 57, y: card.y + 19 }
  return (
    <>
      <Img r={L('asta-wave')} {...float(0, 12)} />
      <Img r={L('speech-bubble')} {...pop(0.3)} />
      <Box r={inset(L('speech-bubble'), [40, 40, 90, 50])} className="center t-speech" fit {...pop(0.4)}>
        {C.greeting.speech}
      </Box>
      <Panel r={card} src={L('info-card').src} slice={60} {...pop(0.7)} />
      <Img r={label} {...pop(0.8)} />
      <Img r={bulb} {...pop(0.85)} />
      <Box r={inset(label, [8, 16, 18, 92])} className="center-y t-label nowrap" fit {...pop(0.85)}>
        {C.greeting.infoLabel}
      </Box>
      <Box r={inset(card, [104, 44, 36, 50])} className="t-body t-blue info-text" fit {...pop(0.9)}>
        <p>{C.greeting.info}</p>
        <p>{C.greeting.noWrong.text}</p>
      </Box>
      <Btn layers={[L('button-next-blue'), L('sparkles')]} label={C.greeting.next} onClick={() => (sfx('page'), onNext())} className="pulse" />
    </>
  )
}
