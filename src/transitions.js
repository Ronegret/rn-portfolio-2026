import './transitions.css';

/* Portada: storytelling de scroll. Las transiciones de página en sí viven en public/src/case-transitions.js (inline en Layout).
   Progresivo: sin JS o con estilos no soportados la página es la de siempre. */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');

/* (A) Capítulos: 00/08 + título de la sección actual. Misma numeración que los separadores de sections.js (01/08 = Sobre mí); el hero es el 00.
   Los títulos salen del eyebrow de cada sección (ya traducido por data-i). */
const secs = ['hero', 'sobre-mi', 'stack', 'proyectos', 'laboratorio', 'trayectoria', 'testimonios', 'estilos', 'contacto'].map(id => document.getElementById(id)).filter(Boolean);
if (secs.length > 1) {
  const HOME = { es: 'Inicio', ca: 'Inici', en: 'Home' };
  const titleOf = i => (i ? (e => e?.dataset.txt || e?.textContent)(secs[i].querySelector('.eyebrow')) : HOME[document.documentElement.lang.slice(0, 2)] || HOME.es)?.trim() || '';
  const el = document.createElement('div');
  el.className = 'chap';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<span class="chap-n"><span class="chap-col">${secs.map((_, i) => `<i>${pad(i)}</i>`).join('')}</span></span><span class="chap-of">/${pad(secs.length - 1)}</span><span class="chap-t"></span><span class="chap-bar"></span>`;
  document.body.append(el);
  const col = el.querySelector('.chap-col'), tt = el.querySelector('.chap-t');
  let cur = 0;
  const show = (i, anim) => {
    const t = titleOf(i);
    if (t === tt.textContent) return;
    col.style.setProperty('--i', i);
    tt.textContent = t;
    cur = i;
    if (anim && motion.matches) tt.animate([{ opacity: 0, transform: 'translateY(.7em)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  show(0, false);
  // La sección que cruza una franja central de la pantalla es el capítulo actual
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(secs.indexOf(e.target), true); }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => io.observe(s));
  // Saltos instantaneos (End, scrollTo, anclas): el observer puede no entregar el cruce; se recalcula por posicion al terminar el scroll y tras un salto grande
  const sync = () => {
    const y = innerHeight * .5;
    let k = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= y) k = i; });
    if (k !== cur) show(k, false);
  };
  let lastY = scrollY, sr = 0, idle = 0;
  // Solo visible mientras hay scroll (y 1,4 s después): en reposo tapaba contenido del margen izquierdo
  const wake = () => { el.classList.add('on'); clearTimeout(idle); idle = setTimeout(() => el.classList.remove('on'), 1400); };
  addEventListener('scroll', () => {
    wake();
    if (Math.abs(scrollY - lastY) > innerHeight * .8 && !sr) sr = requestAnimationFrame(() => { sr = 0; sync(); });
    lastY = scrollY;
  }, { passive: true });
  if ('onscrollend' in window) addEventListener('scrollend', sync, { passive: true }); else { let t = 0; addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(sync, 160); }, { passive: true }); }
  // Cambio de idioma: refrescar el título sin animar
  new MutationObserver(() => requestAnimationFrame(() => { const t = titleOf(cur); if (t !== tt.textContent) { tt.textContent = t; } })).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}
