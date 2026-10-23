import { useEffect, useRef, useState } from 'react';
import { useLang } from './store.js';

const KEEP = 5; // tarjetas visibles en movil antes del "Ver N mas" (las 5 destacadas con clip)
const FILTERS = [['all', 'f_all', 'Todos'], ['ux', 'f_ux', 'UX / UI'], ['ia', 'f_ia', 'IA &amp; Auto.'], ['ecom', 'f_ecom', 'E-commerce'], ['saas', 'f_saas', 'SaaS']];
const LABELS = {
  es: { more: (n) => `Ver ${n} más`, less: 'Ver menos' },
  ca: { more: (n) => `Veure'n ${n} més`, less: 'Veure’n menys' },
  en: { more: (n) => `Show ${n} more`, less: 'Show less' },
};

// children = .bento (HTML estatico de Astro; React no lo reconcilia, solo le conmuta clases).
// El CSS sigue mandando: .fhid oculta por filtro y .m-collapsed > .m-extra pliega solo en movil.
export default function ProjectFilter({ children }) {
  const lang = useLang();
  const root = useRef(null);
  const [f, setF] = useState('all');
  const [open, setOpen] = useState(false);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    const kids = [...root.current.querySelector('.bento').children];
    kids.slice(KEEP).forEach((el) => el.classList.add('m-extra'));
    setExtra(Math.max(0, kids.length - KEEP));
  }, []);

  useEffect(() => {
    root.current.querySelectorAll('.bento>[data-cats],.bfeat[data-cats]').forEach((card) => {
      card.classList.toggle('fhid', f !== 'all' && !card.dataset.cats.split(' ').includes(f));
    });
  }, [f]);

  // Con un filtro activo se muestran todos los que coinciden; "Todos" vuelve al estado plegado
  const forced = f !== 'all';
  const expanded = open || forced;
  useEffect(() => {
    if (extra) root.current.querySelector('.bento').classList.toggle('m-collapsed', !expanded);
  }, [extra, expanded]);

  const toggle = () => {
    if (open) { // al replegar, devolver al usuario al inicio del bloque
      const bento = root.current.querySelector('.bento');
      if (bento.getBoundingClientRect().top < 0) bento.scrollIntoView({ block: 'start' });
    }
    setOpen(!open);
  };
  const l = LABELS[lang] || LABELS.es;

  return (
    <div style={{ display: 'contents' }} ref={root}>
      <div className="fbar rv">
        {FILTERS.map(([id, key, html]) => (
          <button key={id} type="button" className={'fb' + (f === id ? ' on' : '')} data-f={id} data-i={key} aria-pressed={f === id} onClick={() => setF(id)} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </div>
      {children}
      {extra > 0 && (
        <button type="button" className="m-more" aria-expanded={expanded} hidden={forced} onClick={toggle}>
          <span>{expanded ? l.less : l.more(extra)}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
    </div>
  );
}
