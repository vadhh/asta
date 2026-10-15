import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, Panel, useArt, useOrient, inset, pick, float, pop, type Rect } from '../stage'
import { sfx, playMusic } from '../audio'
import C from '../content.json'

type Step = 'intro' | 'breathe' | 'done'
const T = C.tataati

export default function Tataati({ onDone }: { onDone: () => void }) {
  const L = useArt('p5-tataati')
  const o = useOrient()
  const [step, setStep] = useState<Step>('intro')
  const [tick, setTick] = useState(0) // phase index across all rounds
  const phase = T.phases[tick % T.phases.length]
  const round = Math.floor(tick / T.phases.length) + 1

  useEffect(() => {
    if (step !== 'breathe') return
    playMusic('breathing', 0.15) // let the breathing cues lead
    sfx('breathe')
    const id = setTimeout(() => {
      if (tick + 1 >= T.phases.length * T.rounds) setStep('done')
      else setTick(tick + 1)
    }, phase.seconds * 1000)
    return () => clearTimeout(id)
  }, [step, tick, phase.seconds])
  useEffect(() => {
    if (step === 'done') playMusic('breathing', 0.25)
  }, [step])

  const page = L('paper-page')
  const hp = L('header-plank')
  const header = { ...hp, x: hp.x - 50, w: hp.w + 100 } // widened (9-slice) so its label isn't squeezed by the leaf ends
  // Tarik / Tahan / Hembuskan sit between Asta and the photo's right edge.
  const photo = L('photo-breathing'), asta = L('asta-breathing')
  const labelsX = asta.x + asta.w - 10 // right of the photo's Asta, so the labels never cover her
  const photoLabels = { x: labelsX, y: asta.y + 30, w: photo.x + photo.w - 50 - labelsX, h: 200 }
  const body = inset(page, [L('header-plank').h + 30, 40, 40, 40])
  // Ingat ya! card (done step): the exported one is too small for its text, so it's drawn 9-slice, taller.
  const tc = L('tip-card')
  const tip = pick<Rect>(o, { x: 175, y: 1080, w: 550, h: 290 }, { ...tc, y: tc.y - 60, h: tc.h + 60 })
  const scale = step !== 'breathe' ? 1 : phase.id === 'out' ? 0.94 : 1.12
  return (
    <>
      {o === 'landscape' && <Img r={L('book-panel')} />}
      <Img r={L('title-plank')} {...pop(0)} />
      <Box r={inset(L('title-plank'), [26, 60, 50, 60])} className="center t-plank-dark nowrap" fit>
        {T.title}
      </Box>
      <Box r={inset(L('title-plank'), [88, 60, 22, 60])} className="center t-plank-sub" fit>
        {T.sub}
      </Box>
      <Img r={L('binder-clip')} />
      <Img r={L('photo-breathing')} {...pop(0.15)} />
      <Img r={L('tape-2')} />
      {step === 'breathe' && (
        <motion.div
          className="layer breath-ring"
          style={{ left: L('asta-breathing').x - 40, top: L('asta-breathing').y + 30, width: L('asta-breathing').w + 80, height: L('asta-breathing').w + 80 }}
          animate={{ scale: phase.id === 'out' ? 0.6 : 1.15, opacity: phase.id === 'out' ? 0.25 : 0.7 }}
          transition={{ duration: phase.seconds, ease: 'easeInOut' }}
        />
      )}
      <Img
        r={L('asta-breathing')}
        style={{ transformOrigin: '50% 85%' }}
        animate={step === 'breathe' ? { scale } : { scale: [1, 1.04, 1] }}
        transition={step === 'breathe' ? { duration: phase.seconds, ease: 'easeInOut' } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Img r={L('wind-swoosh')} animate={{ x: [0, 14, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }} />
      {step === 'intro' && (
        <Box r={photoLabels} className="col t-photo nowrap" fit>
          {T.photo.map((t, i) => (
            // stepped diagonal like the design, kept inside the box: start, centre, end
            <motion.span key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.5 }} style={{ alignSelf: ['flex-start', 'center', 'flex-end'][i] }}>
              {t}
            </motion.span>
          ))}
        </Box>
      )}
      <Img r={page} {...pop(0.25)} />
      <Img r={L('tape-1')} />
      <Panel r={header} src={L('header-plank').src} slice={36} />
      {/* keyed remounts, not exit animations: those stall when the tab is in the background */}
      <motion.div key={step} className="layer fill" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box r={inset(header, [10, 70, 16, 70])} className="center t-chip-dark nowrap" fit>
            {step === 'intro' ? T.whatTitle : T.exerciseTitle.text}
          </Box>
          {step === 'intro' && (
            <Box r={body} className="t-body" fit>
              {T.what}
            </Box>
          )}
          {step === 'done' && (
            <Box r={{ ...body, h: tip.y - 16 - body.y }} className="center t-breath-done" fit>
              {T.doneText.text}
            </Box>
          )}
          {step === 'breathe' && (
            <Box r={body} className="center col">
              <motion.div key={tick} className="t-breath" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                {phase.label}
              </motion.div>
              <div className="t-body t-muted">{T.round.text.replace('{n}', String(round)).replace('{total}', String(T.rounds))}</div>
              <div className="dots" aria-hidden>
                {Array.from({ length: T.rounds }, (_, i) => (
                  <span key={i} className={i < round ? 'on' : ''} />
                ))}
              </div>
            </Box>
          )}
      </motion.div>
      {step === 'done' && (
        <>
          <Panel r={tip} src={L('tip-card').src} slice={40} {...pop(0.1)} />
          <Img r={{ ...L('leaf-1'), x: tip.x + 19, y: tip.y }} />
          {/* cloud peeks over the card's top edge beside the title, clear of the body text */}
          <Img r={{ ...L('cloud-calm'), x: tip.x + tip.w - L('cloud-calm').w - 20, y: tip.y - 24 }} {...float(0, 6, 2.5)} />
          <Box r={inset(tip, [16, 200, tip.h - 82, 80])} className="center-y t-chip-dark nowrap" fit {...pop(0.3)}>
            {T.rememberTitle}
          </Box>
          <Box r={inset(tip, [100, 36, 26, 40])} className="t-body" fit {...pop(0.35)}>
            {T.remember}
          </Box>
        </>
      )}
      {/* portrait: Asta's wave would cover the left of the Ingat ya! card */}
      {!(step === 'done' && o === 'portrait') && <Img r={L('asta-wave')} {...float(0.4, 10)} />}
      {step !== 'breathe' && (
        <Btn
          layers={[L('button-next-orange'), L('leaf-2')]}
          label={step === 'intro' ? 'Mulai bernapas' : 'Selesai'}
          className="pulse"
          onClick={() => {
            sfx('tap')
            if (step === 'intro') setStep('breathe')
            else onDone()
          }}
        />
      )}
      <span className="sr-only" aria-live="polite">
        {step === 'breathe' ? phase.label : ''}
      </span>
    </>
  )
}

