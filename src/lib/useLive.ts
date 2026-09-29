'use client';
import { useEffect, useState } from 'react';
import { AGENTS, Agent, PROPERTIES, Property } from '@/lib/data';

// Asesores en vivo (los que administras en el panel). Arranca con los
// estáticos para no mostrar vacío y se reemplaza al llegar la base de datos.
export function useLiveAgents(): Agent[] {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  useEffect(() => {
    let alive = true;
    fetch('/api/agents', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && Array.isArray(d) && d.length) setAgents(d as Agent[]); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return agents;
}

// Propiedades activas en vivo desde la base de datos.
export function useLiveProperties(): Property[] {
  const [props, setProps] = useState<Property[]>(PROPERTIES);
  useEffect(() => {
    let alive = true;
    fetch('/api/properties', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && Array.isArray(d)) setProps(d as Property[]); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return props;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Busca al asesor de una zona entre los asesores en vivo.
export function agentForZoneLive(agents: Agent[], zone: string): Agent | undefined {
  const z = norm(zone);
  if (!z || z === 'todas') return agents.find(a => a.zones.some(x => norm(x) === 'todas')) || agents[0];
  return (
    agents.find(a => a.zones.some(x => { const n = norm(x); return n === z || z.includes(n) || n.includes(z); })) ||
    agents.find(a => a.zones.some(x => norm(x) === 'todas')) ||
    agents[0]
  );
}
