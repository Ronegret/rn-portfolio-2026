/* Lab (lab.log): filtro por tipo, entrada escalonada y preview flotante que sigue al cursor. Sin JS la lista ya funciona (details nativos). */
const lx = document.querySelector('[data-lx]');
if (lx) {
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const rows = [...lx.querySelectorAll('.lx-row')];
  const ease = 'cubic-bezier(.22,1,.36,1)';

  // Entrada escalonada: la sección está lejos del primer pantallazo, así que se arma sin medir (nada de layout forzado en la carga)
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    lx.classList.add('lx-in'); io.disconnect();
  }, { rootMargin: '0px 0px -15% 0px' });
  if (motion.matches) lx.dataset.armed = '';
  io.observe(lx);
  document.addEventListener('rn:layout', () => lx.classList.add('lx-in'), { once: true });

  // Filtro por tipo
  const bar = lx.querySelector('.lx-filters'), empty = lx.querySelector('.lx-empty');
  bar.hidden = false;
  bar.addEventListener('click', (ev) => {
    const b = ev.target.closest('.lx-f');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    bar.querySelectorAll('.lx-f').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const k = b.dataset.k;
    let i = 0;
    rows.forEach((r) => {
      const show = k === 'all' || r.dataset.type === k;
      if (!show) r.querySelector('details').open = false;
      r.hidden = !show;
      if (show && motion.matches) r.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 240, delay: i++ * 30, easing: ease, fill: 'backwards' });
    });
    empty.hidden = rows.some((r) => !r.hidden);
  });

  // Preview flotante: solo puntero fino y pantalla ancha (en táctil la imagen va dentro del detalle)
  const pv = document.querySelector('.lx-pv');
  const wide = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1025px)');
  if (pv) {
    const img = document.createElement('img');
    img.alt = ''; img.decoding = 'async';
    img.onload = () => img.classList.add('ok');
    pv.append(img);
    document.body.append(pv); // fuera de la sección: content-visibility la contiene y fixed dejaría de ser relativo al viewport
    let cur = null, x = 0, y = 0, tx = 0, ty = 0, raf = 0, rot = 0;
    const W = 320, H = 200;
    const place = () => {
      raf = 0;
      const k = motion.matches ? 0.2 : 1;
      const dx = (tx - x) * k;
      x += dx; y += (ty - y) * k;
      rot += ((motion.matches ? Math.max(-4, Math.min(4, dx * 0.12)) : 0) - rot) * 0.2;
      pv.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      pv.style.rotate = `${rot.toFixed(2)}deg`;
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 || Math.abs(rot) > 0.05) raf = requestAnimationFrame(place);
    };
    const target = (cx, cy) => {
      // a la derecha del cursor; si no cabe, a la izquierda; siempre dentro del viewport
      tx = cx + 28 + W > innerWidth - 12 ? cx - 28 - W : cx + 28;
      ty = Math.max(12, Math.min(innerHeight - H - 12, cy - H / 2));
    };
    const show = (row) => {
      if (row === cur) return;
      cur = row;
      const src = row.dataset.img;
      if (!img.src.endsWith(src)) { img.classList.remove('ok'); img.src = src; }
      const fit = row.querySelector('.lx-thumb img');
      img.style.objectFit = fit ? fit.style.objectFit : 'cover';
      img.style.objectPosition = fit ? fit.style.objectPosition : 'center';
      pv.classList.add('on');
    };
    const hide = () => { cur = null; pv.classList.remove('on'); };
    const list = lx.querySelector('.lx-list');
    list.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !wide.matches) return;
      const s = e.target.closest('.lx-s');
      const row = s && !s.parentElement.open ? s.closest('.lx-row') : null; // fila abierta: ya enseña su imagen
      if (!row) return hide();
      const first = !pv.classList.contains('on');
      target(e.clientX, e.clientY);
      if (first) { x = tx; y = ty + 12; }
      show(row);
      if (!raf) raf = requestAnimationFrame(place);
    }, { passive: true });
    list.addEventListener('pointerleave', hide);
    addEventListener('scroll', () => { if (cur) hide(); }, { passive: true });
    list.addEventListener('toggle', (e) => { if (e.target.open) hide(); }, true);
    // Teclado: la preview se ancla junto a la fila enfocada
    list.addEventListener('focusin', (e) => {
      const s = e.target.closest('.lx-s');
      if (!s || !wide.matches || !s.matches(':focus-visible') || s.parentElement.open) return;
      const r = s.getBoundingClientRect();
      tx = Math.min(innerWidth - W - 12, r.right - W); ty = r.top - H - 10 > 12 ? r.top - H - 10 : Math.min(innerHeight - H - 12, r.bottom + 10); // encima (o debajo) de la fila, sin tapar la fila enfocada
      x = tx; y = ty;
      show(s.closest('.lx-row')); place();
    });
    list.addEventListener('focusout', hide);
  }
}
