'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { PROPERTIES, ZONES, Property, AGENTS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

// ── Property Modal ──────────────────────────────────────────
function PropertyModal({ prop, onClose }: { prop: Property; onClose: () => void }) {
  const { t } = useLanguage();
  const agent = AGENTS.find(a => a.id === prop.agentId)!;
  const msg = encodeURIComponent(`Hola Bacru! Me interesa la propiedad "${prop.name}" en ${prop.zone} por $${prop.price.toLocaleString('es-MX')} MXN. ¿Podemos agendar una visita?`);

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
      <div className="absolute inset-0 modal-backdrop" />
      <motion.div
        className="relative z-10 bg-[#0d0d0d] w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden border border-gold/20 max-h-[95vh] flex flex-col"
        initial={{ y:60, scale:0.95 }} animate={{ y:0, scale:1 }} exit={{ y:60, opacity:0 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-56 sm:h-72 flex-shrink-0">
          <Image src={prop.images[0]} alt={prop.name} fill className="object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className={`absolute top-3 left-3 ${prop.badgeColor} text-white text-xs font-display font-bold px-3 py-1 rounded-full`}>
            {prop.badge}
          </span>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-lg hover:bg-black/80 transition-colors">
            ×
          </button>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-display font-bold text-xl sm:text-2xl leading-tight">{prop.name}</p>
            <p className="text-gold font-display font-extrabold text-2xl sm:text-3xl">${prop.price.toLocaleString('es-MX')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70 mb-4">
            <span>📍 {prop.zone}</span>
            {prop.beds > 0 && <span>🛏️ {prop.beds} {t.properties.rec}</span>}
            {prop.baths > 0 && <span>🛁 {prop.baths} {t.properties.ban}</span>}
            {prop.buildM2 > 0 && <span>📐 {prop.buildM2} {t.properties.m2}</span>}
            <span>🌿 {prop.landM2} {t.properties.m2}</span>
          </div>
          <p className="text-white/75 text-sm leading-relaxed mb-4">{prop.description}</p>
          <p className="text-white/50 text-xs mb-2">🏫 {prop.nearby}</p>

          {/* Financing */}
          <div className="flex flex-wrap gap-2 mb-5">
            {prop.financing.map(f => (
              <span key={f} className="bg-gold/10 border border-gold/30 text-gold text-xs px-3 py-1 rounded-full font-display font-semibold">{f}</span>
            ))}
          </div>

          {/* Agent */}
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 mb-5">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image src={agent.photo} alt={agent.name} width={40} height={40} className="object-cover w-full h-full" loading="lazy" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-sm">{agent.name}</p>
              <p className="text-white/50 text-xs">{agent.role} · {agent.zones[0]}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`https://wa.me/${agent.whatsapp}?text=${msg}`} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-display font-bold text-sm py-3.5 rounded-xl hover:bg-[#1da851] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Asesor
            </a>
            <a href="#cita" onClick={onClose}
              className="flex-1 text-center gold-gradient text-black font-display font-bold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity">
              {t.properties.quieroCita}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Filter + Grid ───────────────────────────────────────────
export default function PropiedadesSection() {
  const { t } = useLanguage();
  const [tipo, setTipo] = useState('todos');
  const [budget, setBudget] = useState(12000000);
  const [beds, setBeds] = useState('cualquiera');
  const [zone, setZone] = useState('todas');
  const [selected, setSelected] = useState<Property | null>(null);

  const filtered = useMemo(() => PROPERTIES.filter(p => {
    if (tipo !== 'todos' && p.type !== tipo) return false;
    if (p.price > budget) return false;
    if (zone !== 'todas' && p.zone !== zone) return false;
    if (beds !== 'cualquiera' && p.beds < parseInt(beds)) return false;
    return true;
  }), [tipo, budget, beds, zone]);

  return (
    <>
      <section id="propiedades" className="bg-ivory py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

          {/* Header */}
          <Reveal className="text-center mb-10 sm:mb-14">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-carbon mb-3">{t.properties.title}</h2>
            <div className="gold-divider w-20 mx-auto mb-3" />
            <p className="text-carbon/60 text-sm sm:text-base max-w-xl mx-auto">{t.properties.sub}</p>
          </Reveal>

          {/* Filter bar */}
          <Reveal className="bg-white rounded-2xl p-4 sm:p-6 shadow-md mb-10 sm:mb-12 border border-gold/15">
            <p className="font-display font-bold text-carbon text-sm sm:text-base mb-4 text-center">{t.filter.title}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-display font-semibold text-carbon/70 mb-1.5">{t.filter.tipo}</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold transition-colors">
                  <option value="todos">{t.filter.todos}</option>
                  <option value="casa_hecha">Casa habitación</option>
                  <option value="personalizable">Personalizable</option>
                  <option value="terreno">Terreno</option>
                  <option value="departamento">Departamento</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-display font-semibold text-carbon/70 mb-1.5">{t.filter.presupuesto}</label>
                <select value={budget} onChange={e => setBudget(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold transition-colors">
                  <option value={12000000}>Sin límite</option>
                  <option value={1500000}>Hasta $1.5M</option>
                  <option value={2000000}>Hasta $2M</option>
                  <option value={3000000}>Hasta $3M</option>
                  <option value={5000000}>Hasta $5M</option>
                  <option value={8000000}>Hasta $8M</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-display font-semibold text-carbon/70 mb-1.5">{t.filter.recamaras}</label>
                <select value={beds} onChange={e => setBeds(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold transition-colors">
                  <option value="cualquiera">{t.filter.cualquiera}</option>
                  {['1','2','3','4'].map(n => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-display font-semibold text-carbon/70 mb-1.5">{t.filter.zona}</label>
                <select value={zone} onChange={e => setZone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold transition-colors">
                  <option value="todas">{t.filter.todasZonas}</option>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>
          </Reveal>

          {/* Grid */}
          {filtered.length === 0 ? (
            <Reveal className="text-center py-16 bg-white rounded-2xl border border-gold/15">
              <p className="text-4xl mb-4">🏚️</p>
              <h3 className="font-display font-bold text-carbon text-xl mb-2">{t.properties.noResults}</h3>
              <p className="text-carbon/60 text-sm mb-6">{t.properties.noResultsSub}</p>
              <button className="gold-gradient text-black font-display font-bold text-sm px-6 py-3 rounded-full">
                {t.properties.chatAsesor}
              </button>
            </Reveal>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.div key={p.id} layout
                    initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                    exit={{ opacity:0, scale:0.92 }}
                    transition={{ duration:0.3, delay:i*0.05 }}
                    onClick={() => setSelected(p)}
                    className="property-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className={`absolute top-3 left-3 ${p.badgeColor} text-white text-[10px] sm:text-xs font-display font-bold px-2.5 py-1 rounded-full`}>
                        {p.badge}
                      </span>
                      {p.featured && (
                        <span className="absolute top-3 right-3 gold-gradient text-black text-[10px] font-display font-bold px-2.5 py-1 rounded-full">
                          ⭐ {t.properties.featured}
                        </span>
                      )}
                      <p className="absolute bottom-3 left-3 right-3 text-white font-display font-bold text-sm sm:text-base leading-tight line-clamp-2">
                        {p.name}
                      </p>
                    </div>

                    <div className="p-4 sm:p-5">
                      <p className="font-display font-extrabold text-xl sm:text-2xl gold-text mb-2">
                        ${p.price.toLocaleString('es-MX')}
                      </p>
                      <p className="text-carbon/60 text-xs flex items-center gap-1.5 mb-3">
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
                        {p.zone}
                      </p>
                      <div className="flex gap-3 text-xs text-carbon/70 mb-3">
                        {p.beds > 0 && <span>🛏️ {p.beds} {t.properties.rec}</span>}
                        {p.baths > 0 && <span>🛁 {p.baths}</span>}
                        <span>📐 {p.buildM2 || p.landM2}{t.properties.m2}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {p.financing.slice(0,2).map(f => (
                          <span key={f} className="text-[10px] bg-gold/8 text-gold-dark font-display font-semibold px-2 py-0.5 rounded-full border border-gold/20">{f}</span>
                        ))}
                        {p.financing.length > 2 && <span className="text-[10px] text-carbon/40">+{p.financing.length-2}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-display font-semibold text-xs flex items-center gap-1.5 group-hover:gap-3 transition-all">
                          {t.properties.verDetalle} →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <Reveal className="text-center mt-10">
            <p className="text-carbon/50 text-sm">¿No encuentras lo que buscas?</p>
            <a href="#cita" className="inline-block mt-3 gold-gradient text-black font-display font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
              Habla con un asesor →
            </a>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {selected && <PropertyModal prop={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
