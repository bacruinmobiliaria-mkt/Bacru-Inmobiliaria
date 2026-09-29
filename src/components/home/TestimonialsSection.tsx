'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { TESTIMONIALS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

function Stars({ n }: { n: number }) {
  return <div className="flex gap-0.5">{Array.from({length:n}).map((_,i) => <span key={i} className="text-gold text-sm">★</span>)}</div>;
}

export default function TestimonialsSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-ivory py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-carbon mb-3">{t.testimonials.title}</h2>
          <div className="gold-divider w-20 mx-auto mb-4" />
          <p className="text-carbon/60 text-sm sm:text-base">{t.testimonials.sub}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
          {TESTIMONIALS.map((test, i) => (
            <Reveal key={i} delay={i*0.1}>
              <motion.div
                className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                whileHover={{ boxShadow:'0 20px 40px rgba(212,175,55,0.1)' }}
              >
                <Stars n={test.rating} />
                <p className="text-carbon/75 text-sm leading-relaxed my-4 italic">"{test.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-display font-bold text-base flex-shrink-0">
                    {test.avatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-carbon text-sm">{test.name}</p>
                    <p className="text-carbon/50 text-xs">📍 {test.zone}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Trust badges */}
        <Reveal className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
          {['Certeza Jurídica Total','Proceso Transparente','Atención Personalizada','Sin Letra Chica'].map(b => (
            <div key={b} className="flex items-center gap-2 bg-white border border-gold/20 rounded-full px-4 py-2 shadow-sm">
              <span className="text-gold text-sm">✓</span>
              <span className="text-carbon text-xs sm:text-sm font-display font-semibold">{b}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
