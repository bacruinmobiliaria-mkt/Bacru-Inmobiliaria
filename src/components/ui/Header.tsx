'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWipe } from '@/components/ui/PageWipe';

const LINKS = [
  { href:'/comprar',  label:'Comprar',  sub:'Catálogo completo' },
  { href:'/mapa',     label:'Mapa',     sub:'Explora por zona' },
  { href:'/vender',   label:'Vender',   sub:'Valuación gratuita' },
  { href:'/creditos', label:'Créditos', sub:'INFONAVIT · FOVISSSTE' },
  { href:'/agentes',  label:'Agentes',  sub:'Tu asesor por zona' },
  { href:'/nosotros', label:'Nosotros', sub:'4 años · 80+ familias' },
  { href:'/contacto', label:'Contacto', sub:'Respuesta en 1 hora' },
];

export default function Header() {
  const wipe = useWipe();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive:true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Barra */}
      <header className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-500
        ${open ? 'bg-transparent' : scrolled ? 'bg-black/85 backdrop-blur-md border-b border-white/8' : 'bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={()=>setOpen(false)}>
            <Image src="/images/logo-nobg.png" alt="Bacru" width={34} height={34} className="object-contain"/>
            <span className="font-display font-extrabold tracking-[3px] text-sm text-white">BACRU</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <a href="https://wa.me/527736801410?text=Hola%20Bacru!%20Quiero%20informes."
              target="_blank" rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] font-display font-bold tracking-widest uppercase text-white/70 hover:text-gold transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              773 680 1410
            </a>
            <button onClick={()=>setOpen(o=>!o)} aria-label="Menú"
              className="relative z-[90] flex items-center gap-2.5 text-white group">
              <span className="hidden sm:block text-[11px] font-display font-bold tracking-[3px] uppercase">
                {open ? 'Cerrar' : 'Menú'}
              </span>
              <span className="relative w-9 h-9 rounded-full border border-white/25 flex flex-col items-center justify-center gap-[5px] group-hover:border-gold transition-colors">
                <span className={`block w-4 h-px bg-white transition-all duration-300 ${open?'rotate-45 translate-y-[3px]':''}`}/>
                <span className={`block w-4 h-px bg-white transition-all duration-300 ${open?'-rotate-45 -translate-y-[3px]':''}`}/>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay fullscreen */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] bg-[#0A0A0A] grain overflow-y-auto"
            initial={{ clipPath:'circle(0% at calc(100% - 60px) 40px)' }}
            animate={{ clipPath:'circle(150% at calc(100% - 60px) 40px)' }}
            exit={{ clipPath:'circle(0% at calc(100% - 60px) 40px)' }}
            transition={{ duration:.7, ease:[0.76,0,0.24,1] }}>
            <div className="relative min-h-full flex flex-col justify-between max-w-[1400px] mx-auto px-6 sm:px-10 pt-28 pb-10">
              {/* Links gigantes */}
              <nav className="flex-1 flex flex-col justify-center">
                {LINKS.map((l, i) => (
                  <motion.div key={l.href}
                    initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }}
                    transition={{ delay:.25 + i*.06, duration:.7, ease:[0.16,1,0.3,1] }}
                    className="border-b border-white/8">
                    <a href={l.href}
                      className="group flex items-baseline justify-between py-3 sm:py-4 cursor-pointer"
                      onClick={(e)=>{ e.preventDefault(); setOpen(false); wipe(l.href); }}>
                      <span className="flex items-baseline gap-4 sm:gap-6">
                        <span className="font-display text-gold/40 text-xs sm:text-sm">0{i+1}</span>
                        <span className={`font-serif font-bold text-4xl sm:text-6xl lg:text-7xl leading-none transition-colors duration-300
                          ${pathname===l.href ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                          {l.label}
                        </span>
                      </span>
                      <span className="hidden sm:flex items-center gap-3">
                        <span className="text-white/30 text-xs font-body opacity-0 group-hover:opacity-100 transition-opacity duration-300">{l.sub}</span>
                        <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-300">
                          <svg className="w-3.5 h-3.5 -rotate-45" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      </span>
                    </a>
                  </motion.div>
                ))}
              </nav>

              {/* Pie del menú */}
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7}}
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-8">
                <div>
                  <p className="text-white/30 text-[10px] font-display font-bold tracking-[3px] uppercase mb-2">Contacto directo</p>
                  <a href="tel:+527736801410" className="block text-white/80 hover:text-gold text-lg font-display font-bold transition-colors">773 680 1410</a>
                  <a href="mailto:ventasbacru@gmail.com" className="block text-white/50 hover:text-gold text-sm transition-colors">ventasbacru@gmail.com</a>
                </div>
                <div className="flex gap-5">
                  {[['Facebook','https://www.facebook.com/groups/362635336445117/user/61574716520823'],
                    ['Instagram','https://www.instagram.com/rf__inmobiliaria/'],
                    ['TikTok','https://www.tiktok.com/@rf__inmobiliaria']].map(([n,h])=>(
                    <a key={n} href={h} target="_blank" rel="noreferrer"
                      className="text-white/40 hover:text-gold text-xs font-display font-bold tracking-widest uppercase link-line transition-colors">{n}</a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
