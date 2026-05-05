import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = 'dist'
const htmlPath = join(distDir, 'index.html')
let html = readFileSync(htmlPath, 'utf8')

const assets = readdirSync(join(distDir, 'assets'))
const preloads = []

const postChunk = assets.find(f => f.startsWith('vendor-postprocessing') && f.endsWith('.js'))
const canvasChunk = assets.find(f => f.startsWith('CanvasScene') && f.endsWith('.js'))

if (postChunk) {
  preloads.push(`    <link rel="modulepreload" crossorigin href="/assets/${postChunk}">`)
}
if (canvasChunk) {
  preloads.push(`    <link rel="modulepreload" crossorigin href="/assets/${canvasChunk}">`)
}

if (preloads.length > 0) {
  // Insert before </head>, after existing preloads
  html = html.replace('</head>', preloads.join('\n') + '\n  </head>')
  writeFileSync(htmlPath, html)
  console.log('Injected modulepreloads:', preloads.map(s => s.match(/href="([^"]+)"/)[1]))
}
