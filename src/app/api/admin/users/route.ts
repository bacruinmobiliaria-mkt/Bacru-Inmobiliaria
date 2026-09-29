import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/content';
import { getJSON, setJSON } from '@/lib/store';

const KEY = 'admins';

export interface AdminUser {
  email: string;
  name: string;
  location: string;   // zona/municipio donde opera
  phone?: string;
  addedAt: string;
  addedBy: string;
}

async function readUsers(): Promise<AdminUser[]> {
  try { return await getJSON<AdminUser[]>(KEY, []); } catch { return []; }
}

async function writeUsers(users: AdminUser[]) {
  await setJSON(KEY, users);
}

// GET — list all users (token required)
export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(await readUsers());
}

// POST — add new asesor (only token required — already authenticated)
export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { email, name, location, phone, requesterEmail } = await req.json() as {
      email: string; name: string; location: string; phone?: string; requesterEmail: string;
    };

    if (!email?.includes('@')) return NextResponse.json({ error: 'Correo electrónico inválido' }, { status: 400 });
    if (!name?.trim())         return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    if (!location?.trim())     return NextResponse.json({ error: 'La ubicación es requerida' }, { status: 400 });

    const users = await readUsers();
    const envEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase()) ||
                   email.toLowerCase() === envEmail;

    if (exists) return NextResponse.json({ error: 'Este correo ya tiene acceso al panel' }, { status: 409 });

    const newUser: AdminUser = {
      email:     email.trim().toLowerCase(),
      name:      name.trim(),
      location:  location.trim(),
      phone:     phone?.trim() || '',
      addedAt:   new Date().toISOString(),
      addedBy:   requesterEmail,
    };
    users.push(newUser);
    await writeUsers(users);
    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE — remove asesor (token required)
export async function DELETE(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { email } = await req.json() as { email: string };
    const users = (await readUsers()).filter(u => u.email !== email.toLowerCase());
    await writeUsers(users);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
