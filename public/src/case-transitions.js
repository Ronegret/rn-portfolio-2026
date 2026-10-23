/* Transiciones entre páginas (MPA View Transitions): morph de la imagen de la tarjeta <-> hero del caso + cortinilla.
   Una sola fuente: los casos la cargan por <script> y la portada la incrusta inline (Layout.astro).
   Sin soporte (Firefox, Safari antiguo) los eventos pageswap/pagereveal no existen y no se hace nada. */
(() => {
  if (!('onpagereveal' in window)) return;
  const KEY = 'rn-vt', NAME = 'rn-hero', root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const slugOf = p => (p.match(/^\/([^/]+)\//) || [])[1] || '';
  const isHome = p => p === '/' || p === '/index.html';
  const rectOf = (el, br) => { const r = el.getBoundingClientRect(); return { t: r.top, r: innerWidth - r.right, b: innerHeight - r.bottom, l: r.left, br: br ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) }; };
  const cardOf = s => s && document.querySelector(`a.bc[href="/${s}/"]`);
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > innerHeight * .1 && r.top < innerHeight * .9; };
  const BAD = /logo|brand|avatar|icon|mark/i;
  // Hero del caso: primera imagen/vídeo grande de la primera pantalla que no sea un logo
  const heroOf = () => [...document.querySelectorAll('img,video')].find(el => {
    const r = el.getBoundingClientRect();
    return r.width >= 200 && r.height >= 120 && r.top < innerHeight * 1.1 && r.bottom > 0 && !BAD.test(el.className) && !/^logo/i.test(el.getAttribute('alt') || '');
  });
  // Volver a la portada desde un caso (atrás, enlace o historial): sin preloader, que si no se vería dentro de la transición
  if (isHome(location.pathname)) try {
    if ((sessionStorage.getItem(KEY) || '').includes('"back"') || performance.getEntriesByType('navigation')[0]?.type === 'back_forward'
      || (document.referrer && new URL(document.referrer).origin === location.origin)) root.classList.add('rn-skip-intro');
  } catch {}
  let click = 0, clickEl = null;
  addEventListener('click', e => { clickEl = e.target.closest?.('a[href]'); click = performance.now(); }, true);

  addEventListener('pageswap', e => {
    const vt = e.viewTransition, to = e.activation?.entry?.url;
    if (!vt || !to) return;
    const dest = new URL(to);
    if (dest.origin !== location.origin) return;
    root.classList.add('rn-leaving'); // la portada usa esta clase para apagar el flash de cámara: si no, queda congelado en la instantánea
    if (reduce.matches) return;
    const fresh = clickEl && performance.now() - click < 2000;
    let d = { d: 'nav' }, named;
    if (isHome(location.pathname) && !isHome(dest.pathname)) {
      const s = slugOf(dest.pathname), card = cardOf(s);
      if (card) { d = { d: 'open', s, ...rectOf(card) }; named = card.querySelector('.bc-img'); }
    } else if (!isHome(location.pathname) && isHome(dest.pathname)) {
      const s = slugOf(location.pathname), h = heroOf();
      d = { d: 'back', s };
      if (h && inView(h)) named = h;
    }
    if (d.d === 'nav' && fresh) d = { d: 'nav', ...rectOf(clickEl) };
    if (named) named.style.viewTransitionName = NAME;
    try { sessionStorage.setItem(KEY, JSON.stringify({ ...d, ts: Date.now() })); } catch {}
    vt.finished.catch(() => {}).then(() => { if (named) named.style.viewTransitionName = ''; });
  });

  addEventListener('pageshow', () => root.classList.remove('rn-leaving')); // restauración desde bfcache

  addEventListener('pagereveal', e => {
    const vt = e.viewTransition;
    if (!vt) return;
    let d = null;
    try { d = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch {}
    if (d && Date.now() - d.ts > 15000) d = null; // dato viejo: otra navegación sin esta lógica
    if (reduce.matches) return;
    const set = r => ['t', 'r', 'b', 'l', 'br'].forEach(k => root.style.setProperty('--rn-' + k, Math.round(r[k]) + 'px'));
    let named;
    if (isHome(location.pathname) && d?.d === 'back' && cardOf(d.s)) {
      const card = cardOf(d.s);
      // Sin #proyectos en la URL el navegador no vuelve a mover el scroll tras la transición: aterriza donde está la tarjeta
      if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
      named = card.querySelector('.bc-img');
      set(rectOf(card));
      vt.types.add('rn-back');
    } else if (!isHome(location.pathname) && d?.d === 'open' && slugOf(location.pathname) === d.s) {
      named = heroOf();
      set(d);
      vt.types.add('rn-open');
    } else {
      if (d?.d === 'nav' && d.br != null) set(d);
      vt.types.add('rn-nav');
    }
    if (named) named.style.viewTransitionName = NAME;
    vt.finished.catch(() => {}).then(() => {
      if (named) named.style.viewTransitionName = '';
      ['t', 'r', 'b', 'l', 'br'].forEach(k => root.style.removeProperty('--rn-' + k));
    });
  });
})();
