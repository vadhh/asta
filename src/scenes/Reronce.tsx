import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Img, Box, Btn, useArt, useOrient, inset, rel, union, box, pick, float, pop, artSrc, type Rect, scaledPlank } from '../stage'
import { sfx, buzz } from '../audio'
import C from '../content.json'
import './activities.css'

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
// Drawing paper is narrower in landscape to make room for two tool columns; the story paper is taller in portrait.
const DRAW_PAPER = { portrait: { x: 50, y: 240, w: 800, h: 870 }, landscape: { x: 400, y: 180, w: 640, h: 630 } }
const TELL_PAPER = { portrait: { x: 50, y: 240, w: 800, h: 940 }, landscape: { x: 400, y: 180, w: 700, h: 630 } }

export default function Reronce({ onDone }: { onDone: () => void }) {
  const L = useArt('p6-reronce')
  const o = useOrient()
  // Portrait gets a bigger plank: the frame is narrow, so its subtitle would otherwise be tiny on phones.
  const tp = L('title-plank')
  const P = scaledPlank(tp, pick(o, 1.45, 1.27))
  const plank = P.plank
  const [step, setStep] = useState<Step>('choose')
  const [mode, setMode] = useState<'draw' | 'tell' | null>(null)
  const drawCard = ['card-draw', 'drawing', 'crayon-red', 'crayon-blue', 'crayon-yellow', 'sparkles-1', 'label-draw'].map(L)
  const tellCard = ['card-tell', 'asta-reading', 'speech-bubble-dots', 'sparkles-2', 'label-tell'].map(L)
  const desc = (card: Rect, label: Rect): Rect => inset(card, [label.y + label.h - card.y + 4, 50, 24, 50])

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
      <Img r={{ ...plank, src: tp.src }} bleed={false} {...pop(0)} />
      <Img r={L('binder-clip')} />
      <Img r={L('bookmark-red')} />
      <Box r={P.title} className="center t-plank-dark nowrap" fit>
        {R.title}
      </Box>
      <Box r={P.sub} className="center t-plank-sub nowrap" fit>
        {R.sub}
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
          {/* landscape: the arrow drops below the Bercerita card, and its leaf is decoration outside the tap area */}
          {o === 'landscape' && <Img r={{ ...L('leaf'), y: L('leaf').y + 46 }} />}
          <Btn
            layers={o === 'landscape' ? [{ ...L('button-next-blue'), y: L('button-next-blue').y + 46 }] : [L('button-next-blue'), L('leaf')]}
            label="Lanjut"
            disabled={!mode}
            className={mode ? 'pulse' : 'dim'}
            onClick={() => (sfx('page'), setStep(mode!))}
          />
        </>
      )}

      {step === 'draw' && <DrawPad onDone={onDone} />}
      {step === 'tell' && <TellPad onDone={onDone} />}

      {(step === 'choose' || o === 'landscape') && <Img r={L('asta-wave')} {...float(0.3, 10)} />}
    </>
  )
}

const SIZES = [8, 18, 34] // canvas px; the eraser is twice as wide

function DrawPad({ hint = C.reronce.drawing.hint, onDone }: { hint?: string; onDone: () => void }) {
  const o = useOrient()
  const paper = DRAW_PAPER[o]
  const D = C.reronce.drawing
  const ref = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0].c)
  const [eraser, setEraser] = useState(false)
  const [size, setSize] = useState(1)
  const [drew, setDrew] = useState(false)
  const pad = inset(paper, [18, 18, 18, 18])
  const canvasH = pad.h - 96 // room for the privacy note (two lines) under it

  const clear = () => {
    const ctx = ref.current!.getContext('2d')!
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, pad.w, canvasH)
    setDrew(false)
  }
  useEffect(clear, [pad.w, canvasH])

  // The stage is CSS-scaled, so map client coords back to canvas px.
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - b.left) * pad.w) / b.width, y: ((e.clientY - b.top) * canvasH) / b.height }
  }
  const stroke = (to: { x: number; y: number }) => {
    const ctx = ref.current!.getContext('2d')!
    const from = last.current ?? to
    // Erasing paints paper colour (not destination-out), so a saved PNG has no transparent holes.
    ctx.strokeStyle = eraser ? PAPER : color
    ctx.lineWidth = SIZES[size] * (eraser ? 2 : 1)
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

  // portrait: colours + eraser in a row, sizes below, actions at the bottom. landscape: two tool columns, then actions.
  const tool = (i: number, row: number): Rect =>
    pick(o, { x: 50 + i * 117.3, y: paper.y + paper.h + 20 + row * 116, w: 96, h: 96 }, { x: paper.x + paper.w + 20 + row * 107, y: paper.y + i * 105, w: 92, h: 92 })
  const sizeAt = (i: number) => pick(o, tool(i, 1), tool(i + 1, 1))
  const eraserAt = pick(o, tool(COLORS.length, 0), tool(0, 1))
  const actions = pick<Rect>(o, { x: 50, y: paper.y + paper.h + 252, w: 800, h: 110 }, { x: paper.x + paper.w + 234, y: paper.y + 200, w: 215, h: 430 })

  return (
    <>
      <Box r={paper} className="paper col" {...pop(0)}>
        <canvas
          ref={ref}
          width={pad.w}
          height={canvasH}
          className="draw"
          style={{ height: canvasH, flex: 'none' }}
          aria-label={hint}
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
        <p className="t-small t-muted privacy rr-note">{D.privacy.text}</p>
      </Box>
      {!drew && (
        <Box r={inset(paper, [40, 40, 136, 40])} className="center t-hint" style={{ pointerEvents: 'none' }}>
          {hint}
        </Box>
      )}
      {COLORS.map((c, i) => (
        <motion.button
          key={c.c}
          className={`layer swatch ${!eraser && color === c.c ? 'on' : ''}`}
          style={box(tool(i, 0))}
          aria-label={`Warna ${i + 1}`}
          aria-pressed={!eraser && color === c.c}
          whileTap={{ scale: 0.88 }}
          onClick={() => (sfx('tap'), setColor(c.c), setEraser(false))}
        >
          {c.crayon ? <img src={artSrc(`layers/p6-reronce/${c.crayon}.webp`)} alt="" /> : <span style={{ background: c.c }} />}
        </motion.button>
      ))}
      <motion.button
        className={`layer swatch ${eraser ? 'on' : ''}`}
        style={box(eraserAt)}
        aria-label={D.eraser}
        aria-pressed={eraser}
        whileTap={{ scale: 0.88 }}
        onClick={() => (sfx('tap'), setEraser(true))}
      >
        <svg className="rr-eraser" viewBox="0 0 64 64" aria-hidden>
          <g transform="rotate(-35 32 32)">
            <rect x="8" y="20" width="48" height="24" rx="5" fill="#f4a3b4" stroke="#8a5a33" strokeWidth="3" />
            <rect x="8" y="20" width="18" height="24" rx="5" fill="#7ab8e8" stroke="#8a5a33" strokeWidth="3" />
          </g>
        </svg>
      </motion.button>
      {SIZES.map((s, i) => (
        <motion.button
          key={s}
          className={`layer swatch ${size === i ? 'on' : ''}`}
          style={box(sizeAt(i))}
          aria-label={D.sizes.text[i]}
          aria-pressed={size === i}
          whileTap={{ scale: 0.88 }}
          onClick={() => (sfx('tap'), setSize(i))}
        >
          <span className="rr-dot" style={{ width: s * 1.6, background: eraser ? '#c4a98a' : color }} />
        </motion.button>
      ))}
      <div className={`layer actions ${o}`} style={box(actions)}>
        <button className="pill brown" onClick={() => (sfx('tap'), clear())}>{D.clear}</button>
        <button className="pill blue" disabled={!drew} onClick={save}>{D.save}</button>
        <button className="pill green" onClick={() => (sfx('tap'), onDone())}>{D.done}</button>
      </div>
    </>
  )
}

function TellPad({ onDone }: { onDone: () => void }) {
  const o = useOrient()
  const paper = TELL_PAPER[o]
  const T = C.reronce.telling
  const [q, setQ] = useState<string | null>(null)
  const [mode, setMode] = useState<'write' | 'words' | 'draw'>('write')
  const [text, setText] = useState('')
  if (q && mode === 'draw') return <DrawPad hint={q} onDone={onDone} />
  const actions = pick<Rect>(o, { x: 50, y: paper.y + paper.h + 25, w: 800, h: 230 }, { x: paper.x + paper.w + 30, y: paper.y, w: 360, h: paper.h })
  const tap = (f: () => void) => () => (sfx('tap'), f())
  return (
    <>
      {q === null ? (
        <Box key="pick" r={paper} className="paper col rr-pick" {...pop(0)}>
          <p className="rr-q">{T.pick.text}</p>
          {T.prompts.map((p) => (
            <button key={p} className="rr-prompt" onClick={tap(() => (setQ(p), setMode('write'), setText('')))}>
              {p}
            </button>
          ))}
        </Box>
      ) : (
        <Box key="answer" r={paper} className="paper col" {...pop(0)}>
          <p className="rr-q">{q}</p>
          {mode === 'write' ? (
            <textarea className="tell" value={text} onChange={(e) => setText(e.target.value)} placeholder={T.hint.text} aria-label={q} maxLength={2000} />
          ) : (
            <div className="rr-words">
              <input className="rr-words-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={T.wordsHint.text} aria-label={q} maxLength={120} />
            </div>
          )}
          <p className="t-small t-muted privacy">{T.privacy.text}</p>
        </Box>
      )}
      <div className={`layer actions rr-actions ${o}`} style={box(actions)}>
        {q !== null && (
          <>
            <button className="pill blue" onClick={tap(() => setMode(mode === 'write' ? 'words' : 'write'))}>
              {mode === 'write' ? T.words.text : T.write.text}
            </button>
            <button className="pill blue" onClick={tap(() => setMode('draw'))}>{T.drawInstead.text}</button>
          </>
        )}
        {/* Lewati skips this question (back to the list); on the list it leaves the activity. Never requires text. */}
        <button className="pill brown" onClick={tap(() => (q === null ? onDone() : setQ(null)))}>{T.skip}</button>
        {q !== null && <button className="pill green" onClick={tap(onDone)}>{T.done}</button>}
      </div>
    </>
  )
}
