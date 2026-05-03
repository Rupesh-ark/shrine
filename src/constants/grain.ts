export const GRAIN_SVG = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="2" stitchTiles="stitch" />
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.18" />
</svg>
`

export const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`
