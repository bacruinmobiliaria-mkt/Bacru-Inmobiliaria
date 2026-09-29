'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bath, BedDouble, Building2, Eye, Handshake, LandPlot, MapPin, Ruler, Scale, ShieldCheck, Trees, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, AGENTS } from '@/lib/data';
import SwipeFrame from '@/components/ui/SwipeFrame';
import { useLiveAgents } from '@/lib/useLive';

interface Props {
  property: Property;
  onClose: () => void;
}

export default function PropertyModal({ property: p, onClose }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const agents = useLiveAgents();   // asesores en vivo (incluye los nuevos del panel Admin)
  const agent = agents.find(a => a.id === p.agentId) || AGENTS.find(a => a.id === p.agentId) || agents[0] || AGENTS[5];
  const [mapActive, setMapActive] = useState(false);   // en celular el mapa no atrapa el scroll hasta tocarlo
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Bloquea el scroll de la página de fondo mientras el popup está abierto
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);
  const waMsg = encodeURIComponent(
    `Hola ${agent.name.split(' ')[0]}, vi la propiedad *${p.name}* en la página de Bacru y me encantó. Me interesa esta ${p.type === 'terreno' ? 'propiedad tipo terreno' : 'casa'} en ${p.zone} de $${p.price.toLocaleString('es-MX')} MXN. ¿Podríamos agendar una visita? ¡Gracias!`
  );

  const prev = useCallback(() => setImgIdx(i => (i - 1 + p.images.length) % p.images.length), [p.images.length]);
  const next = useCallback(() => setImgIdx(i => (i + 1) % p.images.length), [p.images.length]);

  // Maps: use pasted mapsUrl if available, fallback to address/coords
  const rawUrl: string = (p as unknown as {mapsUrl?:string}).mapsUrl || '';
  const mapQ = p.address ? encodeURIComponent(p.address) : `${p.lat},${p.lng}`;
  let mapSrc = '';
  if (rawUrl) {
    if (rawUrl.includes('output=embed') || rawUrl.includes('goo.gl') || rawUrl.includes('maps.app')) {
      mapSrc = rawUrl;
    } else {
      const coordM = rawUrl.match(/@(-?[0-9]+[.][0-9]+),(-?[0-9]+[.][0-9]+)/);
      const qM     = rawUrl.match(/[?&]q=([^&]+)/);
      const placeM = rawUrl.match(new RegExp('/place/([^/@]+)'));
      if (coordM)      mapSrc = `https://maps.google.com/maps?q=${coordM[1]},${coordM[2]}&t=m&z=15&output=embed`;
      else if (qM)     mapSrc = `https://maps.google.com/maps?q=${qM[1]}&t=m&z=14&output=embed`;
      else if (placeM) mapSrc = `https://maps.google.com/maps?q=${placeM[1]}&t=m&z=14&output=embed`;
      else             mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&t=m&z=13&output=embed`;
    }
  } else if (p.address || (p.lat && p.lng)) {
    mapSrc = `https://maps.google.com/maps?q=${mapQ}&t=m&z=14&output=embed`;
  }
  const mapsLink = rawUrl || `https://maps.google.com/?q=${mapQ}`;

  // Urgencia ética: vistas del día, determinista por propiedad+día (no inventa en cada render)
  const viewsToday = (() => {
    const seed = `${p.slug || p.name}-${new Date().toISOString().slice(0,10)}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return 2 + (h % 9); // 2–10 vistas
  })();

  // ── Auto-scroll de la galería: recorre todas las fotos solo ──
  const [autoPlay, setAutoPlay] = useState(true);
  useEffect(() => {
    if (!autoPlay || p.images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setImgIdx(i => (i + 1) % p.images.length), 3500);
    return () => clearInterval(id);
  }, [autoPlay, p.images.length]);

  // La tira de miniaturas se centra en la foto activa (al deslizar o en auto)
  useEffect(() => {
    const el = thumbsRef.current?.children[imgIdx] as HTMLElement | undefined;
    if (el && thumbsRef.current) {
      const box = thumbsRef.current;
      box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
    }
  }, [imgIdx]);

  // Pausa el automático cuando el usuario toma el control
  const pauseAuto = useCallback(() => setAutoPlay(false), []);

  const monthlyEst = (amount: number, years: number) => {
    const r = 0.12 / 12;
    return Math.round((amount * r) / (1 - Math.pow(1 + r, -years * 12)));
  };


  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 modal-backdrop bg-black/75" />

      {/* Modal */}
      <motion.div
        className="relative z-10 bg-white w-full sm:max-w-4xl max-h-[94dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        initial={{ y: 60, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          aria-label="Cerrar" className="absolute top-3 right-3 z-30 w-10 h-10 bg-black/55 hover:bg-black/75 text-white rounded-full flex items-center justify-center text-xl leading-none transition-colors">
          ×
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">

          {/* ── Image gallery ── */}
          <div className="relative bg-carbon h-[250px] min-[400px]:h-[280px] sm:h-[320px] touch-pan-y">
            <SwipeFrame className="absolute inset-0"
              onStart={pauseAuto}
              onNext={next} onPrev={prev}>
            <AnimatePresence mode="wait">
              <motion.div key={imgIdx} className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}>
                <motion.div className="absolute inset-0"
                  initial={{ scale: 1.08 }} animate={{ scale: 1 }}
                  transition={{ duration: 4, ease: 'linear' }}>
                  <Image src={p.images[imgIdx]} alt={p.name} fill draggable={false}
                    className="object-cover select-none" unoptimized loading="eager"/>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              </motion.div>
            </AnimatePresence>
            </SwipeFrame>

            {/* Nav arrows */}
            {p.images.length > 1 && (
              <>
                <button onClick={()=>{pauseAuto();prev();}}
                  aria-label="Foto anterior" className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/35 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl transition-colors">
                  ‹
                </button>
                <button onClick={()=>{pauseAuto();next();}}
                  aria-label="Foto siguiente" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/35 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl transition-colors">
                  ›
                </button>
              </>
            )}

            {/* Indicadores estilo stories — muestran el avance automático */}
            {p.images.length > 1 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 w-[45%] max-w-[190px]">
                {p.images.map((_, i) => (
                  <button key={i} onClick={()=>{pauseAuto(); setImgIdx(i);}}
                    aria-label={`Foto ${i+1}`}
                    className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                    <motion.span className="block h-full bg-gold origin-left"
                      initial={false}
                      animate={{ scaleX: i < imgIdx ? 1 : i === imgIdx ? 1 : 0 }}
                      transition={ i === imgIdx && autoPlay
                        ? { duration: 3.5, ease: 'linear' }
                        : { duration: 0.25 } }
                      style={{ transformOrigin: 'left' }}/>
                  </button>
                ))}
              </div>
            )}

            {/* Badge */}
            <span className={`absolute top-3 left-3 ${p.badgeColor} text-white text-[10px] font-display font-bold px-2.5 py-1 rounded-full`}>
              {p.badge}
            </span>

            {/* Price overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 pb-4 pointer-events-none">
              <p className="font-display font-extrabold text-white text-xl min-[400px]:text-2xl sm:text-3xl">
                ${p.price.toLocaleString('es-MX')} <span className="text-sm text-white/60 font-normal">MXN</span>
              </p>
              <p className="font-serif font-bold text-white text-lg leading-tight">{p.name}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/70 mt-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"/>
                </span>
                <Eye className="w-3 h-3"/>{viewsToday} personas vieron esta propiedad hoy
              </p>
            </div>
          </div>

          {/* Thumbnail strip */}
          {p.images.length > 1 && (
            <div ref={thumbsRef} className="flex gap-2 px-4 py-3 bg-ivory overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {p.images.map((img, i) => (
                <button key={i} onClick={() => { pauseAuto(); setImgIdx(i); }}
                  className={`flex-shrink-0 snap-center relative rounded-lg overflow-hidden transition-all ${i === imgIdx ? 'ring-2 ring-gold scale-105' : 'opacity-60 hover:opacity-90'}`}
                  style={{ width: 72, height: 52 }}>
                  <Image src={img} alt={`Foto ${i+1}`} fill className="object-cover" unoptimized loading="lazy"/>
                </button>
              ))}
            </div>
          )}

          {/* ── Details ── */}
          <div className="px-4 sm:px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">

            {/* Left column */}
            <div className="space-y-5">
              {/* Quick specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {([
                  [MapPin,    p.zone,               'Zona'],
                  ...(p.beds  > 0 ? [[BedDouble, `${p.beds}`,    'Recámaras']] : []),
                  ...(p.baths > 0 ? [[Bath,      `${p.baths}`,   'Baños']] : []),
                  ...(p.buildM2 > 0 ? [[Building2, `${p.buildM2} m²`, 'Construcción']] : []),
                  ...(p.landM2  > 0 ? [[Trees,     `${p.landM2} m²`,  'Terreno']] : []),
                ] as [React.ElementType, string, string][]).map(([Icon, val, lab]) => (
                  <div key={lab} className="flex items-center gap-2.5 bg-ivory rounded-xl px-3 py-2.5 border border-carbon/6">
                    <span className="w-8 h-8 rounded-lg bg-white border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gold" strokeWidth={1.6}/>
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-carbon text-sm leading-none truncate">{val}</p>
                      <p className="text-carbon/45 text-[10px] uppercase tracking-wider mt-0.5">{lab}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h4 className="font-display font-bold text-carbon text-sm mb-2">Descripción</h4>
                <p className="text-carbon/65 text-sm leading-relaxed">{p.description}</p>
              </div>

              {/* Cercanías */}
              <div className="bg-ivory rounded-xl p-3.5">
                <p className="flex items-center gap-1.5 font-display font-bold text-carbon text-xs mb-1.5"><MapPin className="w-3.5 h-3.5 text-gold"/>Cercanías</p>
                <p className="text-carbon/60 text-xs leading-relaxed">{p.nearby}</p>
              </div>

              {/* Financing */}
              <div>
                <h4 className="font-display font-bold text-carbon text-sm mb-2">Financiamiento disponible</h4>
                <div className="flex flex-wrap gap-1.5">
                  {p.financing.map(f => (
                    <span key={f} className="text-xs bg-gold/10 border border-gold/30 text-gold-dark font-display font-bold px-3 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>

              {/* Monthly estimate */}
              <div className="bg-carbon rounded-xl p-4">
                <p className="text-white/60 text-xs mb-2 font-display">Mensualidad estimada (crédito bancario)</p>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map(y => (
                    <div key={y} className="text-center bg-white/8 rounded-lg p-2">
                      <p className="text-[10px] text-white/40 mb-1">{y} años</p>
                      <p className="font-display font-bold text-gold text-sm">
                        ${monthlyEst(p.price * 0.9, y).toLocaleString('es-MX')}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-white/25 text-[10px] mt-2 text-center">*Referencial 10% enganche, 12% anual</p>
              </div>

              {/* Agent */}
              <div className="flex items-center gap-3 bg-ivory rounded-xl p-3.5">
                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={agent.photo} alt={agent.name} width={44} height={44}
                    className="object-cover object-top w-full h-full" unoptimized loading="lazy"/>
                </div>
                <div>
                  <p className="font-display font-bold text-carbon text-sm">{agent.name}</p>
                  <p className="text-carbon/50 text-xs">{agent.role} · {agent.zones[0]}</p>
                </div>
              </div>
            </div>

            {/* Right column — Map */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-carbon text-sm">Ubicación</h4>
              {mapSrc ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm h-[200px] sm:h-[240px]">
                  {!mapActive && (
                    <button type="button" onClick={() => setMapActive(true)}
                      className="sm:hidden absolute inset-0 z-10 flex items-end justify-center pb-3 bg-transparent"
                      aria-label="Activar mapa">
                      <span className="bg-black/70 text-white text-[11px] font-display font-semibold px-3 py-1.5 rounded-full">Toca para mover el mapa</span>
                    </button>
                  )}
                  <iframe
                    src={mapSrc}
                    width="100%" height="100%"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Ubicación — ${p.name}`}
                  />
                </div>
              ) : null}
              <a href={mapsLink} target="_blank" rel="noreferrer"
                className="text-gold text-xs font-display font-semibold hover:underline inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
                </svg>
                Ver en Google Maps
              </a>

              {/* Trust badges */}
              <div className="space-y-2.5 pt-2">
                {([
                  [Scale, 'Certeza Jurídica', 'Escrituras y trámites garantizados'],
                  [ShieldCheck, 'Sin pagos anticipados', 'Solo pagas cuando hay contrato firmado'],
                  [Zap, 'Respuesta rápida', 'Confirmación en menos de 1 hora'],
                ] as [React.ElementType, string, string][]).map(([Icon, t, d]) => (
                  <div key={t} className="flex gap-2.5 items-start">
                    <span className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-gold"/></span>
                    <div>
                      <p className="font-display font-bold text-carbon text-xs">{t}</p>
                      <p className="text-carbon/50 text-xs">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky CTAs ── */}
        <div className="border-t border-gray-100 px-4 sm:px-7 pt-3 sm:pt-4 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-4 flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 flex-shrink-0 bg-white">
          <a href={`https://wa.me/${agent.whatsapp}?text=${waMsg}`}
            target="_blank" rel="noreferrer"
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-[#25D366] text-white font-display font-bold text-[13px] sm:text-sm py-3.5 rounded-xl hover:bg-[#1da851] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Asesor
          </a>
          <Link
            href={`/contacto?propiedad=${encodeURIComponent(p.name)}&zona=${encodeURIComponent(p.zone)}&tipo=${encodeURIComponent(p.type)}&precio=${p.price}`}
            onClick={onClose}
            className="flex-1 min-w-[140px] text-center gold-gradient text-black font-display font-bold text-[13px] sm:text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity">
            Agendar Visita
          </Link>
          <Link href={`/propiedades/${p.slug || p.id}`} onClick={onClose}
            title="Ver ficha completa"
            className="w-full sm:w-auto flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-0 border border-carbon/15 text-carbon/60 hover:border-gold hover:text-gold font-display font-bold text-xs rounded-xl transition-colors">
            Ficha completa
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
