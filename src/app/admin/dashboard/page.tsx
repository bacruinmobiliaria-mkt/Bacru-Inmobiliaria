'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Camera, Check, ExternalLink, FolderUp, Home, Inbox, KeyRound, LayoutDashboard, Lightbulb, LogOut, Mail, MapPin, MessageSquare, Pencil, Phone, PlayCircle, Plus, Search, Star, Trash2, UserCheck, UserPlus, UserX, Users, Video, X } from 'lucide-react';
import Image from 'next/image';
import { AGENTS } from '@/lib/data';
import { uploadFile } from '@/lib/uploadClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const C = {
  page:   { minHeight:'100vh', backgroundColor:'#F3F4F6', fontFamily:'Inter, system-ui, sans-serif' },
  hdr:    { backgroundColor:'#FFF', borderBottom:'1px solid #E5E7EB', padding:'10px clamp(12px,4vw,24px)', display:'flex' as const, alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' as const, position:'sticky' as const, top:0, zIndex:50 },
  card:   { backgroundColor:'#FFF', border:'1px solid #E5E7EB', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.07)' },
  th:     { textAlign:'left' as const, padding:'10px 20px', fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:'.06em', backgroundColor:'#F9FAFB', borderBottom:'1px solid #E5E7EB' },
  td:     { padding:'14px 20px', borderBottom:'1px solid #F3F4F6', verticalAlign:'middle' as const },
  input:  { width:'100%', boxSizing:'border-box' as const, border:'1px solid #D1D5DB', borderRadius:10, padding:'10px 14px', fontSize:14, color:'#111827', backgroundColor:'#FFF', outline:'none' },
  label:  { display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:6, textTransform:'uppercase' as const, letterSpacing:'.05em' },
};

interface Prop { id:string; name:string; type:string; price:number; zone:string; beds:number; images:string[]; active:boolean; }
interface User { email:string; name:string; location:string; phone?:string; addedAt:string; }

// ── Users panel ─────────────────────────────────────────────
interface AgentRow { id:string; name:string; role:string; whatsapp:string; zones:string[]; photo:string; specialty?:string; }
interface AgentForm { name:string; role:string; whatsapp:string; zones:string; specialty:string; photo:string; }
const EMPTY_AGENT: AgentForm = { name:'', role:'Asesor de Ventas', whatsapp:'', zones:'', specialty:'', photo:'' };

function UsersPanel({ token, myEmail }: { token:string; myEmail:string }) {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState('');
  const [grantFor, setGrantFor]   = useState<string>('');   // agent.id al que se le está dando acceso
  const [grantEmail, setGrantEmail] = useState('');
  const [agents, setAgents]     = useState<AgentRow[]>([]);
  const [editing, setEditing]   = useState<string>('');      // id del asesor en edición ('nuevo' = alta)
  const [af, setAf]             = useState<AgentForm>(EMPTY_AGENT);
  const [uploading, setUploading] = useState(false);

  const loadAgents = useCallback(async () => {
    const r = await fetch('/api/agents');
    if (r.ok) setAgents(await r.json());
  }, []);
  useEffect(() => { loadAgents(); }, [loadAgents]);

  const formRef = useRef<HTMLDivElement>(null);   // formulario de alta/edición de asesor
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoTip, setPhotoTip] = useState(false);          // popup de recomendaciones de la foto
  const [photoTipSeen, setPhotoTipSeen] = useState(false);  // ya lo cerró en este formulario
  const PHOTO_PROMPT = 'Edita la foto de esta persona para que se vea como si fue tomada en un estudio fotográfico, con traje formal y buena iluminación. No cambies ninguna característica del rostro de la persona.';
  const CHATGPT_URL = `https://chatgpt.com/?q=${encodeURIComponent(PHOTO_PROMPT)}`;

  // Primer clic en "Subir foto": muestra el aviso. Ya visto, abre directo el selector de archivos.
  const askPhoto = () => {
    if (photoTipSeen) photoInputRef.current?.click();
    else setPhotoTip(true);
  };
  const closeTip = (thenPick: boolean) => {
    setPhotoTip(false); setPhotoTipSeen(true);
    if (thenPick) photoInputRef.current?.click();   // se ejecuta dentro del clic del usuario → el navegador lo permite
  };

  const openEdit = (a?: AgentRow) => {
    setPhotoTipSeen(false);
    // En celular la tarjeta está lejos del formulario: sube la pantalla hasta él
    setTimeout(() => {
      const el = formRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      // Si el panel tiene su propio contenedor con scroll, también lo subimos
      let parent = el.parentElement;
      while (parent) {
        if (parent.scrollHeight > parent.clientHeight && /(auto|scroll)/.test(getComputedStyle(parent).overflowY)) {
          parent.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
          break;
        }
        parent = parent.parentElement;
      }
    }, 120);
    if (a) { setEditing(a.id); setAf({ name:a.name, role:a.role, whatsapp:a.whatsapp, zones:a.zones.join(', '), specialty:a.specialty||'', photo:a.photo }); }
    else   { setEditing('nuevo'); setAf(EMPTY_AGENT); }
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const d = await uploadFile(file, token);
      if (d.ok && d.url) setAf(f => ({ ...f, photo: d.url as string }));
      else setErr(d.error || 'Error subiendo foto');
    } finally { setUploading(false); }
  };

  const saveAgent = async () => {
    if (!af.name.trim()) { setErr('El nombre es obligatorio'); return; }
    setLoading(true); setErr(''); setMsg('');
    try {
      const body = { id: editing === 'nuevo' ? undefined : editing, ...af, zones: af.zones };
      const r = await fetch('/api/agents', {
        method: editing === 'nuevo' ? 'POST' : 'PUT',
        headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify(body),
      });
      if (r.ok) { setMsg(`✓ ${af.name} ${editing==='nuevo'?'agregado a':'actualizado en'} la página de Agentes`); setEditing(''); loadAgents(); }
      else setErr(((await r.json().catch(() => ({}))) as { error?: string }).error || 'Error al guardar (¿ya conectaste la base de datos?)');
    } finally { setLoading(false); }
  };

  const deleteAgent = async (a: AgentRow) => {
    if (!confirm(`¿Quitar a ${a.name} de la página de Agentes?`)) return;
    await fetch('/api/agents', { method:'DELETE', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({ id: a.id }) });
    loadAgents();
  };
  const [newEmail, setNE]     = useState('');
  const [newName, setNN]      = useState('');
  const [newLoc, setNL]       = useState('');
  const [newPhone, setNP]     = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');

  const loadUsers = useCallback(async () => {
    const r = await fetch('/api/admin/users', { headers:{ Authorization:`Bearer ${token}` }});
    if (r.ok) setUsers(await r.json());
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Filter by name OR email
  const filtered = useMemo(() =>
    users.filter(u =>
      !search.trim() ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr(''); setMsg('');
    try {
      const r = await fetch('/api/admin/users', {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ email:newEmail.trim(), name:newName.trim(), location:newLoc.trim(), phone:newPhone.trim(), requesterEmail:myEmail }),
      });
      const d = await r.json();
      if (r.ok) {
        setMsg(`✓ ${newName} (${newEmail}) registrado exitosamente.`);
        setNE(''); setNN(''); setNL(''); setNP('');
        loadUsers();
      } else setErr(d.error || 'Error al registrar');
    } finally { setLoading(false); }
  };

  // ¿Este asesor del equipo ya tiene cuenta en el panel?
  const norm = (s:string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const accountFor = (agentName: string) =>
    users.find(u => {
      const un = norm(u.name), an = norm(agentName);
      return un === an || un.includes(an.split(' ')[0]) && an.includes(un.split(' ')[0]);
    });

  const grantAccess = async (agentName: string, zone: string, phone: string) => {
    if (!grantEmail.trim()) return;
    setLoading(true); setErr(''); setMsg('');
    try {
      const r = await fetch('/api/admin/users', {
        method:'POST',
        headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ email:grantEmail.trim(), name:agentName, location:zone, phone, requesterEmail:myEmail }),
      });
      const d = await r.json();
      if (r.ok) { setMsg(`✓ ${agentName} ya puede entrar al panel con ${grantEmail.trim()}`); setGrantFor(''); setGrantEmail(''); loadUsers(); }
      else setErr(d.error || 'Error al dar acceso');
    } finally { setLoading(false); }
  };

  const removeUser = async (email:string, name:string) => {
    if (!confirm(`¿Eliminar acceso de ${name} (${email})?`)) return;
    const r = await fetch('/api/admin/users', {
      method:'DELETE', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ email }),
    });
    if (r.ok) { setMsg(`✓ Acceso de ${name} eliminado`); loadUsers(); }
    else { const d = await r.json(); setErr(d.error||'Error'); }
  };

  return (
    <div style={C.card}>
      {/* Header */}
      <div style={{ padding:'clamp(14px,4vw,20px) clamp(14px,4vw,24px)', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' as const }}>
        <div style={{ width:36, height:36, borderRadius:10, backgroundColor:'#FFFBEB', border:'1px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'center', }}><Users style={{width:18,height:18,color:'#B45309'}}/></div>
        <div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Gestión de Asesores</h3>
          <p style={{ margin:0, fontSize:12, color:'#6B7280' }}>Administra quién puede acceder al panel</p>
        </div>
      </div>

      {/* ── CRM de asesores: todo lo que se ve en la página de Agentes ── */}
      <div style={{ padding:'clamp(14px,4vw,24px)', borderBottom:'1px solid #F3F4F6' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' as const, marginBottom:6 }}>
          <div>
            <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:700, color:'#374151' }}>Asesores de la página ({agents.length})</p>
            <p style={{ margin:0, fontSize:12, color:'#6B7280' }}>Lo que edites aquí se refleja al instante en la página pública de Agentes.</p>
          </div>
          <button onClick={()=>openEdit()}
            style={{ display:'inline-flex', alignItems:'center', gap:6, whiteSpace:'nowrap' as const, background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000', fontWeight:800, fontSize:12, padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer' }}>
            <UserPlus style={{width:14,height:14}}/>Agregar asesor
          </button>
        </div>

        {/* Formulario de alta / edición */}
        {editing && (
          <div ref={formRef} style={{ scrollMarginTop:12, border:'2px solid #D4AF37', borderRadius:14, padding:'16px', backgroundColor:'#FFFDF5', margin:'12px 0 16px' }}>
            <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:800, color:'#92400E' }}>
              {editing==='nuevo' ? 'Nuevo asesor' : `Editando ficha`}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:5 }}>Nombre *</label>
                <input value={af.name} onChange={e=>setAf(f=>({...f,name:e.target.value}))} placeholder="Nombre completo"
                  style={{ width:'100%', padding:'9px 11px', borderRadius:9, border:'1px solid #E5E7EB', fontSize:13 }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:5 }}>Rol</label>
                <select value={af.role} onChange={e=>setAf(f=>({...f,role:e.target.value}))}
                  style={{ width:'100%', padding:'9px 11px', borderRadius:9, border:'1px solid #E5E7EB', fontSize:13 }}>
                  {['Asesor de Ventas','Asesor & Marketing','Asesor Senior','Director General'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:5 }}>WhatsApp (con 52)</label>
                <input value={af.whatsapp} onChange={e=>setAf(f=>({...f,whatsapp:e.target.value.replace(/\D/g,'')}))} placeholder="5277312345678"
                  style={{ width:'100%', padding:'9px 11px', borderRadius:9, border:'1px solid #E5E7EB', fontSize:13 }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:5 }}>Zonas (separadas por coma)</label>
                <input value={af.zones} onChange={e=>setAf(f=>({...f,zones:e.target.value}))} placeholder="Pachuca, Mixquiahuala"
                  style={{ width:'100%', padding:'9px 11px', borderRadius:9, border:'1px solid #E5E7EB', fontSize:13 }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:5 }}>Especialidad</label>
                <input value={af.specialty} onChange={e=>setAf(f=>({...f,specialty:e.target.value}))} placeholder="Zona Pachuca"
                  style={{ width:'100%', padding:'9px 11px', borderRadius:9, border:'1px solid #E5E7EB', fontSize:13 }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B7280', textTransform:'uppercase' as const, letterSpacing:1, marginBottom:5 }}>Foto</label>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {af.photo && (
                    <div style={{ width:38, height:38, borderRadius:'50%', overflow:'hidden', position:'relative' as const, flexShrink:0, border:'2px solid #D4AF37' }}>
                      <Image src={af.photo} alt="" fill style={{objectFit:'cover', objectPosition:'top'}} unoptimized/>
                    </div>
                  )}
                  <button type="button" onClick={askPhoto} disabled={uploading}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'8px 12px', borderRadius:9, cursor:'pointer', border:'1px solid #D1D5DB', backgroundColor:'#FFF', color:'#374151' }}>
                    <FolderUp style={{width:13,height:13}}/>{uploading?'Subiendo…':'Subir foto'}
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{display:'none'}}
                    onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadPhoto(f); e.target.value=''; }}/>
                </div>
                <input value={af.photo} onChange={e=>setAf(f=>({...f,photo:e.target.value}))} placeholder="…o pega una URL"
                  style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:11, marginTop:6 }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button onClick={saveAgent} disabled={loading || uploading}
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontWeight:800, fontSize:12, padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer', opacity:(loading||uploading)?.6:1 }}>
                <Check style={{width:13,height:13}}/>{editing==='nuevo'?'Publicar en Agentes':'Guardar cambios'}
              </button>
              <button onClick={()=>setEditing('')}
                style={{ fontSize:12, fontWeight:600, padding:'9px 16px', borderRadius:10, cursor:'pointer', border:'1px solid #E5E7EB', backgroundColor:'#FFF', color:'#6B7280' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Popup: recomendaciones antes de subir la foto del asesor */}
        {photoTip && (
          <div role="dialog" aria-modal="true" onClick={()=>closeTip(false)}
            style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div onClick={e=>e.stopPropagation()}
              style={{ background:'#fff', borderRadius:18, maxWidth:420, width:'100%', maxHeight:'90dvh', overflowY:'auto', padding:'22px 20px', boxShadow:'0 24px 60px rgba(0,0,0,.35)', position:'relative' }}>
              <button type="button" onClick={()=>closeTip(false)} aria-label="Cerrar"
                style={{ position:'absolute', top:10, right:10, width:34, height:34, borderRadius:'50%', border:'none', background:'#F3F4F6', color:'#374151', fontSize:18, cursor:'pointer' }}>×</button>
              <div style={{ width:44, height:44, borderRadius:12, background:'#FFFBEB', border:'1px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <Camera style={{width:22,height:22,color:'#B8962A'}}/>
              </div>
              <p style={{ margin:'0 0 8px', fontSize:16, fontWeight:800, color:'#111827', paddingRight:30 }}>Antes de subir la foto</p>
              <p style={{ margin:'0 0 14px', fontSize:13.5, lineHeight:1.55, color:'#374151' }}>
                Asegúrate de que el asesor se vea <strong>presentable y formal</strong>.
                Si no tienes una foto con esas características, entra aquí:
              </p>
              <a href={CHATGPT_URL} target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, textDecoration:'none', background:'#111827', color:'#fff', fontWeight:700, fontSize:13, padding:'12px 14px', borderRadius:12, marginBottom:8 }}>
                <ExternalLink style={{width:14,height:14}}/>Editar la foto con ChatGPT
              </a>
              <p style={{ margin:'0 0 16px', fontSize:11.5, lineHeight:1.5, color:'#6B7280' }}>
                Se abre con la instrucción ya escrita (estudio fotográfico, traje formal y buena iluminación, sin cambiar el rostro). Solo adjunta la foto de la persona en ese chat, descarga el resultado y súbelo aquí.
              </p>
              <button type="button" onClick={()=>closeTip(true)}
                style={{ width:'100%', background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000', fontWeight:800, fontSize:13, padding:'12px 14px', borderRadius:12, border:'none', cursor:'pointer' }}>
                Entendido, subir foto
              </button>
            </div>
          </div>
        )}

        {/* Tarjetas de asesores */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12, marginTop:12 }}>
          {agents.map(a => {
            const acct = accountFor(a.name);
            const granting = grantFor === a.id;
            return (
              <div key={a.id} style={{ border:`1px solid ${acct?'#6EE7B7':'#E5E7EB'}`, borderRadius:14, padding:'12px 14px', backgroundColor: acct?'#F0FDF9':'#FAFAFA' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', overflow:'hidden', backgroundColor:'#E5E7EB', flexShrink:0, position:'relative' as const }}>
                    {a.photo && <Image src={a.photo} alt={a.name} fill style={{objectFit:'cover', objectPosition:'top'}} unoptimized/>}
                  </div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{a.name}</p>
                    <p style={{ margin:0, fontSize:11, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{a.role} · {a.zones[0]}</p>
                  </div>
                </div>

                {/* Acceso al panel */}
                <div style={{ marginBottom:10 }}>
                  {acct ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:'#065F46' }}>
                        <UserCheck style={{width:13,height:13}}/>Acceso admin
                      </span>
                      <button onClick={()=>removeUser(acct.email, a.name)}
                        style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, padding:'4px 9px', borderRadius:7, cursor:'pointer', border:'1px solid #FCA5A5', backgroundColor:'#FEF2F2', color:'#DC2626' }}>
                        <UserX style={{width:11,height:11}}/>Quitar
                      </button>
                    </div>
                  ) : granting ? (
                    <div style={{ display:'flex', gap:6 }}>
                      <input autoFocus type="email" value={grantEmail} onChange={e=>setGrantEmail(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); grantAccess(a.name, a.zones[0], a.whatsapp); } if(e.key==='Escape'){ setGrantFor(''); setGrantEmail(''); } }}
                        placeholder="correo@gmail.com"
                        style={{ flex:1, minWidth:0, padding:'6px 9px', borderRadius:7, border:'1px solid #D4AF37', fontSize:11 }}/>
                      <button onClick={()=>grantAccess(a.name, a.zones[0], a.whatsapp)} disabled={loading}
                        style={{ fontSize:10, fontWeight:700, padding:'6px 9px', borderRadius:7, cursor:'pointer', border:'none', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000' }}>
                        OK
                      </button>
                    </div>
                  ) : (
                    <button onClick={()=>{ setGrantFor(a.id); setGrantEmail(''); }}
                      style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, padding:'5px 10px', borderRadius:7, cursor:'pointer', border:'1px solid #E5E7EB', backgroundColor:'#FFF', color:'#6B7280' }}>
                      <KeyRound style={{width:11,height:11}}/>Sin acceso admin — activar
                    </button>
                  )}
                </div>

                {/* Editar / eliminar ficha */}
                <div style={{ display:'flex', gap:6, borderTop:'1px solid #F3F4F6', paddingTop:9 }}>
                  <button onClick={()=>openEdit(a)}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'5px 11px', borderRadius:7, cursor:'pointer', border:'1px solid #D1D5DB', backgroundColor:'#FFF', color:'#374151' }}>
                    <Pencil style={{width:11,height:11}}/>Editar ficha
                  </button>
                  <button onClick={()=>deleteAgent(a)}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, padding:'5px 9px', borderRadius:7, cursor:'pointer', border:'1px solid #FCA5A5', backgroundColor:'#FEF2F2', color:'#DC2626' }}>
                    <Trash2 style={{width:11,height:11}}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {(msg || err) && <p style={{ margin:'12px 0 0', fontSize:12, fontWeight:600, color: err?'#DC2626':'#059669' }}>{err || msg}</p>}
      </div>

    </div>
  );
}


// ── Leads panel ─────────────────────────────────────────────
interface LeadRow { id:string; nombre:string; tel:string; email?:string; zona?:string; propiedad?:string; mensaje?:string; origen:string; estado:string; fecha:string; }

function LeadsPanel({ token }: { token: string }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [filter, setFilter] = useState<'todos'|'nuevo'|'contactado'|'cerrado'>('todos');

  const load = useCallback(async () => {
    const r = await fetch('/api/leads', { headers:{ Authorization:`Bearer ${token}` }});
    if (r.ok) setLeads(await r.json());
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const setEstado = async (id:string, estado:string) => {
    const r = await fetch('/api/leads', {
      method:'PATCH', headers:{ Authorization:`Bearer ${token}`,'Content-Type':'application/json' },
      body: JSON.stringify({ id, estado }),
    });
    if (r.ok) load();
  };
  const del = async (id:string) => {
    if (!confirm('¿Eliminar este lead? (derecho de supresión de datos)')) return;
    await fetch('/api/leads', { method:'DELETE', headers:{ Authorization:`Bearer ${token}`,'Content-Type':'application/json' }, body:JSON.stringify({ id }) });
    load();
  };

  const shown = leads.filter(l => filter==='todos' || l.estado===filter);
  const badge = (o:string) => ({ contacto:'#DBEAFE|#1E40AF', vender:'#FEF3C7|#92400E', popup:'#F3E8FF|#7C3AED', chatbot:'#D1FAE5|#065F46' }[o] || '#F3F4F6|#374151');
  const estadoColor = (e:string) => e==='nuevo' ? '#DC2626' : e==='contactado' ? '#D97706' : '#059669';

  return (
    <div style={C.card}>
      <div style={{ padding:'clamp(14px,4vw,20px) clamp(14px,4vw,24px)', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' as const }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, backgroundColor:'#EFF6FF', border:'1px solid #BFDBFE', display:'flex', alignItems:'center', justifyContent:'center', }}><Inbox style={{width:18,height:18,color:'#1E40AF'}}/></div>
          <div>
            <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Leads Recibidos ({leads.length})</h3>
            <p style={{ margin:0, fontSize:12, color:'#6B7280' }}>Clientes que llenaron formularios en el sitio</p>
          </div>
        </div>
        <span style={{ fontSize:11, fontWeight:800, color:'#DC2626', backgroundColor:'#FEF2F2', border:'1px solid #FCA5A5', padding:'4px 12px', borderRadius:20 }}>
          {leads.filter(l=>l.estado==='nuevo').length} nuevos
        </span>
      </div>
      <div style={{ padding:'clamp(14px,4vw,20px) clamp(14px,4vw,24px)' }}>
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto' as const, paddingBottom:4 }}>
          {(['todos','nuevo','contactado','cerrado'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', border:'1px solid', textTransform:'capitalize',
                borderColor: filter===f?'#D4AF37':'#E5E7EB', backgroundColor: filter===f?'#FFFBEB':'#FFF', color: filter===f?'#92400E':'#6B7280' }}>
              {f} {f!=='todos' && `(${leads.filter(l=>l.estado===f).length})`}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p style={{ textAlign:'center', color:'#9CA3AF', fontSize:13, padding:'24px 0', margin:0 }}>
            {leads.length===0 ? 'Aún no hay leads. Llegarán cuando los visitantes llenen los formularios.' : 'Sin leads en este filtro.'}
          </p>
        ) : shown.map(l => {
          const [bg,fg] = badge(l.origen).split('|');
          return (
            <div key={l.id} style={{ border:'1px solid #E5E7EB', borderRadius:12, padding:'14px 16px', marginBottom:10, backgroundColor:'#FAFAFA' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:220 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>{l.nombre}</p>
                    <span style={{ fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:20, backgroundColor:bg, color:fg, textTransform:'uppercase' }}>{l.origen}</span>
                    <span style={{ fontSize:9, fontWeight:800, color:estadoColor(l.estado), textTransform:'uppercase' }}>● {l.estado}</span>
                  </div>
                  <p style={{ margin:'0 0 2px', fontSize:12, color:'#374151' }}>
                    <Phone style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:3,color:'#059669'}}/><a href={`https://wa.me/52${l.tel}`} target="_blank" rel="noreferrer" style={{ color:'#059669', fontWeight:700, textDecoration:'none' }}>{l.tel}</a>
                    {l.email && <span style={{ marginLeft:10 }}><Mail style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:3,color:'#6B7280'}}/>{l.email}</span>}
                    {l.zona && <span style={{ marginLeft:10 }}><MapPin style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:3,color:'#6B7280'}}/>{l.zona}</span>}
                  </p>
                  {l.propiedad && <p style={{ margin:'0 0 2px', fontSize:12, color:'#92400E', fontWeight:600 }}><Home style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:3}}/>{l.propiedad}</p>}
                  {l.mensaje && <p style={{ margin:'2px 0 0', fontSize:12, color:'#6B7280' }}><MessageSquare style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:3}}/>{l.mensaje}</p>}
                  <p style={{ margin:'4px 0 0', fontSize:10, color:'#9CA3AF' }}>{new Date(l.fecha).toLocaleString('es-MX')}</p>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {l.estado==='nuevo' && (
                    <button onClick={()=>setEstado(l.id,'contactado')}
                      style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:8, cursor:'pointer', border:'1px solid #FDE68A', backgroundColor:'#FFFBEB', color:'#92400E' }}>
                      Marcar contactado
                    </button>
                  )}
                  {l.estado==='contactado' && (
                    <button onClick={()=>setEstado(l.id,'cerrado')}
                      style={{ fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:8, cursor:'pointer', border:'1px solid #6EE7B7', backgroundColor:'#ECFDF5', color:'#065F46' }}>
                      Cerrar ✓
                    </button>
                  )}
                  <button onClick={()=>del(l.id)}
                    style={{ fontSize:11, padding:'6px 10px', borderRadius:8, cursor:'pointer', border:'1px solid #FCA5A5', backgroundColor:'#FEF2F2', color:'#DC2626' }}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── Testimonios en video ─────────────────────────────────────
interface TestiRow { id:string; nombre:string; zona:string; texto:string; videoUrl?:string; rating:number; fecha:string; }

function TestimonialsPanel({ token }: { token: string }) {
  const [items, setItems] = useState<TestiRow[]>([]);
  const [nombre, setNombre] = useState('');
  const [zona, setZona]     = useState('');
  const [texto, setTexto]   = useState('');
  const [video, setVideo]   = useState('');
  const [rating, setRating] = useState(5);
  const [busy, setBusy]     = useState(false);
  const [msg, setMsg]       = useState('');

  const load = useCallback(async () => {
    const r = await fetch('/api/testimonials');
    if (r.ok) setItems(await r.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/testimonials', {
      method:'POST', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ nombre, zona, texto, videoUrl: video, rating }),
    });
    setBusy(false);
    if (r.ok) { setMsg('✓ Testimonio publicado en el sitio'); setNombre(''); setZona(''); setTexto(''); setVideo(''); load(); }
    else setMsg('Error al guardar');
  };

  const del = async (id: string, n: string) => {
    if (!confirm(`¿Eliminar el testimonio de ${n}?`)) return;
    await fetch('/api/testimonials', { method:'DELETE', headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit' };
  const lab: React.CSSProperties = { display:'block', fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:1, marginBottom:6 };

  return (
    <div style={C.card}>
      <div style={{ padding:'clamp(14px,4vw,20px) clamp(14px,4vw,24px)', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' as const }}>
        <div style={{ width:36, height:36, borderRadius:10, backgroundColor:'#FDF4FF', border:'1px solid #F0ABFC', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Video style={{width:18,height:18,color:'#A21CAF'}}/>
        </div>
        <div>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:'#111827' }}>Testimonios en Video ({items.length})</h3>
          <p style={{ margin:0, fontSize:12, color:'#6B7280' }}>Se muestran en la sección de historias reales del inicio</p>
        </div>
      </div>

      <div style={{ padding:'clamp(14px,4vw,24px)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
        {/* Formulario */}
        <form onSubmit={add}>
          <p style={{ margin:'0 0 14px', fontSize:13, fontWeight:700, color:'#374151' }}>Agregar testimonio</p>
          <div style={{ display:'grid', gap:12 }}>
            <div><label style={lab}>Nombre del cliente *</label>
              <input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Familia García" style={inp}/></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 110px', gap:10 }}>
              <div><label style={lab}>Zona</label>
                <input value={zona} onChange={e=>setZona(e.target.value)} placeholder="Mixquiahuala" style={inp}/></div>
              <div><label style={lab}>Estrellas</label>
                <select value={rating} onChange={e=>setRating(Number(e.target.value))} style={inp}>
                  {[5,4,3].map(n=><option key={n} value={n}>{'★'.repeat(n)}</option>)}
                </select></div>
            </div>
            <div><label style={lab}>Link del video (YouTube, Drive o .mp4)</label>
              <input value={video} onChange={e=>setVideo(e.target.value)} placeholder="https://youtube.com/watch?v=…" style={inp}/>
              <p style={{ margin:'5px 0 0', fontSize:11, color:'#9CA3AF' }}>
                <Lightbulb style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:4}}/>
                Pega el link de YouTube o Google Drive; se convierte solo al formato correcto
              </p></div>
            <div><label style={lab}>Texto del testimonio (opcional)</label>
              <textarea value={texto} onChange={e=>setTexto(e.target.value)} rows={2}
                placeholder="Nos acompañaron en todo el proceso…" style={{...inp, resize:'vertical' as const}}/></div>
            <button type="submit" disabled={busy}
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, padding:'12px',
                background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000', fontWeight:800, fontSize:13,
                border:'none', borderRadius:12, cursor:'pointer', opacity:busy?.6:1 }}>
              <PlayCircle style={{width:15,height:15}}/>{busy?'Publicando…':'Publicar testimonio'}
            </button>
            {msg && <p style={{ margin:0, fontSize:12, fontWeight:600, color: msg.startsWith('✓')?'#059669':'#DC2626' }}>{msg}</p>}
          </div>
        </form>

        {/* Lista */}
        <div>
          <p style={{ margin:'0 0 14px', fontSize:13, fontWeight:700, color:'#374151' }}>Publicados</p>
          {items.length === 0 ? (
            <p style={{ color:'#9CA3AF', fontSize:13, padding:'16px 0', margin:0 }}>Aún no hay testimonios. Los que agregues aparecen al instante en el inicio.</p>
          ) : items.map(t=>(
            <div key={t.id} style={{ border:'1px solid #E5E7EB', borderRadius:12, padding:'12px 14px', marginBottom:10, backgroundColor:'#FAFAFA' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2, flexWrap:'wrap' as const }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>{t.nombre}</p>
                    {t.videoUrl && <span style={{ fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:20, backgroundColor:'#FDF4FF', color:'#A21CAF', textTransform:'uppercase' as const }}>▶ video</span>}
                    <span style={{ fontSize:11, color:'#D4AF37' }}>{'★'.repeat(t.rating)}</span>
                  </div>
                  {t.zona && <p style={{ margin:0, fontSize:11, color:'#6B7280' }}>{t.zona}</p>}
                  {t.texto && <p style={{ margin:'4px 0 0', fontSize:12, color:'#6B7280', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{t.texto}</p>}
                  {t.videoUrl && <a href={t.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#B8962A', textDecoration:'none', fontWeight:600 }}>Ver video ↗</a>}
                </div>
                <button onClick={()=>del(t.id, t.nombre)}
                  style={{ fontSize:11, padding:'6px 10px', borderRadius:8, cursor:'pointer', border:'1px solid #FCA5A5', backgroundColor:'#FEF2F2', color:'#DC2626', flexShrink:0 }}>
                  <Trash2 style={{width:13,height:13}}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────
export default function AdminDashboard() {
  const router  = useRouter();
  const [email, setEmail]   = useState('');
  const [props, setProps]   = useState<Prop[]>([]);
  const [loading, setLoad]  = useState(true);
  const [filter, setFilter] = useState<'all'|'active'|'sold'>('all');
  const [toast, setToast]   = useState('');
  const [tok, setTok]       = useState('');
  const [tab, setTab]       = useState<'resumen'|'propiedades'|'leads'|'testimonios'|'asesores'>('resumen');
  const [leadCount, setLeadCount] = useState(0);

  const fetchProps = useCallback(async (t:string) => {
    const r = await fetch('/api/admin/properties', { headers:{ Authorization:`Bearer ${t}` }});
    if (r.status===401) { localStorage.clear(); router.replace('/admin/login'); return; }
    if (r.ok) setProps(await r.json());
    setLoad(false);
  }, [router]);

  useEffect(() => {
    const t = localStorage.getItem('bacru-admin-token')||'';
    if (!t) { router.replace('/admin/login'); return; }
    setTok(t);
    setEmail(localStorage.getItem('bacru-admin-email')||'');
    fetchProps(t);
    fetch('/api/leads',{headers:{Authorization:`Bearer ${t}`}})
      .then(r=>r.ok?r.json():[])
      .then((l:{estado:string}[])=>setLeadCount(Array.isArray(l)?l.filter(x=>x.estado==='nuevo').length:0))
      .catch(()=>{});
  }, [router, fetchProps]);

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(''),3000); };

  const toggleActive = async (id:string, current:boolean) => {
    const t = localStorage.getItem('bacru-admin-token')||'';
    const r = await fetch(`/api/admin/properties/${id}`, {
      method:'PATCH', headers:{ Authorization:`Bearer ${t}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ active:!current }),
    });
    if (r.ok) { setProps(p=>p.map(x=>x.id===id?{...x,active:!current}:x)); showToast(`Propiedad marcada como ${!current?'activa':'vendida'}`); }
  };

  const deleteProp = async (id:string, name:string) => {
    if (!confirm(`¿Eliminar permanentemente "${name}"?`)) return;
    const t = localStorage.getItem('bacru-admin-token')||'';
    const r = await fetch(`/api/admin/properties/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${t}` }});
    if (r.ok) { setProps(p=>p.filter(x=>x.id!==id)); showToast('Propiedad eliminada'); }
  };

  const filtered = props.filter(p=>filter==='all'||( filter==='active'?p.active:!p.active));

  return (
    <div style={C.page}>
      {/* Top bar */}
      <header style={C.hdr}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Image src="/images/logo-nobg.png" alt="Bacru" width={32} height={32} style={{objectFit:'contain'}}/>
          <div>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#111827' }}>Panel Admin · Bacru</p>
            <p style={{ margin:0, fontSize:12, color:'#6B7280' }}>{email}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/" target="_blank"
            style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'#6B7280', border:'1px solid #E5E7EB', padding:'7px 12px', borderRadius:9, textDecoration:'none' }}>
            Ver sitio ↗
          </Link>
          <button onClick={()=>{ localStorage.clear(); router.push('/admin/login'); }}
            style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'#DC2626', border:'1px solid #FCA5A5', padding:'7px 12px', borderRadius:9, cursor:'pointer', backgroundColor:'#FEF2F2' }}>
            Salir
          </button>
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div style={{ position:'fixed', top:72, right:24, zIndex:200, backgroundColor:'#065F46', color:'#ECFDF5', fontSize:13, fontWeight:700, padding:'12px 18px', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {/* ═══ Navegación por pestañas ═══ */}
      <div style={{ backgroundColor:'#FFF', borderBottom:'1px solid #E5E7EB', position:'sticky', top:56, zIndex:40 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(12px,4vw,24px)', display:'flex', gap:4, overflowX:'auto' }}>
          {([
            ['resumen',     'Resumen',     LayoutDashboard],
            ['propiedades', 'Propiedades', Home],
            ['testimonios', 'Testimonios', Video],
            ['asesores',    'Asesores',    Users],
          ] as [typeof tab, string, React.ElementType][]).map(([id,label,Icon])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'13px 16px', fontSize:13, fontWeight:700,
                cursor:'pointer', border:'none', background:'transparent', whiteSpace:'nowrap',
                color: tab===id ? '#111827' : '#9CA3AF',
                borderBottom: tab===id ? '2px solid #D4AF37' : '2px solid transparent',
                transition:'color .2s, border-color .2s' }}>
              <Icon style={{width:15,height:15}}/>
              {label}

              {id==='propiedades' && (
                <span style={{ fontSize:10, fontWeight:700, backgroundColor:'#F3F4F6', color:'#6B7280', padding:'1px 6px', borderRadius:20, marginLeft:2 }}>{props.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'clamp(16px,4vw,28px) clamp(12px,4vw,24px)', display:'flex', flexDirection:'column' as const, gap:20 }}>

        {/* ─── RESUMEN ─── */}
        {tab === 'resumen' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:16 }}>
              {[
                { l:'Propiedades', v:props.length,                     c:'#111827', Icon:Home },
                { l:'Activas',     v:props.filter(p=>p.active).length, c:'#059669', Icon:Check },
                { l:'Vendidas',    v:props.filter(p=>!p.active).length,c:'#DC2626', Icon:X },
                { l:'Leads nuevos',v:leadCount,                        c:'#2563EB', Icon:Inbox },
              ].map(s=>(
                <div key={s.l} style={{ ...C.card, padding:'20px' }}>
                  <s.Icon style={{width:16,height:16,color:s.c,marginBottom:8}}/>
                  <p style={{ margin:0, fontSize:30, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</p>
                  <p style={{ margin:'6px 0 0', fontSize:12, color:'#6B7280' }}>{s.l}</p>
                </div>
              ))}
            </div>

            {/* Accesos rápidos */}
            <div style={{ ...C.card, padding:'clamp(16px,4vw,24px)' }}>
              <h3 style={{ margin:'0 0 4px', fontSize:15, fontWeight:700, color:'#111827' }}>Acciones rápidas</h3>
              <p style={{ margin:'0 0 16px', fontSize:12, color:'#6B7280' }}>Lo que más haces, a un clic</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
                <Link href="/admin/propiedad/nueva"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'16px', borderRadius:12, textDecoration:'none',
                    background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000' }}>
                  <Plus style={{width:18,height:18}}/>
                  <span style={{ fontWeight:800, fontSize:13 }}>Nueva propiedad</span>
                </Link>
                <button onClick={()=>setTab('leads')}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'16px', borderRadius:12, cursor:'pointer',
                    border:'1px solid #E5E7EB', backgroundColor:'#FFF', textAlign:'left' }}>
                  <Inbox style={{width:18,height:18,color:'#2563EB'}}/>
                  <span style={{ fontWeight:700, fontSize:13, color:'#374151' }}>Revisar leads {leadCount>0 && `(${leadCount})`}</span>
                </button>
                <button onClick={()=>setTab('propiedades')}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'16px', borderRadius:12, cursor:'pointer',
                    border:'1px solid #E5E7EB', backgroundColor:'#FFF', textAlign:'left' }}>
                  <Pencil style={{width:18,height:18,color:'#6B7280'}}/>
                  <span style={{ fontWeight:700, fontSize:13, color:'#374151' }}>Editar propiedades</span>
                </button>
                <Link href="/mapa" target="_blank"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'16px', borderRadius:12, textDecoration:'none',
                    border:'1px solid #E5E7EB', backgroundColor:'#FFF' }}>
                  <ExternalLink style={{width:18,height:18,color:'#6B7280'}}/>
                  <span style={{ fontWeight:700, fontSize:13, color:'#374151' }}>Ver mapa público</span>
                </Link>
              </div>
            </div>

            {/* Últimas propiedades */}
            <div style={C.card}>
              <div style={{ padding:'clamp(14px,4vw,20px) clamp(14px,4vw,24px)', borderBottom:'1px solid #E5E7EB', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#111827' }}>Últimas propiedades</h3>
                <button onClick={()=>setTab('propiedades')}
                  style={{ fontSize:12, fontWeight:700, color:'#B8962A', background:'transparent', border:'none', cursor:'pointer' }}>
                  Ver todas →
                </button>
              </div>
              <div style={{ padding:'8px 0' }}>
                {props.slice(0,4).map(p=>(
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px clamp(14px,4vw,24px)' }}>
                    <div style={{ width:44, height:34, borderRadius:8, overflow:'hidden', backgroundColor:'#F3F4F6', flexShrink:0, position:'relative' }}>
                      {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill style={{objectFit:'cover'}} unoptimized/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                      <p style={{ margin:0, fontSize:11, color:'#9CA3AF' }}>{p.zone} · ${(p.price/1000000).toFixed(2)}M</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, flexShrink:0,
                      backgroundColor:p.active?'#ECFDF5':'#FEF2F2', color:p.active?'#065F46':'#DC2626' }}>
                      {p.active?'Activa':'Vendida'}
                    </span>
                  </div>
                ))}
                {props.length===0 && <p style={{ textAlign:'center', color:'#9CA3AF', fontSize:13, padding:'24px' }}>Aún no hay propiedades.</p>}
              </div>
            </div>
          </>
        )}

        {/* ─── LEADS ─── */}
        {tab === 'leads' && tok && <LeadsPanel token={tok}/>}

        {/* ─── TESTIMONIOS ─── */}
        {tab === 'testimonios' && tok && <TestimonialsPanel token={tok}/>}

        {/* ─── ASESORES ─── */}
        {tab === 'asesores' && tok && <UsersPanel token={tok} myEmail={email}/>}

        {/* ─── PROPIEDADES ─── */}
        {tab === 'propiedades' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' as const }}>
            <div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#111827' }}>Propiedades</h2>
              <p style={{ margin:'2px 0 0', fontSize:13, color:'#6B7280' }}>Gestiona el catálogo visible en el sitio web</p>
            </div>
            <Link href="/admin/propiedad/nueva"
              style={{ display:'inline-flex', alignItems:'center', gap:6, whiteSpace:'nowrap' as const, background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000', fontWeight:700, fontSize:13, padding:'10px 18px', borderRadius:12, textDecoration:'none' }}>
              <Plus style={{width:15,height:15}}/>Nueva Propiedad
            </Link>
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto' as const, paddingBottom:4 }}>
            {(['all','active','sold'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:'1px solid', whiteSpace:'nowrap',
                  borderColor:filter===f?'#D4AF37':'#E5E7EB',
                  backgroundColor:filter===f?'#FFFBEB':'#FFF',
                  color:filter===f?'#92400E':'#6B7280' }}>
                {f==='all'?`Todas (${props.length})`:f==='active'?`Activas (${props.filter(p=>p.active).length})`:`Vendidas (${props.filter(p=>!p.active).length})`}
              </button>
            ))}
          </div>

          <div style={C.card}>
            {loading ? (
              <div style={{ padding:64, textAlign:'center' as const, color:'#6B7280', fontSize:14 }}>Cargando propiedades…</div>
            ) : (
              <div style={{ overflowX:'auto' as const }}>
                <table style={{ width:'100%', borderCollapse:'collapse' as const, minWidth:620 }}>
                  <thead>
                    <tr>
                      <th style={C.th}>Propiedad</th>
                      <th style={C.th}>Zona</th>
                      <th style={C.th}>Precio</th>
                      <th style={{ ...C.th, textAlign:'center' as const }}>Estado</th>
                      <th style={{ ...C.th, textAlign:'center' as const }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p=>(
                      <tr key={p.id} style={{ opacity:p.active?1:.55, transition:'opacity .2s' }}>
                        <td style={C.td}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:52, height:40, borderRadius:8, overflow:'hidden', backgroundColor:'#F3F4F6', flexShrink:0, position:'relative' as const }}>
                              {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill style={{objectFit:'cover'}} unoptimized/>}
                            </div>
                            <div>
                              <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#111827' }}>{p.name}</p>
                              <p style={{ margin:0, fontSize:11, color:'#9CA3AF', textTransform:'capitalize' as const }}>{p.type?.replace('_',' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td style={C.td}><span style={{ fontSize:12, color:'#6B7280' }}><MapPin style={{width:11,height:11,display:'inline',verticalAlign:'-1px',marginRight:3}}/>{p.zone}</span></td>
                        <td style={C.td}><span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>${(p.price/1000000).toFixed(2)}M</span></td>
                        <td style={{ ...C.td, textAlign:'center' as const }}>
                          <button onClick={()=>toggleActive(p.id,p.active)}
                            style={{ fontSize:11, fontWeight:700, padding:'5px 14px', borderRadius:20, cursor:'pointer',
                              border:`1px solid ${p.active?'#6EE7B7':'#FCA5A5'}`,
                              backgroundColor:p.active?'#ECFDF5':'#FEF2F2',
                              color:p.active?'#065F46':'#DC2626' }}>
                            {p.active?'Activa':'Vendida'}
                          </button>
                        </td>
                        <td style={{ ...C.td, textAlign:'center' as const }}>
                          <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                            <Link href={`/admin/propiedad/${p.id}`}
                              style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#374151', border:'1px solid #D1D5DB', padding:'6px 12px', borderRadius:9, textDecoration:'none', backgroundColor:'#F9FAFB' }}>
                              <Pencil style={{width:12,height:12}}/>Editar
                            </Link>
                            <button onClick={()=>deleteProp(p.id,p.name)}
                              style={{ fontSize:12, color:'#DC2626', border:'1px solid #FCA5A5', backgroundColor:'#FEF2F2', borderRadius:9, padding:'6px 10px', cursor:'pointer' }}>
                              <Trash2 style={{width:14,height:14}}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length===0&&!loading&&(
                      <tr><td colSpan={5} style={{ padding:'64px 24px', textAlign:'center' as const, color:'#6B7280' }}>
                        <Home style={{width:36,height:36,color:'#D1D5DB',margin:'0 auto 12px',display:'block'}}/>
                        <p style={{ fontSize:15, fontWeight:700, color:'#374151', margin:'0 0 6px' }}>Sin propiedades</p>
                        <Link href="/admin/propiedad/nueva" style={{ fontSize:13, color:'#B8962A', textDecoration:'none' }}>
                          Agregar primera propiedad →
                        </Link>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
