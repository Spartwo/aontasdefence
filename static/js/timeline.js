/* ============================================================
   timeline.js — Drag-to-scroll for the horizontal events
                 timeline track on the Home page.
   ============================================================ */

(function () {
  const track = document.getElementById('timeline-track');
  if (!track) return;

  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.classList.add('dragging');
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.classList.remove('dragging');
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.classList.remove('dragging');
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.2; // scroll speed multiplier
    track.scrollLeft = scrollLeft - walk;
  });

  /* Touch support for mobile swipe */
  let touchStartX   = 0;
  let touchScrollLeft = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX    = e.touches[0].pageX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    const dx = touchStartX - e.touches[0].pageX;
    track.scrollLeft = touchScrollLeft + dx;
  }, { passive: true });
})();
