import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/content';

export const dynamic = 'force-dynamic';

/*
  Resuelve links cortos de Google Maps (maps.app.goo.gl / goo.gl)
  siguiendo las redirecciones en el servidor, y devuelve la URL larga
  de la que sí se pueden extraer coordenadas y vista previa.
*/
export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { url } = await req.json() as { url: string };
    if (!url?.trim()) return NextResponse.json({ error: 'URL vacía' }, { status: 400 });
    const u = url.trim();
    if (!/goo\.gl|maps\.app/.test(u)) return NextResponse.json({ url: u });

    const res = await fetch(u, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BacruBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    // res.url es la URL final tras las redirecciones
    return NextResponse.json({ url: res.url || u });
  } catch {
    return NextResponse.json({ error: 'No se pudo resolver el link corto. Abre el link en tu navegador y copia la URL completa de la barra de direcciones.' }, { status: 422 });
  }
}
