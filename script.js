// ---------- CONFIG ----------
const EMAILJS_USER = "-DxC42ZATW8CwmbTh";
const EMAILJS_SERVICE = "service_8l88tnz";
const EMAILJS_TEMPLATE = "template_kzf284j";

// Event date for countdown (change to your exhibition date/time)
const EVENT_DATE = "2025-12-01T18:00:00"; // ISO format

// Throttle notifications to avoid spam (minutes)
const NOTIFY_THROTTLE_MIN = 30;

// ---------- EmailJS init ----------
(function(){
  if (window.emailjs) {
    emailjs.init(EMAILJS_USER);
  } else {
    console.warn('EmailJS not available.');
  }
})();

// ---------- Notification helpers ----------
function shouldNotify() {
  try {
    const t = localStorage.getItem('pp_lastNotify');
    if (!t) return true;
    return (Date.now() - Number(t)) > NOTIFY_THROTTLE_MIN * 60 * 1000;
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
    .then(() => {
      console.log('Visit notification sent.');
      setNotified();
    })
    .catch(err => console.error('EmailJS error', err));
}

// ---------- Clock & Countdown ----------
function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleString();
  }
  tick();
  setInterval(tick, 1000);
}

function startCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = new Date(EVENT_DATE).getTime();
  if (isNaN(target)) { el.textContent = ''; return; }

  function update() {
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) {
      el.textContent = 'Exhibition is live.';
      clearInterval(intervalId);
      return;
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const m = Math.floor((diff % (1000*60*60)) / (1000*60));
    const s = Math.floor((diff % (1000*60)) / 1000);
    el.textContent = `Next show in ${d}d ${h}h ${m}m ${s}s`;
  }

  update();
  const intervalId = setInterval(update, 1000);
}

// ---------- Init ----------
window.addEventListener('DOMContentLoaded', () => {
  startClock();
  startCountdown();
  // small delay so EmailJS finishes init
  setTimeout(sendVisitNotification, 800);
});
