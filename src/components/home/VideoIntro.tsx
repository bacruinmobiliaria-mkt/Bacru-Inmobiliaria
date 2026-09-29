'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { onComplete?: () => void; }

export default function VideoIntro({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDone = () => {
    setVisible(false);
    setTimeout(() => onComplete?.(), 600);
  };

  useEffect(() => {
    // Show skip after 2s
    const t1 = setTimeout(() => setCanSkip(true), 2000);
    // Auto-complete fallback if video fails or onEnded doesn't fire
    const t2 = setTimeout(handleDone, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    // Rendimiento: en conexiones lentas o ahorro de datos, saltar el video intro
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn && (conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || ''))) {
      handleDone();
      return;
    }
    if (!videoRef.current) return;
    const v = videoRef.current;
    v.play().catch(() => handleDone());
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Video: object-contain so vertical video shows correctly on ALL screen sizes */}
          <video
            ref={videoRef}
            src="/video/logo-intro.mp4"
            autoPlay
            muted          /* REQUIRED for autoplay in all browsers */
            playsInline
            onEnded={handleDone}
            onError={handleDone}
            style={{
              maxHeight: '100dvh',
              maxWidth: '100vw',
              width: 'auto',
              height: '100dvh',
              objectFit: 'contain',
            }}
          />

          {/* Skip button */}
          <AnimatePresence>
            {canSkip && (
              <motion.button
                onClick={handleDone}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-8 right-8 flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors text-sm font-display tracking-[3px] uppercase group"
              >
                <span>Saltar</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
