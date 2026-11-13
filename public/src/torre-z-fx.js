/* TorreZ: efectos de scroll y partículas. Sin dependencias; respeta prefers-reduced-motion. */
(function () {
  'use strict';
  var d = document;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* ---- reveals ---- */
  /* Activa el sistema .h3d/.rv del portfolio: sin esta clase los keyframes no disparan */
  if (!rm) d.documentElement.classList.add('rv-on');
  var targets = $$('.rv, .tz-stag, .tz-beam, .tz-kame, .h3d, .pal-chip, .tz-rule');
  if (rm || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('vis'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- count-up ---- */
  $$('[data-count]').forEach(function (el) {
    if (rm || !('IntersectionObserver' in window)) return;
    var end = parseFloat(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 1200), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + v + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* ---- escena sticky: pantalla + color de aura por paso ---- */
  var steps = $$('.tz-step');
  if (steps.length && 'IntersectionObserver' in window) {
    var imgs = $$('.tz-screens img'), dots = $$('.tz-dots i'), stage = $('.tz-stage');
    var mobile = window.matchMedia('(max-width:899px)');
    var show = function (i) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      imgs.forEach(function (m, k) { m.classList.toggle('on', k === i); });
      dots.forEach(function (m, k) { m.classList.toggle('on', k === i); });
      if (stage && steps[i].dataset.aura) stage.style.setProperty('--aura', steps[i].dataset.aura);
    };
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) show(steps.indexOf(e.target)); });
    }, { rootMargin: mobile.matches ? '-48% 0px -32% 0px' : '-42% 0px -42% 0px' });
    steps.forEach(function (s) { so.observe(s); });
  }

  /* ---- barra de ki, bolas de dragón y velocidad de scroll ---- */
  var bar = $('.tz-ki b'), balls = $$('.tz-balls i'), ballBox = $('.tz-balls');
  var vel = 0, lastY = window.scrollY, ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = d.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
      balls.forEach(function (b, i) { b.classList.toggle('lit', p * 7.4 >= i + 0.4); });
      if (ballBox) ballBox.classList.toggle('all', p > 0.985);
      vel = Math.min(14, vel + Math.abs(window.scrollY - lastY) * 0.15);
      lastY = window.scrollY;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- inclinación 3D del móvil del hero (solo puntero fino) ---- */
  var tilt = $('.tz-tilt');
  if (tilt && !rm && window.matchMedia('(pointer:fine)').matches) {
    var ph = $('.tz-phone', tilt);
    tilt.addEventListener('pointermove', function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      ph.style.transform = 'rotateY(' + x * 16 + 'deg) rotateX(' + -y * 12 + 'deg)';
    });
    tilt.addEventListener('pointerleave', function () { ph.style.transform = ''; });
  }

  /* ---- chispas de ki ---- */
  var cv = $('.tz-sparks'), burst = function () {};
  if (cv && !rm) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    var N = window.innerWidth < 700 ? 26 : 56, ps = [], run = true;
    var size = function () { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
    var spawn = function (p, y0) {
      p.x = Math.random() * W; p.y = y0 != null ? y0 : H + 10;
      p.r = (0.8 + Math.random() * 2.2) * dpr; p.v = (0.25 + Math.random() * 0.7) * dpr;
      p.dx = (Math.random() - 0.5) * 0.4 * dpr; p.hue = Math.random() < 0.7 ? 28 : 48; p.a = 0.25 + Math.random() * 0.6;
      return p;
    };
    size();
    for (var i = 0; i < N; i++) ps.push(spawn({}, Math.random() * H));
    addEventListener('resize', size);
    d.addEventListener('visibilitychange', function () { run = !d.hidden; if (run) frame(); });
    var bursts = [];
    burst = function (x, y) {
      vel = 14;
      if (x == null) return;
      for (var j = 0; j < 22; j++) {
        var a = Math.random() * 6.2832, s = (1.5 + Math.random() * 4) * dpr;
        bursts.push({ x: x * dpr, y: y * dpr, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, h: Math.random() < 0.6 ? 32 : 200 });
      }
    };
    var frame = function () {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var b = bursts.length - 1; b >= 0; b--) {
        var q = bursts[b];
        q.x += q.vx; q.y += q.vy; q.vx *= 0.96; q.vy *= 0.96; q.l -= 0.025;
        if (q.l <= 0) { bursts.splice(b, 1); continue; }
        ctx.fillStyle = 'hsla(' + q.h + ',100%,65%,' + q.l + ')';
        ctx.beginPath(); ctx.arc(q.x, q.y, 3 * dpr * q.l, 0, 6.2832); ctx.fill();
      }
      var boost = 1 + vel * 0.35; vel *= 0.94;
      for (var k = 0; k < ps.length; k++) {
        var p = ps[k];
        p.y -= p.v * boost; p.x += p.dx;
        if (p.y < -10) spawn(p);
        ctx.fillStyle = 'hsla(' + p.hue + ',100%,60%,' + p.a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'hsla(' + p.hue + ',100%,60%,' + p.a * 0.18 + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    frame();
  }

  /* ---- onda de choque al pulsar botones y el móvil ---- */
  if (!rm) {
    d.addEventListener('pointerdown', function (e) {
      if (!e.target.closest || !e.target.closest('.btn, .live-link, .tz-hero .tz-phone')) return;
      var s = d.createElement('i');
      s.className = 'tz-shock'; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      d.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 800);
      burst(e.clientX, e.clientY);
    });
  }
})();
