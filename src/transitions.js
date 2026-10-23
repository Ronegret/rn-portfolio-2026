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
  const titleOf = i => (i ? secs[i].querySelector('.eyebrow')?.textContent : HOME[document.documentElement.lang.slice(0, 2)] || HOME.es)?.trim() || '';
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
  // Cambio de idioma: refrescar el título sin animar
  new MutationObserver(() => requestAnimationFrame(() => { tt.textContent = ''; show(cur, false); })).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

/* (B) Apilado sticky: mide cuánto debe sostenerse cada tarjeta destacada (hasta que acaba la última) y da nombre a su timeline.
   El CSS solo lo usa ≥861px, sin filtro activo (.fhid) y con movimiento permitido. */
const bento = $('#proyectos .bento');
if (bento) {
  const feats = [...bento.children].filter(c => c.classList.contains('bfeat'));
  if (feats.length > 2) {
    const last = feats[feats.length - 1];
    feats.forEach((f, i) => f.querySelector(':scope > .bc').style.viewTimelineName = '--stk' + i);
    bento.style.timelineScope = feats.map((_, i) => '--stk' + i).join(',');
    const measure = () => {
      if (bento.querySelector('.fhid')) return; // con filtro el apilado está desactivado y los offsets no valen
      const end = last.offsetTop + last.offsetHeight;
      feats.slice(0, -1).forEach((f, i) => {
        f.dataset.stk = '';
        f.style.setProperty('--k', i);
        f.style.setProperty('--stk-tl', '--stk' + (i + 1));
        f.style.setProperty('--stk', Math.max(0, end - (f.offsetTop + f.firstElementChild.offsetHeight)) + 'px');
      });
    };
    let raf = 0;
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    new ResizeObserver(later).observe(bento);
    new MutationObserver(later).observe(bento, { attributes: true, attributeFilter: ['class'], subtree: true });
    measure();
  }
}
