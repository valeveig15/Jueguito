# Break.exe 💻🌴

Un minijuego corto para mandarle a alguien que está trabajando mientras vos estás de vacaciones.
No necesita frameworks, servidor ni instalaciones.

## Archivos

- `index.html` — estructura de la página
- `style.css` — diseño, responsive y animaciones
- `script.js` — niveles, sonidos, puntaje, premios y confetti

## Publicarlo en GitHub Pages

1. Creá un repositorio nuevo en GitHub, por ejemplo `break-exe`.
2. Subí `index.html`, `style.css` y `script.js` a la raíz del repositorio.
3. En GitHub abrí **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná la rama `main` y la carpeta `/ (root)`.
6. Guardá. GitHub te mostrará la dirección pública del sitio.

## Personalización rápida

En `script.js` podés cambiar los tres premios buscando `data-reward=`.
También podés cambiar cualquier texto directamente en `index.html` o `script.js`.

## Importante

El sonido se genera desde el navegador con Web Audio API, por lo que no hay archivos de audio externos que subir.
