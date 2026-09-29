// ─── TEAM ─────────────────────────────────────────────────────
export interface Agent {
  id: string;
  name: string;
  role: string;
  whatsapp: string;
  zones: string[];
  photo: string;
  specialty?: string;
}

export const AGENTS: Agent[] = [
  { id:'eros',   name:'Eros Atzin Martínez',     role:'Asesor & Marketing',   whatsapp:'527731781212', zones:['Pachuca'],                                        photo:'/images/team/eros-nobg.png',   specialty:'Marketing Digital' },
  { id:'edwin',  name:'Edwin Orta',               role:'Asesor de Ventas',     whatsapp:'527736801410', zones:['Tepatepec','San Antonio'],                         photo:'/images/team/edwin-nobg.png',  specialty:'Zona Tepatepec' },
  { id:'karla',  name:'Karla Orta',               role:'Asesor de Ventas',     whatsapp:'527736801410', zones:['Tepatepec','San Antonio'],                         photo:'/images/team/karla-nobg.png',  specialty:'Zona Tepatepec' },
  { id:'rosita', name:'Rosita',                   role:'Asesor de Ventas',     whatsapp:'527296240225', zones:['Mixquiahuala','Progreso de Obregón'], photo:'/images/team/rosita-nobg.png', specialty:'Zona Valle' },
  { id:'miguel', name:'Miguel Bautista Skinfield', role:'Asesor de Ventas',    whatsapp:'527713487524', zones:['Pachuca'],                                         photo:'/images/team/miguel-nobg.png', specialty:'Zona Pachuca' },
  { id:'carlos', name:'Carlos Orta',              role:'Director General',     whatsapp:'527736801410', zones:['Todas'],                                           photo:'/images/team/carlos-nobg.png', specialty:'Dirección & Estrategia' },
  { id:'jose',   name:'José Antonio Bautista',    role:'Asesor de Ventas',     whatsapp:'527711551965', zones:['Pachuca'],                                         photo:'/images/team/jose-nobg.png',   specialty:'Zona Pachuca' },
  { id:'teo',    name:'Teo',                      role:'Asesor de Ventas',     whatsapp:'527711162801', zones:['Pachuca'],                                         photo:'/images/team/teo-nobg.png',    specialty:'Catálogo Digital' },
];

// Agent routing by zone
export function getAgentForZone(zone: string): Agent {
  const z = zone.toLowerCase();
  if (z.includes('pachuca') || z.includes('pachuquilla')) return AGENTS.find(a => a.id === 'eros')!;
  if (z.includes('tepatepec') || z.includes('san antonio')) return AGENTS.find(a => a.id === 'edwin')!;
  if (z.includes('mixquiahuala') || z.includes('tezontepec') || z.includes('progreso')) return AGENTS.find(a => a.id === 'rosita')!;
  if (z.includes('tulancingo')) return AGENTS.find(a => a.id === 'jose')!;
  return AGENTS.find(a => a.id === 'carlos')!; // Director for other zones
}

// ─── PROPERTIES ───────────────────────────────────────────────
export interface Property {
  slug: string;
  id: number;
  name: string;
  type: 'casa_hecha' | 'personalizable' | 'terreno' | 'departamento';
  price: number;
  zone: string;
  beds: number;
  baths: number;
  buildM2: number;
  landM2: number;
  badge: string;
  badgeColor: string;
  nearby: string;
  description: string;
  financing: string[];
  images: string[];
  videos?: string[];   // mp4 subidos o embeds de YouTube (vertical u horizontal)
  lat?: number;
  lng?: number;
  address?: string;
  agentId: string;
  featured?: boolean;
}

export const PROPERTIES: Property[] = [
  {
    id:1, slug:'casa-familiar-valle-verde',
    lat:20.2314, lng:-99.1528, address:'Mixquiahuala de Juárez, Hidalgo, México',
    name:'Casa Familiar Valle Verde', type:'casa_hecha',
    price:1350000, zone:'Mixquiahuala', beds:3, baths:2, buildM2:95, landM2:140,
    badge:'Entrega Inmediata', badgeColor:'bg-green-600',
    nearby:'Escuela primaria, Plaza comercial, Parque infantil',
    description:'Hermosa casa de 3 recámaras con acabados de calidad, cocina equipada y jardín trasero. Fraccionamiento cerrado con vigilancia 24/7.',
    financing:['INFONAVIT','Bancario','Contado'], images:['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=82&auto=format&fit=crop'],
    agentId:'rosita', featured:true,
  },
  {
    id:2, slug:'villa-san-antonio',
    lat:20.1968, lng:-99.3102, address:'Tepatepec, Francisco I. Madero, Hidalgo, México',
    name:'Villa San Antonio Plus', type:'personalizable',
    price:1850000, zone:'Tepatepec', beds:3, baths:2, buildM2:120, landM2:180,
    badge:'Personalizable', badgeColor:'bg-gold',
    nearby:'Iglesia, Mercado municipal, Escuelas',
    description:'Diseña tu casa a tu gusto. Planos flexibles, materiales de primera y seguimiento de obra en tiempo real con tu asesor.',
    financing:['INFONAVIT','FOVISSSTE','Bancario','Contado'], images:['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1400&q=82&auto=format&fit=crop'],
    agentId:'edwin',
  },
  {
    id:3, slug:'terreno-premium-tezontepec',
    lat:20.1014, lng:-99.2338, address:'Tezontepec de Aldama, Hidalgo, México',
    name:'Terreno Premium Tezontepec', type:'terreno',
    price:1100000, zone:'Tezontepec', beds:0, baths:0, buildM2:0, landM2:250,
    badge:'Alta Plusvalía', badgeColor:'bg-gold-dark',
    nearby:'Centro de Tezontepec, Presidencia, Escuelas',
    description:'Terreno de esquina en zona de alta demanda. Ideal para casa habitación o inversión. Escrituras limpias y servicios completos.',
    financing:['Bancario','Contado'], images:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&q=82&auto=format&fit=crop'],
    agentId:'rosita',
  },
  {
    id:4, slug:'residencial-diamante-pachuca',
    lat:20.1011, lng:-98.7591, address:'Pachuca de Soto, Hidalgo, México',
    name:'Residencial Diamante Pachuca', type:'casa_hecha',
    price:3800000, zone:'Pachuca', beds:4, baths:3, buildM2:200, landM2:260,
    badge:'Premium', badgeColor:'bg-gold',
    nearby:'Hospital IMSS, Universidades, Centros comerciales, CAAP',
    description:'Residencia de lujo con acabados de autor, sala familiar, roof garden, cochera doble y cuarto de servicio. Zona residencial exclusiva.',
    financing:['Bancario','Contado'], images:['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&q=82&auto=format&fit=crop'],
    agentId:'eros', featured:true,
  },
  {
    id:5, slug:'casa-progreso-familiar',
    lat:20.2503, lng:-99.0111, address:'Progreso de Obregón, Hidalgo, México',
    name:'Casa Progreso Familiar', type:'casa_hecha',
    price:1680000, zone:'Progreso de Obregón', beds:3, baths:2, buildM2:110, landM2:165,
    badge:'Entrega Inmediata', badgeColor:'bg-green-600',
    nearby:'Plaza principal, Mercado, Escuela secundaria',
    description:'Casa lista para entregar con 3 recámaras amplias, sala-comedor integrado y patio de servicio. Lista para crédito FOVISSSTE.',
    financing:['FOVISSSTE','Bancario','Contado'], images:['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1400&q=82&auto=format&fit=crop'],
    agentId:'rosita',
  },
  {
    id:6, slug:'casa-ejecutiva-pachuca-norte',
    lat:20.1219, lng:-98.7231, address:'Pachuca de Soto Norte, Hidalgo, México',
    name:'Casa Ejecutiva Pachuca Norte', type:'casa_hecha',
    price:2800000, zone:'Pachuca', beds:4, baths:3, buildM2:165, landM2:200,
    badge:'Nuevo', badgeColor:'bg-blue-600',
    nearby:'Parque La Presa, Galerías, Escuelas privadas',
    description:'Casa ejecutiva en fraccionamiento privado con acceso controlado. Cocina integral, 2 cocheras, jardín y área de BBQ.',
    financing:['Bancario','Contado'], images:['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=1400&q=82&auto=format&fit=crop'],
    agentId:'miguel',
  },
  {
    id:7, slug:'casa-personalizable-mixquiahuala',
    lat:20.2389, lng:-99.1614, address:'Mixquiahuala de Juárez Centro, Hidalgo, México',
    name:'Casa Personalizable Mixquiahuala', type:'personalizable',
    price:1250000, zone:'Mixquiahuala', beds:2, baths:2, buildM2:80, landM2:120,
    badge:'Personalizable', badgeColor:'bg-gold',
    nearby:'Centro de Mixquiahuala, Mercado, Transporte público',
    description:'Casa de 2 recámaras con opción de personalizar acabados y distribución. Entrega en 6 meses. Perfecta para primer hogar.',
    financing:['INFONAVIT','FOVISSSTE','Bancario','Contado'], images:['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1400&q=82&auto=format&fit=crop'],
    agentId:'rosita',
  },
  {
    id:8, slug:'departamento-smart-pachuca',
    lat:20.0938, lng:-98.754, address:'Pachuca de Soto, Hidalgo, México',
    name:'Departamento Smart Pachuca', type:'departamento',
    price:1950000, zone:'Pachuca', beds:2, baths:2, buildM2:85, landM2:85,
    badge:'Inversión', badgeColor:'bg-purple-600',
    nearby:'UAEH, Servicios, Transporte, Comercios',
    description:'Departamento moderno ideal para renta o vivienda propia. Amenidades: roof garden común, estacionamiento y cuarto de servicio.',
    financing:['Bancario','Contado'], images:['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=1400&q=82&auto=format&fit=crop','https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1400&q=82&auto=format&fit=crop'],
    agentId:'teo',
  },
];

// ─── ZONES ────────────────────────────────────────────────────
export const ZONES = [
  'Mixquiahuala','Tezontepec','Pachuca','Tepatepec',
  'San Antonio','Progreso de Obregón','Tulancingo','Pachuquilla','EdoMex','CDMX',
];

// ─── FINANCING ────────────────────────────────────────────────
export const FINANCING_OPTIONS = [
  { id:'infonavit',  label:'INFONAVIT',       icon:'Landmark', desc:'Usa tu ahorro del INFONAVIT sin dar enganche adicional. Aplica para trabajadores del sector privado.' },
  { id:'fovissste',  label:'FOVISSSTE',        icon:'Scale', desc:'Para trabajadores del gobierno federal y estatal. Tasas preferenciales.' },
  { id:'bancario',   label:'Crédito Bancario', icon:'Building2', desc:'Financiamiento con bancos líderes. Enganches desde 10%. Plazos de 5 a 20 años.' },
  { id:'contado',    label:'Contado',          icon:'Banknote', desc:'Pago único con descuentos especiales y escrituración inmediata.' },
];

// ─── STATS ────────────────────────────────────────────────────
export const STATS = [
  { value:'+80',   label:'Familias Atendidas', icon:'Home' },
  { value:'4',     label:'Años en el Mercado', icon:'CalendarDays' },
  { value:'20',    label:'Propiedades Activas', icon:'KeyRound' },
  { value:'100%',  label:'Certeza Jurídica',   icon:'Scale' },
];

// ─── TESTIMONIALS ─────────────────────────────────────────────
export const TESTIMONIALS = [
  { name:'Familia Rodríguez', zone:'Mixquiahuala', text:'Encontramos nuestra casa en menos de 2 semanas. Rosita nos guió en todo el proceso con INFONAVIT sin ningún problema.', rating:5, avatar:'🏠' },
  { name:'Carlos y María', zone:'Pachuca', text:'El proceso fue clarísimo. Nos explicaron todo paso a paso y nos ayudaron con los documentos. ¡Ya llevamos 1 año en nuestra casa!', rating:5, avatar:'⭐' },
  { name:'Familia Hernández', zone:'Tepatepec', text:'Personalizamos nuestra casa según nuestras necesidades. Edwin estuvo presente en toda la obra. Muy profesionales.', rating:5, avatar:'🌟' },
];

// Retorna el color de la etiqueta según el texto del badge
export function badgeColor(badge: string, fallback = 'bg-gold'): string {
  const b = (badge || '').toLowerCase();
  if (b.includes('preventa'))                      return 'bg-purple-600';
  if (b.includes('inversión') || b.includes('inversion')) return 'bg-purple-600';
  if (b.includes('entrega') || b.includes('inmediata'))   return 'bg-green-600';
  if (b.includes('nuevo') || b.includes('nueva')) return 'bg-blue-600';
  if (b.includes('premium'))                       return 'bg-gold';
  if (b.includes('personalizable'))                return 'bg-gold';
  return fallback;
}
