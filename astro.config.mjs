import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const site = 'https://rodrigonegrete.es';
// Subpaginas estaticas servidas desde public/ (Astro no las conoce): se anaden a mano.
const staticPages = ['zodi', 'dedicalo-play', 'pdf-rodd', 'rodd-es', 'aem', 'kettelbro', 'capsule-corp', 'portfolio-2026', 'aquae', 'ccse', 'cv', 'dedicalo', 'invitoo', 'paratumundo', 'te-atiendo', 'tomapoly', 'travel-of-vapers', 'just-enjoy', 'iberdata', 'zodi-bto'];

// Primer pintado y LCP (Lighthouse movil): el HTML trae el CSS critico (tokens + intro + fuentes, Layout.astro) y, aqui, las hojas de la
// portada incrustadas tambien en <style>. Asi no hay ningun <link rel=stylesheet> que bloquee el primer frame (Chrome movil lo retenia ~2 s
// segun una carrera) y el contenido se revela en cuanto la intro ha pintado, sin esperar un viaje de red extra por el CSS.
// Los chunks de JS importados dinamicamente no vuelven a pedir las hojas ya incrustadas (se quitan de su lista de dependencias de Vite)
// y se precargan (modulepreload) porque el script de entrada los importa tras ese primer pintado.
const inlineCss = () => ({
  name: 'inline-css',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const file = root + 'index.html';
      let html = readFileSync(file, 'utf8');
      const re = /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)">/g;
      const inlined = [];
      html = html.replace(re, (m, href) => {
        inlined.push(href.slice(1)); // _astro/xxx.css
        return `<style data-src="${href}">${readFileSync(root + href.slice(1), 'utf8')}</style>`;
      });
      if (!inlined.length) return;
      const entry = html.match(/<script type="module" src="(\/_astro\/Layout[^"]+\.js)">/);
      let extra = '';
      if (entry) {
        const deps = new Set([entry[1].slice(1)]);
        const entryJs = readFileSync(root + entry[1].slice(1), 'utf8');
        for (const m of entryJs.matchAll(/"(_astro\/[^"]+\.js)"/g)) deps.add(m[1]);
        for (const m of entryJs.matchAll(/import\(`\.\/([^`]+\.js)`\)/g)) deps.add('_astro/' + m[1]);
        // chunks (entrada y dependencias): el CSS ya incrustado se sustituye por un modulo ya presente, para que Vite no lo vuelva a pedir
        const sink = [...deps].find((d) => /preload-helper/.test(d)) || [...deps][0];
        for (const d of [...deps]) {
          const p = root + d;
          let js = readFileSync(p, 'utf8');
          let changed = false;
          for (const css of inlined) if (js.includes(`"${css}"`)) { js = js.split(`"${css}"`).join(`"${sink}"`); changed = true; }
          if (changed) writeFileSync(p, js);
        }
        for (const d of deps) if (d !== entry[1].slice(1)) extra += `<link rel="modulepreload" href="/${d}">`;
      }
      writeFileSync(file, html.replace('</head>', extra + '</head>'));
    },
  },
});

export default defineConfig({
  site,
  integrations: [react(), sitemap({ customPages: staticPages.map((p) => `${site}/${p}/`) }), inlineCss()],
});
