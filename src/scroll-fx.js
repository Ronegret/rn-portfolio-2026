import './scroll-fx.css';

/* (8) Reveal de imágenes de tarjeta una sola vez. La clase de ocultación se añade aquí, así sin JS o con reduced-motion no se oculta nada. */
if (matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.classList.add('sfx-in');
  }), { threshold: .15 });
  document.querySelectorAll('.bc-img, .lab-card-img').forEach(el => {
    el.classList.add('sfx-rev');
    io.observe(el);
  });
}
