/* Casos de estudio en móvil: cada sección larga se muestra recortada con un "Ver más".
   Genérico para todas las páginas de caso: no toca el HTML ni el CSS de cada una.
   En escritorio no hace nada. */
const mq = matchMedia('(max-width: 640px)');
const LABELS = {
  es: ['Seguir leyendo', 'Ver menos'],
  ca: ['Continuar llegint', 'Veure’n menys'],
  en: ['Keep reading', 'Show less'],
};
const L = () => LABELS[(document.documentElement.lang || 'es').slice(0, 2)] || LABELS.es;
const COLLAPSED_H = 560;   // px visibles antes del corte
const MIN_H = 1100;        // solo se pliegan secciones claramente largas

const style = document.createElement('style');
style.textContent = `
@media (max-width: 640px) {
  section.cm-collapsed { max-height: ${COLLAPSED_H}px; overflow: hidden; -webkit-mask-image: linear-gradient(#000 62%, transparent); mask-image: linear-gradient(#000 62%, transparent); }
  .cm-more {
    display: flex; align-items: center; justify-content: center; gap: 8px; width: calc(100% - 2rem); max-width: 420px; min-height: 46px; margin: -.25rem auto 1.5rem;
    font: inherit; font-size: 14px; font-weight: 700; color: inherit; background: transparent;
    border: 1.5px solid currentColor; border-radius: 100px; cursor: pointer; position: relative; z-index: 2;
    transition: transform .16s cubic-bezier(0.23, 1, 0.32, 1), opacity .2s;
  }
  .cm-more:active { transform: scale(.97); }
  .cm-more svg { transition: transform .3s cubic-bezier(0.23, 1, 0.32, 1); }
  .cm-more[aria-expanded="true"] svg { transform: rotate(180deg); }
}
@media (min-width: 641px) { .cm-more { display: none; } }
@media (prefers-reduced-motion: reduce) { .cm-more, .cm-more svg { transition: none; } }
`;
document.head.appendChild(style);

function init() {
  const all = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section'));
  if (all.length < 4) return;
  // Primera (portada) y última (cierre / CTA) siempre completas
  const targets = all.slice(1, -1).filter(s => s.offsetHeight > MIN_H);
  const items = targets.map(sec => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cm-more';
    btn.setAttribute('aria-expanded', 'false');
    sec.insertAdjacentElement('afterend', btn);
    const t = { sec, btn, open: false };
    t.render = () => {
      sec.classList.toggle('cm-collapsed', !t.open);
      btn.setAttribute('aria-expanded', String(t.open));
      btn.innerHTML = `<span>${t.open ? L()[1] : L()[0]}</span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    };
    btn.addEventListener('click', () => {
      t.open = !t.open;
      t.render();
      if (!t.open && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ block: 'start' });
    });
    return t;
  });

  const apply = () => items.forEach(t => {
    const on = mq.matches;
    t.btn.hidden = !on;
    if (on) t.render(); else t.sec.classList.remove('cm-collapsed');
  });
  apply();
  mq.addEventListener('change', apply);

  // Enlaces internos (#ancla): si apuntan a una sección plegada, se despliega antes de saltar
  const openFor = (target) => {
    const t = items.find(i => i.sec.contains(target));
    if (t && !t.open && mq.matches) { t.open = true; t.render(); }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) openFor(el);
  });
  if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) openFor(el); }
}

// Esperar a que las imágenes den su altura real: si no, offsetHeight engaña
if (document.readyState === 'complete') init();
else addEventListener('load', init);
