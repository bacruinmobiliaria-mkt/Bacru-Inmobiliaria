'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AGENTS } from '@/lib/data';
import { LineReveal, SplitWords, Rise, Parallax, CountUp, DrawLine, Magnetic, EASE } from '@/components/ui/Motion';
import { MapPin, MessageCircle, Phone, Search, Users } from 'lucide-react';

const ZONAS_MAP: Record<string,string> = {
  'Pachuca':'Pachuca de Soto y zona metropolitana',
  'Tepatepec':'Tepatepec y San Antonio',
  'Mixquiahuala':'Mixquiahuala y Progreso de Obregón',
  'Todas':'Dirección general · Todas las zonas',
};


// ── Filtro difuso por región (tolera errores de dedo) ──
const normZ = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
function zoneDist(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0]; dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[a.length];
}
function zoneMatches(query: string, zone: string): boolean {
  const q = normZ(query), z = normZ(zone);
  if (!q) return true;
  if (z.includes(q) || q.includes(z)) return true;
  const words = z.split(/\s+/);
  return words.some(w => w.startsWith(q) || (q.length >= 4 && zoneDist(q, w) <= (q.length > 6 ? 2 : 1)));
}

export default function AgentesPage() {
  const [agents, setAgents] = useState(AGENTS);

  // Datos vivos: los asesores que se agregan o editan en el panel salen aquí
  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setAgents(d); })
      .catch(() => {});
  }, []);

  const [region, setRegion] = useState('');
  const [q, setQ] = useState('');

  const director = agents.find(a => (a.role || '').toLowerCase().includes('director')) || agents.find(a => a.id === 'carlos');
  const team = agents.filter(a => a.id !== director?.id);

  const zonasDisponibles = Array.from(new Set(team.flatMap(a => a.zones))).filter(z => z !== 'Todas');

  const consulta = q.trim() || region;
  const coinciden = consulta
    ? team.filter(a => a.zones.some(z => zoneMatches(consulta, z)))
    : team;
  // Si no hay coincidencias: mostramos a todos como alternativa (estilo buscador)
  const noMatch = !!consulta && coinciden.length === 0;
  const mostrados = noMatch ? team : coinciden;

  return (
    <>

      {/* ═══ HERO ═══ */}
      <section className="relative bg-[#0A0A0A] grain min-h-[52svh] flex items-end overflow-hidden">
        <Parallax amount={60} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format&fit=crop"
            alt="" data-parallax="10" className="w-full h-[125%] object-cover opacity-30"/>
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/75 to-[#0A0A0A]/40"/>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-5 sm:px-10 pb-9 sm:pb-12 pt-28">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.8,ease:EASE}}
            className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-gold"/>
            <span className="text-gold text-[10px] sm:text-xs font-display font-bold tracking-[4px] uppercase">El equipo</span>
          </motion.div>

          <h1 className="font-serif font-bold text-white leading-[0.94] mb-6" style={{ fontSize:'clamp(2.6rem, 8vw, 6rem)' }}>
            <LineReveal delay={.3}>No hablas con un</LineReveal>
            <LineReveal delay={.42}>call center. Hablas con <span className="gold-text italic">tu zona</span>.</LineReveal>
          </h1>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.85,duration:.8}}
            className="text-white/60 text-sm sm:text-lg max-w-xl leading-relaxed">
            Cada asesor de Bacru vive y trabaja en la región que atiende.
            Conoce las calles, los precios reales y a quién preguntarle.
          </motion.p>
        </div>
      </section>


      {/* ═══ EQUIPO — primero, con filtro por región ═══ */}
      <section className="bg-ivory py-10 sm:py-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <LineReveal className="mb-2">
                <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Asesores por zona</span>
              </LineReveal>
              <h2 className="font-serif font-bold text-carbon leading-[0.95]" style={{fontSize:'clamp(2rem,5vw,3.6rem)'}}>
                <LineReveal delay={.08}>Encuentra al tuyo</LineReveal>
              </h2>
            </div>
            <Rise delay={.15}>
              <p className="text-muted text-sm max-w-xs">
                Escríbele directo al asesor de tu zona. Sin formularios, sin intermediarios.
              </p>
            </Rise>
          </div>

          {/* Filtro por región: chips + búsqueda con tolerancia a errores */}
          <div data-no-fx className="mb-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button onClick={()=>{setRegion(''); setQ('');}}
                className={`px-4 py-2.5 rounded-full text-[11px] font-display font-bold uppercase tracking-wider border transition-all duration-300
                  ${!region && !q ? 'gold-gradient text-black border-transparent' : 'border-carbon/15 text-carbon/60 hover:border-gold hover:text-gold'}`}>
                Todas las zonas
              </button>
              {zonasDisponibles.map(z=>(
                <button key={z} onClick={()=>{setRegion(region===z?'':z); setQ('');}}
                  className={`px-4 py-2.5 rounded-full text-[11px] font-display font-bold uppercase tracking-wider border transition-all duration-300
                    ${region===z ? 'gold-gradient text-black border-transparent' : 'border-carbon/15 text-carbon/60 hover:border-gold hover:text-gold'}`}>
                  {z}
                </button>
              ))}
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold pointer-events-none"/>
              <input value={q} onChange={e=>{setQ(e.target.value); setRegion('');}}
                placeholder="Escribe tu zona… ej. pachuca, tulancingo"
                className="w-full bg-white border border-carbon/12 rounded-full pl-11 pr-4 py-3 text-sm font-body focus:outline-none focus:border-gold transition-colors text-carbon"/>
            </div>
          </div>

          {/* Sin coincidencia exacta → aviso + todos como alternativa */}
          {noMatch && (
            <div data-no-fx className="bg-white border border-dashed border-gold/40 rounded-2xl px-6 py-5 mb-7 text-center">
              <p className="font-serif font-bold text-carbon text-lg mb-1">
                No tenemos un asesor asignado exactamente para &ldquo;{q || region}&rdquo;
              </p>
              <p className="text-muted text-sm">
                Pero cualquiera de estos asesores puede atenderte — todos conocen la región y el director cubre todas las zonas:
              </p>
            </div>
          )}

          <div data-no-fx className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            {mostrados.map((a,i)=>(
              <motion.div key={a.id}
                initial={{opacity:0, y:24}} animate={{opacity:1, y:0}}
                transition={{duration:.6, delay:(i%4)*.07, ease:EASE}}>
                <a href={`https://wa.me/${a.whatsapp}?text=Hola%20${encodeURIComponent(a.name.split(' ')[0])}!%20Vi%20tu%20perfil%20en%20la%20p%C3%A1gina%20de%20Bacru.`}
                  target="_blank" rel="noreferrer"
                  className="group block bg-white rounded-2xl overflow-hidden border border-carbon/8 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 h-full">
                  <div className="relative overflow-hidden bg-gradient-to-br from-carbon to-black" style={{aspectRatio:'3/4'}}>
                    <Image src={a.photo} alt={a.name} fill unoptimized loading="lazy"
                      className="object-cover object-top transition-transform duration-[1.1s] ease-out group-hover:scale-[1.07]"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"/>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="flex items-center gap-1 text-gold/85 text-[9px] font-display font-bold tracking-[2px] uppercase mb-1">
                        <MapPin className="w-2.5 h-2.5"/>{a.zones[0]}
                      </p>
                      <p className="font-display font-bold text-white text-sm leading-tight">{a.name}</p>
                    </div>
                    <div className="absolute inset-0 bg-gold/90 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <MessageCircle className="w-7 h-7 text-black"/>
                      <span className="text-black font-display font-bold text-[10px] uppercase tracking-[2px]">Escribir ahora</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted text-[11px] leading-snug mb-2">{a.specialty || a.zones.join(' · ')}</p>
                    <span className="flex items-center gap-1.5 text-carbon/60 text-[11px] font-display font-semibold">
                      <Phone className="w-3 h-3 text-gold"/>{a.whatsapp.replace('52','').replace(/(\d{3})(\d{3})(\d{4})/,'$1 $2 $3')}
                    </span>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIRECTOR ═══ */}
      {director && (
        <section className="bg-ivory py-10 sm:py-14">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
            <Rise>
              <div className="bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] border border-carbon/8">
                <div className="relative bg-gradient-to-br from-carbon to-black min-h-[320px] lg:min-h-full">
                  <Image src={director.photo} alt={director.name} fill className="object-cover object-top" unoptimized/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                </div>
                <div className="p-7 sm:p-12 flex flex-col justify-center">
                  <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase mb-3">Dirección general</span>
                  <h3 className="font-serif font-bold text-carbon leading-none mb-2" style={{fontSize:'clamp(1.9rem,4vw,3rem)'}}>
                    {director.name}
                  </h3>
                  <DrawLine className="w-16 mb-5" delay={.2}/>
                  <p className="text-muted text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                    Fundó Bacru hace 4 años con una idea simple: que comprar o vender una casa en Hidalgo
                    no tendría que dar miedo. Supervisa personalmente cada operación y responde directo
                    cuando algo se complica.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <a href={`https://wa.me/${director.whatsapp}?text=Hola%20Carlos!%20Quiero%20informes.`}
                        target="_blank" rel="noreferrer"
                        className="btn-hero inline-flex items-center gap-2 gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-6 py-3.5 rounded-full">
                        <MessageCircle className="w-4 h-4"/> Escribir al director
                      </a>
                    </Magnetic>
                    <Link href="/contacto"
                      className="inline-flex items-center gap-2 border border-carbon/20 text-carbon hover:border-gold hover:text-gold font-display font-bold text-xs uppercase tracking-[2px] px-6 py-3.5 rounded-full transition-colors">
                      Agendar llamada
                    </Link>
                  </div>
                </div>
              </div>
            </Rise>
          </div>
        </section>
      )}


      {/* ═══ POR QUÉ IMPORTA ═══ */}
      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-14 items-start">
          <div className="lg:col-span-2">
            <h2 className="font-serif font-bold text-carbon leading-[0.98] mb-5" style={{fontSize:'clamp(1.8rem,4vw,3rem)'}}>
              <SplitWords text="Un asesor asignado, de principio a fin."/>
            </h2>
            <Rise delay={.15}>
              <p className="text-muted text-sm sm:text-base leading-relaxed max-w-2xl">
                Cuando te contactas con Bacru no te pasan de mano en mano. Se te asigna un asesor según la zona
                donde buscas o vendes, y esa persona te acompaña en las visitas, la negociación, el crédito y la firma.
                Es la misma persona que te contesta el WhatsApp a las 8 de la noche.
              </p>
            </Rise>
          </div>
          <Rise delay={.2}>
            <div className="grid grid-cols-2 gap-y-8 lg:border-l lg:border-carbon/10 lg:pl-10">
              {[
                { v:8,  s:'',  l:'Asesores activos' },
                { v:9,  s:'+', l:'Zonas y creciendo' },
                { v:80, s:'+', l:'Familias atendidas' },
                { v:1,  s:'h', l:'Tiempo de respuesta' },
              ].map(x=>(
                <div key={x.l}>
                  <p className="font-serif font-bold text-carbon" style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)'}}>
                    <CountUp value={x.v} suffix={x.s}/>
                  </p>
                  <p className="text-muted text-[10px] font-display font-semibold tracking-[1.5px] uppercase mt-0.5">{x.l}</p>
                </div>
              ))}
            </div>
          </Rise>
        </div>
      </section>


      {/* ═══ CTA ═══ */}
      <section className="relative bg-[#0A0A0A] grain py-16 sm:py-24 overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10 text-center">
          <span className="inline-flex w-12 h-12 rounded-full bg-gold/12 border border-gold/25 items-center justify-center mb-6">
            <Users className="w-5 h-5 text-gold"/>
          </span>
          <h2 className="font-serif font-bold text-white leading-[0.98] mb-5" style={{fontSize:'clamp(1.9rem,5vw,3.6rem)'}}>
            <LineReveal>¿No sabes con quién hablar?</LineReveal>
          </h2>
          <Rise delay={.15}>
            <p className="text-white/55 text-sm sm:text-base max-w-md mx-auto mb-8">
              Dinos tu zona y te conectamos con el asesor correcto en menos de una hora.
            </p>
          </Rise>
          <Rise delay={.25}>
            <Magnetic>
              <Link href="/contacto"
                className="btn-hero inline-block gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-8 py-4 rounded-full">
                Asignarme un asesor
              </Link>
            </Magnetic>
          </Rise>
        </div>
      </section>
    </>
  );
}
