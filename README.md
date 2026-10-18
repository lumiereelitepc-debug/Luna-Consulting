# Luna Consulting

Web de consultoría empresarial integral en español con identidad visual propia, presentación institucional en azul marino, blanco y tonos claros, luna menguante 3D interactiva y diseño adaptable.

## Oferta

Diagnóstico estratégico, investigación de clientes y experiencia, mejora de operación y capacitación, desarrollo comercial y fidelización, marketing y presencia digital, y plan de mejora con seguimiento.

La metodología sigue cinco etapas: investigación, análisis, diagnóstico, estrategia e implementación con medición. La sección «Qué recibes» presenta los entregables y los indicadores. Alcance, plazos e inversión se acuerdan para cada proyecto. La propuesta web se refiere a estructura y contenido; no implica desarrollo o alojamiento incluidos.

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
- Luna menguante 3D con cráteres, levitación y paralaje, hecha con Three.js. El arco iluminado a la izquierda flota directamente sobre el fondo claro de la portada, sin panel azul, estrellas ni tarjetas superpuestas.
- Escultura cristalina 3D en la sección de la firma, con núcleo facetado, satélites y pulsos luminosos. Se carga al acercarse a la sección. Ambas escenas limitan el renderizado a 30 fps y DPR 1,5, pausan fuera de pantalla y al ocultar la pestaña, respetan los cambios de movimiento reducido y tienen alternativas visuales sin WebGL.
- Tarjetas con perspectiva e iluminación al mover el cursor y capas de cristal en la metodología. Los efectos se desactivan con movimiento reducido; la perspectiva se limita a dispositivos con puntero preciso.
- Seis servicios desplegables, cinco etapas de metodología con pestañas, entregables y navegación móvil.
- Modal para preparar y descargar un briefing local en TXT. **No envía datos, mensajes ni correos.** Para recibir consultas se necesita conectar un servicio de envío y proporcionar el destino real.
- Fuentes alojadas en el proyecto, sin solicitudes a Google Fonts.
- Foco visible, navegación con teclado y respeto a la preferencia de movimiento reducido.

## Personalización

El contenido está en `src/App.jsx`; la estructura visual está en `src/styles.css` y la identidad profesional clara en `src/executive.css`. Las escenas están en `src/components/OrbitalScene.jsx` y `StrategyScene.jsx`; los efectos de perspectiva en `src/depth.css` y `src/components/useDepthEffects.js`; el briefing en `src/components/ContactDialog.jsx` y su estilo claro en `ContactDialog.css`. La luna usa transparencia en la zona sin iluminación para conservar el arco menguante y sus tonos neutros sobre el fondo claro. La portada no aplica paneles de color ni capas de cristal sobre la luna. Los créditos de la textura están en `THIRD_PARTY_NOTICES.md`.

La web no incluye clientes, testimonios ni cifras de resultados ficticios. Los textos de servicios son una propuesta editable para la marca.

## Verificación realizada

- Compilación de producción.
- Navegación y ausencia de desbordamiento horizontal en escritorio y móvil.
- Renderizado de WebGL, carga del logo, desplegables y pestañas.
- Menú móvil, validación de formulario, descarga de briefing y controles de teclado del modal.

Cada tarea en la nube ya tiene un entorno aislado: usa este checkout; no crees otro worktree salvo petición explícita.
