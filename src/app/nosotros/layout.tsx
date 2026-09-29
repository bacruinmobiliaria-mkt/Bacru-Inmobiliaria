import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Sobre Nosotros | Bacru Inmobiliaria Hidalgo',
  description: '4 años en Hidalgo, +80 familias atendidas. Certeza jurídica y servicio honesto en Tezontepec de Aldama.',
  openGraph: { title:'Sobre Nosotros | Bacru Inmobiliaria Hidalgo', description:'4 años en Hidalgo, +80 familias atendidas. Certeza jurídica y servicio honesto en Tezontepec de Aldama.', type:'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
