// ===== NAV: solid on scroll =====
const nav = document.querySelector('nav');
const onScroll = () => nav && nav.classList.toggle('solid', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll);

// ===== MOBILE MENU =====
const burger = document.querySelector('.burger');
const mobilePanel = document.querySelector('.mobile-panel');
if (burger && mobilePanel) {
  burger.addEventListener('click', () => mobilePanel.classList.toggle('open'));
  mobilePanel.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobilePanel.classList.remove('open'))
  );
}

// ===== SERVICE TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      }
    });
    item.classList.toggle('open', !isOpen);
    a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
  });
});

// ===== CONTACT / WAITLIST FORMS -> TELEGRAM DEEP LINK =====
const TELEGRAM_USERNAME = 'markova_biomed'; // TODO: заменить на реальный ник Галины в Telegram

function buildTelegramMessage(fields) {
  return Object.entries(fields)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}

document.querySelectorAll('form[data-lead-form]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const fields = {};
    data.forEach((value, key) => { fields[key] = value; });

    const text = buildTelegramMessage(fields);
    const encoded = encodeURIComponent(text);

    const successBlock = form.parentElement.querySelector('.form-success');
    if (successBlock) {
      form.style.display = 'none';
      successBlock.classList.add('show');
    }

    const link = document.createElement('a');
    link.href = `https://t.me/${TELEGRAM_USERNAME}?text=${encoded}`;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
});

// ===== REVEAL ON SCROLL =====
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}
