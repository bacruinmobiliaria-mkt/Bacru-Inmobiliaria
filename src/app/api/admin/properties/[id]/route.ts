import { NextResponse } from 'next/server';
// Extrae lat/lng de cualquier URL de Google Maps para el mapa interactivo
function extractLatLng(mapsUrl: string): { lat: number; lng: number } | null {
  if (!mapsUrl) return null;
  const m = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
            mapsUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
            mapsUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : null;
}

// Resuelve links cortos de Google Maps en el servidor para poder extraer lat/lng
async function resolveShortMaps(url: string): Promise<string> {
  if (!url || !/goo\.gl|maps\.app/.test(url)) return url;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BacruBot/1.0)' },
      signal: AbortSignal.timeout(8000) });
    return res.url || url;
  } catch { return url; }
}

import { readProperties, writeProperties, verifyToken, getTokenFromRequest, ContentProperty } from '@/lib/content';

// GET /api/admin/properties/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const props = await readProperties();
  const p = props.find(x => x.id === params.id);
  if (!p) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json(p);
}

// PUT /api/admin/properties/[id] — full update
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json() as Partial<ContentProperty>;
    const resolvedMaps = await resolveShortMaps(String((body as {mapsUrl?:string}).mapsUrl || ''));
    if (resolvedMaps) (body as {mapsUrl?:string}).mapsUrl = resolvedMaps;
    const props = await readProperties();
    const idx = props.findIndex(x => x.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

    const coords = extractLatLng(resolvedMaps);
    const updated: ContentProperty = {
      ...props[idx],
      ...body,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      id:        params.id,
      updatedAt: new Date().toISOString(),
    };
    props[idx] = updated;
    await writeProperties(props);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error al actualizar' }, { status: 500 });
  }
}

// PATCH /api/admin/properties/[id] — partial update (e.g., toggle active)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const patch = await req.json() as Partial<ContentProperty>;
    const props = await readProperties();
    const idx = props.findIndex(x => x.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

    props[idx] = { ...props[idx], ...patch, updatedAt: new Date().toISOString() };
    await writeProperties(props);
    return NextResponse.json(props[idx]);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error al actualizar' }, { status: 500 });
  }
}

// DELETE /api/admin/properties/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const props = await readProperties();
  const filtered = props.filter(x => x.id !== params.id);
  if (filtered.length === props.length) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  await writeProperties(filtered);
  return NextResponse.json({ deleted: params.id });
}
