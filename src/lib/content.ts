// ─── Data layer de propiedades ─────────────────────────────────
// Lee/escribe en la base de datos (ver lib/store.ts). La primera vez
// (base vacía) se siembra con content/properties.json + lib/data.ts.

import { PROPERTIES as STATIC_PROPERTIES } from '@/lib/data';
import seedProperties from '../../content/properties.json';
import { getJSON, setJSON } from '@/lib/store';

export interface ContentProperty {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number;
  zone: string;
  beds: number;
  baths: number;
  buildM2: number;
  landM2: number;
  badge: string;
  badgeColor: string;
  description: string;
  nearby: string;
  financing: string[];
  images: string[];
  videos?: string[];
  address: string;
  lat: number;
  lng: number;
  agentId: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const KEY = 'properties';

export async function readProperties(): Promise<ContentProperty[]> {
  try {
    const stored = await getJSON<ContentProperty[] | null>(KEY, null);
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch (e) {
    console.error('readProperties:', e);
  }
  // Base vacía: sembrar con lo que trae el proyecto
  const seeded = (Array.isArray(seedProperties) && seedProperties.length > 0
    ? (seedProperties as unknown as ContentProperty[])
    : seedFromStatic());
  try { await writeProperties(seeded); } catch {}
  return seeded;
}

export async function writeProperties(props: ContentProperty[]): Promise<void> {
  await setJSON(KEY, props);
}

function seedFromStatic(): ContentProperty[] {
  return STATIC_PROPERTIES.map(p => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    type: p.type,
    price: p.price,
    zone: p.zone,
    beds: p.beds,
    baths: p.baths,
    buildM2: p.buildM2,
    landM2: p.landM2,
    badge: p.badge,
    badgeColor: p.badgeColor || 'bg-gold',
    description: p.description,
    nearby: p.nearby,
    financing: p.financing,
    images: p.images,
    address: p.address || `${p.zone}, Hidalgo, México`,
    lat: p.lat || 20.1011,
    lng: p.lng || -98.7591,
    agentId: p.agentId,
    featured: p.featured || false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

// ── Token validation ────────────────────────────────────────────
import { createHmac } from 'crypto';

export function makeToken(email: string): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('Falta ADMIN_SECRET');
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${email}:${expires}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export function verifyToken(token: string): string | null {
  try {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return null;
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 3) return null;
    const sig = parts.pop()!;
    const payload = parts.join(':');
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig !== expected) return null;
    const [email, expiresStr] = payload.split(':');
    if (Date.now() > Number(expiresStr)) return null;
    return email;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}
