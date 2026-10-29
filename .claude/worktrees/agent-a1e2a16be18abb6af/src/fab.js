/* Botón flotante «Hablemos»: no tapa lectura.
   - Se oculta al bajar y reaparece al subir (patrón de barra de navegación móvil).
   - Se oculta mientras #contacto o el footer están en pantalla (ya hay CTA allí). */
const f = document.getElementById('fcta');
if (f) {
  let last = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const dy = scrollY - last;
      if (Math.abs(dy) > 8) { f.classList.toggle('fab-hide', dy > 0 && scrollY > 200); last = scrollY; }
      ticking = false;
    });
  }, { passive: true });
  const near = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? near.add(e.target) : near.delete(e.target)));
    f.classList.toggle('fab-off', near.size > 0);
  }, { threshold: 0.15 });
  document.querySelectorAll('#contacto, footer').forEach((el) => io.observe(el));
}
