/* ============================================================
   lightbox.js — Full-screen image lightbox.
   Usage: showLightbox('https://example.com/image.png')
   Closes on overlay click, button click, or Escape key.
   ============================================================ */

function showLightbox(url) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;
  img.src           = url;
  lb.style.display  = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideLightbox();
});
