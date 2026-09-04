/* ==========================================================================
   PROJECT X — countdown.js
   Cuenta regresiva y cambio automatico de precio (preventa -> cover normal)

   Como funciona:
     - Mientras hay preventa, el contador apunta al cierre de la preventa
       y la pagina muestra el precio de preventa ($40.000).
     - Cuando pasa esa fecha, el contador pasa solo a apuntar al evento
       y todos los precios cambian solos al cover normal ($50.000).
   No hay que tocar nada el dia del cambio: ocurre automaticamente.
   ========================================================================== */

(function () {
  // ---- Fechas y precios del evento (unico sitio donde se configuran) ----
  // La preventa termina al acabar el 20 de septiembre (hora de Colombia),
  // asi que el corte es la medianoche que da paso al dia 21.
  const FIN_PREVENTA = new Date('2026-09-21T00:00:00-05:00').getTime();
  const FECHA_EVENTO = new Date('2026-09-26T00:00:00-05:00').getTime();

  const PRECIO_PREVENTA = '$40.000';
  const PRECIO_NORMAL   = '$50.000';

  const $ = (id) => document.getElementById(id);

  function hayPreventa() {
    return Date.now() < FIN_PREVENTA;
  }

  // ---- Precios: se sustituyen en todos los sitios marcados del HTML ----
  function aplicarPrecios() {
    const preventa = hayPreventa();
    const precio = preventa ? PRECIO_PREVENTA : PRECIO_NORMAL;

    document.querySelectorAll('[data-precio]').forEach(el => {
      el.textContent = precio;
    });
    // Bloques que solo se ven durante la preventa, o solo despues de ella
    document.querySelectorAll('[data-fase="preventa"]').forEach(el => {
      el.hidden = !preventa;
    });
    document.querySelectorAll('[data-fase="normal"]').forEach(el => {
      el.hidden = preventa;
    });
  }

  // ---- Contador ----
  function actualizarContador() {
    const preventa = hayPreventa();
    const objetivo = preventa ? FIN_PREVENTA : FECHA_EVENTO;
    let restante = objetivo - Date.now();
    if (restante < 0) restante = 0;

    const dias  = Math.floor(restante / 86400000);
    const horas = Math.floor((restante % 86400000) / 3600000);
    const mins  = Math.floor((restante % 3600000) / 60000);
    const segs  = Math.floor((restante % 60000) / 1000);

    const poner = (id, v) => { const el = $(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    poner('days', dias);
    poner('hours', horas);
    poner('minutes', mins);
    poner('seconds', segs);

    const etiqueta = $('countdownLabel');
    if (etiqueta) {
      etiqueta.textContent = preventa
        ? 'LA PREVENTA TERMINA EN'
        : (restante > 0 ? 'FALTAN' : 'HOY ES LA NOCHE');
    }
    const pie = $('countdownDate');
    if (pie) {
      pie.textContent = preventa
        ? 'Preventa hasta el 20 de septiembre · Evento el 26 de septiembre de 2026'
        : '26 de septiembre de 2026';
    }
  }

  function tick() {
    actualizarContador();
    aplicarPrecios();
  }

  tick();
  setInterval(tick, 1000);
})();
