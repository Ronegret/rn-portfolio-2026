import { useEffect, useRef, useState } from 'react';
import { useLang } from './store.js';
import { T } from '../content.js';

const KEEP = 7; // tarjetas visibles en movil antes del "Ver N mas" (las 7 destacadas con clip o caso propio)
const IDS = ['all', 'ux', 'ia', 'ecom', 'saas']; // data-cats reales de las tarjetas (ecom = e-commerce)
const EASE = 'cubic-bezier(.22,1,.36,1)'; // --ease-pulse (pulse-line.css)
const LABELS = {
  es: { more: (n) => `Ver ${n} más`, less: 'Ver menos' },
  ca: { more: (n) => `Veure'n ${n} més`, less: 'Veure’n menys' },
  en: { more: (n) => `Show ${n} more`, less: 'Show less' },
};

// El filtro activo sobrevive a la visita a un caso (sessionStorage): al volver, la portada queda como se dejó
const saved = () => { try { const s = sessionStorage.getItem('rn-f'); return IDS.includes(s) ? s : 'all'; } catch { return 'all'; } };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const inVp = (r) => r.width > 0 && r.bottom > -40 && r.top < innerHeight + 40;
const shows = (card, t) => t === 'all' || card.dataset.cats.split(' ').includes(t);

// children = .bento (HTML estatico de Astro; React no lo reconcilia, solo le conmuta clases).
// El CSS sigue mandando: .fhid oculta por filtro y .m-collapsed > .m-extra pliega solo en movil.
// El filtro es una frase ("Enséñame proyectos de [todo tipo ▾] · 20 casos"): botón + listbox con teclado (patrón select-only de APG).
export default function ProjectFilter({ children }) {
  const lang = useLang();
  const t = T[lang] || T.es;
  const root = useRef(null);
  const btn = useRef(null);
  const list = useRef(null);
  const [f, setF] = useState('all');
  const [open, setOpen] = useState(false); // "Ver más" (movil)
  const [menu, setMenu] = useState(false); // listbox del hueco
  const [act, setAct] = useState(0); // opcion activa del listbox (aria-activedescendant)
  const [extra, setExtra] = useState(0);
  const [counts, setCounts] = useState(null);
  const [word, setWord] = useState(null); // texto visible del hueco mientras se reescribe (null = el definitivo)
  const [live, setLive] = useState('');
  const flight = useRef({ id: 0, anims: [] });
  const rw = useRef(0);

  const bento = () => root.current.querySelector('.bento');
  const cards = () => [...bento().querySelectorAll(':scope > [data-cats]')];
  const label = (id) => t['qf_o_' + id];
  const noun = (n) => `${n} ${n === 1 ? t.qf_n1 : t.qf_nn}`;

  useEffect(() => {
    const kids = [...bento().children];
    kids.slice(KEEP).forEach((el) => el.classList.add('m-extra'));
    setExtra(Math.max(0, kids.length - KEEP));
    const cs = cards();
    setCounts(Object.fromEntries(IDS.map((id) => [id, cs.filter((c) => shows(c, id)).length])));
    setF(saved()); // el script inline de Proyectos.astro ya aplicó .fhid antes del primer pintado; aquí solo se sincroniza el estado
  }, []);

  // Traza Problema → Decisión → Resultado: sin hover (táctil), el pulso la recorre una vez al entrar en vista
  useEffect(() => {
    if (matchMedia('(hover: hover) and (pointer: fine)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('pt-on'); io.unobserve(e.target); } }), { threshold: 0.6 });
    root.current.querySelectorAll('.pt').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Con un filtro activo se muestran todos los que coinciden; "Todos" vuelve al estado plegado
  const forced = f !== 'all';
  const expanded = open || forced;
  useEffect(() => {
    if (extra) bento().classList.toggle('m-collapsed', !expanded);
  }, [extra, expanded]);

  // Aplica el filtro al DOM estático. Con movimiento: las que se van se funden, luego FLIP de las que se quedan y entrada de las nuevas.
  const apply = (id) => {
    const b = bento();
    cards().forEach((c) => c.classList.toggle('fhid', !shows(c, id)));
    if (extra) b.classList.toggle('m-collapsed', !(open || id !== 'all'));
  };
  const filterTo = (id) => {
    const b = bento(), sec = b.closest('section');
    const fl = flight.current;
    fl.anims.forEach((a) => a.cancel()); fl.anims = [];
    const my = ++fl.id;
    if (reduced() || !b.animate || sec?.classList.contains('tj-deck-on')) { // baraja táctil: touch.js reajusta el carrusel; aquí basta un fundido
      apply(id);
      if (!reduced() && b.animate) b.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 240, easing: EASE });
      return;
    }
    const face = (c) => c.querySelector(':scope > .bc') || c; // en el apilado sticky lo que se ve es la .bc, no su envoltorio
    const shown = (c) => !c.classList.contains('fhid') && c.offsetParent !== null;
    const cs = cards();
    const before = new Map(cs.filter(shown).map((c) => [c, face(c).getBoundingClientRect()]));
    const bar = root.current.querySelector('.qf'), y0 = bar.getBoundingClientRect().top;
    const outs = [...before].filter(([c, r]) => !shows(c, id) && inVp(r))
      .map(([c]) => c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 150, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }));
    fl.anims.push(...outs);
    const go = () => {
      if (my !== fl.id) return;
      outs.forEach((a) => a.cancel());
      apply(id);
      const dy = bar.getBoundingClientRect().top - y0; // el anclaje de scroll del navegador no debe mover la frase bajo el puntero
      if (Math.abs(dy) > 0.5) scrollBy({ top: dy, behavior: 'instant' });
      let k = 0;
      cs.filter(shown).forEach((c) => {
        const n = face(c).getBoundingClientRect();
        if (!inVp(n)) return;
        const o = before.get(c);
        if (o && inVp(o)) {
          const x = o.left - n.left, y = o.top - n.top;
          if (Math.abs(x) + Math.abs(y) < 1) return;
          fl.anims.push(c.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: 'none' }], { duration: 520, easing: EASE }));
        } else {
          c.classList.add('vis'); // revelado .rv: la tarjeta entra con este fundido, no con el suyo
          c.getAnimations().forEach((a) => { if (a.animationName === 'rv-up') a.finish(); });
          fl.anims.push(c.animate([{ opacity: 0, transform: 'translateY(14px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: Math.min(k++, 6) * 45, easing: EASE, fill: 'backwards' }));
        }
      });
    };
    if (outs.length) Promise.all(outs.map((a) => a.finished)).then(go, () => {}); else go();
  };

  // El hueco se reescribe como lo haría un agente: borra la palabra y teclea la nueva (solo visual; el nombre accesible ya es el final)
  const rewrite = (from, to) => {
    if (reduced()) return;
    const steps = [];
    for (let i = from.length - 1; i >= 0; i--) steps.push(from.slice(0, i));
    for (let i = 1; i <= to.length; i++) steps.push(to.slice(0, i));
    let i = 0;
    const tick = () => {
      if (i >= steps.length) { setWord(null); return; }
      setWord(steps[i]);
      rw.current = setTimeout(tick, i++ < from.length ? 16 : 30);
    };
    clearTimeout(rw.current);
    tick();
  };
  useEffect(() => () => clearTimeout(rw.current), []);

  const choose = (id) => {
    setMenu(false);
    btn.current?.focus();
    if (id === f) return;
    rewrite(label(f), label(id));
    setF(id);
    try { sessionStorage.setItem('rn-f', id); } catch (e) { /* privado */ }
    filterTo(id);
    if (counts) setLive(`${noun(counts[id])}: ${label(id)}`);
  };

  const openMenu = (i) => { setAct(i ?? IDS.indexOf(f)); setMenu(true); };
  useEffect(() => {
    if (!menu) return;
    // el listbox nace bajo el hueco, sin salirse de la frase por la derecha (320 px)
    const q = root.current.querySelector('.qf').getBoundingClientRect(), b = btn.current.getBoundingClientRect(), el = list.current;
    el.style.left = Math.max(0, Math.min(b.left - q.left, q.width - el.offsetWidth)) + 'px';
    el.style.top = (b.bottom - q.top + 8) + 'px';
    el.focus({ preventScroll: true });
  }, [menu]);
  useEffect(() => { // cerrar al pulsar fuera
    if (!menu) return;
    const off = (e) => { if (!root.current.querySelector('.qf').contains(e.target)) setMenu(false); };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [menu]);

  const onBtnKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(e.key === 'ArrowUp' ? IDS.length - 1 : undefined); }
  };
  const onListKey = (e) => {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); setAct((a) => (a + (k === 'ArrowDown' ? 1 : IDS.length - 1)) % IDS.length); }
    else if (k === 'Home' || k === 'End') { e.preventDefault(); setAct(k === 'Home' ? 0 : IDS.length - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(IDS[act]); }
    else if (k === 'Escape') { e.preventDefault(); setMenu(false); btn.current?.focus(); }
    else if (k === 'Tab') setMenu(false);
    else if (/^\w$/.test(k)) { // salto por inicial
      const j = IDS.findIndex((id, n) => n > act && label(id).toLowerCase().startsWith(k.toLowerCase()));
      const j0 = j >= 0 ? j : IDS.findIndex((id) => label(id).toLowerCase().startsWith(k.toLowerCase()));
      if (j0 >= 0) setAct(j0);
    }
  };

  const toggle = () => {
    if (open) { // al replegar, devolver al usuario al inicio del bloque
      const b = bento();
      if (b.getBoundingClientRect().top < 0) b.scrollIntoView({ block: 'start' });
    }
    setOpen(!open);
  };
  const l = LABELS[lang] || LABELS.es;
  const cur = label(f);

  return (
    <div style={{ display: 'contents' }} ref={root}>
      <div className="fbar qf rv" data-open={menu || undefined}>
        <p className="qf-s">
          <span className="qf-lead" id="qf-lead">{t.qf_lead}</span>{' '}
          <button ref={btn} type="button" className="qf-btn" id="qf-btn" aria-haspopup="listbox" aria-expanded={menu} aria-controls="qf-list"
            aria-label={`${t.qf_lead} ${cur}`} onClick={() => (menu ? setMenu(false) : openMenu())} onKeyDown={onBtnKey}>
            <span className={'qf-w' + (word !== null ? ' is-typing' : '')} aria-hidden="true">{word ?? cur}</span>
            <svg className="qf-chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="qf-n" aria-hidden="true">{counts ? `· ${noun(counts[f])}` : ''}</span>
        </p>
        <ul ref={list} className="qf-list" id="qf-list" role="listbox" tabIndex={-1} aria-label={t.qf_lbl}
          aria-activedescendant={menu ? 'qf-o-' + IDS[act] : undefined} onKeyDown={onListKey} hidden={!menu}>
          {IDS.map((id, i) => (
            <li key={id} id={'qf-o-' + id} role="option" aria-selected={f === id} className={'qf-o' + (i === act ? ' is-act' : '')}
              onPointerMove={() => setAct(i)} onClick={() => choose(id)}>
              <span className="qf-ol">{label(id)}</span>
              <span className="qf-oc" aria-hidden="true">{counts ? counts[id] : ''}</span>
              <svg className="qf-ok" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </li>
          ))}
        </ul>
        <span className="qf-sr" role="status">{live}</span>
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
