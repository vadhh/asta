// Converts the text-free PNG exports in art/export to WebP under public/art,
// and writes src/manifest.json with the same layouts pointing at the WebP files.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const SRC = 'art/export'
const OUT = 'public/art'
const manifest = JSON.parse(await readFile(join(SRC, 'manifest.json'), 'utf8'))

const toWebp = (p) => p.replace(/\.png$/, '.webp')
const files = new Set()
const scenes = {}
for (const [scene, layouts] of Object.entries(manifest.scenes)) {
  scenes[scene] = {}
  for (const [orient, layers] of Object.entries(layouts)) {
    scenes[scene][orient] = layers.map(({ layer, src, x, y, w, h }) => {
      files.add(src)
      return { layer, src: toWebp(src), x, y, w, h }
    })
  }
}
// Pieces with no Canva layout (Srawung animal crops, emotion faces from art/faces.py) are used directly by scenes.
for (const f of await readdir(join(SRC, 'layers/extra'))) files.add(`layers/extra/${f}`)

await Promise.all(
  [...files].map(async (src) => {
    const out = join(OUT, toWebp(src))
    await mkdir(dirname(out), { recursive: true })
    const isBg = src.startsWith('backgrounds/')
    await sharp(join(SRC, src)).webp({ quality: isBg ? 78 : 85, alphaQuality: 90, effort: 5 }).toFile(out)
  }),
)
await writeFile('src/manifest.json', JSON.stringify(scenes))
console.log(`wrote ${files.size} images to ${OUT}`)
