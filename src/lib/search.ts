import { Property } from '@/lib/data';

/*
  Motor de búsqueda difusa estilo marketplace (Amazon / MercadoLibre):
  - Normaliza acentos y mayúsculas
  - Tokeniza la consulta y puntúa cada propiedad por coincidencias
    exactas, por prefijo y por similitud (distancia de edición)
  - Entiende números como presupuesto ("1.5m", "1500000", "un millón y medio" no,
    pero "1.5" o "1500000" sí) y palabras clave de tipo/zona/recámaras
  - Devuelve resultados ordenados por score; si no hay coincidencias fuertes,
    entrega "similares" para nunca dejar la página vacía
*/

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// Distancia de edición acotada (para tolerar errores de dedo: "pachuka" → "pachuca")
function editDist(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0]; dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[a.length];
}

const SINONIMOS: Record<string, string[]> = {
  casa: ['casa_hecha', 'casa', 'hogar', 'vivienda', 'residencia'],
  terreno: ['terreno', 'lote', 'predio', 'solar'],
  departamento: ['departamento', 'depa', 'depto', 'apartamento'],
  personalizable: ['personalizable', 'personalizada', 'a medida', 'custom'],
  recamara: ['recamara', 'recamaras', 'habitacion', 'habitaciones', 'cuarto', 'cuartos', 'dormitorio', 'dormitorios', 'rec'],
  alberca: ['alberca', 'piscina', 'pool'],
  jardin: ['jardin', 'patio', 'terraza', 'roof'],
};

function tokenMatchesText(token: string, text: string): number {
  // 3 = palabra exacta · 2 = prefijo · 1 = typo cercano · 0 = nada
  const words = text.split(/[^a-z0-9]+/);
  for (const w of words) {
    if (!w) continue;
    if (w === token) return 3;
    if (token.length >= 3 && w.startsWith(token)) return 2;
    if (token.length >= 4 && editDist(token, w) <= (token.length > 6 ? 2 : 1)) return 1;
  }
  return 0;
}

export interface SearchResult {
  property: Property;
  score: number;
}

export function searchProperties(query: string, props: Property[]): { exact: Property[]; similar: Property[] } {
  const q = norm(query);
  if (!q) return { exact: props, similar: [] };

  // Presupuesto en la consulta: "1.5m", "2 millones", "1500000"
  let budget = 0;
  const mMill = q.match(/(\d+(?:[.,]\d+)?)\s*(m\b|mill|millon|millones|mdp)/);
  const mNum = q.match(/\b(\d{6,9})\b/);
  if (mMill) budget = parseFloat(mMill[1].replace(',', '.')) * 1_000_000;
  else if (mNum) budget = parseInt(mNum[1]);

  // Recámaras: "3 recamaras", "3 rec"
  let beds = 0;
  const mBeds = q.match(/(\d)\s*(rec|recamara|habitacion|cuarto|dormitorio)/);
  if (mBeds) beds = parseInt(mBeds[1]);

  const tokens = q.split(/[^a-z0-9.]+/).filter(t => t.length >= 2 && !/^\d+$/.test(t) || (t.length >= 2 && isNaN(Number(t))));
  const cleanTokens = tokens.filter(t => !['de','la','el','en','con','una','un','que','para','por'].includes(t));

  const scored: SearchResult[] = props.map(p => {
    const hayName = norm(p.name);
    const hayZone = norm(p.zone);
    const hayType = norm(p.type.replace('_', ' '));
    const hayDesc = norm(`${p.description || ''} ${p.nearby || ''} ${p.badge || ''}`);
    let score = 0;

    for (const t of cleanTokens) {
      // sinónimos → tipo
      for (const [, syns] of Object.entries(SINONIMOS)) {
        if (syns.some(s => tokenMatchesText(t, norm(s)) >= 2)) {
          if (syns.includes(p.type) || syns.some(s => hayType.includes(norm(s)))) score += 4;
        }
      }
      const inName = tokenMatchesText(t, hayName);
      const inZone = tokenMatchesText(t, hayZone);
      const inType = tokenMatchesText(t, hayType);
      const inDesc = tokenMatchesText(t, hayDesc);
      score += inName * 3 + inZone * 4 + inType * 3 + inDesc * 1.5;
    }

    // Presupuesto: bonifica dentro del rango, penaliza suave si se pasa
    if (budget > 0) {
      if (p.price <= budget) score += 5;
      else if (p.price <= budget * 1.2) score += 2;  // hasta 20% arriba sigue siendo "parecido"
      else score -= 3;
    }
    // Recámaras: exacto o más
    if (beds > 0) {
      if (p.beds >= beds) score += 4;
      else if (p.beds === beds - 1) score += 1;
    }
    if (p.featured) score += 0.5;
    return { property: p, score };
  });

  const hasSignal = cleanTokens.length > 0 || budget > 0 || beds > 0;
  if (!hasSignal) return { exact: props, similar: [] };

  const sorted = scored.sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score ?? 0;

  // Umbral: coincidencia "real" necesita al menos un match fuerte
  const threshold = Math.max(4, maxScore * 0.45);
  const exact = sorted.filter(r => r.score >= threshold && r.score > 0).map(r => r.property);
  const similar = sorted.filter(r => r.score < threshold && r.score > 0).slice(0, 6).map(r => r.property);

  // Si nada puntúa, los "similares" son las destacadas
  if (exact.length === 0 && similar.length === 0) {
    return { exact: [], similar: [...props].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 6) };
  }
  return { exact, similar };
}

/* Sugerencias en vivo para el buscador del hero (autocompletado ligero) */
export function suggest(query: string, props: Property[], limit = 5): string[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const pool = new Set<string>();
  props.forEach(p => { pool.add(p.zone); pool.add(p.name); pool.add(p.type.replace('_', ' ')); });
  ['Casa con jardín', 'Terreno para construir', 'Casa 3 recámaras', 'Departamento céntrico'].forEach(s => pool.add(s));
  return Array.from(pool)
    .map(s => ({ s, m: tokenMatchesText(q.split(/\s+/)[0], norm(s)) }))
    .filter(x => x.m > 0 || norm(x.s).includes(q))
    .sort((a, b) => b.m - a.m)
    .slice(0, limit)
    .map(x => x.s);
}
