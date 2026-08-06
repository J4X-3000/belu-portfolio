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
