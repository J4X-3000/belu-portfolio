const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth inertia scroll
let lenis;
if (window.Lenis && !prefersReducedMotion) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  requestAnimationFrame(function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  });
}

// Smooth scroll for in-page nav links (About me / Contacto)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

// Subtle magnetic pull on contact buttons (pointer devices only)
if (window.matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-zoom');

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => io.observe(el));

// Subtle hero parallax
const heroBg = document.querySelector('.hero__bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `scale(1.1) translateY(${y * 0.15}px)`;
  }, { passive: true });
}

// Play phone videos when they enter view (if a real source is loaded)
document.querySelectorAll('.phone__video').forEach(video => {
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!video.currentSrc) return;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.5 });
  io2.observe(video);

  video.addEventListener('loadeddata', () => {
    const placeholder = video.parentElement.querySelector('.phone__placeholder');
    if (placeholder) placeholder.style.display = 'none';
  });
});

// Lightbox gallery (infinite loop carousel)
(() => {
  const galleryImgs = [...document.querySelectorAll('.g-cell img')];
  if (!galleryImgs.length) return;

  const lightbox = document.getElementById('lightbox');
  const track = document.getElementById('lightboxTrack');
  const closeBtn = document.getElementById('lightboxClose');

  function makeImg(img, isReal) {
    const full = document.createElement('img');
    full.src = img.src;
    full.alt = img.alt;
    if (isReal) full.dataset.forSrc = img.src;
    full.className = isReal ? 'is-real' : 'is-clone';
    return full;
  }

  // prev-clones + real set + next-clones, so scrolling past either edge
  // lands on an identical-looking clone we can silently re-center from.
  galleryImgs.forEach(img => track.appendChild(makeImg(img, false)));
  const realEls = galleryImgs.map(img => {
    const el = makeImg(img, true);
    track.appendChild(el);
    return el;
  });
  galleryImgs.forEach(img => track.appendChild(makeImg(img, false)));

  let lastFocused = null;

  function recenterIfNeeded() {
    const firstReal = realEls[0];
    const setWidth = (realEls[realEls.length - 1].offsetLeft + realEls[realEls.length - 1].offsetWidth) - firstReal.offsetLeft + 16;
    const realStart = firstReal.offsetLeft;
    const realEnd = realStart + setWidth;
    if (track.scrollLeft < realStart - track.clientWidth / 2) {
      track.scrollLeft += setWidth;
    } else if (track.scrollLeft > realEnd - track.clientWidth / 2) {
      track.scrollLeft -= setWidth;
    }
  }

  let scrollTimer = null;
  track.addEventListener('scroll', () => {
    if (!lightbox.classList.contains('is-open')) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(recenterIfNeeded, 120);
  }, { passive: true });

  function openLightbox(src) {
    lastFocused = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const target = track.querySelector(`.is-real[data-for-src="${CSS.escape(src)}"]`);
    if (target) target.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  galleryImgs.forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
})();
