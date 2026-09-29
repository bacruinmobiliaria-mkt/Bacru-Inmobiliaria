'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { PROPERTIES, AGENTS, Agent, Property } from '@/lib/data';
import { agentForZoneLive } from '@/lib/useLive';

interface Msg { from:'bot'|'user'; text:string; href?:string; }
type Step = 'budget'|'type'|'rooms'|'zone'|'result'|'lead';

const BotIcon = () => (
  <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black font-display font-bold text-base shrink-0">B</div>
);

export default function ChatbotFloat() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>('budget');
  const [answers, setAnswers] = useState({ budget:0, type:'', rooms:0, zone:'' });
  // ── Formulario de lead ──
  const [lf, setLf] = useState({ nombre:'', tel:'', email:'', consent:false });
  const [leadErr, setLeadErr] = useState('');
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  // Lo que eligió la persona en el chat: viaja con el lead para que el asesor tenga contexto
  const sel = useRef({ budget:'', type:'', rooms:'', zone:'', props:[] as string[] });
  const endRef = useRef<HTMLDivElement>(null);
  // Datos EN VIVO: el bot siempre consulta la base de datos, así que cualquier
  // propiedad/asesor que subas en el panel Admin aparece aquí sin tocar código.
  const [liveProps, setLiveProps] = useState<Property[]>(PROPERTIES);
  const [liveAgents, setLiveAgents] = useState<Agent[]>(AGENTS);
  const [foundAgent, setFoundAgent] = useState<Agent | null>(null);

  const loadLive = async (): Promise<{ props: Property[]; agents: Agent[] }> => {
    let props = liveProps, agents = liveAgents;
    try {
      const [rp, ra] = await Promise.all([
        fetch('/api/properties', { cache:'no-store' }),
        fetch('/api/agents', { cache:'no-store' }),
      ]);
      if (rp.ok) { const d = await rp.json(); if (Array.isArray(d)) props = d as Property[]; }
      if (ra.ok) { const d = await ra.json(); if (Array.isArray(d) && d.length) agents = d as Agent[]; }
      setLiveProps(props); setLiveAgents(agents);
    } catch { /* sin red: usa lo último que tenía */ }
    return { props, agents };
  };

  // Zonas disponibles = las zonas reales de las propiedades activas
  const zoneOptions = (() => {
    const seen = new Map<string, string>();
    liveProps.forEach(p => {
      const z = (p.zone || '').trim();
      if (z && !seen.has(z.toLowerCase())) seen.set(z.toLowerCase(), z);
    });
    return [...Array.from(seen.values()), 'Todas'];
  })();

  const addBot = (text: string) => setMessages(m => [...m, { from:'bot', text }]);
  const addUser = (text: string) => setMessages(m => [...m, { from:'user', text }]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => addBot(t.chatbot.greeting), 300);
    }
    if (open) loadLive();   // refresca al abrir el chat
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleBudget = (budget: number, label: string) => {
    addUser(label);
    sel.current.budget = label;
    setAnswers(a => ({...a, budget}));
    if (budget < 1000000) {
      setTimeout(() => { addBot(t.chatbot.lowBudget); setStep('lead'); }, 400);
    } else {
      setTimeout(() => { addBot(t.chatbot.typeQ); setStep('type'); }, 400);
    }
  };

  const handleType = (type: string, label: string) => {
    addUser(label);
    sel.current.type = label;
    setAnswers(a => ({...a, type}));
    setTimeout(() => { addBot(t.chatbot.roomsQ); setStep('rooms'); }, 400);
  };

  const handleRooms = (rooms: number, label: string) => {
    addUser(label);
    sel.current.rooms = label;
    setAnswers(a => ({...a, rooms}));
    setTimeout(() => { addBot(t.chatbot.zoneQ); setStep('zone'); }, 400);
  };

  const handleZone = async (zone: string) => {
    addUser(`📍 ${zone}`);
    sel.current.zone = zone;
    const updated = {...answers, zone};
    setAnswers(updated);
    // Consulta fresca a la base de datos justo antes de buscar
    const { props, agents } = await loadLive();
    setTimeout(() => {
      const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
      const found = props.filter(p =>
        p.price <= updated.budget &&
        (updated.type === 'any' || p.type === updated.type) &&
        (p.type === 'terreno' || p.beds >= updated.rooms) &&
        (zone === 'Todas' || same(p.zone, zone))
      );
      if (found.length > 0) {
        addBot(t.chatbot.found(found.length));
        found.slice(0,3).forEach(p => setMessages(m => [...m, {
          from:'bot',
          text:`🏠 ${p.name} — $${p.price.toLocaleString('es-MX')}\n📍 ${p.zone}`,
          href:`/propiedades/${p.slug || p.id}`,
        }]));
        sel.current.props = found.slice(0,3).map(p => p.name);
        setFoundAgent(agents.find(a => a.id === found[0].agentId) || agentForZoneLive(agents, zone) || null);
      } else {
        addBot(t.chatbot.noMatch);
        sel.current.props = [];
        setFoundAgent(agentForZoneLive(agents, zone) || null);
      }
      // Pide los datos para que un asesor dé seguimiento (se guardan como lead)
      setTimeout(() => addBot(t.chatbot.leadAsk), 350);
      setStep('lead');
    }, 400);
  };

  const submitLead = async () => {
    const nombre = lf.nombre.trim();
    const tel = lf.tel.replace(/\D/g, '');
    if (!nombre) { setLeadErr(t.chatbot.errName); return; }
    if (tel.length < 10) { setLeadErr(t.chatbot.errPhone); return; }
    if (!lf.consent) { setLeadErr(t.chatbot.errConsent); return; }
    setLeadErr(''); setLeadBusy(true);
    const s = sel.current;
    const mensaje = [
      s.budget && `Presupuesto: ${s.budget}`,
      s.type && `Tipo: ${s.type}`,
      s.rooms && `Recámaras: ${s.rooms}`,
      s.zone && `Zona: ${s.zone}`,
      s.props.length > 0 ? `Propiedades sugeridas por el bot: ${s.props.join(' | ')}` : (s.zone ? 'El bot no encontró coincidencia exacta' : ''),
    ].filter(Boolean).join(' · ');
    try {
      const r = await fetch('/api/leads', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          nombre, tel, email: lf.email.trim(), zona: s.zone === 'Todas' ? '' : s.zone,
          propiedad: s.props[0] || '', mensaje, origen:'chatbot', consentimiento:true,
        }),
      });
      if (!r.ok) { setLeadErr(t.chatbot.errServer); return; }
      addUser(`👤 ${nombre} · 📱 ${tel}`);
      setLeadDone(true);
      setTimeout(() => { addBot(t.chatbot.leadSaved); setStep('result'); }, 400);
    } catch {
      setLeadErr(t.chatbot.errServer);
    } finally { setLeadBusy(false); }
  };

  const skipLead = () => setStep('result');

  const resetChat = () => {
    setMessages([]); setStep('budget'); setAnswers({ budget:0, type:'', rooms:0, zone:'' }); setFoundAgent(null); loadLive();
    setLf({ nombre:'', tel:'', email:'', consent:false }); setLeadErr(''); setLeadDone(false);
    sel.current = { budget:'', type:'', rooms:'', zone:'', props:[] };
    setTimeout(() => addBot(t.chatbot.greeting), 300);
  };

  const agent = foundAgent || (answers.zone ? agentForZoneLive(liveAgents, answers.zone) : null) || null;
  const waMsg = encodeURIComponent(`Hola Bacru! Usé el asistente y estoy buscando una propiedad${answers.zone ? ` en ${answers.zone}` : ''}. ¿Pueden ayudarme?`);

  return (
    <>
      {/* Chatbot trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="gold-pulse fixed bottom-5 left-4 sm:bottom-7 sm:left-7 z-40 w-13 h-13 rounded-full gold-gradient flex items-center justify-center shadow-lg"
        style={{ width:52, height:52 }}
        whileHover={{ scale:1.1 }} whileTap={{ scale:0.95 }}
        aria-label="Asistente Bacru"
      >
        <span className="text-black font-display font-bold text-xl">{open ? '×' : 'B'}</span>
      </motion.button>

      {/* Chatbot window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 sm:bottom-28 left-3 sm:left-7 z-40 w-[calc(100vw-24px)] sm:w-96 max-h-[calc(100dvh-8.5rem)] sm:max-h-[70vh] flex flex-col bg-[#0d0d0d] border border-gold/25 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity:0, y:20, scale:0.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.95 }}
            transition={{ type:'spring', stiffness:300, damping:28 }}
          >
            {/* Header */}
            <div className="gold-gradient px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-black font-bold text-sm">B</div>
                <div>
                  <p className="font-display font-bold text-black text-sm">{t.chatbot.title}</p>
                  <p className="text-black/60 text-[10px]">Bacru Inmobiliaria · En línea</p>
                </div>
              </div>
              <button onClick={resetChat} className="text-black/60 hover:text-black transition-colors text-xs font-display">Reiniciar</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[45dvh] overscroll-contain">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.from==='user' ? 'justify-end' : 'justify-start'}`}>
                  {m.from === 'bot' && <BotIcon />}
                  {m.href ? (
                    <a href={m.href} onClick={() => setOpen(false)}
                      className="chat-bubble chat-bubble-bot underline decoration-gold/60 underline-offset-2"
                      style={{ whiteSpace:'pre-line' }}>
                      {m.text}
                    </a>
                  ) : (
                    <div className={`chat-bubble ${m.from==='bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}`}
                      style={{ whiteSpace:'pre-line' }}>
                      {m.text}
                    </div>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Options */}
            <div className="p-3 border-t border-white/8 space-y-2 overflow-y-auto overscroll-contain max-h-[52dvh] sm:max-h-none">
              {step === 'budget' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[[999999,t.chatbot.less1m],[3000000,t.chatbot.from1to3],[8000000,t.chatbot.from3to8],[12000000,t.chatbot.plus8]].map(([val,label]) => (
                    <button key={String(val)} onClick={() => handleBudget(Number(val), String(label))}
                      className="bg-white/8 border border-white/12 text-white text-xs font-display font-semibold py-2 px-3 rounded-xl hover:bg-gold/15 hover:border-gold/40 hover:text-gold transition-all text-center">
                      {String(label)}
                    </button>
                  ))}
                </div>
              )}

              {step === 'type' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[['casa_hecha',t.chatbot.house],['personalizable',t.chatbot.customizable],['terreno',t.chatbot.land],['departamento',t.chatbot.apartment]].map(([val,label]) => (
                    <button key={val} onClick={() => handleType(val, label)}
                      className="bg-white/8 border border-white/12 text-white text-xs font-display font-semibold py-2 px-3 rounded-xl hover:bg-gold/15 hover:border-gold/40 hover:text-gold transition-all text-center">
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {step === 'rooms' && (
                <div className="grid grid-cols-4 gap-1.5">
                  {[1,2,3,4].map(n => (
                    <button key={n} onClick={() => handleRooms(n, `${n}+`)}
                      className="bg-white/8 border border-white/12 text-white text-sm font-display font-bold py-2 rounded-xl hover:bg-gold/15 hover:border-gold/40 hover:text-gold transition-all text-center">
                      {n}+
                    </button>
                  ))}
                </div>
              )}

              {step === 'zone' && (
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                  {zoneOptions.map(z => (
                    <button key={z} onClick={() => handleZone(z)}
                      className="bg-white/8 border border-white/12 text-white text-xs font-display font-semibold py-2 px-2 rounded-xl hover:bg-gold/15 hover:border-gold/40 hover:text-gold transition-all text-center">
                      {z}
                    </button>
                  ))}
                </div>
              )}

              {step === 'lead' && !leadDone && (
                <div className="space-y-2">
                  <input value={lf.nombre} onChange={e => setLf(f => ({...f, nombre:e.target.value}))}
                    autoComplete="name" placeholder={t.chatbot.namePh} maxLength={120}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold" />
                  <input value={lf.tel} onChange={e => setLf(f => ({...f, tel:e.target.value.replace(/[^\d+\s-]/g,'')}))}
                    type="tel" inputMode="tel" autoComplete="tel" placeholder={t.chatbot.phonePh} maxLength={20}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold" />
                  <input value={lf.email} onChange={e => setLf(f => ({...f, email:e.target.value}))}
                    type="email" autoComplete="email" placeholder={t.chatbot.emailOptPh} maxLength={120}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold" />
                  <label className="flex items-start gap-2 text-white/60 text-[11px] leading-snug cursor-pointer">
                    <input type="checkbox" checked={lf.consent} onChange={e => setLf(f => ({...f, consent:e.target.checked}))}
                      className="mt-0.5 accent-[#D4AF37] w-4 h-4 flex-shrink-0" />
                    <span>{t.chatbot.consent}{' '}
                      <a href="/aviso-privacidad" target="_blank" rel="noreferrer" className="text-gold underline">{t.chatbot.privacyLink}</a>
                    </span>
                  </label>
                  {leadErr && <p className="text-red-400 text-[11px]">{leadErr}</p>}
                  <div className="flex gap-2">
                    <button onClick={submitLead} disabled={leadBusy}
                      className="flex-1 gold-gradient text-black font-display font-bold text-xs px-3 py-2.5 rounded-xl disabled:opacity-60">
                      {leadBusy ? '…' : t.chatbot.send}
                    </button>
                    <button onClick={skipLead} disabled={leadBusy}
                      className="text-white/45 hover:text-white/70 text-xs px-3 py-2.5 rounded-xl border border-white/10">
                      {t.chatbot.skip}
                    </button>
                  </div>
                </div>
              )}

              {step === 'result' && (
                <div className="flex flex-col gap-1.5">
                  <a href={`https://wa.me/${agent?.whatsapp || '527736801410'}?text=${waMsg}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-display font-bold text-xs py-2.5 rounded-xl">
                    <span>💬</span> {t.chatbot.whatsapp}
                  </a>
                  <a href="#cita"
                    onClick={() => setOpen(false)}
                    className="block text-center gold-gradient text-black font-display font-bold text-xs py-2.5 rounded-xl">
                    {t.chatbot.schedule}
                  </a>
                  <button onClick={resetChat} className="text-white/40 text-xs text-center hover:text-white/70 transition-colors">
                    Empezar de nuevo
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
