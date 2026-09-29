'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import Reveal from '@/components/ui/Reveal';

export function WhyBacruSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-black py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3">{t.why.title}</h2>
          <div className="gold-divider w-20 mx-auto mb-4" />
          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto">{t.why.sub}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {t.why.items.map((item, i) => (
            <Reveal key={i} delay={i*0.09}>
              <motion.div
                className="bg-white/4 border border-white/8 rounded-2xl p-6 sm:p-7 hover:bg-white/8 hover:border-gold/30 transition-all duration-300 group"
                whileHover={{ y:-4 }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-white text-base sm:text-lg mb-3 group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StepsSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-ivory py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-carbon mb-3">{t.steps.title}</h2>
          <div className="gold-divider w-20 mx-auto mb-4" />
          <p className="text-carbon/60 text-sm sm:text-base">{t.steps.sub}</p>
        </Reveal>

        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
            {t.steps.items.map((step, i) => (
              <Reveal key={i} delay={i*0.1} direction="up">
                <div className="flex flex-col items-center text-center md:block md:text-center">
                  {/* Number circle */}
                  <div className="w-14 h-14 rounded-full gold-gradient text-black font-display font-extrabold text-lg flex items-center justify-center mb-4 mx-auto shadow-lg relative z-10">
                    {step.num}
                  </div>
                  <h4 className="font-display font-bold text-carbon text-sm sm:text-base mb-2">{step.title}</h4>
                  <p className="text-carbon/60 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="text-center mt-12" delay={0.5}>
          <a href="#cita" className="inline-block gold-gradient text-black font-display font-bold text-sm uppercase tracking-wide px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
            Comenzar mi proceso →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
