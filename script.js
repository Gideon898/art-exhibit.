// ---------- CONFIG ----------
const EMAILJS_USER = "-DxC42ZATW8CwmbTh";
const EMAILJS_SERVICE = "service_8l88tnz";
const EMAILJS_TEMPLATE = "template_kzf284j";

// Use 5 days from page-load for the countdown (as requested)
const COUNTDOWN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days in ms

// Throttle visitor notification (minutes)
const NOTIFY_MIN = 30;

// ---------- EmailJS init ----------
(function(){
  if (window.emailjs) {
    emailjs.init(EMAILJS_USER);
  } else {
    console.warn('EmailJS not loaded.');
  }
})();

// ---------- Utility / Notification ----------
function shouldNotify() {
  try {
    const t = localStorage.getItem('pp_lastNotify');
    if (!t) return true;
    return (Date.now() - Number(t)) > NOTIFY_MIN * 60 * 1000;
  } catch (e) { return true; }
}
function setNotified() {
  try { localStorage.setItem('pp_lastNotify', String(Date.now())); } catch(e){}
}
function sendVisitNotification() {
  if (!window.emailjs || !shouldNotify()) return;
  const payload = {
    visitor_time: new Date().toLocaleString(),
    page: location.href,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent
  };
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, payload)
    .then(() => { console.log('Visit notification sent'); setNotified(); })
    .catch(err => console.error('EmailJS visit error', err));
}

// ---------- Clock & Countdown ----------
function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() { el.textContent = new Date().toLocaleString(); }
  tick();
  setInterval(tick, 1000);
}

function startCountdownFromNow(durationMs) {
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = Date.now() + durationMs;
  function update() {
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = 'Exhibition is live.'; clearInterval(id); return; }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const m = Math.floor((diff % (1000*60*60)) / (1000*60));
    const s = Math.floor((diff % (1000*60)) / 1000);
    el.textContent = `Next show in ${d}d ${h}h ${m}m ${s}s`;
  }
  update();
  const id = setInterval(update, 1000);
}

// ---------- Lightbox ----------
function openLightbox(src, title) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-caption');
  img.src = src;
  cap.textContent = title || '';
  lb.setAttribute('aria-hidden', 'false');
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.setAttribute('aria-hidden', 'true');
  document.getElementById('lb-img').src = '';
  document.getElementById('lb-caption').textContent = '';
}

// ---------- Contact form (EmailJS) ----------
const contactFormHandler = () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.textContent = 'Sending…';
    const fd = new FormData(form);
    const params = {
      from_name: fd.get('from_name'),
      from_email: fd.get('from_email'),
      message: fd.get('message'),
      page: location.href,
      timestamp: new Date().toISOString()
    };
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params)
      .then(() => {
        status.textContent = 'Message sent — thank you!';
        form.reset();
      }).catch(err => {
        console.error('EmailJS contact error', err);
        status.textContent = 'Failed to send. Try again later.';
      });
  });

  // subscribe button (simple: sends an email with the address)
  const subsInput = document.getElementById('subscribeEmail');
  const subsBtn = document.getElementById('subscribeBtn');
  subsBtn.addEventListener('click', function(){
    const email = (subsInput && subsInput.value) ? subsInput.value.trim() : '';
    if (!email) { alert('Enter an email to subscribe'); return; }
    status.textContent = 'Subscribing…';
    emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      from_name: 'Subscriber',
      from_email: email,
      message: 'Subscribe request'
    }).then(() => {
      status.textContent = 'Subscribed — thank you!';
      subsInput.value = '';
    }).catch(err => {
      console.error('EmailJS subscribe error', err);
      status.textContent = 'Subscription failed.';
    });
  });
};

// ---------- Init on load ----------
window.addEventListener('DOMContentLoaded', () => {
  startClock();
  startCountdownFromNow(COUNTDOWN_MS);
  contactFormHandler();

  // wire thumbnails & view buttons to lightbox
  document.querySelectorAll('.thumb img').forEach(img => {
    img.addEventListener('click', (e) => {
      const src = e.currentTarget.getAttribute('data-full') || e.currentTarget.src;
      const title = e.currentTarget.alt || '';
      openLightbox(src, title);
    });
  });
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const src = btn.getAttribute('data-src');
      const title = btn.getAttribute('data-title') || '';
      openLightbox(src, title);
    });
  });

  // lightbox controls
  document.querySelector('.lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', function(e){
    if (e.target === this) closeLightbox();
  });

  // notify visit (small delay so EmailJS initializes)
  setTimeout(sendVisitNotification, 800);
});
