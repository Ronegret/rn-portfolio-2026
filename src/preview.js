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
    v.addEventListener('playing', () => v.closest('.pv').classList.add('is-playing'), { once: true });
    io.observe(v);
  });
  document.addEventListener('visibilitychange', () => vids.forEach(sync));
}
