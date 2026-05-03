import { JP_SERIF, DISPLAY, SERIF } from '../../constants/fonts'
import { CRIMSON, DARK_WOOD, INK_BLACK, MEDIUM_WOOD, DEEP_BROWN } from '../../constants/colors'
import { BrushDivider } from '../scroll/BrushDivider'
import { KamonWatermark } from '../scroll/KamonWatermark'
import { Seal } from '../scroll/Seal'

export function HeroSection() {
  return (
    <section style={{
      height: '100%', minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      scrollSnapAlign: 'start', padding: '48px 40px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Large kanji watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: JP_SERIF,
        fontSize: '220px', color: DARK_WOOD, opacity: 0.04,
        userSelect: 'none', pointerEvents: 'none',
        lineHeight: 1, whiteSpace: 'nowrap',
      }}>履歴書</div>

      {/* Top seal */}
      <div style={{ position: 'absolute', top: '7%', right: '8%', animation: 'seal-stamp 0.6s ease-out 0.4s both' }}>
        <Seal text="承認" rotate={-6} size={68} />
      </div>
      <div style={{ position: 'absolute', top: '7%', left: '8%', opacity: 0.25 }}>
        <KamonWatermark />
      </div>

      {/* Name */}
      <div style={{ animation: 'ink-fade-in 0.7s ease-out 0.1s both', textAlign: 'center', marginBottom: '4px' }}>
        <p style={{
          fontFamily: JP_SERIF,
          fontSize: 'clamp(10px, 1.2vw, 13px)', color: MEDIUM_WOOD,
          letterSpacing: '6px', margin: '0 0 10px',
          opacity: 0.8,
        }}>ルペシュ·パンデー</p>
        <h1 style={{
          fontFamily: DISPLAY,
          fontSize: 'clamp(44px, 7vw, 76px)',
          color: INK_BLACK, margin: 0,
          fontWeight: '700', letterSpacing: '-0.5px', lineHeight: 1.05,
        }}>Rupesh Pandey</h1>
        {/* Ink underline */}
        <div style={{
          height: '2px', background: CRIMSON, borderRadius: '1px',
          marginTop: '8px', transformOrigin: 'left center',
          animation: 'underline-draw 0.6s ease-out 0.5s both',
          opacity: 0.7,
        }} />
      </div>

      <div style={{ animation: 'ink-fade-in 0.7s ease-out 0.3s both', textAlign: 'center', marginTop: '18px' }}>
        <p style={{
          fontFamily: JP_SERIF,
          fontSize: 'clamp(13px, 1.6vw, 17px)', color: DARK_WOOD,
          letterSpacing: '4px', opacity: 0.9,
        }}>Generalist · Builder · Perpetually Curious</p>
      </div>

      <BrushDivider />

      <div style={{ animation: 'ink-fade-in 0.7s ease-out 0.5s both', maxWidth: '440px', textAlign: 'center' }}>
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(17px, 2vw, 23px)', color: DEEP_BROWN,
          lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 20px',
        }}>
          &ldquo;I want to learn everything.<br/>I build what won&apos;t leave my head.&rdquo;
        </p>
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(13px, 1.4vw, 16px)', color: DARK_WOOD, lineHeight: 1.7,
        }}>
          Currently pairing music to books in real-time<br/>and relearning physics from scratch.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <div style={{ width: '28px', height: '1px', background: CRIMSON, opacity: 0.5 }} />
          <p style={{
            fontFamily: JP_SERIF,
            fontSize: 'clamp(11px, 1.2vw, 13px)', color: CRIMSON,
            letterSpacing: '3px', fontWeight: '600', margin: 0,
          }}>Edinburgh, UK</p>
          <div style={{ width: '28px', height: '1px', background: CRIMSON, opacity: 0.5 }} />
        </div>
      </div>

      {/* Bottom corner ornament */}
      <div style={{ position: 'absolute', bottom: '6%', left: '8%', opacity: 0.22 }}>
        <KamonWatermark />
      </div>
    </section>
  )
}
