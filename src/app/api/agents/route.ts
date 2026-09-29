import { NextResponse } from 'next/server';

// Sin caché: el sitio siempre lee lo último que guardó el panel
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { verifyToken, getTokenFromRequest } from '@/lib/content';
import { AGENTS } from '@/lib/data';
import { getJSON, setJSON } from '@/lib/store';

const KEY = 'agents';

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  whatsapp: string;
  zones: string[];
  photo: string;
  specialty?: string;
}

// La primera vez se siembra con el equipo que ya está en la página
function seed(): AgentRecord[] {
  return AGENTS.map(a => ({
    id: a.id, name: a.name, role: a.role, whatsapp: a.whatsapp,
    zones: a.zones, photo: a.photo, specialty: a.specialty || '',
  }));
}

async function writeAll(list: AgentRecord[]) {
  await setJSON(KEY, list);
}

async function readAll(): Promise<AgentRecord[]> {
  try {
    const data = await getJSON<AgentRecord[] | null>(KEY, null);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) { console.error('agents read:', e); }
  const s = seed();
  try { await writeAll(s); } catch {}
  return s;
}

function sanitize(b: Record<string, unknown>, existing?: AgentRecord): AgentRecord {
  const zones = Array.isArray(b.zones)
    ? (b.zones as string[]).map(z => String(z).slice(0, 60)).filter(Boolean)
    : String(b.zones || '').split(',').map(z => z.trim()).filter(Boolean);
  return {
    id: existing?.id || `agent-${Date.now()}`,
    name: String(b.name ?? existing?.name ?? '').slice(0, 90),
    role: String(b.role ?? existing?.role ?? 'Asesor de Ventas').slice(0, 60),
    whatsapp: String(b.whatsapp ?? existing?.whatsapp ?? '').replace(/\D/g, '').slice(0, 15),
    zones: zones.length ? zones : (existing?.zones || ['Pachuca']),
    photo: String(b.photo ?? existing?.photo ?? '').slice(0, 600),
    specialty: String(b.specialty ?? existing?.specialty ?? '').slice(0, 90),
  };
}

// GET — público: la página de Agentes lee de aquí
export async function GET() {
  return NextResponse.json(await readAll());
}

// POST — admin: agregar asesor (aparece en /agentes al instante)
export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  if (!String(b.name || '').trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  const agent = sanitize(b);
  if (!agent.photo) agent.photo = '/images/team/carlos-nobg.png'; // placeholder hasta subir foto
  const all = await readAll();
  all.push(agent);
  await writeAll(all);
  return NextResponse.json(agent, { status: 201 });
}

// PUT — admin: editar la ficha de un asesor
export async function PUT(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  const all = await readAll();
  const idx = all.findIndex(a => a.id === b.id);
  if (idx === -1) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  all[idx] = sanitize(b, all[idx]);
  await writeAll(all);
  return NextResponse.json(all[idx]);
}

// DELETE — admin: quitar asesor de la página
export async function DELETE(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  await writeAll((await readAll()).filter(a => a.id !== id));
  return NextResponse.json({ ok: true });
}
