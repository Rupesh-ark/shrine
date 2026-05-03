export function AmbientParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${String(10 + Math.sin(i * 2.4) * 40 + 40)}%`,
    top: `${String(10 + Math.cos(i * 1.7) * 40 + 40)}%`,
    size: 1.5 + (i % 3),
    duration: 5 + (i % 4) * 2,
    delay: (i % 5) * 1.2,
    opacity: 0.12 + (i % 3) * 0.08,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: p.top,
          width: p.size, height: p.size,
          background: '#FFD9A0', borderRadius: '50%',
          opacity: p.opacity, filter: 'blur(0.5px)',
          animation: `amb-float ${String(p.duration)}s ease-in-out ${String(p.delay)}s infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes amb-float {
          from { transform: translateY(0) translateX(0) scale(1); opacity: 0.1; }
          to   { transform: translateY(-28px) translateX(8px) scale(1.4); opacity: 0.35; }
        }
        @keyframes ink-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes underline-draw {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes seal-stamp {
          0%   { transform: rotate(-8deg) scale(1.4); opacity: 0; }
          60%  { transform: rotate(-8deg) scale(0.92); opacity: 0.9; }
          100% { transform: rotate(-8deg) scale(1); opacity: 0.82; }
        }
      `}</style>
    </div>
  )
}
