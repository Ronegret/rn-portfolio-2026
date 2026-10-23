import './mobile-menu.css';

/* Capa del menú móvil: main.js sigue abriendo/cerrando (clase .open en #mob); aquí se observa
   ese estado para añadir origen del círculo, foco, bloqueo de scroll, háptica y gestos. */
const mob = document.getElementById('mob');
const ham = document.getElementById('ham');
if (mob && ham) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const LBL = { es: ['Abrir menú', 'Cerrar menú'], ca: ['Obrir menú', 'Tancar menú'], en: ['Open menu', 'Close menu'] };
  let wasOpen = false;

  const sync = () => {
    const open = mob.classList.contains('open');
    if (open === wasOpen) return;
    wasOpen = open;
    const l = LBL[root.lang] || LBL.es;
    ham.setAttribute('aria-label', l[open ? 1 : 0]);
    root.classList.toggle('mm-lock', open);
    if (open) {
      const r = ham.getBoundingClientRect();
      mob.style.setProperty('--ox', r.left + r.width / 2 + 'px');
      mob.style.setProperty('--oy', r.top + r.height / 2 + 'px');
      if (!reduced.matches) navigator.vibrate?.(10);
      mob.querySelector('.mm-l')?.focus({ preventScroll: true });
    } else {
      mob.classList.remove('mm-drag');
      mob.classList.add('mm-snap');
      mob.style.transform = mob.style.opacity = '';
      setTimeout(() => mob.classList.remove('mm-snap'), 750);
      if (mob.contains(document.activeElement)) ham.focus({ preventScroll: true });
    }
  };
  new MutationObserver(sync).observe(mob, { attributes: true, attributeFilter: ['class'] });

  // foco atrapado entre la hamburguesa (cruz) y el contenido del menú
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !mob.classList.contains('open')) return;
    const f = [ham, ...mob.querySelectorAll('a[href],button:not([disabled])')].filter((el) => el.offsetParent !== null);
    const first = f[0], end = f[f.length - 1];
    if (!f.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
    else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
  });

  // gesto: arrastrar arriba/abajo cierra; la velocidad proyecta el soltado (inercia simple)
  let y0 = 0, last = null, v = 0, drag = false, id = null, swallow = false;
  const canDrag = () => mob.scrollHeight <= mob.clientHeight + 1;
  mob.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || !mob.classList.contains('open') || !canDrag()) return;
    y0 = e.clientY; last = { y: e.clientY, t: e.timeStamp }; v = 0; drag = false; id = e.pointerId;
  });
  mob.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dy = e.clientY - y0;
    if (!drag && Math.abs(dy) > 10) { drag = true; mob.setPointerCapture(id); mob.classList.add('mm-drag'); }
    if (!drag) return;
    const dt = e.timeStamp - last.t;
    if (dt > 0) v = 0.8 * v + 0.2 * ((e.clientY - last.y) / dt);
    last = { y: e.clientY, t: e.timeStamp };
    mob.style.transform = `translate3d(0,${dy * 0.9}px,0)`;
    mob.style.opacity = Math.max(0.35, 1 - Math.abs(dy) / (innerHeight * 0.9));
  });
  const release = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    if (!drag) return;
    drag = false; swallow = true; setTimeout(() => (swallow = false), 60);
    const projected = Math.abs(e.clientY - y0) + Math.abs(v) * 220;
    mob.classList.remove('mm-drag'); mob.classList.add('mm-snap');
    mob.style.transform = mob.style.opacity = '';
    if (e.type === 'pointerup' && projected > 130) document.getElementById('mob-x')?.click();
    else setTimeout(() => mob.classList.remove('mm-snap'), 550);
  };
  mob.addEventListener('pointerup', release);
  mob.addEventListener('pointercancel', release);
  mob.addEventListener('click', (e) => { if (swallow) { e.stopPropagation(); e.preventDefault(); } }, true);
}
