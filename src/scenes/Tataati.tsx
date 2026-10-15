import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Img, Box, Btn, useArt, useOrient, inset, float, pop } from '../stage'
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
  const body = inset(page, [L('header-plank').h + 30, 40, 40, 40])
  const scale = step !== 'breathe' ? 1 : phase.id === 'out' ? 0.94 : 1.12
  return (
    <>
      <Img r={L('title-plank')} {...pop(0)} />
      <Box r={inset(L('title-plank'), [26, 60, 50, 60])} className="center t-plank-dark">
        {T.title}
      </Box>
      <Box r={inset(L('title-plank'), [88, 60, 22, 60])} className="center t-plank-sub">
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
        <Box r={{ x: L('asta-breathing').x + L('asta-breathing').w - 30, y: L('asta-breathing').y + 30, w: 220, h: 200 }} className="col t-photo">
          {T.photo.map((t, i) => (
            <motion.span key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.5 }} style={{ marginLeft: i * 14 }}>
              {t}
            </motion.span>
          ))}
        </Box>
      )}
      <Img r={page} {...pop(0.25)} />
      <Img r={L('tape-1')} />
      <Img r={L('header-plank')} />
      <AnimatePresence mode="wait">
        <motion.div key={step} className="layer fill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Box r={inset(L('header-plank'), [8, 50, 14, 50])} className="center t-chip-dark" fit>
            {step === 'intro' ? T.whatTitle : T.exerciseTitle.text}
          </Box>
          {step === 'intro' && (
            <Box r={body} className="t-body" fit>
              {T.what}
            </Box>
          )}
          {step === 'done' && (
            <Box r={inset(body, [0, 0, L('tip-card').h - 10, 0])} className="center t-breath-done" fit>
              {T.doneText.text}
            </Box>
          )}
          {step === 'breathe' && (
            <Box r={inset(body, [0, 0, L('tip-card').h - 20, 0])} className="center col">
              <AnimatePresence mode="wait">
                <motion.div key={tick} className="t-breath" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  {phase.label}
                </motion.div>
              </AnimatePresence>
              <div className="t-body t-muted">{T.round.text.replace('{n}', String(round)).replace('{total}', String(T.rounds))}</div>
              <div className="dots" aria-hidden>
                {Array.from({ length: T.rounds }, (_, i) => (
                  <span key={i} className={i < round ? 'on' : ''} />
                ))}
              </div>
            </Box>
          )}
        </motion.div>
      </AnimatePresence>
      {step === 'done' && (
        <>
          <Img r={L('tip-card')} {...pop(0.1)} />
          <Img r={L('leaf-1')} />
          <Img r={L('cloud-calm')} {...float(0, 6, 2.5)} />
          <Box r={inset(L('tip-card'), [16, 200, L('tip-card').h - 82, 80])} className="center-y t-chip-dark" {...pop(0.3)}>
            {T.rememberTitle}
          </Box>
          {/* portrait: Asta's wave overlaps the card's left edge */}
          <Box r={inset(L('tip-card'), [86, L('cloud-calm').w + 20, 22, o === 'portrait' ? 100 : 40])} className="t-body t-small" fit {...pop(0.35)}>
            {T.remember}
          </Box>
        </>
      )}
      <Img r={L('asta-wave')} {...float(0.4, 10)} />
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

