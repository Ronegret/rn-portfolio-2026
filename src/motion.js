import './motion.css';

const ok = matchMedia('(prefers-reduced-motion: no-preference)');

// (3) Envuelve el cambio de tema en startViewTransition; main.js lo usa vía window.__vt.
window.__vt = fn => {
  if (!document.startViewTransition || !ok.matches) return fn();
  document.documentElement.classList.add('mo-theme-vt');
  document.startViewTransition(fn).finished.finally(() =>
    document.documentElement.classList.remove('mo-theme-vt'));
};

// (4) Magnético: propiedad `translate`, un único rAF que solo corre mientras hay movimiento.
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const S = '.btn-p, .btn-s', R = 0.25, MAX = 10;
  const st = new Map(); // el -> {x,y,tx,ty}
  let raf = 0;
  const tick = () => {
    raf = 0;
    st.forEach((s, el) => {
      s.x += (s.tx - s.x) * 0.2; s.y += (s.ty - s.y) * 0.2;
      const done = !s.tx && !s.ty && Math.abs(s.x) < 0.1 && Math.abs(s.y) < 0.1;
      el.style.translate = done ? '' : `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      if (done) st.delete(el);
    });
    if (st.size) raf = requestAnimationFrame(tick);
  };
  const set = (el, tx, ty) => {
    const s = st.get(el) || { x: 0, y: 0 };
    s.tx = tx; s.ty = ty; st.set(el, s);
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const clamp = v => Math.max(-MAX, Math.min(MAX, v));
  document.addEventListener('pointermove', e => {
    if (!ok.matches || e.pointerType !== 'mouse') return;
    const el = e.target.closest?.(S);
    if (!el) return;
    const r = el.getBoundingClientRect();
    set(el, clamp((e.clientX - r.left - r.width / 2) * R), clamp((e.clientY - r.top - r.height / 2) * R));
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const el = e.target.closest?.(S);
    if (el && !el.contains(e.relatedTarget)) set(el, 0, 0);
  }, { passive: true });
}
