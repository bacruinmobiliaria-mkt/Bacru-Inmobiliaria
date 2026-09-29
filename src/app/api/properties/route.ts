import { NextResponse } from 'next/server';

// Sin caché: el sitio siempre lee lo último que guardó el panel
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { readProperties } from '@/lib/content';
import { PROPERTIES as STATIC } from '@/lib/data';

// GET /api/properties — public endpoint, returns active properties
// Reads from content/properties.json (admin edits), falls back to data.ts
export async function GET(req: Request) {
  try {
    const stored = await readProperties();
    const vendidas = new URL(req.url).searchParams.get('vendidas') === '1';

    // If admin has saved properties, use those
    if (stored && stored.length > 0) {
      const list = vendidas
        ? stored.filter(p => p.active === false)   // solo las marcadas como vendidas
        : stored.filter(p => p.active !== false);
      return NextResponse.json(list, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }
    if (vendidas) {
      // Sin datos del admin aún: no hay vendidas registradas
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
    }

    // Fallback to static data (first run before admin saves anything)
    return NextResponse.json(STATIC, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch {
    // If content.ts fails (e.g. file doesn't exist), use static data
    return NextResponse.json(STATIC, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
