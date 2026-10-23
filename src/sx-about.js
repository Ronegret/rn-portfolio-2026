/* Sobre mí · "memoria del agente". Tres piezas, todas progresivas (sin JS o con reduced-motion queda legible y estático):
   (1) manifiesto: las palabras se encienden en orden de lectura con el scroll (CSS scroll-driven; aquí solo se parte el texto)
   (2) retrato a dos capas: la capa "modo agente" se revela bajo el puntero fino (un rAF que se apaga al asentarse); en táctil la barre el scroll (CSS)
   (3) memoria: los chips de contexto se cargan en cascada al entrar en vista (una sola vez) */
const doc = document.documentElement;
const sec = document.getElementById('sobre-mi');
const motion = matchMedia('(prefers-reduced-motion: no-preference)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

if (sec) {
  /* (1) Manifiesto: spans en línea sobre el texto real; --p = posición de la palabra en el párrafo (0..1) */
  if (motion && CSS.supports('animation-timeline: view()')) {
    const split = p => {
      if (p.querySelector('.sx-w')) return;
      const words = [];
      const walk = node => [...node.childNodes].forEach(n => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3) return;
        const f = document.createDocumentFragment();
        n.data.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (!part.trim()) return f.append(part);
          const s = document.createElement('span');
          s.className = 'sx-w'; s.textContent = part;
          words.push(s); f.append(s);
        });
        n.replaceWith(f);
      });
      walk(p);
      words.forEach((s, i) => s.style.setProperty('--p', (i / Math.max(1, words.length - 1)).toFixed(3)));
      p.querySelectorAll('strong').forEach(st => { const w = st.querySelector('.sx-w'); if (w) st.style.setProperty('--p', w.style.getPropertyValue('--p')); });
      p.classList.add('sx-split');
    };
    sec.querySelectorAll('p[data-i^="about_p"]').forEach(p => {
      split(p);
      new MutationObserver(() => split(p)).observe(p, { childList: true }); // applyLang reescribe el innerHTML
    });
  }

  /* (2) Retrato */
  const fig = document.getElementById('ab-por');
  if (fig) {
    const btn = fig.querySelector('.ab-mode');
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on);
      fig.classList.toggle('full', on);
    });
    const ALT = { es: 'Retrato de Rodrigo Negrete', ca: 'Retrat de Rodrigo Negrete', en: 'Portrait of Rodrigo Negrete' };
    const img = fig.querySelector('.ab-img');
    const alt = () => { img.alt = ALT[doc.lang] || ALT.es; };
    alt(); new MutationObserver(alt).observe(doc, { attributes: true, attributeFilter: ['lang'] });

    if (motion && fine) {
      fig.classList.add('lens');
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0, ready = false;
      const tick = () => {
        raf = 0;
        x += (tx - x) * .2; y += (ty - y) * .2;
        fig.style.setProperty('--ab-x', x.toFixed(1) + 'px');
        fig.style.setProperty('--ab-y', y.toFixed(1) + 'px');
        if (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) raf = requestAnimationFrame(tick);
      };
      fig.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = fig.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!ready) { x = tx; y = ty; ready = true; } // aparece ya bajo el puntero
        fig.classList.add('on');
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
      fig.addEventListener('pointerleave', () => { fig.classList.remove('on'); ready = false; });
    } else if (motion && CSS.supports('animation-timeline: view()')) {
      fig.classList.add('scan'); // táctil: la lente cruza el retrato con el scroll (CSS)
    }
  }

  /* (3) Memoria: se arma (oculta) solo si va a animarse, y se carga una vez al entrar en vista */
  const mem = document.getElementById('ab-mem');
  if (mem && motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return mem.classList.add('arm');
      io.disconnect();
      mem.classList.add('go'); // si ya estaba a la vista (recarga a media pagina) la cascada se ve igual, sin ocultar nada antes
    }, { threshold: .2 });
    io.observe(mem);
  }
}
