'use client';
import { useState, useMemo, useEffect } from 'react';
import { Bath, BedDouble, Home, MapPin, Ruler } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PROPERTIES, ZONES, Property, badgeColor } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';
import { LineReveal, Parallax, EASE } from '@/components/ui/Motion';
import PropertyModal from '@/components/PropertyModal';

export default function PropiedadesPage() {
  const [tipo, setTipo]   = useState('todos');
  const [budget, setBudget] = useState(12000000);
  const [beds, setBeds]   = useState('cualquiera');
  const [zone, setZone]   = useState('todas');
  const [selected, setSelected] = useState<Property | null>(null);
  const [allProps, setAllProps] = useState<Property[]>(PROPERTIES);

  // Load live data from admin
  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setAllProps(data as Property[]); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() =>
    allProps
      .filter(p => {
        if (tipo !== 'todos' && p.type !== tipo) return false;
        if (p.price > budget) return false;
        if (zone !== 'todas' && p.zone !== zone) return false;
        if (beds !== 'cualquiera' && p.beds < parseInt(beds)) return false;
        return true;
      })
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)),
    [allProps, tipo, budget, beds, zone]);

  return (
    <>
      <div className="bg-carbon pt-24 pb-10 sm:pt-32 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
            <p className="font-display font-bold text-gold text-xs uppercase tracking-[4px] mb-3">Catálogo</p>
            <h1 className="font-serif font-bold text-white text-3xl sm:text-5xl mb-2">Propiedades disponibles</h1>
            <p className="text-white/50 text-sm">{allProps.length} propiedades · Hidalgo · EdoMex · CDMX</p>
          </motion.div>
        </div>
      </div>

      <section className="bg-white py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Filters */}
          <Reveal className="bg-ivory rounded-2xl p-4 sm:p-5 mb-8 border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              {[
                {id:'tipo',val:tipo,set:setTipo,label:'Tipo',opts:[['todos','Todos'],['casa_hecha','Casa hecha'],['personalizable','Personalizable'],['terreno','Terreno'],['departamento','Departamento']]},
                {id:'beds',val:beds,set:setBeds,label:'Recámaras',opts:[['cualquiera','Cualquiera'],['1','1+'],['2','2+'],['3','3+'],['4','4+']]},
                {id:'zone',val:zone,set:setZone,label:'Zona',opts:[['todas','Todas'],...ZONES.slice(0,6).map(z=>[z,z])]},
              ].map(f=>(
                <div key={f.id}>
                  <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <select value={f.val} onChange={e=>f.set(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold">
                    {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">Máx ${(budget/1000000).toFixed(1)}M</label>
                <input type="range" min={1000000} max={12000000} step={200000} value={budget}
                  onChange={e=>setBudget(Number(e.target.value))} className="w-full accent-gold"/>
              </div>
            </div>
            <p className="text-muted text-xs mt-3">{filtered.length} propiedad{filtered.length!==1?'es':''} · destacadas al inicio</p>
          </Reveal>

          {/* Grid */}
          {filtered.length === 0 ? (
            <Reveal className="text-center py-24 bg-ivory rounded-2xl border border-dashed border-gold/30">
              <Home className="w-12 h-12 text-gold/50 mx-auto mb-4" strokeWidth={1.2}/>
              <h3 className="font-serif font-bold text-carbon text-2xl mb-2">Sin resultados</h3>
              <Link href="/contacto" className="inline-block gold-gradient text-black font-display font-bold text-sm px-7 py-3.5 rounded-full mt-4">
                Hablar con un agente
              </Link>
            </Reveal>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
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
                            <span className="bg-white/25 backdrop-blur-sm border border-white/40 text-white text-xs font-display font-bold px-4 py-2 rounded-full">Ver detalles, fotos y mapa</span>
                          </div>
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-display font-bold text-carbon text-sm sm:text-base mb-1.5 leading-tight group-hover:text-gold transition-colors line-clamp-2">{p.name}</h3>
                          <p className="flex items-center gap-1 text-muted text-xs mb-2.5"><MapPin className="w-3 h-3 text-gold"/>{p.zone}</p>
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

          <Reveal className="mt-14 text-center">
            <p className="text-muted text-sm mb-4">¿No encuentras lo que buscas?</p>
            <Link href="/contacto" className="inline-flex items-center gap-2 gold-gradient text-black font-display font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity">
              Hablar con un agente →
            </Link>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {selected && <PropertyModal property={selected} onClose={()=>setSelected(null)}/>}
      </AnimatePresence>
    </>
  );
}
