'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode; delay?: number;
  direction?: 'up'|'down'|'left'|'right'|'fade';
  className?: string; once?: boolean; amount?: number;
}

export default function Reveal({ children, delay=0, direction='up', className='', once=true, amount=0.15 }: Props) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction==='up' ? 40 : direction==='down' ? -40 : 0,
      x: direction==='left' ? -40 : direction==='right' ? 40 : 0,
    },
    visible: { opacity:1, y:0, x:0 },
  };
  return (
    <motion.div variants={variants} initial="hidden" whileInView="visible"
      viewport={{ once, amount }}
      transition={{ duration:0.65, delay, ease:[0.22,1,0.36,1] }}
      className={className}>
      {children}
    </motion.div>
  );
}
