'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LineReveal, SplitWords, Rise, ImageReveal, Parallax, CountUp, DrawLine, Magnetic, EASE } from '@/components/ui/Motion';
import { Scale, Handshake, MapPin, MessageSquare, Quote } from 'lucide-react';

const VALORES = [
  { Icon:Handshake, t:'Te decimos la verdad',   d:'Si la propiedad no te conviene, te lo decimos. Si el precio está inflado, te lo decimos. Preferimos perder una venta a perder tu confianza.' },
  { Icon:Scale,     t:'Certeza jurídica',        d:'Revisamos escrituras, libertad de gravamen y situación fiscal antes de que firmes nada. Nunca vendemos un problema legal.' },
  { Icon:MapPin,    t:'Conocemos el terreno',    d:'Nacimos en Hidalgo. Sabemos qué colonias crecen, cuáles se inundan y dónde el metro cuadrado está por subir.' },
  { Icon:MessageSquare, t:'Contestamos siempre', d:'Un asesor asignado que responde el mismo día. No cadenas de correos ni "le marco luego".' },
];

const HITOS = [
  { y:'2022', t:'Nace Bacru en Pachuca', d:'Carlos Orta funda la inmobiliaria en Pachuca de Soto con una sola promesa: procesos claros y sin letras chiquitas.' },
  { y:'2023', t:'Alianza con Tekton Arquitectos', d:'Nos asociamos con la constructora Tekton Arquitectos (Presas, Tezontepec de Aldama) y establecimos ahí nuestras oficinas, sumando construcción y personalización de viviendas a nuestra oferta.' },
  { y:'2024', t:'Llegamos a Pachuca', d:'Equipo dedicado a la zona metropolitana, con enfoque en compradores de INFONAVIT y FOVISSSTE.' },
  { y:'2026', t:'80+ familias', d:'Un grupo de asesores en constante expansión y una plataforma digital con catálogo y mapa en tiempo real.' },
];

export default function NosotrosPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-[#0A0A0A] grain min-h-[62svh] flex items-end overflow-hidden">
        <Parallax amount={70} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2000&q=80&auto=format&fit=crop"
            alt="" data-parallax="10" className="w-full h-[125%] object-cover opacity-40"/>
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-[#0A0A0A]/35"/>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-5 sm:px-10 pb-10 sm:pb-14 pt-28">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.8,ease:EASE}}
            className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-gold"/>
            <span className="text-gold text-[10px] sm:text-xs font-display font-bold tracking-[4px] uppercase">Sobre Bacru</span>
          </motion.div>

          <h1 className="font-serif font-bold text-white leading-[0.94] mb-6" style={{ fontSize:'clamp(2.6rem, 8vw, 6rem)' }}>
            <LineReveal delay={.3}>Una casa no es</LineReveal>
            <LineReveal delay={.42}>una transacción. Es <span className="gold-text italic">una vida</span>.</LineReveal>
          </h1>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.85,duration:.8}}
            className="text-white/60 text-sm sm:text-lg max-w-xl leading-relaxed">
            Por eso tratamos cada operación como si fuera la nuestra: revisando papeles, diciendo lo incómodo
            y quedándonos hasta que te entregan las llaves.
          </motion.p>
        </div>
      </section>

      {/* ═══ LA HISTORIA ═══ */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <LineReveal className="mb-3">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Cómo empezó</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-6" style={{fontSize:'clamp(2rem,4.5vw,3.4rem)'}}>
              <SplitWords text="Cansados de ver gente estafada."/>
            </h2>
            <Rise delay={.15}>
              <div className="space-y-3 text-muted text-sm sm:text-base leading-relaxed max-w-lg">
                <p>
                  En Hidalgo, comprar una casa venía con historias que se repetían: terrenos sin escritura,
                  anticipos que nadie devolvía, "asesores" que desaparecían después de cobrar.
                </p>
                <p>
                  Carlos Orta llevaba años viendo eso de cerca. En 2022 fundó Bacru en Pachuca de Soto con una regla
                  que nunca hemos roto: <span className="text-carbon font-semibold">ninguna operación avanza si los papeles no están limpios</span>,
                  aunque eso signifique perder la comisión. Más adelante nos asociamos con la constructora
                  <span className="text-carbon font-semibold"> Tekton Arquitectos</span> y establecimos nuestras oficinas
                  en Presas, Tezontepec de Aldama, desde donde hoy atendemos toda la región.
                </p>
                <p>
                  Hoy somos un grupo de asesores cubriendo nuevas zonas y expandiéndonos constantemente,
                  y más de 80 familias tienen escrituras a su nombre.
                </p>
              </div>
            </Rise>
            <Rise delay={.3}>
              <div className="mt-8 pl-5 border-l-2 border-gold">
                <Quote className="w-5 h-5 text-gold/40 mb-2"/>
                <p className="font-serif italic text-carbon text-lg sm:text-xl leading-snug mb-2">
                  Prefiero explicarte por qué no te conviene una casa, a venderte un problema.
                </p>
                <p className="text-muted text-xs font-display font-semibold tracking-wider uppercase">
                  Carlos Orta · Director General
                </p>
              </div>
            </Rise>
          </div>

          <Parallax amount={40}>
            <ImageReveal
              src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80&auto=format&fit=crop"
              alt="Interior de una casa entregada por Bacru" ratio="4/5" className="rounded-2xl"/>
          </Parallax>
        </div>
      </section>

      {/* ═══ NÚMEROS ═══ */}
      <section className="bg-[#0A0A0A] grain py-10 sm:py-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-2 lg:grid-cols-4 gap-y-10">
          {[
            { v:80, s:'+', l:'Familias con escrituras' },
            { v:4,  s:'',  l:'Años en la región' },
            { v:9,  s:'+', l:'Zonas y creciendo' },
            { v:0,  s:'',  l:'Operaciones con litigio' },
          ].map((x,i)=>(
            <Rise key={x.l} delay={i*.08} className={`text-center ${i<3?'lg:border-r lg:border-white/10':''}`}>
              <p className="font-serif font-bold gold-text" style={{fontSize:'clamp(2.4rem,6vw,4.2rem)'}}>
                <CountUp value={x.v} suffix={x.s}/>
              </p>
              <p className="text-white/45 text-[10px] sm:text-xs font-display font-semibold tracking-[2px] uppercase mt-1">{x.l}</p>
            </Rise>
          ))}
        </div>
      </section>

      {/* ═══ VALORES ═══ */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <div className="max-w-2xl mb-8 sm:mb-10">
            <LineReveal className="mb-3">
              <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Cómo trabajamos</span>
            </LineReveal>
            <h2 className="font-serif font-bold text-carbon leading-[0.95] mb-4" style={{fontSize:'clamp(2.1rem,5vw,3.8rem)'}}>
              <LineReveal delay={.08}>Cuatro reglas</LineReveal>
              <LineReveal delay={.16}><span className="text-stroke-gold">que no negociamos</span></LineReveal>
            </h2>
            <DrawLine className="w-24" delay={.3}/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
            {VALORES.map((v,i)=>(
              <Rise key={v.t} delay={i*.09}>
                <div className="group flex items-start gap-5 py-5 border-t border-carbon/10">
                  <span className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-colors duration-400">
                    <v.Icon className="w-5 h-5 text-gold group-hover:text-black transition-colors duration-400"/>
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-carbon text-xl sm:text-2xl leading-tight mb-2">{v.t}</h3>
                    <p className="text-muted text-sm leading-relaxed">{v.d}</p>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FRANJA VISUAL — lo que entregamos ═══ */}
      <section className="bg-white pb-12 sm:pb-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-3 gap-3 sm:gap-5" data-no-fx>
          {[
            ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=78&auto=format&fit=crop','Casas entregadas'],
            ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=78&auto=format&fit=crop','Escrituras en regla'],
            ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=78&auto=format&fit=crop','Acompañamiento real'],
          ].map(([src,cap],i)=>(
            <Rise key={cap} delay={i*.1}>
              <div className="img-reveal rounded-2xl overflow-hidden" style={{aspectRatio:'4/3'}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={cap} loading="lazy" className="w-full h-full object-cover"/>
              </div>
              <p className="text-muted text-[11px] font-display font-semibold tracking-wider uppercase mt-2">{cap}</p>
            </Rise>
          ))}
        </div>
      </section>

      {/* ═══ LÍNEA DE TIEMPO ═══ */}
      <section className="bg-ivory py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <LineReveal className="mb-3">
            <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Recorrido</span>
          </LineReveal>
          <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-8" style={{fontSize:'clamp(2rem,5vw,3.6rem)'}}>
            <LineReveal delay={.08}>De Pachuca a toda la región</LineReveal>
          </h2>

          <div>
            {HITOS.map((h,i)=>(
              <Rise key={h.y} delay={i*.1}>
                <div className="group grid grid-cols-[70px_1fr] sm:grid-cols-[130px_1fr] gap-5 sm:gap-10 py-5 sm:py-6 border-t border-carbon/12 items-start hover:bg-white transition-colors duration-500 px-2 -mx-2 rounded-lg">
                  <span className="font-serif font-bold text-gold/45 text-2xl sm:text-4xl leading-none group-hover:text-gold transition-colors duration-500">{h.y}</span>
                  <div>
                    <h3 className="font-display font-bold text-carbon text-base sm:text-xl mb-1.5">{h.t}</h3>
                    <p className="text-muted text-sm leading-relaxed max-w-xl">{h.d}</p>
                  </div>
                </div>
              </Rise>
            ))}
            <div className="border-t border-carbon/12"/>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative bg-[#0A0A0A] grain py-12 sm:py-16 overflow-hidden text-center">
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10">
          <h2 className="font-serif font-bold text-white leading-[0.98] mb-5" style={{fontSize:'clamp(2rem,5.5vw,4rem)'}}>
            <LineReveal>Conócenos en persona</LineReveal>
          </h2>
          <Rise delay={.15}>
            <p className="text-white/55 text-sm sm:text-base max-w-md mx-auto mb-8">
              Nuestra oficina está en Presas, Tezontepec de Aldama. Llega sin cita, te invitamos un café y platicamos.
            </p>
          </Rise>
          <Rise delay={.25}>
            <div className="flex flex-wrap gap-3 justify-center">
              <Magnetic>
                <Link href="/contacto" className="btn-hero inline-block gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-8 py-4 rounded-full">
                  Agendar una visita
                </Link>
              </Magnetic>
              <Link href="/agentes" className="border border-white/20 text-white/80 hover:border-gold hover:text-gold font-display font-bold text-xs uppercase tracking-[2px] px-8 py-4 rounded-full transition-colors">
                Conocer al equipo
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
