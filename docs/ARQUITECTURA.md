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

### Paleta

Solo tres colores, tomados del póster: **rojo neón, blanco y negro**. Nada de
degradados multicolor — el sitio antes era cian/rosa/morado/verde y no
dialogaba con la marca.

| Uso | Valor |
|---|---|
| Acento principal | `--rojo` `#ff1e3c` |
| Profundidad, sombras | `--rojo-hondo` `#a8001e` |
| Titulares, neón | `--blanco-neon` `#ffffff` |
| Fondo | `--bg-dark` `#050507` |

> **Cuidado con los nombres antiguos.** Las variables `--cyan`, `--pink`,
> `--purple` y `--lime` **siguen existiendo pero ya no son de ese color**:
> las usan unas 160 reglas repartidas por la hoja, así que en vez de renombrarlas
> se les cambió el valor a rojos y blanco. Es lo que permitió retiñir todo el
> sitio de una vez. Si algún día las renombras, hay que repasar la hoja entera.
> La redefinición vive al final del archivo, en el bloque «PALETA AGRESIVA».

- Tipografías: `Oswald` para titulares, `Inter` para texto.
- Las clases `.anim .anim-up` / `.anim-scale` activan la aparición al hacer
  scroll; las gestiona `js/navigation.js`.

---

## 3. Scripts (`js/`)

Cuatro archivos, cargados con `defer` en este orden. Cada bloque está envuelto
en una función anónima autoejecutada, así que **no comparten variables** y el
orden entre ellos no es crítico.

### `countdown.js`
Contador **y** cambio automático de precio. Todo se configura en la cabecera
del archivo (`FIN_PREVENTA`, `FECHA_EVENTO`, `PRECIO_PREVENTA`, `PRECIO_NORMAL`).

Cada segundo comprueba en qué etapa estamos y actualiza la página:

| | Durante la preventa | Desde el 21 de septiembre |
|---|---|---|
| Contador apunta a | fin de la preventa | fecha del evento |
| Etiqueta | «LA PREVENTA TERMINA EN» | «FALTAN» |
| Precio mostrado | $40.000 | $50.000 |

En el HTML se apoya en dos atributos:

- `data-precio` — el texto del elemento se sustituye por el precio vigente.
- `data-fase="preventa"` / `data-fase="normal"` — el bloque solo se ve en esa
  etapa; se oculta con el atributo `hidden`.

> **Cuidado:** `css/styles.css` incluye `[hidden] { display: none !important; }`
> cerca del principio. Es necesario: varias reglas del proyecto fijan `display`
> (por ejemplo `.info-lista li { display: flex }`) y ganarían al `display:none`
> del atributo, dejando visibles bloques que deberían estar ocultos. No la
> quites.

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
- El volumen es `0.7`. Estuvo en `0.32` y resultaba casi inaudible en móvil.

**Arranque automático.** La música intenta sonar nada más cargar. Ningún
navegador permite reproducir audio antes de que el visitante interactúe con la
página: es política del navegador, no un fallo del sitio. Lo que sí se
consigue es que **arranque sola con el primer gesto**, sin que nadie tenga que
buscar el botón de play.

Cinco detalles hacen que funcione en todos los navegadores. Si se tocan, la
música vuelve a quedarse en silencio para parte de los visitantes:

1. **Se escucha `click` y `touchend`, no solo `pointerdown`.** iOS y Safari
   solo desbloquean el audio con esos dos eventos.
2. **Los oyentes van en fase de captura *y* de burbuja.** Los botones del
   reproductor llaman a `stopPropagation()`, así que en burbuja el evento no
   llegaría a `window` si el primer toque cae sobre uno de ellos.
3. **El botón de play/pausa se excluye del respaldo.** Si no, al pulsarlo el
   respaldo arrancaría la música y `togglePlay()` la pausaría acto seguido.
4. **`togglePlay()` contempla el estado silenciado.** Si el audio viene
   silenciado *y* parado, hay que quitar el silencio **y** llamar a `play()`;
   solo quitar el silencio deja el icono en pausa sin que suene nada.
5. **Candado `intentando`.** `scroll` y `wheel` se disparan muchas veces
   seguidas y cada `play()` abortaría al anterior.

> **Sobre el arranque en silencio:** el código intenta reproducir silenciado
> como paso intermedio. La excepción de «silenciado se permite siempre» de los
> navegadores aplica a `<video>`, **no a `<audio>`**, así que en Chrome ese
> intento también falla. Se conserva porque no cuesta nada y en los
> navegadores que sí lo permiten deja la canción precargada. No te fíes de él
> como si funcionara: el paso que resuelve el problema es el gesto.

Comprobado en navegador real con el autoplay bloqueado: suena con clic, tecla,
rueda, toque táctil, scroll táctil, al arrastrar el reproductor y al pulsar
cualquiera de sus botones. El único caso en que no suena es si el visitante
no interactúa en absoluto.

### Por qué el volumen «se bajaba solo» en móvil

La página nunca modifica `volume` después de fijarlo a `0.7`: quien lo baja es
el teléfono. Android e iOS retiran el *foco de audio* a la pestaña cuando entra
una notificación, un mensaje o una llamada, o cuando otra app suena: la música
se agacha (*ducking*) o se pausa, y al acabar la interrupción **no se restaura
sola**. Los vídeos no tienen nada que ver: ninguno de los siete MP4 lleva pista
de audio.

Tres defensas en `js/music-player.js` y `js/visual-effects.js`:

1. **Media Session.** Se publican título, artista y carátula, y los mandos de
   play/pausa/anterior/siguiente. El sistema pasa a tratar la pestaña como un
   reproductor de verdad —sale en la pantalla de bloqueo— en vez de como un
   sonido suelto que puede cortar sin más.
2. **Vigilante (1 s).** Si el volumen bajó, si quedó silenciado o si algo lo
   pausó, lo devuelve a su sitio. Solo actúa si la música ya había arrancado
   y **no** fue el visitante quien pulsó pausa (`pausadoPorUsuario`), y se
   queda quieto con la pestaña oculta. Sin esa bandera, el botón de pausa
   dejaría de funcionar: la canción volvería sola al segundo.
3. ~~Un vídeo a la vez en móvil.~~ **Descartado a petición: ahora los nueve
   vídeos se reproducen a la vez** (ver más abajo). Si en algún teléfono
   antiguo la música se entrecorta, la causa es ésta y la solución sería
   volver a limitar los vídeos simultáneos.

Al volver a la pestaña (`visibilitychange`) también se restaura el sonido.

**Ojo con iOS:** Safari ignora la propiedad `volume` por completo; allí el
volumen es solo el de los botones físicos. El vigilante sigue sirviendo para
el silencio y las pausas.

### La finca

La sección `#finca` va justo debajo de los datos del evento, casi al principio
de la página: tres vídeos apaisados del sitio (entrada, casa y piscina). Vienen
de grabaciones de móvil de 1280×720 y ~3 Mb/s, reducidas a **640×360, CRF 32,
25 fps, sin pista de audio** y `+faststart`: de 46 MB en bruto a 5,5 MB. La
receta completa está más abajo, en la sección de medios.

En escritorio van en tres columnas, en dos por debajo de 900 px y en una sola
por debajo de 560 px.

### Vídeos: todos a la vez

Los doce vídeos arrancan a la vez en cuanto la página carga y **no se pausan
al salir de pantalla**. No hay límite de vídeos simultáneos (antes eran tres).
Detalles que lo hacen funcionar:

- `muted` + `playsinline` son **obligatorios**: son la única excepción a la
  política de autoplay. Un vídeo con sonido no arranca solo en ningún sitio.
- El `preload="none"` del HTML se sube a `auto` al arrancar, o el navegador no
  descargaría nada hasta que el vídeo entrase en pantalla.
- Hay reintentos en `loadeddata`, en `pause` y al primer gesto: algunos
  navegadores rechazan el primer `play()` si aún no hay datos suficientes.
- Ninguno lleva pista de audio, así que no compiten con la música.

El coste es rendimiento: doce decodificaciones H.264 simultáneas cargan la
CPU de un móvil. Es una decisión deliberada.

### La música y el arranque automático

Solo hay **una canción** (`right-round-flo-rida.mp3`) y va en bucle
(`audio.loop` se activa solo cuando la lista tiene un único tema).

**Sonar sin que el visitante toque nada es imposible**, y no es un fallo de la
página: Chrome, Safari, Firefox y Edge prohíben reproducir audio con sonido
antes de una interacción. La excepción de «silenciado sí» vale para `<video>`,
no para `<audio>`. Lo que sí funciona es sonar con el **primer gesto**, sea
cual sea: comprobado con 9 gestos distintos en escritorio y móvil, todos
arrancan la canción (clic, rueda, tecla, tap, scroll táctil, arrastrar el
reproductor...). El único que no puede funcionar es **mover el ratón**: no
cuenta como interacción para ningún navegador.

En escritorio el `<audio>` se pone en `preload="auto"` para que al primer
gesto suene al instante en vez de empezar entonces la descarga; en móvil no,
para no gastar datos.

### Los adornos flotan siempre

Todos los `.deco` flotan, en escritorio y en móvil, sin excepción. Dos detalles:

- La X del contador va centrada con `translate(-50%, -50%)`. Si usara el
  `decoFlota` general perdería el centrado —el keyframe reescribe el
  `transform` entero—, así que tiene el suyo, `decoFlotaCentro`, que conserva
  el translate.
- `--giro` y `--voltea` se pasan como variables al keyframe justo por lo
  mismo: cualquier rotación o volteo escrito aparte se perdería al animar.

### Adornos y móvil

Los adornos (`.deco`) viven en los **márgenes laterales** de las secciones
centradas. En escritorio hay sitio de sobra; en **móvil no existe ese margen**
—el contenido ocupa todo el ancho— así que varios se montaban sobre titulares
y sobre el botón de la comunidad.

Por eso, por debajo de 560 px **no se ocultan: se recolocan**. En vez de
las posiciones de escritorio, cada adorno se lleva pequeño (46–72 px) a una
franja vertical sin contenido —normalmente el *padding* superior o inferior
de la sección— pegado a un borde. Así se ven diez adornos en móvil sin tapar
una sola línea de texto. **La legibilidad manda sobre la decoración**: el
único que se oculta es el diablito de *comunidad*, que no cabe sin pisar el
título.

Dos detalles que hay que respetar al colocar uno nuevo en móvil:

- `.deco-flota` sube el adorno 20 px en la animación. Si lo anclas arriba,
  deja al menos 26 px de margen o el borde superior de la sección lo corta.
- El giro (`--giro`) y el volteo (`--voltea`) agrandan la caja: unos pocos
  píxeles de separación lateral evitan el recorte.

Antes de añadir un adorno nuevo, pasa la prueba de solapamiento: recorre la
página en 390 px y 360 px comparando el rectángulo de cada `.deco` con el de
cada nodo de texto. Si tapa más del ~12 % de un texto, hay que moverlo,
encogerlo u ocultarlo en móvil.

El contador usa **rejilla de 4 columnas por debajo de 560 px**. Con `flex`,
«SEGUNDOS» no cabía y saltaba a una segunda línea dejando los dos puntos
sueltos. En rejilla las cuatro casillas caben siempre, incluso a 320 px.

El pie lleva `padding-bottom: 6.5rem` en móvil: el reproductor flota fijo
abajo y se comía el campo de correo.

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
