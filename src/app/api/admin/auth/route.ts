import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { makeToken } from '@/lib/content';
import { getJSON } from '@/lib/store';

// El correo y la contraseña del admin viven SOLO en las variables de entorno
// de Vercel (ADMIN_EMAIL / ADMIN_PASSWORD). No existen en el código ni en GitHub.

async function getAllowedEmails(): Promise<string[]> {
  const emails: string[] = [];
  const main = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (main) emails.push(main);
  try {
    const users = await getJSON<{ email: string }[]>('admins', []);
    users.forEach(u => { if (u.email) emails.push(u.email.toLowerCase()); });
  } catch {}
  return emails;
}

// Comparación en tiempo constante (evita adivinar la contraseña midiendo tiempos)
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(req: Request) {
  try {
    const expectedPassword = (process.env.ADMIN_PASSWORD || '').trim();
    if (!expectedPassword || !process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'El panel no está configurado. Agrega ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_SECRET en Vercel.' },
        { status: 503 }
      );
    }

    const { email, password } = await req.json() as { email: string; password: string };
    if (!email || !password) return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 });

    const allowedEmails = await getAllowedEmails();
    const emailMatch    = allowedEmails.includes(email.trim().toLowerCase());
    const passwordMatch = safeEqual(password.trim(), expectedPassword);

    if (!emailMatch || !passwordMatch) {
      await new Promise(r => setTimeout(r, 600));
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    const token = makeToken(email.trim().toLowerCase());
    return NextResponse.json({ token, email: email.trim().toLowerCase(), name: 'Admin Bacru' });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
