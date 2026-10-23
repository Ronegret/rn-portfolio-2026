
/* Ráfaga de líneas ligeras (canvas 2D) que estalla desde el puntero/toque (o el centro) cuando el nombre "revienta".
   El resto de la intro es CSS; main.js decide cuándo termina. */
(() => {
  const pl = document.getElementById('preloader');
  if (!pl || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ox = innerWidth / 2, oy = innerHeight / 2;
  const at = e => { ox = e.clientX; oy = e.clientY; };
  addEventListener('pointermove', at, { passive: true });
  addEventListener('pointerdown', at, { passive: true });

  const cv = document.createElement('canvas');
  cv.id = 'in-fx';
  pl.prepend(cv);
  const dpr = Math.min(devicePixelRatio || 1, 1.25);
  const W = cv.width = Math.round(innerWidth * dpr), H = cv.height = Math.round(innerHeight * dpr);
  const ctx = cv.getContext('2d');
  const cs = getComputedStyle(pl);
  const cols = ['--a1', '--a2', '--t1'].map(v => cs.getPropertyValue(v).trim() || '#fff');

  const N = innerWidth < 640 ? 60 : 100;
  const P = Array.from({ length: N }, (_, i) => ({
    a: Math.random() * Math.PI * 2, v: (500 + Math.random() * 1500) * dpr, d: 0,
    life: .45 + Math.random() * .4, w: (1 + Math.random() * 1.8) * dpr, c: cols[i % 3],
  }));

  let t0 = 0, last = 0;
  const frame = now => {
    if (!pl.isConnected || pl.classList.contains('pl-out')) { ctx.clearRect(0, 0, W, H); return; }
    const t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, .05);
    last = now;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of P) {
      if (t > p.life) continue;
      alive = true;
      p.d += p.v * dt; p.v *= .955;
      const cx = Math.cos(p.a), sy = Math.sin(p.a), len = Math.min(p.v * .06, 90 * dpr);
      const x = ox * dpr + cx * p.d, y = oy * dpr + sy * p.d;
      ctx.globalAlpha = 1 - t / p.life; ctx.strokeStyle = p.c; ctx.lineWidth = p.w;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - cx * len, y - sy * len); ctx.stroke();
    }
    if (alive) requestAnimationFrame(frame);
  };
  // Coincide con la "explosión" CSS (animation-delay .5s); si la intro se salta antes, nunca arranca.
  setTimeout(() => {
    if (!pl.isConnected || pl.classList.contains('pl-out') || document.hidden) return;
    t0 = last = performance.now();
    requestAnimationFrame(frame);
  }, Math.max(0, 500 - (performance.now() - (window.__t0 || performance.now())))); // el retardo CSS (.5 s) cuenta desde el primer pintado (__t0)
})();
