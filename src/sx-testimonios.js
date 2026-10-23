/* Testimonios: pestañas accesibles (tablist) + lectura iluminada + avance automatico con pausa visible.
   Todo el movimiento es CSS; aqui solo se cambia el estado (los textos traducibles viven en el HTML con data-i). Sin JS: primera cita completa.
   Clases en .sx-ts: armed (hay movimiento), live (ya entro en vista), hold (fuera de vista / puntero o foco dentro), auto (avance activo). */
const root = document.querySelector('#testimonios .sx-ts');
if (root) {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const tabs = [...root.querySelectorAll('[role=tab]')];
  const panels = [...root.querySelectorAll('[role=tabpanel]')];
  const list = root.querySelector('[role=tablist]');
  const wire = root.querySelector('.sx-ts-wire');
  const play = root.querySelector('.sx-ts-play');
  let cur = 0, auto = motion, inView = false, inside = false;

  // el pulso del cable apunta al centro de la fuente activa (solo se mide con la seccion en vista)
  const aim = () => {
    if (!inView) return;
    const t = tabs[cur].getBoundingClientRect(), w = wire.getBoundingClientRect();
    root.style.setProperty('--x', `${Math.round(t.left + t.width / 2 - w.left)}px`);
  };
  const paint = () => {
    root.classList.toggle('auto', auto);
    root.classList.toggle('hold', !inView || inside);
    play.dataset.paused = String(!auto); // el nombre visible cambia (Pausar / Reanudar); sin aria-pressed para no duplicar el estado
  };

  const select = (i, user) => {
    cur = (i + tabs.length) % tabs.length;
    if (user) auto = false; // quien elige toma el control: el avance automatico se detiene
    tabs.forEach((t, k) => {
      const on = k === cur;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('lit', on && !motion);
    });
    panels.forEach((p, k) => {
      const on = k === cur;
      p.classList.toggle('on', on);
      p.inert = !on;
      if (on) p.style.setProperty('--read', `${Math.min(3800, Math.max(1600, p.textContent.length * 22))}ms`);
    });
    root.dataset.cur = String(cur + 1);
    aim(); paint();
  };

  tabs.forEach((t, k) => t.addEventListener('click', () => (k === cur ? ((auto = false), paint()) : select(k, true))));
  list.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const to = d ? cur + d : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    select(to, true);
    tabs[cur].focus();
  });

  if (motion) {
    root.classList.add('armed');
    tabs[0].classList.remove('lit'); // la primera fuente se enciende al terminar su lectura
    panels[0].style.setProperty('--read', `${Math.min(3800, Math.max(1600, panels[0].textContent.length * 22))}ms`);
    play.hidden = false;
    play.addEventListener('click', () => { auto = !auto; paint(); });
    // fin de la lectura -> la fuente se ilumina; fin de la barra de progreso -> siguiente cita
    root.addEventListener('animationend', (e) => {
      const c = e.target.classList;
      if (c.contains('sx-ts-txt') && e.target.closest('.on')) tabs[cur].classList.add('lit');
      else if (c.contains('sx-ts-prog') && auto) select(cur + 1);
    });
    root.addEventListener('pointerenter', () => { inside = true; paint(); });
    root.addEventListener('pointerleave', () => { inside = root.contains(document.activeElement); paint(); });
    root.addEventListener('focusin', () => { inside = true; paint(); });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { inside = root.matches(':hover'); paint(); } });
  }
  new IntersectionObserver(([en]) => {
    inView = en.isIntersecting;
    if (inView) { root.classList.add('live'); aim(); }
    paint();
  }, { threshold: 0.35 }).observe(root);

  // al cambiar de idioma cambia el ancho de las fuentes
  new MutationObserver(() => requestAnimationFrame(aim)).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  addEventListener('resize', aim, { passive: true });
  paint();
}
