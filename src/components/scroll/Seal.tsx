import { JP_SERIF } from '../../constants/fonts'

interface SealProps {
  text: string
  rotate?: number
  size?: number
}

export function Seal({ text, rotate = -8, size = 72 }: SealProps) {
  return (
    <div style={{
      width: size, height: size,
      border: '3px solid #8B1A1A',
      borderRadius: '3px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transform: `rotate(${String(rotate)}deg)`,
      opacity: 0.82,
      background: 'rgba(139,26,26,0.04)',
      boxShadow: 'inset 0 0 8px rgba(139,26,26,0.1)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(139,26,26,0.3)', borderRadius: '1px' }} />
      <span style={{
        fontFamily: JP_SERIF,
        fontSize: size * 0.2,
        color: '#8B1A1A',
        writingMode: 'vertical-rl',
        letterSpacing: '3px',
        fontWeight: '700',
      }}>{text}</span>
    </div>
  )
}
