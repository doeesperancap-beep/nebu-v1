/* ============================================================
   NÉBULA — game.js
   Seções:
     1. Utilidades
     2. Estado (S) + save/load
     3. Personalidade
     4. Rosto / expressões
     5. Sensores (movimento, bateria)
     6. Toque (pet, tap, cócegas)
     7. Tédio automático
     8. Comida
     9. Doença / xarope
    10. Minigames (cesta, borboletas, banho, dança)
    11. Mundo / lugares
    12. UI (botões, painéis)
    13. Loop principal + visibilitychange
   ============================================================ */

/* ============ 1. UTILIDADES ============ */
const $ = id => document.getElementById(id);
const body = document.body;
const eyes = $('eyes');
const eyeEls = [...document.querySelectorAll('.eye')];
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const vib = p => { try { navigator.vibrate?.(p); } catch {} };

/* ============ 1.5 SISTEMA DE SOM ============ */
const SOM = (() => {
  let ctx = null;
  let ligado = true;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { ligado = false; }
  }

  function nota(freq, dur = 0.12, tipo = 'sine', vol = 0.12) {
    if (!ligado) return;
    init();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tipo;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  function melodia(notas, dur = 0.1, tipo = 'sine', vol = 0.12) {
    if (!ligado) return;
    notas.forEach((f, i) => {
      setTimeout(() => nota(f, dur, tipo, vol), i * dur * 1000);
    });
  }

  function ligar(v) { ligado = v; }
  function estaLigado() { return ligado; }
  function destravar() {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  return { nota, melodia, ligar, estaLigado, destravar };
})();

/* Notas musicais */
const N = {
  DO: 523.25, RE: 587.33, MI: 659.25, FA: 698.46,
  SOL: 783.99, LA: 880.00, SI: 987.77, DO2: 1046.50,
  DO_BAIXO: 261.63, MI_BAIXO: 329.63, SOL_BAIXO: 392.00
};

/* Destrava áudio no primeiro toque (iOS/Chrome) */
addEventListener('pointerdown', () => SOM.destravar(), { once: true });

/* ============ 2. ESTADO ============ */
const SAVE_KEY = 'nebula-v2';
const DEFAULT = {
  nome: null,
  id: null,
  moedas: 0,
  energia: 100, fome: 100, saude: 100, humor: 100,
  bond: 0, pers: null, sick: 0, greet: '',
  food: {}, pref: null, dis: null,
  places: {}, mem: [], lastDance: null,
  last: Date.now()
};
/* ============ GERADOR DE ID ÚNICO ============ */
function gerarID(nome) {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codigo = Array.from({ length: 4 }, () =>
    letras[Math.floor(Math.random() * letras.length)]
  ).join('');
  const nomeLimpo = (nome || 'NEBO')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6) || 'NEBO';
  return `NB-${nomeLimpo}-${codigo}`;
}

let S = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return raw ? { ...DEFAULT, ...raw } : { ...DEFAULT };
  } catch { return { ...DEFAULT }; }
})();

/* Quanto tempo ficou offline (minutos) — calculado UMA vez */
const awayAtBoot = Math.max(0, (Date.now() - S.last) / 60000);

function save() {
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {}
}
/* ============ SISTEMA DE MOEDAS ============ */
function ganharMoedas(qtd) {
  if (!qtd) return;
  S.moedas = (S.moedas || 0) + qtd;
  save();
  mostrarMoedas(qtd);
}

function mostrarMoedas(qtd) {
  const toast = document.createElement('div');
  toast.textContent = `🪙 +${qtd}`;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #f7d9e4;
    color: #1b1824;
    padding: 10px 20px;
    border-radius: 22px;
    font-size: 18px;
    font-weight: bold;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 4px 20px rgba(247,217,228,.5);
    animation: moedaSobe 1.6s ease-out forwards;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

function decay(min, mul = 1) {
  if (!Number.isFinite(min) || min <= 0) return;
  S.energia = clamp(S.energia - .4 * min * mul);
  S.fome    = clamp(S.fome    - .5 * min * mul);
  const extra = (S.fome < 30 || S.energia < 30) ? .3 : 0;
  S.humor  = clamp(S.humor - (.3 + extra + (S.sick > Date.now() ? .3 : 0)) * min);
  S.saude  = clamp(S.saude + ((S.fome < 20 || S.energia < 20) ? -.5 : .3) * min);
}

function offline(min) {
  min = Math.min(min, 480);
  decay(min * .4);
  if (min > 240) S.energia = Math.max(S.energia, 60);
  ['energia', 'fome', 'saude', 'humor'].forEach(k => S[k] = Math.max(S[k], 20));
}

/* Aplica o tempo que ficou offline (roda uma vez ao abrir) */
offline(awayAtBoot);
S.last = Date.now();

const isNight = () => { const h = new Date().getHours(); return h >= 22 || h < 6; };
const baseMood = () =>
  S.sick > Date.now() ? 'sick' :
  (isNight() || S.energia < 20) ? 'sleepy' :
  (S.humor < 25 || S.fome < 20) ? 'sad' : 'neutral';

/* ============ 3. PERSONALIDADE ============ */
const PM = {
  carinhosa:     { pet: 1.6, thr: .6 },
  curiosa:       { bored: .6 },
  tranquila:     { decay: .7, bored: 1.6 },
  brincalhona:   { play: 1.5, bored: .7 },
  temperamental: { irr: 2 },
  reservada:     { pet: .6 }
};
const pm = (k, d = 1) => (PM[S.pers] || {})[k] ?? d;
const thrPet = () => pm('thr') * (S.pers === 'reservada'
  ? Math.max(1, 2.5 - (S.bond || 0) * .15) : 1);

const PERS = [
  '🥰 carinhosa', '🧐 curiosa', '😴 tranquila',
  '😂 brincalhona', '😤 temperamental', '😶 reservada'
];

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
  eyes.style.transform =
    `translate(${(x / innerWidth - .5) * 60}px, ${(y / innerHeight - .5) * 34}px)`;
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

/* ============ 5. SENSORES ============ */
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
/* ---------- DETECÇÃO DE MOVIMENTO ---------- */
let free = 0;                    // contador de queda livre
let shakes = 0, lastShake = 0;   // contador de chacoalhada
let ultimaSacudida = 0;
let walkingPeaks = [], lastPeak = 0;
let walkingCool = 0, dizzyCool = 0;

function onMot(e) {
  const ag = e.accelerationIncludingGravity;
  const t = Date.now();

  // 1. QUEDA LIVRE
  if (ag && ag.x != null) {
    gotM = 1;
    const G = Math.hypot(ag.x, ag.y, ag.z);
    if (G < 2.5) {
      if (++free >= 4) { free = 0; set('scared', 2500, 'Aaah, tô caindo! 😱'); }
    } else free = 0;
  }

  // 2. CHACOALHADA (com reset por tempo, não por decremento)
  if (ag && ag.x != null) {
    const G = Math.hypot(ag.x, ag.y, ag.z);
    const excess = Math.abs(G - 9.8);

    if (excess > 20 && t > dizzyCool) {
      if (t - lastShake > 100) {
        lastShake = t;
        shakes++;

        // Se passou muito tempo desde a última sacudida, zera
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
  }

  // 3. CAMINHADA
  if (ag && ag.x != null && t > walkingCool) {
    const G = Math.hypot(ag.x, ag.y, ag.z);
    if (G > 13 && G < 22) {
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

/* ============ 6. TOQUE ============ */
const ptrs = new Map();
let sx = null, sy = null, moved = 0, petD = 0, rev = 0, lastDx = 0;
let lastX = 0, lastY = 0, pinch0 = 0, multi = 0, pinched = 0, tMulti = 0;
let hold, taps = [], lastAct = Date.now(), stage = 0;

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

    if (rev >= 12) {
      rev = 0; wig();
      pet('tickle', 'Hahaha, cócegas! 🤣');
      S.humor = clamp(S.humor + 4);
    } else if (petD > 700 * pm('thr')) {
      pet('carinho', 'Ronrom... 😍');
      heart(e.clientX, e.clientY);
    } else if (petD > 120 * thrPet()) {
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

/* ============ 7. TÉDIO AUTOMÁTICO ============ */
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

/* ============ 8. COMIDA ============ */
const FOODS = ['🍎', '🍓', '🥒', '🍌'];
let lastTray = 0;

function prefs() {
  const c = Object.keys(S.food || {}).filter(k => S.food[k] > 2);
  if (!S.pref || Date.now() > S.pref.until)
    S.pref = c.length ? { f: rnd(c), until: Date.now() + 6048e5 } : null;
  if (!S.dis || (S.pref && S.dis === S.pref.f))
    S.dis = rnd(FOODS.filter(x => !S.pref || x !== S.pref.f));
}

function eat(f) {
  P.classList.remove('on');
  S.food = S.food || {};
  S.food[f] = (S.food[f] || 0) + 1;
  prefs();
  const full = S.fome > 85;
  S.fome = clamp(S.fome + (f === S.dis ? 10 : 25) * (full ? .4 : 1));
  if (S.pref && f === S.pref.f) {
    S.humor = clamp(S.humor + 8);
    set('happy', 2500, 'Adoro! ' + f); wig();
  } else if (f === S.dis) {
    S.humor = clamp(S.humor - 2);
    set('sad', 2000, 'Eca... 🤢');
  } else {
    S.humor = clamp(S.humor + 2);
    set('happy', 2000, 'Nham! ' + f);
  }
     SOM.melodia([N.MI, N.SOL], 0.1, 'triangle', 0.1);
  save();
}

function foodTray() {
  panel('<h3>🍽️ Comida</h3>' +
    FOODS.map(f => `<button data-f="${f}">${f}</button>`).join(''));
}

/* ============ 9. DOENÇA / XAROPE ============ */
function sickTick() {
  const n = Date.now();
  if (S.sick && S.sick <= n) {
    S.sick = 0;
    say('Passou! 😊'); set('happy', 2500);
  } else if (!S.sick && !gOn && Math.random() < .0006) {
    S.sick = n + 4 * 60000;
    say('Atchim! 🤧 🌡️ 37,8'); set('sick', 0);
  }
  $('bXarope').style.display = S.sick > n ? '' : 'none';
}

function foodTick() {
  const n = Date.now();
  if (S.fome < 40 && n - lastTray > 300000 && !gOn &&
      !P.classList.contains('on') && S.pers) {
    lastTray = n;
    say('Tô com fome... 🍽️'); foodTray();
  }
}

function xarope() {
  P.classList.remove('on');
  S.sick = 0;
  S.saude = clamp(S.saude + 20);
  set('sleepy', 3000, 'Glug... zzz 😴');
  setTimeout(() => set('happy', 2500, 'Melhorei! 😊'), 3200);
  $('bXarope').style.display = 'none';
  save();
}

/* ============ 10. MINIGAMES ============ */
let gOn = 0, gx = .5;

function startGame() {
  P.classList.remove('on');
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8;background:#000d';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  let fr = [], score = 0, t0 = Date.now(), last = t0;
  gOn = 1;
  c.onpointermove = e => gx = e.clientX / innerWidth;

  const iv = setInterval(() => {
    const n = Date.now(), dt = (n - last) / 1000; last = n;
    x.clearRect(0, 0, c.width, c.height);
    if (Math.random() < .05)
      fr.push({ x: Math.random(), y: 0, e: Math.random() < .06 ? '🍰' : rnd(['🍎', '🍓', '🍌']) });
    x.font = '34px serif'; x.textAlign = 'center';
    fr.forEach(f => { f.y += dt * (f.e === '🍰' ? 330 : 220); x.fillText(f.e, f.x * c.width, f.y); });
    const by = c.height - 90, bx = gx * c.width;
    x.fillText('🧺', bx, by + 20);
    fr = fr.filter(f => {
      if (f.y > by - 10 && f.y < by + 30 && Math.abs(f.x * c.width - bx) < 45) {
        score += f.e === '🍰' ? 5 : 1;
        if (f.e === '🍰') { say('Docinho! 🍰✨'); vib([40, 30, 80]); }
        return false;
      }
      return f.y < c.height;
    });
    x.font = '20px sans-serif'; x.fillStyle = '#fff';
    x.fillText('🍎 ' + score + '   ⏱ ' + Math.max(0, 20 - Math.round((n - t0) / 1000)), c.width / 2, 50);
    if (n - t0 > 20000) {
      clearInterval(iv); c.remove(); gOn = 0;
      S.humor = clamp(S.humor + Math.min(25, score * 3 * pm('play')));
      S.energia = clamp(S.energia - 4);
      say('Fez ' + score + ' pontos! 🏆');
      if (score >= 10) startDance(7);
      else { set('happy', 3500); wig(); }
      save();
    }
  }, 33);
}

function startButterflies() {
  P.classList.remove('on');
  gOn = 1;
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8;background:#000a';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  let bf = [], fx = [], score = 0, t0 = Date.now(), last = t0, sp = 0;

  c.onpointerdown = e => {
    const i = bf.findIndex(b => Math.hypot(b.x - e.clientX, b.y - e.clientY) < 55);
    if (i >= 0) { fx.push({ x: bf[i].x, y: bf[i].y, t: 0 }); bf.splice(i, 1); score++; vib(20); }
  };

  const iv = setInterval(() => {
    const n = Date.now(), dt = (n - last) / 1000; last = n; sp -= dt;
    if (sp <= 0 && bf.length < 6) {
      sp = .7 + Math.random() * .6;
      const ty = rnd(['lenta', 'rapida', 'zig', 'curva', 'breve']), L = Math.random() < .5;
      bf.push({
        x: L ? -20 : c.width + 20,
        y: 60 + Math.random() * (c.height - 200),
        vx: (L ? 1 : -1) * ({ lenta: 45, rapida: 130 }[ty] || 80),
        vy: 0, ty, t: 0, life: ty === 'breve' ? 2.6 : 99
      });
    }
    x.clearRect(0, 0, c.width, c.height);
    x.textAlign = 'center'; x.font = '42px serif';
    bf = bf.filter(b => {
      b.t += dt;
      if (b.ty === 'zig' && Math.random() < dt * 1.8) b.vy = (Math.random() - .5) * 160;
      if (b.ty === 'curva') b.vy = Math.sin(b.t * 3) * 90;
      b.x += b.vx * dt;
      b.y = Math.max(40, Math.min(c.height - 100, b.y + b.vy * dt));
      x.fillText('🦋', b.x, b.y);
      return b.t < b.life && b.x > -40 && b.x < c.width + 40;
    });
    fx = fx.filter(f => {
      f.t += dt;
      x.globalAlpha = Math.max(0, 1 - f.t * 2.5);
      x.fillText('✨', f.x, f.y - f.t * 40);
      x.globalAlpha = 1;
      return f.t < .4;
    });
    x.font = '20px sans-serif'; x.fillStyle = '#fff';
    x.fillText('🦋 ' + score + '   ⏱ ' + Math.max(0, 25 - Math.round((n - t0) / 1000)), c.width / 2, 50);
    if (n - t0 > 25000) {
      clearInterval(iv); c.remove(); gOn = 0;
      S.humor = clamp(S.humor + Math.min(25, score * 3 * pm('play')));
      S.energia = clamp(S.energia - 4);
            SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.1);
            say('Capturou ' + score + ' 🦋✨');
      if (score >= 8) startDance(6); else set('happy', 3000);
      save();
    }
  }, 33);
}

function startBath() {
  P.classList.remove('on');
  gOn = 1;
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8';
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;z-index:9;left:0;right:0;bottom:24px;text-align:center';
  const b = document.createElement('button');
  b.style.cssText = 'background:#ffffff26;color:#fff;border:0;border-radius:22px;padding:12px 22px;font-size:17px';
  b.textContent = '🧼 Pegar o sabonete';
  bar.appendChild(b);
  document.body.append(c, bar);
  const x = c.getContext('2d');
  let step = 0, foam = [], down = 0;
  say('Hora do banho! 🛁');

  const draw = () => {
    x.clearRect(0, 0, c.width, c.height);
    foam.forEach(f => {
      x.beginPath(); x.arc(f.x, f.y, f.r, 0, 7);
      x.fillStyle = 'rgba(255,255,255,.78)'; x.fill();
    });
  };

  b.onclick = () => {
    if (step === 0) { step = 1; b.style.display = 'none'; say('Arraste o dedo para esfregar 🫧'); }
    else if (step === 2) { step = 3; b.style.display = 'none'; say('Agora enxágue arrastando 🚿'); }
  };
  c.onpointerdown = () => down = 1;
  c.onpointerup = c.onpointercancel = () => down = 0;
  c.onpointermove = e => {
    if (!down || step < 1 || step === 2) return;
    const px = e.clientX, py = e.clientY;
    if (step === 1) {
      foam.push({ x: px + Math.random() * 30 - 15, y: py + Math.random() * 30 - 15, r: 14 + Math.random() * 16 });
      set('sleepy', 1500, foam.length === 1 ? 'Aaah, que gostoso... 😌' : '');
      if (foam.length >= 70) { step = 2; b.textContent = '🚿 Enxaguar'; b.style.display = ''; }
    } else if (step === 3) {
      foam = foam.filter(f => Math.hypot(f.x - px, f.y - py) > 55);
      if (!foam.length) {
        c.remove(); bar.remove(); gOn = 0;
        S.humor = clamp(S.humor + 8);
        S.saude = clamp(S.saude + 3);
        say('Limpinha! ✨');
        startDance(6);
        setTimeout(() => set('carinho', 2500, '🥰'), 6200);
        save();
        return;
      }
    }
    draw();
  };
}

/* --- Dança --- */
const STY = {
  festa:      ['🪩', 'hop .35s', 'top:-50%;left:50%;transform:translateX(-50%)', 'Festa! 🪩'],
  fofa:       ['🎀', 'sway 1.3s', 'top:-42%;right:6%', 'Dancinha fofa 🥰'],
  estrela:    ['🕶️', 'posea 1.8s', 'top:-2%;left:50%;transform:translateX(-50%);font-size:calc(var(--ew)*2)', 'Show! 😎'],
  chocalho:   ['🪇', 'shk .25s', 'top:25%;left:104%', 'Chocalho! 🎶'],
  maluquinha: ['🎉', 'crz 1.4s', 'top:-50%;left:50%;transform:translateX(-50%)', 'Maluquinha! 🤪'],
  calminha:   ['🌙', 'flt 3s', 'top:-45%;left:-4%', 'Calminha... 🌙']
};
const DW = {
  carinhosa:     { fofa: 5, calminha: 2 },
  tranquila:     { calminha: 6, fofa: 2 },
  brincalhona:   { maluquinha: 5, chocalho: 5, festa: 2 },
  temperamental: { estrela: 4, festa: 3 },
  reservada:     { calminha: 3, fofa: 2 }
};

function pickStyle() {
  const w = Object.assign({ festa: 1, fofa: 1, estrela: 1, chocalho: 1, maluquinha: 1, calminha: 1 }, DW[S.pers] || {});
  let pool = [];
  for (const k in w) for (let i = 0; i < w[k]; i++) pool.push(k);
  if (S.pers === 'curiosa') pool = pool.filter(k => k !== S.lastDance);
  const k = rnd(pool);
  S.lastDance = k;
  return k;
}

let dancing = 0;
function startDance(sec = 10) {
  if (dancing || gOn) return;
  dancing = 1;
  const k = pickStyle();
  const st = STY[k];
  const first = S.pers === 'reservada' ? STY.calminha : st;

  const apply = x => {
    eyes.style.transform = '';
    eyes.style.animation = x[1] + ' ease-in-out infinite';
    acc.textContent = x[0];
    acc.style.cssText = 'display:block;position:absolute;pointer-events:none;font-size:calc(var(--ew)*.55);font-style:normal;' + x[2];
  };

  set('dance', sec * 1000, st[3]);
  vib(Array(sec).fill(60).flatMap(v => [v, 140]));
  apply(first);
  if (first !== st) setTimeout(() => apply(st), 4000);

  setTimeout(() => {
    eyes.style.animation = '';
    acc.style.display = 'none';
    dancing = 0;
    S.humor = clamp(S.humor + 3);
    if (S.pers === 'temperamental') set('angry', 1500, 'Ta-dá! 😤');
    save();
  }, sec * 1000);
}

function joyTick() {
  if (S.humor >= 99 && mood === 'neutral' && !gOn && Math.random() < .01) startDance(5);
}

/* ============ 11. MUNDO ============ */
const PL = { '🌳 Praça': 'praca', '🌱 Jardim': 'jardim', '🎪 Eventos': 'eventos' };

function mundo() {
  if (S.sick > Date.now()) { say('Tô gripada... 🤧'); return; }
  panel('<h3>✨ Nébula City</h3>' +
    Object.keys(PL).map(k => `<button data-p="${PL[k]}">${k}</button>`).join('') +
    `<div style="font-size:14px;opacity:.7">Descobertas: ${(S.mem || []).join(' ') || 'nada ainda'}</div>`);
}

function visit(p) {
  P.classList.remove('on');
  S.places = S.places || {};
  S.mem = (S.mem || []).slice(-11);
  if (!S.places[p]) { S.places[p] = 1; set('curious', 4500, 'Que lugar novo! 👀'); }
  else set('happy', 2000, 'Conheço aqui!');

  const it = Math.random() < (S.pers === 'curiosa' ? .4 : .2) ? '🎁' : rnd(['🌱', '🪨', '✨', '🛸']);

  setTimeout(() => {
    if (it === '🎁') {
      const g = rnd(['💎', '🧸', '🌟']);
      S.mem.push(g);
      S.humor = clamp(S.humor + 6);
      set('surprised', 1300, '!?');
      setTimeout(() => { say('Um presente! ' + g); startDance(6); }, 1400);
    } else {
      S.mem.push(it);
      say('Achei ' + it);
      if (Math.random() < .25) startDance(5);
    }
    save();
  }, 2500);
}

/* ============ 12. UI ============ */
const P = $('panel');

function panel(h) {
  P.innerHTML = h + '<button data-x="close">Fechar</button>';
  P.classList.add('on');
}

P.onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;
  if (d.x === 'close') P.classList.remove('on');
  else if (d.x === 'food') foodTray();
  else if (d.x === 'bath') startBath();
  else if (d.x === 'xarope') xarope();
  else if (d.f) eat(d.f);
  else if (d.p) visit(d.p);
  else if (d.pers) choose(d.pers);
  else if (d.g === 'f') startGame();
  else if (d.g === 'b') startButterflies();
  else if (d.x === 'dance') { P.classList.remove('on'); startDance(10); }
};
/* ============ BOAS-VINDAS ============ */
function welcomePanel() {
  P.innerHTML = `
    <h3>Oi! Como você vai me chamar?</h3>
    <input id="nomeInput" type="text" maxlength="12"
           placeholder="Ex: Luna"
           style="width:100%;padding:12px;border-radius:12px;
                  border:0;font-size:17px;margin:8px 0;
                  background:#ffffff1a;color:#fff;
                  box-sizing:border-box">
    <button id="nomeOk">Pronto! ✨</button>
  `;
  P.classList.add('on');

  setTimeout(() => {
    const input = document.getElementById('nomeInput');
    const botao = document.getElementById('nomeOk');

    input.focus();
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') botao.click();
    });

    botao.onclick = () => {
      const nome = input.value.trim();
      if (!nome) {
        input.style.background = '#ff000044';
        return;
      }
      S.nome = nome;
      S.id = gerarID(nome);
      save();
      P.innerHTML = `
        <h3>Prazer, ${nome}! 💗</h3>
        <p style="opacity:.7;font-size:14px">
          Seu ID: <code>${S.id}</code>
        </p>
      `;
      setTimeout(() => {
        P.classList.remove('on');
        persPanel();
      }, 2000);
    };
  }, 100);
}

function persPanel() {
  panel('<h3>Como será a Nébula?</h3>' +
    PERS.map(p => {
      const k = p.split(' ')[1];
      return `<button data-pers="${k}">${p}</button>`;
    }).join('') +
    '<button data-pers="sorteio">🎲 Surpresa</button>');
}

function choose(k) {
  if (k === 'sorteio') k = rnd(PERS).split(' ')[1];
  S.pers = k;
  P.classList.remove('on');
  say('Eu sou ' + k + '! ✨');
  save();
}

function drawEstado() {
  const rows = [
    ['🔋', 'Energia', S.energia],
    ['🍎', 'Fome', S.fome],
    ['❤️', 'Saúde', S.saude],
    ['😊', 'Humor', S.humor]
  ];
  const nomeHtml = S.nome
    ? `<div class="st" style="font-size:14px"><b>${S.nome}</b> <span style="opacity:.5;font-size:12px">${S.id || ''}</span></div>`
    : '';
  $('estado').innerHTML =
    nomeHtml +
    rows.map(r => `<div class="st"><span>${r[0]}</span><i><b style="width:${Math.round(r[2])}%"></b></i><span>${Math.round(r[2])}%</span></div>`).join('') +
    `<div class="st" style="font-size:12px;opacity:.7">Sensores: inclinar ${gotO ? '✅' : '❌'} · mexer ${gotM ? '✅' : '❌'} · vibrar ${navigator.vibrate ? '✅' : '❌'} · bateria ${batOK ? '✅' : '❌'}</div>`;
}

$('bEstado').onclick = () => {
  drawEstado();
  $('estado').classList.add('on');
  setTimeout(() => $('estado').classList.remove('on'), 4500);
};
$('estado').onclick = () => $('estado').classList.remove('on');
$('bCuidar').onclick = () => panel(
  '<h3>🧸 Cuidar</h3><button data-x="food">🍎 Comida</button><button data-x="bath">🛁 Banho</button>' +
  (S.sick > Date.now() ? '<button data-x="xarope">💊 Xarope</button>' : '')
);
$('bBrincar').onclick = () => panel(
  '<h3>🎮 Brincar</h3><button data-g="f">🍎 Cesta de Frutas</button><button data-g="b">🦋 Borboletas</button><button data-x="dance">💃 Dançar</button>'
);
$('bMundo').onclick = mundo;
$('bXarope').onclick = xarope;

/* ============ 13. LOOP PRINCIPAL ============ */
prefs();
if (!S.nome) setTimeout(welcomePanel, 400);
else if (!S.pers) setTimeout(persPanel, 800);

/* Saudação inicial */
(() => {
  const d = new Date(), h = d.getHours(), k = d.toDateString();
  if (awayAtBoot > (S.pers === 'carinhosa' ? 60 : 180)) say('Que saudade! 💗');
  else if (S.greet !== k && h >= 6 && h < 12) { S.greet = k; say('Bom dia! ☀️'); }
  else if (isNight()) say('Boa noite... 😴');
  if (!navigator.onLine) say('Sem internet... 📵');
})();

setInterval(() => {
  decay(5 / 60);
  sickTick();
  foodTick();
  joyTick();
  save();
  if (['neutral', 'sleepy', 'sad', 'sick', 'bored'].includes(mood))
    set(baseMood(), 0);
}, 5000);

/* Pausa quando a aba fica escondida */
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenAt = Date.now();
  } else {
    if (hiddenAt) {
      const m = (Date.now() - hiddenAt) / 60000;
      offline(m);
      S.last = Date.now();
      save();
      set(baseMood(), 0);
      hiddenAt = 0;
    }
  }
});
/* ============ AVISO DE ATUALIZAÇÃO ============ */
(function checkVersion() {
  const VERSAO_KEY = 'nebula-versao-vista';

  // Lê a versão que o index.html declara
  const metaTag = document.querySelector('meta[name="version"]');
  const versaoNova = Number(metaTag?.content || 1);

  // Lê a versão que esse celular já viu
  const versaoVista = Number(localStorage.getItem(VERSAO_KEY) || 0);

  // Se o celular já viu alguma versão E ela é mais antiga que a nova...
  if (versaoVista && versaoVista < versaoNova) {
    mostrarAviso(versaoNova, VERSAO_KEY);
  } else {
    // Primeira vez — só salva
    localStorage.setItem(VERSAO_KEY, versaoNova);
  }
})();

function mostrarAviso(nova, key) {
  const aviso = document.createElement('div');
  aviso.id = 'aviso-atualizacao';
  aviso.textContent = '✨ Nébula atualizada! Toque para recarregar';
  aviso.onclick = () => {
    localStorage.setItem(key, nova);
    // Force reload, ignorando cache
    location.reload(true);
  };
  document.body.appendChild(aviso);
}
