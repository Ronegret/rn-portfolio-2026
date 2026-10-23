import './effects.css';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* (6) Stagger: los hijos de estas rejillas heredan el retardo de .rv vía --d (si no traen data-d) */
document.querySelectorAll('.proof-grid, .test-g').forEach(g =>
  [...g.children].forEach((c, i) => { if (!c.dataset.d) c.style.setProperty('--d', i); }));

/* (2) Text-scramble solo en .eyebrow (texto plano; los .sh llevan <em>/<br> y applyLang reescribe su innerHTML) */
if (!reduced) {
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const scramble = el => {
    const node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    const final = node.data, t0 = performance.now(), dur = 450;
    el.dataset.txt = final; // el chip de capitulo (transitions.js) lee el texto final, nunca el mezclado
    const tick = now => {
      // Si applyLang reescribió el nodo, se aborta sin tocar nada
      if (el.firstChild !== node) { delete el.dataset.txt; return; }
      const p = Math.min((now - t0) / dur, 1);
      node.data = p >= 1 ? final : [...final].map((c, i) =>
        c === ' ' || i < p * final.length ? c : CH[(Math.random() * CH.length) | 0]).join('');
      if (p < 1) requestAnimationFrame(tick); else delete el.dataset.txt;
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { io.unobserve(e.target); scramble(e.target); }
  }), { threshold: .6 });
  document.querySelectorAll('.eyebrow').forEach(el => io.observe(el));
}
