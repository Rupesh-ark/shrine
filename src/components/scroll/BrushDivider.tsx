interface BrushDividerProps {
  color?: string
  opacity?: number
}

export function BrushDivider({ color = '#8B1A1A', opacity = 0.45 }: BrushDividerProps) {
  return (
    <svg viewBox="0 0 340 18" width="340" height="18" style={{ display: 'block', margin: '22px auto', overflow: 'visible' }}>
      <path d="M0,9 Q85,3 170,9 Q255,15 340,9" stroke={color} strokeWidth="1.2" fill="none" opacity={opacity} />
      <ellipse cx="170" cy="9" rx="5" ry="5" fill={color} opacity={opacity + 0.2} />
      <ellipse cx="54"  cy="9" rx="2" ry="2" fill={color} opacity={opacity} />
      <ellipse cx="286" cy="9" rx="2" ry="2" fill={color} opacity={opacity} />
    </svg>
  )
}
