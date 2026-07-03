import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = 'dist'
const htmlPath = join(distDir, 'index.html')
let html = readFileSync(htmlPath, 'utf8')

const assets = readdirSync(join(distDir, 'assets'))
const preloads = []

const canvasChunk = assets.find(f => f.startsWith('CanvasScene') && f.endsWith('.js'))
const indexCss = assets.find(f => f.startsWith('index-') && f.endsWith('.css'))

if (canvasChunk) {
  preloads.push(`    <link rel="modulepreload" crossorigin href="/assets/${canvasChunk}">`)
}

if (preloads.length > 0) {
  html = html.replace('  </head>', preloads.join('\n') + '\n  </head>')
}

html = html.replace(
  /<script type="module" crossorigin src="\/assets\/index-[^"]+\.js"><\/script>/,
  (match) => match.replace('<script ', '<script fetchpriority="high" ')
)

if (indexCss) {
  const css = readFileSync(join(distDir, 'assets', indexCss), 'utf8')
  html = html.replace(
    `<link rel="stylesheet" crossorigin href="/assets/${indexCss}">`,
    `<style>${css}</style>`
  )
}

writeFileSync(htmlPath, html)
console.log('Post-build HTML optimizations applied.')
if (preloads.length > 0) {
  console.log('Injected modulepreloads:', preloads.map(s => s.match(/href="([^"]+)"/)[1]))
}
