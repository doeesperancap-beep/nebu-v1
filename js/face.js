/* ============================================================
   face.js — rosto, expressões, sensores, toque, tédio
   ============================================================ */

/* ---------- Rosto ---------- */
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
  eyes.style.transform =
    `translate(${(x / innerWidth - .5) * 60}px, ${(y / innerHeight - .5) * 34}px)`;
}
function resetLook() { eyes.style.transform = ''; }

/* ---------- Visual da Boutique ---------- */
function aplicarVisual() {
  document.querySelectorAll('.acessorio-nebo').forEach(e => e.remove());
  const eq = S.equipado || {};

  // Acessório de cabeça
  if (eq.cabeca) {
    const el = document.createElement('div');
    el.className = 'acessorio-nebo';
    el.textContent = eq.cabeca;
    el.style.cssText = `
      position: absolute; top: -20px; right: -30px;
      font-size: calc(var(--ew) * 0.5);
      z-index: 10; pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));
    `;
    $('face').appendChild(el);
  }

  // Óculos
  if (eq.oculos) {
    const el = document.createElement('div');
    el.className = 'acessorio-nebo';
    el.textContent = eq.oculos;
    el.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: calc(var(--ew) * 1.8);
      z-index: 11; pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));
    `;
    $('eyes').appendChild(el);
  }

  // Cor dos olhos
  const corOlho = eq.olhos && BOUTIQUE.olhos[eq.olhos]?.cor;
  document.documentElement.style.setProperty('--eye', corOlho || '#f7d9e4');

  // Fundo da tela
  if (eq.fundo) {
    const cor = BOUTIQUE.fundo[eq.fundo]?.cor;
    if (cor) {
      document.body.style.background = cor;
      if (eq.fundo === '🌌' || eq.fundo === '🌠' || eq.fundo === '🌉') {
        document.body.style.background =
          `${cor} radial-gradient(circle at 30% 30%, #ffffff22 0 1px, transparent 2px), ` +
          `radial-gradient(circle at 70% 60%, #ffffff22 0 1px, transparent 2px), ` +
          `radial-gradient(circle at 50% 80%, #ffffff22 0 1px, transparent 2px), ${cor}`;
        document.body.style.backgroundSize = '200px 200px, 300px 300px, 150px 150px, auto';
      }
    }
  } else {
    document.body.style.background = '#000';
    document.body.style.backgroundImage = 'none';
  }
}

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

/* ---------- Sensores ---------- */
let gotO = 0, gotM = 0, batOK = 0, permAsked = 0;

async function askPerm() {
  if (permAsked) return;
  permAsked = 1;
  try {
    for (const C of [window.DeviceMotionEvent, window.DeviceOrientationEvent])
      if (C?.requestPermission) await C.requestPermission();
  } catch {}
}

function startSensors() {
  addEventListener('deviceorientation', onOri);
  addEventListener('devicemotion', onMot);
  startBattery();
}

let lastG = null, lastD = 0, sw = 0, swT = 0, swCool = 0, cool = 0;

function onOri(e) {
  if (e.beta == null) return;
  gotO = 1;
  const t = Date.now();

  // Balançar de lado = ninar
  if (t - swT > 5000) { swT = t; sw = 0; }
  if (lastG != null) {
    const d = (e.gamma || 0) - lastG;
    if (Math.abs(d) > 1.5 && d * lastD < 0 && Math.abs(e.gamma) < 25) sw++;
    if (Math.abs(d) > 1.5) lastD = d;
  }
  lastG = e.gamma || 0;
  if (sw >= 6 && t > swCool) {
    swCool = t + 9000; sw = 0;
    set('sleepy', 5000, 'Zzz... 😴');
    S.energia = clamp(S.energia + 6); save();
  }

  // Olhos seguem a inclinação
  const g = clamp(e.gamma || 0, -45, 45) / 45;
  const b = clamp((e.beta || 0) - 55, -40, 40) / 40;
  if (!['scared', 'dizzy'].includes(mood))
    eyes.style.transform = `translate(${g * 30}px, ${b * 18}px)`;

  if (t < cool) return;
  if (e.beta < 15) {
    cool = t + 5000;
    set('sleepy', 3500, 'Aaaah... 🥱');
    S.energia = clamp(S.energia + 3); save();
  } else if (e.beta > 115) {
    cool = t + 4000;
    set('scared', 2500, 'Aaah, vou cair! 😨');
  }
}

let free = 0;
let shakes = 0, lastShake = 0, ultimaSacudida = 0;
let walkingPeaks = [], lastPeak = 0;
let walkingCool = 0, dizzyCool = 0;

function onMot(e) {
  const ag = e.accelerationIncludingGravity;
  const t = Date.now();
  if (!ag || ag.x == null) return;

  gotM = 1;
  const G = Math.hypot(ag.x, ag.y, ag.z);

  // 1. Queda livre
  if (G < 2.5) {
    if (++free >= 4) { free = 0; set('scared', 2500, 'Aaah, tô caindo! 😱'); }
  } else free = 0;

  // 2. Chacoalhada
  const excess = Math.abs(G - 9.8);
  if (excess > 20 && t > dizzyCool) {
    if (t - lastShake > 100) {
      lastShake = t;
      shakes++;
      if (t - ultimaSacudida > 300) shakes = 0;
      ultimaSacudida = t;

      if (shakes >= 5) {
        shakes = 0;
        dizzyCool = t + 4000;
        walkingCool = t + 4000;
        walkingPeaks = [];

        SOM.melodia([N.LA, N.FA, N.RE, N.DO_BAIXO], 0.1, 'sine', 0.1);
        set('dizzy', 2500, 'Tô tonta! 😵');
        setTimeout(() => {
          if (S.humor >= 50) {
            SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sawtooth', 0.1);
            set('angry', 2500, 'Para! 😠');
          } else {
            set('cry', 3000, 'Buáá... 😢');
          }
        }, 2600);
      }
    }
  }

  // 3. Caminhada
  if (t > walkingCool && G > 13 && G < 22) {
    const interval = t - lastPeak;
    if (interval > 250 && interval < 700) {
      lastPeak = t;
      walkingPeaks.push(t);
      walkingPeaks = walkingPeaks.filter(x => t - x < 3500);
      if (walkingPeaks.length >= 5) {
        walkingPeaks = [];
        walkingCool = t + 8000;
        wig();
        set('curious', 3000, 'Vamos passear? 🚶');
      }
    }
  }
}

function startBattery() {
  if (!navigator.getBattery) return;
  navigator.getBattery().then(b => {
    batOK = 1;
    let warned = false;
    const check = () => {
      if (b.level < .2 && !b.charging && !warned) {
        warned = true; say('Estou ficando sem energia...');
      }
    };
    check();
    b.addEventListener('levelchange', check);
  }).catch(() => {});
}

addEventListener('offline', () => set('sad', 4000, 'Sem internet... 📵'));
addEventListener('online',  () => set('happy', 2500, 'Voltou a internet! 📶'));

/* ---------- Toque ---------- */
const ptrs = new Map();
let sx = null, sy = null, moved = 0, petD = 0, rev = 0, lastDx = 0;
let lastX = 0, lastY = 0, pinch0 = 0, multi = 0, pinched = 0, tMulti = 0;
let hold, taps = [], lastAct = Date.now(), stage = 0, tickleCool = 0;

const dist = () => {
  const p = [...ptrs.values()];
  return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
};
const act = () => { lastAct = Date.now(); stage = 0; };

function pet(m, t) {
  if (mood !== m) set(m, 1300, t);
  else {
    until = Date.now() + 1300;
    clearTimeout(mt);
    mt = setTimeout(() => set(baseMood(), 0), 1300);
  }
}

addEventListener('pointerdown', e => {
  act();
  if (gOn) return;
  if (!permAsked) { permAsked = 1; askPerm().then(startSensors); }
  if (e.target.closest('button,#estado,#panel')) return;

  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) {
    sx = lastX = e.clientX;
    sy = lastY = e.clientY;
    moved = 0; petD = 0; rev = 0; multi = 0; pinched = 0;
    hold = setTimeout(() => {
      if (!moved) {
        const dx = (sx < innerWidth / 2 ? 1 : -1) * 40;
        eyes.style.transform = `translate(${dx}px, 0)`;
        set('scared', 1800, 'Me solta! 😖');
      }
    }, 700);
  } else {
    clearTimeout(hold);
    multi = 1; tMulti = Date.now(); pinch0 = dist();
  }
});

addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return;
  act();
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (ptrs.size === 2) {
    const d = dist();
    if (Math.abs(d - pinch0) > 40) {
      pinched = 1;
      set('scared', 1800, 'Ai! 😨');
      pinch0 = d;
    }
    return;
  }
  if (sx == null || multi) return;

  if (Math.hypot(e.clientX - sx, e.clientY - sy) > 12) {
    moved = 1;
    clearTimeout(hold);
    look(e.clientX, e.clientY);
  }

  if (moved) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    petD += Math.hypot(dx, dy);
    if (dx * lastDx < 0 && Math.abs(dx) > 3) rev++;
    if (Math.abs(dx) > 3) lastDx = dx;
    lastX = e.clientX; lastY = e.clientY;

    if (rev >= 10 && Date.now() > tickleCool) {
      rev = 0; wig();
      tickleCool = Date.now() + 2500;
      pet('tickle', 'Hahaha, cócegas! 🤣');
      S.humor = clamp(S.humor + 4);
      SOM.melodia([N.DO, N.MI, N.SOL], 0.06, 'sine', 0.08);
    } else if (petD > 700 * pm('thr') && rev < 3 && Date.now() > tickleCool) {
      pet('carinho', 'Ronrom... 😍');
      heart(e.clientX, e.clientY);
    } else if (petD > 120 * thrPet() && rev < 3 && Date.now() > tickleCool) {
      SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.08);
      pet('happy', '');
      heart(e.clientX, e.clientY);
      S.bond = (S.bond || 0) + 1;
      S.humor = clamp(S.humor + 5 * pm('pet'));
    }
  }
});

function up(e) {
  clearTimeout(hold);
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);

  if (multi) {
    if (ptrs.size === 0) {
      if (!pinched && Date.now() - tMulti < 450) {
        set('sleepy', 4000, 'Zzz... 😴');
        S.energia = clamp(S.energia + 8);
      }
      multi = 0; sx = null; resetLook();
    }
    return;
  }

  if (sx == null) return;
  const was = moved;
  sx = null; resetLook();
  if (was) return;

  const t = Date.now();
  taps = taps.filter(x => t - x < 1100);
  taps.push(t);
  const n = taps.length;

  if (n >= (S.pers === 'temperamental' ? 2 : 3)) {
    set('angry', 2500, 'Para! 😠');
    S.humor = clamp(S.humor - 3 * pm('irr'));
    taps = []; return;
  }
  if (n === 2) { set('curious', 2200, '?'); return; }
  set('happy', 1600, '');
}

addEventListener('pointerup', up);
addEventListener('pointercancel', up);

/* ---------- Tédio automático ---------- */
setInterval(() => {
  const s = (Date.now() - lastAct) / 1000;
  if (s > 40 * pm('bored') && stage < 1) { stage = 1; set('curious', 9000, '👀'); }
  if (s > 60 * pm('bored') && stage < 2) {
    stage = 2;
    if (S.pers === 'tranquila') set('sleepy', 6000, 'Zzz... 😴');
    else {
      set(S.pers === 'carinhosa' ? 'sad' : 'bored', 5000,
          S.pers === 'carinhosa' ? 'Me faz carinho? 🥰' : 'Tô entediada... 🥱');
      S.humor = clamp(S.humor - 2);
    }
  }
  if (s > 120 && stage < 3) { stage = 3; wig(); }
}, 1000);

setInterval(() => {
  if (Date.now() - lastAct < 20000 || mood !== baseMood()) return;
  if (S.pers === 'curiosa') set('curious', 4000, '👀');
  else if (S.pers === 'brincalhona') { wig(); set('happy', 2000, 'Hihi 😄'); }
}, 25000);
