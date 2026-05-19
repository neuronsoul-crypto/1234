// Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader.classList.add('hidden'), 800);
});

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Scroll reveal with IntersectionObserver
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// Subtle parallax on about sticky image
const aboutImg = document.querySelector('.about__sticky-img img');
if (aboutImg) {
  const aboutSection = document.querySelector('.about');
  window.addEventListener('scroll', () => {
    const rect = aboutSection.getBoundingClientRect();
    const progress = -rect.top / (rect.height - window.innerHeight);
    const clamped = Math.max(0, Math.min(1, progress));
    aboutImg.style.transform = `scale(1.08) translateY(${clamped * 40}px)`;
  }, { passive: true });
}

// Hero char reveal eyebrow
const eyebrow = document.querySelector('.hero__eyebrow');
if (eyebrow) {
  const text = eyebrow.textContent;
  eyebrow.textContent = '';
  eyebrow.style.opacity = '1';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch;
    span.style.cssText = `
      display: inline-block;
      opacity: 0;
      transform: translateY(8px);
      animation: charReveal .4s ease ${.4 + i * .03}s forwards;
    `;
    eyebrow.appendChild(span);
  });
}

// Inject charReveal keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes charReveal {
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Cursor trail (subtle paw prints on click)
document.addEventListener('click', (e) => {
  const paw = document.createElement('div');
  paw.textContent = '🐾';
  paw.style.cssText = `
    position: fixed;
    left: ${e.clientX - 12}px;
    top: ${e.clientY - 12}px;
    font-size: 1.2rem;
    pointer-events: none;
    z-index: 9998;
    animation: pawFade .8s ease forwards;
  `;
  document.body.appendChild(paw);
  setTimeout(() => paw.remove(), 800);
});

const pawStyle = document.createElement('style');
pawStyle.textContent = `
  @keyframes pawFade {
    0%   { opacity: .9; transform: scale(1) rotate(-20deg); }
    100% { opacity: 0; transform: scale(1.5) translateY(-20px) rotate(-10deg); }
  }
`;
document.head.appendChild(pawStyle);
