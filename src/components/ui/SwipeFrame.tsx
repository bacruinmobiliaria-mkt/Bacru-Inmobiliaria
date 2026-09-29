'use client';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, type PanInfo } from 'framer-motion';

/*
  Contenedor deslizable para galerías de fotos.
  · Con el dedo (o el mouse) arrastras a los lados y la foto te sigue.
  · Al soltar: si arrastraste lo suficiente O fue un "flick" rápido → cambia de foto.
  · Si no, regresa suavemente a su lugar.
  · Deja pasar el scroll vertical de la página (touch-action: pan-y).
  · Un arrastre NO cuenta como clic (no abre el lightbox por error).
*/
interface Props {
  onNext: () => void;
  onPrev: () => void;
  onStart?: () => void;      // p. ej. pausar el auto-avance
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

const DIST = 55;   // px mínimos de arrastre
const VEL  = 420;  // px/s mínimos para contar como "flick"

export default function SwipeFrame({ onNext, onPrev, onStart, className, style, children }: Props) {
  const dragged = useRef(false);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x <= -DIST || velocity.x <= -VEL) onNext();
    else if (offset.x >= DIST || velocity.x >= VEL) onPrev();
    // el clic sintético llega justo después del pointerup: lo bloqueamos un instante
    window.setTimeout(() => { dragged.current = false; }, 60);
  };

  return (
    <motion.div
      className={className}
      style={style}
      drag="x"
      dragDirectionLock
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.55}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { dragged.current = true; onStart?.(); }}
      onDragEnd={onDragEnd}
      onClickCapture={e => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); } }}
    >
      {children}
    </motion.div>
  );
}
