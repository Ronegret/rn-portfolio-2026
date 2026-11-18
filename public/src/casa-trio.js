/* Caso Casa Trío · v3. Un solo bucle rAF para todo lo que se mueve: scroll suave (Lenis, copia local), cortinas, parallax,
   tiras a la deriva, platos que se arman, fondos vivos (sol de Nami, trama de Smash, brasas de Fuoco) y cursor.
   prefers-reduced-motion: nada de esto (contenido estático, vídeos con su póster). Táctil: sin cursor, imán, brillo, rastro ni letras al ratón. */
(() => {
  const d = document, root = d.documentElement;
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  if (motion) root.classList.add('fx');
  if (motion && fine) root.classList.add('fine');
  const lenis = motion && window.Lenis ? new window.Lenis({ lerp: 0.1, anchors: true }) : null; // scroll suave: copia local de Lenis (MIT)
  const cur = motion && fine ? d.querySelector('.cur') : null, curL = cur && cur.querySelector('.cur-l');
  let hot = null;
  const CUR = { nami: ['#e5533c', '#fff'], smash: ['#121110', '#ffd21f'], fuoco: ['#a63a14', '#fff'] };
  const label = (target) => {
    if (!cur) return;
    hot = target && target.closest ? target.closest('[data-cur]') : null;
    const kind = hot && hot.dataset.cur;
    cur.classList.toggle('big', !!kind);
    curL.textContent = kind === 'play' ? (hot.paused ? 'Play' : 'Pausa') : kind === 'ver' ? 'Ver' : '';
    const ch = target && target.closest && target.closest('.ch'), c = (ch && CUR[ch.dataset.brand]) || ['#f3ece0', '#121110'];
    cur.style.setProperty('--cur-c', c[0]); cur.style.setProperty('--cur-t', c[1]);
  };

  /* ── vídeos: se reproducen solo en pantalla; clic para pausar o seguir ── */
  const seen = new WeakMap(), held = new WeakSet();
  const sync = (v) => {
    if (seen.get(v) && motion && !d.hidden && !held.has(v)) { const p = v.play(); if (p) p.catch(() => {}); }
    else if (!v.paused) v.pause();
  };
  const vio = new IntersectionObserver((es) => es.forEach((e) => { seen.set(e.target, e.isIntersecting); sync(e.target); }), { threshold: 0.25 });
  $$('video.ct-vid').forEach((v) => {
    vio.observe(v);
    v.addEventListener('click', () => { if (v.paused) { held.delete(v); seen.set(v, true); v.play().catch(() => {}); } else { held.add(v); v.pause(); } label(v); });
  });
  d.addEventListener('visibilitychange', () => $$('video.ct-vid').forEach(sync));

  /* ── ampliación de fotos ── */
  const lb = d.querySelector('.lb');
  if (lb && lb.showModal) {
    const lbImg = lb.querySelector('.lb-img'), lbCap = lb.querySelector('.lb-cap');
    let back = null;
    $$('.ph-in').forEach((el) => {
      const im = el.querySelector('img');
      el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `Ampliar: ${im.alt}`);
      const open = () => { back = el; lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbImg.width = im.naturalWidth || im.width; lbImg.height = im.naturalHeight || im.height; lbCap.textContent = im.alt; lb.showModal(); if (lenis) lenis.stop(); };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    lb.querySelector('.lb-x').addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => { if (lenis) lenis.start(); if (back) back.focus(); });
  }

  /* ── contadores ── */
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, n = +el.dataset.count;
    if (!motion || !n) return;
    const t0 = performance.now(), dur = n > 10 ? 1500 : 800;
    const step = (t) => { const p = clamp((t - t0) / dur); el.textContent = Math.round(n * ease(p)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  // sin ratón: la zona del rastro enseña los platos quietos, debajo del texto
  if (!(motion && fine)) {
    const zone = d.querySelector('[data-trail]');
    if (zone) {
      const t = zone.querySelector('.trail-t'); t.removeAttribute('data-split'); t.innerHTML = 'La carta, <em>en pegatinas.</em>';
      const row = d.createElement('div'); row.className = 'trail-row'; row.setAttribute('aria-hidden', 'true');
      $$('.ch-smash .gal img').slice(0, 4).forEach((i) => { const im = new Image(); im.src = i.getAttribute('src'); im.alt = ''; im.width = i.width; im.height = i.height; im.loading = 'lazy'; row.append(im); });
      zone.append(row);
    }
  }

  if (!motion) return; // a partir de aquí, solo movimiento

  /* ── letras: palabras y caracteres; el lector de pantalla lee el texto entero por aria-label ── */
  const split = (el) => {
    const txt = el.textContent.replace(/\s+/g, ' ').trim();
    // encabezados: aria-label; un <p> no admite aria-label, así que lleva una copia solo para lectores de pantalla
    const sr = /^H[1-6]$/.test(el.tagName) ? null : Object.assign(d.createElement('span'), { className: 'sr-only', textContent: txt });
    if (!sr) el.setAttribute('aria-label', txt);
    let i = 0;
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 1) { walk(n); continue; }
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = d.createElement('span'); w.className = 'split-w'; w.setAttribute('aria-hidden', 'true');
          for (const ch of part) { const c = d.createElement('span'); c.className = 'split-c'; c.textContent = ch; c.style.setProperty('--i', i++); w.append(c); }
          frag.append(w);
        });
        n.replaceWith(frag);
      }
    };
    walk(el);
    if (sr) el.append(sr);
  };
  $$('[data-split]').forEach(split);

  /* ── entradas ── */
  $$('.role, .facts li, .quote-cap, .idea-head p, .idea-media, .logos li, .brand-cap, .spec div, .strip .kick, .clips > *, .speeds li, .ia-big, .ia-list li, .chips li, .kpis li, .res-cap, .proves li, .fin-act, .note, .smash-open-copy > p, .smash-open-img, .trail-s, .trail-row, .wow-cap, .ch-title p').forEach((el) => el.classList.add('rv'));
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-split], .rv, .ph').forEach((el) => rio.observe(el));

  /* ── piezas que dependen del scroll ── */
  const vis = new Map();
  const vio2 = new IntersectionObserver((es) => { es.forEach((e) => vis.set(e.target, e.isIntersecting)); lastY = -1; }, { rootMargin: '20% 0px' }); // al entrar algo en pantalla, se recalcula aunque no haya scroll
  const watch = (el) => { vis.set(el, false); vio2.observe(el); return el; };
  const pars = $$('[data-par]'); pars.forEach((el) => watch(el.parentElement));
  const curtains = $$('.ch-curtain'); curtains.forEach((c) => { watch(c.parentElement); c.style.transform = 'scaleY(1)'; });
  const drifts = $$('[data-drift]'); drifts.forEach(watch);
  const builds = $$('[data-build]').map((s) => (watch(s), {
    s, box: s.querySelector('.build'), done: s.querySelector('.build-done'),
    lays: $$('.lay', s).map((el) => ({ el, t: el.querySelector('.lay-t'), y0: +el.dataset.y0, y1: +el.dataset.y1, r0: +el.dataset.r0 })),
  }));
  // las etiquetas van en una columna fuera de la capa más ancha: así ninguna pisa la foto de otra capa
  const placeLabels = () => builds.forEach((b) => { const W = b.box.clientWidth, k = parseFloat(getComputedStyle(b.box).getPropertyValue('--k')) || 1, ws = b.lays.map((L) => parseFloat(L.el.style.getPropertyValue('--w')) * k), M = Math.max(...ws); b.lays.forEach((L, i) => { const px = ((M - ws[i]) / 200) * W + 18; L.t.style.translate = L.el.classList.contains('lay-l') ? `-${px.toFixed(0)}px -50%` : `${px.toFixed(0)}px -50%`; }); });
  placeLabels(); addEventListener('resize', placeLabels);
  const fires = $$('[data-fire]').map((s) => (watch(s), { s, pz: s.querySelector('.fire-pz') }));
  const sun = d.querySelector('.ch-nami .sun'), dots = d.querySelector('.ch-smash .dots');
  const sunCh = sun && watch(sun.closest('.ch')), dotsCh = dots && watch(dots.closest('.ch'));

  /* brasas (de components/pizza/Embers): suben, se balancean y se avivan con la velocidad del scroll */
  const embers = $$('canvas.embers').map((c) => {
    watch(c);
    const ctx = c.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    const E = { c, ctx, ps: [], w: 0, h: 0 };
    E.size = () => { E.w = c.clientWidth; E.h = c.clientHeight; c.width = E.w * dpr; c.height = E.h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    E.spawn = (p, any) => Object.assign(p, { x: Math.random() * E.w, y: any ? Math.random() * E.h : E.h + 8, r: 0.8 + Math.random() * 2.2, vy: 0.35 + Math.random() * 0.9, sw: Math.random() * 6.3, life: 1, dec: 0.0015 + Math.random() * 0.004 });
    E.size(); for (let i = 0; i < 46; i++) E.ps.push(E.spawn({}, true));
    return E;
  });

  let vh = innerHeight, lastY = -1, boost = 0;
  addEventListener('resize', () => { vh = innerHeight; lastY = -1; embers.forEach((E) => E.size()); });

  function scrollFx() {
    for (const el of pars) {
      const box = el.parentElement; if (!vis.get(box)) continue;
      const r = box.getBoundingClientRect(), k = box.classList.contains('smash-open-img') ? -0.06 : -0.14;
      el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) * k).toFixed(1)}px,0)`;
    }
    for (const c of curtains) {
      const p = c.parentElement; if (!vis.get(p)) continue;
      const q = clamp((vh - p.getBoundingClientRect().top) / (vh * 0.75));
      c.style.transform = `scaleY(${(1 - ease(q)).toFixed(4)})`;
    }
    for (const s of drifts) {
      if (!vis.get(s)) continue;
      const tr = s.querySelector('.strip-track'), r = s.getBoundingClientRect();
      const dist = Math.max(0, tr.scrollWidth - innerWidth);
      tr.style.transform = `translate3d(${(-clamp((vh - r.top) / (vh + r.height)) * dist).toFixed(1)}px,0,0)`;
    }
    for (const b of builds) {
      if (!vis.get(b.s)) continue;
      const r = b.s.getBoundingClientRect(), p = clamp(-r.top / (r.height - vh));
      const e = ease(clamp((p - 0.08) / 0.62)), H = b.box.clientHeight, fade = clamp((e - 0.86) / 0.14);
      b.lays.forEach((L, i) => {
        const y = (L.y0 + (L.y1 - L.y0) * e) / 100 * H, x = Math.sin(i * 1.7) * 14 * (1 - e);
        L.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(L.r0 * (1 - e)).toFixed(2)}deg)`;
        L.el.style.opacity = (1 - fade).toFixed(3);
        L.t.style.opacity = clamp(1 - e * 1.8).toFixed(3);
      });
      b.done.style.opacity = fade.toFixed(3);
      b.done.style.transform = `scale(${(0.94 + fade * 0.06).toFixed(3)})`;
    }
    for (const f of fires) {
      if (!vis.get(f.s)) continue;
      const r = f.s.getBoundingClientRect(), p = ease(clamp(-r.top / (r.height - vh)));
      f.pz.style.transform = `scale(${(0.32 + p * 0.68).toFixed(3)}) rotate(${(p * 200 - 20).toFixed(1)}deg)`;
    }
    if (dots && vis.get(dotsCh)) dots.style.transform = `translate3d(0,${(dotsCh.getBoundingClientRect().top * -0.2).toFixed(1)}px,0)`;
  }

  function bgFx(t) {
    if (sun && vis.get(sunCh)) {
      const top = sunCh.getBoundingClientRect().top;
      sun.style.transform = `translate3d(${(Math.sin(t / 9000) * 50).toFixed(1)}px,${(top * -0.18 + Math.cos(t / 11000) * 30).toFixed(1)}px,0)`;
    }
    for (const E of embers) {
      if (!vis.get(E.c)) continue;
      const { ctx, w, h } = E;
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'lighter';
      for (const p of E.ps) {
        p.y -= p.vy * (1 + boost); p.sw += 0.02; p.x += Math.sin(p.sw) * 0.45; p.life -= p.dec;
        if (p.life <= 0 || p.y < -10) E.spawn(p, false);
        const a = Math.min(1, p.life * (0.65 + 0.35 * Math.sin(p.sw * 4)));
        ctx.fillStyle = `rgba(255,120,40,${a * 0.18})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(255,${170 + Math.round(p.life * 60)},90,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
    }
  }

  /* ── cursor, imán, brillo, letras al ratón (solo puntero fino) ── */
  let mx = -100, my = -100, cx = -100, cy = -100, proxOn = false;
  const prox = d.querySelector('.prox'), proxC = prox ? $$('.split-c', prox) : [];
  if (fine) {
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; cur.classList.add('on'); }, { passive: true });
    d.addEventListener('pointerover', (e) => label(e.target));
    d.documentElement.addEventListener('pointerleave', () => cur.classList.remove('on'));
    d.addEventListener('pointermove', (e) => {
      const g = e.target.closest && e.target.closest('.ph-in, .tri-p'); if (!g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty('--gx', `${e.clientX - r.left}px`); g.style.setProperty('--gy', `${e.clientY - r.top}px`);
    }, { passive: true });
    $$('.mag').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transition = 'transform .15s'; b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transition = 'transform .6s cubic-bezier(.3,1.6,.5,1)'; b.style.transform = ''; });
    });
    if (prox) { const hero = prox.closest('.hero'); hero.addEventListener('pointerenter', () => { proxOn = true; proxC.forEach((c) => { c.style.transition = 'transform .25s ease-out'; }); }); hero.addEventListener('pointerleave', () => { proxOn = false; proxC.forEach((c) => { c.style.transform = ''; }); }); }
    const nami = d.querySelector('.nm-nami');
    if (nami) { const cs = $$('.split-c', nami), mid = (cs.length - 1) / 2; nami.addEventListener('pointerenter', () => cs.forEach((c, i) => { c.style.transform = `translateX(${((i - mid) * 0.07).toFixed(2)}em)`; })); nami.addEventListener('pointerleave', () => cs.forEach((c) => { c.style.transform = ''; })); }
    const smash = d.querySelector('.nm-smash');
    if (smash) {
      const cs = $$('.split-c', smash), orig = cs.map((c) => c.textContent), POOL = 'SMASHCLUB!#%&*';
      let busy = false;
      smash.addEventListener('pointerenter', () => {
        if (busy) return; busy = true; const t0 = performance.now();
        const step = (t) => {
          const k = (t - t0) / 520;
          cs.forEach((c, i) => { c.textContent = k * cs.length > i ? orig[i] : POOL[(Math.random() * POOL.length) | 0]; });
          if (k < 1) requestAnimationFrame(step); else { cs.forEach((c, i) => { c.textContent = orig[i]; }); busy = false; }
        };
        requestAnimationFrame(step);
      });
    }
    // rastro de platos (idea de components/fx/ImageTrail)
    const zone = d.querySelector('[data-trail]');
    if (zone) {
      const pool = $$('.ch-smash .gal img, .ch-smash .strip img').slice(0, 12).map((src) => { const im = new Image(src.width, src.height); im.src = src.getAttribute('src'); im.alt = ''; im.className = 'trail-img'; im.decoding = 'async'; im.dataset.ar = src.height / src.width; zone.append(im); return im; });
      let k = 0, lx = -999, ly = -999;
      const copy = [zone.querySelector('.trail-t'), zone.querySelector('.trail-s')];
      zone.addEventListener('pointermove', (e) => {
        const r = zone.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (Math.hypot(x - lx, y - ly) < 90) return; lx = x; ly = y;
        const im = pool[k % pool.length], rot = (Math.random() * 24 - 12).toFixed(1), w = im.offsetWidth || 160, h = w * +im.dataset.ar; // alto real por proporción, aunque la foto aún no haya cargado
        // ningún plato tapa una letra: si la foto (girada, con margen) tocaría el titular o la frase, no sale
        const pad = 0.3 * Math.max(w, h), box = { l: x - w / 2 - pad, t: y - h / 2 - pad, r: x + w / 2 + pad, b: y + h / 2 + pad };
        if (copy.some((c) => { const q = c.getBoundingClientRect(); return box.l < q.right - r.left && box.r > q.left - r.left && box.t < q.bottom - r.top && box.b > q.top - r.top; })) return;
        k++;
        const base = `translate(${(x - w / 2).toFixed(0)}px,${(y - h / 2).toFixed(0)}px) rotate(${rot}deg)`;
        zone.append(im);
        im.animate([{ opacity: 0, transform: `${base} scale(.5)` }, { opacity: 1, transform: `${base} scale(1)`, offset: 0.18 }, { opacity: 1, transform: `${base} scale(1)`, offset: 0.55 }, { opacity: 0, transform: `${base} translateY(40px) scale(.85)` }], { duration: 1200, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      });
    }
  }

  /* ── bucle único: en pestañas ocultas el navegador lo detiene solo ── */
  function loop(t) {
    if (lenis) lenis.raf(t);
    const y = scrollY;
    boost += (Math.min(Math.abs(y - (lastY < 0 ? y : lastY)) / 10, 4) - boost) * 0.08;
    if (y !== lastY) { lastY = y; scrollFx(); }
    bgFx(t);
    if (cur) {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      if (proxOn) for (const c of proxC) {
        const r = c.getBoundingClientRect(), dd = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)), k = clamp(1 - dd / 220);
        c.style.transform = k ? `translateY(${(-k * 0.16).toFixed(3)}em) rotate(${(-k * 7).toFixed(2)}deg)` : '';
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  addEventListener('load', () => { lastY = -1; });
})();
