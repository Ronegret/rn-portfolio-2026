/* Grafo de agentes del hero: nodos-pildora (tu stack y tu oficio) unidos por conexiones curvas con pulsos de datos.
   Canvas 2D, un solo rAF, sin dependencias. Se importa DINAMICAMENTE desde main.js con el mismo gate que webgl-hero.js.
   Decorativo (aria-hidden, pointer-events:none): escucha en window, no captura el scroll. Reposo casi quieto;
   el puntero/dedo atrae los nodos cercanos con muelle e ilumina sus conexiones; un toque en un nodo lo activa. */
const hero = document.getElementById('hero');
const card = hero && hero.querySelector('.pcard');
const root = document.documentElement;
const coarse = !matchMedia('(hover:hover) and (pointer:fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* id, etiqueta, tipo (0 IA, 1 automatizacion, 2 diseno, 3 hub), u/v en fraccion de la tarjeta del retrato, y posicion en movil (u, dy px sobre la tarjeta) */
const N = [
  ['producto', 'Producto', 3, -.06, .5, .88, -15],
  ['webhook', 'Webhook', 1, -.04, .1, .1, -15],
  ['n8n', 'n8n', 1, .28, -.035, .3, -19],
  ['agente', 'Agente', 0, .7, -.035, .5, -15],
  ['claude', 'Claude', 0, 1.04, .1, .69, -19],
  ['make', 'Make', 1, 1.05, .8],
  ['supabase', 'Supabase', 1, .8, 1.035],
  ['vapi', 'Vapi', 0, .45, 1.035],
  ['botpress', 'Botpress', 0, .1, 1.035],
  ['figma', 'Figma', 2, -.05, .74],
  ['ux', 'UX Research', 2, -.05, .27],
];
const LBL = { producto: { ca: 'Producte', en: 'Product' }, agente: { ca: 'Agent', en: 'Agent' } };
const E = [['producto', 'webhook'], ['webhook', 'n8n'], ['n8n', 'agente'], ['agente', 'claude'], ['claude', 'make'], ['make', 'supabase'],
  ['supabase', 'vapi'], ['vapi', 'botpress'], ['botpress', 'producto'], ['ux', 'producto'], ['figma', 'producto']];
const EM = [['webhook', 'n8n'], ['n8n', 'agente'], ['agente', 'claude'], ['claude', 'producto']];

const parse = s => {
  s = s.trim();
  let m = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(s);
  if (m) { let h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  m = s.match(/[\d.]+/g);
  return m && m.length >= 3 ? m.slice(0, 3).map(Number) : [255, 255, 255];
};
const lum = c => (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255;
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

let cv, ctx, nodes = [], edges = [], strip = false, fontStr = 'monospace', pad = 8;
let cur, tgt, dpr = 1, cw = 0, ch = 0, cc = [0, 0], cardKey = '';
let raf = 0, running = false, dead = false, last = 0, t = 0, tick = 0, shown = false;
let acc = 0, frames = 0, warm = 0, lvl = 0, spawnIn = 1.2;
const P = { cx: 0, cy: 0, on: false }, pulses = [], ripples = [];
let cr = { left: 0, top: 0 };

/* paleta (0-255): a1,a2,a3,t1,bg + flag papel claro; el acento blanco de saas cede el color a a2 */
function readTheme() {
  const cs = getComputedStyle(root), v = k => parse(cs.getPropertyValue(k));
  let a = [v('--a1'), v('--a2'), v('--a3')];
  const bg = v('--bg'), light = lum(bg) > .5;
  if (!light && lum(a[0]) > .85) a = [a[1], a[0], a[2]];
  fontStr = (cs.getPropertyValue('--fm') || '').trim() || 'monospace';
  return [...a[0], ...a[1], ...a[2], ...v('--t1'), ...bg, light ? 1 : 0];
}
const K = (i, al) => `rgba(${cur[i] | 0},${cur[i + 1] | 0},${cur[i + 2] | 0},${al})`; // 0 a1, 3 a2, 6 a3, 9 t1, 12 bg
const ACC = [0, 3, 6, 0];

function labelOf(n) { const l = (root.lang || 'es').slice(0, 2); return (LBL[n.id] && LBL[n.id][l]) || n.label; }
function measure() {
  for (const n of nodes) {
    n.h = n.kind === 3 ? (strip ? 24 : 32) : (strip ? 20 : 26);
    ctx.font = `${n.kind === 3 ? 700 : 400} ${strip ? (n.kind === 3 ? 10 : 9) : (n.kind === 3 ? 13 : 11.5)}px ${fontStr}`;
    n.w = Math.ceil(ctx.measureText(labelOf(n)).width) + (strip ? 18 : 26) + (n.kind === 3 ? 6 : 0);
  }
}

function layout() {
  const hr = hero.getBoundingClientRect(), c = card.getBoundingClientRect();
  strip = matchMedia('(max-width:979px)').matches;
  const px = strip ? 0 : 130, up = strip ? 52 : 60;
  const L = Math.max(0, c.left - hr.left - px), T = Math.max(0, c.top - hr.top - up);
  const R = Math.min(hr.width, c.right - hr.left + px), B = Math.min(hr.height, strip ? c.top - hr.top + 8 : c.bottom - hr.top + 60);
  cw = Math.max(1, Math.round(R - L)); ch = Math.max(1, Math.round(B - T));
  cardKey = [c.left, c.top, c.width, c.height, hr.left, hr.top].map(Math.round).join();
  Object.assign(cv.style, { left: L + 'px', top: T + 'px', width: cw + 'px', height: ch + 'px' });
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  const ox = c.left - hr.left - L, oy = c.top - hr.top - T;
  cc = [ox + c.width / 2, oy + c.height / 2];
  const prev = new Map(nodes.map(n => [n.id, n]));
  nodes = N.filter(d => (strip ? d[5] != null : true)).map(d => {
    const o = prev.get(d[0]) || {};
    return Object.assign(o, { id: d[0], label: d[1], kind: d[2], u: strip ? d[5] : d[3], v: strip ? d[6] : d[4] });
  });
  measure();
  for (const n of nodes) {
    n.hx = ox + n.u * c.width; n.hy = strip ? oy + n.v : oy + n.v * c.height;
    if (!strip && n.u <= 0) n.hx = ox + 3 - n.w / 2; // lateral: pegado a la tarjeta, solo 3 px por detras, para que la etiqueta se lea entera
    else if (!strip && n.u >= 1) n.hx = ox + c.width - 3 + n.w / 2;
    n.hx = Math.max(n.w / 2 + 2, Math.min(cw - n.w / 2 - 2, n.hx)); n.hy = Math.max(n.h / 2 + 2, Math.min(ch - n.h / 2 - 2, n.hy));
    if (n.x == null) { n.x = n.hx; n.y = n.hy; n.vx = n.vy = 0; n.gl = n.beat = n.act = 0; n.ph = Math.random() * 6.28; }
  }
  const by = new Map(nodes.map(n => [n.id, n]));
  edges = (strip ? EM : E).map(([a, b]) => ({ a: by.get(a), b: by.get(b), hot: 0 })).filter(e => e.a && e.b);
  for (const n of nodes) n.out = edges.filter(e => e.a === n);
  pulses.length = 0;
}

function spawn(e, hop) { if (lvl < 2 && pulses.length < (lvl ? 6 : 12)) pulses.push({ e, t: 0, hop, sp: .28 + Math.random() * .12 }); }
function activate(n) {
  n.act = 1; n.beat = 1; ripples.push({ n, t: 0 });
  for (const e of n.out) spawn(e, 3);
  for (const e of edges) if (e.b === n) spawn(e, 4);
}

function update(dt) {
  const k = 1 - Math.exp(-dt * 3);
  for (let i = 0; i < cur.length; i++) cur[i] += (tgt[i] - cur[i]) * k;
  const R = coarse ? 130 : 170, px = P.cx - cr.left, py = P.cy - cr.top;
  for (const n of nodes) {
    let tx = n.hx + Math.sin(t * .45 + n.ph) * 1.6, ty = n.hy + Math.cos(t * .37 + n.ph * 1.3) * 1.6, g = 0;
    if (P.on) {
      const dx = px - n.hx, dy = py - n.hy, d = Math.hypot(dx, dy);
      if (d < R) { g = 1 - d / R; g = g * g * (3 - 2 * g); const m = Math.min(d * .4, 22) * g; tx += dx / (d || 1) * m; ty += dy / (d || 1) * m; }
    }
    n.gl += (g - n.gl) * Math.min(1, dt * 9); n.beat *= Math.exp(-dt * 2.6); n.act *= Math.exp(-dt * 1.6);
    n.vx += ((tx - n.x) * 75 - n.vx * 11) * dt; n.vy += ((ty - n.y) * 75 - n.vy * 11) * dt;
    n.x += n.vx * dt; n.y += n.vy * dt;
  }
  for (const e of edges) e.hot *= Math.exp(-dt * 2);
  spawnIn -= dt;
  if (spawnIn < 0) { spawnIn = (lvl ? 3 : 1.4) + Math.random() * 1.6; spawn(edges[(Math.random() * edges.length) | 0], 0); }
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i], e = p.e;
    p.t += p.sp * dt * 260 / (Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y) + 40); e.hot = 1;
    if (p.t >= 1) {
      e.b.beat = 1; pulses.splice(i, 1);
      if (p.hop < 6 && e.b.out.length && Math.random() < .85) spawn(e.b.out[(Math.random() * e.b.out.length) | 0], p.hop + 1);
    }
  }
  for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].t += dt / .75; if (ripples[i].t >= 1) ripples.splice(i, 1); }
}

const ctl = e => { // control de la curva: arquea hacia fuera de la tarjeta
  const mx = (e.a.x + e.b.x) / 2, my = (e.a.y + e.b.y) / 2, dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
  let nx = -dy, ny = dx; if (nx * (mx - cc[0]) + ny * (my - cc[1]) < 0) { nx = -nx; ny = -ny; }
  const l = Math.hypot(nx, ny) || 1, s = Math.hypot(dx, dy) * .2;
  return [mx + nx / l * s, my + ny / l * s];
};
const bez = (e, c, u) => { const q = 1 - u; return [q * q * e.a.x + 2 * q * u * c[0] + u * u * e.b.x, q * q * e.a.y + 2 * q * u * c[1] + u * u * e.b.y]; };

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  const light = cur[15] > .5, base = light ? .32 : .26, cs = edges.map(ctl);
  ctx.lineCap = 'round';
  edges.forEach((e, i) => {
    const c = cs[i], lit = Math.max(e.a.gl, e.b.gl, e.hot * .35);
    ctx.lineWidth = 1;
    ctx.strokeStyle = lit > .02 ? K(ACC[e.a.kind], base + lit * .6) : K(9, base);
    ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.quadraticCurveTo(c[0], c[1], e.b.x, e.b.y); ctx.stroke();
  });
  for (const p of pulses) { // cola de 5 tramos con alfa creciente y cabeza mas gruesa
    const i = edges.indexOf(p.e), c = cs[i];
    for (let s = 0; s < 5; s++) {
      const u0 = Math.max(0, p.t - .16 + s * .032), u1 = Math.max(0, p.t - .16 + (s + 1) * .032);
      if (u1 <= 0) continue;
      const a = bez(p.e, c, u0), b = bez(p.e, c, Math.min(1, u1));
      ctx.strokeStyle = K(ACC[p.e.a.kind], .15 + s * .21); ctx.lineWidth = s === 4 ? 2.8 : 1.6;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  }
  for (const n of nodes) {
    const x = n.x - n.w / 2, y = n.y - n.h / 2, hub = n.kind === 3, lit = Math.max(n.gl, n.beat * .8, n.act);
    rr(ctx, x, y, n.w, n.h, hub ? 9 : 7);
    if (hub) { ctx.fillStyle = K(0, .95); ctx.fill(); }
    else { ctx.fillStyle = K(12, .9); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = lit > .03 ? K(ACC[n.kind], .3 + lit * .7) : K(9, light ? .2 : .16); ctx.stroke(); }
    if (!hub) { rr(ctx, x + 5, y + 5, 3, n.h - 10, 1.5); ctx.fillStyle = K(ACC[n.kind], .55 + lit * .45); ctx.fill(); }
    ctx.font = `${hub ? 700 : 400} ${strip ? (hub ? 10 : 9) : (hub ? 13 : 11.5)}px ${fontStr}`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = hub ? (lum([cur[0], cur[1], cur[2]]) > .5 ? 'rgba(10,10,12,.95)' : 'rgba(255,255,255,.96)') : K(9, (light ? .8 : .66) + lit * .3);
    ctx.fillText(labelOf(n), x + (hub ? 13 : strip ? 13 : 16), n.y + .5);
  }
  for (const r of ripples) {
    const n = r.n, g = 2 + r.t * 16;
    rr(ctx, n.x - n.w / 2 - g, n.y - n.h / 2 - g, n.w + 2 * g, n.h + 2 * g, 8 + g);
    ctx.strokeStyle = K(ACC[n.kind], (1 - r.t) * .7); ctx.lineWidth = 1.2; ctx.stroke();
  }
}

function frame(now) {
  raf = 0;
  if (!running) return;
  raf = requestAnimationFrame(frame);
  const gap = now - last, dt = Math.min(gap / 1000, .05) || .016; last = now; t += dt;
  // gobernador de fps (media de 30 fotogramas > 24 ms), por pasos; el WebGL tiene su propio gobernador y a veces es el que carga el fotograma
  if (warm < 8) warm++;
  else if (gap < 250) {
    acc += gap;
    if (++frames === 30) {
      const avg = acc / 30; acc = frames = 0;
      if (avg > 24) { if (lvl > 1) return shutdown(); warm = 4; if (++lvl === 1) { dpr = 1; layout(); } else pulses.length = 0; } // 1: dpr 1 y menos pulsos; 2: sin pulsos; 3: fundido y apagado
    }
  }
  if (++tick % 40 === 0 && cv.isConnected) { const c = card.getBoundingClientRect(), h = hero.getBoundingClientRect(); if ([c.left, c.top, c.width, c.height, h.left, h.top].map(Math.round).join() !== cardKey) layout(); }
  cr = cv.getBoundingClientRect();
  update(dt); draw();
  if (!shown) { shown = true; cv.style.opacity = '1'; cv.dataset.ag = 'on'; }
}
function start() { if (dead || running) return; running = true; last = performance.now(); warm = 0; acc = frames = 0; raf = requestAnimationFrame(frame); }
function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
function shutdown() { dead = true; stop(); cv.style.opacity = '0'; cv.dataset.ag = 'off'; }
function still() { // reduced-motion: un unico fotograma estatico (se repinta solo si cambia tema, idioma o tamano)
  layout(); cur = tgt.slice(); cr = cv.getBoundingClientRect(); draw(); cv.style.opacity = '1'; cv.dataset.ag = 'still';
}

function init() {
  cv = document.createElement('canvas'); cv.id = 'ag-cv'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;z-index:0;pointer-events:none;opacity:0;transition:opacity 1.2s ease';
  ctx = cv.getContext('2d');
  if (!ctx) return;
  hero.insertBefore(cv, hero.querySelector('.hero-inner'));
  dpr = Math.min(devicePixelRatio || 1, coarse ? 1 : 1.5);
  cur = readTheme(); tgt = cur.slice();
  const relayout = () => { layout(); if (calm) still(); }; // el layout depende del ancho de las etiquetas (fuente del tema, idioma)
  const retheme = () => { tgt = readTheme(); relayout(); };
  new MutationObserver(retheme).observe(root, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
  document.fonts && document.fonts.addEventListener('loadingdone', () => { if (!dead) relayout(); });
  new ResizeObserver(relayout).observe(hero);
  if (calm) return still();
  layout();

  const set = e => { P.cx = e.clientX; P.cy = e.clientY; P.on = true; };
  addEventListener('pointermove', set, { passive: true });
  addEventListener('pointerdown', e => {
    set(e);
    if (e.target.closest && e.target.closest('a,button,.pcard,input')) return;
    const x = e.clientX - cv.getBoundingClientRect().left, y = e.clientY - cv.getBoundingClientRect().top, s = coarse ? 12 : 6;
    for (const n of nodes) if (Math.abs(x - n.x) < n.w / 2 + s && Math.abs(y - n.y) < n.h / 2 + s) { activate(n); break; }
  }, { passive: true });
  const off = () => { P.on = false; };
  addEventListener('pointerup', e => e.pointerType !== 'mouse' && off(), { passive: true });
  addEventListener('pointercancel', off, { passive: true });
  root.addEventListener('mouseleave', off);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : (hero.getBoundingClientRect().bottom > 0 && start())));
  if (!document.hidden) start();
}

if (hero && card) init();
