'use client';
import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/*
  PageWipe — transición de "limpieza" entre páginas.
  Una cortina negra con borde dorado barre la pantalla de abajo hacia arriba,
  cambia la ruta a mitad del barrido y se retira revelando la página nueva.
*/

const WipeContext = createContext<(href: string) => void>(() => {});
export const useWipe = () => useContext(WipeContext);

export default function PageWipe({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [wiping, setWiping] = useState(false);
  const [label, setLabel] = useState('');
  const target = useRef<string | null>(null);

  const navigate = useCallback((href: string) => {
    if (href === pathname) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(href); return;
    }
    target.current = href;
    // Etiqueta de la página destino para mostrar durante el barrido
    const names: Record<string, string> = {
      '/': 'Inicio', '/comprar': 'Comprar', '/mapa': 'Mapa', '/vender': 'Vender',
      '/creditos': 'Créditos', '/agentes': 'Agentes', '/nosotros': 'Nosotros', '/contacto': 'Contacto',
    };
    setLabel(names[href] || '');
    setWiping(true);
  }, [pathname, router]);

  // Cuando la cortina cubre todo, navegamos; cuando llega la ruta nueva, la retiramos
  const onCovered = useCallback(() => {
    if (target.current) { router.push(target.current); }
  }, [router]);

  useEffect(() => {
    if (wiping && target.current === pathname) {
      // La ruta nueva ya montó — retirar la cortina tras un respiro
      const t = setTimeout(() => { setWiping(false); target.current = null; }, 120);
      return () => clearTimeout(t);
    }
  }, [pathname, wiping]);

  // Failsafe: nunca dejar la cortina pegada
  useEffect(() => {
    if (!wiping) return;
    const t = setTimeout(() => { setWiping(false); target.current = null; }, 2600);
    return () => clearTimeout(t);
  }, [wiping]);

  return (
    <WipeContext.Provider value={navigate}>
      {children}
      <AnimatePresence>
        {wiping && (
          <motion.div key="wipe" className="fixed inset-0 z-[200] pointer-events-none">
            {/* Cortina principal */}
            <motion.div
              className="absolute inset-0 bg-[#0A0A0A]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
              onAnimationComplete={def => { if (def === undefined || (def as {y?:number}).y === 0) onCovered(); }}
              style={{ willChange: 'transform' }}>
              {/* Borde dorado que "limpia" */}
              <span className="absolute top-0 left-0 right-0 h-[3px] gold-gradient"/>
              <span className="absolute bottom-[-2px] left-0 right-0 h-[3px] gold-gradient"/>
              {/* Nombre de la página destino */}
              {label && (
                <motion.p
                  className="absolute inset-0 flex items-center justify-center font-serif font-bold text-white/90"
                  style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
                  {label}<span className="gold-text">.</span>
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WipeContext.Provider>
  );
}

/* Link que dispara el barrido */
export function WipeLink({ href, className = '', children, onClick }:
  { href: string; className?: string; children: React.ReactNode; onClick?: () => void }) {
  const wipe = useWipe();
  return (
    <a href={href} className={className}
      onClick={e => { e.preventDefault(); onClick?.(); wipe(href); }}>
      {children}
    </a>
  );
}
