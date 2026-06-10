/* ── Mobile menu ── */
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
  });
}

/* ── Year tabs (obra page) ── */
const tabBtns = document.querySelectorAll('.tab-btn');
const obraSections = document.querySelectorAll('.obra-section');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    obraSections.forEach(s => s.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const target = document.getElementById('tab-' + btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* ── Lightbox ── */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose = document.getElementById('lb-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

if (!lightbox) {
  // not on obra page — nothing to do
} else {
  let currentItems = [];
  let currentIndex = 0;

  function getActiveItems() {
    const activeSection = document.querySelector('.obra-section.active');
    return activeSection ? Array.from(activeSection.querySelectorAll('.obra-item')) : [];
  }

  function openLightbox(items, index) {
    currentItems = items;
    currentIndex = index;
    showImage(currentIndex);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    const item = currentItems[index];
    if (!item) return;
    lbImg.src = item.dataset.src;
    lbImg.alt = item.querySelector('img').alt || '';
    lbCaption.textContent = item.dataset.title + (item.dataset.meta ? ' — ' + item.dataset.meta : '');
    lbPrev.style.opacity = index === 0 ? '0.3' : '1';
    lbNext.style.opacity = index === currentItems.length - 1 ? '0.3' : '1';
  }

  function navigate(dir) {
    const next = currentIndex + dir;
    if (next >= 0 && next < currentItems.length) {
      currentIndex = next;
      showImage(currentIndex);
    }
  }

  document.querySelectorAll('.obra-item').forEach(item => {
    item.addEventListener('click', () => {
      const items = getActiveItems();
      const index = items.indexOf(item);
      if (index !== -1) openLightbox(items, index);
    });

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });

    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ── Contact form feedback ── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    btn.textContent = 'Enviado ✓';
    btn.style.borderColor = '#666';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Enviar';
      btn.style.borderColor = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}
