import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Contacto | Bacru Inmobiliaria',
  description: 'Oficinas en Tezontepec de Aldama. WhatsApp 773 680 1410. Respondemos en menos de 1 hora.',
  openGraph: { title:'Contacto | Bacru Inmobiliaria', description:'Oficinas en Tezontepec de Aldama. WhatsApp 773 680 1410. Respondemos en menos de 1 hora.', type:'website' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
