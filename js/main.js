/* ── Netlify Identity redirect ─────────────────────────────────────── */
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}

/* ── Fetch helpers ─────────────────────────────────────────────────── */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

/* ── Escape HTML ───────────────────────────────────────────────────── */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════════════════════════════════
   RENDERIZADO — OBRAS
══════════════════════════════════════════════════════════════════════ */
function renderObras(data) {
  const obras = data.obras || [];
  const main = document.getElementById('main-obras');
  const tabsEl = document.getElementById('year-tabs');
  if (!main || !tabsEl) return;

  // Agrupar por año, orden descendente
  const byYear = {};
  obras.forEach(o => {
    if (!byYear[o.year]) byYear[o.year] = [];
    byYear[o.year].push(o);
  });
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  // Tabs
  tabsEl.innerHTML = years.map((year, i) =>
    `<button class="tab-btn${i === 0 ? ' active' : ''}" role="tab"
      data-tab="${esc(year)}" aria-selected="${i === 0}"
      aria-controls="tab-${esc(year)}">${esc(year)}</button>`
  ).join('');

  // Sections — insertarlas antes del lightbox
  const lightbox = document.getElementById('lightbox');
  years.forEach((year, i) => {
    const section = document.createElement('section');
    section.id = `tab-${year}`;
    section.className = `obra-section${i === 0 ? ' active' : ''}`;
    section.setAttribute('role', 'tabpanel');

    section.innerHTML = `<div class="obra-grid">${
      byYear[year].map(o => `
        <div class="obra-item" tabindex="0" role="button"
             data-src="${esc(o.src)}"
             data-title="${esc(o.title)}"
             data-meta="${esc(o.tecnica)} · ${esc(o.dimensiones)} · ${esc(o.year)}">
          <div class="obra-img-wrap ${esc(o.orientacion)}">
            <img src="${esc(o.src)}" alt="${esc(o.title)}, ${esc(o.year)}" loading="lazy">
          </div>
          <div class="obra-caption">
            <span class="title">${esc(o.title)}</span>
            <span class="meta">${esc(o.tecnica)} · ${esc(o.dimensiones)}</span>
          </div>
        </div>`
      ).join('')
    }</div>`;

    main.insertBefore(section, lightbox);
  });

  initTabs();
  initLightbox();
}

/* ══════════════════════════════════════════════════════════════════════
   RENDERIZADO — BIO
══════════════════════════════════════════════════════════════════════ */
function renderBio(data) {
  const fotoEl = document.getElementById('bio-foto');
  const contentEl = document.getElementById('bio-content');
  if (!contentEl) return;

  if (fotoEl && data.foto) fotoEl.src = data.foto;

  const paragraphs = (data.paragraphs || [])
    .map(p => `<p>${esc(p)}</p>`).join('');

  const makeList = (items) => (items || []).map(item =>
    `<li><span class="year">${esc(item.year)}</span><span>${esc(item.desc)}</span></li>`
  ).join('');

  contentEl.innerHTML = `
    <h1 class="bio-name">Lali García Almeyda</h1>
    ${paragraphs}
    <h3>Exposiciones individuales</h3>
    <ul class="expo-list">${makeList(data.individual)}</ul>
    <h3>Exposiciones colectivas y reconocimientos</h3>
    <ul class="expo-list">${makeList(data.colectiva)}</ul>
    <a class="bio-cv-link" href="cv-lali-garcia-almeyda.pdf" target="_blank" rel="noopener">
      &#8595;&nbsp;&nbsp;Descargar CV completo
    </a>`;
}

/* ══════════════════════════════════════════════════════════════════════
   RENDERIZADO — VIDEOS
══════════════════════════════════════════════════════════════════════ */
function renderVideos(data) {
  const grid = document.getElementById('videos-grid');
  if (!grid) return;

  grid.innerHTML = (data.videos || []).map(v => {
    const embed = v.embedUrl
      ? `<iframe src="${esc(v.embedUrl)}" title="${esc(v.title)}"
           frameborder="0" allowfullscreen loading="lazy"></iframe>`
      : `<div class="video-placeholder">
           <div class="video-placeholder-inner">
             <div class="play-icon"></div>
             <span>Próximamente</span>
           </div>
         </div>`;

    return `
      <div class="video-item">
        <div class="video-embed-wrap">${embed}</div>
        <div class="video-meta">
          <span class="title">${esc(v.title)}</span>
          <span class="info">${esc(v.info)}</span>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════════════
   RENDERIZADO — CONTACTO (email + instagram)
══════════════════════════════════════════════════════════════════════ */
function renderMeta(data) {
  const linksEl = document.getElementById('contact-links');
  if (!linksEl) return;

  if (data.email) {
    const a = document.createElement('a');
    a.href = `mailto:${data.email}`;
    a.textContent = data.email;
    linksEl.appendChild(a);
  }
  if (data.instagram) {
    const a = document.createElement('a');
    a.href = data.instagram;
    a.textContent = 'Instagram';
    a.target = '_blank';
    a.rel = 'noopener';
    linksEl.appendChild(a);
  }
}

/* ══════════════════════════════════════════════════════════════════════
   INTERACTIVIDAD — MENÚ MOBILE
══════════════════════════════════════════════════════════════════════ */
function initMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
  });
}

/* ══════════════════════════════════════════════════════════════════════
   INTERACTIVIDAD — TABS (obras)
══════════════════════════════════════════════════════════════════════ */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.obra-section');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      sections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = document.getElementById('tab-' + btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   INTERACTIVIDAD — LIGHTBOX
══════════════════════════════════════════════════════════════════════ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  if (!lightbox) return;

  let items = [];
  let idx = 0;

  function activeItems() {
    const active = document.querySelector('.obra-section.active');
    return active ? Array.from(active.querySelectorAll('.obra-item')) : [];
  }

  function show(i) {
    const item = items[i];
    if (!item) return;
    lbImg.src = item.dataset.src;
    lbImg.alt = item.querySelector('img').alt || '';
    lbCaption.textContent = item.dataset.title + (item.dataset.meta ? ' — ' + item.dataset.meta : '');
    lbPrev.style.opacity = i === 0 ? '0.3' : '1';
    lbNext.style.opacity = i === items.length - 1 ? '0.3' : '1';
  }

  function open(item) {
    items = activeItems();
    idx = items.indexOf(item);
    show(idx);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function nav(dir) {
    const next = idx + dir;
    if (next >= 0 && next < items.length) { idx = next; show(idx); }
  }

  // Event delegation — funciona con contenido renderizado dinámicamente
  document.addEventListener('click', e => {
    const item = e.target.closest('.obra-item');
    if (item) open(item);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.obra-item');
      if (item) { e.preventDefault(); open(item); }
    }
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => nav(-1));
  lbNext.addEventListener('click', () => nav(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });
}

/* ══════════════════════════════════════════════════════════════════════
   INTERACTIVIDAD — FORMULARIO DE CONTACTO
══════════════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Enviado ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Enviar'; btn.disabled = false; form.reset(); }, 3000);
  });
}

/* ══════════════════════════════════════════════════════════════════════
   INIT — detectar página y cargar contenido
══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initMenu();
  initContactForm();

  const page = document.body.dataset.page;

  try {
    if (page === 'obras') {
      const data = await fetchJSON('/content/obras.json');
      renderObras(data);

    } else if (page === 'bio') {
      const data = await fetchJSON('/content/bio.json');
      renderBio(data);

    } else if (page === 'videos') {
      const data = await fetchJSON('/content/videos.json');
      renderVideos(data);

    } else if (page === 'contacto') {
      const data = await fetchJSON('/content/meta.json');
      renderMeta(data);
    }
  } catch (err) {
    console.warn('No se pudo cargar contenido:', err.message);
  }
});
