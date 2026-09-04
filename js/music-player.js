/* ==========================================================================
   PROJECT X — music-player.js
   Reproductor flotante: biblioteca, controles y arrastre
   ========================================================================== */

// ===== MUSIC PLAYER + BIBLIOTECA DE CANCIONES =====
(function() {
  // Para agregar más canciones, solo añade otro objeto a esta lista
  // (sube el mp3 a assets/audio/)
  const playlist = [
    { title: 'Project X', artist: 'Yeah Yeah Yeahs', src: 'assets/audio/projectx.mp3', cover: 'assets/audio/projectx-cover.jpg' },
    { title: 'Right Round', artist: 'Flo Rida feat. Ke$ha', src: 'assets/audio/right-round-flo-rida.mp3', cover: 'assets/audio/projectx-cover.jpg' }
  ];

  const btn = document.getElementById('musicBtn');
  const prevBtn = document.getElementById('musicPrev');
  const nextBtn = document.getElementById('musicNext');
  const listBtn = document.getElementById('musicListBtn');
  const audio = document.getElementById('bgMusic');
  const card = document.getElementById('musicCard');
  const cover = document.getElementById('musicCover');
  const trackEl = document.getElementById('musicTrack');
  const artistEl = document.getElementById('musicArtist');
  const playlistEl = document.getElementById('musicPlaylist');
  if (!btn || !audio) return;

  // Volumen de fondo. A 0.32 resultaba practicamente inaudible en movil.
  audio.volume = 0.7;
  let current = 0;
  let wasPlaying = false;

  function renderPlaylist() {
    playlistEl.innerHTML = '';
    playlist.forEach((track, i) => {
      const item = document.createElement('div');
      item.className = 'music-playlist-item' + (i === current ? ' active' : '');
      item.innerHTML = `
        <img src="${track.cover}" alt="${track.title}">
        <div class="music-playlist-item-info">
          <div class="music-playlist-item-title">${track.title}</div>
          <div class="music-playlist-item-artist">${track.artist}</div>
        </div>`;
      item.addEventListener('click', () => loadTrack(i, true));
      playlistEl.appendChild(item);
    });
  }

  function loadTrack(index, autoplay) {
    current = (index + playlist.length) % playlist.length;
    const track = playlist[current];
    audio.src = track.src;
    cover.src = track.cover;
    cover.alt = track.title + ' - ' + track.artist;
    trackEl.textContent = track.title;
    artistEl.textContent = track.artist;
    renderPlaylist();
    if (autoplay) {
      audio.play().then(() => {
        btn.textContent = '❚❚';
        card.classList.add('playing');
      }).catch(() => {});
    }
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().then(() => {
        btn.textContent = '❚❚';
        card.classList.add('playing');
      }).catch(() => {
        alert('Haz clic de nuevo o permite el audio en el navegador.');
      });
    } else {
      audio.pause();
      btn.textContent = '▶';
      card.classList.remove('playing');
    }
  }

  audio.addEventListener('ended', () => loadTrack(current + 1, true));

  btn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); loadTrack(current - 1, !audio.paused); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); loadTrack(current + 1, !audio.paused); });
  listBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playlistEl.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!card.contains(e.target)) playlistEl.classList.remove('open');
  });

  // ===== ARRANQUE AUTOMATICO =====
  // Se intenta sonar nada mas cargar la pagina. Chrome, Safari y Firefox
  // bloquean el audio automatico con sonido, asi que dejamos armado un
  // respaldo: arranca sola en cuanto el visitante hace cualquier gesto.
  //
  // Tres detalles que hacen que esto funcione de verdad:
  //  1. Incluimos 'click' y 'touchend'. iOS/Safari solo desbloquea con esos
  //     dos; con 'touchstart' o 'pointerdown' se queda en silencio.
  //  2. Escuchamos en fase de CAPTURA. Los botones del reproductor llaman a
  //     stopPropagation(), asi que en fase de burbuja el evento nunca
  //     llegaria a window si el primer toque cae sobre uno de ellos.
  //  3. Los oyentes siguen armados hasta que el audio suena de verdad, por
  //     si el primer intento lo rechaza el navegador.
  loadTrack(0, true);

  const GESTOS = ['click', 'touchend', 'pointerup', 'pointerdown',
                  'touchstart', 'keydown', 'scroll', 'wheel'];

  function quitarOyentes() {
    GESTOS.forEach(g => {
      window.removeEventListener(g, arrancarConGesto, true);
      window.removeEventListener(g, arrancarConGesto);
    });
  }

  let intentando = false;
  function arrancarConGesto(e) {
    if (!audio.paused && audio.currentTime > 0) return quitarOyentes();
    // Eventos como 'scroll' o 'wheel' se disparan muchas veces seguidas.
    // Sin este candado, cada play() aborta al anterior y no arranca nunca.
    if (intentando) return;
    // Si el gesto es sobre el boton de play/pausa, no hacemos nada aqui:
    // se encarga togglePlay(). Si arrancasemos tambien nosotros, el boton
    // veria el audio ya sonando y lo pausaria de inmediato.
    if (e && e.target && e.target.closest && e.target.closest('#musicBtn')) return;
    intentando = true;
    audio.play().then(() => {
      intentando = false;
      btn.textContent = '❚❚';
      card.classList.add('playing');
      quitarOyentes();
    }).catch(() => {
      intentando = false; // sigue armado para el proximo gesto
    });
  }

  // En captura y en burbuja: la captura salva los toques sobre botones que
  // llaman a stopPropagation(); la burbuja cubre eventos como 'scroll', que
  // no recorren el arbol igual.
  GESTOS.forEach(g => {
    window.addEventListener(g, arrancarConGesto, { capture: true, passive: true });
    window.addEventListener(g, arrancarConGesto, { passive: true });
  });

  // ===== ARRASTRE TIPO BURBUJA =====
  // Permite mover el reproductor por la pantalla (arriba/abajo/lados).
  // Los clics en los botones siguen funcionando: solo se considera
  // arrastre cuando el puntero se desplaza mas de UMBRAL px.
  const MARGEN = 8;
  const UMBRAL = 5;
  let arrastrando = false, movido = false, suprimirClic = false, dx = 0, dy = 0;

  function fijarPos(x, y) {
    const w = card.offsetWidth, h = card.offsetHeight;
    x = Math.min(Math.max(x, MARGEN), window.innerWidth - w - MARGEN);
    y = Math.min(Math.max(y, MARGEN), window.innerHeight - h - MARGEN);
    card.style.left = x + 'px';
    card.style.top = y + 'px';
    card.style.right = 'auto';
    card.style.bottom = 'auto';
  }

  card.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.target.closest('.music-playlist')) return;
    const r = card.getBoundingClientRect();
    dx = e.clientX - r.left;
    dy = e.clientY - r.top;
    arrastrando = true;
    movido = false;
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener('pointermove', (e) => {
    if (!arrastrando) return;
    const x = e.clientX - dx, y = e.clientY - dy;
    if (!movido) {
      const r = card.getBoundingClientRect();
      if (Math.abs(x - r.left) < UMBRAL && Math.abs(y - r.top) < UMBRAL) return;
      movido = true;
      card.classList.add('dragging');
      playlistEl.classList.remove('open');
    }
    e.preventDefault();
    fijarPos(x, y);
  });

  function finArrastre(e) {
    if (!arrastrando) return;
    arrastrando = false;
    card.classList.remove('dragging');
    // Suprime solo el clic que dispara este mismo arrastre; se limpia
    // enseguida para no bloquear los clics siguientes en los botones.
    if (movido) {
      suprimirClic = true;
      setTimeout(() => { suprimirClic = false; }, 0);
    }
    movido = false;
    if (card.hasPointerCapture && card.hasPointerCapture(e.pointerId)) {
      card.releasePointerCapture(e.pointerId);
    }
  }
  card.addEventListener('pointerup', finArrastre);
  card.addEventListener('pointercancel', finArrastre);

  // Si se arrastro, cancela el clic para no abrir/cerrar la lista sin querer
  card.addEventListener('click', (e) => {
    if (suprimirClic) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  // Al cambiar el tamano de la ventana, devuelve la burbuja a la vista
  window.addEventListener('resize', () => {
    if (card.style.left) fijarPos(parseFloat(card.style.left), parseFloat(card.style.top));
  });
})();
