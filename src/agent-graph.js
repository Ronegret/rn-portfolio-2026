/* Hero: "run en vivo" de un agente alrededor del retrato. Webhook → n8n → Agente → Claude → Producto:
   un pulso de datos recorre el flujo en ~3 s, cada nodo pasa por pendiente → ejecutando → ✓ y el run termina con un ✓ que ilumina el retrato.
   Despues, bucle lento (un run cada ~13 s, solo con el hero en pantalla y la pestana visible).
   SVG + HTML posicionados una vez por cambio de tamano; movimiento en CSS/WAAPI (opacity, scale, stroke-dashoffset), sin rAF continuo.
   Se importa dinamicamente desde main.js (mismo gate que webgl-hero.js). Decorativo: aria-hidden y sin focos de teclado.
   Escritorio (>=981): arco de 240° alrededor del retrato. Tablet/movil: tira de nodos sobre el borde de la tarjeta. */
import pulseCss from './pulse-line.css?inline';
import flowCss from './hero-flow.css?inline';
// ?inline: las hojas viajan con este chunk diferido y no se incrustan en el HTML de la portada (fuera del camino critico)
document.head.append(Object.assign(document.createElement('style'), { textContent: pulseCss + flowCss }));

const hero = document.getElementById('hero');
const card = hero && hero.querySelector('.pcard');
const av = card && card.querySelector('.av-wrap');
const root = document.documentElement;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const NS = 'http://www.w3.org/2000/svg';
const RUN = 2700, EASE = 'cubic-bezier(.22,1,.36,1)';
const CHECK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3 5 8.6l4.5-5"/></svg>';

const I = {
  webhook: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  n8n: '<rect x="2.5" y="9" width="5" height="6" rx="1.6"/><rect x="16.5" y="3.5" width="5" height="6" rx="1.6"/><rect x="16.5" y="14.5" width="5" height="6" rx="1.6"/><path d="M7.5 12H11c2 0 1.5-5.5 3.5-5.5h2M11 12c2 0 1.5 5.5 3.5 5.5h2"/>',
  agente: '<circle cx="12" cy="12" r="2.8"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/><circle cx="12" cy="12" r="7.2" stroke-dasharray="2.4 2.6"/>',
  claude: '<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>',
  producto: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18M6.5 6.8h.01M9.5 6.8h.01M7 13h6M7 16h4"/>',
};
/* id, etiqueta {es,ca,en}, que pasa en ese paso (sin cifras) */
const N = [
  ['webhook', { es: 'Webhook' }, { es: 'Un evento dispara el flujo', ca: 'Un esdeveniment dispara el flux', en: 'An event triggers the flow' }],
  ['n8n', { es: 'n8n' }, { es: 'Orquesto el flujo con n8n o Make', ca: 'Orquestro el flux amb n8n o Make', en: 'I orchestrate the flow with n8n or Make' }],
  ['agente', { es: 'Agente', ca: 'Agent', en: 'Agent' }, { es: 'Diseño el agente: rol, herramientas y límites', ca: "Dissenyo l'agent: rol, eines i límits", en: 'I design the agent: role, tools and limits' }],
  ['claude', { es: 'Claude' }, { es: 'El modelo razona y responde', ca: 'El model raona i respon', en: 'The model reasons and replies' }],
  ['producto', { es: 'Producto', ca: 'Producte', en: 'Product' }, { es: 'El resultado llega a una interfaz usable', ca: 'El resultat arriba a una interfície usable', en: 'The result lands in a usable interface' }],
];
const MOBILE = ['n8n', 'agente', 'claude', 'producto'];
const ANG = [210, 150, 90, 30, -30]; // arco simetrico, 60° entre nodos: entra abajo a la izquierda, corona arriba, sale abajo a la derecha

const el = (tag, cls, svg) => { const e = svg ? document.createElementNS(NS, tag) : document.createElement(tag); if (cls) e.setAttribute('class', cls); return e; };
const lang = () => (root.lang || 'es').slice(0, 2);
const tr = o => o[lang()] || o.es;

let box, track, lit, dots, spokes, glow, badge, nodes = [], key = '', live = true, timers = [], next = 0;

function build() {
  box = el('div', 'hf'); box.setAttribute('aria-hidden', 'true');
  const svg = el('svg', 'hf-svg', 1);
  const P = c => { const p = el('path', c, 1); p.setAttribute('pathLength', '1'); svg.append(p); return p; };
  track = P('pulse-line hf-track'); lit = P('hf-lit');
  spokes = el('g', 'hf-spokes', 1); svg.append(spokes);
  dots = [P('pulse-line-dot hf-halo'), P('pulse-line-dot hf-dot')];
  glow = el('span', 'hf-glow');
  badge = el('span', 'hf-ok'); badge.innerHTML = CHECK;
  box.append(glow, svg, badge);
  nodes = N.map(([id, name, tip]) => {
    const n = el('span', 'hf-node'); n.dataset.k = id;
    n.innerHTML = `<span class="hf-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[id]}</svg><b></b><i class="hf-st">${CHECK}</i></span><em class="hf-tip"><b></b> · <span></span></em>`;
    n._name = name; n._tip = tip;
    box.append(n);
    return n;
  });
  card.append(box);
  relang();
}
function relang() { for (const n of nodes) { n.querySelector('.hf-tile b').textContent = n.querySelector('.hf-tip b').textContent = tr(n._name); n.querySelector('.hf-tip span').textContent = tr(n._tip); } }

/* Coordenadas en px de la tarjeta (offset*: ignoran el tilt y las animaciones de entrada) */
function layout() {
  const W = card.clientWidth, H = card.clientHeight, ar = av.offsetWidth / 2;
  const cx = av.offsetLeft + ar, cy = av.offsetTop + ar;
  const k = [W, H, ar, cx, cy, innerWidth].map(Math.round).join();
  if (k === key) return; key = k;
  let ring = false, R = 0, tw = 58, th = 46;
  if (innerWidth >= 981) { // radio: tan cerca del retrato como permita la holgura; nodos normales y, si no caben, compactos
    const cr = card.getBoundingClientRect(), dk = document.querySelector('.dk')?.parentElement, dr = dk && dk.getBoundingClientRect();
    const navB = (document.getElementById('nav')?.offsetHeight || 66) + 14; // el nodo superior no roza la barra
    for ([tw, th] of [[58, 46], [50, 40]]) {
      const clear = r => Math.min(...ANG.map(a => { const t = a * Math.PI / 180, x = Math.abs(r * Math.cos(t)) - (Math.abs(Math.cos(t)) > .01 ? tw / 2 : 0), y = Math.abs(r * Math.sin(t)) - th / 2; return Math.hypot(Math.max(0, x), Math.max(0, y)); }));
      let side = cx - 12 - tw / 2; // dentro de la tarjeta por los lados...
      if (dr && dr.height > dr.width && dr.left < cr.right + 40) side = Math.min(side, dr.left - cr.left - cx - tw / 2 - 10); // ...y sin tocar el dock de temas (fijo a la derecha)
      R = Math.min(ar + 60, side / Math.cos(Math.PI / 6), cy + cr.top + scrollY - navB - th / 2 - 6);
      if (clear(R) >= ar + 10) { ring = true; break; } // con aire para el indicador de estado de cada nodo
    }
  }
  box.dataset.mode = ring ? 'ring' : 'strip';
  box.dataset.size = tw < 58 ? 's' : '';
  spokes.replaceChildren();
  let pts, d;
  if (ring) {
    pts = ANG.map(a => { const t = a * Math.PI / 180; return [cx + R * Math.cos(t), cy - R * Math.sin(t), t]; });
    const [a, , , , b] = pts;
    d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}A${R.toFixed(1)} ${R.toFixed(1)} 0 1 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    pts.forEach(([, , t], i) => { // radio corto del nodo al aro del retrato (el "puerto")
      const c = Math.cos(t), s = Math.sin(t), half = Math.min(Math.abs(c) > .01 ? tw / 2 / Math.abs(c) : 1e3, th / 2 / Math.abs(s));
      const r0 = ar + 7, r1 = R - half - 4;
      const l = el('path', 'hf-spoke', 1); l.dataset.i = i;
      l.setAttribute('d', `M${(cx + r1 * c).toFixed(1)} ${(cy - r1 * s).toFixed(1)}L${(cx + r0 * c).toFixed(1)} ${(cy - r0 * s).toFixed(1)}`);
      const p = el('circle', 'hf-port', 1); p.setAttribute('cx', (cx + r0 * c).toFixed(1)); p.setAttribute('cy', (cy - r0 * s).toFixed(1)); p.setAttribute('r', '2.2');
      spokes.append(l, p);
    });
  } else { // tira sobre el borde: arriba en tablet, abajo en movil (alineada con la columna de texto de la tarjeta)
    const mob = innerWidth <= 640, ids = mob ? MOBILE : N.map(n => n[0]);
    const y = mob ? H : 0, x0 = mob ? av.offsetLeft + ar * 2 + 14 + 13 : 34, x1 = W - (mob ? 24 : 34);
    const step = Math.min(mob ? 46 : 56, (x1 - x0) / (ids.length - 1));
    const start = mob ? x0 : (W - step * (ids.length - 1)) / 2;
    pts = N.map(([id]) => { const i = ids.indexOf(id); return i < 0 ? null : [start + i * step, y]; });
    const v = pts.filter(Boolean);
    d = `M${(v[0][0] - 20).toFixed(1)} ${y}H${(v[v.length - 1][0] + 20).toFixed(1)}`;
  }
  for (const p of [track, lit, ...dots]) p.setAttribute('d', d);
  const used = pts.filter(Boolean).length;
  let j = 0;
  nodes.forEach((n, i) => {
    const p = pts[i];
    n.hidden = !p;
    if (!p) return;
    n._f = used > 1 ? j++ / (used - 1) : 0; // posicion en el recorrido: el pulso llega a este nodo en f * RUN
    n.style.cssText = `left:${p[0].toFixed(1)}px;top:${p[1].toFixed(1)}px;--f:${n._f.toFixed(3)}`;
    const top = ring && p[1] < cy - R * .9; // tooltip hacia dentro de la tarjeta: nunca ensancha la pagina
    n.dataset.tx = top ? 'c' : innerWidth <= 640 ? 'r' : p[0] < W / 2 ? 'l' : 'r';
    n.dataset.ty = ring && !top ? 'u' : 'd';
  });
  Object.assign(glow.style, { left: (cx - ar) + 'px', top: (cy - ar) + 'px', width: ar * 2 + 'px', height: ar * 2 + 'px' });
  const bo = ar * Math.SQRT1_2; // ✓ final sobre el aro, abajo a la derecha
  Object.assign(badge.style, { left: (cx + bo) + 'px', top: (cy + bo) + 'px' });
}

/* Un run: pulso por el trazo + estados por nodo + ✓ final en el retrato */
const later = (f, ms) => timers.push(setTimeout(f, ms));
function run(first) {
  next = 0;
  if (!live) return;
  const vis = nodes.filter(n => !n.hidden);
  box.dataset.run = 'on'; delete box.dataset.done;
  vis.forEach(n => (n.dataset.s = 'wait'));
  const kf = (o, w) => [{ strokeDashoffset: w, opacity: 0 }, { opacity: o, offset: .05 }, { opacity: o, offset: .93 }, { strokeDashoffset: -1, opacity: 0 }];
  dots[0].animate(kf(first ? .24 : .14, .1), { duration: RUN, easing: 'linear' });
  dots[1].animate(kf(first ? 1 : .8, .05), { duration: RUN, easing: 'linear' });
  for (const n of vis) {
    const t = n._f * RUN * .95; // el punto avanza a velocidad constante
    later(() => (n.dataset.s = 'run'), Math.max(0, t - 260));
    later(() => (n.dataset.s = 'ok'), t + 240);
  }
  later(() => { box.dataset.done = first ? 'first' : 'on'; delete box.dataset.run; }, RUN + 200);
  later(() => vis.forEach(n => (n.dataset.s = 'idle')), RUN + 6200); // vuelve a reposo, suave
  later(() => schedule(), RUN + 6200);
}
function schedule() { if (live && !next) next = setTimeout(() => run(false), 4200); }
function pause() { live = false; clearTimeout(next); next = 0; timers.forEach(clearTimeout); timers = []; for (const n of nodes) n.dataset.s = 'ok'; box.dataset.done = 'on'; delete box.dataset.run; }
function resume() { if (live) return; live = true; schedule(); }

function init() {
  build();
  layout();
  new ResizeObserver(() => layout()).observe(card);
  new MutationObserver(() => { relang(); key = ''; layout(); }).observe(root, { attributes: true, attributeFilter: ['lang'] });
  if (calm) { box.classList.add('hf-in', 'hf-still'); for (const n of nodes) n.dataset.s = 'ok'; box.dataset.done = 'on'; return; } // reduced-motion: resultado final estatico
  for (const n of nodes) n.dataset.s = 'idle';
  let inView = true;
  const sync = () => { const on = inView && !document.hidden; box.classList.toggle('is-paused', !on); on ? resume() : pause(); };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  nodes.forEach((n, i) => { // hover: ilumina el radio del nodo; toque (movil): muestra su tooltip 2 s
    const sp = () => spokes.querySelector(`[data-i="${i}"]`);
    n.addEventListener('pointerenter', () => sp()?.classList.add('on'));
    n.addEventListener('pointerleave', () => sp()?.classList.remove('on'));
    if (!fine) n.addEventListener('click', () => { n.classList.add('tap'); clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('tap'), 2000); });
  });
  if (fine) { // micro-parallax: la capa del flujo se desplaza unos px opuesta al cursor (la transicion CSS suaviza)
    let q = 0, ex = 0, ey = 0;
    addEventListener('pointermove', e => {
      ex = e.clientX; ey = e.clientY;
      q || (q = requestAnimationFrame(() => { q = 0; if (live) box.style.translate = `${((.5 - ex / innerWidth) * 8).toFixed(1)}px ${((.5 - ey / innerHeight) * 6).toFixed(1)}px`; }));
    }, { passive: true });
  }
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('hf-in')));
  setTimeout(() => box.classList.add('hf-ready'), 1100); // tras la entrada, el hover responde sin retardos escalonados
  later(() => run(true), 650);
}

if (hero && card && av) init();
