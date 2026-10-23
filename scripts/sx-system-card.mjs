// System card del footer: al terminar el build mide la portada real y escribe las cifras en dist/index.html.
// Peso ≈ suma de lo que pide la portada al cargar: HTML (con el CSS incrustado) + JS de entrada y modulepreload + fuentes del tema por defecto
// + imágenes sin loading="lazy". Texto en gzip (aprox. de la transferencia; Vercel sirve brotli, algo menor); imágenes y fuentes tal cual.
// shortcut: no ejecuta la página, así que no cuenta lo que el JS pide después (islas, imágenes diferidas); si hace falta exactitud, medir con un navegador.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const countHtml = (d) => readdirSync(d, { withFileTypes: true }).reduce((n, e) =>
  n + (e.isDirectory() ? countHtml(join(d, e.name)) : /\.html$/.test(e.name) && e.name !== '404.html' ? 1 : 0), 0);

export function measure(root, html) {
  const local = new Set();
  for (const m of html.matchAll(/<script[^>]*\ssrc="(\/[^"]+)"/g)) local.add(m[1]);
  for (const m of html.matchAll(/<link[^>]*rel="(?:modulepreload|preload|stylesheet)"[^>]*href="(\/[^"]+)"/g)) local.add(m[1]);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (/loading="lazy"/.test(m[0])) continue;
    const src = m[0].match(/\ssrc="(\/[^"]+)"/);
    if (src) local.add(src[1]);
  }
  // fuentes: las familias normales del tema por defecto (las demás solo se piden al cambiar de tema)
  const theme = (html.match(/<html[^>]*data-theme="([^"]+)"/) || [])[1];
  const block = theme && (html.match(new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`)) || [])[1];
  const fams = new Set([...(block || '').matchAll(/--f[dbm]:\s*'([^']+)'/g)].map((m) => m[1]));
  for (const m of html.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const fam = (m[1].match(/font-family:\s*'([^']+)'/) || [])[1];
    const url = (m[1].match(/url\((\/[^)]+)\)/) || [])[1];
    if (fams.has(fam) && /font-style:\s*normal/.test(m[1]) && url) local.add(url);
  }
  let bytes = gzipSync(html).length;
  for (const u of local) {
    const p = join(root, decodeURIComponent(u.split(/[?#]/)[0]));
    if (!existsSync(p)) continue;
    const buf = readFileSync(p);
    bytes += /\.(js|css|svg|json)$/.test(p) ? gzipSync(buf).length : buf.length;
  }
  return { kb: Math.round(bytes / 1024), files: local.size + 1 };
}

export default () => ({
  name: 'sx-system-card',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const file = join(root, 'index.html');
      let html = readFileSync(file, 'utf8');
      if (!html.includes('data-sys="kb"')) return;
      const { kb, files } = measure(root, html);
      const pages = countHtml(root);
      html = html.replace('<b data-sys="kb">—</b>', `<b data-sys="kb">${kb}</b>`).replace('<b data-sys="pages">—</b>', `<b data-sys="pages">${pages}</b>`);
      writeFileSync(file, html);
      logger.info(`system card: portada ≈ ${kb} KB (${files} recursos iniciales), ${pages} páginas HTML`);
    },
  },
});
