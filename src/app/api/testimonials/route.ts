import { NextResponse } from 'next/server';

// Sin caché: el sitio siempre lee lo último que guardó el panel
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { verifyToken, getTokenFromRequest } from '@/lib/content';
import { getJSON, setJSON } from '@/lib/store';

const KEY = 'testimonials';

export interface Testimonial {
  id: string;
  nombre: string;
  zona: string;
  texto: string;
  videoUrl?: string;   // YouTube, Drive o .mp4 directo
  rating: number;
  fecha: string;
}

// Testimonios que ya estaban en la página: se siembran la primera vez
const SEED: Testimonial[] = [
  { id:'seed-rodriguez', nombre:'Familia Rodríguez', zona:'Mixquiahuala', texto:'Encontramos nuestra casa en menos de 2 semanas. Rosita nos guió en todo el proceso con INFONAVIT sin ningún problema.', videoUrl:'', rating:5, fecha:'2026-01-15T12:00:00.000Z' },
  { id:'seed-carlos',    nombre:'Carlos y María',    zona:'Pachuca',      texto:'El proceso fue clarísimo. Nos explicaron todo paso a paso y nos ayudaron con los documentos. ¡Ya llevamos 1 año en nuestra casa!', videoUrl:'', rating:5, fecha:'2026-01-10T12:00:00.000Z' },
  { id:'seed-hernandez', nombre:'Familia Hernández', zona:'Tepatepec',    texto:'Personalizamos nuestra casa según nuestras necesidades. Edwin estuvo presente en toda la obra. Muy profesionales.', videoUrl:'', rating:5, fecha:'2026-01-05T12:00:00.000Z' },
];

async function writeAll(t: Testimonial[]) {
  await setJSON(KEY, t);
}
async function readAll(): Promise<Testimonial[]> {
  try {
    const data = await getJSON<Testimonial[] | null>(KEY, null);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) { console.error('testimonials read:', e); }
  try { await writeAll(SEED); } catch {}
  return SEED;
}

// Convierte URLs de YouTube / Drive en URLs embebibles
function toEmbed(url: string): string {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return url; // mp4 u otro embed directo
}

// GET — público: lista de testimonios
export async function GET() {
  return NextResponse.json(await readAll());
}

// POST — admin: agregar testimonio (texto y/o video)
export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  if (!b.nombre?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  const t: Testimonial = {
    id: `testi-${Date.now()}`,
    nombre: String(b.nombre).slice(0, 80),
    zona: String(b.zona || '').slice(0, 60),
    texto: String(b.texto || '').slice(0, 600),
    videoUrl: b.videoUrl ? toEmbed(String(b.videoUrl).slice(0, 500)) : '',
    rating: Math.min(5, Math.max(1, Number(b.rating) || 5)),
    fecha: new Date().toISOString(),
  };
  const all = await readAll();
  all.unshift(t);
  await writeAll(all);
  return NextResponse.json(t, { status: 201 });
}

// DELETE — admin
export async function DELETE(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  await writeAll((await readAll()).filter(t => t.id !== id));
  return NextResponse.json({ ok: true });
}
