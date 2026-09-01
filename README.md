# PROJECT X

Página web del evento **PROJECT X**.

- **Fecha:** 26 de septiembre de 2026
- **Lugar:** 9736+3HM, La Dorada, Caldas
- **Entrada:** $50.000 COP
- **Compra:** el botón «COMPRAR ENTRADA» abre WhatsApp directamente (`https://wa.me/573145140075`)
- **Comunidad:** [grupo oficial de WhatsApp](https://chat.whatsapp.com/LpS7e7bCkpaD53yu0gvmPk)

---

## Cómo verla

Es un sitio **estático puro**: HTML + CSS + JavaScript, sin framework, sin
`package.json` y sin paso de compilación.

Ábrelo con cualquier servidor estático desde la raíz del proyecto:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

> Ábrelo con un servidor, no con doble clic en `index.html`. Con el protocolo
> `file://` algunos navegadores bloquean la carga de vídeos y audio.

---

## Estructura

```
.
├── index.html              Única página. Solo marcado, sin CSS ni JS dentro.
│
├── css/
│   └── styles.css          Todos los estilos (ver aviso sobre la cascada abajo).
│
├── js/                     Un archivo por área. Se cargan con `defer`.
│   ├── countdown.js        Cuenta regresiva hasta la fecha del evento.
│   ├── music-player.js     Reproductor flotante: biblioteca, controles, arrastre.
│   ├── visual-effects.js   Partículas, cursor personalizado, tilt 3D, sombras.
│   └── navigation.js       Nav activa, animaciones de scroll, autoplay de vídeos.
│
├── assets/
│   ├── img/                Fotos de galería y fondos de sección (20 archivos).
│   ├── video/              Clips de la sección NOCHE (7 archivos).
│   ├── poster/             Primer fotograma de cada vídeo (7 archivos).
│   └── audio/              Canciones del reproductor + carátula (4 archivos).
│
└── docs/
    └── ARQUITECTURA.md     Cómo funciona cada parte y cómo modificarla.
```

---

## Tareas frecuentes

### Añadir una canción al reproductor

1. Copia el `.mp3` en `assets/audio/`.
2. Añade una entrada al array `playlist` en `js/music-player.js`:

```js
{ title: 'Nombre', artist: 'Artista',
  src: 'assets/audio/archivo.mp3', cover: 'assets/audio/projectx-cover.jpg' }
```

El selector y los controles se generan solos a partir de ese array.

### Añadir un vídeo

1. Copia el `.mp4` en `assets/video/`.
2. Genera su póster en `assets/poster/` (ver `docs/ARQUITECTURA.md`).
3. Añade el bloque en `index.html` copiando uno existente de `.noche-videos`.

**El atributo `poster` no es opcional.** Sin él, el vídeo se ve como un
rectángulo negro hasta que termina de descargar.

### Cambiar la fecha del evento

Está en `js/countdown.js` (constante `targetDate`) y como texto en
`index.html`. Hay que actualizar ambos.

---

## Avisos importantes

**El orden del CSS importa.** `css/styles.css` contiene overrides deliberados
que dependen de la cascada: hay reglas al final que sobrescriben otras
anteriores a propósito. Reordenar o mover bloques rompe el diseño. El archivo
lleva un índice de secciones en su cabecera.

**Los medios están optimizados para web.** Los vídeos son H.264 *Constrained
Baseline* a 432 px con `faststart` — el perfil más compatible con móviles y
navegadores antiguos. Si reemplazas alguno, aplícale el mismo tratamiento
(instrucciones en `docs/ARQUITECTURA.md`) o volverá a tardar en cargar.

**Archivo sin usar:** `assets/img/noir-nights-bg.jpg` no se referencia desde
ningún sitio. Se conserva por si hace falta; puede borrarse sin efecto.

---

## Despliegue

Conectado a Vercel. Cada push a `main` publica automáticamente a producción;
los push a otras ramas generan un *Preview*.

No requiere configuración de build: preset **Other**, sin comando de
compilación, salida en la raíz.
