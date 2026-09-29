'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { onComplete?: () => void; }

export default function LogoAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<'animating'|'done'>('animating');

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('done');
      setTimeout(() => onComplete?.(), 700);
    }, 5200);
    return () => clearTimeout(t);
  }, [onComplete]);

  // ─── Real Bacru logo dimensions ───────────────────────────
  // ViewBox: 0 0 300 360
  // Circle: cx=150, cy=150, r=118  (spans y: 32 → 268)
  // House roof apex: (150, 48)
  // Roof base: (72, 112) to (228, 112)
  // House body: (82, 112) → (218, 200)
  // Window center: (150, 150), 4-pane, 80×55 px
  // "BACRU" text: y=228, inside circle, bold
  // Swoosh curves: y ≈ 240, inside circle
  // "INMOBILIARIA": y=310, below circle, spaced
  const GOLD = '#D4AF37';
  const CX = 150; const CY = 150; const R = 118;
  const circum = 2 * Math.PI * R;

  // Window dimensions
  const WX = 110; const WY = 122; const WW = 80; const WH = 58;

  return (
    <AnimatePresence>
      {phase === 'animating' && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070707] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Subtle architectural grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
            <defs>
              <pattern id="bg-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M50 0L0 0 0 50" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg-grid)"/>
          </svg>

          {/* Corner rays that converge */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {([[0,0],[100,0],[0,100],[100,100]] as [number,number][]).map(([xp,yp],i) => (
              <motion.line key={i}
                x1={`${xp}%`} y1={`${yp}%`} x2="50%" y2="50%"
                stroke={GOLD} strokeWidth="0.5" strokeOpacity="0.2"
                initial={{pathLength:0,opacity:0}}
                animate={{pathLength:1,opacity:1}}
                transition={{delay:0.15+i*0.06,duration:0.9,ease:[0.22,1,0.36,1]}}
              />
            ))}
          </svg>

          {/* ────── MAIN LOGO SVG ────── */}
          <svg viewBox="0 0 300 360" width="280" height="336" className="relative z-10">

            {/* ── Phase 1: Outer circle draws in (0.8s delay) ── */}
            <motion.circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={GOLD} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circum} strokeDashoffset={circum}
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Inner thin ring (decorative) */}
            <motion.circle
              cx={CX} cy={CY} r={R - 8}
              fill="none" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.5 }}
            />

            {/* ── Phase 2: Roof / peak triangle ── */}
            {/* Left slope */}
            <motion.line
              x1="150" y1="48" x2="72" y2="112"
              stroke={GOLD} strokeWidth="4" strokeLinecap="round"
              strokeDasharray="140" strokeDashoffset="140"
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 1.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Right slope */}
            <motion.line
              x1="150" y1="48" x2="228" y2="112"
              stroke={GOLD} strokeWidth="4" strokeLinecap="round"
              strokeDasharray="140" strokeDashoffset="140"
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 1.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Roof base line (horizontal) */}
            <motion.line
              x1="72" y1="112" x2="228" y2="112"
              stroke={GOLD} strokeWidth="4" strokeLinecap="round"
              strokeDasharray="160" strokeDashoffset="160"
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 2.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* ── Phase 3: House body rectangle ── */}
            <motion.rect
              x="82" y="112" width="136" height="88" rx="1"
              fill="none" stroke={GOLD} strokeWidth="3.5"
              strokeDasharray="450" strokeDashoffset="450"
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 2.35, duration: 0.65, ease: 'easeOut' }}
            />

            {/* ── Phase 4: Window (4-pane, like real logo) ── */}
            {/* Window outer frame */}
            <motion.rect
              x={WX} y={WY} width={WW} height={WH} rx="2"
              fill={GOLD} fillOpacity="0.06"
              stroke={GOLD} strokeWidth="2.5"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.8, duration: 0.45, ease: 'backOut' }}
              style={{ transformOrigin: `${WX + WW/2}px ${WY + WH/2}px` }}
            />
            {/* Vertical divider */}
            <motion.line
              x1={WX + WW/2} y1={WY + 4} x2={WX + WW/2} y2={WY + WH - 4}
              stroke={GOLD} strokeWidth="2"
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 3.0, duration: 0.3, ease: 'easeOut' }}
              style={{ transformOrigin: `${WX + WW/2}px ${WY + WH/2}px` }}
            />
            {/* Horizontal divider */}
            <motion.line
              x1={WX + 4} y1={WY + WH/2} x2={WX + WW - 4} y2={WY + WH/2}
              stroke={GOLD} strokeWidth="2"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 3.1, duration: 0.3, ease: 'easeOut' }}
              style={{ transformOrigin: `${WX + WW/2}px ${WY + WH/2}px` }}
            />

            {/* ── Phase 5: "BACRU" text inside circle ── */}
            {'BACRU'.split('').map((letter, i) => (
              <motion.text key={letter + i}
                x={CX - 56 + i * 29} y={228}
                fontFamily="Montserrat, Arial Black, sans-serif"
                fontWeight="900"
                fontSize="30"
                fill={GOLD}
                textAnchor="middle"
                initial={{ opacity: 0, y: 240 }}
                animate={{ opacity: 1, y: 228 }}
                transition={{ delay: 3.2 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.text>
            ))}

            {/* ── Phase 6: Swoosh wave (inside circle, below BACRU) ── */}
            {/* Two curved swoosh lines like in real logo */}
            <motion.path
              d="M 44,248 Q 97,235 150,244 Q 203,253 256,244"
              fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round"
              strokeDasharray="220" strokeDashoffset="220"
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 3.85, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M 44,258 Q 97,269 150,260 Q 203,251 256,258"
              fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.55"
              strokeDasharray="220" strokeDashoffset="220"
              animate={{ strokeDashoffset: 0 }}
              transition={{ delay: 4.0, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Gold shimmer pulse inside circle */}
            <motion.circle cx={CX} cy={CY} r={R - 10}
              fill={GOLD} fillOpacity="0"
              animate={{ fillOpacity: [0, 0.05, 0] }}
              transition={{ delay: 3.5, duration: 1.0, ease: 'easeInOut' }}
            />

            {/* ── Phase 7: "INMOBILIARIA" below circle ── */}
            <motion.text
              x={CX} y={310}
              fontFamily="Montserrat, Arial, sans-serif"
              fontWeight="500"
              fontSize="11"
              fill={GOLD}
              letterSpacing="7"
              textAnchor="middle"
              initial={{ opacity: 0, y: 320 }}
              animate={{ opacity: 1, y: 310 }}
              transition={{ delay: 4.5, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              INMOBILIARIA
            </motion.text>

            {/* Thin lines left and right of INMOBILIARIA */}
            <motion.line x1="22" y1="308" x2="68" y2="308"
              stroke={GOLD} strokeWidth="1" strokeOpacity="0.5"
              initial={{scaleX:0}} animate={{scaleX:1}}
              transition={{delay:4.65,duration:0.4}}
              style={{transformOrigin:'68px 308px'}}
            />
            <motion.line x1="232" y1="308" x2="278" y2="308"
              stroke={GOLD} strokeWidth="1" strokeOpacity="0.5"
              initial={{scaleX:0}} animate={{scaleX:1}}
              transition={{delay:4.65,duration:0.4}}
              style={{transformOrigin:'232px 308px'}}
            />
          </svg>

          {/* Location tagline */}
          <motion.p
            className="absolute bottom-14 text-white/15 text-[10px] font-display tracking-[8px] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            Hidalgo · México
          </motion.p>

          {/* Skip button */}
          <motion.button
            onClick={() => { setPhase('done'); setTimeout(() => onComplete?.(), 400); }}
            className="absolute bottom-7 right-7 text-white/25 hover:text-white/60 text-[11px] font-display tracking-[3px] uppercase transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            Saltar →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
