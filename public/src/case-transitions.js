/* Transiciones entre páginas (MPA View Transitions): morph de la imagen de la tarjeta <-> hero del caso + cortinilla + entrada escalonada.
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
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > innerHeight * .1 && r.top < innerHeight * .95; };
  const BAD = /logo|brand|avatar|icon|mark|sprite/i, BADSRC = /logo|avatar|icon|sprite/i;
  // Hero del caso: [data-vt-hero] si el caso lo declara; si no, la imagen/vídeo con más superficie visible en la primera pantalla (que no sea un logo).
  // Solo vale si se ve al menos la mitad: en móvil casi siempre queda bajo el texto y entonces se usa el recuadro de cabecera (proxy)
  const shown = el => { const r = el.getBoundingClientRect(); return r.width >= 160 && r.height >= 100 && (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) >= r.height * .5; };
  const heroOf = () => {
    const mark = document.querySelector('[data-vt-hero]');
    if (mark) return shown(mark) ? mark : undefined;
    let best, area = 0;
    for (const el of document.querySelectorAll('img,video')) {
      if (!shown(el)) continue;
      if (BAD.test(el.className) || /^logo/i.test(el.getAttribute('alt') || '') || BADSRC.test((el.currentSrc || el.src || '').split('/').pop()) || el.closest('nav,footer')) continue;
      const r = el.getBoundingClientRect(), a = (Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      if (a > area && getComputedStyle(el).visibility !== 'hidden') { area = a; best = el; }
    }
    return best;
  };
  const drop = el => { if (!el) return; el.style.viewTransitionName = ''; if (el.dataset.rnp != null) el.remove(); };
  // Destino/origen garantizado para el morph cuando el caso no tiene un hero visible: un recuadro transparente en la cabecera.
  // La imagen de la tarjeta crece hasta ahí y se disuelve sobre el título (o al revés al volver); nunca queda un fundido a secas.
  const proxy = () => {
    const p = document.createElement('div');
    p.setAttribute('aria-hidden', 'true');
    p.dataset.rnp = '';
    p.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:min(46vh,420px);pointer-events:none';
    document.body.append(p);
    return p;
  };
  // En móvil la sección de proyectos es una baraja horizontal que se activa después del primer pintado: no hay rectángulo estable al que cerrar
  const deckLikely = () => { try { return matchMedia('(pointer:coarse), (max-width:900px)').matches && (localStorage.getItem('rn-deck') || (innerWidth <= 640 ? '1' : '0')) === '1'; } catch { return false; } };
  // Volver a la portada desde un caso (atrás, enlace o historial): sin preloader, que si no se vería dentro de la transición
  if (isHome(location.pathname)) try {
    if ((sessionStorage.getItem(KEY) || '').includes('"back"') || performance.getEntriesByType('navigation')[0]?.type === 'back_forward'
      || (document.referrer && new URL(document.referrer).origin === location.origin)) root.classList.add('rn-skip-intro');
  } catch {}
  let click = 0, clickEl = null;
  addEventListener('click', e => {
    clickEl = e.target.closest?.('a[href]'); click = performance.now();
    // Feedback inmediato mientras llega la página (red/render del destino): barra fina arriba + tarjeta pulsada. pageswap la apaga para que no quede congelada en la instantánea
    const a = clickEl;
    if (a && !reduce.matches && !e.defaultPrevented && e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) && !a.target && a.origin === location.origin && a.pathname !== location.pathname) {
      root.classList.add('rn-wait');
      a.classList.add('rn-going');
      setTimeout(() => { root.classList.remove('rn-wait'); a.classList.remove('rn-going'); }, 6000);
    }
  }, true);

  // Speculation Rules: la página destino se prerrenderiza al pasar el ratón por la tarjeta (200 ms) o al pulsar. Solo escritorio con ratón y sin ahorro de datos.
  // Se añaden tras la carga y en reposo: no cuentan en el TBT y la portada no paga nada hasta que el usuario muestra intención.
  if (HTMLScriptElement.supports?.('speculationrules') && matchMedia('(hover:hover) and (pointer:fine)').matches && !navigator.connection?.saveData) {
    const rules = () => {
      const s = document.createElement('script');
      s.type = 'speculationrules';
      s.textContent = JSON.stringify(isHome(location.pathname)
        ? { prerender: [{ where: { selector_matches: 'a.bc[href^="/"]:not([target])' }, eagerness: 'moderate' }] }
        : { prefetch: [{ where: { selector_matches: 'a[href="/"],a[href="/#proyectos"]' }, eagerness: 'moderate' }] });
      document.head.append(s);
    };
    addEventListener('load', () => (window.requestIdleCallback || setTimeout)(rules, { timeout: 4000 }));
  }

  addEventListener('pageswap', e => {
    const vt = e.viewTransition, to = e.activation?.entry?.url;
    if (!vt || !to) return;
    const dest = new URL(to);
    if (dest.origin !== location.origin) return;
    root.classList.remove('rn-wait');
    root.classList.add('rn-leaving'); // la portada usa esta clase para apagar el flash de cámara: si no, queda congelado en la instantánea
    if (reduce.matches) return;
    const fresh = clickEl && performance.now() - click < 2000;
    let d = { d: 'nav' }, named;
    if (isHome(location.pathname) && !isHome(dest.pathname)) {
      const s = slugOf(dest.pathname), card = cardOf(s);
      if (card && inView(card)) { d = { d: 'open', s, ...rectOf(card) }; named = card.querySelector('.bc-img'); }
    } else if (!isHome(location.pathname) && isHome(dest.pathname)) {
      d = { d: 'back', s: slugOf(location.pathname) };
      named = heroOf() || proxy();
    }
    if (d.d === 'nav' && fresh) d = { d: 'nav', ...rectOf(clickEl) };
    if (named) named.style.viewTransitionName = NAME;
    try { sessionStorage.setItem(KEY, JSON.stringify({ ...d, ts: Date.now() })); } catch {}
    vt.finished.catch(() => {}).then(() => drop(named));
  });

  addEventListener('pageshow', () => { root.classList.remove('rn-leaving', 'rn-wait'); document.querySelector('.rn-going')?.classList.remove('rn-going'); }); // restauración desde bfcache

  // Entrada escalonada: el bloque de texto del hero (eyebrow, título, bajada, botones…) sube en cascada mientras la imagen se acomoda.
  // Empieza cuando la transición ya es visible (ready); fill:'backwards' => al acabar queda el estilo propio de la página, nunca oculto.
  const enter = named => {
    const h = document.querySelector('h1'), g = h?.parentElement;
    if (!g || g === document.body || g.children.length > 9) return;
    [...g.children].filter(c => c !== named && !c.contains(named) && !named?.contains(c)).slice(0, 7).forEach((c, i) =>
      c.animate({ opacity: [0, 1], transform: ['translateY(18px)', 'none'] }, { duration: 640, delay: 90 + i * 55, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  };

  addEventListener('pagereveal', e => {
    const vt = e.viewTransition;
    if (!vt) return;
    let d = null;
    try { d = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch {}
    if (d && Date.now() - d.ts > 15000) d = null; // dato viejo: otra navegación sin esta lógica
    if (reduce.matches) return;
    const set = r => ['t', 'r', 'b', 'l', 'br'].forEach(k => root.style.setProperty('--rn-' + k, Math.round(r[k]) + 'px'));
    let named, staged = false;
    if (isHome(location.pathname) && d?.d === 'back') {
      const card = cardOf(d.s);
      // Sin #proyectos en la URL el navegador no vuelve a mover el scroll tras la transición: aterriza donde está la tarjeta
      if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
      if (deckLikely()) { // baraja móvil: la sección se coloca arriba y touch.js lleva la baraja a la tarjeta cuando se activa
        window.__rnBack = d.s;
        document.getElementById('proyectos')?.scrollIntoView({ block: 'start', behavior: 'instant' });
        vt.types.add('rn-back');
      } else if (card && card.getClientRects().length) {
        card.scrollIntoView({ block: 'center', behavior: 'instant' });
        named = card.querySelector('.bc-img');
        set(rectOf(card));
        vt.types.add('rn-back');
      } else vt.types.add('rn-nav');
    } else if (!isHome(location.pathname) && d?.d === 'open' && slugOf(location.pathname) === d.s) {
      named = heroOf() || proxy();
      set(d);
      staged = true;
      vt.types.add('rn-open');
    } else {
      if (d?.d === 'nav' && d.br != null) set(d);
      staged = !isHome(location.pathname);
      vt.types.add('rn-nav');
    }
    if (named) named.style.viewTransitionName = NAME;
    // Fondo de la página de destino detrás de la cortinilla: sin destello blanco/negro al hundirse la página vieja
    for (const el of [document.body, root]) { const c = el && getComputedStyle(el).backgroundColor; if (c && !/^rgba\(0, 0, 0, 0\)|transparent/.test(c)) { root.style.setProperty('--rn-bg', c); break; } }
    if (staged) vt.ready.then(() => enter(named)).catch(() => {});
    vt.finished.catch(() => {}).then(() => {
      drop(named);
      ['t', 'r', 'b', 'l', 'br', 'bg'].forEach(k => root.style.removeProperty('--rn-' + k));
    });
  });
})();
