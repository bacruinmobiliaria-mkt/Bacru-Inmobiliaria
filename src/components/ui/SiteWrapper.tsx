'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import ChatbotFloat from '@/components/ui/ChatbotFloat';
import Cursor from '@/components/ui/Cursor';
import ScrollFX from '@/components/ui/ScrollFX';
import PageWipe from '@/components/ui/PageWipe';

export default function SiteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Admin pages: completely isolated — no site header, no footer, no floats
  if (isAdmin) {
    return <>{children}</>;
  }

  // Normal pages: full site chrome
  return (
    <PageWipe>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <ChatbotFloat />
      <Cursor />
      <ScrollFX />
    </PageWipe>
  );
}
