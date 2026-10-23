/* Trayectoria (git log): cada commit se expande con su boton (aria-expanded); el dibujo del grafo es solo CSS (sx-trayectoria.css). */
document.querySelectorAll('#trayectoria .sx-tr-btn').forEach((b) =>
  b.addEventListener('click', () => b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'))));
