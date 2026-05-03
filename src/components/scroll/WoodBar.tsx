interface WoodBarProps {
  position?: 'top' | 'bottom'
}

export function WoodBar({ position = 'top' }: WoodBarProps) {
  const isTop = position === 'top'
  return (
    <div style={{
      width: '100%', height: '16px', flexShrink: 0,
      background: 'linear-gradient(to bottom, #8B6914, #5C4A2A 40%, #3D2E14)',
      boxShadow: isTop
        ? '0 3px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(196,167,80,0.3), inset 0 -1px 0 rgba(0,0,0,0.3)'
        : '0 -3px 12px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(196,167,80,0.3), inset 0 1px 0 rgba(0,0,0,0.3)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(0,0,0,0.08) 23px, rgba(0,0,0,0.08) 24px)',
      }} />
      <div style={{
        position: 'absolute', [isTop ? 'bottom' : 'top']: 0, left: 0, right: 0,
        height: '2px', background: 'linear-gradient(to right, transparent, rgba(196,167,80,0.6), transparent)',
      }} />
    </div>
  )
}
