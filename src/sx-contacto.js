/* Contacto: traspaso a humano. Cada intención prepara el email (mailto con asunto y cuerpo) y el WhatsApp (texto);
   la persona revisa y envía. Footer: la system card se "enciende" al entrar en vista. Sin JS, los enlaces normales siguen ahí. */
import { T } from './content.js';

const doc = document.documentElement;
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const t = () => T[doc.lang] || T.es;

const hx = document.querySelector('[data-hx]');
const mail = document.querySelector('[data-hx-mail]');
const wa = document.querySelector('[data-hx-wa]');
if (hx && mail && wa) {
  // Los datos de contacto se leen de los enlaces que ya hay en la página
  const addr = mail.getAttribute('href').replace(/^mailto:/, '').split('?')[0];
  const waBase = wa.getAttribute('href').split('?')[0];
  const draft = hx.querySelector('.hx-draft'), st = hx.querySelector('.hx-st'), subj = hx.querySelector('.hx-subj');
  const body = hx.querySelector('.hx-body'), live = hx.querySelector('.hx-sr'), btns = [...hx.querySelectorAll('.hx-i')];
  hx.querySelector('.hx-addr').textContent = addr;
  hx.hidden = false;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const marks = (s) => esc(s).replace(/\[([^\]]+)\]/g, '<mark>[$1]</mark>'); // huecos a rellenar
  const enc = encodeURIComponent;
  // RFC 6068: saltos de línea como CRLF dentro del body del mailto
  const mailto = (s, b) => `mailto:${addr}?subject=${enc(s)}&body=${enc(b.replace(/\r?\n/g, '\r\n'))}`;
  const waLink = (w) => `${waBase}?text=${enc(w)}`;

  let cur = '', timer = 0;
  const render = (k, animate) => {
    const L = t();
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    if (!k) { st.textContent = L.hx_st_idle; return; }
    const s = L[`hx_${k}_s`], b = L[`hx_${k}_b`], w = L[`hx_${k}_w`];
    mail.href = mailto(s, b);
    wa.href = waLink(w);
    subj.innerHTML = marks(s);
    body.innerHTML = b.split('\n').map((ln) => `<span class="hx-ln">${ln ? marks(ln) : '&nbsp;'}</span>`).join('');
    body.querySelectorAll('.hx-ln').forEach((el, i) => el.style.setProperty('--i', i));
    clearTimeout(timer);
    const ready = () => {
      draft.dataset.state = 'ready'; st.textContent = L.hx_st_ready;
      mail.classList.add('hx-armed'); wa.classList.add('hx-armed');
    };
    if (animate && motion.matches) {
      draft.dataset.state = 'busy'; st.textContent = L.hx_st_busy;
      // reinicia la animación de escritura y el barrido aunque se repita la misma intención
      draft.classList.remove('hx-run'); void draft.offsetWidth; draft.classList.add('hx-run');
      timer = setTimeout(ready, 520);
    } else ready();
  };

  hx.querySelector('.hx-intents').addEventListener('click', (e) => {
    const b = e.target.closest('.hx-i');
    if (!b) return;
    cur = b.dataset.k;
    render(cur, true);
    live.textContent = '';
    setTimeout(() => { live.textContent = t().hx_live + t()[`hx_${cur}_s`]; }, 40);
  });
  // applyLang reescribe los data-i y luego cambia lang: se rehace el borrador en el idioma nuevo
  new MutationObserver(() => { if (cur) render(cur, false); else render('', false); })
    .observe(doc, { attributes: true, attributeFilter: ['lang'] });
  render('', false);
}

/* Footer: system card. Un pulso recorre la tarjeta una vez y las cifras cuentan hasta su valor real (ya escrito en el HTML) */
const card = document.querySelector('[data-sys-card]');
if (card && 'IntersectionObserver' in window) {
  if (motion.matches) card.dataset.armed = ''; // el footer nunca está en el primer pantallazo: se arma sin medir
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    card.classList.add('sys-in');
    if (!motion.matches) return;
    card.querySelectorAll('b[data-sys]').forEach((el) => {
      const end = parseInt(el.textContent, 10);
      if (!(end > 0)) return;
      el.textContent = '0';
      const t0 = performance.now(), dur = 900;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  io.observe(card);
}
