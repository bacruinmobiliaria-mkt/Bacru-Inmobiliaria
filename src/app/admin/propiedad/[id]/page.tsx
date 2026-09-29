'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Camera, Check, FolderUp, Lightbulb, Link2, Map, MapPin, Rocket, Save, Star, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/lib/uploadClient';

const TIPOS    = [['casa_hecha','Casa habitación'],['personalizable','Personalizable'],['terreno','Terreno'],['departamento','Departamento']];
const ZONAS    = ['Mixquiahuala','Tezontepec','Pachuca','Tepatepec','San Antonio','Progreso de Obregón','Tulancingo','Pachuquilla','EdoMex','CDMX'];
const CRÉDITOS = ['INFONAVIT','FOVISSSTE','Bancario','Contado'];
const AGENTES  = [['eros','Eros Atzin'],['carlos','Carlos Orta (Director)'],['edwin','Edwin Orta'],['karla','Karla Orta'],['rosita','Rosita'],['miguel','Miguel Bautista'],['jose','José Antonio'],['teo','Teo']];

// Convert any Google Maps URL → embed URL
function toEmbedUrl(url: string): string {
  if (!url.trim()) return '';
  // Already embed
  if (url.includes('output=embed')) return url;

  // Extract coordinates: /@lat,lng or ?q=lat,lng
  const coord = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coord) return `https://maps.google.com/maps?q=${coord[1]},${coord[2]}&t=m&z=15&output=embed`;

  // Extract ?q= text
  const q = url.match(/[?&]q=([^&]+)/);
  if (q) return `https://maps.google.com/maps?q=${q[1]}&t=m&z=14&output=embed`;

  // Extract /place/NAME from URLs like google.com/maps/place/NAME/@...
  const place = url.match(/\/place\/([^/@]+)/);
  if (place) return `https://maps.google.com/maps?q=${place[1]}&t=m&z=14&output=embed`;

  // Links cortos (goo.gl, maps.app.goo.gl): Google bloquea el iframe.
  // Se resuelven en el servidor (ver useEffect) — mientras tanto, sin preview.
  if (url.includes('goo.gl') || url.includes('maps.app')) return '';

  // Fallback: treat whole URL as query
  return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=m&z=13&output=embed`;
}

interface F {
  name:string; type:string; price:string; zone:string; beds:string; baths:string;
  buildM2:string; landM2:string; badge:string; description:string; nearby:string;
  financing:string[]; images:string[]; videos:string[]; mapsUrl:string; address:string;
  agentId:string; active:boolean; featured:boolean;
}
const EMPTY: F = {
  name:'', type:'casa_hecha', price:'', zone:'Pachuca', beds:'3', baths:'2',
  buildM2:'', landM2:'', badge:'Nuevo', description:'', nearby:'',
  financing:['Bancario','Contado'], images:[], videos:[], mapsUrl:'', address:'',
  agentId:'eros', active:true, featured:false,
};

// Shared inline style tokens
const inp: React.CSSProperties = { width:'100%', boxSizing:'border-box', border:'1px solid #D1D5DB', borderRadius:10, padding:'11px 14px', fontSize:14, color:'#111827', backgroundColor:'#FFF', outline:'none' };
const lbl: React.CSSProperties = { display:'block', fontSize:11, fontWeight:600, color:'#6B7280', marginBottom:7, textTransform:'uppercase', letterSpacing:'.05em' };
const card: React.CSSProperties = { backgroundColor:'#FFF', border:'1px solid #E5E7EB', borderRadius:16, padding:'clamp(14px,4vw,24px)', boxShadow:'0 1px 3px rgba(0,0,0,.07)' };

export default function PropiedadForm({ params }: { params: { id: string } }) {
  const { id } = params;
  const isNew  = id === 'nueva';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm]         = useState<F>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploading, setUpload]  = useState(false);
  const [imgErr, setImgErr]     = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [addMode, setAddMode]   = useState<'file'|'url'>('file');
  const [formErr, setFormErr]   = useState('');

  const [resolving, setResolving] = useState(false);
  const [vidBusy, setVidBusy] = useState(false);
  const [vidUrl, setVidUrl] = useState('');
  const [vidErr, setVidErr] = useState('');
  const [mapsErr, setMapsErr]     = useState('');
  const [debouncedMaps, setDebouncedMaps] = useState('');

  // El preview espera 500ms tras dejar de escribir (no recarga en cada tecla)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedMaps(form.mapsUrl), 500);
    return () => clearTimeout(t);
  }, [form.mapsUrl]);


  // ── Videos de la propiedad (vertical u horizontal) ──
  const addVideoFile = async (file: File) => {
    setVidBusy(true); setVidErr('');
    try {
      const tok = localStorage.getItem('bacru-admin-token') || '';
      const d = await uploadFile(file, tok);
      if (d.ok && d.url) setForm(f => ({ ...f, videos: [...f.videos, d.url as string].slice(0,4) }));
      else setVidErr(d.error || 'Error al subir el video');
    } catch { setVidErr('Error al subir el video'); }
    finally { setVidBusy(false); }
  };
  const addVideoUrl = () => {
    const u = vidUrl.trim();
    if (!u) return;
    // YouTube → embed; Drive → preview; mp4 directo tal cual
    let final = u;
    const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
    if (yt) final = `https://www.youtube.com/embed/${yt[1]}`;
    const dr = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (dr) final = `https://drive.google.com/file/d/${dr[1]}/preview`;
    setForm(f => ({ ...f, videos: [...f.videos, final].slice(0,4) }));
    setVidUrl('');
  };

  // Links cortos (maps.app.goo.gl): se resuelven solos en el servidor
  useEffect(() => {
    const u = debouncedMaps.trim();
    if (!u || !/goo\.gl|maps\.app/.test(u)) return;
    const tok = localStorage.getItem('bacru-admin-token');
    setResolving(true); setMapsErr('');
    fetch('/api/admin/resolve-maps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: u }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.url && !/goo\.gl|maps\.app/.test(d.url)) {
          setForm(f => ({ ...f, mapsUrl: d.url }));
        } else if (d.error) setMapsErr(d.error);
        else setMapsErr('Abre el link en tu navegador y copia la URL completa de la barra de direcciones.');
      })
      .catch(() => setMapsErr('No se pudo resolver el link corto. Copia la URL completa desde tu navegador.'))
      .finally(() => setResolving(false));
  }, [debouncedMaps]);

  // Live Google Maps embed from pasted URL (con debounce)
  const embedUrl = useMemo(() => toEmbedUrl(debouncedMaps), [debouncedMaps]);

  useEffect(() => {
    const tok = localStorage.getItem('bacru-admin-token');
    if (!tok) { router.replace('/admin/login'); return; }
    if (!isNew) {
      fetch(`/api/admin/properties/${id}`, { headers:{ Authorization:`Bearer ${tok}` }})
        .then(r => r.ok ? r.json() : null)
        .then(p => {
          if (!p) return;
          setForm({
            name:p.name||'', type:p.type||'casa_hecha', price:String(p.price||''),
            zone:p.zone||'Pachuca', beds:String(p.beds||''), baths:String(p.baths||''),
            buildM2:String(p.buildM2||''), landM2:String(p.landM2||''),
            badge:p.badge||'Nuevo', description:p.description||'', nearby:p.nearby||'',
            financing:p.financing||['Contado'], images:p.images||[],
            mapsUrl:p.mapsUrl||p.googleMapsUrl||'', address:p.address||'',
            videos: Array.isArray(p.videos) ? p.videos : [],
            agentId:p.agentId||'eros', active:p.active!==false, featured:p.featured||false,
          });
        });
    }
  }, [id, isNew, router]);

  const set = <K extends keyof F>(k: K, v: F[K]) => setForm(f => ({ ...f, [k]: v }));

  // ── File upload ──────────────────────────────────────────
  const handleFiles = async (files: FileList) => {
    setUpload(true); setImgErr('');
    const tok = localStorage.getItem('bacru-admin-token') || '';
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) { setImgErr(`"${file.name}" no es imagen`); continue; }
      if (file.size > 10 * 1024 * 1024)   { setImgErr(`"${file.name}" supera 10MB`);  continue; }
      try {
        const d = await uploadFile(file, tok);
        if (d.ok && d.url) urls.push(d.url); else setImgErr(d.error || 'Error subiendo');
      } catch { setImgErr('Error de red'); }
    }
    if (urls.length) set('images', [...form.images, ...urls]);
    setUpload(false);
  };

  // ── Photo URL (Google Drive, direct link) ──────────────
  const handlePhotoUrl = async () => {
    if (!urlInput.trim()) return;
    setUpload(true); setImgErr('');
    const tok = localStorage.getItem('bacru-admin-token') || '';
    try {
      const r = await fetch('/api/admin/upload', {
        method:'POST', headers:{ Authorization:`Bearer ${tok}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const d = await r.json();
      if (r.ok) { set('images', [...form.images, d.url]); setUrlInput(''); }
      else setImgErr(d.error || 'URL inválida');
    } catch { setImgErr('Error de red'); }
    setUpload(false);
  };

  const removeImg = (i: number) => set('images', form.images.filter((_, j) => j !== i));
  const moveImg   = (i: number, dir: -1 | 1) => {
    const a = [...form.images]; const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; set('images', a);
  };
  const toggleFin = (opt: string) =>
    set('financing', form.financing.includes(opt) ? form.financing.filter(x => x !== opt) : [...form.financing, opt]);

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr('');
    if (form.images.length === 0) { setFormErr('Agrega al menos 1 foto.'); return; }
    if (!form.description.trim()) { setFormErr('La descripción es obligatoria.'); return; }
    setSaving(true);
    const tok  = localStorage.getItem('bacru-admin-token') || '';
    const slug = isNew
      ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
      : id;
    const body = {
      id: slug, slug, name: form.name, type: form.type,
      price: parseInt(form.price.replace(/\D/g, '')) || 0,
      zone: form.zone, beds: parseInt(form.beds) || 0, baths: parseFloat(form.baths) || 0,
      buildM2: parseInt(form.buildM2) || 0, landM2: parseInt(form.landM2) || 0,
      badge: form.badge, description: form.description, nearby: form.nearby,
      financing: form.financing, images: form.images,
      mapsUrl: form.mapsUrl, address: form.address,
      videos: form.videos,
      // Keep lat/lng for backwards compatibility
      lat: 20.1, lng: -98.75,
      agentId: form.agentId, active: form.active, featured: form.featured,
      badgeColor: 'bg-gold',
    };
    const r = await fetch(
      isNew ? '/api/admin/properties' : `/api/admin/properties/${id}`,
      { method: isNew ? 'POST' : 'PUT', headers:{ Authorization:`Bearer ${tok}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) }
    );
    setSaving(false);
    if (r.ok) { setSaved(true); setTimeout(() => router.push('/admin/dashboard'), 1500); }
    else { const d = await r.json(); setFormErr(d.error || 'Error al guardar'); }
  };

  const g2: React.CSSProperties = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 };
  const c2: React.CSSProperties = { gridColumn:'span 2' };

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#F3F4F6', fontFamily:'Inter, system-ui, sans-serif' }}>
      {/* ── Header ── */}
      <header style={{ backgroundColor:'#FFF', borderBottom:'1px solid #E5E7EB', padding:'10px clamp(12px,4vw,24px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => router.push('/admin/dashboard')}
            style={{ border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:'#6B7280', fontWeight:600 }}>
            ← Volver
          </button>
          <span style={{ color:'#D1D5DB' }}>|</span>
          <h1 style={{ margin:0, fontSize:'clamp(13px,3.6vw,15px)', fontWeight:700, color:'#111827', maxWidth:'55vw', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {isNew ? '+ Nueva Propiedad' : `Editar: ${form.name || '…'}`}
          </h1>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button type="button" onClick={() => set('featured', !form.featured)}
            style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, padding:'6px 12px', borderRadius:10, cursor:'pointer', border:'1px solid',
              borderColor:form.featured?'#D4AF37':'#E5E7EB', backgroundColor:form.featured?'#FFFBEB':'#FFF', color:form.featured?'#92400E':'#6B7280' }}>
            {form.featured ? <><Star style={{width:12,height:12,fill:'#D4AF37'}}/> Destacada</> : <><Star style={{width:12,height:12}}/> Destacar</>}
          </button>
          <button type="button" onClick={() => set('active', !form.active)}
            style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, padding:'6px 12px', borderRadius:10, cursor:'pointer', border:'1px solid',
              borderColor:form.active?'#6EE7B7':'#FCA5A5', backgroundColor:form.active?'#ECFDF5':'#FEF2F2', color:form.active?'#065F46':'#DC2626' }}>
            {form.active ? <><Check style={{width:12,height:12}}/> Activa</> : <><X style={{width:12,height:12}}/> Vendida</>}
          </button>
        </div>
      </header>

      <main style={{ maxWidth:1000, margin:'0 auto', padding:'clamp(16px,4vw,28px) clamp(12px,4vw,24px)' }}>
        {saved && (
          <div style={{ backgroundColor:'#D1FAE5', border:'1px solid #6EE7B7', borderRadius:12, padding:'14px 20px', marginBottom:20, textAlign:'center' }}>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#065F46' }}>✓ Guardado correctamente — redirigiendo…</p>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* ── 1. Info general ── */}
          <div style={card}>
            <h2 style={{ margin:'0 0 18px', fontSize:15, fontWeight:700, color:'#111827', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontSize:12, fontWeight:800, marginRight:10 }}>1</span>
              Información general
            </h2>
            <div style={g2}>
              <div style={c2}>
                <label style={lbl}>Nombre de la propiedad *</label>
                <input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ej: Casa Familiar Los Pinos" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Tipo *</label>
                <select required value={form.type} onChange={e=>set('type',e.target.value)} style={inp}>
                  {TIPOS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Zona / Municipio *</label>
                <select required value={form.zone} onChange={e=>set('zone',e.target.value)} style={inp}>
                  {ZONAS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Precio MXN *</label>
                <input required value={form.price} onChange={e=>set('price',e.target.value)} placeholder="1,500,000" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Etiqueta / Badge</label>
                <input value={form.badge} onChange={e=>set('badge',e.target.value)} placeholder="Nuevo, Entrega inmediata, Premium…" style={inp}/>
              </div>
              <div>
                <label style={lbl}>Asesor asignado</label>
                <select value={form.agentId} onChange={e=>set('agentId',e.target.value)} style={inp}>
                  {AGENTES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── 2. Dimensiones + Financiamiento (lado a lado) ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
            <div style={card}>
              <h2 style={{ margin:'0 0 18px', fontSize:15, fontWeight:700, color:'#111827', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
                <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontSize:12, fontWeight:800, marginRight:10 }}>2</span>
                Dimensiones
              </h2>
              <div style={g2}>
                {([['beds','Recámaras'],['baths','Baños'],['buildM2','M² Construcción'],['landM2','M² Terreno']] as [keyof F, string][]).map(([k,l]) => (
                  <div key={String(k)}>
                    <label style={lbl}>{l}</label>
                    <input value={String(form[k])} onChange={e=>set(k, e.target.value as never)} placeholder="0" style={inp}/>
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <h2 style={{ margin:'0 0 18px', fontSize:15, fontWeight:700, color:'#111827', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
                <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontSize:12, fontWeight:800, marginRight:10 }}>3</span>
                Financiamiento
              </h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {CRÉDITOS.map(c => (
                  <button key={c} type="button" onClick={() => toggleFin(c)}
                    style={{ padding:'13px', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', border:'2px solid', transition:'all .15s',
                      borderColor:form.financing.includes(c)?'#D4AF37':'#E5E7EB',
                      backgroundColor:form.financing.includes(c)?'#FFFBEB':'#F9FAFB',
                      color:form.financing.includes(c)?'#92400E':'#6B7280' }}>
                    {form.financing.includes(c) ? `✓ ${c}` : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3. Descripción ── */}
          <div style={card}>
            <h2 style={{ margin:'0 0 18px', fontSize:15, fontWeight:700, color:'#111827', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontSize:12, fontWeight:800, marginRight:10 }}>4</span>
              Descripción
            </h2>
            <div style={g2}>
              <div style={c2}>
                <label style={lbl}>Descripción completa *</label>
                <textarea required value={form.description} onChange={e=>set('description',e.target.value)}
                  rows={4} placeholder="Describe la propiedad: espacios, acabados, características especiales…"
                  style={{ ...inp, resize:'vertical', lineHeight:'1.6' }}/>
              </div>
              <div style={c2}>
                <label style={lbl}>Cercanías</label>
                <input value={form.nearby} onChange={e=>set('nearby',e.target.value)}
                  placeholder="Escuela, plaza, hospital, parque…" style={inp}/>
              </div>
            </div>
          </div>

          {/* ── 4. Fotos ── */}
          <div style={card}>
            <h2 style={{ margin:'0 0 18px', fontSize:15, fontWeight:700, color:'#111827', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontSize:12, fontWeight:800, marginRight:10 }}>5</span>
              Fotos de la propiedad
              <span style={{ fontSize:12, fontWeight:400, color:'#6B7280', marginLeft:8 }}>({form.images.length} foto{form.images.length !== 1 ? 's' : ''} · mínimo 1)</span>
            </h2>

            {/* Mode tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {(['file','url'] as const).map(m => (
                <button key={m} type="button" onClick={() => setAddMode(m)}
                  style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:'1px solid',
                    borderColor:addMode===m?'#D4AF37':'#E5E7EB',
                    backgroundColor:addMode===m?'#FFFBEB':'#F9FAFB',
                    color:addMode===m?'#92400E':'#6B7280' }}>
                  {m === 'file' ? <><FolderUp style={{width:13,height:13}}/>Subir desde computadora</> : <><Link2 style={{width:13,height:13}}/>URL / Google Drive</>}
                </button>
              ))}
            </div>

            {/* File drop zone */}
            {addMode === 'file' && (
              <div onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
                style={{ border:'2px dashed #D1D5DB', borderRadius:14, padding:'32px 24px', textAlign:'center', cursor:'pointer', marginBottom:14, backgroundColor:'#F9FAFB' }}>
                <Camera style={{width:32,height:32,color:'#D4AF37',margin:'0 auto 8px',display:'block'}} strokeWidth={1.4}/>
                <p style={{ margin:'0 0 4px', fontSize:14, fontWeight:700, color:'#374151' }}>Clic o arrastra fotos aquí</p>
                <p style={{ margin:0, fontSize:12, color:'#9CA3AF' }}>JPG, PNG, WebP · máx 10MB · varias a la vez</p>
                {uploading && <p style={{ margin:'10px 0 0', color:'#D4AF37', fontWeight:600, fontSize:13 }}>Subiendo…</p>}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }}
              onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); }}/>

            {/* Photo URL input */}
            {addMode === 'url' && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handlePhotoUrl(); }}}
                    placeholder="https://drive.google.com/file/d/... o enlace directo" style={{ ...inp, flex:1 }}/>
                  <button type="button" onClick={handlePhotoUrl} disabled={uploading || !urlInput.trim()}
                    style={{ padding:'0 20px', background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000', fontWeight:700, fontSize:13, border:'none', borderRadius:10, cursor:'pointer', opacity:uploading||!urlInput.trim()?0.5:1 }}>
                    {uploading ? '…' : 'Agregar'}
                  </button>
                </div>
                <p style={{ fontSize:12, color:'#6B7280', margin:0 }}>
                  <Lightbulb style={{width:12,height:12,display:'inline',verticalAlign:'-1px',marginRight:4}}/>Google Drive: abre la foto → Compartir → &quot;Cualquiera con el enlace&quot; → pega aquí.
                </p>
              </div>
            )}

            {imgErr && <p style={{ color:'#DC2626', fontSize:12, marginBottom:10 }}><AlertTriangle style={{width:12,height:12,display:'inline',verticalAlign:'-1px',marginRight:4}}/>{imgErr}</p>}

            {/* Photo grid */}
            {form.images.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:10 }}>
                {form.images.map((img, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', border:`2px solid ${i===0?'#D4AF37':'#E5E7EB'}`, aspectRatio:'4/3' }}>
                    <Image src={img} alt="" fill style={{ objectFit:'cover' }} unoptimized loading="lazy"/>
                    {i === 0 && (
                      <span style={{ position:'absolute', top:4, left:4, backgroundColor:'#D4AF37', color:'#000', fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20 }}>Principal</span>
                    )}
                    <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      <button type="button" onClick={() => moveImg(i,-1)} disabled={i===0}
                        style={{ width:26, height:26, borderRadius:8, background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', fontWeight:800, color:'#374151', opacity:i===0?.3:1 }}>←</button>
                      <button type="button" onClick={() => removeImg(i)}
                        style={{ width:26, height:26, borderRadius:8, background:'#DC2626', border:'none', cursor:'pointer', color:'#FFF', fontSize:14 }}>×</button>
                      <button type="button" onClick={() => moveImg(i,1)} disabled={i===form.images.length-1}
                        style={{ width:26, height:26, borderRadius:8, background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', fontWeight:800, color:'#374151', opacity:i===form.images.length-1?.3:1 }}>→</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 4.5 Videos de la propiedad ── */}
          <div style={card}>
            <p style={{ margin:'0 0 4px', fontSize:15, fontWeight:700, color:'#111827' }}>Videos de la propiedad <span style={{fontWeight:400, color:'#9CA3AF', fontSize:12}}>(opcional · máx 4)</span></p>
            <p style={{ margin:'0 0 14px', fontSize:12, color:'#6B7280' }}>Acepta videos verticales (tipo shorts/reels) y horizontales. Sube el archivo o pega un link de YouTube / Drive.</p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:12 }}>
              <label style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, padding:'10px 16px', borderRadius:10, cursor:'pointer', border:'1px solid #D1D5DB', backgroundColor:'#F9FAFB', color:'#374151' }}>
                <FolderUp style={{width:14,height:14}}/>{vidBusy ? 'Subiendo video…' : 'Subir video (máx 80MB)'}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" style={{display:'none'}}
                  onChange={e=>{ const f=e.target.files?.[0]; if(f) addVideoFile(f); e.target.value=''; }}/>
              </label>
              <div style={{ display:'flex', gap:6, flex:1, minWidth:240 }}>
                <input value={vidUrl} onChange={e=>setVidUrl(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addVideoUrl(); } }}
                  placeholder="…o pega link de YouTube / Drive / .mp4"
                  style={{ flex:1, minWidth:0, padding:'10px 12px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:13 }}/>
                <button type="button" onClick={addVideoUrl}
                  style={{ fontSize:12, fontWeight:700, padding:'10px 14px', borderRadius:10, cursor:'pointer', border:'none', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000' }}>
                  Agregar
                </button>
              </div>
            </div>
            {vidErr && <p style={{ margin:'0 0 10px', fontSize:12, color:'#DC2626', fontWeight:600 }}>{vidErr}</p>}
            {form.videos.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
                {form.videos.map((v, i) => (
                  <div key={i} style={{ border:'1px solid #E5E7EB', borderRadius:12, overflow:'hidden', backgroundColor:'#000', position:'relative' }}>
                    {v.includes('youtube.com/embed') || v.includes('drive.google.com') ? (
                      <iframe src={v} style={{ width:'100%', aspectRatio:'16/9', border:0, display:'block' }} title={`video ${i+1}`}/>
                    ) : (
                      <video src={v} muted playsInline preload="metadata" style={{ width:'100%', maxHeight:180, display:'block', objectFit:'contain' }}/>
                    )}
                    <button type="button" onClick={()=>setForm(f=>({ ...f, videos: f.videos.filter((_,j)=>j!==i) }))}
                      style={{ position:'absolute', top:6, right:6, width:26, height:26, borderRadius:'50%', border:'none', cursor:'pointer', backgroundColor:'rgba(220,38,38,.92)', color:'#FFF', fontSize:14, lineHeight:1 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 5. Ubicación con Google Maps ── */}
          <div style={card}>
            <h2 style={{ margin:'0 0 6px', fontSize:15, fontWeight:700, color:'#111827', paddingBottom:14, borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#D4AF37,#F4E27A)', color:'#000', fontSize:12, fontWeight:800, marginRight:10 }}>6</span>
              Ubicación en Google Maps
            </h2>
            <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 16px' }}>
              Abre Google Maps, navega a la ubicación exacta de la propiedad, copia el enlace y pégalo aquí.
            </p>

            {/* URL input */}
            <label style={lbl}>Link de Google Maps</label>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <input
                value={form.mapsUrl}
                onChange={e => set('mapsUrl', e.target.value)}
                placeholder="https://maps.google.com/maps?q=... o https://goo.gl/maps/..."
                style={{ ...inp, flex:1 }}
              />
              {form.mapsUrl && (
                <button type="button" onClick={() => set('mapsUrl', '')}
                  style={{ padding:'0 14px', border:'1px solid #FCA5A5', borderRadius:10, color:'#DC2626', background:'#FEF2F2', cursor:'pointer', fontWeight:700, fontSize:13 }}>
                  Limpiar
                </button>
              )}
            </div>

            {/* How-to hint */}
            <div style={{ backgroundColor:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
              <p style={{ margin:0, fontSize:12, color:'#1E40AF', lineHeight:1.7 }}>
                <strong>¿Cómo obtener el link?</strong><br/>
                1. Abre <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ color:'#2563EB' }}>Google Maps</a><br/>
                2. Busca la dirección de la propiedad<br/>
                3. Clic derecho → &quot;Compartir&quot; o copia la URL del navegador<br/>
                4. Pégala en el campo de arriba
              </p>
            </div>

            {/* Dirección adicional */}
            <label style={lbl}>Dirección (texto, opcional)</label>
            <input value={form.address} onChange={e=>set('address',e.target.value)}
              placeholder="Ej: Calle 5 de Mayo #12, Col. Centro, Mixquiahuala, Hgo." style={{ ...inp, marginBottom:16 }}/>

            {/* Live preview */}
            {embedUrl ? (
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:8 }}>Vista previa del mapa:</p>
                <iframe
                  src={embedUrl}
                  width="100%" height="300"
                  style={{ border:'1px solid #E5E7EB', borderRadius:12, display:'block' }}
                  loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                  title="Vista previa mapa"
                />
                <p style={{ fontSize:11, color:'#9CA3AF', marginTop:6 }}>
                  Esta es exactamente la ubicación que verán los clientes en el popup de la propiedad.
                </p>
              </div>
            ) : (
              <div style={{ height:200, borderRadius:12, border:'1px dashed #D1D5DB', backgroundColor:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, padding:'0 16px' }}>
                {resolving ? (
                  <>
                    <div style={{ width:26, height:26, border:'3px solid #F4E27A', borderTopColor:'#D4AF37', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                    <p style={{ margin:0, fontSize:13, color:'#92400E', textAlign:'center', fontWeight:600 }}>
                      Resolviendo el link corto de Google Maps…
                    </p>
                  </>
                ) : mapsErr ? (
                  <>
                    <AlertTriangle style={{width:30,height:30,color:'#F59E0B'}}/>
                    <p style={{ margin:0, fontSize:12.5, color:'#92400E', textAlign:'center', maxWidth:420 }}>{mapsErr}</p>
                  </>
                ) : (
                  <>
                    <Map style={{width:38,height:38,color:'#D1D5DB'}} strokeWidth={1.3}/>
                    <p style={{ margin:0, fontSize:13, color:'#9CA3AF', textAlign:'center' }}>
                      Pega el link de Google Maps arriba<br/>para ver la vista previa aquí
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Save ── */}
          {formErr && (
            <div style={{ backgroundColor:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:12, padding:'14px 18px' }}>
              <p style={{ margin:0, color:'#B91C1C', fontSize:13, fontWeight:600 }}><AlertTriangle style={{width:13,height:13,display:'inline',verticalAlign:'-2px',marginRight:5}}/>{formErr}</p>
            </div>
          )}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button type="submit" disabled={saving || saved}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'15px', background:'linear-gradient(135deg,#D4AF37,#F4E27A,#B8962A)', color:'#000', fontWeight:800, fontSize:14, border:'none', borderRadius:14, minWidth:200, cursor:saving||saved?'not-allowed':'pointer', opacity:saving||saved?.65:1 }}>
              {saving ? 'Guardando…' : saved ? <><Check style={{width:16,height:16}}/>Guardado — redirigiendo</> : isNew ? <><Rocket style={{width:15,height:15}}/>Publicar Propiedad</> : <><Save style={{width:15,height:15}}/>Guardar Cambios</>}
            </button>
            <button type="button" onClick={() => router.push('/admin/dashboard')}
              style={{ padding:'15px 28px', border:'2px solid #E5E7EB', color:'#374151', fontWeight:700, fontSize:14, borderRadius:14, cursor:'pointer', background:'#FFF' }}>
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
