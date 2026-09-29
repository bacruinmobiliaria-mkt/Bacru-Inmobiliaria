'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import { PROPERTIES, Property } from '@/lib/data';
import LiveMap from '@/components/LiveMap';
import PropertyModal from '@/components/PropertyModal';

const TIPOS = [['todos','Todos'],['casa_hecha','Casa hecha'],['personalizable','Personalizable'],['terreno','Terreno'],['departamento','Departamento']];

export default function MapaPage() {
  const [props, setProps]   = useState<Property[]>(PROPERTIES);
  const [budget, setBudget] = useState(12000000);
  const [tipo, setTipo]     = useState('todos');
  const [selected, setSelected] = useState<Property | null>(null);

  // Datos vivos de la base de datos
  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setProps(d as Property[]); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() =>
    props.filter(p =>
      p.price <= budget &&
      (tipo === 'todos' || p.type === tipo)
    ), [props, budget, tipo]);

  return (
    <>
      {/* Header */}
      <div className="bg-carbon pt-24 pb-8 sm:pt-32 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}>
            <p className="font-display font-bold text-gold text-xs uppercase tracking-[4px] mb-3">Mapa Interactivo</p>
            <h1 className="split font-serif font-bold text-white text-3xl sm:text-5xl mb-2">Explora por ubicación</h1>
            <p className="text-white/50 text-sm">{filtered.length} propiedad{filtered.length!==1?'es':''} en el mapa · Se actualiza automáticamente</p>
          </motion.div>
        </div>
      </div>

      <section className="bg-white py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Filtros */}
          <div className="reveal bg-ivory rounded-2xl p-4 mb-6 border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">Tipo</label>
              <select value={tipo} onChange={e=>setTipo(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:outline-none focus:border-gold">
                {TIPOS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-display font-bold text-carbon/50 uppercase tracking-widest mb-1.5">
                Presupuesto máx: ${(budget/1000000).toFixed(1)}M
              </label>
              <input type="range" min={1000000} max={12000000} step={200000} value={budget}
                onChange={e=>setBudget(Number(e.target.value))} className="w-full accent-gold"/>
            </div>
            <p className="text-muted text-xs sm:text-right">
              <MousePointerClick className="w-3.5 h-3.5 inline mr-1 text-gold"/>
              Pasa el mouse o toca un marcador para ver la propiedad
            </p>
          </div>

          {/* El mapa unificado del sitio */}
          <LiveMap properties={filtered} onSelect={p=>setSelected(p)} height="65vh" minHeight={420}/>

          <p className="text-muted text-xs mt-4 text-center">
            Las propiedades se geolocalizan automáticamente desde el enlace de Google Maps que registra el asesor.
          </p>
        </div>
      </section>

      {/* El mismo popup que en la página de Comprar */}
      <AnimatePresence>
        {selected && <PropertyModal property={selected} onClose={()=>setSelected(null)}/>}
      </AnimatePresence>
    </>
  );
}
