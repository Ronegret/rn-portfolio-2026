import './sections.css';

/* Sections: separadores entre secciones + una firma propia por sección. Progresivo: sin JS o con reduced-motion todo queda legible y estático. */
const doc = document.documentElement;
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');

const I = {
  es: { names: ['Sobre mí', 'Stack', 'Proyectos', 'Laboratorio', 'Trayectoria', 'Testimonios', 'Estilos', 'Contacto'],
    copy: 'Copiar', copied: 'Copiado', live: 'Email copiado al portapapeles',
    clock: 'Hora en Barcelona', car: 'Testimonios', prev: 'Testimonio anterior', next: 'Testimonio siguiente' },
  ca: { names: ['Sobre mi', 'Stack', 'Projectes', 'Laboratori', 'Trajectòria', 'Testimonis', 'Estils', 'Contacte'],
    copy: 'Copiar', copied: 'Copiat', live: 'Email copiat al porta-retalls',
    clock: 'Hora a Barcelona', car: 'Testimonis', prev: 'Testimoni anterior', next: 'Testimoni següent' },
  en: { names: ['About', 'Stack', 'Projects', 'Lab', 'Career', 'Testimonials', 'Styles', 'Contact'],
    copy: 'Copy', copied: 'Copied', live: 'Email copied to clipboard',
    clock: 'Local time in Barcelona', car: 'Testimonials', prev: 'Previous testimonial', next: 'Next testimonial' },
};
const tr = () => I[doc.lang] || I.es;
const onLang = [];
new MutationObserver(() => onLang.forEach(f => f())).observe(doc, { attributes: true, attributeFilter: ['lang'] });

/* ───── (A) Separadores: regla técnica numerada y marquesina, alternados ───── */
const IDS = ['sobre-mi', 'stack', 'proyectos', 'laboratorio', 'trayectoria', 'testimonios', 'estilos', 'contacto'];
IDS.forEach((id, i) => {
  const sec = document.getElementById(id);
  if (!sec) return;
  const d = document.createElement('div');
  d.setAttribute('aria-hidden', 'true'); // decorativo: cada sección ya tiene su h2
  const nm = `<span class="sx-nm" data-k="${i}"></span>`;
  if (i % 2) {
    const half = (nm + '<i class="sx-dot"></i>').repeat(6);
    d.className = 'sx-div sx-mq';
    d.dataset.dir = i % 4 === 1 ? 'l' : 'r';
    d.innerHTML = `<div class="sx-trk">${half}${half}</div>`;
  } else {
    d.className = 'sx-div sx-rule';
    d.innerHTML = `<div class="sx-in"><span class="sx-no" data-t="§${pad(i + 1)}"></span><i class="sx-ln"></i>${nm}<i class="sx-ln sx-ln2"></i><span class="sx-ct" data-t="${pad(i + 1)}/${pad(IDS.length)}"></span></div>`;
  }
  sec.before(d);
});
const names = () => document.querySelectorAll('.sx-nm').forEach(e => { e.dataset.t = tr().names[e.dataset.k]; });
names(); onLang.push(names);

// La marquesina solo corre mientras es visible (y se pausa con body.is-scrolling desde el CSS)
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('sx-off', !e.isIntersecting)));
  document.querySelectorAll('.sx-mq').forEach(m => { m.classList.add('sx-off'); io.observe(m); });
}

/* ───── (B1) Sobre mí: palabras que se iluminan con el scroll (texto real, spans en línea) ───── */
if (motion.matches && CSS.supports('animation-timeline: view()')) {
  const split = p => {
    if (p.querySelector('.sx-w')) return;
    let k = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 1) return walk(n);
      if (n.nodeType !== 3) return;
      const f = document.createDocumentFragment();
      n.data.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (!part.trim()) return f.append(part);
        const s = document.createElement('span');
        s.className = 'sx-w'; s.style.setProperty('--k', k++ % 8); s.textContent = part;
        f.append(s);
      });
      n.replaceWith(f);
    });
    walk(p);
    p.classList.add('sx-split');
  };
  document.querySelectorAll('#sobre-mi p[data-i^="about_p"]').forEach(p => {
    split(p);
    new MutationObserver(() => split(p)).observe(p, { childList: true }); // applyLang reescribe el innerHTML
  });
}

/* (B2) Laboratorio: el spotlight se sustituye por el registro lab.log (sx-lab.js / sx-lab.css) */

/* ───── (B3) Testimonios: carrusel scroll-snap con botones accesibles ───── */
const tg = $('#testimonios .test-g');
if (tg && tg.children.length > 1) {
  const slides = [...tg.children], n = slides.length;
  let cur = 0;
  tg.setAttribute('role', 'region'); tg.setAttribute('aria-roledescription', 'carousel'); tg.tabIndex = 0;
  slides.forEach((s, i) => { s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', `${i + 1} / ${n}`); });
  tg.insertAdjacentHTML('afterend',
    `<div class="sx-car"><button type="button" class="sx-prev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><span class="sx-car-n" aria-hidden="true"></span><button type="button" class="sx-next"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>`);
  const car = tg.nextElementSibling, prev = $('.sx-prev', car), next = $('.sx-next', car), num = $('.sx-car-n', car);
  const paint = () => {
    num.textContent = `${pad(cur + 1)} / ${pad(n)}`;
    prev.setAttribute('aria-disabled', cur === 0); next.setAttribute('aria-disabled', cur === n - 1);
  };
  const labels = () => { tg.setAttribute('aria-label', tr().car); prev.setAttribute('aria-label', tr().prev); next.setAttribute('aria-label', tr().next); };
  labels(); onLang.push(labels); paint();
  const go = d => {
    const s = slides[Math.max(0, Math.min(n - 1, cur + d))];
    tg.scrollTo({ left: s.offsetLeft - (parseFloat(getComputedStyle(tg).paddingLeft) || 0), behavior: motion.matches ? 'smooth' : 'auto' });
  };
  prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
  // Slide actual = el mas cercano al borde izquierdo; al final del recorrido, el ultimo (el ultimo puede no llegar al borde)
  const sync = () => {
    const pl = parseFloat(getComputedStyle(tg).paddingLeft) || 0;
    cur = tg.scrollLeft >= tg.scrollWidth - tg.clientWidth - 2 ? n - 1
      : slides.reduce((b, s, i) => Math.abs(s.offsetLeft - pl - tg.scrollLeft) < Math.abs(slides[b].offsetLeft - pl - tg.scrollLeft) ? i : b, 0);
    paint();
  };
  // La primera entrega del observer es solo el estado inicial (cur = 0): sync() obliga a maquetar la seccion durante la carga, asi que se omite
  let armed = false;
  const io = new IntersectionObserver(() => { if (armed) sync(); else armed = true; }, { root: tg, threshold: [.5, 1] });
  slides.forEach(s => io.observe(s));
}

/* ───── (B4) Estilos: barrido circular desde el botón pulsado (View Transitions + clip-path) ───── */
let ox = innerWidth / 2, oy = innerHeight / 2;
addEventListener('click', e => { // en captura: corre antes que el onClick de React, que llama a window.__vt
  const b = e.target.closest?.('.dk, .tc, .mob-themes button');
  if (!b) return;
  const r = b.getBoundingClientRect();
  ox = r.left + r.width / 2; oy = r.top + r.height / 2;
}, true);
const baseVT = window.__vt || (f => f());
window.__vt = fn => {
  if (!document.startViewTransition || !motion.matches) return baseVT(fn);
  doc.classList.add('sx-vt');
  const vt = document.startViewTransition(fn);
  vt.ready.then(() => {
    const R = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy));
    doc.animate({ clipPath: [`circle(0px at ${ox}px ${oy}px)`, `circle(${R}px at ${ox}px ${oy}px)`] },
      { duration: 650, easing: 'cubic-bezier(.65, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' });
  }, () => {});
  vt.finished.finally(() => doc.classList.remove('sx-vt'));
};

/* ───── (B5) Footer: reloj local de Barcelona (sin aria-live) ───── */
const tag = $('.fx-tag');
if (tag) {
  tag.insertAdjacentHTML('afterend', '<p class="sx-clock"><i aria-hidden="true"></i><span></span> <time></time></p>');
  const lbl = tag.nextElementSibling.querySelector('span'), tm = tag.nextElementSibling.querySelector('time');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false });
  let last = '';
  const tick = () => { const s = fmt.format(new Date()); if (s !== last) { last = s; tm.textContent = s; tm.dateTime = s; } };
  const label = () => { lbl.textContent = tr().clock; };
  tick(); label(); onLang.push(label);
  setInterval(tick, 20000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
}

/* ───── (B6) Contacto: el email se copia al clic (mailto real si el portapapeles falla) ───── */
const mail = $('#contacto a.cc-v[href^="mailto:"]');
if (mail) {
  const addr = mail.textContent.trim();
  mail.insertAdjacentHTML('beforeend', '<span class="sx-copy"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg><b></b></span>');
  const hint = $('.sx-copy b', mail);
  const live = document.createElement('span');
  live.className = 'sx-sr'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  mail.after(live);
  const text = () => { hint.textContent = mail.classList.contains('sx-ok') ? tr().copied : tr().copy; };
  text(); onLang.push(text);
  const ok = () => {
    mail.classList.add('sx-ok'); text();
    live.textContent = ''; setTimeout(() => { live.textContent = tr().live; }, 40); // se vacía antes para que repetir el clic se anuncie otra vez
    clearTimeout(mail._t);
    mail._t = setTimeout(() => { mail.classList.remove('sx-ok'); text(); }, 2000);
  };
  const legacy = () => {
    const ta = document.createElement('textarea');
    ta.value = addr; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.append(ta); ta.select();
    let done = false; try { done = document.execCommand('copy'); } catch (e) { /* sin permiso */ }
    ta.remove(); return done;
  };
  mail.addEventListener('click', e => {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // abrir en otra pestaña/app: comportamiento nativo
    if (navigator.clipboard?.writeText) {
      e.preventDefault();
      navigator.clipboard.writeText(addr).then(ok, () => { if (legacy()) ok(); else location.href = mail.href; });
    } else if (legacy()) { e.preventDefault(); ok(); } // si no, el mailto sigue su curso
  });
}
