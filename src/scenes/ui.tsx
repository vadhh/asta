import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { artSrc, borderArt } from '../stage'

/** A button drawn on a 9-sliced art layer (plank, sign, label), laid out in normal flow. `src` is under art/.
 *  Content sits on the art's flat face: `pad` = [left, right] and `padY` = [top, bottom] in frame px keep it off
 *  pointed ends and log/frame edges. The icon gets a fixed slot so labels line up across a list, and the label
 *  shrinks to fit on one line. */
export function PlankBtn({ src, slice, icon, children, onClick, className = '', style, pressed, label, pad = [slice, slice], padY = [0, 0], iconSize = 72 }: {
  src: string; slice: number; icon?: string; children: ReactNode; onClick: () => void; className?: string; style?: CSSProperties
  pressed?: boolean; label?: string; pad?: [number, number]; padY?: [number, number]; iconSize?: number
}) {
  const text = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = text.current
    if (!el) return
    el.style.fontSize = ''
    let size = parseFloat(getComputedStyle(el).fontSize)
    while (el.scrollWidth > el.clientWidth + 1 && size > 18) el.style.fontSize = `${(size -= 1)}px`
  })
  return (
    <motion.button
      className={`plank-btn ${icon ? 'has-icon' : ''} ${className}`}
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      style={{ borderImage: borderArt(src, slice), padding: `${padY[0]}px ${pad[1]}px ${padY[1]}px ${pad[0]}px`, ...style }}
    >
      {icon && (
        <span className="plank-icon" style={{ width: iconSize, height: iconSize }}>
          <img src={artSrc(icon)} alt="" draggable={false} />
        </span>
      )}
      <span ref={text} className="plank-label">
        {children}
      </span>
    </motion.button>
  )
}

export const ICONS: Record<string, string> = {
  tataati: 'layers/p4-map/icon-tataati.webp',
  reronce: 'layers/p4-map/icon-reronce.webp',
  srawung: 'layers/p4-map/icon-srawung.webp',
  titen: 'layers/p4-map/icon-titen.webp',
  rest: 'layers/p5-tataati/cloud-calm.webp',
  company: 'layers/p3-emotion/asta-head-badge.webp',
}

// Tenang has no face art; the calm cloud from Tataati stands in.
export const face = (id: string) => (id === 'tenang' ? 'layers/p5-tataati/cloud-calm.webp' : `layers/extra/face-${id}.webp`)
