import cssUrl from './cursor2.css?url'; // ?url: el CSS no se inyecta en el <head> de todas las paginas (movil no lo carga)

/* Cursor 2.0. main.js solo lo importa con (hover:hover)+(pointer:fine)+sin reduced-motion+>1024px.
   Un unico rAF (muelle del halo, imanes, estela, inercia del arrastre, progreso) que se apaga en reposo.
   Estados por elemento: '' | mag | view | web | clip | drag | text | zoom | focus.
   Forzables con data-cursor="<estado>" y data-cursor-label="..." en cualquier elemento. */

const D = document, root = D.documentElement, body = D.body;
await new Promise(r => { const l = D.createElement('link'); l.rel = 'stylesheet'; l.href = cssUrl; l.onload = l.onerror = r; D.head.append(l); });
const T = {
  es: { view: 'Ver caso', web: 'Abrir web', clip: 'Ver clip', drag: 'Arrastra' },
  ca: { view: 'Veure cas', web: 'Obrir web', clip: 'Veure clip', drag: 'Arrossega' },
  en: { view: 'View case', web: 'Open site', clip: 'Watch clip', drag: 'Drag' },
};
const lab = k => (T[(root.lang || 'es').slice(0, 2)] || T.es)[k];

/* Selectores */
const FIELD = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,select,[contenteditable="true"],[contenteditable=""]';
const DRAG = '.test-g,[data-drag]';
const CARD = '.bc,.lab-card,.lab-feat';
// Imanes que SE DESPLAZAN (los .btn-p/.btn-s/.nav-cta/#fcta ya tienen el suyo en motion.js/main.js/cinema.js: solo atraen al halo)
const MOVE = '.nav-links a,.nav-logo,.cur-trigger,.lang-trigger,.dk,.tc,.fb,.fx-soc,.fx-top,.fx-lang-btn,.tag,[data-magnet]';
const PULL = '.btn-p,.btn-s,.nav-cta,#fcta,.fx-cta';
const BTN = 'a[href],button,[role=button],summary,label';
const TEXT = 'p,h1,h2,h3,h4,h5,h6,li,blockquote,figcaption,dd,dt,.tq';
const FORCED = new Set(['mag', 'view', 'web', 'clip', 'drag', 'text', 'zoom', 'focus']);

/* DOM */
const ICON = {
  zoom: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 8v5M8 10.5h5"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  drag: '<svg class="c2-ar" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-6 6 6 6"/></svg>',
};
const N = 7, C = 2 * Math.PI * 18;
const c2 = D.createElement('div');
c2.id = 'c2'; c2.dataset.s = ''; c2.setAttribute('aria-hidden', 'true');
c2.innerHTML = '<i class="c2-t"></i>'.repeat(N) +
  '<div class="c2-r"><b class="c2-b"><svg viewBox="0 0 40 40"><circle class="c2-tk" cx="20" cy="20" r="18"/><circle class="c2-pg" cx="20" cy="20" r="18"/></svg></b></div><div class="c2-lw"><span class="c2-l"></span></div>' +
  '<div class="c2-p"><i class="c2-d"></i><i class="c2-i"></i></div>';
body.append(c2);
const ring = c2.querySelector('.c2-r'), pt = c2.querySelector('.c2-p'), lw = c2.querySelector('.c2-lw'), lbl = c2.querySelector('.c2-l'), pg = c2.querySelector('.c2-pg');
const trail = [...c2.querySelectorAll('.c2-t')].map((el, i) => ({ el, x: 0, y: 0, k: 1 - i / (N + 1) }));
pg.style.strokeDasharray = C.toFixed(2);

/* Estado */
let px = -99, py = -99, rx = -99, ry = -99, vx = 0, vy = 0;
let raf = 0, last = 0, started = false, moved = false, pgDirty = true, pgv = -1, scT = 0, scActive = false;
let st = '', stEl = null, hit = null, act = null, lastScan = 0, hitT = 0;
const mags = new Map();           // el -> {x,y,vx,vy,tx,ty,mv}
const vis = new Set();            // imanes visibles en el viewport
const seen = new WeakSet();
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)), { rootMargin: '60px' });
function scan() {
  lastScan = performance.now();
  D.querySelectorAll(MOVE + ',' + PULL).forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
}

const wake = () => { if (!raf && !D.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
const clamp = (v, m) => Math.max(-m, Math.min(m, v));

/* ── resolucion de estado por elemento ── */
function resolve(t) {
  if (!t || !t.closest) return ['', null];
  const f = t.closest('[data-cursor]:not(body)');
  if (f && FORCED.has(f.dataset.cursor)) return [f.dataset.cursor, f];
  if (t.closest(FIELD)) return ['focus', null];
  const dr = t.closest(DRAG);
  if (dr && dr.scrollWidth > dr.clientWidth + 2) return ['drag', dr];
  const card = t.closest(CARD);
  if (card) {
    if (t.closest('.pv-btn')) return ['mag', t.closest('.pv-btn')]; // controles del movil vivo (preview.js)
    if (t.closest('.pv-host') && card.querySelector('video[data-src]')) return ['clip', card]; // el movil vivo (data-clip) no es un clip: lleva al caso
    return [card.target === '_blank' ? 'web' : 'view', card];
  }
  if (t.closest(BTN)) return ['mag', t.closest(BTN)];
  if (t.closest('video')) return ['clip', null];
  if (t.closest('img,picture')) return ['zoom', null];
  if (t.closest(TEXT)) return ['text', null];
  return ['', null];
}

function setLabel(s, el) {
  const custom = el && el.dataset && el.dataset.cursorLabel;
  let h = '';
  if (s === 'view' || s === 'web') h = custom || lab(s);
  else if (s === 'clip') h = ICON.play + '<span>' + (custom || lab('clip')) + '</span>';
  else if (s === 'drag') h = ICON.drag + '<span>' + (custom || lab('drag')) + '</span>' + ICON.drag.replace('c2-ar', 'c2-ar c2-ar-r');
  else if (s === 'zoom') h = ICON.zoom;
  lbl.innerHTML = h;
}

function apply() {
  // proximidad de iman manda salvo en estados "de contenido"
  let s = hit ? hit[0] : '', el = hit ? hit[1] : null;
  if (act && !['view', 'web', 'clip', 'drag', 'focus'].includes(s)) { s = 'mag'; el = act; }
  if (s === st && el === stEl) return;
  const prev = st;
  st = s; stEl = el;
  c2.dataset.s = s;
  if (s !== prev || s === 'mag') {
    if (s === 'mag' && el) { const r = el.getBoundingClientRect(); c2.style.setProperty('--s', clamp((Math.min(r.width, r.height) + 22) / 40, 3).toFixed(2)); }
    else c2.style.removeProperty('--s');
    setLabel(s, el);
  }
  if (s !== '') for (const q of trail) { q.x = px; q.y = py; }
  wake();
}

/* ── bucle ── */
function tick(now) {
  raf = 0;
  if (D.hidden) return;
  const dt = Math.min((now - last) / 16.67 || 1, 2.5); last = now;
  let busy = false;

  // imanes: el mas cercano dentro del radio de atraccion
  if (moved) {
    if (now - lastScan > 3000) scan();
    let best = null, bd = 1e9;
    for (const el of vis) {
      const r = el.getBoundingClientRect(), m = mags.get(el);
      const cx = r.left + r.width / 2 - (m ? m.x : 0), cy = r.top + r.height / 2 - (m ? m.y : 0);
      const R = 26, hw = r.width / 2 + R, hh = r.height / 2 + R;
      const dx = px - cx, dy = py - cy;
      if (Math.abs(dx) < hw && Math.abs(dy) < hh) { const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = { el, dx, dy, w: r.width, h: r.height }; } }
    }
    for (const [el, m] of mags) { m.tx = 0; m.ty = 0; }
    if (best && !dg) {
      if (best.el.matches(MOVE)) {
        const m = mags.get(best.el) || { x: 0, y: 0, vx: 0, vy: 0 }; mags.set(best.el, m);
        const cap = Math.min(16, Math.min(best.w, best.h) * .45);
        m.tx = clamp(best.dx * .38, cap); m.ty = clamp(best.dy * .38, cap);
      }
      act = best.el; act._c2 = best;
    } else act = null;
    if (hit && ['view', 'web', 'clip', 'drag', 'focus'].includes(hit[0])) act = null;
    apply();
  }
  for (const [el, m] of mags) {
    m.vx += (m.tx - m.x) * .2 * dt; m.vy += (m.ty - m.y) * .2 * dt;
    const d = .62 ** dt; m.vx *= d; m.vy *= d; m.x += m.vx * dt; m.y += m.vy * dt;
    const done = !m.tx && !m.ty && Math.abs(m.x) < .05 && Math.abs(m.y) < .05 && Math.abs(m.vx) < .05 && Math.abs(m.vy) < .05;
    el.style.translate = done ? '' : `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px`;
    if (done) mags.delete(el); else busy = true;
  }

  // objetivo del halo: puntero, o atraido hacia el centro del iman
  let tx = px, ty = py;
  if (act && act._c2) {
    const m = mags.get(act), r = act.getBoundingClientRect();
    tx = px + (r.left + r.width / 2 - px) * .5; ty = py + (r.top + r.height / 2 - py) * .5;
    if (!m) { /* PULL: no se mueve */ }
  }
  // muelle ligeramente subamortiguado
  vx += (tx - rx) * .17 * dt; vy += (ty - ry) * .17 * dt;
  const dd = .6 ** dt; vx *= dd; vy *= dd; rx += vx * dt; ry += vy * dt;
  ring.style.transform = lw.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0)`;
  pt.style.transform = `translate3d(${px}px,${py}px,0)`;
  if (Math.abs(tx - rx) > .1 || Math.abs(ty - ry) > .1 || Math.abs(vx) > .05 || Math.abs(vy) > .05) busy = true;

  // estela (solo en reposo; transform only)
  if (st === '') {
    let fx = px, fy = py;
    for (const q of trail) {
      q.x += (fx - q.x) * .42; q.y += (fy - q.y) * .42;
      q.el.style.transform = `translate3d(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px,0) scale(${q.k.toFixed(2)})`;
      if (Math.abs(fx - q.x) + Math.abs(fy - q.y) > .3) busy = true;
      fx = q.x; fy = q.y;
    }
  }

  // anillo de progreso de scroll
  if (pgDirty) {
    pgDirty = false;
    const h = root.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
    if (Math.abs(p - pgv) > .002) { pgv = p; pg.style.strokeDashoffset = (C * (1 - p)).toFixed(2); }
  }

  // inercia del arrastre
  if (inert) {
    const el = inert.el, before = el.scrollLeft;
    el.scrollLeft = before + inert.v * dt;
    inert.v *= .945 ** dt;
    if (Math.abs(inert.v) < .2 || el.scrollLeft === before) { el.style.scrollSnapType = ''; el.classList.remove('c2-dragging'); inert = null; }
    else busy = true;
  }
  moved = false;
  if (busy) raf = requestAnimationFrame(tick);
}

/* ── arrastre real con inercia ── */
let dg = null, inert = null, suppress = false;
function release() {
  if (!dg) return;
  const { el, moved: mv, v } = dg;
  dg = null; c2.classList.remove('dn');
  if (mv) { suppress = true; inert = { el, v: clamp(-v, 40) }; wake(); }
  else el.classList.remove('c2-dragging');
}
D.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') return;
  suppress = false;
  const r = D.createElement('i');
  r.className = 'c2-rp'; r.style.translate = `${e.clientX}px ${e.clientY}px`;
  r.addEventListener('animationend', () => r.remove());
  c2.append(r); c2.classList.add('dn');
  if (e.button !== 0) return;
  const el = e.target.closest?.(DRAG);
  if (!el || el.scrollWidth <= el.clientWidth + 2) return;
  inert = null; el.style.scrollSnapType = 'none';
  dg = { el, x0: e.clientX, s0: el.scrollLeft, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false, id: e.pointerId };
}, { passive: true });
D.addEventListener('mousedown', e => { if (e.target.closest?.(DRAG)) e.preventDefault(); });
D.addEventListener('dragstart', e => { if (e.target.closest?.(DRAG)) e.preventDefault(); });
D.addEventListener('pointerup', () => { c2.classList.remove('dn'); release(); });
D.addEventListener('pointercancel', () => { c2.classList.remove('dn'); release(); });
D.addEventListener('click', e => { if (suppress) { suppress = false; e.preventDefault(); e.stopPropagation(); } }, true);

/* ── entradas ── */
D.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const nx = e.clientX, ny = e.clientY;
  if (body.classList.contains('c2-kb') && Math.hypot(nx - px, ny - py) > 2) body.classList.remove('c2-kb');
  if (!started) { // primer movimiento: aparece sin viajar desde (0,0)
    started = true; scan(); rx = nx; ry = ny; for (const q of trail) { q.x = nx; q.y = ny; }
    body.classList.add('c2');
    // posicion aplicada ya, antes de mostrarlo: ni un frame en (0,0)
    const tf = `translate3d(${nx}px,${ny}px,0)`;
    ring.style.transform = lw.style.transform = pt.style.transform = tf;
    for (const q of trail) q.el.style.transform = tf;
    requestAnimationFrame(() => c2.classList.add('on'));
  }
  px = nx; py = ny; moved = true;
  if (dg) {
    const dx = nx - dg.x0;
    if (!dg.moved && Math.abs(dx) > 4) {
      dg.moved = true; dg.el.classList.add('c2-dragging');
      try { dg.el.setPointerCapture(dg.id); } catch (_) {}
    }
    if (dg.moved) {
      dg.el.scrollLeft = dg.s0 - dx;
      const inst = (nx - dg.lx) / Math.max(e.timeStamp - dg.lt, 1) * 16.67;
      dg.v = dg.v * .6 + inst * .4; dg.lx = nx; dg.lt = e.timeStamp;
    }
  }
  wake();
}, { passive: true });
D.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse' || dg) return;
  hit = resolve(e.target); apply();
}, { passive: true });
root.addEventListener('mouseleave', () => c2.classList.remove('on'));
root.addEventListener('mouseenter', () => started && c2.classList.add('on'));
addEventListener('scroll', () => {
  pgDirty = true; wake();
  if (!scActive) { scActive = true; c2.classList.add('sc'); }
  clearTimeout(scT);
  scT = setTimeout(() => { scActive = false; c2.classList.remove('sc'); if (started && !dg) { hit = resolve(D.elementFromPoint(px, py)); apply(); } }, 140);
}, { passive: true });
addEventListener('resize', () => { pgDirty = true; wake(); }, { passive: true });
D.addEventListener('visibilitychange', () => { if (D.hidden) { cancelAnimationFrame(raf); raf = 0; } else wake(); });
D.addEventListener('keydown', e => { if (e.key === 'Tab') body.classList.add('c2-kb'); }, { passive: true });
