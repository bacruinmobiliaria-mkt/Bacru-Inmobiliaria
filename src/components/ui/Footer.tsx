import Image from 'next/image';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

const FB = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const IG = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const TT = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-[#0A0A0A] grain overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"/>

      {/* CTA gigante */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-10">
        <div className="mb-14 sm:mb-20">
          <p className="text-gold text-[11px] font-display font-bold tracking-[4px] uppercase mb-4">¿Listo para empezar?</p>
          <Link href="/contacto" className="group inline-block">
            <span className="font-serif font-bold text-white text-5xl sm:text-7xl lg:text-8xl leading-[0.95] block group-hover:text-gold transition-colors duration-500">
              Hablemos<span className="text-gold">.</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/contacto"
              className="btn-hero gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-7 py-3.5 rounded-full">
              Consulta gratuita
            </Link>
            <a href="https://wa.me/527736801410?text=Hola%20Bacru!" target="_blank" rel="noreferrer"
              className="border border-white/20 text-white/80 hover:border-gold hover:text-gold font-display font-bold text-xs uppercase tracking-[2px] px-7 py-3.5 rounded-full transition-colors">
              WhatsApp directo
            </a>
          </div>
        </div>

        {/* Columnas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/images/logo-nobg.png" alt="Bacru" width={42} height={42} className="object-contain"/>
              <div>
                <p className="font-display font-extrabold text-gold text-sm tracking-[2px]">BACRU</p>
                <p className="font-display text-white/40 text-[10px] tracking-[3px]">INMOBILIARIA</p>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-[220px]">
              Casas, terrenos y asesoría de crédito en Hidalgo, EdoMex y CDMX. 4 años · 80+ familias.
            </p>
          </div>

          <div>
            <p className="text-white/30 text-[10px] font-display font-bold tracking-[3px] uppercase mb-4">Explorar</p>
            {[['Comprar','/comprar'],['Mapa','/mapa'],['Vender','/vender'],['Créditos','/creditos'],['Agentes','/agentes']].map(([l,h])=>(
              <Link key={h} href={h} className="block text-white/55 hover:text-gold text-sm mb-2 transition-colors w-fit link-line">{l}</Link>
            ))}
          </div>

          <div>
            <p className="text-white/30 text-[10px] font-display font-bold tracking-[3px] uppercase mb-4">Contacto</p>
            <a href="tel:+527736801410" className="flex items-center gap-2 text-white/55 hover:text-gold text-sm mb-2 transition-colors"><Phone className="w-3.5 h-3.5 text-gold/60"/>773 680 1410</a>
            <a href="mailto:ventasbacru@gmail.com" className="flex items-center gap-2 text-white/55 hover:text-gold text-sm mb-2 transition-colors"><Mail className="w-3.5 h-3.5 text-gold/60"/>ventasbacru@gmail.com</a>
            <p className="flex items-center gap-2 text-white/55 text-sm mb-2"><MapPin className="w-3.5 h-3.5 text-gold/60"/>Tezontepec de Aldama, Hgo.</p>
            <p className="flex items-center gap-2 text-white/35 text-xs"><Clock className="w-3 h-3"/>Lun–Vie 9–18h · Sáb 9–14h</p>
          </div>

          <div>
            <p className="text-white/30 text-[10px] font-display font-bold tracking-[3px] uppercase mb-4">Síguenos</p>
            <div className="flex gap-2.5 mb-5">
              {[
                { href:'https://www.facebook.com/groups/362635336445117/user/61574716520823', icon:<FB/>, l:'Facebook' },
                { href:'https://www.instagram.com/rf__inmobiliaria/', icon:<IG/>, l:'Instagram' },
                { href:'https://www.tiktok.com/@rf__inmobiliaria', icon:<TT/>, l:'TikTok' },
              ].map(s=>(
                <a key={s.l} href={s.href} target="_blank" rel="noreferrer" aria-label={s.l}
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:bg-gold hover:text-black hover:border-gold transition-all duration-300">
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10" style={{height:110}}>
              <iframe src="https://maps.google.com/maps?q=Tezontepec+de+Aldama,+Hidalgo,+Mexico&t=m&z=12&output=embed"
                width="100%" height="100%" style={{border:0,display:'block',filter:'grayscale(1) invert(0.9)'}}
                loading="lazy" title="Bacru — oficina"/>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-[11px]">© {year} Bacru Inmobiliaria · Todos los derechos reservados</p>
          <div className="flex items-center gap-5">
            <Link href="/aviso-privacidad" className="text-white/25 hover:text-gold text-[11px] transition-colors">Aviso de Privacidad</Link>
            <Link href="/admin"
              className="flex items-center gap-1.5 bg-gold/8 border border-gold/25 text-gold/70 hover:text-gold hover:border-gold/50 text-[11px] font-display font-semibold px-3.5 py-1.5 rounded-full transition-all">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 012 2v1h2a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h2V3a2 2 0 012-2zm0 1.5a.5.5 0 00-.5.5v1h1V3a.5.5 0 00-.5-.5zM5 6v7h6V6H5z"/></svg>
              Acceso Asesores
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
