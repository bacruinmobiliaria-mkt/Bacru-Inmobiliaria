'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/*
  ScrollFX — motor de animaciones global.
  Portado del proyecto de referencia: un solo IntersectionObserver que
  anima cualquier elemento con .reveal / .split / .fill / .img-reveal,
  más parallax, botones magnéticos y barra de progreso de scroll.

  Se re-escanea en cada cambio de ruta, así TODAS las páginas quedan animadas.
*/
export default function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $$ = <T extends Element>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

    // ── Auto-etiquetado: da .reveal a lo que no tenga animación propia ──
    const autoTag = () => {
      const skip = (el: Element) => {
        const h = el as HTMLElement;
        return !!(
          el.closest('[data-no-fx]') ||
          el.classList.contains('reveal') ||
          el.classList.contains('split') ||
          el.classList.contains('fill') ||
          // ya animado por framer-motion (estilos inline de opacity/transform)
          h.style.opacity !== '' || h.style.transform !== '' ||
          el.closest('.gallery-track') ||
          // no tocar elementos dentro de un modal abierto
          el.closest('[role="dialog"]')
        );
      };

      $$<HTMLElement>('section h2, section h3, section > p, section .grid > *, section li').forEach((el, i) => {
        if (skip(el)) return;
        if (el.closest('.no-fx')) return;
        el.classList.add('reveal');
        el.style.setProperty('--rd', `${Math.min(i % 6, 5) * 70}ms`);
      });
    };

    // ── Split por palabras ──
    const buildSplit = () => {
      $$<HTMLElement>('.split').forEach(el => {
        if (el.dataset.splitDone) return;
        const text = el.textContent || '';
        el.textContent = '';
        text.split(' ').forEach((word, i) => {
          const w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--i', String(i));
          const inner = document.createElement('span');
          inner.textContent = word;
          w.appendChild(inner);
          el.appendChild(w);
          el.appendChild(document.createTextNode(' '));
        });
        el.dataset.splitDone = '1';
      });
    };

    // ── Fill: palabras que se encienden con el scroll ──
    const buildFill = () => {
      $$<HTMLElement>('.fill').forEach(el => {
        if (el.dataset.fillDone) return;
        const text = el.textContent || '';
        el.textContent = '';
        text.split(' ').forEach(word => {
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = word + ' ';
          el.appendChild(w);
        });
        el.dataset.fillDone = '1';
      });
    };

    if (reduce) {
      $$('.reveal, .split, .img-reveal').forEach(e => e.classList.add('is-in'));
      $$('.fill .w').forEach(e => e.classList.add('is-lit'));
      return;
    }

    // ── Observer principal (idempotente: sirve para contenido montado tarde) ──
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    // El registro vive en la memoria de ESTE efecto (no en el DOM):
    // en el doble montaje de React-dev, el segundo observer vuelve a
    // observar todo lo que siga oculto. Nada puede quedarse invisible.
    const seen = new WeakSet<Element>();
    const register = () => {
      buildSplit(); buildFill(); autoTag();
      const vh = window.innerHeight;
      $$('.reveal, .split, .img-reveal').forEach(el => {
        const h = el as HTMLElement;
        if (h.classList.contains('is-in')) return;
        if (seen.has(el)) return;
        seen.add(el);
        // Barrido de seguridad: lo que ya está a la vista se revela al instante
        const r = h.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) { h.classList.add('is-in'); return; }
        io.observe(el);
      });
    };
    register();

    // El intro de video monta la home tarde: re-escanear cuando aparezcan nodos nuevos
    const mo = new MutationObserver(() => {
      if (moTick) return;
      moTick = window.setTimeout(() => { moTick = 0; register(); refreshScrollTargets(); }, 120);
    });
    let moTick = 0;
    mo.observe(document.body, { childList: true, subtree: true });

    // Respaldo: durante los primeros segundos, revela lo que esté en viewport
    const sweep = window.setInterval(() => {
      const vh = window.innerHeight;
      $$('.reveal, .split, .img-reveal').forEach(el => {
        if (el.classList.contains('is-in')) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('is-in');
      });
    }, 900);
    window.setTimeout(() => clearInterval(sweep), 6000);

    // ── Scroll frame: parallax, fill, barra de progreso ──
    let parallaxEls = $$<HTMLElement>('[data-parallax]');
    let fillWords = $$<HTMLElement>('.fill .w');
    const refreshScrollTargets = () => {
      parallaxEls = $$<HTMLElement>('[data-parallax]');
      fillWords = $$<HTMLElement>('.fill .w');
    };
    const bar = document.getElementById('bacru-progress');
    let ticking = false;

    const frame = () => {
      const vh = window.innerHeight;

      // barra de progreso
      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }

      // parallax
      parallaxEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const amt = parseFloat(el.dataset.parallax || '14');
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-p * amt).toFixed(2)}%, 0)`;
      });

      // fill: enciende palabras según avanza el scroll
      if (fillWords.length) {
        const host = fillWords[0].parentElement;
        if (host) {
          const r = host.getBoundingClientRect();
          const prog = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.25), 0), 1);
          const lit = Math.round(prog * fillWords.length);
          fillWords.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { frame(); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();

    // ── Botones magnéticos ──
    const cleanups: (() => void)[] = [];
    if (!window.matchMedia('(pointer:coarse)').matches) {
      $$<HTMLElement>('.magnetic').forEach(el => {
        const move = (ev: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (ev.clientX - (r.left + r.width / 2)) * 0.25;
          const y = (ev.clientY - (r.top + r.height / 2)) * 0.25;
          el.style.transform = `translate(${x}px, ${y}px)`;
        };
        const reset = () => { el.style.transform = 'translate(0,0)'; };
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', reset);
        cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', reset); });
      });
    }

    // ── Contadores ──
    const countIO = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      countIO.unobserve(el);
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1700;
      const tick = (t: number) => {
        const pr = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - pr, 3))) + suffix;
        if (pr < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.4 });
    $$('[data-count]').forEach(el => countIO.observe(el));

    return () => {
      io.disconnect(); countIO.disconnect(); mo.disconnect();
      clearInterval(sweep);
      if (moTick) clearTimeout(moTick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cleanups.forEach(f => f());
    };
  }, [pathname]);

  // Barra de progreso de scroll (estilo referencia)
  return (
    <div aria-hidden className="fixed top-0 left-0 right-0 h-[2px] z-[95] pointer-events-none">
      <div id="bacru-progress"
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold/60 via-gold to-gold/60"/>
    </div>
  );
}
