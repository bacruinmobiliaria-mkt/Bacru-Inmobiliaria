import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'INFONAVIT, FOVISSSTE y Bancario en Hidalgo | Bacru',
  description: 'Guía completa de créditos hipotecarios. Calculadora de mensualidad. Asesoría gratuita sin costo.',
  openGraph: { title:'INFONAVIT, FOVISSSTE y Bancario en Hidalgo | Bacru', description:'Guía completa de créditos hipotecarios. Calculadora de mensualidad. Asesoría gratuita sin costo.', type:'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
