// Estado compartido de las islas. La fuente de verdad es el DOM (html[data-theme], html[lang]),
// asi main.js (applyLang, efectos por tema) y las islas nunca se desincronizan.
import { useSyncExternalStore } from 'react';
import { AVATARS } from './themes.js';

const watch = (attr) => (cb) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: [attr] });
  return () => mo.disconnect();
};
const subTheme = watch('data-theme');
const subLang = watch('lang');

// El servidor siempre renderiza 'saas'/'es' (HTML estatico); el cliente corrige tras hidratar.
export const useTheme = () => useSyncExternalStore(subTheme, () => document.documentElement.dataset.theme || 'saas', () => 'saas');
export const useLang = () => useSyncExternalStore(subLang, () => document.documentElement.lang || 'es', () => 'es');

export function setTheme(t) {
  (window.__vt || ((f) => f()))(() => document.documentElement.setAttribute('data-theme', t));
  const av = document.getElementById('av');
  if (av && AVATARS[t]) av.src = AVATARS[t];
  try { sessionStorage.setItem('rn-theme', t); } catch (e) { /* modo privado */ }
  window.dispatchEvent(new CustomEvent('rn-theme', { detail: t })); // main.js cierra el menu movil
}
