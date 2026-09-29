'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { FINANCING_OPTIONS, PROPERTIES } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

function MortgageCalc() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(1500000);
  const [years, setYears] = useState(15);
  const rate = 0.12; // 12% annual (typical Mexico)
  const monthly = (amount * (rate/12)) / (1 - Math.pow(1 + rate/12, -years*12));

  return (
    <div className="bg-white/5 border border-gold/20 rounded-2xl p-5 sm:p-7">
      <h4 className="font-display font-bold text-white text-base sm:text-lg mb-4">{t.credits.calcTitle}</h4>
      <p className="text-white/55 text-xs mb-5">{t.credits.calcSub}</p>

      <div className="space-y-4 mb-5">
        <div>
          <label className="text-white/60 text-xs font-display font-semibold block mb-1.5">
            Valor de la propiedad: ${amount.toLocaleString('es-MX')} MXN
          </label>
          <input type="range" min={1000000} max={12000000} step={100000} value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full accent-gold" />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>$1M</span><span>$12M</span>
          </div>
        </div>
        <div>
          <label className="text-white/60 text-xs font-display font-semibold block mb-1.5">
            {t.credits.plazo}: {years} {t.credits.anos}
          </label>
          <input type="range" min={5} max={20} step={5} value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-gold" />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>5 años</span><span>20 años</span>
          </div>
        </div>
      </div>

      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-center mb-4">
        <p className="text-white/60 text-xs mb-1">{t.credits.mensualidad}</p>
        <p className="font-display font-extrabold text-2xl sm:text-3xl gold-text">
          ${Math.round(monthly).toLocaleString('es-MX')}
        </p>
        <p className="text-white/40 text-xs mt-1">MXN / mes · Tasa referencial 12% anual</p>
      </div>

      <a href={`https://wa.me/527736801410?text=${encodeURIComponent('Hola Bacru! Me gustaría saber mi capacidad real de crédito para una propiedad.')}`}
        target="_blank" rel="noreferrer"
        className="block w-full text-center gold-gradient text-black font-display font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity">
        {t.credits.cta}
      </a>
    </div>
  );
}

export function CreditsSection() {
  const { t } = useLanguage();
  return (
    <section id="creditos" className="bg-black py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3">{t.credits.title}</h2>
          <div className="gold-divider w-20 mx-auto mb-4" />
          <p className="text-white/60 text-sm sm:text-base">{t.credits.sub}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Financing options */}
          <div className="space-y-4">
            {FINANCING_OPTIONS.map((f, i) => (
              <Reveal key={f.id} delay={i*0.08}>
                <motion.div className="bg-white/4 border border-white/8 rounded-2xl p-5 flex gap-4 hover:border-gold/30 transition-all"
                  whileHover={{ x:4 }}>
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <h4 className="font-display font-bold text-gold text-sm sm:text-base mb-1">{f.label}</h4>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Calculator */}
          <Reveal direction="right">
            <MortgageCalc />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Appointment CTA ──────────────────────────────────────────
export function CitaSection() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ nombre:'', tel:'', propiedad:'', fecha:'', comentarios:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `¡Hola Bacru! Quisiera agendar una consulta.\n👤 Nombre: ${form.nombre}\n📞 Tel: ${form.tel}\n🏠 Propiedad: ${form.propiedad || 'General'}\n📅 Fecha: ${form.fecha}\n💬 ${form.comentarios}`
    );
    window.open(`https://wa.me/527736801410?text=${msg}`, '_blank');
    setSent(true);
  };

  return (
    <section id="cita" className="relative py-16 sm:py-24 bg-carbon overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-10 sm:mb-12">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3">{t.cta.title}</h2>
          <div className="gold-divider w-20 mx-auto mb-4" />
          <p className="text-white/60 text-sm sm:text-base">{t.cta.sub}</p>
        </Reveal>

        <Reveal>
          {sent ? (
            <div className="bg-black/40 border border-gold/30 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-display font-bold text-white text-xl mb-2">{t.appointment.success}</h3>
              <p className="text-white/60 text-sm">Uno de nuestros asesores te contactará por WhatsApp en menos de 1 hora.</p>
            </div>
          ) : (
            <div className="bg-black/40 border border-gold/20 rounded-2xl p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-display font-semibold mb-1.5">{t.appointment.name} *</label>
                  <input required value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
                    placeholder="¿Cómo te llamas?"
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-display font-semibold mb-1.5">{t.appointment.phone} *</label>
                  <input required value={form.tel} onChange={e => setForm(f=>({...f,tel:e.target.value}))} type="tel"
                    placeholder="10 dígitos"
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-display font-semibold mb-1.5">{t.appointment.property}</label>
                  <select value={form.propiedad} onChange={e => setForm(f=>({...f,propiedad:e.target.value}))}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors">
                    <option value="">{t.appointment.any}</option>
                    {PROPERTIES.map(p => <option key={p.id} value={p.name} className="text-black">{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-display font-semibold mb-1.5">{t.appointment.date}</label>
                  <input type="datetime-local" value={form.fecha} onChange={e => setForm(f=>({...f,fecha:e.target.value}))}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-white/60 text-xs font-display font-semibold mb-1.5">{t.appointment.comments}</label>
                  <textarea value={form.comentarios} onChange={e => setForm(f=>({...f,comentarios:e.target.value}))}
                    rows={3} placeholder="Zona preferida, tipo de crédito, etc."
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none" />
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
                  <button type="submit"
                    className="flex-1 gold-gradient text-black font-display font-bold text-sm py-4 rounded-xl hover:opacity-90 transition-opacity">
                    {t.appointment.send}
                  </button>
                  <a href="https://wa.me/527736801410" target="_blank" rel="noreferrer"
                    className="flex-1 text-center bg-[#25D366] text-white font-display font-bold text-sm py-4 rounded-xl hover:bg-[#1da851] transition-colors">
                    {t.cta.btn2}
                  </a>
                </div>
              </form>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
