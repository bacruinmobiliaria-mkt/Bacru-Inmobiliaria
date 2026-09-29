'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Lang } from '@/lib/translations';

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: typeof translations.es; }

const Ctx = createContext<LangCtx>({ lang:'es', setLang:()=>{}, t:translations.es });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');
  useEffect(() => {
    try { const s = localStorage.getItem('bacru-lang') as Lang; if (s==='en'||s==='es') setLangState(s); } catch {}
  }, []);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem('bacru-lang', l); } catch {} };
  return <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
