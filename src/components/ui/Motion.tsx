'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform, type Variants } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_SOBHA = [0.65, 0, 0.35, 1] as const;

/* ── Revelado por máscara: el texto sube desde su propia línea ── */
export function LineReveal({ children, delay = 0, className = '', duration = 1 }:
  { children: React.ReactNode; delay?: number; className?: string; duration?: number }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span className="block"
        initial={{ y: '112%' }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '-6%' }}
        transition={{ duration, delay, ease: EASE }}>
        {children}
      </motion.span>
    </span>
  );
}

/* ── Split por palabras con stagger (titulares editoriales) ── */
export function SplitWords({ text, delay = 0, className = '' }:
  { text: string; delay?: number; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={`inline-block ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block"
            initial={{ y: '110%', opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-6%' }}
            transition={{ duration: 0.9, delay: delay + i * 0.055, ease: EASE }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ── Fade + rise genérico ── */
export function Rise({ children, delay = 0, y = 34, className = '' }:
  { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.85, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/* ── Imagen con revelado por cortina + zoom-out (firma de Sobha) ── */
export function ImageReveal({ src, alt, className = '', ratio = '4/3', delay = 0, priority = false }:
  { src: string; alt: string; className?: string; ratio?: string; delay?: number; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: ratio }}>
      <motion.div className="absolute inset-0"
        initial={{ scale: 1.28 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: '-6%' }}
        transition={{ duration: 1.5, delay, ease: EASE }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover"/>
      </motion.div>
      {/* Cortina dorada que descubre la imagen */}
      <motion.span className="absolute inset-0 origin-bottom bg-[#0A0A0A] z-10"
        initial={{ scaleY: 1 }} whileInView={{ scaleY: 0 }} viewport={{ once: true, margin: '-6%' }}
        transition={{ duration: 1.1, delay, ease: EASE_SOBHA }}/>
    </div>
  );
}

/* ── Parallax suave sobre scroll ── */
export function Parallax({ children, amount = 60, className = '' }:
  { children: React.ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}

/* ── Contador animado ── */
export function CountUp({ value, suffix = '', prefix = '', duration = 1700 }:
  { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

/* ── Contenedor con stagger para hijos ── */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/* ── Línea que se dibuja ── */
export function DrawLine({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span className={`block h-px bg-gold origin-left ${className}`}
      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: EASE }}/>
  );
}

/* ── Botón magnético (sigue al cursor en desktop) ── */
export function Magnetic({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer:coarse)').matches) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const reset = () => { el.style.transform = 'translate(0,0)'; };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', reset);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', reset); };
  }, [strength]);
  return <span ref={ref} style={{ display: 'inline-block', transition: 'transform .45s cubic-bezier(.16,1,.3,1)' }}>{children}</span>;
}
