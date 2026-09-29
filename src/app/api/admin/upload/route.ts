import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/content';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper: convert Google Drive share URL to direct image URL
function convertGDriveUrl(url: string): string {
  // Pattern: https://drive.google.com/file/d/FILE_ID/view?...
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  // Pattern: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && url.includes('drive.google.com')) {
    return `https://drive.google.com/uc?export=view&id=${match2[1]}`;
  }
  return url;
}

// POST /api/admin/upload — upload an image file OR process a URL
export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';

  // ── Subida directa a Vercel Blob (el navegador sube el archivo, no el servidor) ──
  //    El propio SDK usa JSON con `type: 'blob.*'`; la autenticación va en clientPayload.
  if (contentType.includes('application/json')) {
    let body: unknown = null;
    try { body = await req.clone().json(); } catch { /* se maneja abajo */ }
    const bType = (body as { type?: unknown } | null)?.type;
    if (typeof bType === 'string' && bType.startsWith('blob.')) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ error: 'Vercel Blob no está conectado' }, { status: 501 });
      }
      try {
        const json = await handleUpload({
          body: body as HandleUploadBody,
          request: req,
          onBeforeGenerateToken: async (_pathname, clientPayload) => {
            if (!clientPayload || !verifyToken(clientPayload)) throw new Error('No autorizado');
            return {
              allowedContentTypes: [
                'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
                'video/mp4', 'video/webm', 'video/quicktime',
              ],
              maximumSizeInBytes: 100 * 1024 * 1024,
              addRandomSuffix: true,
            };
          },
          onUploadCompleted: async () => { /* nada extra: la URL ya la recibe el navegador */ },
        });
        return NextResponse.json(json);
      } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error al subir' }, { status: 400 });
      }
    }
  }

  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // ── URL processing (JSON body) ─────────────────────────────
  if (contentType.includes('application/json')) {
    try {
      const { url } = await req.json() as { url: string };
      if (!url?.trim()) return NextResponse.json({ error: 'URL vacía' }, { status: 400 });
      const processedUrl = convertGDriveUrl(url.trim());
      return NextResponse.json({ url: processedUrl, type: 'url' });
    } catch {
      return NextResponse.json({ error: 'Error procesando URL' }, { status: 400 });
    }
  }

  // ── File upload (multipart) — solo desarrollo local; en Vercel el disco es de solo lectura ──
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Conecta Vercel Blob para subir archivos (ver DEPLOY-VERCEL.md)' }, { status: 501 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 });

    // Imágenes y videos (vertical u horizontal)
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Solo se permiten imágenes o videos' }, { status: 400 });
    }

    // Límites: 10MB imágenes · 80MB videos
    const maxSize = isVideo ? 80 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: isVideo ? 'Video demasiado grande (máx 80MB). Comprime el video o súbelo a YouTube y pega el link.' : 'Imagen demasiado grande (máx 10MB)' }, { status: 400 });
    }

    // Create upload dir if needed
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
    const validExts = isVideo ? ['mp4','webm','mov','m4v'] : ['jpg','jpeg','png','webp','gif'];
    if (!validExts.includes(ext)) return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 });

    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .slice(0, 40);
    const filename = `${safeName}-${timestamp}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, filename, type: 'upload' });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
  }
}
