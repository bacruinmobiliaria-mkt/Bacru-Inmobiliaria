'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

const TRUST_BADGES = ['✅ +500 Familias', '⚖️ Certeza Jurídica', '💳 INFONAVIT · FOVISSSTE · Bancario'];

export default function HeroSection() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setBadge(b => (b + 1) % TRUST_BADGES.length), 2800);
    return () => clearInterval(iv);
  }, []);

  const words = t.hero.title.split('\n');

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-black">
      {/* Drone video */}
      <video ref={videoRef} autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        src="/video/hero.mp4" />

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto pt-20">

        {/* Rotating trust badge */}
        <motion.div
          key={badge}
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          className="inline-block gold-gradient text-black text-xs font-display font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase"
        >
          {TRUST_BADGES[badge]}
        </motion.div>

        {/* Title — word by word */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
          {words.map((line, li) => (
            <span key={li} className="block">
              {line.split(' ').map((word, wi) => (
                <motion.span key={wi}
                  className={`inline-block mr-[0.2em] ${wi === 0 && li === 0 ? 'text-white' : li === 0 ? 'gold-text' : 'text-white'}`}
                  initial={{ opacity:0, y:32 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: li*0.3 + wi*0.08 + 0.4, duration:0.6, ease:[0.22,1,0.36,1] }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/80 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:1.1, duration:0.7 }}
        >
          {t.hero.sub}
        </motion.p>

        {/* CTAs */}
        <motion.div className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.3 }}>
          <a href="/#propiedades"
            className="gold-gradient text-black font-display font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:opacity-90 transition-opacity text-center">
            {t.hero.cta1}
          </a>
          <a href="/#cita"
            className="border-2 border-gold/60 text-white font-display font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:bg-gold/10 transition-colors text-center">
            {t.hero.cta2}
          </a>
        </motion.div>

        {/* Zone pills */}
        <motion.div className="flex flex-wrap gap-2 justify-center mt-8"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.6 }}>
          {['Mixquiahuala','Tezontepec','Pachuca','Tulancingo','EdoMex','CDMX'].map(z => (
            <span key={z} className="bg-white/10 border border-white/20 text-white/75 text-xs px-3 py-1 rounded-full font-body">
              📍 {z}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 z-10"
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2 }}
      >
        <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:1.5 }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
        <span className="text-[10px] tracking-[3px] uppercase font-display">{t.hero.scroll}</span>
      </motion.div>
    </section>
  );
}
