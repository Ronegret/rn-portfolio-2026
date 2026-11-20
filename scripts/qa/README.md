# QA de toques (móvil y escritorio)

Comprueban que cada botón y enlace visible se pueda tocar de verdad, es decir, que no haya ninguna capa invisible encima. Así se detectó el fallo de «Ver 14 más»: lo tapaba la caja del botón flotante «Hablemos».

```bash
pip install playwright && python -m playwright install chromium webkit
npm run build && (cd dist && python3 -m http.server 4321) &
python3 scripts/qa/auditar-toques.py http://127.0.0.1:4321 chromium mobile   # todas las páginas
python3 scripts/qa/auditar-toques.py http://127.0.0.1:4321 webkit mobile     # motor de Safari / iPhone
python3 scripts/qa/auditar-toques.py http://127.0.0.1:4321 chromium desktop
python3 scripts/qa/probar-portada.py http://127.0.0.1:4321 webkit            # menú, idioma, tema, proyectos, filtros, vista rápida, «Hablemos»…
```

`auditar-toques.py` coloca cada elemento al 30 %, al 60 % y al 86 % de la altura de la pantalla y comprueba qué hay bajo el dedo. Además, apunta los errores de JavaScript, los recursos que dan 404 y los enlaces internos rotos.
