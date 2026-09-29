'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { STATS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

function Counter({ value, delay=0 }: { value:string; delay?:number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once:true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const isPercent = value.includes('%');
    const hasPlus = value.startsWith('+');
    const num = parseInt(value.replace(/[^0-9]/g,'')) || 0;
    let raf: number;
    const t = setTimeout(() => {
      const dur = 1600;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now-start)/dur, 1);
        const e = 1 - Math.pow(1-p, 3);
        const cur = Math.round(e * num);
        setDisplay((hasPlus ? '+' : '') + cur + (isPercent ? '%' : ''));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay * 1000);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [inView, value, delay]);

  return <span ref={ref}>{display}</span>;
}

export default function StatsSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-black py-16 sm:py-20 border-t border-gold/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-10 sm:mb-12">
          <h2 className="font-display font-bold text-xl sm:text-3xl text-white mb-2">
            {t.stats.title}
          </h2>
          <div className="gold-divider w-20 mx-auto" />
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 0.1} className="text-center">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="font-display font-extrabold text-3xl sm:text-4xl gold-text mb-2">
                <Counter value={s.value} delay={i * 0.1 + 0.3} />
              </div>
              <div className="text-white/60 text-sm font-body">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
