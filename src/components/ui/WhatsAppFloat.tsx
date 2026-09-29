'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentForZone, ZONES } from '@/lib/data';

const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-7 sm:h-7">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function WhatsAppFloat() {
  const [showModal, setShowModal] = useState(false);

  const openZone = (zone: string) => {
    const agent = getAgentForZone(zone);
    const msg = encodeURIComponent(`Hola Bacru! Me interesa una propiedad en ${zone}. ¿Pueden asesorarme?`);
    window.open(`https://wa.me/${agent.whatsapp}?text=${msg}`, '_blank');
    setShowModal(false);
  };

  return (
    <>
      {/* Float button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className="wa-pulse fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg"
        style={{ width:52, height:52 }}
        whileHover={{ scale:1.1 }}
        whileTap={{ scale:0.95 }}
        aria-label="WhatsApp"
      >
        <WaIcon />
      </motion.button>

      {/* Zone selector modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowModal(false)}>
            <div className="absolute inset-0 modal-backdrop" />
            <motion.div
              className="relative z-10 bg-[#0d0d0d] border border-gold/20 rounded-2xl p-6 w-full max-w-sm"
              initial={{ y:40, scale:0.95 }} animate={{ y:0, scale:1 }} exit={{ y:40, opacity:0 }}
              transition={{ type:'spring', stiffness:300, damping:28 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-white text-lg mb-1">¿En qué zona te interesa?</h3>
              <p className="text-white/50 text-xs mb-4">Te conectamos con el asesor de tu zona.</p>
              <div className="grid grid-cols-2 gap-2">
                {ZONES.slice(0,8).map(z => (
                  <button key={z} onClick={() => openZone(z)}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/80 text-sm font-display font-semibold px-3 py-2.5 rounded-xl hover:bg-gold/10 hover:border-gold/40 hover:text-gold transition-all text-left">
                    <span className="text-xs">📍</span> {z}
                  </button>
                ))}
              </div>
              <button onClick={() => openZone('General')} className="mt-3 w-full text-center gold-gradient text-black font-display font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity">
                Contacto General
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
