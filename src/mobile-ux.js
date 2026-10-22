/* Despliegues para móvil: menos muro de texto, más control.
   El JS solo marca elementos y crea los botones; el CSS (@media max-width: 640px) decide
   qué se oculta, así que en escritorio no cambia nada. */

const LABELS = {
  es: { more: n => `Ver ${n} más`, less: 'Ver menos', read: 'Leer más', readLess: 'Leer menos' },
  ca: { more: n => `Veure'n ${n} més`, less: 'Veure’n menys', read: 'Llegir més', readLess: 'Llegir menys' },
  en: { more: n => `Show ${n} more`, less: 'Show less', read: 'Read more', readLess: 'Read less' },
};
const L = () => LABELS[document.documentElement.lang] || LABELS.es;

const toggles = [];

/* Oculta los elementos a partir del índice `keep` y añade un botón para desplegarlos. */
function collapsible(container, { keep, kind = 'more', after = container, all = false }) {
  if (!container) return;
  if (all) container.classList.add('m-all');   // "all": el plegado también aplica en escritorio
  const items = [...container.children].filter(el => !el.classList.contains('m-more'));
  const extra = items.slice(keep);
  if (!extra.length) return;
  extra.forEach(el => el.classList.add('m-extra'));
  container.classList.add('m-collapsed');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'm-more';
  btn.setAttribute('aria-expanded', 'false');
  after.insertAdjacentElement('afterend', btn);

  const t = { container, btn, extra, kind, open: false, forceOpen: false };
  const render = () => {
    const open = t.open || t.forceOpen;
    container.classList.toggle('m-collapsed', !open);
    btn.hidden = t.forceOpen;
    btn.setAttribute('aria-expanded', String(open));
    const l = L();
    btn.innerHTML = `<span>${open ? (kind === 'read' ? l.readLess : l.less) : (kind === 'read' ? l.read : l.more(extra.length))}</span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };
  btn.addEventListener('click', () => {
    t.open = !t.open;
    render();
    // Al replegar, devolvemos al usuario al inicio del bloque para que no se pierda en la página
    if (!t.open) {
      const top = container.getBoundingClientRect().top;
      if (top < 0) container.scrollIntoView({ block: 'start' });
    }
  });
  t.render = render;
  toggles.push(t);
  render();
  return t;
}

function initProjects() {
  const bento = document.querySelector('#proyectos .bento');
  const t = collapsible(bento, { keep: 4 });
  if (!t) return;
  // Con un filtro activo se muestran todos los que coinciden; "Todos" vuelve al estado plegado
  document.querySelectorAll('#proyectos .fb').forEach(fb => {
    fb.addEventListener('click', () => {
      t.forceOpen = fb.dataset.f !== 'all';
      t.render();
    });
  });
}

/* Descripciones de proyecto (.bc-d): se recortan a 4 líneas por CSS.
   Aquí solo se añade un botón "Leer más" cuando el texto realmente no
   cabe, para que nada se corte en silencio sin forma de leer el resto. */
function initCardDescriptions() {
  document.querySelectorAll('#proyectos .bc-d').forEach(p => {
    requestAnimationFrame(() => {
      if (p.scrollHeight - p.clientHeight < 2) return; // ya cabe entero
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bc-d-more';
      btn.setAttribute('aria-expanded', 'false');
      p.insertAdjacentElement('afterend', btn);
      let open = false;
      const render = () => {
        p.classList.toggle('bc-d-open', open);
        btn.setAttribute('aria-expanded', String(open));
        const l = L();
        btn.innerHTML = `<span>${open ? l.readLess : l.read}</span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      };
      btn.addEventListener('click', (e) => {
        // El botón vive dentro del <a> que envuelve toda la tarjeta:
        // sin esto, "Leer más" también navegaría al caso de estudio.
        e.preventDefault();
        e.stopPropagation();
        open = !open;
        render();
      });
      toggles.push({ render });
      render();
    });
  });
}

function initFooter() {
  document.querySelectorAll('.fx-col').forEach((col, i, all) => {
    const head = col.querySelector('.fx-col-h');
    const list = col.querySelector('.fx-list');
    if (!head || !list) return;
    const id = `fx-list-${i}`;
    list.id = id;
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.setAttribute('aria-controls', id);
    // Contacto (última columna) abierto por defecto: es la acción principal
    const open = i === all.length - 1;
    col.classList.toggle('open', open);
    head.setAttribute('aria-expanded', String(open));
    const flip = () => {
      const now = !col.classList.contains('open');
      col.classList.toggle('open', now);
      head.setAttribute('aria-expanded', String(now));
    };
    head.addEventListener('click', flip);
    head.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });
}

/* Revelado escalonado: los hijos de cada rejilla entran en cascada (0, 70, 140ms) en vez de todos a la vez.
   El CSS de .rv vive en styles.css y solo se activa con html.rv-on (nunca sin JS ni con reduced-motion). */
function initMotion() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ['#proyectos .bento', '.sg', '.test-g', '.lab-sub-grid', '.proof-grid', '.counts-g'].forEach(sel => {
    const c = document.querySelector(sel);
    if (!c) return;
    [...c.children].forEach((el, i) => { if (!el.classList.contains('m-more')) el.style.setProperty('--d', String(i % 3)); });
  });
  document.documentElement.classList.add('rv-on');
}

function init() {
  initMotion();
  initProjects();
  initCardDescriptions();
  const about = document.querySelector('#about-grid > div');
  // El botón va DENTRO de la columna (tras el último hijo); si fuera hermano, entraría como celda de la rejilla y desplazaría las tarjetas
  collapsible(about, { keep: 1, kind: 'read', all: true, after: about && about.lastElementChild });
  collapsible(document.querySelector('.lab-sub-grid'), { keep: 2 });
  initFooter();
  new MutationObserver(() => toggles.forEach(t => t.render()))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
