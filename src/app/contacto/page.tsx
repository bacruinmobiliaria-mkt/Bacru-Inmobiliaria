'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LineReveal, Rise, Magnetic, DrawLine, EASE } from '@/components/ui/Motion';
import { Home, CalendarDays, Zap, Handshake, ShieldCheck, Phone, Mail, MapPin, Clock, MessageCircle, Check, X } from 'lucide-react';

function humanizeDate(dt: string): string {
  if (!dt) return '';
  try {
    const d = new Date(dt);
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    let h = d.getHours(); const m = d.getMinutes().toString().padStart(2,'0');
    const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    return `el ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()} a las ${h}:${m} ${ap}`;
  } catch { return dt; }
}
function humanizeTipo(t: string): string {
  return ({ casa_hecha:'Casa habitación', personalizable:'Casa personalizable', terreno:'Terreno', departamento:'Departamento' } as Record<string,string>)[t] || t;
}

const ZONAS = ['Mixquiahuala','Tezontepec','Pachuca','Tepatepec','San Antonio','Progreso de Obregón','Tulancingo','EdoMex','CDMX'];
const BUSCA = ['Comprar una casa','Comprar un terreno','Vender una propiedad','Información de créditos','Asesoría general','Otro'];

export default function ContactoPage() {
  const [nombre,setNombre] = useState('');
  const [tel,setTel] = useState('');
  const [email,setEmail] = useState('');
  const [zona,setZona] = useState('');
  const [fecha,setFecha] = useState('');
  const [busca,setBusca] = useState('');
  const [buscaOpen,setBuscaOpen] = useState(false);
  const [comentarios,setComentarios] = useState('');
  const [propiedad,setPropiedad] = useState('');
  const [propTipo,setPropTipo] = useState('');
  const [propPrecio,setPropPrecio] = useState(0);
  const [fromProp,setFromProp] = useState(false);
  const [consent,setConsent] = useState(false);
  const [sending,setSending] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const prop = p.get('propiedad')||''; const z = p.get('zona')||'';
    const tipo = p.get('tipo')||''; const precio = p.get('precio')||'';
    if (prop) {
      setPropiedad(prop); setFromProp(true);
      if (tipo) setPropTipo(humanizeTipo(tipo));
      if (precio) setPropPrecio(parseInt(precio));
    }
    if (z) setZona(z);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSending(true);
    try {
      await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ nombre, tel, email, zona, propiedad,
          mensaje:[busca,comentarios].filter(Boolean).join(' · '),
          origen: fromProp?'popup':'contacto', consentimiento:true }) });
    } catch {}
    setSending(false);
    const fh = fecha ? humanizeDate(fecha) : '';
    // Mensaje redactado como lo diría una persona, no como un formulario
    const precioTxt = propPrecio ? ` de $${propPrecio.toLocaleString('es-MX')} MXN` : '';
    const tipoTxt = propTipo ? propTipo.toLowerCase() : 'la propiedad';
    let msg = `Hola, soy *${nombre}*`;
    if (propiedad) {
      msg += ` y me interesa la propiedad *${propiedad}*`;
      if (zona) msg += ` ubicada en ${zona}`;
      msg += `. Me interesa ${tipoTxt}${precioTxt}`;
    } else if (busca) {
      msg += ` y estoy buscando ${busca.toLowerCase()}`;
      if (zona) msg += ` por la zona de ${zona}`;
    } else if (zona) {
      msg += ` y me interesa encontrar una propiedad en ${zona}`;
    } else {
      msg += ` y me gustaría recibir informes de sus propiedades`;
    }
    msg += '.';
    if (fh) msg += ` Me gustaría agendar una visita ${fh}.`;
    if (comentarios.trim()) msg += ` ${comentarios.trim()}${comentarios.trim().endsWith('.') ? '' : '.'}`;
    msg += ` Me pueden contactar al ${tel}`;
    if (email) msg += ` o al correo ${email}`;
    msg += '. ¡Gracias!';
    window.open(`https://wa.me/527736801410?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const inCls = "w-full bg-ivory border border-carbon/12 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:border-gold transition-colors text-carbon";
  const lCls  = "block text-[10px] font-display font-bold text-carbon/45 uppercase tracking-[2px] mb-1.5";

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-[#0A0A0A] grain pt-32 pb-14 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=75&auto=format&fit=crop"
            alt="" className="w-full h-full object-cover"/>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/60"/>
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-10">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.8,ease:EASE}}
            className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-gold"/>
            <span className="text-gold text-[10px] sm:text-xs font-display font-bold tracking-[4px] uppercase">
              {fromProp ? 'Agendar visita' : 'Contacto'}
            </span>
          </motion.div>
          <h1 className="font-serif font-bold text-white leading-[0.94] mb-5" style={{fontSize:'clamp(2.5rem,7.5vw,5.5rem)'}}>
            <LineReveal delay={.3}>{fromProp ? 'Vamos a ver' : 'Cuéntanos qué'}</LineReveal>
            <LineReveal delay={.42}>
              {fromProp ? <>esa <span className="gold-text italic">casa</span>.</> : <>estás <span className="gold-text italic">buscando</span>.</>}
            </LineReveal>
          </h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.85,duration:.8}}
            className="text-white/55 text-sm sm:text-lg max-w-lg leading-relaxed">
            Un asesor de tu zona te responde en menos de una hora. Sin costo, sin compromiso,
            sin que te llame nadie más después.
          </motion.p>
        </div>
      </section>

      {/* ═══ CONTACTO DIRECTO + FORMULARIO ═══ */}
      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-10 lg:gap-16">

          {/* Columna izquierda: vías directas */}
          <div>
            <Rise>
              <p className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase mb-3">Prefieres directo</p>
              <h2 className="font-serif font-bold text-carbon text-2xl sm:text-3xl leading-tight mb-5">
                Escríbenos ahora mismo
              </h2>
              <DrawLine className="w-14 mb-7" delay={.2}/>
            </Rise>

            <Rise delay={.1}>
              <a href="https://wa.me/527736801410?text=Hola%20Bacru!%20Quiero%20informes."
                target="_blank" rel="noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/25 hover:bg-[#25D366] transition-all duration-400 mb-3">
                <span className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors duration-400">
                  <MessageCircle className="w-5 h-5 text-white group-hover:text-[#25D366] transition-colors duration-400"/>
                </span>
                <div>
                  <p className="font-display font-bold text-carbon text-sm group-hover:text-white transition-colors duration-400">WhatsApp</p>
                  <p className="text-muted text-xs group-hover:text-white/80 transition-colors duration-400">Respuesta inmediata</p>
                </div>
              </a>
            </Rise>

            <Rise delay={.18}>
              <div className="space-y-1 border-t border-carbon/10 pt-6 mt-6">
                {[
                  { Icon:Phone, l:'773 680 1410', h:'tel:+527736801410', s:'Llamada directa' },
                  { Icon:Mail,  l:'ventasbacru@gmail.com', h:'mailto:ventasbacru@gmail.com', s:'Correo' },
                ].map(x=>(
                  <a key={x.l} href={x.h} className="flex items-center gap-3.5 py-3 group">
                    <x.Icon className="w-4 h-4 text-gold flex-shrink-0"/>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-carbon text-sm group-hover:text-gold transition-colors truncate">{x.l}</p>
                      <p className="text-muted text-[11px]">{x.s}</p>
                    </div>
                  </a>
                ))}
                <div className="flex items-start gap-3.5 py-3">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-display font-semibold text-carbon text-sm">Tezontepec de Aldama</p>
                    <p className="text-muted text-[11px]">Hidalgo, México</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 py-3">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-display font-semibold text-carbon text-sm">Lun–Vie 9:00–18:00</p>
                    <p className="text-muted text-[11px]">Sábados 9:00–14:00</p>
                  </div>
                </div>
              </div>
            </Rise>

            <Rise delay={.26}>
              <div className="mt-7 space-y-2.5 border-t border-carbon/10 pt-6">
                {[
                  { Icon:Zap, t:'Menos de 1 hora', d:'Tiempo de respuesta promedio' },
                  { Icon:Handshake, t:'Sin compromiso', d:'La consulta es gratuita' },
                  { Icon:ShieldCheck, t:'Datos protegidos', d:'No compartimos tu información' },
                ].map(x=>(
                  <div key={x.t} className="flex items-center gap-3">
                    <x.Icon className="w-3.5 h-3.5 text-gold flex-shrink-0"/>
                    <p className="text-carbon/70 text-xs"><span className="font-semibold text-carbon">{x.t}</span> · {x.d}</p>
                  </div>
                ))}
              </div>
            </Rise>
          </div>

          {/* Columna derecha: formulario */}
          <Rise delay={.15}>
            <div className="bg-ivory rounded-2xl p-6 sm:p-10 border border-carbon/8">
              <form onSubmit={handleSubmit} className="space-y-5">

                <AnimatePresence>
                  {fromProp && propiedad && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="overflow-hidden">
                      <div className="bg-white border border-gold/25 rounded-xl p-4 flex items-center gap-3.5">
                        <span className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
                          <Home className="w-5 h-5 text-gold"/>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-carbon text-sm truncate">{propiedad}</p>
                          {zona && <p className="text-muted text-xs">{zona}</p>}
                        </div>
                        <button type="button" onClick={()=>{setFromProp(false);setPropiedad('');setComentarios('');}}
                          className="text-muted hover:text-carbon transition-colors flex-shrink-0">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className={lCls}>Nombre completo *</label>
                  <input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="¿Cómo te llamas?" className={inCls}/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={lCls}>WhatsApp *</label>
                    <input required type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10}
                      value={tel} onChange={e=>setTel(e.target.value.replace(/\D/g,''))}
                      placeholder="10 dígitos" className={inCls}/>
                  </div>
                  <div>
                    <label className={lCls}>Correo <span className="normal-case tracking-normal font-body text-muted">(opcional)</span></label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@gmail.com" className={inCls}/>
                  </div>
                </div>

                <div>
                  <label className={lCls}>Zona de interés</label>
                  <select value={zona} onChange={e=>setZona(e.target.value)} className={inCls}>
                    <option value="">Selecciona una zona</option>
                    {ZONAS.map(z=><option key={z}>{z}</option>)}
                  </select>
                </div>

                {!fromProp && (
                  <div className="border border-carbon/10 rounded-xl overflow-hidden bg-white">
                    <button type="button" onClick={()=>setBuscaOpen(o=>!o)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-ivory transition-colors">
                      <span className="text-[10px] font-display font-bold text-carbon/45 uppercase tracking-[2px]">
                        ¿Qué estás buscando? <span className="normal-case tracking-normal font-body text-muted">(opcional)</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {busca && <span className="text-gold text-xs font-display font-semibold">{busca}</span>}
                        <motion.span animate={{rotate:buscaOpen?45:0}} className="text-muted text-lg leading-none">+</motion.span>
                      </span>
                    </button>
                    <AnimatePresence>
                      {buscaOpen && (
                        <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                          transition={{duration:.35,ease:EASE}} className="overflow-hidden">
                          <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                            {BUSCA.map(o=>(
                              <button key={o} type="button" onClick={()=>setBusca(busca===o?'':o)}
                                className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl border text-[11px] font-display font-semibold text-left transition-all duration-300
                                  ${busca===o?'border-gold bg-gold/8 text-carbon':'border-carbon/12 text-muted hover:border-carbon/25'}`}>
                                {busca===o && <Check className="w-3 h-3 text-gold flex-shrink-0"/>}{o}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div>
                  <label className={lCls}>
                    Fecha preferida para la visita <span className="normal-case tracking-normal font-body text-muted">(opcional)</span>
                  </label>
                  <input type="datetime-local" value={fecha} onChange={e=>setFecha(e.target.value)}
                    min={new Date().toISOString().slice(0,16)} className={inCls}/>
                  {fecha && (
                    <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
                      className="flex items-center gap-1.5 text-gold text-xs mt-2 font-display font-semibold">
                      <CalendarDays className="w-3.5 h-3.5"/>{humanizeDate(fecha)}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className={lCls}>Comentarios adicionales</label>
                  <textarea value={comentarios} onChange={e=>setComentarios(e.target.value)} rows={3}
                    placeholder="Presupuesto, número de recámaras, urgencia, lo que quieras contarnos…"
                    className={`${inCls} resize-none`}/>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-gold cursor-pointer"/>
                  <span className="text-xs text-carbon/65 leading-relaxed">
                    Acepto el <Link href="/aviso-privacidad" className="text-gold hover:underline font-semibold">Aviso de Privacidad</Link> y
                    autorizo el tratamiento de mis datos para ser contactado por Bacru. *
                  </span>
                </label>

                <Magnetic>
                  <button type="submit" disabled={sending || !consent}
                    className="btn-hero w-full gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] py-4 rounded-full disabled:opacity-50 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4"/>
                    {sending ? 'Enviando…' : 'Enviar por WhatsApp'}
                  </button>
                </Magnetic>
              </form>
            </div>
          </Rise>
        </div>
      </section>

      {/* ═══ MAPA OFICINA ═══ */}
      <section className="bg-ivory py-14 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10">
          <Rise>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase mb-2">Visítanos</p>
                <h2 className="font-serif font-bold text-carbon text-2xl sm:text-4xl leading-tight">Nuestra oficina</h2>
              </div>
              <a href="https://maps.google.com/?q=Tezontepec+de+Aldama+Hidalgo" target="_blank" rel="noreferrer"
                className="text-gold text-xs font-display font-bold uppercase tracking-[2px] link-line">Cómo llegar</a>
            </div>
            <div className="rounded-2xl overflow-hidden border border-carbon/10" style={{height:'clamp(240px,40vh,400px)'}}>
              <iframe src="https://maps.google.com/maps?q=Tezontepec+de+Aldama,+Hidalgo,+Mexico&t=m&z=14&output=embed"
                width="100%" height="100%" style={{border:0,display:'block'}} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Oficina Bacru"/>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
