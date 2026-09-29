'use client';
import { useState, useEffect, useRef } from 'react';
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import VideoIntro from '@/components/home/VideoIntro';
import { PROPERTIES, STATS, TESTIMONIALS, Property, badgeColor } from '@/lib/data';
import PropertyModal from '@/components/PropertyModal';
import { useWipe } from '@/components/ui/PageWipe';
import { suggest } from '@/lib/search';
import LiveMap from '@/components/LiveMap';
import { Search, MapPin as MapPinIcon, Home as HomeIcon, Sparkles } from 'lucide-react';
import { Magnetic } from '@/components/ui/Motion';

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Revelado de texto por línea (estilo norris/sobha) ─────── */
function LineReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span className="block"
        initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '-8%' }}
        transition={{ duration: 1, delay, ease: EASE }}>
        {children}
      </motion.span>
    </span>
  );
}

/* ── Contador animado ───────────────────────────────────────── */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now(); const dur = 1600;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ═══ 1 · HERO ══════════════════════════════════════════════ */
function Hero() {
  const wipe = useWipe();
  const [zona, setZona] = useState('');
  const [tipo, setTipo] = useState('');
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const sugerencias = q.length >= 2 ? suggest(q, PROPERTIES) : [];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yImg = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-black">
      {/* Fondo con parallax + ken burns */}
      <motion.div className="absolute inset-0" style={{ y: yImg }}>
        <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80&auto=format&fit=crop"
          alt="Residencia en Hidalgo" fill priority className="object-cover kenburns" unoptimized/>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25"/>
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-[1400px] mx-auto w-full px-5 sm:px-10 pb-8 sm:pb-14 pt-28">
        {/* Eyebrow */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.25,duration:.8,ease:EASE}}
          className="flex items-center gap-3 mb-5">
          <span className="w-10 h-px bg-gold"/>
          <span className="text-gold text-[11px] sm:text-xs font-display font-bold tracking-[4px] uppercase">
            Inmobiliaria · Hidalgo · EdoMex · CDMX
          </span>
        </motion.div>

        {/* Titular editorial gigante */}
        <h1 className="font-serif font-bold text-white leading-[0.95] mb-6 sm:mb-8"
          style={{ fontSize:'clamp(2.9rem, 9.5vw, 7.5rem)' }}>
          <LineReveal delay={.35}>El hogar que</LineReveal>
          <LineReveal delay={.47}><span className="gold-text italic">buscas</span>, existe.</LineReveal>
        </h1>

        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.9,duration:.8}}
          className="text-white/60 text-sm sm:text-lg max-w-xl mb-8 sm:mb-10 leading-relaxed">
          Casas, terrenos y créditos con acompañamiento total.
          <span className="text-white/85 font-semibold"> 80+ familias</span> ya encontraron el suyo.
        </motion.p>

        {/* Buscador inteligente */}
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:1.05,duration:.8,ease:EASE}}
          className="relative max-w-3xl">
          <div className={`bg-white rounded-2xl shadow-[0_24px_70px_-18px_rgba(0,0,0,0.55)] overflow-visible transition-all duration-300 ${focus ? 'ring-2 ring-gold/70' : 'ring-1 ring-white/10'}`}>
            {/* Campo principal de texto */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-100">
              <Search className="w-4.5 h-4.5 text-gold flex-shrink-0" strokeWidth={2.2}/>
              <input value={q} onChange={e=>setQ(e.target.value)}
                onFocus={()=>setFocus(true)} onBlur={()=>setTimeout(()=>setFocus(false), 180)}
                onKeyDown={e=>{ if(e.key==='Enter') wipe(`/comprar?zona=${encodeURIComponent(zona)}&tipo=${encodeURIComponent(tipo)}&q=${encodeURIComponent(q)}`); }}
                placeholder="Busca por zona, precio o característica… ej. casa 3 recámaras pachuca"
                className="flex-1 text-sm sm:text-[15px] font-body text-carbon placeholder:text-carbon/35 focus:outline-none bg-transparent min-w-0"/>
              {q && <button onClick={()=>setQ('')} className="text-carbon/30 hover:text-carbon text-lg leading-none">×</button>}
            </div>
            {/* Fila de refinadores + botón */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 px-3 py-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 rounded-xl hover:bg-ivory px-2 py-2 transition-colors">
                  <HomeIcon className="w-3.5 h-3.5 text-carbon/40 flex-shrink-0"/>
                  <select value={tipo} onChange={e=>setTipo(e.target.value)}
                    className="w-full text-xs font-display font-semibold text-carbon/70 bg-transparent focus:outline-none cursor-pointer">
                    <option value="">Cualquier tipo</option>
                    {['Casa habitación','Personalizable','Terreno','Departamento'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <span className="w-px h-6 bg-gray-200 flex-shrink-0"/>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 rounded-xl hover:bg-ivory px-2 py-2 transition-colors">
                  <MapPinIcon className="w-3.5 h-3.5 text-carbon/40 flex-shrink-0"/>
                  <select value={zona} onChange={e=>setZona(e.target.value)}
                    className="w-full text-xs font-display font-semibold text-carbon/70 bg-transparent focus:outline-none cursor-pointer">
                    <option value="">Cualquier zona</option>
                    {['Mixquiahuala','Tezontepec','Pachuca','Tepatepec','Tulancingo','EdoMex','CDMX'].map(z=><option key={z}>{z}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={()=>wipe(`/comprar?zona=${encodeURIComponent(zona)}&tipo=${encodeURIComponent(tipo)}&q=${encodeURIComponent(q)}`)}
                className="btn-hero gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-7 py-3 rounded-xl flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                <Search className="w-3.5 h-3.5" strokeWidth={2.6}/>
                Buscar
              </button>
            </div>
          </div>

          {/* Sugerencias en vivo */}
          <AnimatePresence>
            {focus && sugerencias.length > 0 && (
              <motion.div initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}}
                transition={{duration:.22}}
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30">
                {sugerencias.map(s=>(
                  <button key={s}
                    onMouseDown={()=>{ setQ(s); wipe(`/comprar?q=${encodeURIComponent(s)}`); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left text-sm text-carbon/75 hover:bg-ivory hover:text-carbon transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0"/>
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Links rápidos */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}}
          className="flex flex-wrap gap-x-7 gap-y-2 mt-6">
          {[['Comprar','/comprar'],['Mapa','/mapa'],['Vender','/vender'],['Créditos','/creditos']].map(([l,h])=>(
            <a key={h} href={h} onClick={(e)=>{e.preventDefault(); wipe(h);}}
              className="cursor-pointer text-white/45 hover:text-white text-xs font-display font-semibold tracking-[2px] uppercase link-line transition-colors">{l}</a>
          ))}
        </motion.div>
      </motion.div>

      {/* Indicador scroll */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
        className="absolute bottom-8 right-6 sm:right-10 z-10 hidden sm:flex flex-col items-center gap-2 text-white/35">
        <span className="text-[9px] font-display tracking-[3px] uppercase rotate-90 origin-center translate-y-3">Scroll</span>
        <motion.span animate={{y:[0,7,0]}} transition={{repeat:Infinity,duration:1.8}} className="block w-px h-10 bg-gradient-to-b from-gold to-transparent mt-6"/>
      </motion.div>
    </section>
  );
}

/* ═══ 2 · MARQUEE ═══════════════════════════════════════════ */
function Marquee() {
  const items = ['Comprar','Vender','Invertir','Hidalgo','INFONAVIT','FOVISSSTE','Terrenos','Casas','Créditos'];
  const row = items.map((t,i)=>(
    <span key={i} className="flex items-center gap-6 sm:gap-10 pr-6 sm:pr-10">
      <span className="font-serif font-bold text-2xl sm:text-4xl text-white/90 whitespace-nowrap">{t}</span>
      <span className="text-gold text-xl sm:text-3xl">✦</span>
    </span>
  ));
  return (
    <div className="bg-[#0A0A0A] border-y border-gold/15 py-4 sm:py-6 overflow-hidden relative grain">
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}

/* ═══ 3 · STATS ═════════════════════════════════════════════ */
function Stats() {
  const items = [
    { v:80, s:'+', l:'Familias con hogar' },
    { v:4,  s:'',  l:'Años en Hidalgo' },
    { v:20, s:'+', l:'Propiedades activas' },
    { v:100,s:'%', l:'Certeza jurídica' },
  ];
  return (
    <section className="bg-ivory py-8 sm:py-10">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-2 lg:grid-cols-4 gap-y-10">
        {items.map((it,i)=>(
          <div key={it.l} className={`text-center ${i<3?'lg:border-r lg:border-carbon/10':''}`}>
            <p className="font-serif font-bold text-carbon" style={{fontSize:'clamp(2.6rem,6vw,4.5rem)'}}>
              <CountUp value={it.v} suffix={it.s}/>
            </p>
            <p className="text-muted text-[11px] sm:text-xs font-display font-semibold tracking-[2px] uppercase mt-1">{it.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══ 4 · DESTACADAS (editorial + datos vivos) ══════════════ */
function Featured() {
  const [selected, setSelected] = useState<Property | null>(null);
  const [allProps, setAllProps] = useState<Property[]>(PROPERTIES);

  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setAllProps(d as Property[]); })
      .catch(()=>{});
  }, []);

  const list = [...allProps].sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)).slice(0,4);

  return (
    <>
      <section className="bg-white pt-8 pb-10 sm:pt-10 sm:pb-14 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          {/* Encabezado editorial */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div>
              <LineReveal className="mb-2">
                <span className="text-gold text-[11px] font-display font-bold tracking-[4px] uppercase">Selección Bacru</span>
              </LineReveal>
              <h2 className="font-serif font-bold leading-[0.95]" style={{fontSize:'clamp(2.4rem,6vw,5rem)'}}>
                <LineReveal delay={.08}><span className="text-carbon">Propiedades</span></LineReveal>
                <LineReveal delay={.16}><span className="text-stroke-gold">destacadas</span></LineReveal>
              </h2>
            </div>
            <div className="flex gap-3">
              <Magnetic><Link href="/comprar" className="btn-hero inline-block gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-6 py-3.5 rounded-full">Ver catálogo</Link></Magnetic>
              <Link href="/mapa" className="border border-carbon/20 text-carbon hover:border-gold hover:text-gold font-display font-bold text-xs uppercase tracking-[2px] px-6 py-3.5 rounded-full transition-colors">
                Ver mapa
              </Link>
            </div>
          </div>

          {/* Grid editorial 2×2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {list.map((p, i) => {
              const bc = badgeColor(p.badge, p.badgeColor);
              return (
                <motion.button key={p.slug || p.id} onClick={()=>setSelected(p)}
                  initial={{opacity:0, y:40}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin:'-6%'}}
                  transition={{duration:.8, delay:(i%2)*.12, ease:EASE}}
                  className="group text-left cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl" style={{height:'min(58vw, 420px)'}}>
                    <Image src={p.images[0]} alt={p.name} fill unoptimized loading={i<2?'eager':'lazy'}
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"/>
                    {/* Índice editorial */}
                    <span className="absolute top-5 right-5 font-serif font-bold text-white/25 text-5xl sm:text-6xl leading-none select-none">
                      0{i+1}
                    </span>
                    <span className={`absolute top-5 left-5 ${bc} text-white text-[10px] font-display font-bold px-3 py-1 rounded-full`}>{p.badge}</span>
                    {p.featured && <span className="absolute top-12 left-5 gold-gradient text-black text-[10px] font-display font-bold px-3 py-1 rounded-full">⭐ Destacada</span>}
                    {/* Info inferior */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                      <p className="flex items-center gap-1 text-gold/85 text-[10px] font-display font-bold tracking-[3px] uppercase mb-1.5"><MapPin className="w-3 h-3"/>{p.zone}</p>
                      <h3 className="font-serif font-bold text-white text-xl sm:text-2xl leading-tight mb-2">{p.name}</h3>
                      <div className="flex items-end justify-between gap-4">
                        <p className="font-display font-extrabold text-2xl sm:text-3xl gold-text">${p.price.toLocaleString('es-MX')}</p>
                        <span className="hidden sm:flex items-center gap-2 text-white/0 group-hover:text-white/85 text-xs font-display font-bold transition-colors duration-300">
                          Ver detalles
                          <span className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all">
                            <svg className="w-3 h-3 -rotate-45" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        </span>
                      </div>
                      <div className="flex gap-4 text-white/50 text-[11px] mt-2">
                        {p.beds>0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5"/>{p.beds}</span>}
                        {p.baths>0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5"/>{p.baths}</span>}
                        <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5"/>{p.buildM2||p.landM2} m²</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selected && <PropertyModal property={selected} onClose={()=>setSelected(null)}/>}
      </AnimatePresence>
    </>
  );
}

/* ═══ 5 · SERVICIOS (filas editoriales) ═════════════════════ */
function Services() {
  const rows = [
    { n:'01', t:'Comprar',  s:'Catálogo verificado · Visitas guiadas · Popup con mapa y crédito', h:'/comprar' },
    { n:'02', t:'Vender',   s:'Valuación gratuita en 24h · Fotografía pro · Compradores reales',   h:'/vender' },
    { n:'03', t:'Créditos', s:'INFONAVIT · FOVISSSTE · Bancario · Simulador de mensualidad',      h:'/creditos' },
    { n:'04', t:'Mapa',     s:'Todas las propiedades geolocalizadas · Se actualiza en automático', h:'/mapa' },
  ];
  return (
    <section className="bg-white pb-10 sm:pb-14">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
        <LineReveal className="mb-8">
          <span className="text-gold text-[11px] font-display font-bold tracking-[4px] uppercase">Qué hacemos</span>
        </LineReveal>
        <div className="border-b border-carbon/12">
          {rows.map((r,i)=>(
            <motion.div key={r.n}
              initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{duration:.7, delay:i*.07, ease:EASE}}>
              <Link href={r.h} className="service-row group flex items-center gap-5 sm:gap-8 py-5 sm:py-6 px-2 rounded-lg">
                <span className="sr-idx font-display text-carbon/30 text-sm sm:text-base w-8">{r.n}</span>
                <div className="flex-1 min-w-0">
                  <p className="sr-title font-serif font-bold text-carbon text-3xl sm:text-5xl leading-none transition-colors duration-300">{r.t}</p>
                  <p className="sr-sub text-muted text-xs sm:text-sm mt-1.5 transition-colors duration-300 truncate">{r.s}</p>
                </div>
                <span className="sr-arrow w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-carbon/20 flex items-center justify-center text-carbon transition-all duration-300 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 5.5 · FRANJA VISUAL ═══════════════════════════════════ */
function PhotoStrip() {
  const fotos = [
    ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=78&auto=format&fit=crop','Casas listas para estrenar','/comprar'],
    ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=78&auto=format&fit=crop','Terrenos con escritura','/comprar?tipo=Terreno'],
    ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=78&auto=format&fit=crop','Créditos acompañados','/creditos'],
  ];
  return (
    <section className="bg-white pb-10 sm:pb-14">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6" data-no-fx>
        {fotos.map(([src, cap, href], i)=>(
          <motion.div key={cap}
            initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}}
            transition={{duration:.8, delay:i*.1, ease:EASE}}>
            <Link href={href} className="group block">
              <div className="img-reveal rounded-2xl overflow-hidden" style={{aspectRatio:'4/3'}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={cap} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06]"/>
              </div>
              <p className="flex items-center justify-between text-carbon text-sm font-display font-bold mt-3">
                {cap}
                <span className="w-7 h-7 rounded-full border border-carbon/15 flex items-center justify-center text-carbon/50 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-300">
                  <svg className="w-3 h-3 -rotate-45" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══ 6 · MAPA TEASER ═══════════════════════════════════════ */
function MapTeaser() {
  const [mapProps, setMapProps] = useState<Property[]>(PROPERTIES);
  const [mapSel, setMapSel] = useState<Property | null>(null);
  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setMapProps(d as Property[]); })
      .catch(() => {});
  }, []);
  return (
    <section className="relative bg-[#0A0A0A] grain py-12 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1800&q=70&auto=format&fit=crop"
          alt="" fill className="object-cover" unoptimized loading="lazy"/>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"/>
      <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10">
        <LineReveal className="mb-3">
          <span className="text-gold text-[11px] font-display font-bold tracking-[4px] uppercase">Mapa en tiempo real</span>
        </LineReveal>
        <h2 className="font-serif font-bold text-white leading-[0.95] mb-5" style={{fontSize:'clamp(2.4rem,6.5vw,5.5rem)'}}>
          <LineReveal delay={.08}>Explora Hidalgo</LineReveal>
          <LineReveal delay={.16}><span className="text-stroke-white">propiedad por propiedad</span></LineReveal>
        </h2>
        <p className="text-white/55 text-sm sm:text-base max-w-lg mb-7 leading-relaxed">
          Cada propiedad geolocalizada con precio, fotos y contacto directo.
          El mapa se actualiza solo cuando el equipo publica algo nuevo.
        </p>

        {/* El mismo mapa interactivo de la página Mapa */}
        <div data-no-fx>
          <LiveMap properties={mapProps} onSelect={p=>setMapSel(p)}
            height="clamp(320px, 52vh, 480px)" minHeight={320}/>
        </div>
        <AnimatePresence>
          {mapSel && <PropertyModal property={mapSel} onClose={()=>setMapSel(null)}/>}
        </AnimatePresence>

        <div className="mt-7">
          <Link href="/mapa" className="btn-hero inline-flex items-center gap-3 gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-8 py-4 rounded-full">
            Abrir el mapa completo
            <svg className="w-4 h-4 -rotate-45" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══ 7 · TESTIMONIOS ═══════════════════════════════════════ */
interface Testi { id:string; nombre:string; zona:string; texto:string; videoUrl?:string; rating:number; }

/* ═══ 7 · TESTIMONIOS — slider automático hacia la derecha ═══
   Mezcla videos verticales (estilo shorts) y testimonios de texto.
   Todo sale de la base de datos que llena el panel de asesores.   */

  // Vista previa siempre reproduciéndose en silencio (mp4 y YouTube lo permiten)
  function MutedPreview({ url }: { url: string }) {
    if (url.endsWith('.mp4')) {
      return <video src={url} autoPlay muted loop playsInline preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"/>;
    }
    const yt = url.match(/youtube\.com\/embed\/([\w-]+)/);
    if (yt) {
      return <iframe
        src={`https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&modestbranding=1&playsinline=1&rel=0`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ border: 0 }}
        allow="autoplay; encrypted-media" title="Video testimonio"/>;
    }
    return null; // Drive no permite autoplay: la tarjeta muestra el botón de play
  }

  function TestiCard({ t, onPlay }: { t: Testi; onPlay: (t: Testi) => void }) {
  return t.videoUrl ? (
    /* Video vertical estilo shorts — reproduciéndose en mute */
    <button onClick={()=>onPlay(t)}
      className="group relative flex-shrink-0 w-[210px] sm:w-[240px] rounded-2xl overflow-hidden bg-carbon text-left cursor-pointer border border-carbon/10"
      style={{ aspectRatio:'9/16' }}>
      <MutedPreview url={t.videoUrl}/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 pointer-events-none"/>
      <span className="absolute top-3 right-3 w-9 h-9 rounded-full gold-gradient flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-400">
        <svg className="w-3.5 h-3.5 text-black translate-x-px" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
      <span className="absolute top-3 left-3 bg-black/45 backdrop-blur border border-white/20 text-white text-[9px] font-display font-bold px-2.5 py-1 rounded-full">
        🔇 Toca para oírlo
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex gap-0.5 mb-1.5">
          {Array.from({length:t.rating}).map((_,s)=>(
            <svg key={s} className="w-2.5 h-2.5 fill-gold" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ))}
        </div>
        <p className="font-display font-bold text-white text-sm leading-tight">{t.nombre}</p>
        {t.zona && <p className="flex items-center gap-1 text-white/55 text-[11px] mt-0.5"><MapPin className="w-2.5 h-2.5 text-gold"/>{t.zona}</p>}
      </div>
    </button>
  ) : (
    /* Testimonio de texto */
    <div className="flex-shrink-0 w-[280px] sm:w-[330px] bg-white rounded-2xl p-6 border border-carbon/8 flex flex-col justify-between"
      style={{ aspectRatio:'9/10' }}>
      <div>
        <div className="flex gap-0.5 mb-4">
          {Array.from({length:t.rating}).map((_,s)=>(
            <svg key={s} className="w-3.5 h-3.5 fill-gold" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ))}
        </div>
        <p className="text-carbon/70 text-sm leading-relaxed italic line-clamp-6">&ldquo;{t.texto}&rdquo;</p>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-carbon/8 mt-4">
        <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black font-display font-bold text-sm flex-shrink-0">{t.nombre[0]}</div>
        <div className="min-w-0">
          <p className="font-display font-bold text-carbon text-sm truncate">{t.nombre}</p>
          {t.zona && <p className="flex items-center gap-1 text-muted text-xs"><MapPin className="w-3 h-3"/>{t.zona}</p>}
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const [items, setItems] = useState<Testi[]>(
    TESTIMONIALS.map((t,i)=>({ id:`static-${i}`, nombre:t.name, zona:t.zone, texto:t.text, videoUrl:'', rating:t.rating }))
  );
  const [playing, setPlaying] = useState<Testi | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d) && d.length) setItems(d); })
      .catch(() => {});
  }, []);

  // ── Pista infinita: se desliza sola hacia la derecha, y además se puede ──
  // ── ARRASTRAR con mouse o dedo. Al soltar, sigue con la misma velocidad ──
  // ── que llevabas (inercia) y poco a poco vuelve al deslizamiento suave. ──
  const xRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const playingRef = useRef(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);          // ¿hubo arrastre? (para no abrir el video por error)
  const velRef = useRef(0);                // velocidad actual en px/s
  const halfRef = useRef(0);
  const dragRef = useRef({ startX: 0, startPos: 0, lastX: 0, lastT: 0, id: -1 });
  useEffect(() => { playingRef.current = !!playing; }, [playing]);

  const wrap = (x: number) => {
    const half = halfRef.current;
    if (half <= 0) return x;
    while (x >= 0) x -= half;
    while (x < -half) x += half;
    return x;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const AUTO = reduce ? 0 : 34;            // px/s hacia la derecha (deslizamiento automático)

    halfRef.current = track.scrollWidth / 2;
    const ro = new ResizeObserver(() => { halfRef.current = track.scrollWidth / 2; });
    ro.observe(track);

    if (xRef.current === null) xRef.current = -halfRef.current;   // arranque en la copia izquierda
    if (velRef.current === 0) velRef.current = AUTO;

    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 50); last = now;
      if (halfRef.current > 0 && !draggingRef.current) {
        const target = (pausedRef.current || playingRef.current) ? 0 : AUTO;
        // La velocidad se relaja hacia la de reposo: inercia tras soltar
        velRef.current = target + (velRef.current - target) * Math.exp(-dt / 420);
        if (Math.abs(velRef.current - target) < 0.5) velRef.current = target;
        xRef.current = wrap((xRef.current ?? -halfRef.current) + velRef.current * dt / 1000);
        track.style.transform = `translate3d(${xRef.current}px,0,0)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [items]);

  const onPtrDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const d = dragRef.current;
    d.startX = e.clientX; d.lastX = e.clientX; d.lastT = performance.now();
    d.startPos = xRef.current ?? 0; d.id = e.pointerId;
    movedRef.current = false;
    velRef.current = 0;
    draggingRef.current = true;             // congela el auto-avance desde el primer toque
  };
  const onPtrMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!draggingRef.current || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;
    if (!movedRef.current && Math.abs(dx) > 6) {
      movedRef.current = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    if (!movedRef.current) return;
    const now = performance.now();
    const dt = Math.max(now - d.lastT, 1);
    const inst = ((e.clientX - d.lastX) / dt) * 1000;      // px/s instantáneos
    velRef.current = velRef.current * 0.6 + inst * 0.4;    // suavizado: sigue tu rapidez
    d.lastX = e.clientX; d.lastT = now;
    xRef.current = wrap(d.startPos + dx);
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${xRef.current}px,0,0)`;
  };
  const onPtrUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (e.pointerId !== d.id) return;
    d.id = -1;
    draggingRef.current = false;
    // Si te quedaste quieto antes de soltar, no hay "lanzamiento"
    if (performance.now() - d.lastT > 90) velRef.current = 0;
    velRef.current = Math.max(-4000, Math.min(4000, velRef.current));
    if (movedRef.current) window.setTimeout(() => { movedRef.current = false; }, 60);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <section className="bg-ivory py-10 sm:py-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
        <div className="flex items-end justify-between mb-7 sm:mb-9">
          <h2 className="font-serif font-bold text-carbon leading-none" style={{fontSize:'clamp(2rem,5vw,3.8rem)'}}>
            <LineReveal>Historias reales</LineReveal>
          </h2>
          <span className="hidden sm:block font-serif text-stroke-gold text-6xl select-none">&ldquo;</span>
        </div>
      </div>

      {/* Pista infinita — se desliza sola hacia la derecha, pausa al hover */}
      <div data-no-fx className="relative select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction:'pan-y' }}
        onPointerDown={onPtrDown} onPointerMove={onPtrMove}
        onPointerUp={onPtrUp} onPointerCancel={onPtrUp}
        onPointerEnter={e=>{ if (e.pointerType==='mouse') pausedRef.current = true; }}
        onPointerLeave={e=>{ if (e.pointerType==='mouse') pausedRef.current = false; }}
        onClickCapture={e=>{ if (movedRef.current) { e.stopPropagation(); e.preventDefault(); } }}
        onDragStart={e=>e.preventDefault()}>
        <div ref={trackRef} className="flex gap-5 sm:gap-7 w-max px-5 sm:px-10 will-change-transform">
          {[...items, ...items].map((t, i) => <TestiCard key={`${t.id}-${i}`} t={t} onPlay={setPlaying}/>)}
        </div>
        {/* Degradados laterales */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ivory to-transparent"/>
        <span className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ivory to-transparent"/>
      </div>

      {/* Modal de reproducción — vertical, estilo shorts */}
      <AnimatePresence>
        {playing && (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setPlaying(null)}>
            <motion.div className="relative bg-black rounded-2xl overflow-hidden w-full"
              style={{ maxWidth:'min(420px, 92vw)' }}
              initial={{scale:.92, y:24}} animate={{scale:1, y:0}} exit={{scale:.92, opacity:0}}
              transition={{type:'spring', stiffness:300, damping:28}}
              onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setPlaying(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/60 hover:bg-black text-white rounded-full text-lg leading-none">×</button>
              <div style={{ aspectRatio:'9/16', maxHeight:'78vh', margin:'0 auto' }}>
                {playing.videoUrl?.endsWith('.mp4') ? (
                  <video src={playing.videoUrl} controls autoPlay playsInline
                    className="w-full h-full object-contain bg-black"/>
                ) : (
                  <iframe
                    src={`${playing.videoUrl}${playing.videoUrl?.includes('?')?'&':'?'}autoplay=1&mute=0&controls=1&playsinline=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen title={playing.nombre}/>
                )}
                <p className="absolute top-3 left-3 z-10 bg-black/55 text-white/80 text-[10px] font-display font-semibold px-3 py-1 rounded-full pointer-events-none">
                  Si no escuchas, toca el altavoz del reproductor
                </p>
              </div>
              <div className="p-4 bg-carbon">
                <p className="font-display font-bold text-white text-sm">{playing.nombre}</p>
                {playing.zona && <p className="text-white/50 text-xs">{playing.zona}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══ COMPOSICIÓN ═══════════════════════════════════════════ */
export default function HomePage() {
  const [show, setShow] = useState(false);
  useEffect(() => { if (sessionStorage.getItem('bacru-intro')) setShow(true); }, []);
  const done = () => { sessionStorage.setItem('bacru-intro','1'); setShow(true); };

  return (
    <>
      {!show && <VideoIntro onComplete={done}/>}
      {/* El contenido está SIEMPRE visible y activo; el intro es solo una
          cortina encima. Así los contadores, reveals e imágenes funcionan
          desde la primera visita. */}
      {(
        <motion.div initial={false} animate={{opacity: 1}}>
          <Hero/>
          <Marquee/>
          <Stats/>
          <Featured/>
          <Services/>
          <PhotoStrip/>
          <MapTeaser/>
          <Testimonials/>
        </motion.div>
      )}
    </>
  );
}
