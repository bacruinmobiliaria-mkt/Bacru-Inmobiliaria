import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Compra Propiedades en Hidalgo | Bacru Inmobiliaria',
  description: 'Encuentra tu casa en Hidalgo con INFONAVIT, FOVISSSTE o bancario. Propiedades en Mixquiahuala, Tezontepec, Pachuca. Desde $1M MXN.',
  openGraph: { title:'Compra Propiedades en Hidalgo | Bacru Inmobiliaria', description:'Encuentra tu casa en Hidalgo con INFONAVIT, FOVISSSTE o bancario. Propiedades en Mixquiahuala, Tezontepec, Pachuca. Desde $1M MXN.', type:'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
