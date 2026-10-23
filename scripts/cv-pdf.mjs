// Genera los PDF ATS (ES/EN) desde public/cv/ats-*.html con Playwright y fija los metadatos con pypdf.
// Uso: PW_DIR=<carpeta con playwright instalado> node scripts/cv-pdf.mjs
// (Playwright no es dependencia del repo; instálalo en una carpeta aparte.)
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { cv } from './cv-data.mjs';

const { chromium } = createRequire((process.env.PW_DIR || '.') + '/')('playwright');
const dir = fileURLToPath(new URL('../public/cv/', import.meta.url));
const browser = await chromium.launch();
for (const l of ['es', 'en']) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(`${dir}ats-${l}.html`).href);
  await page.pdf({ path: `${dir}${cv[l].file}`, format: 'A4', printBackground: false, preferCSSPageSize: true, tagged: true });
  await page.close();
  execFileSync('python', [fileURLToPath(new URL('./cv-pdf-meta.py', import.meta.url)), `${dir}${cv[l].file}`, l]);
  console.log('PDF', cv[l].file);
}
await browser.close();
