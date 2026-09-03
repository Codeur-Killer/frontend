import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

const baseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1D2B45"/>
  <path d="M18 20h16l12 12-16 16-12-12V20z" fill="none" stroke="#F3F1EB" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="24" cy="26" r="2.6" fill="#B8862F"/>
</svg>
`

// Maskable icon: same mark, but padded well inside the safe zone (icon fills ~60% of the canvas)
// so Android/iOS can crop to circle/rounded-square without clipping the mark.
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#1D2B45"/>
  <g transform="translate(12,12) scale(0.625)">
    <path d="M18 20h16l12 12-16 16-12-12V20z" fill="none" stroke="#F3F1EB" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="24" cy="26" r="2.6" fill="#B8862F"/>
  </g>
</svg>
`

const targets = [
  { name: 'pwa-64x64.png', size: 64, svg: baseSvg },
  { name: 'pwa-192x192.png', size: 192, svg: baseSvg },
  { name: 'pwa-512x512.png', size: 512, svg: baseSvg },
  { name: 'maskable-icon-512x512.png', size: 512, svg: maskableSvg },
  { name: 'apple-touch-icon.png', size: 180, svg: baseSvg },
]

for (const { name, size, svg } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(publicDir, name))
  console.log(`generated ${name}`)
}
