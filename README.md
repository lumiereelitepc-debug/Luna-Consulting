# Luna Consulting

Web de consultoría en español con identidad visual propia, glassmorphism, escena 3D interactiva y diseño adaptable.

## Desarrollo

Requisitos: Node.js 24 y npm 11, usados en la validación. No requiere claves ni servicios externos.

```bash
cd /workspace/Luna-Consulting
npm ci --cache /workspace/.cache/npm
npm run dev
```

Vite escucha en el puerto 5173. En este entorno, la caché de npm se sitúa en `/workspace/.cache/npm` para respetar los directorios permitidos.

## Producción

```bash
npm run build
npm run preview
```

`dist/` contiene la web estática lista para un alojamiento compatible. Preview usa el puerto 4173.

## Incluye

- Logo lunar propio en `public/luna-symbol.png` y favicon SVG.
- Escultura orbital 3D hecha con Three.js, con respuesta al cursor, pausa fuera de pantalla y alternativa visual cuando WebGL no está disponible.
- Servicios desplegables, metodología con pestañas y navegación móvil.
- Modal para preparar y descargar un briefing local en TXT. **No envía datos, mensajes ni correos.** Para recibir consultas se necesita conectar un servicio de envío y proporcionar el destino real.
- Fuentes alojadas en el proyecto, sin solicitudes a Google Fonts.
- Foco visible, navegación con teclado y respeto a la preferencia de movimiento reducido.

## Personalización

El contenido está en `src/App.jsx`; la dirección visual está en `src/styles.css`; la escultura en `src/components/OrbitalScene.jsx`; el briefing en `src/components/ContactDialog.jsx`.

La web no incluye clientes, testimonios ni cifras de resultados ficticios. Los textos de servicios son una propuesta editable para la marca.

## Verificación realizada

- Compilación de producción.
- Navegación y ausencia de desbordamiento horizontal en escritorio y móvil.
- Renderizado de WebGL, carga del logo, desplegables y pestañas.
- Menú móvil, validación de formulario, descarga de briefing y controles de teclado del modal.

Cada tarea en la nube ya tiene un entorno aislado: usa este checkout; no crees otro worktree salvo petición explícita.
