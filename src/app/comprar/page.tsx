'use client';
import { useState, useMemo, useEffect } from 'react';
import { Bath, BedDouble, Home, MapPin, Ruler } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PROPERTIES, ZONES, Property, badgeColor } from '@/lib/data';
import { searchProperties } from '@/lib/search';
import Reveal from '@/components/ui/Reveal';
import { LineReveal, Rise, Parallax, EASE } from '@/components/ui/Motion';
import PropertyModal from '@/components/PropertyModal';
import LiveMap from '@/components/LiveMap';
import { Map as MapIcon, X as XIcon } from 'lucide-react';

export default function ComprarPage() {
  const [tipo, setTipo]     = useState('todos');
  const [budget, setBudget] = useState(12000000);
  const [beds, setBeds]     = useState('cualquiera');
  const [zone, setZone]     = useState('todas');
  const [fin, setFin]       = useState('todos');
  const [q, setQ]           = useState('');
  const [selected, setSelected] = useState<Property | null>(null);
  const [allProps, setAllProps] = useState<Property[]>(PROPERTIES);
  const [visible, setVisible] = useState(9);   // cuántas se muestran
  const [showMapMobile, setShowMapMobile] = useState(false);

  // ── Read URL params from homepage search ──────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get('tipo'); const z = p.get('zona'); const qv = p.get('q');
    if (t && t !== 'undefined') setTipo(t);
    if (z && z !== 'undefined') setZone(z);
    if (qv) setQ(qv);
  }, []);

  // ── Load live data from admin ─────────────────────────────
  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setAllProps(data as Property[]); })
      .catch(() => {});
  }, []);

  // Al cambiar cualquier filtro, volver a la primera tanda
  useEffect(() => { setVisible(9); }, [tipo, budget, beds, zone, fin, q]);

  // ── Filtros estructurados + búsqueda difusa estilo marketplace ──
  const { filtered, similares } = useMemo(() => {
    const base = allProps.filter(p => {
      if (tipo !== 'todos' && p.type !== tipo) return false;
      if (p.price > budget) return false;
      if (zone !== 'todas' && p.zone !== zone) return false;
      if (beds !== 'cualquiera' && p.beds < parseInt(beds)) return false;
      if (fin !== 'todos' && !p.financing.includes(fin)) return false;
      return true;
    });
    const ql = q.trim();
    if (!ql) {
      return {
        filtered: [...base].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)),
        similares: [] as Property[],
      };
    }
    // Motor difuso: coincidencias fuertes + parecidas (tolera errores y sinónimos)
    const { exact, similar } = searchProperties(ql, base);
    if (exact.length > 0) return { filtered: exact, similares: similar.slice(0, 3) };
    // Sin coincidencia exacta: mostramos las similares para no dejar vacío
    const fallback = similar.length > 0 ? similar : searchProperties(ql, allProps).similar;
    return { filtered: [] as Property[], similares: fallback };
  }, [allProps, tipo, budget, beds, zone, fin, q]);

  return (
    <>
      {/* Header */}
      <section className="relative bg-[#0A0A0A] grain pt-32 pb-12 sm:pt-40 sm:pb-16 overflow-hidden">
        <Parallax amount={50} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1800&q=75&auto=format&fit=crop"
            alt="" data-parallax="10" className="w-full h-[125%] object-cover opacity-30"/>
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/50"/>
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.8,ease:EASE}}
            className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-gold"/>
            <span className="text-gold text-[10px] sm:text-xs font-display font-bold tracking-[4px] uppercase">Comprar</span>
          </motion.div>
          <h1 className="font-serif font-bold text-white leading-[0.94] mb-4" style={{fontSize:'clamp(2.4rem,7vw,5rem)'}}>
            <LineReveal delay={.3}>Catálogo de</LineReveal>
            <LineReveal delay={.42}><span className="gold-text italic">propiedades</span></LineReveal>
          </h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.85,duration:.8}}
            className="text-white/55 text-sm sm:text-base max-w-lg">
            {allProps.length} propiedades verificadas en Mixquiahuala, Tezontepec, Pachuca y más.
            Cada una con fotos, mapa y opciones de crédito.
          </motion.p>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

          {/* ── Filters ── */}
          <Reveal className="bg-ivory rounded-2xl p-4 sm:p-5 mb-8 border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
              {[
                {id:'tipo',val:tipo,set:setTipo,label:'Tipo',opts:[['todos','Todos'],['casa_hecha','Casa hecha'],['personalizable','Personalizable'],['terreno','Terreno'],['departamento','Depto']]},
                {id:'beds',val:beds,set:setBeds,label:'Recámaras',opts:[['cualquiera','Cualquiera'],['1','1+'],['2','2+'],['3','3+'],['4','4+']]},
                {id:'zone',val:zone,set:setZone,label:'Zona',opts:[['todas','Todas'],...ZONES.slice(0,5).map(z=>[z,z])]},
                {id:'fin', val:fin, set:setFin, label:'Crédito',opts:[['todos','Todos'],['INFONAVIT','INFONAVIT'],['FOVISSSTE','FOVISSSTE'],['Bancario','Bancario'],['Contado','Contado']]},
              ].map(f=>(
                <div key={f.id}>
                  <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <select value={f.val} onChange={e=>f.set(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold transition-colors">
                    {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">Buscar</label>
                <input value={q} onChange={e=>setQ(e.target.value)}
                  placeholder="Colonia, característica…"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold transition-colors"/>
              </div>
              <div>
                <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">Presupuesto</label>
                <div className="flex items-center gap-1.5">
                  <input type="range" min={1000000} max={12000000} step={200000} value={budget}
                    onChange={e=>setBudget(Number(e.target.value))} className="flex-1 accent-gold"/>
                  <span className="text-[10px] text-carbon/50 whitespace-nowrap">${(budget/1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
              <p className="text-muted text-xs">Mostrando {Math.min(visible, filtered.length)} de {filtered.length} propiedad{filtered.length!==1?'es':''} · destacadas al inicio</p>
              {/* Móvil/tablet: mostrar u ocultar el mapa */}
              <button onClick={()=>setShowMapMobile(m=>!m)}
                className="lg:hidden inline-flex items-center gap-1.5 border border-carbon/15 hover:border-gold text-carbon/70 hover:text-gold text-[11px] font-display font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors">
                {showMapMobile ? <><XIcon className="w-3.5 h-3.5"/>Ocultar mapa</> : <><MapIcon className="w-3.5 h-3.5"/>Ver mapa</>}
              </button>
            </div>
          </Reveal>

          {/* Mapa en móvil (colapsable) */}
          {showMapMobile && (
            <div className="lg:hidden mb-7" data-no-fx>
              <LiveMap properties={filtered} onSelect={p=>setSelected(p)} height="52vh" minHeight={320}/>
            </div>
          )}

          {/* Layout: resultados a la izquierda · mapa fijo a la derecha (desktop) */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 lg:items-start">
          <div className="min-w-0">

          {/* ── Grid ── */}
          {filtered.length === 0 && similares.length === 0 ? (
            <Reveal className="text-center py-24 bg-ivory rounded-2xl border border-dashed border-gold/30">
              <Home className="w-12 h-12 text-gold/50 mx-auto mb-4" strokeWidth={1.2}/>
              <h3 className="font-serif font-bold text-carbon text-2xl mb-2">Sin resultados</h3>
              <p className="text-muted text-sm mb-6">Prueba ajustando los filtros o el texto de búsqueda</p>
              <Link href="/contacto" className="inline-block gold-gradient text-black font-display font-bold text-sm px-7 py-3.5 rounded-full">
                Hablar con un agente
              </Link>
            </Reveal>
          ) : filtered.length === 0 ? (
            <>
              {/* No hubo coincidencia exacta → banner + similares (estilo marketplace) */}
              <Reveal className="text-center py-10 mb-8 bg-ivory rounded-2xl border border-dashed border-gold/30">
                <Home className="w-10 h-10 text-gold/50 mx-auto mb-3" strokeWidth={1.2}/>
                <h3 className="font-serif font-bold text-carbon text-xl sm:text-2xl mb-1.5">
                  No encontramos exactamente &ldquo;{q}&rdquo;
                </h3>
                <p className="text-muted text-sm">Pero estas opciones se parecen a lo que buscas:</p>
              </Reveal>
              <SimilarGrid props={similares} onSelect={p=>setSelected(p)}/>
            </>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              <AnimatePresence mode="popLayout">
                {filtered.slice(0, visible).map((p,i)=>{
                  const bc = badgeColor(p.badge, p.badgeColor);
                  return (
                    <motion.div key={p.slug || p.id} layout
                      initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}}
                      transition={{duration:0.75, delay:(i%3)*0.09, ease:EASE}}>
                      <button onClick={()=>setSelected(p as Property)}
                        className="group block prop-card bg-white rounded-2xl overflow-hidden border border-gray-100 w-full text-left cursor-pointer">
                        <div className="relative h-52 overflow-hidden">
                          <Image src={p.images[0]} alt={p.name} fill
                            className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.07]" unoptimized loading="lazy"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/>
                          <span className={`absolute top-3 left-3 ${bc} text-white text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full`}>{p.badge}</span>
                          {p.featured && <span className="absolute top-3 right-3 gold-gradient text-black text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full">⭐ Destacada</span>}
                          <p className="absolute bottom-3 left-3 font-display font-extrabold text-white text-xl">${p.price.toLocaleString('es-MX')}</p>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <span className="bg-white/25 backdrop-blur-sm border border-white/40 text-white text-xs font-display font-bold px-4 py-2 rounded-full">
                              Ver fotos, mapa y detalles
                            </span>
                          </div>
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-display font-bold text-carbon text-sm sm:text-base mb-1.5 leading-tight group-hover:text-gold transition-colors line-clamp-2">{p.name}</h3>
                          <p className="text-muted text-xs flex items-center gap-1 mb-2.5"><MapPin className="w-3 h-3 text-gold"/>{p.zone}</p>
                          <div className="flex gap-3 text-xs text-carbon/55 mb-3">
                            {p.beds>0&&<span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-gold/70"/>{p.beds}</span>}
                            {p.baths>0&&<span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-gold/70"/>{p.baths}</span>}
                            <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-gold/70"/>{p.buildM2||p.landM2} m²</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {p.financing.slice(0,3).map(f=>(
                              <span key={f} className="text-[10px] border border-gold/25 text-gold-dark font-display font-semibold px-2 py-0.5 rounded-full">{f}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* También podrían interesarte (búsqueda con extras parecidos) */}
          {filtered.length > 0 && similares.length > 0 && q.trim() && (
            <div className="mt-12">
              <p className="font-serif font-bold text-carbon text-xl sm:text-2xl mb-5">También podrían interesarte</p>
              <SimilarGrid props={similares} onSelect={p=>setSelected(p)}/>
            </div>
          )}

          {/* Ver más propiedades */}
          {visible < filtered.length && (
            <div className="mt-12 text-center">
              <motion.button onClick={()=>setVisible(v=>v+9)}
                initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                transition={{duration:.6}}
                className="group inline-flex items-center gap-3 border border-carbon/20 hover:border-gold text-carbon hover:text-gold font-display font-bold text-xs uppercase tracking-[2px] px-9 py-4 rounded-full transition-all duration-400">
                Ver más propiedades
                <span className="text-muted group-hover:text-gold text-[11px] normal-case tracking-normal font-body transition-colors">
                  ({filtered.length - visible} restantes)
                </span>
                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 3v10M4 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
          )}

          <Reveal className="mt-14 text-center">
            <p className="text-muted text-sm mb-4">¿No encuentras lo que buscas?</p>
            <Link href="/contacto" className="inline-flex items-center gap-2 gold-gradient text-black font-display font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity">
              Hablar con un agente →
            </Link>
          </Reveal>
          </div>

          {/* Mapa sincronizado con los filtros — igual al de la página Mapa */}
          <aside className="hidden lg:block" data-no-fx>
            <div className="sticky top-24">
              <LiveMap properties={filtered} onSelect={p=>setSelected(p)}
                height="calc(100vh - 130px)" minHeight={480}/>
              <p className="text-muted text-[11px] mt-3 text-center">
                {filtered.length} propiedad{filtered.length!==1?'es':''} en el mapa · pasa el mouse por un marcador
              </p>
            </div>
          </aside>
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selected && <PropertyModal property={selected} onClose={()=>setSelected(null)}/>}
      </AnimatePresence>
    </>
  );
}

/* ── Grid de propiedades similares (búsqueda sin coincidencia exacta) ── */
function SimilarGrid({ props, onSelect }: { props: Property[]; onSelect: (p: Property) => void }) {
  return (
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
      {props.map((p, i) => {
        const bc = badgeColor(p.badge, p.badgeColor);
        return (
          <motion.div key={p.slug || p.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.09, ease: EASE }}>
            <button onClick={() => onSelect(p)}
              className="group block prop-card bg-white rounded-2xl overflow-hidden border border-gray-100 w-full text-left cursor-pointer">
              <div className="relative h-52 overflow-hidden">
                <Image src={p.images[0]} alt={p.name} fill
                  className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.07]" unoptimized loading="lazy"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/>
                <span className={`absolute top-3 left-3 ${bc} text-white text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full`}>{p.badge}</span>
                <span className="absolute top-3 right-3 bg-white/20 backdrop-blur border border-white/40 text-white text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full">Similar</span>
                <p className="absolute bottom-3 left-3 font-display font-extrabold text-white text-xl">${p.price.toLocaleString('es-MX')}</p>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-display font-bold text-carbon text-sm sm:text-base mb-1.5 leading-tight group-hover:text-gold transition-colors line-clamp-2">{p.name}</h3>
                <p className="text-muted text-xs flex items-center gap-1 mb-2.5"><MapPin className="w-3 h-3 text-gold"/>{p.zone}</p>
                <div className="flex gap-3 text-xs text-carbon/55">
                  {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-gold/70"/>{p.beds}</span>}
                  {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-gold/70"/>{p.baths}</span>}
                  <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-gold/70"/>{p.buildM2 || p.landM2} m²</span>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
