import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import SiteWrapper from "@/components/ui/SiteWrapper";
import Script from "next/script";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#D4AF37',
};

const BASE = 'https://bacroinmobiliaria.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Bacru Inmobiliaria | Casas y Terrenos en Hidalgo",
    template: "%s | Bacru Inmobiliaria",
  },
  description:
    "Compra y vende propiedades en Hidalgo, EdoMex y CDMX con Bacru Inmobiliaria. INFONAVIT · FOVISSSTE · Crédito bancario. +80 familias atendidas en Mixquiahuala, Tezontepec y Pachuca. Asesoría gratuita.",
  keywords: [
    "casas en venta Hidalgo","terrenos Mixquiahuala","casas Pachuca INFONAVIT",
    "inmobiliaria Tezontepec","casas Progreso de Obregón","FOVISSSTE Hidalgo",
    "comprar casa Hidalgo","Bacru Inmobiliaria","rf inmobiliaria",
  ].join(", "),
  authors: [{ name:"Bacru Inmobiliaria", url:BASE }],
  robots: { index:true, follow:true },
  openGraph: {
    type:"website", locale:"es_MX", url:BASE,
    siteName:"Bacru Inmobiliaria",
    title:"Bacru Inmobiliaria | Casas y Terrenos en Hidalgo",
    description:"Compra y vende en Hidalgo sin estrés. INFONAVIT · FOVISSSTE · Bancario. +80 familias.",
  },
};

const schema = {
  "@context":"https://schema.org","@type":"RealEstateAgent",
  name:"Bacru Inmobiliaria",url:BASE,telephone:"+527736801410",
  email:"ventasbacru@gmail.com",
  address:{"@type":"PostalAddress",addressLocality:"Tezontepec de Aldama",addressRegion:"Hidalgo",addressCountry:"MX"},
  areaServed:["Mixquiahuala","Tezontepec","Pachuca","Progreso de Obregón","Tepatepec","Hidalgo","EdoMex"],
  priceRange:"$1,000,000 MXN - $12,000,000 MXN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        <link rel="icon" href="/images/logo-nobg.png" type="image/png"/>
        <meta name="geo.region" content="MX-HID"/>
      </head>
      <body>
        <Script id="schema" type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
        <LanguageProvider>
          <SiteWrapper>{children}</SiteWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
