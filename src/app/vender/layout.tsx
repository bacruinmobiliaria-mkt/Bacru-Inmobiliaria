import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Vende tu Propiedad en Hidalgo | Bacru Inmobiliaria',
  description: 'Valuación gratuita, compradores verificados y trámites incluidos. Vende rápido al mejor precio con Bacru Inmobiliaria.',
  openGraph: { title:'Vende tu Propiedad en Hidalgo | Bacru Inmobiliaria', description:'Valuación gratuita, compradores verificados y trámites incluidos. Vende rápido al mejor precio con Bacru Inmobiliaria.', type:'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
