'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AGENTS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

const ZONE_MAP: Record<string, string[]> = {
  'Pachuca': ['Eros', 'Miguel', 'José', 'Teo'],
  'Tepatepec/San Antonio': ['Edwin', 'Karla', 'Carlos'],
  'Mixquiahuala/Tezontepec': ['Rosita', 'Carlos'],
  'Todas las zonas': ['Carlos'],
};

export default function EquipoPage() {
  return (
    <>
      <div className="bg-black pt-24 pb-12 sm:pt-32 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <motion.p className="text-gold font-display font-bold text-xs uppercase tracking-[4px] mb-4"
            initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>Nuestro Equipo</motion.p>
          <motion.h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white mb-4"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}}>
            Conoce a tu futuro asesor
          </motion.h1>
          <motion.p className="text-white/60 text-sm sm:text-lg max-w-2xl mx-auto"
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
            Cada asesor es especialista en su zona. Uno de ellos estará dedicado exclusivamente a tu proceso.
          </motion.p>
        </div>
      </div>

      <section className="bg-ivory py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Zone guide */}
          <Reveal className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-gray-100 mb-10 sm:mb-14">
            <h3 className="font-display font-bold text-carbon text-base mb-4">¿Quién te atiende según tu zona?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(ZONE_MAP).map(([zone, names]) => (
                <div key={zone} className="bg-ivory rounded-xl p-3.5">
                  <p className="font-display font-bold text-carbon text-xs mb-2">📍 {zone}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {names.map(n => <span key={n} className="text-[11px] bg-gold/12 text-yellow-700 font-display font-semibold px-2.5 py-1 rounded-full border border-gold/20">{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Team grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {AGENTS.map((agent, i) => {
              const msg = encodeURIComponent(`Hola ${agent.name}! Vi tu perfil en Bacru Inmobiliaria y me gustaría recibir asesoría sobre propiedades en ${agent.zones[0]}.`);
              return (
                <Reveal key={agent.id} delay={i * 0.06}>
                  <motion.div whileHover={{y:-6, boxShadow:'0 20px 40px rgba(212,175,55,0.15)'}}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group transition-all duration-300">
                    {/* Photo */}
                    <div className="relative overflow-hidden" style={{height:220}}>
                      <Image src={agent.photo} alt={agent.name} fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
                      {agent.id==='carlos'&&(
                        <div className="absolute top-2 right-2 gold-gradient text-black text-[9px] font-display font-bold px-2 py-0.5 rounded-full">Director</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                        <p className="text-white font-display font-bold text-sm leading-tight">{agent.name}</p>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <p className="text-carbon/55 text-xs mb-1">{agent.role}</p>
                      <p className="text-gold/80 text-[11px] font-body mb-2.5">
                        📍 {agent.zones.length>2?'Todas las zonas':agent.zones.join(' · ')}
                      </p>
                      <a href={`https://wa.me/${agent.whatsapp}?text=${msg}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-display font-bold py-2 rounded-xl hover:bg-[#25D366] hover:text-white transition-all duration-200">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Contactar
                      </a>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>

          {/* Commitment */}
          <Reveal className="mt-14 bg-black rounded-2xl p-7 sm:p-12 text-center">
            <h3 className="font-display font-extrabold text-white text-xl sm:text-2xl mb-3">Nuestro Compromiso</h3>
            <div className="gold-divider w-16 mx-auto mb-5"/>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-7">
              Cuando elige a Bacru, se le asigna un asesor de nombre, que conoce su zona, entiende su presupuesto y lo acompaña hasta la entrega de llaves. No es un número de ticket. Es una persona comprometida.
            </p>
            <Link href="/contacto" className="inline-block gold-gradient text-black font-display font-bold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
              Encontrar Mi Asesor →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
