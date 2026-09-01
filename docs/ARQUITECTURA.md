# Arquitectura

Detalle de cómo funciona cada parte del sitio y qué hay que saber antes de
tocarla. Para lo básico (estructura de carpetas, tareas frecuentes), ver el
[README](../README.md).

---

## 1. Página (`index.html`)

Una sola página con estas secciones, en orden:

| Sección | `id` | Contenido |
|---|---|---|
| Header | — | Logo «PROJECT», nav y CTA de compra |
| Hero | `inicio` | Título, subtítulo y dos botones |
| Features | — | Cuatro columnas: DJ, barra, piscina, energía |
| Noche | `noche` | Descripción, 3 tarjetas, reja de vídeos y galería |
| Countdown | `eventos` | Cuenta regresiva |
| Entrada | `entrada` | Tarjeta de entrada con precio y CTA de compra |
| Ubicación | `ubicacion` | Mapa de Google embebido |
| Comunidad | `comunidad` | CTA al grupo de WhatsApp |
| Footer | — | Eslogan y formulario de correo (decorativo) |

El reproductor de música vive fuera de las secciones, como elemento flotante
(`position: fixed`) al principio del `<body>`.

### Los dos WhatsApp no se mezclan

Son destinos distintos y no deben confundirse:

| Uso | Enlace |
|---|---|
| Comprar entrada (3 botones) | `https://wa.me/573145140075` |
| Unirse a la comunidad (1 botón) | `https://chat.whatsapp.com/LpS7e7bCkpaD53yu0gvmPk` |

No hay pasarela de pago, checkout, tickets, QR ni comprobantes: el flujo de
compra es únicamente el enlace a WhatsApp.

---

## 2. Estilos (`css/styles.css`)

Un único archivo, ~2.500 líneas, con un índice de secciones en la cabecera.

### Por qué no está dividido en varios archivos

La hoja se construyó por capas: hay bloques al final que **sobrescriben a
propósito** reglas anteriores (ajustes móviles, `IMMERSIVE EFFECTS`, correcciones
puntuales con `!important`). Dividirla en archivos temáticos obligaría a
reordenar reglas y cambiaría la cascada, rompiendo el diseño de forma sutil.

Se mantiene en un archivo, ordenado y con índice. **Al editar: añade al final
de la sección que corresponda, no muevas bloques de sitio.**

### Convenciones

- Variables de color en `:root` (`--cyan`, `--pink`, `--purple`, `--lime`…).
- Tipografías: `Oswald` para titulares, `Inter` para texto.
- Las clases `.anim .anim-up` / `.anim-scale` activan la aparición al hacer
  scroll; las gestiona `js/navigation.js`.

---

## 3. Scripts (`js/`)

Cuatro archivos, cargados con `defer` en este orden. Cada bloque está envuelto
en una función anónima autoejecutada, así que **no comparten variables** y el
orden entre ellos no es crítico.

### `countdown.js`
Cuenta regresiva. La fecha objetivo es la constante `targetDate`
(`2026-09-26T00:00:00-05:00`). Actualiza cada segundo los `id` `days`, `hours`,
`minutes`, `seconds`. Si la fecha ya pasó, muestra `00`.

### `music-player.js`
Reproductor flotante. Tres responsabilidades:

1. **Biblioteca** — el array `playlist` es la única fuente de verdad. El
   selector desplegable, la portada, el título y el artista se generan desde
   ahí (`renderPlaylist()` y `loadTrack()`). Añadir una canción es añadir un
   objeto al array.
2. **Controles** — play/pausa, anterior, siguiente y el desplegable. Al
   terminar una canción salta a la siguiente automáticamente.
3. **Arrastre tipo burbuja** — se puede mover por la pantalla con ratón o dedo.

Detalles del arrastre que conviene no romper:

- Solo se considera arrastre si el puntero se desplaza más de `UMBRAL` (5 px);
  por debajo de eso es un clic normal. Sin ese umbral, pulsar play movería la
  burbuja sin querer.
- Tras arrastrar se activa `suprimirClic` durante un tick para descartar el
  clic que genera el propio arrastre. **Se limpia con `setTimeout(…, 0)`**: si
  no se limpiara, se comería el siguiente clic legítimo y los botones dejarían
  de responder.
- La burbuja se mantiene siempre dentro de la pantalla (`fijarPos()`), y vuelve
  a la vista al cambiar el tamaño de la ventana.
- El `<audio>` usa `preload="none"` a propósito: son ~5 MB que no deben
  descargarse al abrir la página.

### `visual-effects.js`
Efectos decorativos, todos con degradación elegante (si no encuentran su
elemento, salen sin hacer nada):

- Partículas del countdown y de la sección de entrada (canvas).
- Partículas ambientales globales.
- Cursor personalizado de neón.
- Tilt 3D de la tarjeta de entrada — **desactivado en táctil y en pantallas
  ≤ 900 px** para no interferir con el scroll.
- Sombras dinámicas que siguen el ratón.

### `navigation.js`
- Marca el enlace de nav activo según la sección visible.
- Revela los elementos `.anim` al entrar en pantalla (IntersectionObserver).
- Autoplay de vídeos al entrar en pantalla, **con un máximo de 3 reproduciéndose
  a la vez** (constante `MAX`). Ese límite es intencional: más vídeos
  simultáneos saturan la CPU y la red en móviles.

---

## 4. Medios (`assets/`)

| Carpeta | Contenido | Peso |
|---|---|---|
| `img/` | Fotos de galería y fondos de sección | ~0,8 MB |
| `video/` | Clips de la sección NOCHE | ~6,4 MB |
| `poster/` | Primer fotograma de cada vídeo | ~0,1 MB |
| `audio/` | Canciones y carátula del reproductor | ~13 MB |

### Estrategia de carga

El sitio llegó a tardar más de 12 segundos en pintar y a no mostrar los vídeos
en algunos dispositivos. Las causas y sus soluciones, que **no conviene
revertir**:

| Problema | Solución aplicada |
|---|---|
| El audio descargaba 5,6 MB al abrir | `<audio preload="none">` |
| Los vídeos se veían como rectángulos negros | Atributo `poster` en los 9 vídeos |
| Un vídeo requería descarga completa antes de reproducir | `+faststart` (átomo `moov` al principio) |
| Google Fonts bloqueaba el primer pintado | Carga con `media="print"` + `onload` |
| Vídeos de 720p a 1,6 Mb/s para mostrarse a 180 px | Recomprimidos a 432 px, perfil baseline |

Los vídeos usan `preload="none"`: no se descargan hasta que el usuario llega a
ellos. El póster es lo que da la sensación de carga instantánea.

### Cómo preparar un vídeo nuevo

```bash
# Recomprimir con el perfil compatible del proyecto
ffmpeg -i original.mp4 \
  -vf "scale='min(432,iw)':-2" \
  -c:v libx264 -profile:v baseline -level 3.0 -pix_fmt yuv420p \
  -crf 31 -preset slower -an -movflags +faststart \
  assets/video/nombre.mp4

# Generar su póster
ffmpeg -ss 0.5 -i assets/video/nombre.mp4 -frames:v 1 \
  -vf "scale=432:-2" -q:v 7 assets/poster/poster-nombre.jpg
```

`-an` elimina la pista de audio: los vídeos van silenciados, así que sobra.
`baseline` es menos eficiente que `High`, pero es el perfil que reproducen sin
problemas los móviles y navegadores antiguos.

### Cómo optimizar una imagen nueva

```bash
# Foto de galería (se muestra pequeña)
ffmpeg -i original.jpg -vf "scale='min(560,iw)':-2" -q:v 6 assets/img/nombre.jpg

# Fondo a pantalla completa
ffmpeg -i original.jpg -vf "scale='min(1280,iw)':-2" -q:v 6 assets/img/fondo.jpg
```

---

## 5. Comprobaciones antes de publicar

No hay tests automáticos. Como mínimo, revisa a mano:

- [ ] La página carga sin errores en la consola del navegador.
- [ ] No hay peticiones 404 (pestaña Red) — sobre todo tras mover archivos.
- [ ] Los 3 botones «COMPRAR ENTRADA» abren WhatsApp en pestaña nueva.
- [ ] El botón de comunidad abre el grupo correcto.
- [ ] El reproductor suena, cambia de canción y se puede arrastrar.
- [ ] En móvil: sin scroll horizontal y sin huecos entre secciones.
- [ ] Los vídeos muestran su póster de inmediato y arrancan al llegar a ellos.
