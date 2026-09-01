/* ==========================================================================
   PROJECT X — navigation.js
   Navegacion activa, animaciones de scroll y autoplay de videos
   ========================================================================== */

// ===== ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

function setActiveNav() {
  let current = 'inicio';
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    if (section.offsetTop <= scrollY) {
      current = section.getAttribute('id');
    }
  });
  // Map sections to nav items
  const map = {
    'inicio': 'inicio',
    'noche': 'noche',
    'eventos': 'noche',
    'entrada': 'inicio',
    'ubicacion': 'ubicacion',
    'comunidad': 'comunidad'
  };
  const activeId = map[current] || current;
  navLinks.forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href') || '';
    if (href === '#' + activeId) a.classList.add('active');
  });
}
window.addEventListener('scroll', setActiveNav);
navLinks.forEach(a => {
  a.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    a.classList.add('active');
  });
});
setActiveNav();
