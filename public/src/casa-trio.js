/* Caso Casa Trío: vídeos que solo se reproducen en pantalla, selector de identidad, tira horizontal fijada, abanico de
   "ingredientes en el aire", parallax, inclinación y contadores. Vanilla, sin dependencias.
   Con prefers-reduced-motion: nada se reproduce solo (se ven los pósteres), no hay tira fijada, parallax, abanico ni contadores. */
const d = document, root = d.documentElement;
const rm = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const motion = () => !rm.matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
root.classList.add('ct-js');

/* ── vídeos: play/pause según visibilidad ── */
const seen = new WeakMap();
const vio = new IntersectionObserver((es) => es.forEach((e) => { seen.set(e.target, e.isIntersecting); sync(e.target); }), { threshold: 0.25 });
function sync(v) {
  if (seen.get(v) && motion() && !d.hidden) { const p = v.play(); if (p) p.catch(() => {}); }
  else if (!v.paused) v.pause();
}
const vids = () => d.querySelectorAll('video.ct-vid');
vids().forEach((v) => vio.observe(v));
d.addEventListener('visibilitychange', () => vids().forEach(sync));
rm.addEventListener('change', () => { vids().forEach(sync); setup(); });

/* ── entradas escalonadas ── */
const REV = '.ct-hero-copy > *, .ct-hero-media, .ct-facts li, .sec-head, .ct-brief li, .ct-hub > *, .ct-table-wrap, .ct-pin-head, .ct-logos li, .ct-sizes, .ct-show, .ct-phone-card, .ct-dialogs figure, .ct-list li, .ct-speeds li, .ct-ai article, .ct-eng article, .ct-kpis li, .ct-final';
if (motion() && 'IntersectionObserver' in window) {
  const els = [...d.querySelectorAll(REV)].filter((el) => !el.hasAttribute('data-parallax')); // el parallax ya mueve esos con translate
  els.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ── contadores: de 0 a la cifra real al entrar (la cifra ya está en el HTML) ── */
const cio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const el = e.target, n = +el.dataset.count;
  if (!motion() || !n) return;
  const t0 = performance.now(), dur = n > 10 ? 1400 : 700;
  const step = (t) => { const p = clamp((t - t0) / dur); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}), { threshold: 0.6 });
d.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

/* ── selector de identidad ── */
const BR = {
  nami: { kicker: 'Omakase · Sant Gervasi', name: 'Nami', line: 'Lujo silencioso japonés. Dieciséis asientos frente a la barra de hinoki.', type: 'Shippori Mincho + Inter', color: 'Tinta, washi, un único bermellón', motion: 'Lento y preciso: máscaras, tinta, expo ease',
    menu: ['sushi-menu-desktop', 'Grabación de la carta de Nami: pestañas por categoría y la ficha de un plato con sus ingredientes y su maridaje'], phone: ['sushi-exploded-phone', 'Grabación en móvil: las capas del maki de Nami flotan y se arman con el scroll'] },
  smash: { kicker: 'Burgers · Gràcia', name: 'Smash Club', line: 'Pop brutalista callejero. Aplastadas contra la plancha hasta que la costra cruje.', type: 'Anton + Space Grotesk', color: 'Mostaza, kétchup, pepinillo, negro', motion: 'Rebotón: squash & stretch, pegatinas que se despegan',
    menu: ['burger-menu-desktop', 'Grabación de la carta de Smash Club: pestañas de burgers, patatas y postres, y fichas con lo que lleva cada plato'], phone: ['burger-exploded-phone', 'Grabación en móvil: la burger de Smash Club desarmada en capas con etiquetas de pegatina'] },
  fuoco: { kicker: 'Pizzeria · El Born', name: 'Fuoco', line: 'Trattoria retro de los 70. Masa paciente, fuego salvaje, 485 °C.', type: 'Fraunces (ejes SOFT/WONK) + Instrument Sans', color: 'Crema harina, terracota, albahaca', motion: 'Orgánico: calor que sube, brasas, giros',
    menu: ['pizza-menu-desktop', 'Grabación de la carta de Fuoco: pizzas rosse y bianche y la ficha de la margherita con sus ingredientes y su vino'], phone: ['pizza-exploded-phone', 'Grabación en móvil: los ingredientes de la diavola de Fuoco caen uno a uno sobre la masa'] },
};
const show = d.querySelector('.ct-show');
if (show) {
  const tabs = [...show.querySelectorAll('[role="tab"]')], panel = show.querySelector('[role="tabpanel"]');
  const ink = show.querySelector('.ct-switch-ink');
  const place = () => { const t = tabs.find((b) => b.getAttribute('aria-selected') === 'true'); ink.style.cssText = `width:${t.offsetWidth}px;transform:translateX(${t.offsetLeft}px)`; };
  const setVid = (v, [n, label]) => {
    const V = '/assets/casa-trio/video/';
    v.poster = `${V}${n}-poster.webp`; v.setAttribute('aria-label', label);
    v.innerHTML = `<source src="${V}${n}.webm" type="video/webm"><source src="${V}${n}.mp4" type="video/mp4">`;
    v.load(); sync(v);
  };
  let busy = 0;
  const pick = (b, focus) => {
    const k = b.dataset.brand;
    if (show.dataset.brand === k) return;
    tabs.forEach((t) => { const on = t === b; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', b.id);
    if (focus) b.focus();
    place();
    const swap = () => {
      show.dataset.brand = k;
      for (const el of panel.querySelectorAll('[data-k]')) {
        const v = BR[k][el.dataset.k];
        if (el.tagName === 'VIDEO') setVid(el, v); else el.textContent = v;
      }
    };
    if (!motion()) return swap();
    const id = ++busy;
    show.classList.add('is-out');
    setTimeout(() => { if (id !== busy) return; swap(); requestAnimationFrame(() => show.classList.remove('is-out')); }, 260);
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', (e) => {
      const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault(); pick(tabs[(j + tabs.length) % tabs.length], true);
    });
  });
  place(); addEventListener('resize', place);
  d.fonts && d.fonts.ready.then(place);
}

/* ── scroll: tira fijada, abanico y parallax en un solo rAF ── */
const pin = d.querySelector('.ct-pin'), track = pin && pin.querySelector('.ct-pin-track'), bar = pin && pin.querySelector('.ct-pin-prog i');
const fan = d.querySelector('.ct-fan');
const para = [...d.querySelectorAll('[data-parallax]')];
let dist = 0, on = false, paraOn = false, ticking = false;
function setup() {
  on = motion();
  paraOn = on && innerWidth >= 760; // en una columna el parallax empujaría una foto contra el pie de la anterior
  const wide = innerWidth >= 900 && on;
  if (pin) {
    pin.classList.toggle('is-pinned', wide);
    if (wide) { track.style.transform = ''; dist = Math.max(0, track.scrollWidth - track.clientWidth); pin.style.height = `${innerHeight + dist}px`; }
    else { pin.style.height = ''; track.style.transform = ''; dist = 0; }
  }
  if (!paraOn) para.forEach((el) => { el.style.translate = ''; });
  if (!on && fan) fan.style.removeProperty('--fan');
  frame();
}
function frame() {
  ticking = false;
  if (!on) return;
  const vh = innerHeight;
  if (pin && dist) {
    const p = clamp(-pin.getBoundingClientRect().top / dist);
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
    if (bar) bar.style.transform = `scaleX(${p})`;
  }
  if (fan) { const r = fan.getBoundingClientRect(); fan.style.setProperty('--fan', clamp((vh - r.top) / (vh * 0.75)).toFixed(3)); }
  if (paraOn) for (const el of para) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) continue;
    el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * +el.dataset.parallax).toFixed(1)}px`;
  }
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
addEventListener('resize', setup);
addEventListener('load', setup);
setup();

/* ── inclinación al pasar el ratón ── */
if (fine.matches) {
  d.querySelectorAll('.ct-tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (!motion()) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) scale(1.015)`;
      el.style.setProperty('--gx', `${(x + 0.5) * 100}%`); el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
