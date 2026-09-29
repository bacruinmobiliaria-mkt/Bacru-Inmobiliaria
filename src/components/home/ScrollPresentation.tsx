'use client';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  { id:0, label:'Comprar', number:'80+', numberSub:'familias con casa propia', title:'Compra con\nconfianza real.', sub:'Sin coyotes, sin letra chica, sin sorpresas. Un asesor dedicado de principio a fin.', cta:{label:'Ver Propiedades',href:'/comprar'}, img:'/images/properties/prop4.jpg', side:'left' },
  { id:1, label:'Vender',  number:'4',   numberSub:'años de experiencia',       title:'Vende tu\npropiedad hoy.', sub:'Valuación gratuita, compradores verificados y trámites incluidos. Cerramos rápido.',  cta:{label:'Quiero Vender',href:'/vender'},   img:'/images/properties/prop1.jpg', side:'right' },
  { id:2, label:'Agentes', number:'8',   numberSub:'asesores especializados',   title:'Tu asesor,\nsiempre contigo.', sub:'Cada asesor conoce su zona. Uno de ellos será el tuyo desde el primer mensaje.', cta:{label:'Conocer Agentes',href:'/agentes'}, img:'/images/properties/prop2.jpg', side:'left' },
];

export default function ScrollPresentation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef(0);
  const [slide, setSlide] = useState(0);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    fn(); window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useLayoutEffect(() => {
    const calc = () => {
      let t = 0; let el: HTMLElement | null = containerRef.current;
      while (el) { t += el.offsetTop; el = el.offsetParent as HTMLElement | null; }
      topRef.current = t;
    };
    calc(); window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    if (mobile) return;
    const fn = () => {
      const s = window.scrollY - topRef.current;
      if (s < 0) { setSlide(0); return; }
      setSlide(Math.max(0, Math.min(SLIDES.length - 1, Math.floor(s / window.innerHeight))));
    };
    window.addEventListener('scroll', fn, { passive: true }); fn();
    return () => window.removeEventListener('scroll', fn);
  }, [mobile]);

  const s = SLIDES[slide];

  return (
    <section ref={containerRef}>
      {/* Desktop: scroll-driven sticky */}
      <div className="hidden md:block" style={{ height: `${SLIDES.length * 100}vh` }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* Background */}
          <AnimatePresence mode="sync">
            <motion.div key={s.id} className="absolute inset-0"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.8, ease:'easeInOut' }}>
              <Image src={s.img}
              unoptimized alt={s.title} fill className="object-cover" loading="lazy"/>
              <div className={`absolute inset-0 ${s.side==='left'?'slide-overlay':'slide-overlay-r'}`}/>
              <div className="absolute inset-0 bg-black/35"/>
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-8 lg:px-14 flex items-center">
            <div className={`max-w-xl ${s.side==='right'?'ml-auto text-right':''}`}>
              <AnimatePresence mode="wait">
                <motion.div key={s.id}
                  initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }}
                  transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}>
                  {/* Label line */}
                  <div className={`flex items-center gap-3 mb-5 ${s.side==='right'?'justify-end':''}`}>
                    <span className="h-px w-8 bg-gold inline-block"/>
                    <span className="font-display font-bold text-gold text-xs uppercase tracking-[4px]">{s.label}</span>
                  </div>
                  {/* Big watermark number */}
                  <div className={`flex items-end gap-4 mb-3 ${s.side==='right'?'justify-end':''}`}>
                    <span className="font-serif font-bold text-[7rem] sm:text-[9rem] leading-none text-white/10 select-none tracking-tight">{s.number}</span>
                    <span className="text-white/55 text-xs font-body pb-7 leading-tight max-w-[110px]">{s.numberSub}</span>
                  </div>
                  {/* Title */}
                  <h2 className="font-serif font-bold text-white text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.05] mb-6 whitespace-pre-line">{s.title}</h2>
                  {/* Sub */}
                  <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-md">{s.sub}</p>
                  {/* CTA */}
                  <Link href={s.cta.href}
                    className="inline-flex items-center gap-2.5 gold-gradient text-black font-display font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-lg">
                    {s.cta.label}
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {SLIDES.map((_,i)=>(
              <div key={i} className={`rounded-full transition-all duration-500 ${i===slide?'w-8 h-1.5 bg-gold':'w-1.5 h-1.5 bg-white/35'}`}/>
            ))}
          </div>

          {/* Scroll hint */}
          {slide < SLIDES.length-1 && (
            <div className="absolute bottom-8 right-8 text-white/35 flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-display tracking-[3px] uppercase">Continúa</span>
              <motion.div animate={{y:[0,5,0]}} transition={{repeat:Infinity,duration:1.4}}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden">
        {SLIDES.map((sl)=>(
          <div key={sl.id} className="relative h-[80vh] min-h-[500px] flex items-end">
            <Image src={sl.img}
              unoptimized alt={sl.title} fill className="object-cover" loading="lazy"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>
            <div className="relative z-10 px-6 pb-12">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-5 bg-gold"/>
                <span className="font-display font-bold text-gold text-xs uppercase tracking-[3px]">{sl.label}</span>
              </div>
              <h2 className="font-serif font-bold text-white text-3xl leading-tight mb-3 whitespace-pre-line">{sl.title}</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{sl.sub}</p>
              <Link href={sl.cta.href} className="inline-flex items-center gap-2 gold-gradient text-black font-display font-bold text-sm px-6 py-3 rounded-full">
                {sl.cta.label} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
