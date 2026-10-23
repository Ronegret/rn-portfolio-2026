import './cinema.css';

/* Cinema: progresivo. Sin no-preference no se crea nada (el CSS ya va tras la misma media). */
if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = s => document.querySelector(s);
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));

  /* (1) Hero: malla de profundidad; el puntero mueve cada capa (translate inline, no choca con las animaciones en transform/rotate) */
  const hero = $('#hero');
  if (hero) {
    hero.querySelector('#lr-canvas')?.insertAdjacentHTML('afterend',
      '<div class="cin-mesh" aria-hidden="true"><i data-z="14"></i><i data-z="26"></i><i data-z="40"></i></div>');

    let inView = true;
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; hero.classList.toggle('cin-off', !inView); }).observe(hero);

    if (fine) {
      const L = [...hero.querySelectorAll('[data-z]')].map(el => ({ el, z: +el.dataset.z, x: 0, y: 0 }));
      let tx = 0, ty = 0, raf = 0;
      const tick = () => {
        raf = 0; let moving = false;
        for (const l of L) {
          const gx = tx * l.z, gy = ty * l.z;
          l.x += (gx - l.x) * .08; l.y += (gy - l.y) * .08;
          if (Math.abs(gx - l.x) > .05 || Math.abs(gy - l.y) > .05) moving = true;
          l.el.style.translate = `${l.x.toFixed(2)}px ${l.y.toFixed(2)}px`;
        }
        if (moving) raf = requestAnimationFrame(tick);
      };
      addEventListener('pointermove', e => {
        if (!inView || e.pointerType !== 'mouse') return;
        const r = hero.getBoundingClientRect();
        tx = clamp((e.clientX - r.left) / r.width - .5, .5) * 2;
        ty = clamp((e.clientY - r.top) / r.height - .5, .5) * 2;
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
    }
  }

  /* (2) Stack: índices para el escalonado (los pills los crea main.js; este módulo se importa al final de main.js) */
  document.querySelectorAll('.sc-bd').forEach(b => [...b.children].forEach((r, i) => r.style.setProperty('--i', Math.min(i, 15))));
  document.querySelectorAll('#mq-i .mpill').forEach((p, i) => p.style.setProperty('--i', i % 20));

  /* (4) Números grandes de sección: cuentan de 00 al valor al entrar */
  const nio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    nio.unobserve(e.target);
    const n = e.target, to = +n.dataset.fin, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 900, 1);
      n.dataset.n = String(Math.round((1 - (1 - p) ** 3) * to)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  document.querySelectorAll('.sec-n').forEach(n => { n.dataset.fin = n.dataset.n; n.dataset.n = '00'; nio.observe(n); });

  /* (5) Contacto: malla viva + CTA magnético con radio de atracción mayor que el botón */
  const box = $('.contact-box');
  if (box) {
    box.querySelector('.c-aurora')?.insertAdjacentHTML('afterend', '<div class="cin-grid" aria-hidden="true"></div>');
    let near = false;
    new IntersectionObserver(([e]) => { near = e.isIntersecting; box.classList.toggle('cin-off-c', !near); }, { rootMargin: '120px' }).observe(box);

    const cta = box.querySelector('.c-links .btn-p');
    if (cta && fine) {
      cta.dataset.mag = ''; // motion.js ignora los [data-mag]: aquí manda esta versión
      let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
      const tick = () => {
        raf = 0;
        x += (tx - x) * .18; y += (ty - y) * .18;
        const done = !tx && !ty && Math.abs(x) < .1 && Math.abs(y) < .1;
        cta.style.translate = done ? '' : `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        if (!done) raf = requestAnimationFrame(tick);
      };
      addEventListener('pointermove', e => {
        if (!near || e.pointerType !== 'mouse') return;
        const r = cta.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const inside = Math.hypot(dx, dy) < Math.max(r.width, r.height) / 2 + 90;
        const nx = inside ? clamp(dx * .32, 16) : 0, ny = inside ? clamp(dy * .32, 12) : 0;
        if (nx === tx && ny === ty) return;
        tx = nx; ty = ny;
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
    }
  }
}
