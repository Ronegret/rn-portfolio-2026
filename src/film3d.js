import './film3d.css';

/* Film 3D: capa de cine sobre cinema.js.
   (1) Cartelas: titulo gigante por seccion cuyas letras se despliegan en 3D (decorativo, aria-hidden; el h2 sigue siendo el titulo real).
   (2) Tomas: cada seccion entra con un movimiento de camara distinto (travelling, grua, paneo, picado, orbita, zoom, plano final).
   (3) Vinculos 3D: los enlaces del menu giran como un cubo; los botones se inclinan en 3D hacia el puntero.
   (4) Corte de cine: al pulsar un enlace interno, claqueta + bandas negras + titulo 3D del destino, salto y apertura con la toma.
   (5) Grano de pelicula y vineta.
   Progresivo: sin no-preference no se crea nada y la pagina queda tal cual. */
if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const doc = document.documentElement;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  const SECS = [
    ['hero', 'wide'], ['sobre-mi', 'dolly'], ['stack', 'crane'], ['proyectos', 'steadi'], ['laboratorio', 'pan'],
    ['trayectoria', 'tilt'], ['testimonios', 'orbit'], ['estilos', 'zoom'], ['contacto', 'push'],
  ];
  const I = {
    es: { scene: 'Esc.', take: 'Toma', names: ['Inicio', 'Sobre mí', 'Stack', 'Proyectos', 'Laboratorio', 'Trayectoria', 'Testimonios', 'Estilos', 'Contacto'],
      shots: { wide: 'Plano general', dolly: 'Travelling', crane: 'Grúa', steadi: 'Steadicam', pan: 'Paneo', tilt: 'Picado', orbit: 'Órbita', zoom: 'Zoom', push: 'Plano final' } },
    ca: { scene: 'Esc.', take: 'Presa', names: ['Inici', 'Sobre mi', 'Stack', 'Projectes', 'Laboratori', 'Trajectòria', 'Testimonis', 'Estils', 'Contacte'],
      shots: { wide: 'Pla general', dolly: 'Travelling', crane: 'Grua', steadi: 'Steadicam', pan: 'Panoràmica', tilt: 'Picat', orbit: 'Òrbita', zoom: 'Zoom', push: 'Pla final' } },
    en: { scene: 'Sc.', take: 'Take', names: ['Home', 'About', 'Stack', 'Projects', 'Lab', 'Career', 'Testimonials', 'Styles', 'Contact'],
      shots: { wide: 'Wide shot', dolly: 'Dolly', crane: 'Crane', steadi: 'Steadicam', pan: 'Pan', tilt: 'Tilt', orbit: 'Orbit', zoom: 'Zoom', push: 'Push-in' } },
  };
  const tr = () => I[doc.lang] || I.es;
  const pad = n => String(n).padStart(2, '0');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const letters = (w, cls) => [...w].map((c, i) => `<span class="${cls}" style="--i:${i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
  const slate = (i, shot) => { const t = tr(); return `${t.scene} ${pad(i)} · ${t.take} 1 — ${t.shots[shot]}`; };

  doc.classList.add('f3');

  /* ───── (1)+(2) Cartelas y tomas ───── */
  const cards = [];
  SECS.forEach(([id, shot], i) => {
    if (!i) return; // el hero ya tiene su propio titulo
    const sec = document.getElementById(id);
    const wrap = sec?.querySelector(':scope > .wrap');
    if (!wrap) return;
    sec.dataset.shot = shot;
    const card = document.createElement('div');
    card.className = 'f3-card';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = '<span class="f3-sk"></span><span class="f3-w"></span>';
    wrap.prepend(card);
    cards.push({ card, i, shot });
  });

  // Ajuste de tamano: la palabra ocupa el ancho disponible sin desbordar (cada idioma/tema mide distinto)
  const fit = () => cards.forEach(({ card }) => {
    const w = card.querySelector('.f3-w');
    w.style.fontSize = '100px';
    const nat = w.scrollWidth || 1;
    const max = Math.min(card.clientWidth, 1400);
    w.style.fontSize = Math.max(34, Math.min(176, 100 * max / nat * .96)).toFixed(1) + 'px';
  });
  const paint = () => {
    cards.forEach(({ card, i, shot }) => {
      card.querySelector('.f3-sk').textContent = slate(i, shot);
      card.querySelector('.f3-w').innerHTML = letters(tr().names[i].toUpperCase(), 'f3-l');
    });
    fit();
  };
  paint();
  new MutationObserver(paint).observe(doc, { attributes: true, attributeFilter: ['lang'] });
  // la fuente del tema cambia el ancho: se reajusta al cambiar de tema y cuando terminan de cargar las fuentes
  new MutationObserver(() => setTimeout(fit, 520)).observe(doc, { attributes: true, attributeFilter: ['data-theme'] });
  document.fonts?.ready.then(fit);
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(fit, 150); }, { passive: true });

  const play = sec => sec.classList.add('f3-in');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    play(e.target);
  }), { rootMargin: '0px 0px -18% 0px', threshold: 0 });
  document.querySelectorAll('.sec[data-shot]').forEach(s => io.observe(s));

  /* ───── (3) Vinculos 3D ───── */
  // Menu: cubo que gira mostrando la cara inferior. main.js reescribe el <a> al cambiar de idioma, asi que se rehace.
  const cubes = () => document.querySelectorAll('.nav-links a[data-i]').forEach(a => {
    if (a.querySelector('.f3-cube')) return;
    const t = a.textContent.trim();
    const lbl = a.querySelector('.nav-lbl');
    const html = `<span class="f3-cube" data-t="${esc(t)}">${esc(t)}</span>`;
    if (lbl) lbl.innerHTML = html;
    else a.innerHTML = `<span class="nav-lbl">${html}</span><span class="nav-adot" aria-hidden="true"></span>`;
  });
  cubes();
  const nl = document.getElementById('nav-links');
  if (nl) new MutationObserver(cubes).observe(nl, { childList: true, subtree: true }); // idempotente: sus propios cambios no lo rehacen

  // Botones: inclinacion 3D hacia el puntero (variables CSS; el translate magnetico de motion/cinema va aparte)
  if (fine) {
    const SEL = '.btn-p, .btn-s, .nav-cta';
    let cur = null;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const b = e.target.closest?.(SEL);
      if (cur && cur !== b) { cur.style.removeProperty('--f3x'); cur.style.removeProperty('--f3y'); cur.style.removeProperty('--f3g'); }
      cur = b;
      if (!b) return;
      const r = b.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      b.style.setProperty('--f3y', ((px - .5) * 22).toFixed(2) + 'deg');
      b.style.setProperty('--f3x', ((.5 - py) * 26).toFixed(2) + 'deg');
      b.style.setProperty('--f3g', (px * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ───── (4) Corte de cine en los enlaces internos ───── */
  const cut = document.createElement('div');
  cut.id = 'f3-cut';
  cut.setAttribute('aria-hidden', 'true');
  cut.innerHTML = '<i class="f3-bar f3-t"></i><i class="f3-bar f3-b"></i><i class="f3-leak"></i>'
    + '<div class="f3-slate"><span class="f3-clap"><i></i></span><span class="f3-sk"></span><span class="f3-big"></span><span class="f3-tc"></span></div>';
  document.body.append(cut);
  const ix = Object.fromEntries(SECS.map(([id], i) => [id, i]));
  let busy = false, pass = false;

  document.addEventListener('click', e => {
    if (pass || busy || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href^="#"], a[href^="/#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    const id = (href.startsWith('/#') ? href.slice(2) : href.slice(1));
    const target = id && document.getElementById(id);
    if (!target || !(id in ix)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    busy = true;

    const i = ix[id], shot = SECS[i][1];
    cut.querySelector('.f3-sk').textContent = slate(i, shot);
    cut.querySelector('.f3-big').innerHTML = letters(tr().names[i].toUpperCase(), 'f3-bl');
    const d = new Date();
    cut.querySelector('.f3-tc').textContent = `TC ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}:${pad(Math.floor(d.getMilliseconds() / 41.7))}`;
    cut.classList.remove('f3-out');
    void cut.offsetWidth;
    cut.classList.add('f3-go');

    setTimeout(() => {
      // la logica de siempre (cerrar menu movil, cv-off, pushState) la hace main.js; aqui solo se cambia el scroll suave por un corte seco
      pass = true; a.click(); pass = false;
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      if (target.dataset.shot) { io.unobserve(target); target.classList.remove('f3-in'); void target.offsetWidth; }
      cut.classList.add('f3-out');
      setTimeout(() => target.dataset.shot && play(target), 60);
      setTimeout(() => { cut.classList.remove('f3-go', 'f3-out'); busy = false; }, 820);
    }, 700);
  }, true);

  /* ───── (5) Grano + vineta ───── */
  const fx = document.createElement('div');
  fx.id = 'f3-fx';
  fx.setAttribute('aria-hidden', 'true');
  if (!fine) fx.classList.add('f3-still');
  document.body.append(fx);
  document.addEventListener('visibilitychange', () => fx.classList.toggle('f3-still', !fine || document.hidden));
}
