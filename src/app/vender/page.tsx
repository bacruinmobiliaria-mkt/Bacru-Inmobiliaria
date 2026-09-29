'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LineReveal, SplitWords, Rise, ImageReveal, Parallax, CountUp, DrawLine, Magnetic, EASE } from '@/components/ui/Motion';
import { Search, Camera, Megaphone, Users, Scale, FileCheck, Clock, TrendingUp, ShieldCheck, BadgeCheck, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Property } from '@/lib/data';

const STEPS = [
  { n:'01', t:'Valuación gratuita',    d:'Visitamos tu propiedad y analizamos el mercado real de tu zona. Te entregamos un rango de precio honesto en 24 horas, sin costo ni compromiso.', time:'24 horas' },
  { n:'02', t:'Estrategia de precio',  d:'Definimos juntos el precio que vende rápido sin dejar dinero sobre la mesa. Te explicamos exactamente por qué.', time:'1 día' },
  { n:'03', t:'Captación y difusión',  d:'Fotografía profesional, publicación en portales, redes y nuestra base de compradores ya verificados.', time:'3-5 días' },
  { n:'04', t:'Negociación y cierre',  d:'Filtramos curiosos, traemos ofertas reales, negociamos por ti y coordinamos notaría y escrituras.', time:'30-60 días' },
];

const BENEFITS = [
  { Icon:Search,    t:'Valuación gratuita',     d:'Sin costo ni compromiso' },
  { Icon:Camera,    t:'Fotografía profesional', d:'Incluida en el servicio' },
  { Icon:Megaphone, t:'Difusión en portales',   d:'Portales, redes y grupos' },
  { Icon:Users,     t:'Compradores verificados',d:'Base propia con capacidad real' },
  { Icon:Scale,     t:'Acompañamiento legal',   d:'Abogado de la mano' },
  { Icon:FileCheck, t:'Trámites de escritura',  d:'Coordinación con notaría' },
];

const OBJECIONES = [
  { q:'"¿Y si no se vende?"',           a:'No cobramos nada por intentarlo. Nuestros honorarios salen del cierre, no de tu bolsillo por adelantado.' },
  { q:'"¿Me van a bajar el precio?"',   a:'Te damos el rango real del mercado con datos, no una promesa inflada para captarte y luego presionarte a bajar.' },
  { q:'"No quiero desconocidos en casa"', a:'Filtramos y acompañamos cada visita. Nadie entra a tu propiedad sin un asesor de Bacru presente.' },
];

export default function VenderPage() {
  const [form, setForm] = useState({ nombre:'', tel:'', dir:'', tipo:'', precio:'', comentarios:'' });
  const [vendidas, setVendidas] = useState<Property[]>([]);

  // Propiedades vendidas — directo de la base de datos del panel:
  // cuando un asesor marca "Vendida", aparece aquí automáticamente
  useEffect(() => {
    fetch('/api/properties?vendidas=1')
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setVendidas(d); })
      .catch(() => {});
  }, []);
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    try {
      await fetch('/api/leads', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          nombre:form.nombre, tel:form.tel, zona:form.dir,
          mensaje:`VENDE: ${form.tipo} · Precio esperado: ${form.precio} · ${form.comentarios}`,
          origen:'vender', consentimiento:true,
        }),
      });
    } catch {}
    const partes: string[] = [`Hola, soy *${form.nombre}* y quiero vender mi ${form.tipo ? form.tipo.toLowerCase() : 'propiedad'}`];
    if (form.dir) partes.push(`ubicada en ${form.dir}`);
    let texto = partes.join(' ') + '.';
    if (form.precio) texto += ` Tengo en mente un precio aproximado de ${form.precio}.`;
    if (form.comentarios.trim()) texto += ` ${form.comentarios.trim()}${form.comentarios.trim().endsWith('.') ? '' : '.'}`;
    texto += ` Me gustaría recibir mi valuación gratuita. Me pueden contactar al ${form.tel}. ¡Gracias!`;
    const msg = encodeURIComponent(texto);
    window.open(`https://wa.me/527736801410?text=${msg}`, '_blank');
    setSent(true);
  };

  const inCls = "w-full bg-ivory border border-carbon/12 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-gold transition-colors text-carbon";
  const lCls  = "block text-[10px] font-display font-bold text-carbon/45 uppercase tracking-[2px] mb-1.5";

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-[#0A0A0A] grain min-h-[92svh] flex items-end overflow-hidden">
        <Parallax amount={70} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format&fit=crop"
            alt="" data-parallax="10" className="w-full h-[125%] object-cover opacity-45"/>
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/30"/>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-5 sm:px-10 pb-14 sm:pb-20 pt-32">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.8,ease:EASE}}
            className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-gold"/>
            <span className="text-gold text-[10px] sm:text-xs font-display font-bold tracking-[4px] uppercase">Vender con Bacru</span>
          </motion.div>

          <h1 className="font-serif font-bold text-white leading-[0.94] mb-6" style={{ fontSize:'clamp(2.7rem, 8.5vw, 6.5rem)' }}>
            <LineReveal delay={.3}>Tu propiedad vale</LineReveal>
            <LineReveal delay={.42}><span className="gold-text italic">más</span> de lo que crees.</LineReveal>
          </h1>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.85,duration:.8}}
            className="text-white/60 text-sm sm:text-lg max-w-xl mb-9 leading-relaxed">
            Y menos de lo que te prometen quienes solo quieren captarte.
            Te damos el <span className="text-white/90 font-semibold">precio real</span>, la difusión completa y el cierre acompañado.
          </motion.p>

          <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:1,duration:.8,ease:EASE}}
            className="flex flex-wrap gap-3">
            <Magnetic>
              <a href="#form" className="btn-hero inline-block gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-8 py-4 rounded-full">
                Quiero mi valuación gratis
              </a>
            </Magnetic>
            <a href="https://wa.me/527736801410?text=Hola!%20Quiero%20vender%20mi%20propiedad" target="_blank" rel="noreferrer"
              className="border border-white/20 text-white/80 hover:border-gold hover:text-gold font-display font-bold text-xs uppercase tracking-[2px] px-8 py-4 rounded-full transition-colors">
              Preguntar por WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ ¿TE SUENA? — los dolores reales del vendedor ═══ */}
      <section className="bg-white py-14 sm:py-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)] gap-10 lg:gap-16 items-center">
          <div>
            <LineReveal className="mb-3">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">¿Te suena?</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-8" style={{fontSize:'clamp(1.9rem,4.5vw,3.2rem)'}}>
              <SplitWords text="Vender solo no es gratis. Cuesta meses."/>
            </h2>
            <div className="border-t border-carbon/10" data-no-fx>
              {[
                { n:'01', q:'"Llevo 8 meses con el letrero y solo llaman curiosos."', a:'Sin difusión profesional, tu propiedad solo la ve quien pasa por la calle. Nosotros la ponemos frente a compradores con crédito preaprobado.' },
                { n:'02', q:'"Otra inmobiliaria me prometió un precio… que nunca llegó."', a:'Inflar el precio para captarte es la trampa clásica. Te damos el rango real con datos de tu zona, aunque duela menos de lo prometido.' },
                { n:'03', q:'"El trato se cayó en la notaría por un papel."', a:'Revisamos escrituras, gravámenes y situación fiscal ANTES de publicar. Ningún comprador se nos cae por sorpresas legales.' },
                { n:'04', q:'"Me da miedo meter desconocidos a mi casa."', a:'Cero visitas a ciegas: filtramos a cada interesado y un asesor de Bacru está presente en todas las visitas.' },
              ].map((d, i) => (
                <Rise key={d.n} delay={i*.08}>
                  <div className="fx-row group grid grid-cols-[44px_1fr] sm:grid-cols-[64px_1fr] gap-4 sm:gap-6 py-6 border-b border-carbon/10 rounded-lg">
                    <span className="font-serif font-bold text-gold/30 text-2xl sm:text-4xl leading-none group-hover:text-gold transition-colors duration-500">{d.n}</span>
                    <div>
                      <p className="font-serif font-bold text-carbon text-lg sm:text-2xl leading-snug mb-1.5">{d.q}</p>
                      <p className="text-muted text-sm leading-relaxed max-w-xl">{d.a}</p>
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
          </div>
          <div className="hidden lg:block space-y-5">
            <Parallax amount={35}>
              <ImageReveal src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80&auto=format&fit=crop"
                alt="Entrega de llaves de una casa vendida" ratio="4/5" className="rounded-2xl"/>
            </Parallax>
            <Rise delay={.2}>
              <div className="bg-ivory rounded-2xl p-5 border border-carbon/8">
                <p className="font-serif italic text-carbon text-base leading-snug mb-2">
                  "En 6 semanas Bacru logró lo que yo no pude en un año."
                </p>
                <p className="text-muted text-xs font-display font-semibold tracking-wider uppercase">Vendedor en Mixquiahuala</p>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* ═══ PROMESA EN NÚMEROS ═══ */}
      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-2 lg:grid-cols-4 gap-y-10">
          {[
            { v:24, s:'h',  l:'Para tu valuación' },
            { v:80, s:'+',  l:'Propiedades cerradas' },
            { v:0,  s:'$',  l:'Anticipo requerido' },
            { v:60, s:' días', l:'Cierre promedio' },
          ].map((x,i)=>(
            <Rise key={x.l} delay={i*.08} className={`text-center ${i<3?'lg:border-r lg:border-carbon/10':''}`}>
              <p className="font-serif font-bold text-carbon" style={{fontSize:'clamp(2.3rem,5.5vw,4rem)'}}>
                <CountUp value={x.v} suffix={x.s}/>
              </p>
              <p className="text-muted text-[10px] sm:text-xs font-display font-semibold tracking-[2px] uppercase mt-1">{x.l}</p>
            </Rise>
          ))}
        </div>
      </section>

      {/* ═══ POR QUÉ BACRU — imagen + lista ═══ */}
      <section className="bg-white pb-16 sm:pb-28">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ImageReveal
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop"
            alt="Interior de propiedad lista para vender" ratio="4/5" className="rounded-2xl"/>

          <div>
            <LineReveal className="mb-3">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Todo incluido</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-6" style={{fontSize:'clamp(2rem,4.5vw,3.4rem)'}}>
              <SplitWords text="Sin costos ocultos, sin sorpresas."/>
            </h2>
            <Rise delay={.15}>
              <p className="text-muted text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
                No cobramos por publicar, ni por fotografiar, ni por asesorarte. Nuestros honorarios salen del cierre.
                Si tu propiedad no se vende, no nos pagas nada.
              </p>
            </Rise>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              {BENEFITS.map((b,i)=>(
                <Rise key={b.t} delay={.2 + i*.07}>
                  <div className="flex items-start gap-3.5 py-4 border-b border-carbon/8">
                    <span className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <b.Icon className="w-4 h-4 text-gold"/>
                    </span>
                    <div>
                      <p className="font-display font-bold text-carbon text-sm leading-tight">{b.t}</p>
                      <p className="text-muted text-xs mt-0.5">{b.d}</p>
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROCESO — timeline editorial ═══ */}
      <section className="relative bg-[#0A0A0A] grain py-16 sm:py-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <LineReveal className="mb-3">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">El proceso</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-white leading-[0.95] mb-4" style={{fontSize:'clamp(2.2rem,5.5vw,4.2rem)'}}>
              <LineReveal delay={.08}>Cuatro pasos.</LineReveal>
              <LineReveal delay={.16}><span className="text-stroke-white">Cero incertidumbre.</span></LineReveal>
            </h2>
            <DrawLine className="w-24" delay={.3}/>
          </div>

          <div className="space-y-0">
            {STEPS.map((s,i)=>(
              <Rise key={s.n} delay={i*.1}>
                <div className="group grid grid-cols-[auto_1fr] sm:grid-cols-[80px_1fr_120px] gap-5 sm:gap-8 py-7 sm:py-9 border-t border-white/10 items-start hover:bg-white/[0.025] transition-colors duration-500 px-2 -mx-2 rounded-lg">
                  <span className="font-serif font-bold text-gold/35 text-3xl sm:text-5xl leading-none group-hover:text-gold/70 transition-colors duration-500">{s.n}</span>
                  <div>
                    <h3 className="font-serif font-bold text-white text-xl sm:text-3xl leading-tight mb-2 group-hover:text-gold transition-colors duration-400">{s.t}</h3>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xl">{s.d}</p>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-white/35 text-xs font-display font-semibold justify-end pt-2">
                    <Clock className="w-3.5 h-3.5"/>{s.time}
                  </span>
                </div>
              </Rise>
            ))}
            <div className="border-t border-white/10"/>
          </div>

          {/* Evidencia visual del proceso */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-10" data-no-fx>
            {[
              ['https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=75&auto=format&fit=crop','Valuación en sitio'],
              ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=75&auto=format&fit=crop','Fotografía profesional'],
              ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=75&auto=format&fit=crop','Firma en notaría'],
            ].map(([src, cap], i)=>(
              <Rise key={cap} delay={i*.1}>
                <div className="img-reveal rounded-xl overflow-hidden" style={{aspectRatio:'4/3'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={cap} loading="lazy" className="w-full h-full object-cover"/>
                </div>
                <p className="text-white/40 text-[11px] font-display font-semibold tracking-wider uppercase mt-2">{cap}</p>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OBJECIONES — lo que realmente preocupa al vendedor ═══ */}
      <section className="bg-ivory py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <LineReveal className="mb-3">
            <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Hablemos claro</span>
          </LineReveal>
          <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-10 sm:mb-14" style={{fontSize:'clamp(1.9rem,4.5vw,3.2rem)'}}>
            <SplitWords text="Lo que todo vendedor nos pregunta"/>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7">
            {OBJECIONES.map((o,i)=>(
              <Rise key={o.q} delay={i*.1}>
                <div className="bg-white rounded-2xl p-7 border border-carbon/8 h-full hover:-translate-y-1.5 hover:shadow-lg transition-all duration-500">
                  <p className="font-serif font-bold text-carbon text-lg sm:text-xl leading-snug mb-3">{o.q}</p>
                  <DrawLine className="w-10 mb-3" delay={.2}/>
                  <p className="text-muted text-sm leading-relaxed">{o.a}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VENDIDAS RECIENTEMENTE — prueba social en vivo ═══ */}
      {vendidas.length > 0 && (
        <section className="bg-white py-14 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <LineReveal className="mb-2">
                  <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Resultados reales</span>
                </LineReveal>
                <h2 className="font-serif font-bold text-carbon leading-[0.98]" style={{fontSize:'clamp(1.9rem,4.5vw,3.2rem)'}}>
                  <LineReveal delay={.08}>Vendidas recientemente</LineReveal>
                </h2>
              </div>
              <Rise delay={.15}>
                <p className="flex items-center gap-2 text-muted text-sm max-w-xs">
                  <BadgeCheck className="w-4 h-4 text-gold flex-shrink-0"/>
                  La tuya puede ser la siguiente. Cada venta aquí fue acompañada de inicio a fin.
                </p>
              </Rise>
            </div>

            <div data-no-fx className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {vendidas.slice(0, 6).map((v, i) => (
                <Rise key={v.slug || v.id} delay={i * .08}>
                  <div className="group relative rounded-2xl overflow-hidden border border-carbon/8 bg-white">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={v.images[0]} alt={v.name} fill unoptimized loading="lazy"
                        className="object-cover grayscale-[35%] transition-transform duration-[1.1s] group-hover:scale-[1.05]"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"/>
                      {/* Sello VENDIDA */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="border-2 border-gold text-gold font-display font-extrabold text-lg tracking-[6px] uppercase px-6 py-2 rounded-lg -rotate-6 bg-black/35 backdrop-blur-sm">
                          Vendida
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display font-bold text-carbon text-sm truncate">{v.name}</p>
                        <p className="flex items-center gap-1 text-muted text-xs mt-0.5"><MapPin className="w-3 h-3 text-gold"/>{v.zone}</p>
                      </div>
                      <BadgeCheck className="w-5 h-5 text-gold flex-shrink-0"/>
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FORMULARIO ═══ */}
      <section id="form" className="bg-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-10">
          <div className="text-center mb-10">
            <LineReveal className="mb-3">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Primer paso</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-4" style={{fontSize:'clamp(2rem,5vw,3.6rem)'}}>
              <LineReveal delay={.08}>Cuéntanos de tu propiedad</LineReveal>
            </h2>
            <Rise delay={.2}>
              <p className="text-muted text-sm max-w-md mx-auto">
                Un asesor de tu zona te contacta en menos de 1 hora para agendar la valuación. Sin costo, sin compromiso.
              </p>
            </Rise>
          </div>

          <Rise delay={.25}>
            <div className="bg-ivory rounded-2xl p-6 sm:p-10 border border-carbon/8">
              {sent ? (
                <div className="text-center py-10">
                  <span className="inline-flex w-16 h-16 rounded-full gold-gradient items-center justify-center mb-5">
                    <TrendingUp className="w-7 h-7 text-black"/>
                  </span>
                  <h3 className="font-serif font-bold text-carbon text-2xl mb-2">Solicitud recibida</h3>
                  <p className="text-muted text-sm max-w-sm mx-auto">
                    Un asesor te contactará en menos de 1 hora para coordinar la visita de valuación.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    {f:'nombre',l:'Nombre completo *',p:'¿Cómo te llamas?',t:'text',req:true},
                    {f:'tel',   l:'WhatsApp *',       p:'10 dígitos',t:'tel',req:true},
                    {f:'dir',   l:'Ubicación de la propiedad',p:'Colonia, municipio',t:'text',req:false},
                    {f:'tipo',  l:'Tipo de propiedad',p:'Casa, terreno, departamento…',t:'text',req:false},
                    {f:'precio',l:'Precio que tienes en mente',p:'$0,000,000 MXN (opcional)',t:'text',req:false},
                  ].map(item=>(
                    <div key={item.f} className={item.f==='dir'?'sm:col-span-2':''}>
                      <label className={lCls}>{item.l}</label>
                      <input required={item.req} type={item.t} placeholder={item.p}
                        value={(form as Record<string,string>)[item.f]}
                        onChange={e=>setForm(f=>({...f,[item.f]:e.target.value}))}
                        className={inCls}/>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className={lCls}>¿Algo más que debamos saber?</label>
                    <textarea value={form.comentarios} onChange={e=>setForm(f=>({...f,comentarios:e.target.value}))}
                      rows={3} placeholder="Urgencia de venta, estado del inmueble, documentos disponibles…"
                      className={`${inCls} resize-none`}/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-start gap-3 cursor-pointer mb-5">
                      <input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-gold cursor-pointer"/>
                      <span className="text-xs text-carbon/65 leading-relaxed">
                        Acepto el <Link href="/aviso-privacidad" className="text-gold hover:underline font-semibold">Aviso de Privacidad</Link> y
                        autorizo el tratamiento de mis datos para recibir mi valuación. *
                      </span>
                    </label>
                    <Magnetic>
                      <button type="submit" disabled={!consent}
                        className="btn-hero w-full gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] py-4 rounded-full disabled:opacity-50">
                        Solicitar valuación gratuita
                      </button>
                    </Magnetic>
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted mt-4">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold"/> Tus datos son confidenciales · Respuesta en menos de 1 hora
                    </p>
                  </div>
                </form>
              )}
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
