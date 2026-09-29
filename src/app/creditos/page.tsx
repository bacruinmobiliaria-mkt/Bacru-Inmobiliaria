'use client';

import { useState } from 'react';
import { Banknote, Building2, CalendarDays, Home, KeyRound, Landmark, Scale } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FINANCING_OPTIONS } from '@/lib/data';
import Reveal from '@/components/ui/Reveal';

const STEPS: Record<string, {steps:string[];docs:string[];time:string}> = {
  infonavit: {
    steps:['Solicita tu estado de cuenta en el portal INFONAVIT','Nuestro asesor calcula tu capacidad de crédito','Elegimos la propiedad que aplica','Trámite de crédito con tu asesor dedicado','Firma de escrituras y entrega de llaves'],
    docs:['INE vigente','CURP','Comprobante domicilio','Últimos 2 recibos de nómina','Estado de cuenta INFONAVIT'],
    time:'45–60 días hábiles',
  },
  fovissste: {
    steps:['Verifica tu puntuación en FOVISSSTE','Tu asesor valida tu elegibilidad','Identificamos la propiedad compatible','Trámite FOVISSSTE con gestor dedicado','Escrituración y entrega'],
    docs:['Credencial ISSSTE','CURP','Comprobante de adscripción','Talón de cheque o transferencia','Estado de cuenta FOVISSSTE'],
    time:'60–90 días hábiles',
  },
  bancario: {
    steps:['Pre-análisis de capacidad de pago','Seleccionamos el banco con mejor tasa para ti','Presentamos tu expediente crediticio','Avalúo y aprobación de crédito','Firma de escrituras y entrega'],
    docs:['INE vigente','Comprobante domicilio reciente','3 últimas declaraciones / recibos de nómina','Estado de cuenta bancario (3 meses)','CURP'],
    time:'30–45 días hábiles',
  },
  contado: {
    steps:['Separas la propiedad con apartado','Revisión jurídica del inmueble','Firma de promesa de compra-venta','Pago total y escrituración','Entrega de llaves'],
    docs:['INE vigente','CURP','Comprobante domicilio'],
    time:'15–25 días hábiles',
  },
};

function MortgageCalc() {
  const [amount, setAmount] = useState(1500000);
  const [years, setYears] = useState(15);
  const [down, setDown] = useState(10);
  const loanAmount = amount * (1 - down/100);
  const r = 0.12/12;
  const monthly = (loanAmount * r) / (1 - Math.pow(1+r, -years*12));

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <h3 className="font-display font-bold text-carbon text-lg mb-5">Calculadora de Crédito</h3>
      <div className="space-y-5 mb-6">
        {[
          { label:`Valor de la propiedad: $${amount.toLocaleString('es-MX')}`, val:amount, setter:setAmount, min:1000000, max:12000000, step:100000 },
          { label:`Enganche: ${down}%`, val:down, setter:setDown, min:0, max:30, step:5 },
          { label:`Plazo: ${years} años`, val:years, setter:setYears, min:5, max:20, step:5 },
        ].map(f=>(
          <div key={f.label}>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-display font-semibold text-carbon/65">{f.label}</span>
            </div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
              onChange={e=>f.setter(Number(e.target.value))} className="w-full accent-gold"/>
          </div>
        ))}
      </div>
      <div className="bg-black rounded-xl p-5 text-center mb-4">
        <p className="text-white/60 text-xs mb-1">Crédito a financiar: ${loanAmount.toLocaleString('es-MX')}</p>
        <p className="text-white/50 text-xs mb-3">Pago mensual estimado:</p>
        <p className="font-display font-extrabold text-3xl sm:text-4xl gold-text">${Math.round(monthly).toLocaleString('es-MX')}</p>
        <p className="text-white/40 text-xs mt-1">MXN / mes · referencial 12% anual</p>
      </div>
      <p className="text-carbon/40 text-xs text-center mb-4">*Tasa referencial. La tasa final depende del banco y tu perfil crediticio.</p>
      <a href={`https://wa.me/527736801410?text=${encodeURIComponent('Hola Bacru! Usé la calculadora y me interesa saber mi capacidad real de crédito.')}`}
        target="_blank" rel="noreferrer"
        className="block w-full text-center gold-gradient text-black font-display font-bold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity">
        Calcular Mi Crédito Real (Gratis)
      </a>
    </div>
  );
}

const ICONS: Record<string, React.ElementType> = {
  Landmark, Scale, Building2, Banknote, Home, CalendarDays, KeyRound,
};

export default function CreditosPage() {
  const [active, setActive] = useState<'infonavit'|'fovissste'|'bancario'|'contado'>('infonavit');

  return (
    <>
      <div className="relative bg-black pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&q=75&auto=format&fit=crop"
            alt="" data-parallax="8" className="w-full h-[120%] object-cover"/>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/50"/>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <motion.h1 className="split font-display font-extrabold text-3xl sm:text-5xl text-white mb-4"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
            Guía Completa de Créditos
          </motion.h1>
          <motion.p className="text-white/65 text-sm sm:text-lg max-w-2xl mx-auto"
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>
            Sin jerga financiera. Te explicamos cada opción con pasos claros y documentos reales.
          </motion.p>
        </div>
      </div>

      <section className="bg-ivory py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selector */}
              <Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FINANCING_OPTIONS.map(f=>(
                    <button key={f.id} onClick={()=>setActive(f.id as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-display font-bold text-sm text-center
                        ${active===f.id?'border-gold bg-black text-gold shadow-lg':'border-gray-200 bg-white text-carbon hover:border-gold/40'}`}>
                      <span className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                        {(() => { const I = ICONS[f.icon] || Landmark; return <I className="w-4.5 h-4.5 text-gold" strokeWidth={1.6}/>; })()}
                      </span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </Reveal>

              {/* Al cambiar de financiamiento, este bloque se remonta completo:
                  nada del tipo anterior puede quedar en pantalla */}
              <motion.div key={active} data-no-fx className="space-y-6"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .45, ease: [0.16,1,0.3,1] }}>

              {/* Process */}
              <div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <p className="font-display font-semibold text-carbon/55 text-xs uppercase tracking-widest mb-1">
                    {FINANCING_OPTIONS.find(f=>f.id===active)?.label}
                  </p>
                  <h3 className="font-display font-bold text-carbon text-xl mb-2">Proceso paso a paso</h3>
                  <p className="text-carbon/55 text-xs mb-5 flex items-center gap-1.5">
                    <span className="text-gold">⏱</span> Tiempo estimado: {STEPS[active].time}
                  </p>
                  <ol className="space-y-3">
                    {STEPS[active].steps.map((step,i)=>(
                      <motion.li key={i} className="flex gap-3.5 items-start"
                        initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}>
                        <div className="w-7 h-7 rounded-full gold-gradient text-black font-display font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</div>
                        <p className="text-carbon/75 text-sm leading-relaxed">{step}</p>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <h3 className="font-display font-bold text-carbon text-lg mb-4">📁 Documentos que necesitarás</h3>
                  <ul className="space-y-2.5">
                    {STEPS[active].docs.map(d=>(
                      <li key={d} className="flex items-center gap-2.5 text-carbon/70 text-sm">
                        <span className="w-4 h-4 rounded-full gold-gradient flex items-center justify-center text-black text-[10px] font-bold flex-shrink-0">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 bg-gold/8 border border-gold/20 rounded-xl p-4 flex gap-3">
                    <span className="text-gold text-xl">💡</span>
                    <p className="text-carbon/70 text-xs leading-relaxed">
                      No te preocupes por recopilarlos solo. Tu asesor te da un checklist personalizado y te indica exactamente dónde obtener cada documento.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <h3 className="font-display font-bold text-carbon text-lg mb-5">Preguntas frecuentes</h3>
                  {({
                      infonavit: [
                        ['¿Puedo usar INFONAVIT si soy empleado de gobierno?','No. INFONAVIT es exclusivo para trabajadores del sector privado afiliados al IMSS. Si trabajas para el gobierno federal o estatal, tu crédito es FOVISSSTE.'],
                        ['¿Hay enganche?','En muchos casos el ahorro acumulado en tu cuenta INFONAVIT puede cubrir el enganche. Depende de tu saldo y del valor de la propiedad.'],
                        ['¿Qué pasa si cambio de trabajo?','El crédito no se cancela. Puedes seguir pagando aun si cambias de empleo o hay periodos sin trabajo. El saldo de tu cuenta sigue abonándose.'],
                        ['¿Cuánto tiempo toma el proceso?','Entre 45 y 60 días hábiles desde que elegiste la propiedad hasta la entrega de llaves.'],
                        ['¿Bacru cobra por tramitar el crédito?','No. Bacru no cobra honorarios. Solo pagas los costos oficiales: valuación y escrituración.'],
                      ],
                      fovissste: [
                        ['¿Quiénes pueden acceder a FOVISSSTE?','Trabajadores del gobierno federal, estatal y organismos como IMSS, ISSSTE, CFE, entre otros. No aplica para empleados del sector privado.'],
                        ['¿Cómo sé si ya tengo puntos suficientes?','En tu estado de cuenta FOVISSSTE o en su portal oficial puedes ver tu puntuación actual. El puntaje mínimo varía cada año.'],
                        ['¿Hay enganche con FOVISSSTE?','Generalmente no se requiere enganche si tus puntos y capacidad de crédito cubren el valor de la propiedad.'],
                        ['¿Cuánto tiempo toma?','Entre 60 y 90 días hábiles. El proceso incluye valuación, dictamen y escrituración.'],
                        ['¿Bacru cobra por tramitar el crédito?','No. Bacru no cobra honorarios. Solo pagas los costos oficiales del trámite.'],
                      ],
                      bancario: [
                        ['¿Qué banco me conviene?','Depende de tu perfil. Bacru compara las opciones actuales de BBVA, Banorte, Santander, Scotiabank y otros para recomendarte la mejor tasa para ti.'],
                        ['¿Cuánto enganche necesito?','La mayoría de bancos piden entre 10% y 20% del valor de la propiedad como enganche mínimo.'],
                        ['¿Qué pasa si tengo deudas activas?','Depende de tu historial en Buró de Crédito. Bacru hace un pre-análisis gratuito antes de presentar tu expediente al banco.'],
                        ['¿Cuánto tiempo toma la aprobación?','Entre 30 y 45 días hábiles desde que entregamos tu expediente completo al banco.'],
                        ['¿Qué documentos necesito principalmente?','INE, 3 últimos estados de cuenta, últimos 3 recibos de nómina o declaraciones, y comprobante de domicilio reciente.'],
                      ],
                      contado: [
                        ['¿Hay descuentos al pagar de contado?','Sí. Los pagos de contado suelen negociar descuentos adicionales sobre el precio de lista. Bacru gestiona esa negociación para ti.'],
                        ['¿Qué tan rápido se escritura?','El proceso de contado es el más rápido: entre 15 y 25 días hábiles desde el apartado hasta la entrega de llaves.'],
                        ['¿Necesito algún anticipo para apartar?','Sí, se firma un contrato de promesa de compra-venta con un apartado. El monto depende del acuerdo con el vendedor.'],
                        ['¿La escrituración está incluida?','Los costos de escrituración (notaría, ISAI, derechos) corren por cuenta del comprador. Bacru te orienta sobre el monto estimado.'],
                        ['¿Bacru cobra comisión?','No a los compradores. Los honorarios de Bacru los cubre el lado vendedor.'],
                      ],
                    } as Record<string,[string,string][]>)[active]?.map(([q,a])=>(
                    <details key={`${active}-${q}`} className="border-b border-gray-100 last:border-0 py-4 group">
                      <summary className="font-display font-semibold text-carbon text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                        {q}
                        <span className="text-gold text-lg group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                      </summary>
                      <p className="text-carbon/65 text-sm leading-relaxed mt-3 pl-0">{a}</p>
                    </details>
                  ))}
                </div>
              </div>

              </motion.div>
            </div>

            {/* Right: calculator */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <Reveal direction="right"><MortgageCalc/></Reveal>
                <Reveal direction="right" delay={0.1} className="mt-4">
                  <div className="bg-black rounded-2xl p-5 text-center">
                    <p className="text-white font-display font-bold text-sm mb-2">¿Dudas sobre tu crédito?</p>
                    <p className="text-white/50 text-xs mb-4">Asesoría financiera gratuita con nuestros expertos</p>
                    <Link href="/contacto" className="block w-full gold-gradient text-black font-display font-bold text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity">
                      Asesoría Gratuita
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
