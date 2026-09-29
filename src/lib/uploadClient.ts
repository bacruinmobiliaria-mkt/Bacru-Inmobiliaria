// Subida de archivos desde el panel Admin.
//  · En Vercel: sube DIRECTO a Vercel Blob (sin pasar por el servidor, así
//    no hay límite de 4.5 MB y sirven fotos y videos grandes).
//  · En local (sin Blob configurado): usa la ruta antigua que guarda en /public/uploads.
import { upload } from '@vercel/blob/client';

export interface UploadResult { ok: boolean; url?: string; error?: string }

export async function uploadFile(file: File, token: string): Promise<UploadResult> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  let blobError = '';
  try {
    const blob = await upload(`bacru/${Date.now()}-${safe}`, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload',
      clientPayload: token,
    });
    return { ok: true, url: blob.url };
  } catch (e) {
    blobError = e instanceof Error ? e.message : 'Error al subir';
  }

  // Respaldo (desarrollo local sin Blob)
  try {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.url) return { ok: true, url: d.url };
    return { ok: false, error: d.error || blobError || 'Error al subir' };
  } catch {
    return { ok: false, error: blobError || 'Error de red al subir' };
  }
}
