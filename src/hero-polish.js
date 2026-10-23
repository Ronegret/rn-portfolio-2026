
/* Retrato: las etiquetas de herramientas pasan de 17 a 7 visibles + "+N" que despliega el resto */
const box = document.querySelector('.pcard .cbadges');
const tags = box ? box.querySelectorAll('.cb') : [];
if (tags.length > 7) {
  const L = { es: 'Ver todas las herramientas', ca: 'Veure totes les eines', en: 'Show all tools' };
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'cb-more'; b.textContent = '+' + (tags.length - 7);
  const lab = () => b.setAttribute('aria-label', L[document.documentElement.lang.slice(0, 2)] || L.es);
  lab();
  new MutationObserver(lab).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  b.addEventListener('click', () => { box.classList.add('open'); box.append(b); });
  box.insertBefore(b, tags[7]);
}
