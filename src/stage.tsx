import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'
import manifest from './manifest.json'
import artScale from './art-scale.json'

export type Orient = 'portrait' | 'landscape'
export type Rect = { x: number; y: number; w: number; h: number }
type Layer = Rect & { layer: string; src: string; cut?: string } // cut: image edges cut flat, of 'tblr'
export type Art = keyof typeof manifest

// Every scene is laid out on a fixed frame (from the Canva/Figma export) and scaled to fit.
export const FRAME = { portrait: { w: 900, h: 1600 }, landscape: { w: 1600, h: 900 } }
const layouts = manifest as Record<Art, Record<Orient, Layer[]>>

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
export const artSrc = (src: string) => asset(`art/${src}`)

const OrientCtx = createContext<Orient>('portrait')
export const useOrient = () => useContext(OrientCtx)
// Frame px of screen beyond the stage on each axis (tall phones, wide desktops), plus `bg`: where the cover-scaled
// background's frame lands in stage px (stage = bg.x/y + frame * bg.k).
const BleedCtx = createContext({ x: 0, y: 0, bg: { k: 1, x: 0, y: 0 } })

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
  // Safe-area box (w, h at offset l, t) inside the full screen (vw, vh) that the background covers.
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight, l: 0, t: 0, vw: window.innerWidth, vh: window.innerHeight })
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => {
      const el = e.target as HTMLElement, vp = el.parentElement!
      setSize({ w: e.contentRect.width, h: e.contentRect.height, l: el.offsetLeft, t: el.offsetTop, vw: vp.clientWidth, vh: vp.clientHeight })
    })
    ro.observe(ref.current!)
    return () => ro.disconnect()
  }, [])
  const orient: Orient = size.w > size.h ? 'landscape' : 'portrait'
  const f = FRAME[orient]
  const s = Math.min(size.w / f.w, size.h / f.h) || 1 // 0x0 while the page is hidden or mid-resize
  const bg = layouts[art][orient][0].src
  useEffect(() => preload(orient), [orient])
  // .bg is object-fit: cover on the full screen, so it scales by S (>= s) about the screen centre.
  const S = Math.max(size.vw / f.w, size.vh / f.h) || s
  const bleed = {
    x: (size.w / s - f.w) / 2,
    y: (size.h / s - f.h) / 2,
    bg: { k: S / s, x: ((size.vw - f.w * S) / 2 - size.l - (size.w - f.w * s) / 2) / s, y: ((size.vh - f.h * S) / 2 - size.t - (size.h - f.h * s) / 2) / s },
  }
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

type ImgProps = Omit<HTMLMotionProps<'img'>, 'src'> & { r: Layer | (Rect & { src: string; cut?: string }); bleed?: boolean; onBg?: boolean }
/** An art layer placed at its manifest rect. A layer touching a frame edge where its art is cut flat (manifest
 *  `cut`, e.g. bushes) is pushed out to the screen edge. Pass bleed={false} for rects relative to a parent.
 *  onBg: scenery that stands on the background art (fences, posts) scales and crops with the background instead of
 *  the stage, so it stays on its path at any screen shape. */
export function Img({ r, bleed = true, onBg, style, className = '', ...rest }: ImgProps) {
  const b = useContext(BleedCtx)
  const F = FRAME[useOrient()]
  if (onBg) {
    const g = b.bg, w = r.w * g.k
    // Where the cover crop would cut it, slide it along the ground (x) back on screen, keeping only the overhang
    // the design itself had past the frame edge.
    const lo = -b.x - Math.max(0, -r.x) * g.k
    const hi = F.w + b.x + Math.max(0, r.x + r.w - F.w) * g.k - w
    r = { ...r, x: Math.min(Math.max(g.x + r.x * g.k, lo), hi), y: g.y + r.y * g.k, w, h: r.h * g.k }
    bleed = false
  }
  let { x, y } = r
  const cut = ('cut' in r && r.cut) || ''
  if (bleed) {
    if (r.y <= 0 && cut.includes('t')) y -= b.y
    else if (r.y + r.h >= F.h && cut.includes('b')) y += b.y
    if (r.x <= 0 && cut.includes('l')) x -= b.x
    else if (r.x + r.w >= F.w && cut.includes('r')) x += b.x
  }
  return <motion.img src={artSrc(r.src)} alt="" draggable={false} className={`layer ${className}`} style={{ ...box({ ...r, x, y }), ...style }} {...rest} />
}

/** CSS border-image for art drawn 9-slice. `slice` is the corner size in frame px; the shipped file is
 *  higher-res (art-scale.json), so the slice into the file is scaled to match. */
export const borderArt = (src: string, slice: number) =>
  `url(${artSrc(src)}) ${Math.round(slice * ((artScale as Record<string, number>)[src] ?? 1))} fill / ${slice}px stretch`

type PanelProps = Omit<HTMLMotionProps<'div'>, 'children'> & { r: Rect; src: string; slice: number }
/** A panel/plank/bubble art layer drawn 9-slice, so it can be resized to `r` without stretching its
 *  corners. `slice` is the corner size in frame px. */
export function Panel({ r, src, slice, style, className = '', ...rest }: PanelProps) {
  return (
    <motion.div
      className={`layer ${className}`}
      style={{
        ...box(r),
        borderStyle: 'solid',
        borderWidth: slice,
        borderImage: borderArt(src, slice),
        ...style,
      }}
      {...rest}
    />
  )
}

/** Absolutely positioned text/content box in frame px. `fit` shrinks the font until the content fits the box. */
export function Box({ r, fit, className = '', style, children, ...rest }: HTMLMotionProps<'div'> & { r: Rect; fit?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const refit = () => {
    const el = ref.current
    const inner = el?.firstElementChild as HTMLElement | null
    if (!fit || !el || !inner) return
    el.style.fontSize = ''
    const cs = getComputedStyle(el)
    const roomH = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    const roomW = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    let size = parseFloat(cs.fontSize)
    while ((inner.offsetHeight > roomH || inner.scrollWidth > roomW) && size > 20) el.style.fontSize = `${(size -= 1)}px`
  }
  useLayoutEffect(refit)
  // A late-arriving web font changes text width; measure again.
  useEffect(() => {
    document.fonts.addEventListener('loadingdone', refit)
    return () => document.fonts.removeEventListener('loadingdone', refit)
  })
  return (
    <motion.div ref={ref} className={`box ${className}`} style={{ ...box(r), ...style }} {...rest}>
      {fit ? <div className="fit-inner">{children as ReactNode}</div> : (children as ReactNode)}
    </motion.div>
  )
}

/** A tappable group of layers. Children are positioned relative to the union of `layers`.
 *  A layer with `slice` is drawn 9-slice (see Panel) so it can be resized. */
export function Btn({ layers, label, onClick, disabled, className = '', children, pressed }: {
  layers: (Layer & { slice?: number })[]; label: string; onClick: () => void; disabled?: boolean; className?: string; children?: ReactNode; pressed?: boolean
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
      {layers.map((l) =>
        l.slice ? (
          <Panel key={l.layer} r={rel(l, u)} src={l.src} slice={l.slice} />
        ) : (
          <img key={l.layer} src={artSrc(l.src)} alt="" draggable={false} className="layer" style={box(rel(l, u))} />
        ),
      )}
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

/** Warm the cache with every scene's art for the current orientation. */
const preload = (orient: Orient) => {
  const srcs = new Set<string>()
  for (const art of Object.values(layouts)) for (const l of art[orient]) srcs.add(l.src)
  for (const src of srcs) new Image().src = artSrc(src)
}

/** Title plank scaled up uniformly (art stays undistorted) so long subtitles stay readable; returns the plank
 *  rect and its title/subtitle text boxes. Insets were tuned at k = 1.27 and scale with k. */
export function scaledPlank(tp: Rect, k: number) {
  const plank = { x: tp.x + tp.w / 2 - (tp.w * k) / 2, y: tp.y - 14, w: tp.w * k, h: tp.h * k }
  const s = k / 1.27
  const at = (t: number, rt: number, b: number, l: number) => inset(plank, [t * s, rt * s, b * s, l * s])
  return { plank, title: at(36, 90, 82, 90), sub: at(110, 130, 40, 130) }
}
