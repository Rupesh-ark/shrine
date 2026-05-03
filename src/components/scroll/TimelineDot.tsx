interface TimelineDotProps {
  active: boolean
}

export function TimelineDot({ active }: TimelineDotProps) {
  return (
    <div style={{
      position: 'absolute', left: '-6px', top: '8px',
      width: '12px', height: '12px',
      borderRadius: '50%',
      background: active ? '#8B1A1A' : 'rgba(139,26,26,0.3)',
      border: '2px solid #8B1A1A',
      boxShadow: active ? '0 0 0 3px rgba(139,26,26,0.12)' : 'none',
    }} />
  )
}
