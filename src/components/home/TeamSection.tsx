'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { AGENTS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

export default function TeamSection() {
  const { t } = useLanguage();

  return (
    <section id="equipo" className="bg-black py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3">{t.team.title}</h2>
          <div className="gold-divider w-20 mx-auto mb-4" />
          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto">{t.team.sub}</p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {AGENTS.map((agent, i) => {
            const msg = encodeURIComponent(`Hola ${agent.name}! Vi tu perfil en Bacru Inmobiliaria y me gustaría recibir asesoría.`);
            return (
              <Reveal key={agent.id} delay={i * 0.07}>
                <motion.div
                  className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden hover:border-gold/40 transition-all duration-300 group"
                  whileHover={{ y:-5, boxShadow:'0 20px 40px rgba(212,175,55,0.15)' }}
                >
                  {/* Photo */}
                  <div className="relative h-48 sm:h-60 overflow-hidden">
                    <Image
                      src={agent.photo}
                      alt={agent.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {agent.id === 'carlos' && (
                      <div className="absolute top-2 right-2 gold-gradient text-black text-[9px] font-display font-bold px-2 py-0.5 rounded-full">
                        Director
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <h4 className="font-display font-bold text-white text-sm sm:text-base leading-tight mb-0.5 group-hover:text-gold transition-colors">
                      {agent.name}
                    </h4>
                    <p className="text-white/50 text-xs mb-1.5">{agent.role}</p>
                    <p className="text-gold/80 text-[11px] font-body mb-3">
                      📍 {agent.zones.length > 2 ? 'Todas las zonas' : agent.zones.join(', ')}
                    </p>
                    <a href={`https://wa.me/${agent.whatsapp}?text=${msg}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-display font-bold py-2 rounded-xl hover:bg-[#25D366] hover:text-white transition-all duration-200"
                      onClick={e => e.stopPropagation()}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {t.team.whatsappBtn}
                    </a>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
