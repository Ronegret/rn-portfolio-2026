// Stack: línea "para qué la uso" al señalar una herramienta + paleta ⌘K/Ctrl+K sobre <dialog> nativo.
const sk = document.getElementById('sk');
const dlg = sk && sk.querySelector('#skp');
if (dlg) {
  const q = dlg.querySelector('#skp-q');
  const items = [...dlg.querySelectorAll('.skp-it')];
  const count = dlg.querySelector('#skp-n');
  const empty = dlg.querySelector('.skp-empty');
  const closeBtn = dlg.querySelector('[data-sk-close]');
  const toolEl = sk.querySelector('[data-sk-tool]');
  const hint = sk.querySelector('[data-sk-hint]');
  const txt = sk.querySelector('[data-sk-txt]');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const byId = (id) => items.find((it) => it.dataset.t === id);
  let opener = null;

  // Pulsos solo con la sección en vista (CSS: .sk-live)
  new IntersectionObserver(([e]) => sk.classList.toggle('sk-live', e.isIntersecting)).observe(sk);
  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) sk.querySelector('.sk-mod').textContent = '⌘';

  // "Para qué la uso": se lee del texto (ya traducido por applyLang) de la fila de la paleta
  const show = (n) => {
    const it = n && byId(n.dataset.t);
    if (!it) { toolEl.textContent = '›'; hint.hidden = false; txt.hidden = true; return; }
    toolEl.textContent = '› ' + n.textContent.trim().replace('↗', '').trim();
    txt.textContent = ' — ' + it.querySelector('.skp-use').textContent;
    hint.hidden = true; txt.hidden = false;
  };
  const svg = sk.querySelector('.sk-svg');
  svg.addEventListener('pointerover', (e) => show(e.target.closest('.sk-n')));
  svg.addEventListener('pointerleave', () => { if (!svg.contains(document.activeElement)) show(null); });
  svg.addEventListener('focusin', (e) => show(e.target.closest('.sk-n')));
  svg.addEventListener('focusout', (e) => { if (!(e.relatedTarget && svg.contains(e.relatedTarget))) show(null); });

  const visible = () => items.filter((it) => !it.hidden).sort((a, b) => (a.style.order || 0) - (b.style.order || 0));
  const filter = () => {
    const v = norm(q.value.trim());
    let n = 0;
    for (const it of items) {
      const name = norm(it.querySelector('.skp-nm').textContent);
      const ok = !v || norm(it.textContent).includes(v);
      it.hidden = !ok;
      it.style.order = v && name.includes(v) ? 0 : 1; // coincidencias por nombre primero
      if (ok) n++;
    }
    empty.hidden = n > 0;
    count.textContent = n + ' ' + dlg.querySelector(n === 1 ? '[data-sk-res1]' : '[data-sk-res]').textContent;
  };

  const open = (id) => {
    if (dlg.open) return;
    opener = document.activeElement;
    const it = id && byId(id);
    items.forEach((x) => x.classList.toggle('is-hit', x === it));
    q.value = it ? sk.querySelector(`.sk-chip[data-t="${id}"]`).textContent : '';
    q.placeholder = dlg.querySelector('[data-sk-ph]').textContent;
    filter();
    // Desde un chip táctil no se abre el teclado en pantalla: foco en "cerrar"; en el resto, en la búsqueda
    const coarse = matchMedia('(pointer: coarse)').matches;
    q.autofocus = !(it && coarse); closeBtn.autofocus = !!(it && coarse);
    dlg.showModal();
    if (it) it.scrollIntoView({ block: 'nearest' });
  };

  sk.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sk-open], .sk-chip, .sk-n');
    if (b) open(b.dataset.t);
  });
  svg.addEventListener('keydown', (e) => {
    const n = e.target.closest('.sk-n');
    if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(n.dataset.t); }
  });

  addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'k') return;
    if (!dlg.open && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    e.preventDefault();
    dlg.open ? dlg.close() : open();
  });

  q.addEventListener('input', filter);
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target === q) {
      const a = visible().map((it) => it.querySelector('a')).find(Boolean);
      if (a) { e.preventDefault(); a.click(); }
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = visible().flatMap((it) => [...it.querySelectorAll('a')]);
    if (!links.length) return;
    e.preventDefault();
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') (links[i + 1] || links[0]).focus();
    else if (i <= 0) q.focus();
    else links[i - 1].focus();
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-sk-close]')) dlg.close(); // clic en el fondo o en "esc"
    else if (e.target.closest('a')) dlg.close();
  });
  dlg.addEventListener('close', () => {
    if (opener && opener !== document.body && opener.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
  addEventListener('pageshow', (e) => { if (e.persisted && dlg.open) dlg.close(); });
}
