/* ============================================================
   nav.js — Page routing, nav active states, shared footer,
             mobile hamburger menu
   ============================================================ */

const siteFooter  = document.getElementById('site-footer');
const domainPages = ['land', 'vessels', 'air', 'space'];

/**
 * Switch the visible page, update nav highlight, move
 * the shared footer into the newly active page, and
 * scroll to the top.
 */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

  const activePage = document.getElementById('page-' + page);
  if (!activePage) return;
  activePage.classList.add('active');

  // Highlight the matching nav link; domain pages light up "Systems"
  const navEl = document.getElementById('nav-' + page);
  if (navEl) {
    navEl.classList.add('active');
  } else if (domainPages.includes(page)) {
    document.getElementById('nav-systems').classList.add('active');
  }

  // Move shared footer into the newly active page
  activePage.appendChild(siteFooter);

  // Close mobile menu if open
  closeMobileMenu();

  window.scrollTo(0, 0);
}

// Attach footer to whichever page is active on first load
const initialActive = document.querySelector('.page.active');
if (initialActive) initialActive.appendChild(siteFooter);


/* ---- Mobile hamburger ---- */

const hamburger      = document.getElementById('nav-hamburger');
const mobileOverlay  = document.getElementById('nav-mobile-overlay');

function closeMobileMenu() {
  if (!hamburger || !mobileOverlay) return;
  hamburger.classList.remove('open');
  mobileOverlay.classList.remove('open');
}

if (hamburger && mobileOverlay) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileOverlay.classList.toggle('open');
  });

  // Close on any link tap inside the overlay
  mobileOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}
