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
  es: { view: 'Vista de proyectos', list: 'Lista', deck: 'Baraja', qv: 'Vista rápida', close: 'Cerrar', grab: 'Cambiar la altura de la hoja', car: 'Proyectos destacados', go: n => `Ir al proyecto ${n}`, ann: (d, n) => d ? `Vista baraja: ${n} proyectos, desliza para recorrerlos` : `Vista lista: ${n} proyectos` },
  ca: { view: 'Vista de projectes', list: 'Llista', deck: 'Baralla', qv: 'Vista ràpida', close: 'Tancar', grab: 'Canviar l’alçada del full', car: 'Projectes destacats', go: n => `Anar al projecte ${n}`, ann: (d, n) => d ? `Vista baralla: ${n} projectes, llisca per recórrer-los` : `Vista llista: ${n} projectes` },
  en: { view: 'Project view', list: 'List', deck: 'Deck', qv: 'Quick view', close: 'Close', grab: 'Change sheet height', car: 'Featured projects', go: n => `Go to project ${n}`, ann: (d, n) => d ? `Deck view: ${n} projects, swipe to browse` : `List view: ${n} projects` },
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
const SOFT = hasLinear ? spring(.8, 15, 48) : 'cubic-bezier(.22,1,.36,1)'; // casi sin rebote: lo usan el FLIP lista⇄baraja y la píldora
if (hasLinear) { doc.style.setProperty('--tj-spring', SPRING); doc.style.setProperty('--tj-soft', SOFT); }

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
let deckOn = false, userChose = false, idx = 0, prog, seg, live;
const ICON = {
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>',
  deck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="2"/><path d="M3 7v10" stroke-linecap="round"/><path d="M21 7v10" stroke-linecap="round"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  qv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 15l7-7 7 7"/><path d="M5 20h14"/></svg>',
};

function buildDeckUI() {
  seg = document.createElement('div');
  seg.className = 'tj-seg'; seg.setAttribute('role', 'group');
  seg.innerHTML = `<i class="tj-pill" aria-hidden="true"></i><button type="button" data-v="list">${ICON.list}<span></span></button><button type="button" data-v="deck">${ICON.deck}<span></span></button>`;
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setDeck(b.dataset.v === 'deck', true); });
  island.before(seg);
  live = document.createElement('div');
  live.className = 'tj-sr'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  seg.after(live);
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

/* Un solo cálculo por frame: tarjeta activa, progreso, inclinación por velocidad, y --tj-p solo si no hay scroll-driven nativo */
let sl0 = 0, vx = 0, tilt = 0;
const keepIdx = i => { try { sessionStorage.setItem('rn-deck-i', String(i)); } catch { /* privado */ } };
function deckFrame() {
  if (!deckOn) return false;
  const cs = cardsOf(), mid = bento.scrollLeft + bento.clientWidth / 2;
  let best = 0, bd = 1e9;
  cs.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } if (!nativeTL) c.style.setProperty('--tj-p', clamp((c.offsetLeft + c.offsetWidth / 2 - mid) / (bento.clientWidth * .6), -1, 1).toFixed(3)); });
  const max = bento.scrollWidth - bento.clientWidth;
  prog.querySelector('.tj-bar i').style.transform = `scaleX(${max > 0 ? clamp(.08 + .92 * bento.scrollLeft / max, 0, 1).toFixed(3) : 1})`;
  // Inclinación: la tarjeta y sus vecinas se ladean según la velocidad del arrastre y se enderezan con inercia (rotate es componible, no pisa nada)
  vx += ((bento.scrollLeft - sl0) - vx) * .35; sl0 = bento.scrollLeft;
  tilt += ((reduced() || flying ? 0 : clamp(-vx * .3, -4, 4)) - tilt) * .2;
  if (Math.abs(tilt) < .03) tilt = 0;
  const deg = tilt ? `${tilt.toFixed(2)}deg` : '';
  cs.forEach((c, i) => { const v = Math.abs(i - best) <= 1 ? deg : ''; if (c._r !== v) { c._r = v; c.style.rotate = v; } });
  if (best !== lastDeckIdx) {
    if (lastDeckIdx !== -1) buzz(6);
    lastDeckIdx = idx = best; keepIdx(best);
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
  return tilt !== 0 || Math.abs(vx) > .1;
}
hooks.deck = deckFrame;

function goTo(i, user) {
  const c = cardsOf()[i];
  if (!c) return;
  bento.scrollTo({ left: c.offsetLeft - (bento.clientWidth - c.offsetWidth) / 2, behavior: reduced() ? 'auto' : 'smooth' });
  if (user) buzz(8);
}

/* "Baraja": las tarjetas siguientes salen de debajo de la primera con muelle (entrada inicial, sin interacción del usuario) */
function fan() {
  if (reduced() || !bento.animate) return;
  const cs = cardsOf().slice(0, 3), w = cs[0].offsetWidth + 14;
  cs.forEach((c, i) => {
    if (!i) return;
    c.animate([{ translate: `${-w * i}px 0`, rotate: `${i * 5}deg`, opacity: .0 }, { translate: '0 0', rotate: '0deg', opacity: 1 }], { duration: 650, delay: i * 70, easing: SOFT, fill: 'backwards' });
  });
}

const markSeg = on => { seg.dataset.view = on ? 'deck' : 'list'; $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String((b.dataset.v === 'deck') === on))); };

/* Estado de la vista (clases, ARIA, clips); no mide ni anima */
function paint(on) {
  deckOn = on;
  sec.classList.toggle('tj-deck-on', on);
  sec.classList.toggle('tj-js', on && !nativeTL);
  prog.classList.toggle('on', on);
  markSeg(on);
  if (on) bento.setAttribute('role', 'region');
  else {
    bento.removeAttribute('role');
    cardsOf().forEach(c => { c.classList.remove('tj-cur'); c.removeAttribute('data-tj-hold'); c.style.removeProperty('--tj-p'); c.style.rotate = ''; c._r = ''; });
    document.dispatchEvent(new Event('visibilitychange')); // preview.js reevalúa los clips de la lista (la baraja los había pausado)
  }
}

/* ═════ Transición Lista ⇄ Baraja ═════
   FLIP con muelle: se mide (First), se cambia el layout de una vez (Last) y cada tarjeta viaja de su sitio anterior al nuevo con `translate`+`scale`
   (solo composición). Las tarjetas que no estaban a la vista salen de debajo de la activa (abanico), las que se van se pliegan bajo ella.
   La altura del bloque no se anima (sería layout): lo que hay debajo hace el mismo FLIP en translate, así que el contenido se desliza sin salto.
   Se conserva la tarjeta que el usuario tenía en pantalla (activa) y la posición de lo que mira (conmutador / tarjeta / lo de debajo).
   Elegimos FLIP manual y no View Transitions: las tarjetas llevan <video> vivos, necesitan escalado uniforme con escalonado y rotación,
   y el snapshot de VT congela el clip y estira de forma no uniforme. */
let flights = [], flying = false;
const inVp = (r, m = 40) => r.width > 0 && r.height > 0 && r.bottom > -m && r.top < innerHeight + m && r.right > -m && r.left < innerWidth + m;
const cx = r => r.left + r.width / 2, cy = r => r.top + r.height / 2;
const jump = d => { if (Math.abs(d) > .5) scrollTo({ top: scrollY + d, behavior: 'instant' }); };
const belowAll = () => {
  const out = [];
  for (let n = sec.nextElementSibling; n; n = n.nextElementSibling) out.push(n);
  const f = $('footer'); if (f) out.push(f);
  return out;
};

function morph(on, animate) {
  const vh = innerHeight, cs = cardsOf();
  if (!cs.length) { paint(on); return; }
  cs.forEach(c => { if (c._r) { c.style.rotate = ''; c._r = ''; } });
  // FIRST: con las animaciones en vuelo medimos lo que el usuario ve, así una interrupción sigue desde donde estaba
  const first = cs.map(c => c.getBoundingClientRect());
  const sR = seg.getBoundingClientRect(), bR = bento.getBoundingClientRect();
  const kind = sR.bottom > 0 && sR.top < vh ? 'seg' : bR.bottom > 0 && bR.top < vh ? 'card' : bR.bottom <= 0 ? 'below' : 'above';
  let act = clamp(idx, 0, cs.length - 1), vis = act; // act: la que queda activa; vis: la que el usuario tiene a la vista (ancla)
  if (on) { let best = 0; first.forEach((r, i) => { const v = Math.min(r.bottom, vh) - Math.max(r.top, 70); if (r.width && v > best) { best = v; vis = i; } }); if (animate) act = vis; } // la tarjeta con más superficie en pantalla; sin interacción (carga/volver de un caso) manda la guardada
  const bel = belowAll(), belTop = bel.map(e => e.getBoundingClientRect().top);
  flights.forEach(a => a.cancel()); flights = [];
  // LAST
  if (!on && bento.classList.contains('m-collapsed') && cs[act].classList.contains('m-extra')) { $('.m-more', island)?.click(); bento.classList.remove('m-collapsed'); } // la activa estaba en "Ver más": se despliega
  if (!on) cs.forEach(c => c.classList.add('vis')); // la lista los revelaba con rv-up (opacidad 0→1): aquí viajan visibles
  paint(on);
  if (!on) cs.forEach(c => c.getAnimations().forEach(a => { if (a.animationName === 'rv-up') a.finish(); }));
  if (on) { idx = act; sl0 = 0; vx = tilt = 0; bento.scrollTo({ left: cs[act].offsetLeft - (bento.clientWidth - cs[act].offsetWidth) / 2, behavior: 'instant' }); rebuildDots(); sl0 = bento.scrollLeft; }
  // ancla: lo que el usuario estaba mirando no se mueve
  if (kind === 'card') jump(cs[vis].getBoundingClientRect().top - first[vis].top);
  else if (kind === 'below') jump(bel[0].getBoundingClientRect().top - belTop[0]);
  else if (kind === 'seg') { const r = cs[act].getBoundingClientRect(); if (r.bottom < 120 || r.top > vh - 120) jump(cy(r) - vh / 2); } // la activa quedó fuera: se trae al centro
  if (!animate || kind === 'above') return;
  if (reduced() || !bento.animate) { bento.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' }); return; }
  const last = cs.map(c => c.getBoundingClientRect()), aF = first[act], aL = last[act];
  const OUT = 'cubic-bezier(.22,1,.36,1)';
  cs.forEach((c, i) => {
    const f = first[i], l = last[i], vf = inVp(f), vl = inVp(l);
    if ((!vf && !vl) || !l.width) return;
    const at = r => `${cx(r) - cx(l)}px ${cy(r) - cy(l)}px`;
    const o = getComputedStyle(c).opacity; // el estado real (en la baraja las vecinas van a .7 por scroll-driven)
    const kf = vf
      ? [{ offset: 0, translate: at(f), scale: String(f.width / c.offsetWidth) }].concat(vl ? [] : [{ offset: 1, translate: aL.width ? at(aL) : '0 0', scale: '.88', opacity: 0 }]) // sin offset un único fotograma se interpreta como el final
      : [{ offset: 0, translate: aF.width ? at(aF) : '0 0', scale: '.88', opacity: 0 }, { offset: .4, opacity: o }]; // aparece pronto: el fundido no deja la pantalla vacía mientras viaja
    flights.push(c.animate(kf, { duration: 680, delay: Math.min(Math.abs(i - act), 7) * 38, easing: SOFT, fill: 'backwards' }));
  });
  bel.forEach((e, k) => {
    const r = e.getBoundingClientRect(), b = belTop[k];
    let d = b - r.top;
    if (Math.abs(d) < 2) return;
    const vb = b < vh + 80 && b + r.height > -80, va = r.top < vh + 80 && r.bottom > -80;
    if (!vb && !va) return;
    if (!vb) d = Math.min(d, vh + 80 - r.top); // venía de muy abajo: arranca desde el borde de la pantalla
    flights.push(e.animate([{ offset: 0, translate: `0 ${d}px` }], { duration: 620, easing: OUT }));
  });
  if (on) flights.push(prog.animate([{ offset: 0, opacity: 0, translate: '0 12px' }], { duration: 520, delay: 180, easing: OUT, fill: 'backwards' }));
  flying = true; // sin inclinación mientras las tarjetas viajan
  Promise.allSettled(flights.map(a => a.finished)).then(() => { if (!flights.some(a => a.playState === 'running')) { flying = false; flights = []; } });
}

function setDeck(on, user) {
  if (on === deckOn) return;
  if (user) { userChose = true; store.set('rn-deck', on ? '1' : '0'); buzz(8); }
  morph(on, user);
  live.textContent = '';
  if (user) requestAnimationFrame(() => { live.textContent = tx().ann(on, cardsOf().length); });
  wake();
}

function initDeck() {
  if (!bento || !island || !$('.fbar', island)) return;
  buildDeckUI();
  try { idx = +sessionStorage.getItem('rn-deck-i') || 0; } catch { /* privado */ }
  { // volver de un caso (case-transitions.js deja el slug en window.__rnBack): manda la tarjeta de ese caso
    const back = window.__rnBack;
    if (back) { const i = cardsOf().findIndex(k => (k.matches('a.bc') ? k : k.querySelector('a.bc'))?.getAttribute('href') === `/${back}/`); if (i >= 0) idx = i; window.__rnBack = ''; }
  }
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
  dlg.innerHTML = `<div class="tj-scrim"></div><div class="tj-panel"><div class="tj-head"><button type="button" class="tj-grab"></button><button type="button" class="tj-x">${ICON.x}</button></div><div class="tj-body"><figure class="tj-thumb"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" decoding="async"></figure><div class="tj-tags"></div><h2 id="tj-sh-t"></h2><p class="tj-sum"></p><p class="tj-meta"></p><a class="btn-p tj-cta"></a></div></div>`;
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
  panel.classList.toggle('tj-full', snapPos[i] < 2);
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
  // Tarjetas con caso interno y web externa (.bc-ext): segunda acción en la hoja
  const ext = $('.bc-ext', card);
  let cta2 = $('.tj-cta2', dlg);
  if (ext) {
    if (!cta2) { cta2 = document.createElement('a'); cta2.className = 'btn-s tj-cta tj-cta2'; cta.after(cta2); }
    Object.assign(cta2, { hidden: false, href: ext.href, target: '_blank', rel: 'noopener', textContent: ext.textContent.trim() });
  } else if (cta2) cta2.hidden = true;
  doc.classList.add('tj-lock');
  dlg.showModal();
  openedAt = performance.now();
  calc();
  // si la altura media ya es la máxima, el cuerpo hace scroll desde el primer gesto (sin gastar el swipe en subir la hoja)
  const maxed = snapPos[1] < 2 || innerHeight <= 700; // en pantallas bajas abre ya a altura máxima: el CTA queda alcanzable con un solo gesto
  panel.classList.toggle('tj-full', maxed);
  snapI = maxed ? 0 : 1; setY(H + 24, false); scrim.style.opacity = 0;
  animateTo(snapPos[snapI], 620, SHEET_SPRING);
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
