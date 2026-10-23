// Genera public/cv/index.html (versión visual) y public/cv/ats-es.html / ats-en.html
// (páginas planas, una columna, de las que sale el PDF descargable). Datos en scripts/cv-data.mjs.
import { writeFile, mkdir } from 'node:fs/promises';
import { cv } from './cv-data.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ORIGIN = 'https://rodrigonegrete.es';
const outDir = new URL('../public/cv/', import.meta.url);

/* ───────────── ATS: una columna, Arial, sin tablas ni columnas ───────────── */
function ats(d) {
  const contact = `${d.location} | ${d.phone} | ${d.email}`;
  const links = `${d.site} | ${d.linkedin} | ${d.github}`;
  const exp = d.experience.map((e) => `
    <div class="job">
      <h3>${esc(e.role)}</h3>
      <p class="meta">${esc(e.org)} | ${esc(e.place)} | ${esc(e.dates)}</p>
      <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>`).join('');
  const prj = d.projects.filter((p) => !p.visualOnly).map((p) => `
    <div class="job">
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.text)} <span class="u">${esc(p.url)}</span></p>
    </div>`).join('');
  const skl = d.skills.map((s) => `<p><strong>${esc(s.cat)}:</strong> ${esc(s.items.join(', '))}.</p>`).join('');
  const edu = d.education.map((e) => `<p><strong>${esc(e.title)}</strong> | ${esc(e.school)} | ${esc(e.dates)}</p>`).join('');
  const lng = `<p>${d.languages.map((l) => `${esc(l.l)}: ${esc(l.level)}`).join(' | ')}</p>`;
  return `<!doctype html>
<html lang="${d.lang}">
<head>
<meta charset="utf-8">
<title>${esc(d.name)} - ${esc(d.headline.split('|')[1].trim())} - CV ${d.lang.toUpperCase()}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${ORIGIN}/cv/">
<style>
  @page { size: A4; margin: 15mm 17mm; }
  * { box-sizing: border-box; }
  body { margin: 0 auto; max-width: 180mm; padding: 8mm 0; color: #000; background: #fff; font: 10.5pt/1.3 Arial, Helvetica, sans-serif; font-variant-ligatures: none; }
  h1 { margin: 0; font-size: 19pt; line-height: 1.15; }
  .headline { margin: 2pt 0 0; font-size: 12pt; font-weight: bold; }
  p { margin: 0 0 2.5pt; }
  .contact { margin-top: 5pt; }
  h2 { margin: 9pt 0 3pt; padding-bottom: 1.5pt; border-bottom: 0.75pt solid #000; font-size: 11pt; text-transform: uppercase; break-after: avoid; }
  h3 { margin: 5pt 0 0; font-size: 10.5pt; break-after: avoid; }
  .meta { margin: 0 0 2pt; font-style: italic; }
  ul { margin: 0 0 3pt; padding-left: 14pt; }
  li { margin: 0 0 1pt; }
  .u { white-space: nowrap; }
  .meta { break-after: avoid; }
  li, .job p { break-inside: avoid; }
  a { color: #000; text-decoration: none; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<main>
<h1>${esc(d.name)}</h1>
<p class="headline">${esc(d.headline)}</p>
<p class="contact">${esc(contact)}</p>
<p>${esc(links)}</p>
<p>${esc(d.availability)}</p>

<h2>${esc(d.h.summary)}</h2>
<p>${esc(d.summary)}</p>
<p>${esc(d.targetRoles)}</p>

<h2>${esc(d.h.skills)}</h2>
${skl}

<h2>${esc(d.h.experience)}</h2>
${exp}

<h2>${esc(d.h.projects)}</h2>
${prj}

<h2>${esc(d.h.education)}</h2>
${edu}

<h2>${esc(d.h.languages)}</h2>
${lng}
</main>
</body>
</html>
`;
}

/* ───────────── Visual: /cv/ (ES) ───────────── */
function visual(d, en) {
  const chips = (s) => s.items.map((i) => `<li>${esc(i)}</li>`).join('');
  const exp = d.experience.map((e) => `
        <article class="job rv${e.current ? ' now' : ''}">
          <span class="dot" aria-hidden="true"></span>
          <p class="dates">${esc(e.dates)}</p>
          <h3>${esc(e.role)}</h3>
          <p class="org">${esc(e.org)} · ${esc(e.place)}</p>
          <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
        </article>`).join('');
  const prj = d.projects.map((p) => `
          <article class="card rv">
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.text)}</p>
            <a class="plink" href="https://${esc(p.url)}">${esc(p.url)}</a>
          </article>`).join('');
  const skl = d.skills.map((s) => `
          <div class="skill rv"><h3>${esc(s.cat)}</h3><ul class="chips">${chips(s)}</ul></div>`).join('');
  const edu = d.education.map((e) => `
          <li class="rv"><strong>${esc(e.title)}</strong><span>${esc(e.school)}</span><span class="dates">${esc(e.dates)}${e.cert ? ` · <a href="${e.cert}" target="_blank" rel="noopener">${esc(d.ui.certLabel)}</a>` : ''}</span></li>`).join('');
  const lng = d.languages.map((l) => `<li><strong>${esc(l.l)}</strong> ${esc(l.level)}</li>`).join('');
  const stats = d.stats.map((s) => `<li><b>${esc(s.n)}</b><span>${esc(s.l)}</span></li>`).join('');
  const title = 'CV Rodrigo Negrete | AI Product Designer y UX/UI';
  const desc = 'CV de Rodrigo Negrete Aros: AI Product Designer y UX/UI Designer en Barcelona. Figma, design systems, IA generativa, agentes y automatización (n8n, Make). Máster EBIS en Agentes de IA. Descarga el PDF en español o inglés.';
  const ld = {
    '@context': 'https://schema.org', '@type': 'Person', name: d.name, url: ORIGIN, jobTitle: 'AI Product Designer · UX/UI Designer',
    address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
    sameAs: [`https://${d.linkedin}`, `https://${d.github}`],
    alumniOf: [{ '@type': 'EducationalOrganization', name: 'EBIS Business Techschool' }, { '@type': 'EducationalOrganization', name: 'Neoland' }],
  };
  return `<!doctype html>
<html lang="${d.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${ORIGIN}/cv/">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ORIGIN}/assets/seo/rodrigo-negrete-og.jpg">
<meta property="og:url" content="${ORIGIN}/cv/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ORIGIN}/assets/seo/rodrigo-negrete-og.jpg">
<meta name="theme-color" content="#0a0a0a">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230a0a0a'/%3E%3Ctext x='32' y='43' font-family='Arial,sans-serif' font-size='30' font-weight='800' text-anchor='middle' fill='%23fff'%3ERN%3C/text%3E%3Ccircle cx='51' cy='13' r='5' fill='%23ff2d2d'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
:root{--bg:#0a0a0a;--s1:#111114;--s2:#17171c;--line:rgba(255,255,255,.12);--t1:#f5f5f7;--t2:#b4b4bd;--a:#00f0ff;--ink:#04141a;--fh:'Outfit',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;--fm:'Space Mono',ui-monospace,Consolas,monospace;--fb:system-ui,-apple-system,'Segoe UI',Arial,sans-serif}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--t1);font:400 16px/1.6 var(--fb);-webkit-font-smoothing:antialiased}
a{color:var(--a);text-underline-offset:3px}
a:hover{text-decoration-thickness:2px}
:focus-visible{outline:3px solid var(--a);outline-offset:3px;border-radius:4px}
.skip{position:absolute;left:12px;top:-60px;background:var(--a);color:var(--ink);padding:10px 16px;border-radius:8px;font-weight:700;z-index:50}
.skip:focus{top:12px}
.wrap{width:min(1120px,100% - 40px);margin-inline:auto}
.top{position:sticky;top:0;z-index:20;background:rgba(10,10,10,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:60px;flex-wrap:wrap;padding-block:8px}
.back{color:var(--t1);text-decoration:none;font:700 14px var(--fm)}
.back:hover{color:var(--a)}
.actions{display:flex;gap:10px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:10px 18px;border-radius:999px;border:1.5px solid var(--line);color:var(--t1);background:transparent;font:700 14px var(--fh);text-decoration:none;transition:transform .2s,box-shadow .2s,background .2s,border-color .2s}
.btn:hover{transform:translateY(-2px);border-color:var(--a)}
.btn.p{background:var(--a);border-color:var(--a);color:var(--ink)}
.btn.p:hover{box-shadow:0 8px 28px rgba(0,240,255,.35)}
.btn svg{width:16px;height:16px;flex:none}
.hero{position:relative;padding:72px 0 40px;overflow:hidden}
.hero:before{content:"";position:absolute;inset:-20% -10% auto auto;width:70vw;height:70vw;max-width:760px;max-height:760px;background:radial-gradient(circle,rgba(0,240,255,.16),transparent 62%);pointer-events:none}
.pill{display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border:1px solid rgba(0,240,255,.4);border-radius:999px;font:700 12.5px var(--fm);color:var(--a)}
.pill i{width:8px;height:8px;border-radius:50%;background:var(--a);animation:pulse 2s infinite}
h1{margin:20px 0 6px;font:800 clamp(2.4rem,7vw,5rem)/1 var(--fh);letter-spacing:-.02em}
.role{margin:0;font:600 clamp(1.15rem,2.6vw,1.65rem)/1.3 var(--fh);color:var(--a)}
.tag{margin:8px 0 0;color:var(--t2);font:400 14px var(--fm)}
.meta{display:flex;flex-wrap:wrap;gap:8px 22px;margin:22px 0 0;padding:0;list-style:none;color:var(--t2);font-size:15px}
.meta a{color:var(--t1)}
.targets{max-width:62ch;margin:18px 0 0;color:var(--t2)}
.hero .actions{margin-top:28px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:44px 0 0;padding:0;list-style:none}
.stats li{padding:18px;background:var(--s1);border:1px solid var(--line);border-radius:16px;transition:transform .25s,border-color .25s}
.stats li:hover{transform:translateY(-4px);border-color:rgba(0,240,255,.5)}
.stats b{display:block;font:800 2.4rem/1 var(--fh);color:var(--a)}
.stats span{display:block;margin-top:8px;color:var(--t2);font-size:14px;line-height:1.4}
.grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:48px;padding-block:32px 72px;align-items:start}
section{margin-top:44px}
section:first-child{margin-top:0}
h2{margin:0 0 22px;font:700 13px var(--fm);letter-spacing:.14em;text-transform:uppercase;color:var(--a);display:flex;align-items:center;gap:14px}
h2:after{content:"";flex:1;height:1px;background:var(--line)}
h3{margin:0;font:700 1.12rem/1.35 var(--fh)}
.summary{font-size:1.08rem;color:var(--t1);margin:0}
.timeline{position:relative;padding-left:26px;border-left:1px solid var(--line)}
.job{position:relative;padding:0 0 34px}
.job:last-child{padding-bottom:0}
.dot{position:absolute;left:-32px;top:6px;width:11px;height:11px;border-radius:50%;background:var(--bg);border:2px solid var(--t2)}
.now .dot{border-color:var(--a);background:var(--a);animation:pulse 2s infinite}
.dates{margin:0 0 4px;font:400 13px var(--fm);color:var(--t2)}
.org{margin:2px 0 10px;color:var(--t2)}
.job ul{margin:0;padding-left:18px}
.job li{margin-bottom:6px}
.job li::marker{color:var(--a)}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.card{display:flex;flex-direction:column;gap:8px;padding:18px;background:var(--s1);border:1px solid var(--line);border-radius:16px;transition:transform .25s,border-color .25s,background .25s}
.card:hover{transform:translateY(-4px);border-color:rgba(0,240,255,.5);background:var(--s2)}
.card h3{font-size:1rem}
.card p{margin:0;color:var(--t2);font-size:14.5px;line-height:1.5}
.plink{margin-top:auto;font:400 12.5px var(--fm);word-break:break-all}
.side{position:sticky;top:84px;align-self:start}
.skill{margin-bottom:22px}
.skill h3{font-size:.95rem;margin-bottom:10px}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;list-style:none}
.chips li{padding:4px 11px;border:1px solid var(--line);border-radius:999px;background:var(--s1);color:var(--t1);font-size:13px;line-height:1.5;transition:border-color .2s,color .2s}
.chips li:hover{border-color:var(--a);color:var(--a)}
.edu,.lang{margin:0;padding:0;list-style:none}
.edu li{display:flex;flex-direction:column;gap:2px;padding:12px 0;border-bottom:1px solid var(--line)}
.edu li:last-child{border:0}
.edu span{color:var(--t2);font-size:14px}
.edu .dates{margin:0;font-size:12.5px}
.lang li{padding:8px 0;border-bottom:1px solid var(--line);color:var(--t2)}
.lang li:last-child{border:0}
.lang strong{color:var(--t1);margin-right:8px}
.dl{padding:22px;background:linear-gradient(160deg,var(--s2),var(--s1));border:1px solid rgba(0,240,255,.35);border-radius:18px}
.dl p{margin:0 0 14px;color:var(--t2);font-size:14.5px}
.dl .btn{width:100%;justify-content:center;margin-bottom:10px}
.dl small{display:block;margin-top:6px;color:var(--t2);font-size:13px}
footer{border-top:1px solid var(--line);padding:28px 0 40px;color:var(--t2);font-size:14px}
footer .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,240,255,.55)}70%{box-shadow:0 0 0 9px rgba(0,240,255,0)}100%{box-shadow:0 0 0 0 rgba(0,240,255,0)}}
.js .rv{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s cubic-bezier(.22,1,.36,1)}
.js .rv.in{opacity:1;transform:none}
@media(max-width:900px){.grid{grid-template-columns:1fr;gap:0}.side{position:static;margin-top:44px}.stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.hero{padding-top:44px}.cards{grid-template-columns:1fr}.actions .btn{flex:1 1 100%;justify-content:center}.top .actions{display:none}.timeline{padding-left:20px}.dot{left:-26px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}.js .rv{opacity:1;transform:none}}
@media print{
  @page{size:A4;margin:14mm}
  :root{--bg:#fff;--s1:#fff;--s2:#fff;--line:#bbb;--t1:#000;--t2:#333;--a:#000}
  body{font-size:10.5pt}
  .top,.hero .actions,.dl,.skip,.hero:before{display:none!important}
  .hero{padding:0 0 10pt}
  .js .rv{opacity:1!important;transform:none!important}
  .grid{display:block;padding:0}.side{position:static}
  .job,.card{break-inside:avoid}
  a{color:#000}
  .stats li,.card,.chips li{border-color:#999}
}
</style>
</head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>
<header class="top">
  <div class="wrap">
    <a class="back" href="/">&larr; rodrigonegrete.es</a>
    <div class="actions">
      <a class="btn p" href="/cv/${cv.es.file}" download><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14"/></svg>CV en PDF · ES</a>
      <a class="btn" href="/cv/${cv.en.file}" download>CV PDF · EN</a>
    </div>
  </div>
</header>
<main id="main">
  <div class="wrap">
    <div class="hero">
      <span class="pill"><i aria-hidden="true"></i>Disponible · incorporación inmediata</span>
      <h1>${esc(d.name)}</h1>
      <p class="role">${esc(d.headline)}</p>
      <p class="tag">${esc(d.tagline)}</p>
      <ul class="meta">
        <li>${esc(d.location)}</li>
        <li><a href="mailto:${d.email}">${esc(d.email)}</a></li>
        <li><a href="tel:+34653567610">${esc(d.phone)}</a></li>
        <li><a href="https://${d.linkedin}" target="_blank" rel="noopener">${esc(d.linkedin)}</a></li>
        <li><a href="https://${d.github}" target="_blank" rel="noopener">${esc(d.github)}</a></li>
      </ul>
      <p class="targets">${esc(d.targetRoles)} ${esc(d.availability)}.</p>
      <div class="actions">
        <a class="btn p" href="/cv/${cv.es.file}" download><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14"/></svg>Descargar CV (PDF, español)</a>
        <a class="btn" href="/cv/${cv.en.file}" download>Download CV (PDF, English)</a>
        <a class="btn" href="/">Ver portfolio</a>
      </div>
      <ul class="stats">${stats}</ul>
    </div>

    <div class="grid">
      <div class="col">
        <section aria-labelledby="h-summary">
          <h2 id="h-summary">${esc(d.h.summary)}</h2>
          <p class="summary">${esc(d.summary)}</p>
        </section>
        <section aria-labelledby="h-exp">
          <h2 id="h-exp">${esc(d.h.experience)}</h2>
          <div class="timeline">${exp}
          </div>
        </section>
        <section aria-labelledby="h-prj">
          <h2 id="h-prj">${esc(d.h.projects)}</h2>
          <div class="cards">${prj}
          </div>
        </section>
      </div>
      <aside class="side" aria-label="Habilidades, educación e idiomas">
        <section aria-labelledby="h-skl">
          <h2 id="h-skl">${esc(d.h.skills)}</h2>${skl}
        </section>
        <section aria-labelledby="h-edu">
          <h2 id="h-edu">${esc(d.h.education)}</h2>
          <ul class="edu">${edu}
          </ul>
        </section>
        <section aria-labelledby="h-lng">
          <h2 id="h-lng">${esc(d.h.languages)}</h2>
          <ul class="lang">${lng}</ul>
        </section>
        <section class="dl" aria-labelledby="h-dl">
          <h2 id="h-dl">Descargas</h2>
          <p>PDF de una columna, texto seleccionable y fuente estándar, pensado para sistemas de selección (ATS) y para leer rápido.</p>
          <a class="btn p" href="/cv/${cv.es.file}" download>PDF · Español</a>
          <a class="btn" href="/cv/${cv.en.file}" download>PDF · English</a>
          <small>Versión en texto plano: <a href="/cv/ats-es.html">ES</a> · <a href="/cv/ats-en.html">EN</a></small>
        </section>
      </aside>
    </div>
  </div>
</main>
<footer>
  <div class="wrap"><span>${esc(d.name)} · ${esc(d.location)}</span><a href="/">rodrigonegrete.es</a></div>
</footer>
<script>
(function(){
  try{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    document.documentElement.classList.add('js');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  }catch(e){document.documentElement.classList.remove('js')}
})();
</script>
</body>
</html>
`;
}

await mkdir(outDir, { recursive: true });
await writeFile(new URL('ats-es.html', outDir), ats(cv.es));
await writeFile(new URL('ats-en.html', outDir), ats(cv.en));
await writeFile(new URL('index.html', outDir), visual(cv.es));
console.log('CV HTML generado: index.html, ats-es.html, ats-en.html');
