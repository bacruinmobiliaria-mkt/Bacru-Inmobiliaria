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

// GET /api/admin/properties — list all properties
export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  return NextResponse.json(await readProperties());
}

// POST /api/admin/properties — create new property
export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await req.json() as Partial<ContentProperty>;
    const resolvedMaps = await resolveShortMaps(String((body as {mapsUrl?:string}).mapsUrl || ''));
    if (resolvedMaps) (body as {mapsUrl?:string}).mapsUrl = resolvedMaps;
    const props = await readProperties();

    const newProp: ContentProperty = {
      id:          body.id || `prop-${Date.now()}`,
      slug:        body.slug || `prop-${Date.now()}`,
      name:        body.name || '',
      type:        body.type || 'casa_hecha',
      price:       Number(body.price) || 0,
      zone:        body.zone || '',
      beds:        Number(body.beds) || 0,
      baths:       Number(body.baths) || 0,
      buildM2:     Number(body.buildM2) || 0,
      landM2:      Number(body.landM2) || 0,
      badge:       body.badge || 'Nuevo',
      badgeColor:  body.badgeColor || 'bg-gold',
      description: body.description || '',
      nearby:      body.nearby || '',
      financing:   body.financing || ['Contado'],
      images:      body.images || [],
      videos:      Array.isArray((body as {videos?:unknown}).videos) ? ((body as {videos:unknown[]}).videos as unknown[]).map(v=>String(v).slice(0,600)).slice(0,4) : [],
      address:     body.address || '',
      lat:         extractLatLng(resolvedMaps)?.lat ?? (Number(body.lat) || 20.1011),
      lng:         extractLatLng(resolvedMaps)?.lng ?? (Number(body.lng) || -98.7591),
      agentId:     body.agentId || 'carlos',
      featured:    body.featured || false,
      active:      true,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    const updated = [newProp, ...props];
    await writeProperties(updated);
    return NextResponse.json(newProp, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error al crear propiedad' }, { status: 500 });
  }
}
