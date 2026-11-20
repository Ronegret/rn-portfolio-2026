"""Auditoría de botones/enlaces del portfolio: elementos tapados, errores JS, recursos rotos y enlaces internos rotos.
Uso: python3 audit_rn.py BASE [chromium|webkit] [mobile|desktop] [paginas...]"""
import asyncio, sys, json, urllib.request, urllib.parse
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
ENGINE = sys.argv[2] if len(sys.argv) > 2 else 'chromium'
FORM = sys.argv[3] if len(sys.argv) > 3 else 'mobile'
PAGES = sys.argv[4:] or ['/', '/aem/', '/aquae/', '/capsule-corp/', '/casa-trio/', '/ccse/', '/cv/', '/dedicalo/', '/dedicalo-play/',
    '/iberdata/', '/invitoo/', '/just-enjoy/', '/kettelbro/', '/paratumundo/', '/pdf-rodd/', '/portfolio-2026/', '/rodd-es/',
    '/te-atiendo/', '/tomapoly/', '/torre-z/', '/travel-of-vapers/', '/zodi/', '/zodi-bto/']
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

JS_COLLECT = r"""() => {
  const sel = 'a[href],button,[role=button],summary,input:not([type=hidden]),select,textarea,[tabindex="0"]';
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
    for (let n = e; n && n !== document.documentElement; n = n.parentElement) { const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; if (n.hidden) return false; if (n.closest('dialog:not([open])')) return false; if (n.parentElement && n.parentElement.closest('details:not([open])') && !n.matches('summary')) return false; }
    return true; };
  const fixedAnc = e => { for (let n = e; n; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  window.__els = [...document.querySelectorAll(sel)].filter(e => !e.closest('[aria-hidden=true]') && !e.inert && vis(e));
  return window.__els.map((e, i) => ({ i, fixed: fixedAnc(e) }));
}"""
JS_NAME = r"""(i) => { const e = window.__els[i]; const t = (e.getAttribute('aria-label') || e.textContent || e.value || e.getAttribute('href') || '').replace(/\s+/g, ' ').trim().slice(0, 50);
  return `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : ''} «${t}»`; }"""
JS_CHECK = r"""([i, frac]) => { const e = window.__els[i]; if (!e.isConnected) return {skip: 'gone'};
  let r = e.getBoundingClientRect(); if (r.width < 2) return {skip: 'hidden'};
  const fixed = (() => { for (let n = e; n; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true; } return false; })();
  if (!fixed && frac !== null) { try { e.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'instant'}); } catch (_) {} r = e.getBoundingClientRect(); const target = innerHeight * frac; scrollTo({top: r.top + scrollY + r.height / 2 - target, behavior: 'instant'}); r = e.getBoundingClientRect(); }
  const cr = e.getClientRects(); if (cr.length > 1) r = cr[0];
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (cy < 0 || cy > innerHeight || cx < 0 || cx > innerWidth) return {skip: 'offscreen'};
  const h = document.elementFromPoint(cx, cy);
  if (!h) return {skip: 'nohit'};
  if (h === e || e.contains(h) || (h.closest('label') && h.closest('label').contains(e)) || (e.tagName === 'LABEL')) return {ok: 1};
  const d = h.closest('a,button,[role=button],section,nav,header,footer,div') || h;
  return {cov: `${h.tagName.toLowerCase()}${h.id ? '#' + h.id : ''}.${String(h.className).slice(0, 40)} ⟵ ${d.tagName.toLowerCase()}${d.id ? '#' + d.id : ''}.${String(d.className).slice(0, 40)}`, y: Math.round(cy)};
}"""

async def main():
    report = {}
    async with async_playwright() as p:
        br = await (p.webkit.launch() if ENGINE == 'webkit' else p.chromium.launch(executable_path='/usr/bin/google-chrome'))
        opts = dict(viewport={'width': 393, 'height': 852}, device_scale_factor=2, is_mobile=True, has_touch=True, user_agent=UA) if FORM == 'mobile' \
            else dict(viewport={'width': 1440, 'height': 900})
        internal = set()
        for path in PAGES:
            ctx = await br.new_context(**opts)
            pg = await ctx.new_page()
            errs, bad = [], []
            pg.on('pageerror', lambda e, errs=errs: errs.append('JS: ' + str(e)[:200]))
            pg.on('console', lambda m, errs=errs: m.type == 'error' and errs.append('console: ' + m.text[:200]))
            pg.on('response', lambda r, bad=bad: r.status >= 400 and r.url.startswith(BASE) and bad.append(f'{r.status} {r.url[len(BASE):]}'))
            pg.on('requestfailed', lambda r, bad=bad: r.url.startswith(BASE) and 'net::ERR_ABORTED' not in (r.failure or '') and bad.append(f'FAIL {r.url[len(BASE):]} {r.failure}'))
            try:
                await pg.goto(BASE + path, wait_until='load', timeout=60000)
            except Exception as ex:
                report[path] = {'error': str(ex)[:200]}; await ctx.close(); continue
            try:
              await pg.wait_for_timeout(1500)
              await run_page(pg, path, errs, bad, report, internal)
            except Exception as ex:
              report[path] = {'error': 'CRASH/ERROR: ' + str(ex)[:200]}; print(path, 'ERROR', str(ex)[:120], flush=True)
            await ctx.close()
        await br.close()
    await finish(report, internal)

async def run_page(pg, path, errs, bad, report, internal):
            # bajar poco a poco para activar lazy/observers
            h = await pg.evaluate('document.documentElement.scrollHeight')
            for y in range(0, h, 600):
                await pg.evaluate(f"scrollTo({{top:{y},behavior:\"instant\"}})"); await pg.wait_for_timeout(150)
            await pg.evaluate('scrollTo({top:0,behavior:"instant"})'); await pg.wait_for_timeout(500)
            hrefs = await pg.evaluate("[...document.querySelectorAll('a[href]')].map(a=>a.href)")
            for u in hrefs:
                if u.startswith(BASE): internal.add(u.split('#')[0])
            items = await pg.evaluate(JS_COLLECT)
            covered = {}
            for it in items:
                fracs = [None] if it['fixed'] else [0.3, 0.6, 0.86]
                for f in fracs:
                    r = await pg.evaluate(JS_CHECK, [it['i'], f])
                    if 'cov' in r:
                        await pg.wait_for_timeout(250)  # reintento tras animaciones
                        r = await pg.evaluate(JS_CHECK, [it['i'], f])
                    if 'cov' in r:
                        name = await pg.evaluate(JS_NAME, it['i'])
                        covered.setdefault(name, []).append(f"{int((f or 0)*100)}% → {r['cov']}")
            report[path] = {'interactivos': len(items), 'tapados': covered, 'errores': sorted(set(errs)), 'recursos_rotos': sorted(set(bad))}
            print(path, len(items), 'tapados:', len(covered), 'err:', len(set(errs)), 'rotos:', len(set(bad)), flush=True)

async def finish(report, internal):
    broken = []
    for u in sorted(internal):
        try:
            q = urllib.request.Request(u, method='GET'); urllib.request.urlopen(q, timeout=20)
        except Exception as ex:
            broken.append(f'{u[len(BASE):]} → {ex}')
    report['_enlaces_internos_rotos'] = broken
    out = f'auditoria_{ENGINE}_{FORM}.json'
    json.dump(report, open(out, 'w'), ensure_ascii=False, indent=1)
    print('→', out, '| enlaces internos revisados:', len(internal), 'rotos:', len(broken))

asyncio.run(main())
