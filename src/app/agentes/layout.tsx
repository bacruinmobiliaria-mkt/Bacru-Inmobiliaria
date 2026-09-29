import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Asesores en Hidalgo | Bacru Inmobiliaria',
  description: '8 asesores especializados en Mixquiahuala, Tezontepec, Pachuca y más. Uno de ellos dedicado a tu proceso.',
  openGraph: { title:'Asesores en Hidalgo | Bacru Inmobiliaria', description:'8 asesores especializados en Mixquiahuala, Tezontepec, Pachuca y más. Uno de ellos dedicado a tu proceso.', type:'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
