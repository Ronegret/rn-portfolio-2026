/* Casos de estudio: Resumen / Caso completo, secciones plegables (hidden="until-found"), índice y carruseles.
   Mejora progresiva: sin JS la página se ve entera. Marcas opcionales en el HTML:
   data-fold="off"        la sección no se pliega
   data-fold-lead         último hijo que queda visible (por defecto: el h2 y el párrafo siguiente)
   data-fold-items="sel"  dentro del cuerpo de la sección, cada elemento "sel" también se pliega (cabecera visible)
   data-carousel          tira de figuras con scroll-snap, botones y ampliar */
const d = document, root = d.documentElement;
const TT = {
  es: { more: 'Leer más', less: 'Leer menos', about: 'sobre', sum: 'Resumen', full: 'Caso completo', view: 'Vista del caso', idx: 'Índice', idxT: 'Índice del caso', all: 'Expandir todo', none: 'Contraer todo', zoom: 'Ampliar', close: 'Cerrar', prev: 'Anterior', next: 'Siguiente', hint: 'Resumen por defecto: cada sección abre con Leer más.', sumSt: 'Vista resumen', fullSt: 'Vista caso completo' },
  ca: { more: 'Llegir més', less: 'Llegir menys', about: 'sobre', sum: 'Resum', full: 'Cas complet', view: 'Vista del cas', idx: 'Índex', idxT: 'Índex del cas', all: 'Expandir tot', none: 'Contreure tot', zoom: 'Ampliar', close: 'Tancar', prev: 'Anterior', next: 'Següent', hint: 'Resum per defecte: cada secció s’obre amb Llegir més.', sumSt: 'Vista resum', fullSt: 'Vista cas complet' },
  en: { more: 'Read more', less: 'Read less', about: 'about', sum: 'Summary', full: 'Full case', view: 'Case view', idx: 'Index', idxT: 'Case index', all: 'Expand all', none: 'Collapse all', zoom: 'Enlarge', close: 'Close', prev: 'Previous', next: 'Next', hint: 'Summary by default: open each section with Read more.', sumSt: 'Summary view', fullSt: 'Full case view' },
};
const L = TT[(root.lang || 'es').slice(0, 2)] || TT.es;
const KEY = 'cf-mode';
const rm = matchMedia('(prefers-reduced-motion: reduce)');
const store = { get() { try { return sessionStorage.getItem(KEY); } catch { return null; } }, set(v) { try { sessionStorage.setItem(KEY, v); } catch { /* sin almacenamiento */ } } };
const el = (tag, cls, attrs = {}) => { const e = d.createElement(tag); if (cls) e.className = cls; for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const kids = (n) => [...n.children].filter((c) => !/^(SCRIPT|STYLE|TEMPLATE)$/.test(c.tagName));
const CHEV = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const heading = (n) => (n.matches('h2,h3') ? n : n.querySelector('h2,h3'));

/* ---------- Colores del propio caso (el panel y la barra heredan su tema) ---------- */
function themeVars() {
  const cs = getComputedStyle(d.body), rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  const [r, g, b] = rgb(cs.color), lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  let bg = cs.backgroundColor;
  const a = rgb(bg)[3];
  if (!bg || bg === 'transparent' || a === 0) bg = lum > 0.5 ? '#0b0e14' : '#ffffff';
  root.style.setProperty('--cf-fg', cs.color);
  root.style.setProperty('--cf-bg', bg);
}

/* ---------- Plegables ---------- */
const folds = [];
let sectionsInfo = [];
const labelOf = (f) => `${f.open ? L.less : L.more}`;

function paint(f) {
  f.btn.setAttribute('aria-expanded', String(f.open));
  f.btn.querySelector('.cf-l').textContent = labelOf(f);
}
function setOpen(f, open, { instant = false } = {}) {
  if (f.open === open) return;
  f.open = open;
  clearTimeout(f.t);
  const inst = instant || rm.matches;
  f.fold.classList.toggle('cf-inst', inst);
  f.fold.classList.remove('cf-done');
  f.fold.dataset.open = open ? '1' : '0';
  f.sec?.classList.toggle('cf-closed', !open);
  if (open) {
    f.inner.removeAttribute('hidden');
    f.fold.dispatchEvent(new CustomEvent('fold-open', { bubbles: true }));
    // Las demos con estado propio (.demo[data-on]) se reinician al abrir: arrancan de cero y no corren plegadas
    f.inner.querySelectorAll('.demo').forEach((dm) => dm.dispatchEvent(new CustomEvent('demo-toggle')));
    const done = () => { if (f.open) f.fold.classList.add('cf-done'); };
    inst ? done() : (f.t = setTimeout(done, 520));
  } else {
    const done = () => { if (!f.open) f.inner.setAttribute('hidden', 'until-found'); };
    inst ? done() : (f.t = setTimeout(done, 520));
    // Al plegar se cierra lo que las demos dejaron abierto (p. ej. el menú móvil de prueba, que escucha Escape)
    if (f.inner.querySelector('.demo')) d.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }
  paint(f);
  syncSwitch();
}
const ancestors = (f) => { const out = []; let p = f.parent; while (p) { out.push(p); p = p.parent; } return out; };
function openPath(node, opts) {
  const f = folds.find((x) => x.inner.contains(node) && !folds.some((y) => y !== x && x.inner.contains(y.inner) && y.inner.contains(node)));
  if (!f) return;
  [...ancestors(f).reverse(), f].forEach((x) => setOpen(x, true, opts));
}

function build(cont, lead, body, title, { sec = null, sub = false, id }) {
  const fold = el('div', 'cf-fold'), inner = el('div', 'cf-inner', { id: `${id}-b`, hidden: 'until-found' });
  body[0].before(fold);
  fold.append(inner);
  inner.append(...body);
  const btn = el('button', `cf-btn${sub ? ' cf-sub' : ''}`, { type: 'button', 'aria-controls': inner.id, 'aria-expanded': 'false' });
  if (getComputedStyle(cont).textAlign === 'center') btn.classList.add('cf-ctr');
  btn.innerHTML = `<span class="cf-l"></span><span class="cf-sr"> ${L.about} ${title}</span>${CHEV}`;
  fold.after(btn);
  const f = { fold, inner, btn, sec, open: false, parent: null, title };
  if (sec) sec.classList.add('cf-sec', 'cf-closed');
  btn.addEventListener('click', () => {
    setOpen(f, !f.open);
    if (!f.open && btn.getBoundingClientRect().top < 0) (sec || fold.parentElement).scrollIntoView({ block: 'start' });
  });
  inner.addEventListener('beforematch', () => { ancestors(f).reverse().forEach((x) => setOpen(x, true, { instant: true })); setOpen(f, true, { instant: true }); });
  paint(f);
  folds.push(f);
  return f;
}

function planFor(cont, minH) {
  const k = kids(cont);
  let i = k.findIndex((c) => c.hasAttribute('data-fold-lead'));
  if (i < 0) {
    i = k.findIndex((c) => c.matches('h2') || c.querySelector('h2'));
    if (i < 0) i = k.findIndex((c) => heading(c));
    if (i < 0) return null;
    if (k[i + 1] && k[i + 1].matches('p')) i += 1;
  }
  const body = k.slice(i + 1);
  if (!body.length) return null;
  const top = body[0].getBoundingClientRect().top, bottom = Math.max(...body.map((n) => n.getBoundingClientRect().bottom));
  return bottom - top >= minH ? { body } : null;
}
const containerOf = (s) => { const k = kids(s); return k.length === 1 && k[0].tagName === 'DIV' ? k[0] : s; };

function initFolds() {
  const secs = [...d.querySelectorAll('section')].filter((s) => !s.parentElement.closest('section') && !s.closest('header,footer,nav') && !s.matches('.hero') && !s.querySelector('h1') && s.dataset.fold !== 'off');
  let n = 0;
  const plans = secs.map((s) => {
    const cont = containerOf(s), h = heading(s);
    if (!s.id) s.id = `cf-s${++n}`;
    if (!h) return null;
    sectionsInfo.push({ s, title: h.textContent.replace(/\s+/g, ' ').trim() });
    const p = planFor(cont, 320);
    const items = s.dataset.foldItems ? [...s.querySelectorAll(s.dataset.foldItems)].map((it) => {
      const ik = kids(it), hd = ik.findIndex((c) => heading(c));
      if (hd < 0) return null;
      const body = ik.slice(hd + 1);
      if (!body.length) return null;
      const r = body[0].getBoundingClientRect(), r2 = body[body.length - 1].getBoundingClientRect();
      return r2.bottom - r.top >= 220 ? { it, body, title: heading(ik[hd]).textContent.replace(/\s+/g, ' ').trim() } : null;
    }).filter(Boolean) : [];
    return { s, cont, p, items, title: sectionsInfo[sectionsInfo.length - 1].title };
  }).filter((x) => x && x.p);
  if (!plans.length) return;
  root.dataset.cf = '1'; // case-mobile.js se aparta: este módulo hace su trabajo
  themeVars();
  plans.forEach(({ s, cont, p, items, title }) => {
    const num = (s.querySelector('.eyebrow, [class*="eyebrow"]')?.textContent || '').trim().match(/^(\d{2})\s*[·.\-–]/);
    if (num) s.dataset.num = num[1];
    const subs = items.map((x, j) => build(x.it, null, x.body, x.title, { sub: true, id: `${s.id}-i${j}` }));
    const f = build(cont, null, p.body, title, { sec: s, id: s.id });
    subs.forEach((sf) => { sf.parent = f; });
  });
  const start = store.get() === 'completo';
  folds.forEach((f) => { f.fold.classList.add('cf-inst'); if (start) setOpen(f, true, { instant: true }); });
  requestAnimationFrame(() => folds.forEach((f) => f.fold.classList.remove('cf-inst')));
  buildBar(plans[0].s);
  buildIndex();
  // Enlaces internos y URL con #ancla: abren la sección que contiene el destino antes de saltar
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const t = d.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (t) openPath(t, { instant: true });
  });
  if (location.hash) {
    const t = d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) { openPath(t, { instant: true }); requestAnimationFrame(() => t.scrollIntoView()); }
  }
  syncSwitch();
}

/* ---------- Barra Resumen / Caso completo ---------- */
let sw, status;
const allOpen = () => folds.length > 0 && folds.every((f) => f.open);
function syncSwitch() {
  if (!sw) return;
  const full = allOpen();
  sw.setAttribute('aria-pressed', String(full));
  status.textContent = full ? L.fullSt : L.sumSt;
}
function setAll(open, persist) {
  folds.forEach((f) => setOpen(f, open));
  if (persist) store.set(open ? 'completo' : 'resumen');
}
function buildBar(first) {
  const bar = el('div', 'cf-bar', { role: 'group', 'aria-label': L.view });
  sw = el('button', 'cf-sw', { type: 'button', 'aria-pressed': 'false', 'aria-label': L.full });
  sw.innerHTML = `<span aria-hidden="true">${L.sum}</span><span aria-hidden="true">${L.full}</span>`;
  const hint = el('p'); hint.textContent = L.hint;
  status = el('span', 'cf-sr', { role: 'status' });
  bar.append(sw, hint, status);
  first.before(bar);
  sw.addEventListener('click', () => setAll(!allOpen(), true));
}

/* ---------- Índice flotante ---------- */
function buildIndex() {
  const fab = el('button', 'cf-fab', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'cf-idx' });
  fab.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>${L.idx}</span>`;
  const nav = el('nav', 'cf-idx', { id: 'cf-idx', 'aria-label': L.idxT, hidden: '' });
  const ol = el('ol');
  sectionsInfo.forEach(({ s, title }) => { const li = el('li'), a = el('a', '', { href: `#${s.id}` }); a.textContent = title; li.append(a); ol.append(li); });
  const all = el('div', 'cf-all');
  [[L.all, true], [L.none, false]].forEach(([t, v]) => { const b = el('button', '', { type: 'button' }); b.textContent = t; b.addEventListener('click', () => setAll(v, true)); all.append(b); });
  nav.append(all, ol);
  d.body.append(nav, fab);
  const close = (focus) => { nav.hidden = true; fab.setAttribute('aria-expanded', 'false'); if (focus) fab.focus(); };
  fab.addEventListener('click', () => { const open = nav.hidden; nav.hidden = !open; fab.setAttribute('aria-expanded', String(open)); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !nav.hidden) close(true); });
  d.addEventListener('pointerdown', (e) => { if (!nav.hidden && !nav.contains(e.target) && !fab.contains(e.target)) close(false); });
  if ('IntersectionObserver' in window) {
    const links = new Map(sectionsInfo.map(({ s }, i) => [s, ol.children[i].firstChild]));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.removeAttribute('aria-current')); links.get(e.target).setAttribute('aria-current', 'location'); } }), { rootMargin: '-40% 0px -55% 0px' });
    sectionsInfo.forEach(({ s }) => io.observe(s));
  }
}

/* ---------- Carruseles ---------- */
function initCarousels() {
  const lang = L;
  let lb;
  const open = (img, cap) => {
    if (!lb) {
      lb = el('dialog', 'cf-lb', { 'aria-label': lang.zoom });
      d.body.append(lb);
      lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    }
    lb.innerHTML = '';
    const big = el('img', '', { src: img.currentSrc || img.src, alt: img.alt });
    const p = el('p'); p.textContent = cap || '';
    const b = el('button', '', { type: 'button' }); b.textContent = lang.close; b.addEventListener('click', () => lb.close());
    lb.append(big, p, b);
    lb.showModal();
  };
  d.querySelectorAll('[data-carousel]').forEach((c) => {
    const w = el('div', 'cf-carw');
    c.before(w);
    w.append(c);
    c.classList.add('cf-car');
    c.tabIndex = 0;
    if (!c.hasAttribute('role')) c.setAttribute('role', 'region');
    c.querySelectorAll('figure').forEach((fig) => {
      const img = fig.querySelector('img');
      if (!img) return;
      const z = el('button', 'cf-zoom', { type: 'button', 'aria-label': `${lang.zoom}: ${img.alt}` });
      img.before(z); z.append(img);
      z.addEventListener('click', () => open(img, fig.querySelector('figcaption')?.textContent));
    });
    const mk = (cls, label, path) => { const b = el('button', `cf-nav ${cls}`, { type: 'button', 'aria-label': label }); b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; return b; };
    const p = mk('p', lang.prev, 'M15 6l-6 6 6 6'), n = mk('n', lang.next, 'M9 6l6 6-6 6');
    w.append(p, n);
    const step = (dir) => c.scrollBy({ left: dir * c.clientWidth * 0.85, behavior: rm.matches ? 'auto' : 'smooth' });
    p.addEventListener('click', () => step(-1)); n.addEventListener('click', () => step(1));
    const upd = () => { p.disabled = c.scrollLeft < 4; n.disabled = c.scrollLeft + c.clientWidth >= c.scrollWidth - 4; };
    c.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
    c.addEventListener('load', upd, true);
  });
}

themeVars();
initCarousels();
if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', initFolds);
else initFolds();
