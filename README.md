# Tambo Break 🐄

Mini web/juego para interrumpir unos minutos una jornada de trabajo en el tambo.

## Archivos

- `index.html`
- `style.css`
- `script.js`

No usa librerías externas ni necesita servidor propio.

## Publicarlo con GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html`, `style.css` y `script.js` a la raíz del repositorio.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/(root)`.
6. Guarda los cambios.
7. GitHub mostrará la dirección pública de la web.

## Personalizarlo

Los textos del juego están en `script.js`. El texto de la primera pantalla y el vale final están en `index.html`.

Para cambiar los tres premios, busca `renderLevelFour()` dentro de `script.js`.
