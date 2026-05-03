import { DARK_WOOD, PARCHMENT } from '../../constants/colors'

export function KamonWatermark() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200"
      style={{ position: 'absolute', opacity: 0.04, pointerEvents: 'none', userSelect: 'none' }}>
      <circle cx="100" cy="100" r="96" fill="none" stroke={DARK_WOOD} strokeWidth="2" />
      <circle cx="100" cy="100" r="80" fill="none" stroke={DARK_WOOD} strokeWidth="1" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4
        const x = 100 + 60 * Math.cos(angle)
        const y = 100 + 60 * Math.sin(angle)
        return <circle key={i} cx={x} cy={y} r="12" fill={DARK_WOOD} />
      })}
      <circle cx="100" cy="100" r="20" fill={DARK_WOOD} />
      <circle cx="100" cy="100" r="10" fill="none" stroke={PARCHMENT} strokeWidth="3" />
    </svg>
  )
}
