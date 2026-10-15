import { createContext, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'
import manifest from './manifest.json'

export type Orient = 'portrait' | 'landscape'
export type Rect = { x: number; y: number; w: number; h: number }
type Layer = Rect & { layer: string; src: string }
export type Art = keyof typeof manifest

// Every scene is laid out on a fixed frame (from the Canva/Figma export) and scaled to fit.
export const FRAME = { portrait: { w: 900, h: 1600 }, landscape: { w: 1600, h: 900 } }
const layouts = manifest as Record<Art, Record<Orient, Layer[]>>

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
export const artSrc = (src: string) => asset(`art/${src}`)

const OrientCtx = createContext<Orient>('portrait')
export const useOrient = () => useContext(OrientCtx)
// Frame px of screen beyond the stage on each axis (tall phones, wide desktops).
const BleedCtx = createContext({ x: 0, y: 0 })

/** Look up a layer's rect for the current orientation: `const L = useArt('p1-home'); L('asta-wave')`. */
export function useArt(art: Art) {
  const orient = useOrient()
  const byName = Object.fromEntries(layouts[art][orient].map((l) => [l.layer, l]))
  return (name: string): Layer => {
    const l = byName[name]
    if (!l) throw new Error(`missing layer ${art}/${name} (${orient})`)
    return l
  }
}

export const box = (r: Rect): CSSProperties => ({ left: r.x, top: r.y, width: r.w, height: r.h })
/** Shrink a rect by [top, right, bottom, left] frame px. */
export const inset = (r: Rect, [t, rt, b, l]: [number, number, number, number]): Rect => ({ x: r.x + l, y: r.y + t, w: r.w - l - rt, h: r.h - t - b })
export const pick = <T,>(orient: Orient, portrait: T, landscape: T) => (orient === 'portrait' ? portrait : landscape)

export function Viewport({ art, children }: { art: Art; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(ref.current!)
    return () => ro.disconnect()
  }, [])
  const orient: Orient = size.w > size.h ? 'landscape' : 'portrait'
  const f = FRAME[orient]
  const s = Math.min(size.w / f.w, size.h / f.h) || 1 // 0x0 while the page is hidden or mid-resize
  const bg = layouts[art][orient][0].src
  const bleed = { x: (size.w / s - f.w) / 2, y: (size.h / s - f.h) / 2 }
  return (
    <OrientCtx.Provider value={orient}>
    <BleedCtx.Provider value={bleed}>
      <div className="viewport">
        <AnimatePresence initial={false}>
          <motion.img
            key={bg}
            className="bg"
            src={artSrc(bg)}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="safe" ref={ref}>
          <div
            className="stage"
            style={{ width: f.w, height: f.h, transform: `translate(${(size.w - f.w * s) / 2}px, ${(size.h - f.h * s) / 2}px) scale(${s})` }}
          >
            {children}
          </div>
        </div>
      </div>
    </BleedCtx.Provider>
    </OrientCtx.Provider>
  )
}

type ImgProps = Omit<HTMLMotionProps<'img'>, 'src'> & { r: Layer | (Rect & { src: string }); bleed?: boolean }
/** An art layer placed at its manifest rect. Layers touching a frame edge are pushed out to the screen edge,
 *  since their art is cut flat there (bushes, branches). Pass bleed={false} for rects relative to a parent. */
export function Img({ r, bleed = true, style, className = '', ...rest }: ImgProps) {
  const b = useContext(BleedCtx)
  const F = FRAME[useOrient()]
  let { x, y } = r
  if (bleed) {
    if (r.y <= 0) y -= b.y
    else if (r.y + r.h >= F.h) y += b.y
    if (r.x <= 0) x -= b.x
    else if (r.x + r.w >= F.w) x += b.x
  }
  return <motion.img src={artSrc(r.src)} alt="" draggable={false} className={`layer ${className}`} style={{ ...box({ ...r, x, y }), ...style }} {...rest} />
}

/** Absolutely positioned text/content box in frame px. `fit` shrinks the font until the content fits the box. */
export function Box({ r, fit, className = '', style, children, ...rest }: HTMLMotionProps<'div'> & { r: Rect; fit?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    const inner = el?.firstElementChild as HTMLElement | null
    if (!fit || !el || !inner) return
    el.style.fontSize = ''
    const cs = getComputedStyle(el)
    const roomH = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    const roomW = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    let size = parseFloat(cs.fontSize)
    while ((inner.offsetHeight > roomH || inner.scrollWidth > roomW) && size > 20) el.style.fontSize = `${(size -= 1)}px`
  })
  return (
    <motion.div ref={ref} className={`box ${className}`} style={{ ...box(r), ...style }} {...rest}>
      {fit ? <div className="fit-inner">{children as ReactNode}</div> : (children as ReactNode)}
    </motion.div>
  )
}

/** A tappable group of layers. Children are positioned relative to the union of `layers`. */
export function Btn({ layers, label, onClick, disabled, className = '', children, pressed }: {
  layers: Layer[]; label: string; onClick: () => void; disabled?: boolean; className?: string; children?: ReactNode; pressed?: boolean
}) {
  const u = union(layers)
  return (
    <motion.button
      className={`layer btn ${className}`}
      style={box(u)}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      whileHover={disabled ? undefined : { scale: 1.03 }}
    >
      {layers.map((l) => (
        <img key={l.layer} src={artSrc(l.src)} alt="" draggable={false} className="layer" style={box({ ...l, x: l.x - u.x, y: l.y - u.y })} />
      ))}
      {children}
    </motion.button>
  )
}

export const union = (rs: Rect[]): Rect => {
  const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y))
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }
}
/** Rect relative to a parent rect (for children of Btn). */
export const rel = <T extends Rect>(r: T, parent: Rect): T => ({ ...r, x: r.x - parent.x, y: r.y - parent.y })

/** Gentle idle float for characters and props. */
export const float = (delay = 0, dist = 10, duration = 3) => ({
  animate: { y: [0, -dist, 0] },
  transition: { duration, repeat: Infinity, ease: 'easeInOut' as const, delay },
})
/** Pop-in for panels and bubbles. */
export const pop = (delay = 0) => ({
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring' as const, stiffness: 260, damping: 18, delay },
})

export const preloadAll = () => {
  const srcs = new Set<string>()
  for (const art of Object.values(layouts)) for (const l of Object.values(art).flat()) srcs.add(l.src)
  for (const src of srcs) new Image().src = artSrc(src)
}
