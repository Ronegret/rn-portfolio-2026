import cssUrl from './touch.css?url';

/* La hoja de estilos se inyecta aquí (no como <link> del HTML): en escritorio no se descarga */
document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: cssUrl }));

/* Experiencia táctil (carga solo en pointer:coarse o ≤900px). Un único rAF compartido; listeners pasivos;
   will-change solo durante gestos. Todo degrada: sin JS o con reduced-motion el sitio sigue siendo la lista normal. */
const doc = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rmq = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => rmq.matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* privado */ } } };

const TXT = {
  es: { view: 'Vista de proyectos', list: 'Lista', deck: 'Baraja', qv: 'Vista rápida', close: 'Cerrar', grab: 'Cambiar la altura de la hoja', car: 'Proyectos destacados', go: n => `Ir al proyecto ${n}` },
  ca: { view: 'Vista de projectes', list: 'Llista', deck: 'Baralla', qv: 'Vista ràpida', close: 'Tancar', grab: 'Canviar l’alçada del full', car: 'Projectes destacats', go: n => `Anar al projecte ${n}` },
  en: { view: 'Project view', list: 'List', deck: 'Deck', qv: 'Quick view', close: 'Close', grab: 'Change sheet height', car: 'Featured projects', go: n => `Go to project ${n}` },
};
const tx = () => TXT[doc.lang] || TXT.es;
const relabel = [];
new MutationObserver(() => relabel.forEach(f => f())).observe(doc, { attributes: true, attributeFilter: ['lang'] });

/* Muelle real como easing CSS (linear()); ζ<1 deja el rebote. Sin soporte: curva con overshoot. */
const spring = (zeta, w0, n = 40) => {
  const wd = w0 * Math.sqrt(1 - zeta * zeta), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push((1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t))).toFixed(3));
  }
  pts[n] = '1';
  return `linear(${pts.join(',')})`;
};
const hasLinear = CSS.supports('transition-timing-function', 'linear(0,1)');
const SPRING = hasLinear ? spring(.5, 16) : 'cubic-bezier(.34,1.56,.64,1)';
const SHEET_SPRING = hasLinear ? spring(.74, 16) : 'cubic-bezier(.22,1,.36,1)';
if (hasLinear) doc.style.setProperty('--tj-spring', SPRING);

/* Háptica discreta: solo con activación de usuario y sin reduced-motion */
const buzz = ms => { if (!reduced() && navigator.vibrate && navigator.userActivation?.isActive) navigator.vibrate(ms); };

/* ═════════ rAF compartido: velocidad de scroll → marquesinas, flotantes y baraja ═════════ */
let raf = 0, lastY = scrollY, vel = 0, rate = 1, down = false, tMove = 0, lastDeckIdx = -1;
const hooks = { deck: null };
let marquees = [];
const collectMarquees = () => { marquees = document.getAnimations().filter(a => /^(sx-run|mqroll)$/.test(a.animationName || '')); };
const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
function frame() {
  raf = 0;
  const y = scrollY;
  if (y !== lastY) tMove = performance.now();
  vel += ((y - lastY) - vel) * .2;
  lastY = y;
  if (!reduced()) {
    if (!marquees.length) collectMarquees();
    const target = 1 + Math.min(Math.abs(vel) / 10, 5);
    rate += (target - rate) * .12;
    if (Math.abs(rate - 1) < .01 && Math.abs(vel) < .05) rate = 1;
    marquees.forEach(a => { if (a.playbackRate !== rate) a.playbackRate = rate; });
    const nd = vel > 3 && y > 200 ? true : vel < -1.5 || y < 200 || performance.now() - tMove > 900 ? false : down; // el dock vuelve solo al quedarse quieto
    if (nd !== down) { down = nd; doc.classList.toggle('tj-down', down); }
  }
  const busy = hooks.deck?.();
  if (Math.abs(vel) > .05 || rate !== 1 || down || busy) raf = requestAnimationFrame(frame);
}
addEventListener('scroll', wake, { passive: true });
addEventListener('load', () => setTimeout(collectMarquees, 600));

/* (4) Barra del navegador / teclado: el inset inferior real del viewport visual desplaza #fcta y #dock */
if (window.visualViewport) {
  const vv = visualViewport;
  const sync = () => doc.style.setProperty('--tj-vb', `${Math.max(0, innerHeight - vv.height - vv.offsetTop).toFixed(0)}px`);
  vv.addEventListener('resize', sync);
  vv.addEventListener('scroll', sync);
}

/* ═════════ (1) Baraja ═════════ */
const sec = $('#proyectos'), bento = sec && $('.bento', sec), island = bento && bento.closest('astro-island');
const cardsOf = () => bento ? [...bento.children].filter(c => !c.classList.contains('m-more') && !c.classList.contains('fhid')) : [];
const nativeTL = CSS.supports('animation-timeline: view()');
let deckOn = false, userChose = false, idx = 0, prog, seg;
const ICON = {
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  deck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="2"/><path d="M3 7v10M21 7v10" stroke-linecap="round"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  qv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 15l7-7 7 7"/><path d="M5 20h14"/></svg>',
};

function buildDeckUI() {
  seg = document.createElement('div');
  seg.className = 'tj-seg'; seg.setAttribute('role', 'group');
  seg.innerHTML = `<button type="button" data-v="list">${ICON.list}<span></span></button><button type="button" data-v="deck">${ICON.deck}<span></span></button>`;
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setDeck(b.dataset.v === 'deck', true); });
  island.before(seg);
  prog = document.createElement('div');
  prog.className = 'tj-prog';
  prog.innerHTML = '<span class="tj-count" aria-hidden="true"></span><div class="tj-bar" aria-hidden="true"><i></i></div><div class="tj-dots"></div>';
  prog.querySelector('.tj-dots').addEventListener('click', e => { const d = e.target.closest('.tj-dot'); if (d) goTo(+d.dataset.i, true); });
  island.after(prog);
  const lab = () => {
    const t = tx();
    seg.setAttribute('aria-label', t.view);
    seg.querySelector('[data-v=list] span').textContent = t.list;
    seg.querySelector('[data-v=deck] span').textContent = t.deck;
    bento.setAttribute('aria-label', t.car);
    $$('.tj-qv').forEach(b => { b.setAttribute('aria-label', `${t.qv}: ${b.parentElement.querySelector('.bc-h')?.textContent.trim() || ''}`); });
    $$('.tj-dot').forEach(d => d.setAttribute('aria-label', t.go(+d.dataset.i + 1)));
  };
  relabel.push(lab); lab();
}

const pad = n => String(n).padStart(2, '0');
function rebuildDots() {
  const n = cardsOf().length, wrap = prog.querySelector('.tj-dots');
  wrap.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" class="tj-dot" data-i="${i}" aria-label="${tx().go(i + 1)}"></button>`).join('');
  wrap.style.display = n > 12 ? 'none' : '';
  lastDeckIdx = -1; hooks.deck?.();
}

/* Un solo cálculo por frame: tarjeta activa, progreso, y --tj-p solo si no hay scroll-driven nativo */
function deckFrame() {
  if (!deckOn) return false;
  const cs = cardsOf(), mid = bento.scrollLeft + bento.clientWidth / 2;
  let best = 0, bd = 1e9;
  cs.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } if (!nativeTL) c.style.setProperty('--tj-p', clamp((c.offsetLeft + c.offsetWidth / 2 - mid) / (bento.clientWidth * .6), -1, 1).toFixed(3)); });
  const max = bento.scrollWidth - bento.clientWidth;
  prog.querySelector('.tj-bar i').style.transform = `scaleX(${max > 0 ? clamp(.08 + .92 * bento.scrollLeft / max, 0, 1).toFixed(3) : 1})`;
  if (best !== lastDeckIdx) {
    if (lastDeckIdx !== -1) buzz(6);
    lastDeckIdx = idx = best;
    prog.querySelector('.tj-count').textContent = `${pad(best + 1)} / ${pad(cs.length)}`;
    $$('.tj-dot', prog).forEach((d, i) => d.setAttribute('aria-current', String(i === best)));
    cs.forEach((c, i) => {
      c.classList.toggle('tj-cur', i === best);
      c.toggleAttribute('data-tj-hold', i !== best); // preview.js no reproduce los clips marcados
      const v = c.querySelector('video[data-src]');
      if (!v) return;
      if (i === best) { if (!reduced() && !document.hidden) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } } else v.pause();
    });
  }
  return false;
}
hooks.deck = deckFrame;

function goTo(i, user) {
  const c = cardsOf()[i];
  if (!c) return;
  bento.scrollTo({ left: c.offsetLeft - (bento.clientWidth - c.offsetWidth) / 2, behavior: reduced() ? 'auto' : 'smooth' });
  if (user) buzz(8);
}

/* "Baraja": las tarjetas siguientes salen de debajo de la primera con muelle */
function fan() {
  if (reduced() || !bento.animate) return;
  const cs = cardsOf().slice(0, 3), w = cs[0].offsetWidth + 14;
  cs.forEach((c, i) => {
    if (!i) return;
    c.animate([{ translate: `${-w * i}px 0`, rotate: `${i * 5}deg`, opacity: .0 }, { translate: '0 0', rotate: '0deg', opacity: 1 }], { duration: 650, delay: i * 70, easing: SPRING, fill: 'backwards' });
  });
}

const markSeg = on => $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String((b.dataset.v === 'deck') === on)));

function setDeck(on, user) {
  deckOn = on;
  sec.classList.toggle('tj-deck-on', on);
  sec.classList.toggle('tj-js', on && !nativeTL);
  prog.classList.toggle('on', on);
  markSeg(on);
  if (on) { bento.setAttribute('role', 'region'); } else { bento.removeAttribute('role'); cardsOf().forEach(c => { c.classList.remove('tj-cur'); c.removeAttribute('data-tj-hold'); c.style.removeProperty('--tj-p'); }); }
  if (user) { userChose = true; store.set('rn-deck', on ? '1' : '0'); buzz(10); }
  if (on) {
    bento.scrollLeft = 0; rebuildDots(); wake(); if (user) fan();
    // Volver de un caso (case-transitions.js deja el slug): la baraja se coloca en su tarjeta
    const back = window.__rnBack, c = back && cardsOf().find(k => (k.matches('a.bc') ? k : k.querySelector('a.bc'))?.getAttribute('href') === `/${back}/`);
    window.__rnBack = '';
    if (c && !user) { bento.scrollLeft = c.offsetLeft - (bento.clientWidth - c.offsetWidth) / 2; wake(); }
  }
  else if (user) cardsOf()[idx]?.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
}

function initDeck() {
  if (!bento || !island || !$('.fbar', island)) return;
  buildDeckUI();
  bento.addEventListener('scroll', wake, { passive: true });
  // el filtro (.fhid) y "Ver más" (m-extra) cambian las tarjetas visibles: reconstruir puntos solo si cambia el número
  let n0 = cardsOf().length;
  new MutationObserver(() => { const n = cardsOf().length; if (deckOn && n !== n0) { n0 = n; bento.scrollLeft = 0; rebuildDots(); } else n0 = n; })
    .observe(bento, { attributes: true, attributeFilter: ['class'], subtree: true });
  const want = (store.get('rn-deck') || (matchMedia('(max-width: 640px)').matches ? '1' : '0')) === '1';
  markSeg(want);
  // El cambio de layout (lista → baraja) es lo caro: se aplica cuando la sección está cerca, y la baraja se despliega al verse
  if (want) {
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect(); if (userChose) return; setDeck(true, false);
      const vis = new IntersectionObserver(([v]) => { if (v.isIntersecting) { vis.disconnect(); fan(); } }, { threshold: .3 });
      vis.observe(bento);
    }, { rootMargin: '900px 0px' });
    near.observe(sec);
  }
}

/* ═════════ (2) Hoja inferior ═════════ */
let dlg, panel, scrim, opener = null, snapPos = [], snapI = 1, curY = 0, H = 0, anim = null, dragging = null, openedAt = 0, suppressUntil = 0;

function buildSheet() {
  dlg = document.createElement('dialog');
  dlg.className = 'tj-sheet';
  dlg.setAttribute('aria-labelledby', 'tj-sh-t');
  dlg.innerHTML = `<div class="tj-scrim"></div><div class="tj-panel"><div class="tj-head"><button type="button" class="tj-grab"></button><button type="button" class="tj-x">${ICON.x}</button></div><div class="tj-body"><figure class="tj-thumb"><img alt="" decoding="async"></figure><div class="tj-tags"></div><h2 id="tj-sh-t"></h2><p class="tj-sum"></p><p class="tj-meta"></p><a class="btn-p tj-cta"></a></div></div>`;
  document.body.append(dlg);
  panel = $('.tj-panel', dlg); scrim = $('.tj-scrim', dlg);
  const lab = () => { $('.tj-x', dlg).setAttribute('aria-label', tx().close); $('.tj-grab', dlg).setAttribute('aria-label', tx().grab); };
  relabel.push(lab); lab();
  $('.tj-x', dlg).addEventListener('click', () => closeSheet());
  scrim.addEventListener('click', () => performance.now() - openedAt > 350 && closeSheet());
  dlg.addEventListener('click', e => { if (e.target === dlg && performance.now() - openedAt > 350) closeSheet(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeSheet(); });
  // teclado: el asa cambia de altura con Enter/Espacio o flechas
  const grab = $('.tj-grab', dlg);
  grab.addEventListener('click', () => snapTo((snapI + 1) % 3, 0));
  grab.addEventListener('keydown', e => { if (e.key === 'ArrowUp') { e.preventDefault(); snapTo(Math.max(0, snapI - 1), 0); } else if (e.key === 'ArrowDown') { e.preventDefault(); snapTo(Math.min(2, snapI + 1), 0); } });
  panel.addEventListener('pointerdown', onDown);
  panel.addEventListener('pointermove', onMove);
  panel.addEventListener('pointerup', onUp);
  panel.addEventListener('pointercancel', onUp);
}

const rub = d => 56 * (1 - Math.exp(-d / 90)); // resistencia elástica pasada la altura máxima
const setY = (y, fade = true) => {
  curY = y;
  panel.style.transform = `translateY(${y}px)`;
  if (fade) scrim.style.opacity = String(clamp(1 - Math.max(0, y - snapPos[2]) / (H + 24 - snapPos[2]), 0, 1));
};
const nowY = () => new DOMMatrix(getComputedStyle(panel).transform).m42;
const calc = () => {
  H = panel.offsetHeight;
  const vh = innerHeight;
  snapPos = [0, H - Math.min(H, vh * .64), H - Math.min(H, Math.max(vh * .34, 260))]; // [alto, medio, asomado]
};

function animateTo(y, ms, easing, done) {
  anim?.cancel();
  const from = curY;
  if (reduced() || from === y) { setY(y); done?.(); return; }
  panel.style.willChange = 'transform';
  const fade = scrim.animate([{ opacity: scrim.style.opacity || 0 }, { opacity: y >= H ? 0 : 1 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
  anim = panel.animate([{ transform: `translateY(${from}px)` }, { transform: `translateY(${y}px)` }], { duration: ms, easing });
  anim.onfinish = () => { setY(y, false); scrim.style.opacity = y >= H ? 0 : 1; fade.cancel(); anim = null; panel.style.willChange = ''; done?.(); };
  anim.oncancel = () => fade.cancel();
}

function snapTo(i, v) {
  snapI = i; calc();
  panel.classList.toggle('tj-full', i === 0);
  const dist = Math.abs(snapPos[i] - curY);
  animateTo(snapPos[i], clamp(300 + dist * .3 - Math.abs(v) * 90, 260, 720), SHEET_SPRING);
  buzz(8);
}

function openSheet(card, from) {
  if (dlg?.open) return;
  if (!dlg) buildSheet();
  const a = $('a.bc', card);
  if (!a) return;
  opener = from || a;
  const t = s => $(s, card)?.textContent.trim() || '';
  $('h2', dlg).textContent = t('.bc-h');
  $('.tj-sum', dlg).textContent = t('.bc-d');
  const meta = $('.tj-meta', dlg), m = t('.bc-m');
  meta.hidden = !m; meta.innerHTML = m ? '<span class="bc-m"></span>' : ''; if (m) meta.firstChild.textContent = m;
  const tags = $('.tj-tags', dlg); tags.replaceChildren(...$$('.bc-tag', card).map(s => { const n = document.createElement('span'); n.className = s.className; n.textContent = s.textContent; return n; }));
  const im = $('.bc-img img', card), th = $('.tj-thumb', dlg);
  th.hidden = !im; if (im) $('img', th).src = im.currentSrc || im.src;
  const cta = $('.tj-cta', dlg);
  cta.href = a.href; cta.textContent = t('.bc-link') || a.href;
  if (a.target) { cta.target = a.target; cta.rel = a.rel; } else { cta.removeAttribute('target'); cta.removeAttribute('rel'); }
  doc.classList.add('tj-lock');
  dlg.showModal();
  openedAt = performance.now();
  calc();
  panel.classList.remove('tj-full');
  snapI = 1; setY(H + 24, false); scrim.style.opacity = 0;
  animateTo(snapPos[1], 620, SHEET_SPRING);
  $('.tj-x', dlg).focus({ preventScroll: true });
  buzz(12);
}

function closeSheet() {
  if (!dlg?.open) return;
  buzz(8);
  const end = () => { dlg.close(); doc.classList.remove('tj-lock'); (opener || document.body).focus?.({ preventScroll: true }); };
  animateTo(H + 24, 340, 'cubic-bezier(.32,.72,0,1)', end);
}

function onDown(e) {
  const inHead = e.target.closest('.tj-head') && !e.target.closest('.tj-x');
  const inBody = e.target.closest('.tj-body') && snapI !== 0;
  if (!inHead && !inBody) return;
  if (e.target.closest('a,.tj-x')) return;
  if (anim) { const y = nowY(); anim.cancel(); setY(y, false); }
  dragging = { id: e.pointerId, y0: e.clientY, base: curY, s: [{ t: e.timeStamp, y: e.clientY }], moved: false };
  panel.setPointerCapture(e.pointerId);
}
function onMove(e) {
  if (!dragging || e.pointerId !== dragging.id) return;
  const dy = e.clientY - dragging.y0;
  if (!dragging.moved && Math.abs(dy) < 4) return;
  if (!dragging.moved) { dragging.moved = true; dlg.classList.add('tj-dragging'); panel.style.willChange = 'transform'; }
  let y = dragging.base + dy;
  if (y < 0) y = -rub(-y);
  setY(y);
  dragging.s.push({ t: e.timeStamp, y: e.clientY });
  if (dragging.s.length > 6) dragging.s.shift();
}
function onUp(e) {
  if (!dragging || e.pointerId !== dragging.id) return;
  const d = dragging; dragging = null;
  dlg.classList.remove('tj-dragging'); panel.style.willChange = '';
  if (!d.moved) return;
  const a = d.s[0], b = d.s[d.s.length - 1];
  const v = b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0; // px/ms, + hacia abajo
  const pos = [...snapPos, H + 24];
  const near = p => pos.reduce((bi, q, i) => Math.abs(q - p) < Math.abs(pos[bi] - p) ? i : bi, 0);
  const i = Math.abs(v) > .6 ? clamp(near(curY) + Math.sign(v), 0, 3) : near(curY + v * 180);
  if (i === 3) { closeSheet(); return; }
  snapTo(i, Math.abs(v));
}

/* Botón de vista rápida + pulsación larga */
function initQuickView() {
  if (!bento) return;
  const add = () => cardsOfAll().forEach(c => {
    if ($('.tj-qv', c) || !$('a.bc', c)) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tj-qv'; b.innerHTML = ICON.qv;
    $('a.bc', c).after(b);
    if (c.classList.contains('bfeat')) $('a.bc', c).append(Object.assign(document.createElement('i'), { className: 'tj-glow' }));
  });
  const cardsOfAll = () => [...bento.children].filter(c => !c.classList.contains('m-more'));
  add();
  relabel.push(() => $$('.tj-qv').forEach(b => b.setAttribute('aria-label', `${tx().qv}: ${b.parentElement.querySelector('.bc-h')?.textContent.trim() || ''}`)));
  relabel.forEach(f => f());
  bento.addEventListener('click', e => { const b = e.target.closest('.tj-qv'); if (b) openSheet(b.parentElement, b); });

  let lp = null;
  const stop = () => { if (lp) { clearTimeout(lp.t); lp.a.classList.remove('tj-hold'); lp = null; } };
  bento.addEventListener('pointerdown', e => {
    const a = e.target.closest('a.bc');
    if (!a || e.pointerType === 'mouse') return;
    stop();
    lp = { a, x: e.clientX, y: e.clientY, t: setTimeout(() => {
      const card = a.parentElement; stop();
      suppressUntil = performance.now() + 900;
      openSheet(card, a);
    }, 480) };
    a.classList.add('tj-hold');
  }, { passive: true });
  bento.addEventListener('pointermove', e => { if (lp && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 10) stop(); }, { passive: true });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => bento.addEventListener(t, stop, { passive: true }));
  bento.addEventListener('contextmenu', e => { if (e.target.closest('a.bc') && matchMedia('(pointer: coarse)').matches) e.preventDefault(); });
  document.addEventListener('click', e => { if (performance.now() < suppressUntil && e.target.closest?.('.bc')) { e.preventDefault(); e.stopPropagation(); } }, true);
}

/* ═════════ (3) Tacto vivo: muelle al pulsar, ondulación, brillo, háptica ═════════ */
const PRESS = '.btn-p,.btn-s,.nav-cta,#fcta,.fb,.m-more,.bc-d-more,.tj-seg button,.tj-qv,.tj-cta,.dk,.bc-link,.tj-dot,.lang-trigger,.cur-trigger,a.bc';
const RIPPLE = '.fb,.m-more,.bc-d-more,.tj-seg button,.tj-qv,.tj-cta';
const BUZZ = '.btn-p,.nav-cta,#fcta,.fb,.dk,.m-more,.tj-seg button,.tj-cta,.lang-opt';
const pressed = new Map();
let lit = null, litRaf = 0, lx = 0, ly = 0;

function pressIn(el) {
  if (!el.animate || reduced() || pressed.has(el)) return;
  const soft = el.matches('a.bc');
  pressed.set(el, el.animate([{ scale: '1' }, { scale: soft ? '.985' : '.93' }], { duration: 120, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }));
}
function pressOut(el) {
  const p = pressed.get(el);
  if (!p) return;
  pressed.delete(el);
  const cur = getComputedStyle(el).scale;
  p.cancel();
  el.animate([{ scale: cur === 'none' ? '1' : cur }, { scale: '1' }], { duration: 650, easing: SPRING });
}
function ripple(el, e) {
  if (reduced() || !el.animate) return;
  const r = el.getBoundingClientRect(), s = document.createElement('span');
  s.className = 'tj-rip';
  s.style.left = `${e.clientX - r.left}px`; s.style.top = `${e.clientY - r.top}px`;
  el.append(s);
  const k = Math.max(r.width, r.height) / 20 * 2.2;
  s.animate([{ transform: 'scale(0)', opacity: .28 }, { transform: `scale(${k})`, opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => s.remove();
}
function litMove() {
  litRaf = 0;
  if (!lit) return;
  const r = lit.getBoundingClientRect(), mx = lx - r.left, my = ly - r.top;
  lit.style.setProperty('--tx', `${mx.toFixed(0)}px`); lit.style.setProperty('--ty', `${my.toFixed(0)}px`);
  lit.style.setProperty('--mx', `${(mx / r.width * 100).toFixed(1)}%`); lit.style.setProperty('--my', `${(my / r.height * 100).toFixed(1)}%`);
}
function initFeel() {
  let timers = new Map();
  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    const el = e.target.closest?.(PRESS);
    if (el) {
      // Pequeña espera: si el dedo arranca un scroll llega pointercancel antes y no se hunde nada
      timers.set(el, setTimeout(() => pressIn(el), 70));
      const rip = e.target.closest(RIPPLE); if (rip) ripple(rip, e);
    }
    const card = e.target.closest('.bfeat > a.bc');
    if (card) { lit = card; lx = e.clientX; ly = e.clientY; card.classList.add('tj-lit'); litMove(); }
  }, { passive: true });
  const end = e => {
    if (e.pointerType === 'mouse') return;
    const el = e.target.closest?.(PRESS);
    $$('.tj-lit').forEach(c => c.classList.remove('tj-lit')); lit = null;
    timers.forEach((t, k) => { clearTimeout(t); timers.delete(k); });
    pressed.forEach((_, k) => pressOut(k));
  };
  ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, end, { passive: true }));
  document.addEventListener('pointermove', e => { if (!lit) return; lx = e.clientX; ly = e.clientY; if (!litRaf) litRaf = requestAnimationFrame(litMove); }, { passive: true });
  document.addEventListener('click', e => { if (e.target.closest?.(BUZZ)) buzz(8); }, { passive: true });
}

/* ═════════ (5) Parallax de titulares: ViewTimeline sobre `translate` (no pisa el rv-up de transform) ═════════ */
function initParallax() {
  if (reduced() || !window.ViewTimeline) return;
  const amp = { sh: 14, 'sec-n': 26 };
  const io = new IntersectionObserver(es => es.forEach(({ target: el, isIntersecting }) => {
    if (!isIntersecting) return;
    io.unobserve(el);
    const a = el.classList.contains('sh') ? amp.sh : amp['sec-n'];
    el.animate({ translate: [`0 ${a}px`, `0 ${-a}px`] }, { timeline: new ViewTimeline({ subject: el }), rangeStart: 'cover 0%', rangeEnd: 'cover 100%', easing: 'linear', fill: 'both' });
  }), { rootMargin: '60% 0px' });
  $$('.sh, .sec-n').forEach(el => io.observe(el));
}

/* ═════════ (6) Deslizar sobre el chip de tema ═════════ */
function initThemeSwipe() {
  let s = null, swallow = 0;
  document.addEventListener('pointerdown', e => {
    const box = e.target.closest?.('#dock,.mob-themes');
    if (!box || e.pointerType === 'mouse') return;
    s = { box, x: e.clientX, y: e.clientY, done: false };
  }, { passive: true });
  document.addEventListener('pointermove', e => {
    if (!s || s.done) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    s.done = true;
    const bs = $$('.dk', s.box), i = bs.findIndex(b => b.classList.contains('on'));
    const n = (i + (dx < 0 ? 1 : -1) + bs.length) % bs.length;
    bs[n].click();
    swallow = performance.now() + 400; // solo el click fantasma que sigue al gesto, no el nuestro
    buzz(10);
    if (!reduced()) s.box.animate([{ translate: `${dx < 0 ? -9 : 9}px 0` }, { translate: '0 0' }], { duration: 600, easing: SPRING });
  }, { passive: true });
  ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => { s = null; }, { passive: true }));
  document.addEventListener('click', e => { if (performance.now() < swallow && e.target.closest?.('#dock,.mob-themes')) { e.preventDefault(); e.stopPropagation(); } }, true);
}
// El dock deja pasar el scroll vertical y entrega el horizontal a pointer events
const st = document.createElement('style');
st.textContent = '@media (max-width:920px),(pointer:coarse){#dock,.mob-themes{touch-action:pan-y}}';
document.head.append(st);

const idle = f => ('requestIdleCallback' in window ? requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 800));
initFeel();
initThemeSwipe();
idle(() => { initDeck(); idle(() => { initQuickView(); initParallax(); wake(); }); });
