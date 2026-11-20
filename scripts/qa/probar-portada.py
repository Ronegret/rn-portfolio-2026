"""Prueba funcional de los controles de la portada, tocando como un dedo (incluida la franja baja de la pantalla)."""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1].rstrip('/'); ENGINE = sys.argv[2] if len(sys.argv) > 2 else 'chromium'
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
results = []

async def main():
    async with async_playwright() as p:
        br = await (p.webkit.launch() if ENGINE == 'webkit' else p.chromium.launch(executable_path='/usr/bin/google-chrome'))
        ctx = await br.new_context(viewport={'width': 393, 'height': 852}, device_scale_factor=2, is_mobile=True, has_touch=True, user_agent=UA)
        pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        await pg.goto(BASE + '/', wait_until='load'); await pg.wait_for_timeout(1800)
        h = await pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, h, 500):
            await pg.evaluate(f'scrollTo({{top:{y},behavior:"instant"}})'); await pg.wait_for_timeout(50)

        async def tap(sel, frac=0.82, nth=0, scroll=True):
            loc = pg.locator(sel).nth(nth)
            if scroll:
                await loc.evaluate("(e,f)=>{const r=e.getBoundingClientRect();const fx=(()=>{for(let n=e;n;n=n.parentElement){const p=getComputedStyle(n).position;if(p==='fixed'||p==='sticky')return 1}return 0})();if(!fx)scrollTo({top:r.top+scrollY+r.height/2-innerHeight*f,behavior:'instant'})}", frac)
                await pg.wait_for_timeout(450)
            box = await loc.bounding_box()
            if not box: return 'sin caja (oculto)'
            x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
            hit = await pg.evaluate("([x,y,s,n])=>{const e=document.querySelectorAll(s)[n];const h=document.elementFromPoint(x,y);return !!(h&&(h===e||e.contains(h)))}", [x, y, sel, nth])
            await pg.touchscreen.tap(x, y); await pg.wait_for_timeout(700)
            return 'ok' if hit else 'TAPADO'

        async def ensure_menu():
            if not await pg.evaluate("document.getElementById('mob').classList.contains('open')"):
                bx = await pg.locator('#ham').bounding_box(); await pg.touchscreen.tap(bx['x']+bx['width']/2, bx['y']+bx['height']/2); await pg.wait_for_timeout(900)

        async def check(name, sel, js, frac=0.82, nth=0, scroll=True):
            try:
                if sel.startswith('#mob '): await ensure_menu()
                t = await tap(sel, frac, nth, scroll)
                ok = await pg.evaluate(js)
                results.append((name, 'OK' if ok and t == 'ok' else f'FALLA (toque: {t}, efecto: {ok})'))
            except Exception as ex:
                results.append((name, 'ERROR ' + str(ex)[:120]))

        await check('Menú ☰ abre', '#ham', "document.getElementById('mob').classList.contains('open')", scroll=False)
        await check('Idioma (menú): inglés', '#mob .mlb[data-lang=en]', "document.documentElement.lang==='en'", scroll=False)
        await pg.wait_for_timeout(2000)
        await check('Idioma (menú): español', '#mob .mlb[data-lang=es]', "document.documentElement.lang==='es'", scroll=False)
        await pg.wait_for_timeout(1200)
        await pg.wait_for_timeout(2000)
        await check('Tema (menú): cambiar', '#mob .dk[data-t=diario]', "document.documentElement.dataset.theme==='diario'", scroll=False)
        await pg.wait_for_timeout(900)
        await check('Tema (menú): volver', '#mob .dk[data-t=cyber]', "document.documentElement.dataset.theme==='cyber'", scroll=False)
        await pg.wait_for_timeout(900)
        await ensure_menu()
        await check('Menú ✕ cierra', '#ham', "!document.getElementById('mob').classList.contains('open')", scroll=False)
        await check('Menú → «Proyectos» (enlace)', '#mob .mm-l[href=\"#proyectos\"]', "!document.getElementById('mob').classList.contains('open') && Math.abs(document.getElementById('proyectos').getBoundingClientRect().top)<200", scroll=False)
        await pg.wait_for_timeout(1500)
        results[-1]=(results[-1][0], 'OK' if await pg.evaluate("!document.getElementById('mob').classList.contains('open') && Math.abs(document.getElementById('proyectos').getBoundingClientRect().top)<250") else results[-1][1]+' (tras 1,5 s: '+str(await pg.evaluate("[document.getElementById('mob').className, Math.round(document.getElementById('proyectos').getBoundingClientRect().top)]"))+')')
        await check('Sobre mí «Leer más»', '#sobre-mi .m-more', "document.querySelector('#sobre-mi .m-more').getAttribute('aria-expanded')==='true'")
        await check('Proyectos: vista Lista', '.tj-seg [data-v=list]', "document.querySelector('.tj-seg').dataset.view==='list'", frac=0.5)
        await check('«Ver N más» (abajo de la pantalla)', '#proyectos .m-more', "document.querySelector('#proyectos .m-more').getAttribute('aria-expanded')==='true' && !document.querySelector('#proyectos .bento').classList.contains('m-collapsed')", frac=0.86)
        await check('«Ver menos» vuelve a plegar', '#proyectos .m-more', "document.querySelector('#proyectos .m-more').getAttribute('aria-expanded')==='false'", frac=0.6)
        await check('Tarjeta «Leer más» (descripción)', '#proyectos .bc-d-more', "document.querySelector('#proyectos .bc-d-more').getAttribute('aria-expanded')==='true'", frac=0.8)
        await check('Filtro de proyectos abre', '#qf-btn', "!document.getElementById('qf-list').hidden", frac=0.5)
        await check('Filtro: elegir 2ª categoría', '.qf-o', "document.querySelectorAll('#proyectos .fhid').length>0", nth=1, scroll=False)
        await check('Filtro: volver a «todos»', '#qf-btn', "!document.getElementById('qf-list').hidden", frac=0.5)
        await check('Filtro: «todos»', '.qf-o', "document.querySelectorAll('#proyectos .fhid').length===0", nth=0, scroll=False)
        await check('Proyectos: vista Baraja', '.tj-seg [data-v=deck]', "document.querySelector('#proyectos').classList.contains('tj-deck-on')", frac=0.5)
        await check('Vista rápida abre', '#proyectos .tj-cur .tj-qv, #proyectos .tj-qv', "!!document.querySelector('dialog.tj-sheet[open]')", frac=0.6)
        await check('Vista rápida cierra', 'dialog.tj-sheet .tj-x', "!document.querySelector('dialog.tj-sheet[open]')", scroll=False)
        await check('Chip de herramienta abre ficha', '.sk-chip', "!!document.querySelector('dialog[open]')||document.querySelectorAll('[data-sk-close]').length>0&&[...document.querySelectorAll('[role=dialog],dialog')].some(d=>d.open||getComputedStyle(d).display!=='none'&&getComputedStyle(d).visibility!=='hidden')", frac=0.86)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
        await check('Trayectoria: desplegar entrada', '#sx-tr-3-b', "document.getElementById('sx-tr-3-b').getAttribute('aria-expanded')==='true'", frac=0.84)
        await check('Testimonios: pestaña 2', '#sx-ts-t2', "document.getElementById('sx-ts-t2').getAttribute('aria-selected')==='true'", frac=0.84)
        await check('Botón flotante «Hablemos» abre', '#fcta', "document.getElementById('fab').classList.contains('open')", scroll=False)
        # tocar fuera cierra el panel
        await pg.touchscreen.tap(60, 300); await pg.wait_for_timeout(500)
        results.append(('Tocar fuera cierra «Hablemos»', 'OK' if not await pg.evaluate("document.getElementById('fab').classList.contains('open')") else 'FALLA'))
        print('\n'.join(f'{"✅" if r=="OK" else "❌"} {n}: {r}' for n, r in results))
        print('errores JS:', errs)
        await br.close()
asyncio.run(main())
