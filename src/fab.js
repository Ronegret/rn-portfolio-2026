/* Boton flotante «Hablemos»: circulo abajo a la derecha que abre un mini panel (Email / WhatsApp / Ir a contacto).
   - Aparece al pasar el hero (no tapa su CTA) y se oculta mientras #contacto o el footer estan en pantalla.
   - Disclosure accesible: aria-expanded, Esc devuelve el foco al boton, clic/foco fuera cierra.
   - Pulso suave solo la primera vez que aparece (CSS lo anula con reduced-motion). */
const fab = document.getElementById('fab'), btn = document.getElementById('fcta'), panel = document.getElementById('fab-panel');
if (fab && btn && panel) {
  const isOpen = () => fab.classList.contains('open');
  const set = (o, focusFirst) => {
    if (o === isOpen()) return;
    fab.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', o);
    if (o && focusFirst) requestAnimationFrame(() => panel.querySelector('a')?.focus());
  };
  btn.addEventListener('click', e => set(!isOpen(), e.detail === 0)); // teclado (detail 0): el foco entra al panel
  panel.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); } });
  document.addEventListener('pointerdown', e => { if (isOpen() && !fab.contains(e.target)) set(false); }, { passive: true });
  fab.addEventListener('focusout', e => { if (isOpen() && e.relatedTarget && !fab.contains(e.relatedTarget)) set(false); });

  let past = false, pulsed = false;
  const near = new Set();
  const upd = () => {
    const on = past && !near.size;
    fab.classList.toggle('show', on);
    if (!on) set(false);
    if (on && !pulsed) { pulsed = true; fab.classList.add('pulse'); }
  };
  const hero = document.getElementById('hero');
  if (hero) new IntersectionObserver(([e]) => { past = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe(hero);
  else past = true;
  const io = new IntersectionObserver(es => { es.forEach(e => (e.isIntersecting ? near.add(e.target) : near.delete(e.target))); upd(); }, { threshold: 0.15 });
  document.querySelectorAll('#contacto, footer').forEach(el => io.observe(el));
}
