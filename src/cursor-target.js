import cssUrl from './cursor-target.css?url';

/* Cursor «Target»: cuatro esquinas de encuadre alrededor de un punto. Implementacion propia (vanilla).
   En reposo giran despacio (animacion CSS, 0 JS); sobre un elemento interactivo se enderezan y se abren
   hasta las esquinas de su rectangulo. Un unico rAF (seguimiento + apertura) que se duerme al converger.
   main.js solo lo importa con raton fino, sin reduced-motion, >1024px y en modo «target». */

const D = document, body = D.body;
await new Promise(r => { const l = D.createElement('link'); l.rel = 'stylesheet'; l.href = cssUrl; l.onload = l.onerror = r; D.head.append(l); });

const HIT = 'a[href],button,[role=button],summary,label,select,[data-cursor-target]';
const BASE = 11, PAD = 6; // semilado de reposo / holgura alrededor del elemento (no tapa el texto)
const ct = D.createElement('div');
ct.id = 'ct'; ct.setAttribute('aria-hidden', 'true');
ct.innerHTML = '<div class="ct-f"><div class="ct-s"><i class="ct-c"></i><i class="ct-c"></i><i class="ct-c"></i><i class="ct-c"></i></div></div><i class="ct-d"></i>';
body.append(ct);
const frame = ct.querySelector('.ct-f'), spin = ct.querySelector('.ct-s'), dot = ct.querySelector('.ct-d');
const cs = [...ct.querySelectorAll('.ct-c')];
const SX = [-1, 1, 1, -1], SY = [-1, -1, 1, 1];

let on = false, started = false, raf = 0, px = 0, py = 0, fx = 0, fy = 0, hw = BASE, hh = BASE, el = null;

function lock(next) {
  if (next === el) return;
  if (next && !el) { // endereza desde el angulo actual de la animacion hasta la vuelta completa mas cercana
    const a = (parseFloat(getComputedStyle(spin).rotate) || 0) % 360;
    spin.style.rotate = a + 'deg'; spin.classList.add('lk'); spin.offsetWidth;
    spin.style.rotate = (a < 180 ? 0 : 360) + 'deg';
  } else if (!next) { spin.classList.remove('lk'); spin.style.rotate = ''; }
  el = next; ct.classList.toggle('lk', !!el); wake();
}
function pick(t) {
  const h = t && t.closest ? t.closest(HIT) : null;
  if (!h) return null;
  const r = h.getBoundingClientRect(); // tarjetas enormes: sin encuadre (las esquinas quedarian fuera de vista)
  return r.width && r.width < innerWidth * .9 && r.height < innerHeight * .8 ? h : null;
}

function tick() {
  raf = 0;
  let tx = px, ty = py, tw = BASE, th = BASE;
  if (el) {
    const r = el.getBoundingClientRect();
    if (!r.width || !el.isConnected) { lock(null); return; }
    tx = r.left + r.width / 2; ty = r.top + r.height / 2; tw = r.width / 2 + PAD; th = r.height / 2 + PAD;
  }
  const k = el ? .22 : .5;
  fx += (tx - fx) * k; fy += (ty - fy) * k; hw += (tw - hw) * .2; hh += (th - hh) * .2;
  frame.style.transform = `translate3d(${fx.toFixed(2)}px,${fy.toFixed(2)}px,0)`;
  for (let i = 0; i < 4; i++) cs[i].style.transform = `translate3d(${(SX[i] * hw).toFixed(2)}px,${(SY[i] * hh).toFixed(2)}px,0)`;
  if (Math.abs(tx - fx) + Math.abs(ty - fy) + Math.abs(tw - hw) + Math.abs(th - hh) > .2) raf = requestAnimationFrame(tick);
}
const wake = () => { if (!raf && on && !D.hidden) raf = requestAnimationFrame(tick); };

const sync = () => {
  on = body.dataset.cursor === 'target';
  body.classList.toggle('ct-on', on && started);
  if (!on) { cancelAnimationFrame(raf); raf = 0; lock(null); }
};
new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['data-cursor'] });
sync();

D.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || !on) return;
  px = e.clientX; py = e.clientY;
  dot.style.transform = `translate3d(${px}px,${py}px,0)`;
  if (!started) { started = true; fx = px; fy = py; body.classList.add('ct-on'); requestAnimationFrame(() => ct.classList.add('on')); }
  wake();
}, { passive: true });
D.addEventListener('pointerover', e => { if (e.pointerType === 'mouse' && on) lock(pick(e.target)); }, { passive: true });
D.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && on) ct.classList.add('dn'); }, { passive: true });
D.addEventListener('pointerup', () => ct.classList.remove('dn'));
addEventListener('scroll', () => { if (on && started) { lock(pick(D.elementFromPoint(px, py))); wake(); } }, { passive: true });
D.documentElement.addEventListener('mouseleave', () => ct.classList.remove('on'));
D.documentElement.addEventListener('mouseenter', () => started && ct.classList.add('on'));
D.addEventListener('visibilitychange', () => { if (D.hidden) { cancelAnimationFrame(raf); raf = 0; } });
