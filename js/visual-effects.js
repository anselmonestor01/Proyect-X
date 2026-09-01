/* ==========================================================================
   PROJECT X — visual-effects.js
   Efectos visuales: particulas, cursor, tilt 3D y sombras
   ========================================================================== */

// ===== IMMERSIVE: COUNTDOWN PARTICLES (matrix-like) =====
(function() {
  const canvas = document.getElementById('countdownCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const mouse = { x: null, y: null };

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 28; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1
    });
  }

  const section = document.getElementById('eventos');
  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  section.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function draw() {
    if (canvas._visible === false) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > w) p.speedX *= -1;
      if (p.y < 0 || p.y > h) p.speedY *= -1;

      // Attraction to mouse
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 180) {
          p.x -= dx * 0.01;
          p.y -= dy * 0.01;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
      ctx.fill();

      // connections disabled for performance
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== IMMERSIVE: TICKET 3D TILT + GLOW =====
(function() {
  const card = document.getElementById('ticketCard');
  const orb = null;
  if (!card) return;

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

    if (false && orb) {
      orb.style.left = (x - 90) + 'px';
      orb.style.top = (y - 90) + 'px';
      orb.style.opacity = '1';
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
    if (false && orb) orb.style.opacity = '0';
  });
})();

// ===== IMMERSIVE: TICKET BACKGROUND PARTICLES =====
(function() {
  const canvas = document.getElementById('ticketCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 18; i++) {
    dots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.35 + 0.05
    });
  }

  function draw() {
    if (canvas._visible === false) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${d.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


// ===== AMBIENT PARTICLES (global) =====
(function() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.35 + 0.05
    });
  }

  function draw() {
    if (canvas._visible === false) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== DYNAMIC SHADOWS (follow mouse lightly) =====
(function() {
  const targets = document.querySelectorAll('.feature, .noche-item, .ticket-card, .map-wrapper');
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    targets.forEach(el => {
      const x = Math.round(dx * -14);
      const y = Math.round(12 + dy * 10);
      el.style.setProperty('--shadow-x', x + 'px');
      el.style.setProperty('--shadow-y', y + 'px');
    });
  });
})();


// ===== IMMERSIVE CUSTOM CURSOR =====
(function() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, .btn-primary, .btn-secondary, .btn-comprar, .btn-ticket, .btn-comunidad, .ticket-card, .feature, .noche-item, .music-toggle, .music-nav-btn, .music-list-btn, .music-playlist-item';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hover');
      ring.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    });
  });
})();

  
// (video observer replaced by limited concurrent player)


  

// ===== 3D TILT: ticket only (map uses CSS frame — no iframe bugs) =====
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(max-width: 900px)').matches) return;
  const el = document.querySelector('.ticket-card.tilt-3d');
  if (!el) return;
  let rect = null, raf = 0, targetX = 0, targetY = 0, curX = 0, curY = 0;
  const maxTilt = 11;
  function measure() { rect = el.getBoundingClientRect(); }
  measure();
  window.addEventListener('resize', measure, { passive: true });
  function tick() {
    curX += (targetX - curX) * 0.12;
    curY += (targetY - curY) * 0.12;
    el.style.transform = 'rotateX(' + curX.toFixed(2) + 'deg) rotateY(' + curY.toFixed(2) + 'deg) translateZ(8px)';
    raf = requestAnimationFrame(tick);
  }
  el.addEventListener('mouseenter', () => { measure(); if (!raf) raf = requestAnimationFrame(tick); });
  el.addEventListener('mousemove', (e) => {
    if (!rect) measure();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetY = (x - 0.5) * maxTilt * 2;
    targetX = (0.5 - y) * maxTilt * 1.3;
    const shine = el.querySelector('.tilt-shine');
    if (shine) {
      shine.style.background = 'radial-gradient(circle at ' + (x*100) + '% ' + (y*100) + '%, rgba(255,255,255,0.2) 0%, transparent 55%)';
    }
  });
  el.addEventListener('mouseleave', () => {
    targetX = 5; targetY = -8;
    setTimeout(() => {
      if (Math.abs(curX - 5) < 0.3 && Math.abs(curY + 8) < 0.3) {
        cancelAnimationFrame(raf); raf = 0;
        el.style.transform = 'rotateX(5deg) rotateY(-8deg)';
      }
    }, 600);
  });
})();

// Limit concurrent videos (performance)
(function() {
  const videos = Array.from(document.querySelectorAll('video[data-autoplay]'));
  let playing = new Set();
  const MAX = 3;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        if (playing.size >= MAX) {
          const first = playing.values().next().value;
          if (first && first !== v) { first.pause(); playing.delete(first); }
        }
        v.muted = true;
        v.play().then(() => playing.add(v)).catch(()=>{});
      } else {
        v.pause();
        playing.delete(v);
      }
    });
  }, { rootMargin: '40px', threshold: 0.2 });
  videos.forEach(v => io.observe(v));
})();

  
// Pause particle canvases when off-screen (perf)
(function() {
  const cans = [document.getElementById('countdownCanvas'), document.getElementById('ticketCanvas')];
  cans.forEach(c => {
    if (!c) return;
    c._visible = true;
    const io = new IntersectionObserver(([e]) => {
      c._visible = e.isIntersecting;
      if (!e.isIntersecting) {
        const ctx = c.getContext('2d');
        if (ctx) ctx.clearRect(0,0,c.width,c.height);
      }
    }, { threshold: 0.05 });
    io.observe(c);
  });
  // Monkey-patch: skip draw work when not visible by wrapping rAF users is hard;
  // simpler: set attribute
})();
