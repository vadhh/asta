import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import { artSrc } from '../stage'

/** A button drawn on a 9-sliced art layer (plank, sign, label), laid out in normal flow. `src` is under art/. */
export function PlankBtn({ src, slice, icon, children, onClick, className = '', style, pressed, label }: {
  src: string; slice: number; icon?: string; children: ReactNode; onClick: () => void; className?: string; style?: CSSProperties; pressed?: boolean; label?: string
}) {
  return (
    <motion.button
      className={`plank-btn ${className}`}
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      style={{ borderImage: `url(${artSrc(src)}) ${slice} fill / ${slice}px stretch`, ...style }}
    >
      {icon && <img src={artSrc(icon)} alt="" draggable={false} />}
      <span>{children}</span>
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
