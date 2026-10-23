// Clips de tarjetas: se descargan y reproducen solo en pantalla; fuera de vista o en pestaña oculta se pausan.
// Con prefers-reduced-motion, ahorro de datos o red 2g queda solo el póster (el <img> de debajo).
const vids = document.querySelectorAll('video[data-src]');
const c = navigator.connection;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches || (c && (c.saveData || /2g/.test(c.effectiveType)));

if (vids.length && !still && 'IntersectionObserver' in window) {
  const seen = new Set();
  const sync = (v) => {
    if (seen.has(v) && !document.hidden && !v.closest('[data-tj-hold]')) { // data-tj-hold: la baraja solo reproduce la tarjeta activa
      if (!v.src) v.src = v.dataset.src;
      v.play().catch(() => {});
    } else v.pause();
  };
  const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
    isIntersecting ? seen.add(v) : seen.delete(v);
    sync(v);
  }), { threshold: 0.35 });
  vids.forEach((v) => {
    // is-playing fuerza el vídeo visible solo mientras corre; al pausarse vuelve el póster (si no, quedaba congelado en un fotograma)
    const pv = v.closest('.pv');
    v.addEventListener('playing', () => pv.classList.add('is-playing'));
    v.addEventListener('pause', () => pv.classList.remove('is-playing'));
    io.observe(v);
  });
  document.addEventListener('visibilitychange', () => vids.forEach(sync));
}

// Móvil vivo (pv--live): la web real en un iframe. Solo se monta con la tarjeta en pantalla y tras idle (nunca en la carga inicial),
// se desmonta al salir de vista, en pestaña oculta o en la baraja inactiva. Solo se intenta desde rodrigonegrete.es (su CSP
// frame-ancestors bloquea otros orígenes y el bloqueo no es detectable desde fuera: el iframe dispararía load con la página de error);
// ?live=1 lo fuerza para pruebas. Si no se puede o tarda >6 s, el clip; con still, solo póster y botón "Ver animación".
const W = 390;
const allowed = /(^|\.)rodrigonegrete\.es$/.test(location.hostname) || new URLSearchParams(location.search).has('live');
const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
document.querySelectorAll('.pv[data-live]').forEach((pv) => {
  const scr = pv.querySelector('.pv-screen'), vid = pv.querySelector('video'), card = pv.closest('.bfeat') || pv;
  const play = pv.querySelector('.pv-play'), exit = pv.querySelector('.pv-exit'), load = pv.querySelector('.pv-load');
  let fr = null, timer = 0, gone = 0, inView = false, wanted = !still, failed = !allowed;
  const held = () => !!pv.closest('[data-tj-hold]');
  if (still) pv.classList.add('is-still');
  new ResizeObserver(() => pv.style.setProperty('--s', (scr.clientWidth / W).toFixed(4))).observe(scr);

  const clip = (on) => { // respaldo: el clip re-codificado, con el mismo is-playing que el resto
    if (on) { if (!vid.src) vid.src = vid.dataset.clip; vid.play().catch(() => {}); } else vid.pause();
  };
  vid.addEventListener('playing', () => pv.classList.add('is-playing'));
  vid.addEventListener('pause', () => pv.classList.remove('is-playing'));

  const drop = () => {
    clearTimeout(timer); clearTimeout(gone);
    if (pv.classList.contains('is-on')) leave(false);
    fr?.remove(); fr = null;
    pv.classList.remove('is-live', 'is-loading');
  };
  const mount = () => {
    if (fr || !wanted || !inView || held() || document.hidden) return;
    if (failed) return clip(true);
    pv.classList.add('is-loading');
    fr = document.createElement('iframe');
    fr.title = pv.dataset.liveTitle || 'Web en vivo';
    fr.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    fr.setAttribute('loading', 'lazy');
    fr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    fr.tabIndex = -1;
    fr.width = W; fr.height = 844;
    const f = fr;
    f.addEventListener('load', () => {
      if (f !== fr) return;
      clearTimeout(timer);
      pv.classList.remove('is-loading'); pv.classList.add('is-live');
      clip(false);
    }, { once: true });
    timer = setTimeout(() => { failed = true; drop(); clip(inView && !held()); }, 6000);
    f.src = pv.dataset.live;
    scr.append(f);
  };
  const sync = () => {
    if (inView && !held() && !document.hidden) { clearTimeout(gone); idle(mount, { timeout: 1500 }); if (failed && wanted) clip(true); }
    else { clip(false); clearTimeout(gone); gone = setTimeout(drop, held() || document.hidden ? 0 : 4000); } // margen para no recargar al rozar el borde
  };

  const enter = () => {
    if (!fr) return;
    pv.classList.add('is-on');
    fr.tabIndex = 0;
    fr.focus();
  };
  function leave(focus = true) {
    pv.classList.remove('is-on');
    if (fr) fr.tabIndex = -1;
    if (focus) play.focus();
  }
  // Los botones viven dentro del enlace de la tarjeta: que no naveguen.
  const btn = (b, fn) => b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
  btn(play, enter);
  btn(exit, () => leave());
  btn(load, () => { wanted = true; pv.classList.remove('is-still'); failed ? clip(true) : mount(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pv.classList.contains('is-on')) leave(); });
  // Con el foco dentro del iframe (otro origen) Esc no llega aquí: al salir el foco del móvil se desactiva el modo juego.
  window.addEventListener('blur', () => setTimeout(() => {
    if (pv.classList.contains('is-on') && document.activeElement !== fr) leave(false);
  }));
  pv.addEventListener('focusout', (e) => { if (pv.classList.contains('is-on') && !pv.contains(e.relatedTarget) && e.relatedTarget) leave(false); });

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.3 }).observe(pv);
  new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['data-tj-hold'] });
  document.addEventListener('visibilitychange', sync);

  // Inclinación 3D con el cursor (puntero fino, sin reduced-motion); rAF para no recalcular más de una vez por frame.
  if (!still && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const host = pv.closest('.bc-img') || pv;
    let raf = 0, px = 0, py = 0;
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        pv.classList.add('is-tilting');
        pv.style.setProperty('--ry', (px * 16).toFixed(2));
        pv.style.setProperty('--rx', (-py * 12).toFixed(2));
      });
    });
    host.addEventListener('pointerleave', () => {
      pv.classList.remove('is-tilting');
      pv.style.setProperty('--rx', 0); pv.style.setProperty('--ry', 0);
    });
  }
});
