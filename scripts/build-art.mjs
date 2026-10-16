// Converts the text-free PNG exports in art/export to WebP under public/art,
// and writes src/manifest.json with the same layouts pointing at the WebP files.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const SRC = 'art/export'
const OUT = 'public/art'
const manifest = JSON.parse(await readFile(join(SRC, 'manifest.json'), 'utf8'))

const toWebp = (p) => p.replace(/\.png$/, '.webp')
// Art is exported at 2x; phones need ~1.3x the frame, so ship at most 1.5x of the largest box each file is drawn into.
const MAX_SCALE = 1.5
const files = new Set()
const drawWidth = {}
for (const layouts of Object.values(manifest.scenes))
  for (const layers of Object.values(layouts))
    for (const { src, w } of layers) {
      files.add(src)
      drawWidth[src] = Math.max(drawWidth[src] ?? 0, w)
    }
// Pieces with no Canva layout (Srawung animal crops, emotion faces from art/faces.py) are used directly by scenes.
for (const f of await readdir(join(SRC, 'layers/extra'))) files.add(`layers/extra/${f}`)

// Which image edges are cut flat (opaque along the edge), e.g. bushes at the frame bottom. Only those
// edges get pushed out to the screen edge on tall/wide screens; free-standing art stays put.
async function cutEdges(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const opaque = (count, at) => {
    let n = 0
    for (let i = 0; i < count; i++) if (data[at(i)] > 200) n++
    return n / count > 0.05
  }
  return [
    opaque(w, (i) => i) && 't',
    opaque(w, (i) => (h - 1) * w + i) && 'b',
    opaque(h, (i) => i * w) && 'l',
    opaque(h, (i) => i * w + w - 1) && 'r',
  ].filter(Boolean).join('')
}

const cut = {}
// px of the shipped file per frame px, so 9-slice insets (written in frame px) can be scaled to the file.
const scale = {}
await Promise.all(
  [...files].map(async (src) => {
    const out = join(OUT, toWebp(src))
    await mkdir(dirname(out), { recursive: true })
    const isBg = src.startsWith('backgrounds/')
    if (!isBg) cut[src] = await cutEdges(join(SRC, src))
    const width = drawWidth[src] && Math.round(drawWidth[src] * MAX_SCALE)
    const info = await sharp(join(SRC, src)).resize({ width, withoutEnlargement: true }).webp({ quality: isBg ? 78 : 85, alphaQuality: 90, effort: 5 }).toFile(out)
    if (drawWidth[src]) scale[toWebp(src)] = +(info.width / drawWidth[src]).toFixed(3)
  }),
)

const scenes = {}
for (const [scene, layouts] of Object.entries(manifest.scenes)) {
  scenes[scene] = {}
  for (const [orient, layers] of Object.entries(layouts))
    scenes[scene][orient] = layers.map(({ layer, src, x, y, w, h }) => ({ layer, src: toWebp(src), x, y, w, h, ...(cut[src] && { cut: cut[src] }) }))
}
await writeFile('src/manifest.json', JSON.stringify(scenes))
await writeFile('src/art-scale.json', JSON.stringify(scale))
console.log(`wrote ${files.size} images to ${OUT}`)
