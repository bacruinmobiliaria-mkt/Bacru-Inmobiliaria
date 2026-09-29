import { MetadataRoute } from 'next';
const BASE = 'https://bacroinmobiliaria.com';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url:`${BASE}/`,          lastModified:new Date(), changeFrequency:'daily',   priority:1.0 },
    { url:`${BASE}/comprar`,   lastModified:new Date(), changeFrequency:'daily',   priority:0.9 },
    { url:`${BASE}/mapa`,      lastModified:new Date(), changeFrequency:'daily',   priority:0.8 },
    { url:`${BASE}/vender`,    lastModified:new Date(), changeFrequency:'weekly',  priority:0.8 },
    { url:`${BASE}/agentes`,   lastModified:new Date(), changeFrequency:'weekly',  priority:0.8 },
    { url:`${BASE}/creditos`,  lastModified:new Date(), changeFrequency:'monthly', priority:0.7 },
    { url:`${BASE}/nosotros`,  lastModified:new Date(), changeFrequency:'monthly', priority:0.6 },
    { url:`${BASE}/contacto`,  lastModified:new Date(), changeFrequency:'monthly', priority:0.7 },
  ];
}
