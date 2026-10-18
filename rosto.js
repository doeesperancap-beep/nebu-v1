/* ============ 4. ROSTO ============ */
const bubble = $('bubble');
const acc = $('acc');
let mood = 'neutral', mt, bt, until = 0;

const VIB = {
  carinho: [40,60,40,60,40], angry: [220], scared: [60,40,60],
  dizzy: [100,50,100,50,100], cry: [80,60,80], happy: [25],
  tickle: [30,30,30,30,30]
};
const PR = {
  neutral: 0, dance: 3, bored: 1, sick: 1, sleepy: 1, sad: 1,
  happy: 1, curious: 2, carinho: 2, tickle: 2, surprised: 2,
  scared: 3, angry: 3, dizzy: 3, cry: 3
};

function say(t, ms = 2600) {
  if (!t) return;
  bubble.textContent = t;
  bubble.classList.add('on');
  clearTimeout(bt);
  bt = setTimeout(() => bubble.classList.remove('on'), ms);
}

function set(m, ms = 2200, t) {
  if (ms && Date.now() < until && PR[m] < PR[mood]) return;
  if (ms) { until = Date.now() + ms; if (VIB[m]) vib(VIB[m]); }
  clearTimeout(mt);
  mood = m;
  body.dataset.m = m;
  eyeEls.forEach(e => e.textContent = m === 'carinho' ? '❤️' : '');
  if (t) say(t);
  if (ms && m !== baseMood()) mt = setTimeout(() => set(baseMood(), 0), ms);
}

function wig() {
  eyes.classList.add('wig');
  setTimeout(() => eyes.classList.remove('wig'), 1200);
}

function heart(x, y) {
  const h = document.createElement('div');
  h.className = 'heart'; h.textContent = '💗';
  h.style.left = (x - 10) + 'px';
  h.style.top = (y - 10) + 'px';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 1200);
}

function look(x, y) {
  eyes.style.transform = `translate(${(x / innerWidth - .5) * 60}px, ${(y / innerHeight - .5) * 34}px)`;
}
function resetLook() { eyes.style.transform = ''; }

set(baseMood(), 0);

/* Piscar */
(function blink() {
  const allow = ['neutral', 'happy', 'sad', 'curious'].includes(mood);
  if (allow) {
    eyeEls.forEach(e => e.style.setProperty('--blink', .08));
    setTimeout(() => eyeEls.forEach(e => e.style.setProperty('--blink', 1)), 130);
  }
  setTimeout(blink, 2200 + Math.random() * 3000);
})();
