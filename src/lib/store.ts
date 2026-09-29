// ─── Capa de almacenamiento ───────────────────────────────────────────
// PRODUCCIÓN (Vercel): guarda en Upstash Redis (base de datos en la nube),
//   así los cambios del panel Admin se ven en TODOS los dispositivos.
// LOCAL (npm run dev, sin variables de Redis): usa content/*.json como antes.
//
// Variables que reconoce (las crea Vercel al conectar Upstash):
//   KV_REST_API_URL + KV_REST_API_TOKEN   (o)
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

const URL_ =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const hasDatabase = !!(URL_ && TOKEN);
const redis = hasDatabase ? new Redis({ url: URL_, token: TOKEN }) : null;

const PREFIX = 'bacru:';

function filePath(key: string) {
  return path.join(process.cwd(), 'content', `${key}.json`);
}

/** Lee una colección. Si no existe todavía devuelve `fallback`. */
export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  if (redis) {
    const v = await redis.get<T>(PREFIX + key);
    return v === null || v === undefined ? fallback : v;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath(key), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

/** Guarda una colección completa. */
export async function setJSON<T>(key: string, value: T): Promise<void> {
  if (redis) {
    await redis.set(PREFIX + key, value);
    return;
  }
  // Sin base de datos en Vercel el disco es de solo lectura: avisamos claro.
  if (process.env.VERCEL) {
    throw new Error(
      'Falta conectar la base de datos (Upstash Redis). Revisa la guía DEPLOY-VERCEL.md'
    );
  }
  const file = filePath(key);
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}
