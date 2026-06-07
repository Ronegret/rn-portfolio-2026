# Portfolio Rodrigo Negrete

Portfolio convertido desde el HTML original a una estructura editable con Vite, manteniendo el estilo, los temas, las animaciones y las imagenes originales.

## Estructura

- `index.html`: estructura principal de secciones, tarjetas, enlaces e imagenes.
- `src/styles.css`: estilos, responsive, tokens y los 5 temas visuales.
- `src/content.js`: textos traducibles en ES/CA/EN.
- `src/main.js`: cambio de idioma, cambio de tema, animaciones, canvas e interacciones.

## Desarrollo

```bash
npm install
npm run dev
```

## Produccion

```bash
npm run build
```

El build final queda en `dist/`. Las imagenes siguen apuntando a las URLs publicas de `rodrigonegrete.es` para que sean visibles desde el primer arranque.
