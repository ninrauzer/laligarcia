# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static HTML/CSS/JS artist portfolio for Lali Garcia. No build step, no dependencies, no package manager — open any `.html` file directly in a browser.

## Structure

- `index.html` — Obra/Pinturas page (homepage). Contains the year-tab UI (2024/2023/2022) and the painting grid with lightbox.
- `bio.html` — Biography, exhibition history, and CV download link.
- `videos.html` — Video embeds (YouTube/Vimeo iframes). Placeholders are in place; replace the `<div class="video-placeholder">` blocks with actual `<iframe>` tags.
- `contacto.html` — Contact form + direct email/Instagram links.
- `css/style.css` — All styles. Uses CSS custom properties defined in `:root`. Google Fonts loaded via `@import` (Cormorant Garamond + Lato).
- `js/main.js` — Three responsibilities: mobile menu toggle, year-tab switching, and lightbox open/navigate/close.

## Key conventions

**Adding a painting:** copy an `.obra-item` block in `index.html`, set `data-src` (full-res URL), `data-title`, `data-meta`, and the `<img src>`. Use `.portrait` (3:4), `.landscape` (4:3), or `.square` (1:1) on `.obra-img-wrap` to control aspect ratio.

**Adding a video:** replace a `<div class="video-placeholder">` in `videos.html` with an `<iframe>` that has `src`, `title`, `frameborder="0"`, `allowfullscreen`, and `loading="lazy"`. The `.video-embed-wrap` handles the 16:9 padding-bottom ratio.

**CV file:** place `cv-lali-garcia.pdf` at the root; the link in `bio.html` already points there.

**Contact form:** the `<form action="#">` submits nowhere by default. To wire it up, set `action` to a Formspree or Netlify Forms endpoint.

**Colors/fonts:** change the palette via the CSS variables in `:root` in `style.css`. The serif display font is Cormorant Garamond; body text is Lato.
