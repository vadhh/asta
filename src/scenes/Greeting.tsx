import { Img, Box, Btn, useArt, inset, float, pop } from '../stage'
import { sfx } from '../audio'
import C from '../content.json'

export default function Greeting({ onNext }: { onNext: () => void }) {
  const L = useArt('p2-greeting')
  return (
    <>
      <Img r={L('asta-wave')} {...float(0, 12)} />
      <Img r={L('speech-bubble')} {...pop(0.3)} />
      <Box r={inset(L('speech-bubble'), [40, 40, 90, 50])} className="center t-speech" {...pop(0.4)}>
        {C.greeting.speech}
      </Box>
      <Img r={L('info-card')} {...pop(0.7)} />
      <Img r={L('info-label')} {...pop(0.8)} />
      <Img r={L('icon-bulb')} {...pop(0.85)} />
      <Box r={inset(L('info-label'), [8, 16, 18, 92])} className="center-y t-label nowrap" fit {...pop(0.85)}>
        {C.greeting.infoLabel}
      </Box>
      <Box r={inset(L('info-card'), [115, 45, 60, 50])} className="t-body t-blue" fit {...pop(0.9)}>
        {C.greeting.info}
      </Box>
      <Btn layers={[L('button-next-blue'), L('sparkles')]} label="Lanjut" onClick={() => (sfx('page'), onNext())} className="pulse" />
    </>
  )
}
