import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/content';
import { getJSON, setJSON } from '@/lib/store';

const KEY = 'leads';

export interface Lead {
  id: string;
  nombre: string;
  tel: string;
  email?: string;
  zona?: string;
  propiedad?: string;
  mensaje?: string;
  origen: string;              // 'contacto' | 'vender' | 'popup' | 'chatbot'
  estado: 'nuevo' | 'contactado' | 'cerrado';
  consentimiento: boolean;     // GDPR: consent record
  fecha: string;
}

async function readLeads(): Promise<Lead[]> {
  try { return await getJSON<Lead[]>(KEY, []); }
  catch { return []; }
}
async function writeLeads(l: Lead[]) {
  await setJSON(KEY, l);
}

// POST — public: capture lead from any form (GDPR consent required)
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.nombre?.trim() || !b.tel?.trim())
      return NextResponse.json({ error: 'Nombre y teléfono requeridos' }, { status: 400 });
    if (b.consentimiento !== true)
      return NextResponse.json({ error: 'Se requiere aceptar el Aviso de Privacidad' }, { status: 400 });

    const lead: Lead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      nombre: String(b.nombre).slice(0,120),
      tel: String(b.tel).replace(/\D/g,'').slice(0,15),
      email: b.email ? String(b.email).slice(0,120) : '',
      zona: b.zona ? String(b.zona).slice(0,60) : '',
      propiedad: b.propiedad ? String(b.propiedad).slice(0,160) : '',
      mensaje: b.mensaje ? String(b.mensaje).slice(0,1000) : '',
      origen: ['contacto','vender','popup','chatbot'].includes(b.origen) ? b.origen : 'contacto',
      estado: 'nuevo',
      consentimiento: true,
      fecha: new Date().toISOString(),
    };
    const leads = await readLeads();
    leads.unshift(lead);
    await writeLeads(leads);
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET — admin only: list leads
export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error:'No autorizado' }, { status:401 });
  return NextResponse.json(await readLeads());
}

// PATCH — admin: update lead estado
export async function PATCH(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error:'No autorizado' }, { status:401 });
  const { id, estado } = await req.json();
  const leads = await readLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return NextResponse.json({ error:'No encontrado' }, { status:404 });
  leads[idx].estado = estado;
  await writeLeads(leads);
  return NextResponse.json(leads[idx]);
}

// DELETE — admin: remove lead (GDPR right to erasure)
export async function DELETE(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error:'No autorizado' }, { status:401 });
  const { id } = await req.json();
  await writeLeads((await readLeads()).filter(l => l.id !== id));
  return NextResponse.json({ ok: true });
}
