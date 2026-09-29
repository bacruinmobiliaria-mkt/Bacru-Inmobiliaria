'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, BedDouble, Bath, Ruler } from 'lucide-react';
import { Property } from '@/lib/data';
import { EASE } from '@/components/ui/Motion';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { L: any } }

/*
  LiveMap — EL mapa de Bacru, uno solo para todo el sitio
  (página Mapa, inicio y Comprar). Leaflet + clustering, marcadores
  dorados con precio, tarjeta al hover con slider de fotos, y clic
  que abre el popup de la propiedad. Lee las propiedades que le pases,
  así que siempre refleja la base de datos.
*/

let leafletFull: Promise<void> | null = null;
function loadLeafletFull(): Promise<void> {
  if (typeof window !== 'undefined' && window.L?.markerClusterGroup) return Promise.resolve();
  if (leafletFull) return leafletFull;
  leafletFull = new Promise<void>((resolve, reject) => {
    ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
     'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
     'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    ].forEach(href => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
      document.head.appendChild(l);
    });
    const s1 = document.createElement('script');
    s1.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
      s2.onload = () => resolve();
      s2.onerror = () => { leafletFull = null; reject(new Error('cdn')); };
      document.body.appendChild(s2);
    };
    s1.onerror = () => { leafletFull = null; reject(new Error('cdn')); };
    document.body.appendChild(s1);
  });
  return leafletFull;
}

/* Tarjeta al hover con slider de fotos automático */
function HoverCard({ p, x, y, boxW, onEnter, onLeave, onOpen }:
  { p: Property; x: number; y: number; boxW: number; onEnter: () => void; onLeave: () => void; onOpen: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (p.images.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % p.images.length), 1800);
    return () => clearInterval(id);
  }, [p.images.length]);

  const W = 260, H = 300;
  const left = Math.max(8, Math.min(x - W / 2, boxW - W - 8));

  return (
    <motion.div
      className="absolute z-30 w-[260px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-carbon/10 cursor-pointer"
      style={{ left, top: Math.max(8, y - H - 18) }}
      initial={{ opacity: 0, y: 10, scale: .96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: .97 }}
      transition={{ duration: .25, ease: EASE }}
      onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onOpen}>
      <div className="relative h-[130px] overflow-hidden bg-carbon">
        <AnimatePresence mode="popLayout">
          <motion.div key={idx} className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .6, ease: 'easeOut' }}>
            <Image src={p.images[idx % p.images.length]} alt={p.name} fill className="object-cover" unoptimized/>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/>
        {p.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {p.images.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i === idx % p.images.length ? 'w-4 bg-gold' : 'w-1 bg-white/50'}`}/>
            ))}
          </div>
        )}
        <p className="absolute bottom-2 left-3 font-display font-extrabold text-white text-base drop-shadow">${p.price.toLocaleString('es-MX')}</p>
      </div>
      <div className="p-3.5">
        <p className="font-display font-bold text-carbon text-[13px] leading-tight mb-1 line-clamp-1">{p.name}</p>
        <p className="flex items-center gap-1 text-muted text-[11px] mb-2"><MapPin className="w-3 h-3 text-gold"/>{p.zone}</p>
        <div className="flex gap-3 text-[11px] text-carbon/60">
          {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3 text-gold/70"/>{p.beds}</span>}
          {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3 text-gold/70"/>{p.baths}</span>}
          <span className="flex items-center gap-1"><Ruler className="w-3 h-3 text-gold/70"/>{p.buildM2 || p.landM2} m²</span>
        </div>
        <p className="text-gold text-[10px] font-display font-bold uppercase tracking-wider mt-2.5">Clic para ver fotos, mapa y detalles →</p>
      </div>
      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-carbon/10"/>
    </motion.div>
  );
}

export default function LiveMap({ properties, onSelect, height = '65vh', minHeight = 420, className = '' }:
  { properties: Property[]; onSelect: (p: Property) => void; height?: string; minHeight?: number; className?: string }) {
  const mapDiv     = useRef<HTMLDivElement>(null);
  const shellRef   = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hover, setHover]   = useState<{ p: Property; x: number; y: number } | null>(null);

  const cancelHide = useCallback(() => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; } }, []);
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setHover(null), 220);
  }, [cancelHide]);

  // Inicialización con guardas (doble montaje de React) + fallback
  useEffect(() => {
    let alive = true;
    const timeout = setTimeout(() => { if (alive && !mapRef.current) setStatus('error'); }, 9000);

    loadLeafletFull().then(() => {
      if (!alive || !mapDiv.current) return;
      const L = window.L;
      const el = mapDiv.current as HTMLDivElement & { _leaflet_id?: number };
      if (el._leaflet_id) { try { el.innerHTML = ''; delete el._leaflet_id; } catch {} }
      try {
        const map = L.map(el, { scrollWheelZoom: true }).setView([20.05, -99.0], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 18,
        }).addTo(map);
        map.on('movestart zoomstart', () => setHover(null));
        mapRef.current = map;
        setStatus('ready');
        setTimeout(() => { try { map.invalidateSize(); } catch {} }, 250);
        setTimeout(() => { try { map.invalidateSize(); } catch {} }, 1200);
      } catch { setStatus('error'); }
    }).catch(() => { if (alive) setStatus('error'); });

    const onResize = () => { try { mapRef.current?.invalidateSize(); } catch {} };
    window.addEventListener('resize', onResize);
    return () => {
      alive = false; clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    };
  }, []);

  // Marcadores + clustering + hover — se regeneran al cambiar las propiedades
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !window.L) return;
    const L = window.L;
    if (clusterRef.current) { try { mapRef.current.removeLayer(clusterRef.current); } catch {} }
    const cluster = L.markerClusterGroup({ maxClusterRadius: 45 });
    const isTouch = window.matchMedia('(pointer:coarse)').matches;

    const list = properties.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
    list.forEach(p => {
      const icon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#D4AF37,#F4E27A);color:#000;font-weight:800;font-size:11px;padding:5px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.35);border:2px solid #fff;font-family:Montserrat,sans-serif">$${(p.price / 1e6).toFixed(1)}M</div>`,
        className: '', iconSize: null,
      });
      const mk = L.marker([p.lat, p.lng], { icon });
      if (!isTouch) {
        mk.on('mouseover', (e: any) => {
          cancelHide();
          const pt = mapRef.current.latLngToContainerPoint(e.latlng);
          setHover({ p, x: pt.x, y: pt.y });
        });
        mk.on('mouseout', scheduleHide);
      }
      mk.on('click', () => { setHover(null); onSelect(p); });
      cluster.addLayer(mk);
    });

    mapRef.current.addLayer(cluster);
    clusterRef.current = cluster;
    if (list.length > 0) { try { mapRef.current.fitBounds(cluster.getBounds().pad(0.25)); } catch {} }
  }, [status, properties, onSelect, cancelHide, scheduleHide]);

  return (
    <div ref={shellRef} className={`map-shell rounded-2xl overflow-hidden border border-gray-200 shadow-md ${className}`}
      style={{ height, minHeight }}>
      <div ref={mapDiv} style={{ width: '100%', height: '100%', background: '#EFEDE6' }}/>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-ivory flex items-center justify-center z-[40]">
          <div className="text-center">
            <div className="w-10 h-10 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3, borderStyle: 'solid' }}/>
            <p className="text-muted text-sm">Cargando mapa…</p>
          </div>
        </div>
      )}
      {status === 'error' && (
        <iframe src="https://maps.google.com/maps?q=Mixquiahuala+de+Juarez,+Hidalgo,+Mexico&t=m&z=10&output=embed"
          width="100%" height="100%" style={{ border: 0, display: 'block', position: 'absolute', inset: 0 }}
          loading="lazy" title="Zona de cobertura Bacru"/>
      )}
      <AnimatePresence>
        {hover && (
          <HoverCard key={hover.p.slug || hover.p.id} p={hover.p} x={hover.x} y={hover.y}
            boxW={shellRef.current?.clientWidth || 800}
            onEnter={cancelHide} onLeave={scheduleHide}
            onOpen={() => { const prop = hover.p; setHover(null); onSelect(prop); }}/>
        )}
      </AnimatePresence>
    </div>
  );
}
