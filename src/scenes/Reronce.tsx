import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, useOrient, inset, rel, union, box, pick, float, pop, artSrc, type Rect } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'

type Step = 'choose' | 'draw' | 'tell'
const R = C.reronce
const COLORS = [
  { c: '#e5483b', crayon: 'crayon-red' },
  { c: '#3a7fd6', crayon: 'crayon-blue' },
  { c: '#f5c431', crayon: 'crayon-yellow' },
  { c: '#4fae4a' },
  { c: '#9a62d8' },
  { c: '#5b3518' },
]
const PAPER = '#fffaf0'

export default function Reronce({ onDone }: { onDone: () => void }) {
  const L = useArt('p6-reronce')
  const o = useOrient()
  const [step, setStep] = useState<Step>('choose')
  const [mode, setMode] = useState<'draw' | 'tell' | null>(null)
  const drawCard = ['card-draw', 'drawing', 'crayon-red', 'crayon-blue', 'crayon-yellow', 'sparkles-1', 'label-draw'].map(L)
  const tellCard = ['card-tell', 'asta-reading', 'speech-bubble-dots', 'sparkles-2', 'label-tell'].map(L)
  const desc = (card: Rect, label: Rect): Rect => inset(card, [label.y + label.h - card.y + 4, 50, 24, 50])
  const paper = pick<Rect>(o, { x: 50, y: 210, w: 800, h: 990 }, { x: 400, y: 180, w: 760, h: 630 })

  const choose = (m: 'draw' | 'tell') => {
    sfx('emotion-select')
    buzz()
    setMode(m)
  }

  return (
    <>
      {o === 'landscape' && <Img r={L('panel')} />}
      {o === 'landscape' && step === 'choose' && (
        <>
          <Img r={L('star-small')} />
          <Img r={L('tape-blue')} />
        </>
      )}
      <Img r={L('title-plank')} {...pop(0)} />
      <Img r={L('binder-clip')} />
      <Img r={L('bookmark-red')} />
      <Box r={inset(L('title-plank'), [30, 60, 62, 60])} className="center t-plank-dark nowrap" fit>
        {R.title}
      </Box>
      <Box r={inset(L('title-plank'), [88, 90, 26, 90])} className="center t-plank-sub" fit>
        {step === 'draw' ? R.drawing.hint : R.sub}
      </Box>

      {step === 'choose' && (
        <>
          <Box
            r={pick<Rect>(o, { x: 250, y: 1205, w: 380, h: 200 }, { x: 400, y: 172, w: 800, h: 86 })}
            className={`center t-body ${o === 'portrait' ? 'speech-box' : ''}`}
            fit
            {...pop(0.4)}
          >
            {R.prompt}
          </Box>
          {(
            [
              ['draw', drawCard, L('card-draw'), L('label-draw')],
              ['tell', tellCard, L('card-tell'), L('label-tell')],
            ] as const
          ).map(([m, layers, card, label], i) => {
            const u = union([...layers])
            return (
              <motion.div key={m} {...pop(0.15 + i * 0.12)} className="layer fill">
                <Btn layers={[...layers]} label={R[m].label} pressed={mode === m} onClick={() => choose(m)} className={`card-choice ${mode === m ? 'chosen' : ''}`}>
                  <Box r={inset(rel(label, u), [8, 20, 18, 20])} className="center t-label-light nowrap" fit>
                    {R[m].label}
                  </Box>
                  <Box r={rel(desc(card, label), u)} className="center t-small" fit>
                    {R[m].desc}
                  </Box>
                </Btn>
              </motion.div>
            )
          })}
          <Btn
            layers={[L('button-next-blue'), L('leaf')]}
            label="Lanjut"
            disabled={!mode}
            className={mode ? 'pulse' : 'dim'}
            onClick={() => (sfx('page'), setStep(mode!))}
          />
        </>
      )}

      {step === 'draw' && <DrawPad paper={paper} onDone={onDone} />}
      {step === 'tell' && <TellPad paper={paper} onDone={onDone} />}

      {(step === 'choose' || o === 'landscape') && <Img r={L('asta-wave')} {...float(0.3, 10)} />}
    </>
  )
}

function DrawPad({ paper, onDone }: { paper: Rect; onDone: () => void }) {
  const o = useOrient()
  const ref = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0].c)
  const [drew, setDrew] = useState(false)
  const pad = inset(paper, [18, 18, 18, 18])

  const clear = () => {
    const ctx = ref.current!.getContext('2d')!
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, pad.w, pad.h)
    setDrew(false)
  }
  useEffect(clear, [pad.w, pad.h])

  // The stage is CSS-scaled, so map client coords back to canvas px.
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - b.left) * pad.w) / b.width, y: ((e.clientY - b.top) * pad.h) / b.height }
  }
  const stroke = (to: { x: number; y: number }) => {
    const ctx = ref.current!.getContext('2d')!
    const from = last.current ?? to
    ctx.strokeStyle = color
    ctx.lineWidth = 14
    ctx.lineCap = ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x + 0.01, to.y)
    ctx.stroke()
    last.current = to
  }
  const save = () => {
    sfx('tap')
    ref.current!.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'gambar-asta.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    })
  }

  const swatch = (i: number): Rect =>
    pick(o, { x: 60 + i * 132, y: 1215, w: 112, h: 100 }, { x: paper.x + paper.w + 25, y: paper.y + 10 + i * 102, w: 92, h: 92 })
  const actions = pick<Rect>(o, { x: 250, y: 1340, w: 620, h: 110 }, { x: paper.x + paper.w + 140, y: paper.y + 220, w: 260, h: 400 })

  return (
    <>
      <Box r={paper} className="paper" {...pop(0)}>
        <canvas
          ref={ref}
          width={pad.w}
          height={pad.h}
          className="draw"
          aria-label={C.reronce.drawing.hint}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            last.current = null
            stroke(point(e))
            setDrew(true)
          }}
          onPointerMove={(e) => last.current && stroke(point(e))}
          onPointerUp={() => (last.current = null)}
          onPointerCancel={() => (last.current = null)}
        />
      </Box>
      {COLORS.map((c, i) => (
        <motion.button
          key={c.c}
          className={`layer swatch ${color === c.c ? 'on' : ''}`}
          style={box(swatch(i))}
          aria-label={`Warna ${i + 1}`}
          aria-pressed={color === c.c}
          whileTap={{ scale: 0.88 }}
          onClick={() => (sfx('tap'), setColor(c.c))}
        >
          {c.crayon ? <img src={artSrc(`layers/p6-reronce/${c.crayon}.webp`)} alt="" /> : <span style={{ background: c.c }} />}
        </motion.button>
      ))}
      <div className={`layer actions ${o}`} style={box(actions)}>
        <button className="pill brown" onClick={() => (sfx('tap'), clear())}>{C.reronce.drawing.clear}</button>
        <button className="pill blue" disabled={!drew} onClick={save}>{C.reronce.drawing.save}</button>
        <button className="pill green" disabled={!drew} onClick={() => (sfx('tap'), onDone())}>{C.reronce.drawing.done}</button>
      </div>
    </>
  )
}

function TellPad({ paper, onDone }: { paper: Rect; onDone: () => void }) {
  const o = useOrient()
  const [text, setText] = useState('')
  const T = C.reronce.telling
  return (
    <>
      <Box r={paper} className="paper col" {...pop(0)}>
        <textarea className="tell" value={text} onChange={(e) => setText(e.target.value)} placeholder={T.hint} aria-label={T.hint} maxLength={2000} />
        <p className="t-small t-muted privacy">{T.privacy}</p>
      </Box>
      <div className={`layer actions ${o}`} style={box(pick<Rect>(o, { x: 60, y: 1240, w: 780, h: 110 }, { x: paper.x + paper.w + 30, y: paper.y + paper.h - 120, w: 300, h: 110 }))}>
        <button className="pill green" disabled={!text.trim()} onClick={() => (sfx('tap'), onDone())}>{T.done}</button>
      </div>
    </>
  )
}
