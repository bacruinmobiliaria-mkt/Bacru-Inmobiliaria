'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, BedDouble, Bath, Building2, Trees, Eye, Scale, ShieldCheck, Zap,
  MessageCircle, CalendarDays, ChevronLeft, ChevronRight, Landmark, Home,
} from 'lucide-react';
import { PROPERTIES, AGENTS, Property, badgeColor } from '@/lib/data';
import { LineReveal, Rise, DrawLine, Magnetic, CountUp, EASE } from '@/components/ui/Motion';
import SwipeFrame from '@/components/ui/SwipeFrame';
import { useLiveAgents } from '@/lib/useLive';

/* Convierte el link de Google Maps del asesor en un embed */
function toEmbed(p: Property): string {
  const url = (p as Property & { mapsUrl?: string }).mapsUrl;
  if (url) {
    const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (m) return `https://maps.google.com/maps?q=${m[1]},${m[2]}&t=m&z=15&output=embed`;
  }
  if (typeof p.lat === 'number' && typeof p.lng === 'number')
    return `https://maps.google.com/maps?q=${p.lat},${p.lng}&t=m&z=15&output=embed`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(p.zone + ', Hidalgo, Mexico')}&t=m&z=13&output=embed`;
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  const { id } = params;   // Next.js 14: params es objeto plano, NO Promise
  const [live, setLive] = useState<Property[] | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const [years, setYears] = useState(15);
  const [lbIdx, setLbIdx] = useState<number | null>(null);   // lightbox de fotos
  const agents = useLiveAgents();                              // asesores en vivo (panel Admin)

  // Datos vivos del admin — cada propiedad nueva tiene su página automáticamente
  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setLive(d as Property[]); })
      .catch(() => {});
  }, []);

  const pool = live || PROPERTIES;
  const p = useMemo(() =>
    pool.find(x => x.slug === id || String(x.id) === id) ||
    PROPERTIES.find(x => x.slug === id || String(x.id) === id),
    [pool, id]);

  // Galería con auto-avance
  useEffect(() => {
    if (!p || !auto || p.images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setImgIdx(i => (i + 1) % p.images.length), 3800);
    return () => clearInterval(t);
  }, [p, auto]);

  // Teclado en el lightbox: Escape cierra, flechas navegan
  useEffect(() => {
    if (lbIdx === null || !p) return;
    const lbKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLbIdx(null);
      if (e.key === 'ArrowRight') setLbIdx(i => ((i ?? 0) + 1) % p.images.length);
      if (e.key === 'ArrowLeft') setLbIdx(i => ((i ?? 0) - 1 + p.images.length) % p.images.length);
    };
    window.addEventListener('keydown', lbKeys);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', lbKeys); document.body.style.overflow = ''; };
  }, [lbIdx, p]);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 140]);

  if (!p) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-ivory px-6 text-center pt-24">
        <Home className="w-12 h-12 text-gold/50 mb-4" strokeWidth={1.2}/>
        <h1 className="font-serif font-bold text-carbon text-2xl mb-2">
          {live ? 'Propiedad no encontrada' : 'Cargando propiedad…'}
        </h1>
        {live && (
          <Link href="/comprar" className="mt-4 gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-7 py-3.5 rounded-full">
            Ver catálogo
          </Link>
        )}
      </div>
    );
  }

  const agent = agents.find(a => a.id === p.agentId) || AGENTS.find(a => a.id === p.agentId) || agents[0] || AGENTS[5];
  const waMsg = encodeURIComponent(`Hola ${agent.name.split(' ')[0]}, estuve viendo la ficha de *${p.name}* en la página de Bacru y me interesa mucho. Es la propiedad en ${p.zone} de $${p.price.toLocaleString('es-MX')} MXN. ¿Podríamos agendar una visita para conocerla? ¡Gracias!`);
  const similares = pool.filter(x => x.zone === p.zone && (x.slug || x.id) !== (p.slug || p.id)).slice(0, 3);
  const bc = badgeColor(p.badge, p.badgeColor);

  // Urgencia determinista (misma que el popup)
  const seed = `${p.slug || p.name}-${new Date().toISOString().slice(0, 10)}`;
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const viewsToday = 2 + (h % 9);

  const monthly = (amount: number, yrs: number) => {
    const r = 0.12 / 12;
    return Math.round((amount * r) / (1 - Math.pow(1 + r, -yrs * 12)));
  };

  const specs = ([
    [MapPin, p.zone, 'Zona'],
    ...(p.beds > 0 ? [[BedDouble, `${p.beds}`, 'Recámaras']] : []),
    ...(p.baths > 0 ? [[Bath, `${p.baths}`, 'Baños']] : []),
    ...(p.buildM2 > 0 ? [[Building2, `${p.buildM2} m²`, 'Construcción']] : []),
    ...(p.landM2 > 0 ? [[Trees, `${p.landM2} m²`, 'Terreno']] : []),
  ] as [React.ElementType, string, string][]);

  return (
    <>
      {/* ═══ HERO — galería inmersiva con auto-avance ═══ */}
      <section className="relative h-[64svh] sm:h-[82svh] bg-black overflow-hidden">
        {/* Desliza con el dedo / mouse entre fotos */}
        <SwipeFrame className="absolute inset-0 z-[5]"
          onStart={() => setAuto(false)}
          onNext={() => setImgIdx(i => (i + 1) % p.images.length)}
          onPrev={() => setImgIdx(i => (i - 1 + p.images.length) % p.images.length)}>
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            <AnimatePresence mode="popLayout">
              <motion.div key={imgIdx} className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}>
                <Image src={p.images[imgIdx % p.images.length]} alt={p.name} fill priority unoptimized draggable={false}
                  className="object-cover cursor-zoom-in select-none" onClick={() => { setAuto(false); setLbIdx(imgIdx % p.images.length); }}/>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20 pointer-events-none"/>
        </SwipeFrame>

        {/* Indicadores tipo stories */}
        {p.images.length > 1 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 w-[50%] max-w-[240px]">
            {p.images.map((_, i) => (
              <button key={i} onClick={() => { setAuto(false); setImgIdx(i); }}
                className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                <motion.span className="block h-full bg-gold" initial={false}
                  animate={{ scaleX: i <= imgIdx % p.images.length ? 1 : 0 }}
                  transition={i === imgIdx % p.images.length && auto ? { duration: 3.8, ease: 'linear' } : { duration: .25 }}
                  style={{ transformOrigin: 'left' }}/>
              </button>
            ))}
          </div>
        )}

        {/* Flechas */}
        {p.images.length > 1 && (
          <>
            <button onClick={() => { setAuto(false); setImgIdx(i => (i - 1 + p.images.length) % p.images.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <button onClick={() => { setAuto(false); setImgIdx(i => (i + 1) % p.images.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5"/>
            </button>
          </>
        )}

        {/* Info inferior */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 sm:pb-12 pointer-events-none">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
            <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .25, duration: .9, ease: EASE }}>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`${bc} text-white text-[10px] font-display font-bold px-3 py-1 rounded-full`}>{p.badge}</span>
                {p.featured && <span className="gold-gradient text-black text-[10px] font-display font-bold px-3 py-1 rounded-full">⭐ Destacada</span>}
                <span className="flex items-center gap-1.5 text-white/70 text-[11px] bg-white/10 backdrop-blur border border-white/15 px-3 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"/>
                  </span>
                  <Eye className="w-3 h-3"/>{viewsToday} personas la vieron hoy
                </span>
              </div>
              <h1 className="font-serif font-bold text-white leading-[0.96] mb-3"
                style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>{p.name}</h1>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                <p className="font-display font-extrabold gold-text" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)' }}>
                  ${p.price.toLocaleString('es-MX')}
                  <span className="text-sm text-white/50 font-normal ml-2">MXN</span>
                </p>
                <p className="flex items-center gap-1.5 text-white/60 text-sm pb-1.5">
                  <MapPin className="w-4 h-4 text-gold"/>{p.zone}, Hidalgo
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SPECS EN TARJETAS ═══ */}
      <section className="bg-white border-b border-carbon/8">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {specs.map(([Icon, val, lab], i) => (
              <Rise key={lab} delay={i * .07}>
                <div className="flex items-center gap-3 bg-ivory rounded-xl px-4 py-3.5 border border-carbon/6 h-full">
                  <span className="w-10 h-10 rounded-xl bg-white border border-gold/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-gold" strokeWidth={1.6}/>
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-carbon text-sm leading-none truncate">{val}</p>
                    <p className="text-carbon/45 text-[10px] uppercase tracking-wider mt-1">{lab}</p>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTENIDO ═══ */}
      <section className="bg-white py-10 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14">

          {/* Columna principal */}
          <div className="min-w-0">
            <LineReveal className="mb-2">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">La propiedad</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-carbon text-2xl sm:text-4xl leading-tight mb-4">
              <LineReveal delay={.08}>Conócela a fondo</LineReveal>
            </h2>
            <DrawLine className="w-16 mb-6" delay={.2}/>
            <Rise delay={.15}>
              <p className="text-carbon/70 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">{p.description}</p>
            </Rise>

            {/* Miniaturas de la galería */}
            {p.images.length > 1 && (
              <div data-no-fx className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                {p.images.map((img, i) => (
                  <button key={i} onClick={() => { setAuto(false); setLbIdx(i); }}
                    className={`block relative rounded-xl overflow-hidden group border-2 transition-colors duration-300 ${i === imgIdx % p.images.length ? 'border-gold' : 'border-transparent hover:border-gold/40'}`}
                    style={{ aspectRatio: '4/3' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${p.name} foto ${i + 1}`} loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                    <span className="absolute bottom-1.5 right-2 bg-black/55 text-white text-[10px] font-display font-bold px-2 py-0.5 rounded-full">{i + 1}/{p.images.length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Video de la propiedad — vertical u horizontal, se adapta solo */}
            {Array.isArray((p as Property & {videos?:string[]}).videos) && ((p as Property & {videos?:string[]}).videos as string[]).length > 0 && (
              <div data-no-fx className="mb-10">
                <p className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase mb-3">Recorrido en video</p>
                <div className="flex flex-wrap gap-4">
                  {((p as Property & {videos?:string[]}).videos as string[]).map((v, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-black border border-carbon/10 flex-1 min-w-[260px]"
                      style={{ maxWidth: v.includes('/shorts/') ? 320 : 640 }}>
                      {v.includes('youtube.com/embed') || v.includes('drive.google.com') ? (
                        <iframe src={v} className="w-full" style={{ aspectRatio: '16/9', border: 0, display: 'block' }}
                          allow="autoplay; encrypted-media; fullscreen" allowFullScreen title={`Video ${i+1} de ${p.name}`}/>
                      ) : (
                        <video src={v} controls playsInline preload="metadata"
                          className="w-full h-auto max-h-[70vh] object-contain bg-black" style={{ display: 'block' }}/>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cercanías */}
            {p.nearby && (
              <Rise delay={.1}>
                <div className="bg-ivory rounded-2xl p-5 sm:p-6 border border-carbon/6 mb-8">
                  <p className="flex items-center gap-2 font-display font-bold text-carbon text-sm mb-2">
                    <MapPin className="w-4 h-4 text-gold"/>A unos minutos de
                  </p>
                  <p className="text-carbon/65 text-sm leading-relaxed">{p.nearby}</p>
                </div>
              </Rise>
            )}

            {/* Ubicación */}
            <LineReveal className="mb-2">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Ubicación</span>
            </LineReveal>
            <h3 className="font-serif font-bold text-carbon text-xl sm:text-2xl mb-5">
              <LineReveal delay={.06}>Dónde está</LineReveal>
            </h3>
            <Rise delay={.12}>
              <div className="map-shell rounded-2xl overflow-hidden border border-carbon/10 mb-10" style={{ height: 'clamp(260px, 40vh, 380px)' }}>
                <iframe src={toEmbed(p)} width="100%" height="100%" style={{ border: 0, display: 'block' }}
                  loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa de ${p.name}`}/>
              </div>
            </Rise>

            {/* Simulador de mensualidad */}
            <div className="bg-[#0A0A0A] grain rounded-2xl p-6 sm:p-9 relative overflow-hidden">
              <LineReveal className="mb-2">
                <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Simulador</span>
              </LineReveal>
              <h3 className="font-serif font-bold text-white text-xl sm:text-3xl mb-1.5">¿Cuánto pagarías al mes?</h3>
              <p className="text-white/45 text-xs mb-6">Estimación bancaria con 10% de enganche · tasa referencia 12% anual</p>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[220px]">
                  <div className="flex justify-between text-white/50 text-[11px] font-display font-bold uppercase tracking-wider mb-2">
                    <span>Plazo</span><span className="text-gold">{years} años</span>
                  </div>
                  <input type="range" min={5} max={20} step={5} value={years}
                    onChange={e => setYears(Number(e.target.value))} className="w-full accent-gold"/>
                  <div className="flex justify-between text-white/30 text-[10px] mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
                </div>
                <div>
                  <p className="text-white/45 text-[10px] font-display font-bold uppercase tracking-wider mb-1">Mensualidad estimada</p>
                  <p className="font-display font-extrabold gold-text text-3xl sm:text-4xl">
                    ${monthly(p.price * 0.9, years).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {p.financing.map(f => (
                  <span key={f} className="flex items-center gap-1.5 text-[11px] border border-gold/30 text-gold font-display font-semibold px-3 py-1.5 rounded-full">
                    <Landmark className="w-3 h-3"/>{f}
                  </span>
                ))}
              </div>
              <Link href="/creditos" className="inline-block text-gold text-xs font-display font-bold uppercase tracking-[2px] link-line mt-5">
                Guía completa de créditos →
              </Link>
            </div>
          </div>

          {/* Sidebar sticky: asesor + CTAs + confianza */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-5" data-no-fx>
            <Rise>
              <div className="bg-white rounded-2xl border border-carbon/10 shadow-sm overflow-hidden">
                <div className="bg-[#0A0A0A] grain p-5 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-carbon border-2 border-gold/40 flex-shrink-0">
                    <Image src={agent.photo} alt={agent.name} fill unoptimized className="object-cover object-top"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gold/70 text-[9px] font-display font-bold tracking-[2px] uppercase">Tu asesor de zona</p>
                    <p className="font-display font-bold text-white text-sm truncate">{agent.name}</p>
                    <p className="flex items-center gap-1 text-white/50 text-[11px]"><MapPin className="w-2.5 h-2.5"/>{agent.zones[0]}</p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <Magnetic>
                    <a href={`https://wa.me/${agent.whatsapp}?text=${waMsg}`} target="_blank" rel="noreferrer"
                      className="btn-hero w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-display font-bold text-xs uppercase tracking-[2px] py-3.5 rounded-full">
                      <MessageCircle className="w-4 h-4"/>WhatsApp directo
                    </a>
                  </Magnetic>
                  <Link href={`/contacto?propiedad=${encodeURIComponent(p.name)}&zona=${encodeURIComponent(p.zone)}&tipo=${encodeURIComponent(p.type)}&precio=${p.price}`}
                    className="w-full flex items-center justify-center gap-2 gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] py-3.5 rounded-full hover:opacity-90 transition-opacity">
                    <CalendarDays className="w-4 h-4"/>Agendar visita
                  </Link>
                  <p className="text-center text-muted text-[11px]">Respuesta en menos de 1 hora</p>
                </div>
              </div>
            </Rise>

            <Rise delay={.1}>
              <div className="bg-ivory rounded-2xl border border-carbon/6 p-5 space-y-3.5">
                {([[Scale, 'Certeza jurídica', 'Escrituras y trámites verificados'],
                   [ShieldCheck, 'Sin pagos anticipados', 'Pagas solo con contrato firmado'],
                   [Zap, 'Respuesta rápida', 'Confirmación en menos de 1 hora'],
                ] as [React.ElementType, string, string][]).map(([Icon, t, d]) => (
                  <div key={t} className="flex gap-3 items-start">
                    <span className="w-8 h-8 rounded-lg bg-white border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gold"/>
                    </span>
                    <div>
                      <p className="font-display font-bold text-carbon text-xs">{t}</p>
                      <p className="text-carbon/50 text-[11px]">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Rise>
          </aside>
        </div>
      </section>

      {/* ═══ SIMILARES ═══ */}
      {similares.length > 0 && (
        <section className="bg-ivory py-12 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-serif font-bold text-carbon text-2xl sm:text-4xl leading-tight">
                <LineReveal>Más en {p.zone}</LineReveal>
              </h2>
              <Link href="/comprar" className="text-gold text-xs font-display font-bold uppercase tracking-[2px] link-line whitespace-nowrap">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
              {similares.map((s, i) => (
                <Rise key={s.slug || s.id} delay={i * .1}>
                  <Link href={`/propiedades/${s.slug || s.id}`}
                    className="group block bg-white rounded-2xl overflow-hidden border border-carbon/8 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-500">
                    <div className="relative h-44 overflow-hidden">
                      <Image src={s.images[0]} alt={s.name} fill unoptimized loading="lazy"
                        className="object-cover transition-transform duration-[1.1s] group-hover:scale-[1.07]"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/>
                      <p className="absolute bottom-3 left-3 font-display font-extrabold text-white text-lg">${s.price.toLocaleString('es-MX')}</p>
                    </div>
                    <div className="p-4">
                      <p className="font-display font-bold text-carbon text-sm group-hover:text-gold transition-colors line-clamp-1">{s.name}</p>
                      <p className="flex items-center gap-1 text-muted text-xs mt-1"><MapPin className="w-3 h-3 text-gold"/>{s.zone}</p>
                    </div>
                  </Link>
                </Rise>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-[#0A0A0A] grain py-14 sm:py-20 text-center">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <h2 className="font-serif font-bold text-white leading-[0.98] mb-3" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.4rem)' }}>
            <LineReveal>¿Es esta tu próxima casa?</LineReveal>
          </h2>
          <Rise delay={.12}>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-7">
              Solo hay una manera de saberlo: visítala. La visita es gratuita y sin compromiso.
            </p>
          </Rise>
          <Rise delay={.2}>
            <Magnetic>
              <Link href={`/contacto?propiedad=${encodeURIComponent(p.name)}&zona=${encodeURIComponent(p.zone)}&tipo=${encodeURIComponent(p.type)}&precio=${p.price}`}
                className="btn-hero inline-block gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-9 py-4 rounded-full">
                Agendar mi visita
              </Link>
            </Magnetic>
          </Rise>
        </div>
      </section>

      {/* ═══ LIGHTBOX — foto casi a pantalla completa con info y CTA ═══ */}
      <AnimatePresence>
        {lbIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[140] bg-black/95 flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .3 }}
            onClick={() => setLbIdx(null)}>

            {/* Barra superior */}
            <div className="flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-5 pb-2" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-px bg-gold hidden sm:block"/>
                <p className="font-serif font-bold text-white text-sm sm:text-lg truncate">{p.name}</p>
                <span className="text-white/40 text-xs whitespace-nowrap">{(lbIdx % p.images.length) + 1} / {p.images.length}</span>
              </div>
              <button onClick={() => setLbIdx(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur text-white text-xl leading-none transition-colors flex-shrink-0">
                ×
              </button>
            </div>

            {/* Imagen central */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16" onClick={e=>e.stopPropagation()}>
              <SwipeFrame className="absolute inset-0 flex items-center justify-center px-2 sm:px-16"
                onNext={() => setLbIdx(i => ((i ?? 0) + 1) % p.images.length)}
                onPrev={() => setLbIdx(i => ((i ?? 0) - 1 + p.images.length) % p.images.length)}>
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={lbIdx}
                  src={p.images[lbIdx % p.images.length]}
                  alt={`${p.name} — foto ${(lbIdx % p.images.length) + 1}`}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                  initial={{ opacity: 0, scale: .96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: .35, ease: EASE }}
                  draggable={false}
                />
              </AnimatePresence>
              </SwipeFrame>

              {p.images.length > 1 && (
                <>
                  <button onClick={() => setLbIdx(i => ((i ?? 0) - 1 + p.images.length) % p.images.length)}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-gold hover:text-black backdrop-blur text-white flex items-center justify-center transition-all">
                    <ChevronLeft className="w-5 h-5"/>
                  </button>
                  <button onClick={() => setLbIdx(i => ((i ?? 0) + 1) % p.images.length)}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-gold hover:text-black backdrop-blur text-white flex items-center justify-center transition-all">
                    <ChevronRight className="w-5 h-5"/>
                  </button>
                </>
              )}
            </div>

            {/* Panel inferior: info + asesor + CTA */}
            <motion.div
              className="px-4 sm:px-8 pb-4 sm:pb-6 pt-3"
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: .12, duration: .45, ease: EASE }}
              onClick={e=>e.stopPropagation()}>
              <div className="max-w-4xl mx-auto bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-3">
                {/* Precio + specs */}
                <div className="flex items-center gap-4 flex-wrap min-w-0 flex-1">
                  <p className="font-display font-extrabold gold-text text-lg sm:text-2xl whitespace-nowrap">${p.price.toLocaleString('es-MX')}</p>
                  <div className="flex items-center gap-3 text-white/60 text-xs">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gold"/>{p.zone}</span>
                    {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-gold/80"/>{p.beds}</span>}
                    {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-gold/80"/>{p.baths}</span>}
                    <span className="hidden sm:flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-gold/80"/>{p.buildM2 || p.landM2} m²</span>
                  </div>
                </div>
                {/* Asesor */}
                <div className="hidden md:flex items-center gap-2.5 border-l border-white/10 pl-5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gold/50 flex-shrink-0">
                    <Image src={agent.photo} alt={agent.name} fill unoptimized className="object-cover object-top"/>
                  </div>
                  <div className="leading-tight">
                    <p className="text-white text-xs font-display font-bold">{agent.name.split(' ').slice(0,2).join(' ')}</p>
                    <p className="text-white/45 text-[10px]">Tu asesor de zona</p>
                  </div>
                </div>
                {/* CTA */}
                <Link href={`/contacto?propiedad=${encodeURIComponent(p.name)}&zona=${encodeURIComponent(p.zone)}&tipo=${encodeURIComponent(p.type)}&precio=${p.price}`}
                  className="gold-gradient text-black font-display font-bold text-[11px] sm:text-xs uppercase tracking-[2px] px-6 py-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap ml-auto">
                  Agendar visita
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
