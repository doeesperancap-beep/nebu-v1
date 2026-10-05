/* ============ FIREBASE ============ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBE4z14rQyaGjaV0ULkWPArLOdpQjUjAWo",
  authDomain: "nebula-city.firebaseapp.com",
  projectId: "nebula-city",
  storageBucket: "nebula-city.firebasestorage.app",
  messagingSenderId: "145504626308",
  appId: "1:145504626308:web:ac124c13d59ef3f7be44d1"
};

let dbFirebase = null;
let salaRef = null;

function iniciarFirebase() {
  if (dbFirebase) return dbFirebase;
  if (typeof firebase === 'undefined') return null;   // ← ADICIONA ESSA LINHA
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    dbFirebase = firebase.firestore();
    salaRef = dbFirebase.collection('sala').doc('principal');
    console.log('🔥 Firebase conectado!');
    return dbFirebase;
  } catch (e) {
    console.error('❌ Erro Firebase:', e);
    return null;
  }
}
// ==================== SALVAR ====================
async function salvarNoFirebase() {
  const db = iniciarFirebase();
  if (!db || !S.id) return;

  try {
    await db.collection('nebulas').doc(S.id).set({
      id: S.id,
      nome: S.nome || 'Nebo',
      humor: S.humor,
      fome: S.fome,
      energia: S.energia,
      saude: S.saude,
      moedas: S.moedas || 0,
      pers: S.pers,
      conectado: S.conectado || false,
      atualizadoEm: Date.now()
    });
    console.log('💾 Salvo no Firebase');
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

// ==================== LER ====================
async function lerNebulas() {
  const db = iniciarFirebase();
  if (!db) return [];

  try {
    const snapshot = await db.collection('nebulas').get();
    const lista = [];
    snapshot.forEach(doc => {
      const dados = doc.data();
      // Não mostra a si mesma
      if (dados.id !== S.id) lista.push(dados);
    });
    return lista;
  } catch (e) {
    console.error('Erro ao ler:', e);
    return [];
  }
}

// ==================== APAGAR (sair da sala) ====================
async function sairDoFirebase() {
  const db = iniciarFirebase();
  if (!db || !S.id) return;
  try {
    await db.collection('nebulas').doc(S.id).delete();
    console.log('🗑️ Removida da sala');
  } catch (e) {
    console.error('Erro ao sair:', e);
  }
}

// Salva automaticamente a cada 30 segundos
setInterval(() => {
  if (S.id && S.modo === 'nebo') salvarNoFirebase();
}, 30000);
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
const P = $('panel');  
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
  RE2: 1174.66, MI2: 1318.51,
  DO_BAIXO: 261.63, MI_BAIXO: 329.63, SOL_BAIXO: 392.00
};
/* Destrava áudio no primeiro toque (iOS/Chrome) */
addEventListener('pointerdown', () => SOM.destravar(), { once: true });

/* ============ 2. ESTADO ============ */
const SAVE_KEY = 'nebula-v2';
const DEFAULT = {
  modo: null,
  nome: null,
  id: null,
  moedas: 0,
  conectado: false,
  cidadeId: null,
  energia: 100, fome: 100, saude: 100, humor: 100,
  bond: 0, pers: null, sick: 0, greet: '',
  food: {}, pref: null, dis: null,
  places: {}, mem: [], lastDance: null,
  estoque: { '🍎': 3, '🍓': 2, '🥭': 1, '🍕': 0, '🍰': 0 },
  favoritas: [],
  detestadas: [],
  compras: [],           // ← NOVO (itens já comprados)
  equipado: {            // ← NOVO (o que tá usando agora)
    cabeca: null,
    oculos: null,
    olhos: null,
    fundo: null
  },
  // Bolsa
  bolsaPlantas: [],       // ← NOVO
  bolsaBorboletas: [],    // ← NOVO
  
  // Parque
 canteiros: [null, null, null, null, null, null, null],  // 7 slots
borboletasParque: [],   // máx 3 visíveis
  
  // Ciclo
  ovos: [],               // ← NOVO
  lagartas: [],           // ← NOVO
  casulos: [],            // ← NOVO
  
  last: Date.now()
};
/* ============ GERAR PREFERÊNCIAS ============ */
function gerarPreferencias() {
  // Lista todas as comidas do catálogo
  const todas = Object.keys(CATALOGO);
  
  // Sorteia 3 favoritas
  const favoritas = [];
  while (favoritas.length < 3) {
    const c = todas[Math.floor(Math.random() * todas.length)];
    if (!favoritas.includes(c)) favoritas.push(c);
  }
  
  // Sorteia 3 detestadas (que NÃO estejam nas favoritas)
  const detestadas = [];
  while (detestadas.length < 3) {
    const c = todas[Math.floor(Math.random() * todas.length)];
    if (!favoritas.includes(c) && !detestadas.includes(c)) detestadas.push(c);
  }
  
  return { favoritas, detestadas };
}
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
/* ============ APLICAR VISUAL DA BOUTIQUE ============ */
function aplicarVisual() {
  // Remove emojis antigos de cabeça e óculos
  document.querySelectorAll('.acessorio-nebo').forEach(e => e.remove());

  // Pega o que tá equipado
  const eq = S.equipado || {};

  // 1. Acessório de cabeça (canto superior direito)
  if (eq.cabeca) {
    const el = document.createElement('div');
    el.className = 'acessorio-nebo';
    el.textContent = eq.cabeca;
    el.style.cssText = `
      position: absolute;
      top: -20px;
      right: -30px;
      font-size: calc(var(--ew) * 0.5);
      z-index: 10;
      pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));
    `;
    document.getElementById('face').appendChild(el);
  }

  // 2. Óculos (em cima dos olhos)
  if (eq.oculos) {
    const el = document.createElement('div');
    el.className = 'acessorio-nebo';
    el.textContent = eq.oculos;
    el.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: calc(var(--ew) * 1.8);
      z-index: 11;
      pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));
    `;
    document.getElementById('eyes').appendChild(el);
  }

  // 3. Cor dos olhos + boca
  if (eq.olhos) {
    const cor = BOUTIQUE.olhos[eq.olhos]?.cor;
    if (cor) {
      document.documentElement.style.setProperty('--eye', cor);
    }
  } else {
    // Volta ao padrão
    document.documentElement.style.setProperty('--eye', '#f7d9e4');
  }

  // 4. Fundo da tela
  if (eq.fundo) {
    const cor = BOUTIQUE.fundo[eq.fundo]?.cor;
    if (cor) {
      document.body.style.background = cor;
      // Adiciona estrelinhas se for fundo especial
      if (eq.fundo === '🌌' || eq.fundo === '🌠' || eq.fundo === '🌉') {
        document.body.style.background = `${cor} radial-gradient(circle at 30% 30%, #ffffff22 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #ffffff22 0 1px, transparent 2px), radial-gradient(circle at 50% 80%, #ffffff22 0 1px, transparent 2px), ${cor}`;
        document.body.style.backgroundSize = '200px 200px, 300px 300px, 150px 150px, auto';
      }
    }
  } else {
    document.body.style.background = '#000';
    document.body.style.backgroundImage = 'none';
  }
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
/* ============ CATÁLOGO DE COMIDAS ============ */
const CATALOGO = {
  // 🥗 SAUDÁVEIS
  '🍎': { nome: 'Maçã',       tipo: 'saudavel', preco: 3,  humor: 2, saude: 2 },
  '🍓': { nome: 'Morango',    tipo: 'saudavel', preco: 5,  humor: 3, saude: 2 },
  '🥭': { nome: 'Manga',      tipo: 'saudavel', preco: 6,  humor: 3, saude: 2 },
  '🍉': { nome: 'Melancia',   tipo: 'saudavel', preco: 7,  humor: 4, saude: 2 },
  '🍒': { nome: 'Cereja',     tipo: 'saudavel', preco: 8,  humor: 4, saude: 2 },
  '🫐': { nome: 'Blueberry',  tipo: 'saudavel', preco: 8,  humor: 4, saude: 3 },
  '🍇': { nome: 'Uva',        tipo: 'saudavel', preco: 6,  humor: 3, saude: 2 },
  '🥒': { nome: 'Pepino',     tipo: 'saudavel', preco: 4,  humor: 1, saude: 3 },
  '🥗': { nome: 'Salada',     tipo: 'saudavel', preco: 6,  humor: 2, saude: 4 },
  '🍣': { nome: 'Sushi',      tipo: 'saudavel', preco: 12, humor: 6, saude: 3 },
  '🍵': { nome: 'Chá',        tipo: 'saudavel', preco: 4,  humor: 2, saude: 3 },

  // 🍔 INDUSTRIAIS
  '🍞': { nome: 'Pão',            tipo: 'industrial', preco: 4,  humor: 2, saude: -1 },
  '🍕': { nome: 'Pizza',          tipo: 'industrial', preco: 18, humor: 7, saude: -2 },
  '🍔': { nome: 'Hambúrguer',     tipo: 'industrial', preco: 18, humor: 8, saude: -2 },
  '🧇': { nome: 'Waffle',         tipo: 'industrial', preco: 15, humor: 6, saude: -2 },
  '🥞': { nome: 'Panqueca',       tipo: 'industrial', preco: 14, humor: 6, saude: -2 },
  '🍟': { nome: 'Batata frita',   tipo: 'industrial', preco: 12, humor: 6, saude: -2 },
  '🌭': { nome: 'Cachorro-quente',tipo: 'industrial', preco: 14, humor: 7, saude: -2 },
  '🌮': { nome: 'Taco',           tipo: 'industrial', preco: 15, humor: 7, saude: -2 },
  '🧋': { nome: 'Bubble tea',     tipo: 'industrial', preco: 16, humor: 8, saude: -1 },
  '🍲': { nome: 'Sopa',           tipo: 'industrial', preco: 10, humor: 4, saude: 1 },

  // 🍰 DOCES
  '🍬': { nome: 'Bala',       tipo: 'doce', preco: 3,  humor: 3, saude: -1 },
  '🍭': { nome: 'Pirulito',   tipo: 'doce', preco: 5,  humor: 4, saude: -1 },
  '🍪': { nome: 'Cookie',     tipo: 'doce', preco: 8,  humor: 5, saude: -2 },
  '🍫': { nome: 'Chocolate',  tipo: 'doce', preco: 10, humor: 6, saude: -2 },
  '🧊': { nome: 'Raspadinha', tipo: 'doce', preco: 10, humor: 6, saude: -1 },
  '🍰': { nome: 'Bolo',       tipo: 'doce', preco: 12, humor: 7, saude: -3 },
  '🍦': { nome: 'Sorvete',    tipo: 'doce', preco: 12, humor: 7, saude: -2 },
  '🍩': { nome: 'Donut',      tipo: 'doce', preco: 15, humor: 8, saude: -3 },
  '🧁': { nome: 'Cupcake',    tipo: 'doce', preco: 15, humor: 8, saude: -3 },
  '🍮': { nome: 'Pudim',      tipo: 'doce', preco: 18, humor: 9, saude: -2 }
};
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
  // Verifica se tem no estoque
  if ((S.estoque[f] || 0) <= 0) {
    say('Não tenho ' + f + ' no estoque... 😢');
    return;
  }

  // Pega do catálogo
  const c = CATALOGO[f];
  if (!c) {
    say('Não sei o que é isso... 🤔');
    return;
  }

  // Reduz do estoque
  S.estoque[f] -= 1;

  // Fecha o painel
  P.classList.remove('on');

   // Aplica efeitos
  S.fome = clamp(S.fome + 15);
  
  // Verifica se é favorita / detestada
  let humorGanho = c.humor;
  let extraFala = '';
  let extraExpressao = '';
  
  if ((S.favoritas || []).includes(f)) {
    humorGanho = c.humor * 2;   // dobro
    extraFala = ' (meu favorito!)';
    extraExpressao = 'carinho';
  } else if ((S.detestadas || []).includes(f)) {
    humorGanho = Math.min(-3, c.humor * -1);   // sempre negativo
    extraFala = ' (eca!)';
    extraExpressao = 'sad';
  }
  
  S.humor = clamp(S.humor + humorGanho);
  S.saude = clamp(S.saude + c.saude);
  // Fala + expressão
    let fala = 'Nham! ' + f;
  let expressao = extraExpressao || 'happy';
  let msgExtra = extraFala;
  if (c.humor >= 7) {
    fala = 'Adoro! ' + f;
    expressao = 'carinho';
  } else if (c.humor >= 5) {
    fala = 'Que delícia! ' + f;
  } else if (c.saude >= 3) {
    fala = 'Saudável! ' + f + ' 🥗';
  } else if (c.saude < 0) {
    fala = 'Hmm... ' + f;
  }

  if (c.saude <= -2) {
    msgExtra = ' (muito bom )';
  } else if (c.saude >= 2) {
    msgExtra = ' ✨';
  }

  set(expressao, 2500, fala + msgExtra);

  SOM.melodia([N.MI, N.SOL], 0.1, 'triangle', 0.1);

  if (c.humor >= 6) {
    setTimeout(() => heart(innerWidth / 2, innerHeight / 2), 300);
  }

  save();
}

function foodTray() {
  // Pega só as comidas que tem no estoque
  const temEstoque = Object.keys(S.estoque || {}).filter(f => (S.estoque[f] || 0) > 0);
  
  // Comidas industriais e doces não precisam estar no estoque (podem ser compradas direto no mercado)
  // Mas por enquanto, só mostra o que tem
  if (temEstoque.length === 0) {
    panel(
      '<h3>🍽️ Comida</h3>' +
      '<p style="opacity:.7;margin:12px 0">Não tem nada no estoque...</p>' +
      '<p style="opacity:.6;font-size:13px">Vá ao mercado comprar comidinhas! 🛒</p>'
    );
    return;
  }
  
  panel(
    '<h3>🍽️ Comida</h3>' +
    '<p style="font-size:13px;opacity:.7;margin:0 0 12px">O que tenho pra comer:</p>' +
    temEstoque.map(f => {
      const qtd = S.estoque[f] || 0;
      return `<button data-f="${f}" style="font-size:20px;padding:12px;display:flex;justify-content:space-between;align-items:center">
        <span>${f}</span>
        <span style="font-size:12px;opacity:.6">x${qtd}</span>
      </button>`;
    }).join('')
  );
}
/* ============ CATÁLOGO DA BOUTIQUE ============ */
const BOUTIQUE = {
  cabeca: {
    '🌸': { nome: 'Flor',          preco: 10 },
    '🌺': { nome: 'Hibisco',       preco: 12 },
    '❄️': { nome: 'Floco de neve', preco: 10 },
    '🎀': { nome: 'Laço',          preco: 8  },
    '👒': { nome: 'Chapéu',        preco: 20 },
    '🧙': { nome: 'Chapéu de bruxa', preco: 25 },
    '🎃': { nome: 'Abóbora',       preco: 15 },
    '👻': { nome: 'Fantasma',      preco: 15 },
    '🦇': { nome: 'Morcego',       preco: 15 },
    '🎉': { nome: 'Chapéu de festa', preco: 20 },
    '🎈': { nome: 'Balão',         preco: 15 },
    '🎁': { nome: 'Presente',      preco: 18 }
  },
  oculos: {
    '🕶️': { nome: 'Óculos de sol',   preco: 25 },
    '👓': { nome: 'Óculos de grau', preco: 20 },
    '🥽': { nome: 'Óculos de natação', preco: 22 }
  },
  olhos: {
    '🍑': { nome: 'Pêssego rosado', preco: 30, cor: '#F4A99B' },
    '💜': { nome: 'Azul-lavanda',   preco: 30, cor: '#919CCB' },
    '🌊': { nome: 'Turquesa',       preco: 30, cor: '#70BEC6' },
    '🥛': { nome: 'Creme',          preco: 30, cor: '#E8E0C3' },
    '🌿': { nome: 'Verde-menta',    preco: 30, cor: '#93CBB7' }
  },
  fundo: {
    '🌌': { nome: 'Galáxia',           preco: 80, cor: '#1a0d2e' },
    '🌠': { nome: 'Nebulosa de Órion', preco: 80, cor: '#2a0a1a' },
    '🌉': { nome: 'Via Láctea',        preco: 80, cor: '#0a0a2e' }
  }
};
/* ============ ESPÉCIES (plantas + borboletas) ============ */
const ESPECIES = {
  plantas: {
    ipe:       { nome: 'Ipê',        raridade: 'comum',   tempo: 36, atrai: ['amarela', 'verde'] },
    juazeiro:  { nome: 'Juazeiro',   raridade: 'comum',   tempo: 36, atrai: ['verde'] },
    angico:    { nome: 'Angico',     raridade: 'comum',   tempo: 36, atrai: [] },
    aroeira:   { nome: 'Aroeira',    raridade: 'comum',   tempo: 36, atrai: ['vermelha'] },
    umbuzeiro: { nome: 'Umbuzeiro',  raridade: 'comum',   tempo: 36, atrai: [] },
    samambaia: { nome: 'Samambaia',  raridade: 'comum',   tempo: 18, atrai: [] },
    cerejeira: { nome: 'Cerejeira',  raridade: 'incomum', tempo: 24, atrai: ['rosa'] },
    bordo:     { nome: 'Bordo',      raridade: 'incomum', tempo: 36, atrai: [] },
    carvalho:  { nome: 'Carvalho',   raridade: 'incomum', tempo: 36, atrai: ['folha'] },
    magnolia:  { nome: 'Magnólia',   raridade: 'rara',    tempo: 18, atrai: ['branca', 'fantasma'] },
    tulipa:    { nome: 'Tulipa',     raridade: 'comum',   tempo: 12, atrai: [] },
    lavanda:   { nome: 'Lavanda',    raridade: 'comum',   tempo: 12, atrai: ['azul', 'roxa'] },
    hibisco:   { nome: 'Hibisco',    raridade: 'comum',   tempo: 18, atrai: ['amarela', 'laranja', 'vermelha'] },
    lotus:     { nome: 'Lótus',      raridade: 'rara',    tempo: 24, atrai: [] }
  },
  borboletas: {
    azul:     { nome: 'Azul',              raridade: 'comum',      tempo: 12, cor: '#3498DB', cor2: '#5DADE2' },
    amarela:  { nome: 'Amarela',           raridade: 'comum',      tempo: 12, cor: '#F4D03F', cor2: '#F7DC6F' },
    laranja:  { nome: 'Laranja',           raridade: 'comum',      tempo: 18, cor: '#F39C12', cor2: '#F5B041' },
    branca:   { nome: 'Branca',            raridade: 'incomum',    tempo: 18, cor: '#F5F5F5', cor2: '#EAECEE' },
    rosa:     { nome: 'Rosa',              raridade: 'incomum',    tempo: 24, cor: '#F29DB5', cor2: '#F5B7C5' },
    roxa:     { nome: 'Roxa',              raridade: 'rara',       tempo: 24, cor: '#9B59B6', cor2: '#AF7AC5' },
    vermelha: { nome: 'Vermelha',          raridade: 'rara',       tempo: 30, cor: '#E74C3C', cor2: '#EC7063' },
    verde:    { nome: 'Verde',             raridade: 'muito-rara', tempo: 36, cor: '#2ECC71', cor2: '#58D68D' },
    folha:    { nome: 'Borboleta-Folha',   raridade: 'especial',   tempo: 36, cor: '#B9770E', cor2: '#D68910' },
    fantasma: { nome: 'Borboleta-Fantasma',raridade: 'especial',   tempo: 30, cor: '#D7BDE2', cor2: '#E8DAEF' },
    nebula:   { nome: 'Borboleta da Nébula',raridade: 'exclusiva', tempo: 36, cor: '#5D4F9E', cor2: '#9B8FD4' }
  }
};

/* ============ BOLSA ============ */
const BOLSA_MAX = 20;

/* ============ CORES DE RARIDADE ============ */
const RARIDADE_COR = {
  'comum':      '#27AE60',
  'incomum':    '#3498DB',
  'rara':       '#9B59B6',
  'muito-rara': '#F39C12',
  'especial':   '#E91E63',
  'exclusiva':  '#5D4F9E'
};
/* ============ SVGs DAS BORBOLETAS ============ */
const SVG_BORBOLETA = {
  azul: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#3498DB"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#3498DB"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#5DADE2"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#5DADE2"/>
    <circle cx="30" cy="32" r="4" fill="#1B4F72" opacity=".7"/>
    <circle cx="70" cy="32" r="4" fill="#1B4F72" opacity=".7"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  amarela: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#F4D03F"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#F4D03F"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#F7DC6F"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#F7DC6F"/>
    <circle cx="30" cy="32" r="4" fill="#7D6608" opacity=".7"/>
    <circle cx="70" cy="32" r="4" fill="#7D6608" opacity=".7"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  laranja: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#F39C12"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#F39C12"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#F5B041"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#F5B041"/>
    <circle cx="30" cy="32" r="4" fill="#7E5109" opacity=".7"/>
    <circle cx="70" cy="32" r="4" fill="#7E5109" opacity=".7"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  branca: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#F5F5F5"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#F5F5F5"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#EAECEE"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#EAECEE"/>
    <circle cx="30" cy="32" r="4" fill="#7F8C8D" opacity=".5"/>
    <circle cx="70" cy="32" r="4" fill="#7F8C8D" opacity=".5"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  rosa: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#F29DB5"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#F29DB5"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#F5B7C5"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#F5B7C5"/>
    <circle cx="30" cy="32" r="4" fill="#943126" opacity=".5"/>
    <circle cx="70" cy="32" r="4" fill="#943126" opacity=".5"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  roxa: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#9B59B6"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#9B59B6"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#AF7AC5"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#AF7AC5"/>
    <circle cx="30" cy="32" r="4" fill="#4A235A" opacity=".7"/>
    <circle cx="70" cy="32" r="4" fill="#4A235A" opacity=".7"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  vermelha: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#E74C3C"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#E74C3C"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#EC7063"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#EC7063"/>
    <circle cx="30" cy="32" r="4" fill="#641E16" opacity=".7"/>
    <circle cx="70" cy="32" r="4" fill="#641E16" opacity=".7"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  verde: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#2ECC71"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#2ECC71"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#58D68D"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#58D68D"/>
    <circle cx="30" cy="32" r="4" fill="#145A32" opacity=".7"/>
    <circle cx="70" cy="32" r="4" fill="#145A32" opacity=".7"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  folha: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#B9770E"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#B9770E"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#D68910"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#D68910"/>
    <path d="M20 30 Q30 25 40 30" stroke="#7E5109" stroke-width="1.5" fill="none"/>
    <path d="M60 30 Q70 25 80 30" stroke="#7E5109" stroke-width="1.5" fill="none"/>
    <circle cx="30" cy="32" r="4" fill="#4A2505" opacity=".8"/>
    <circle cx="70" cy="32" r="4" fill="#4A2505" opacity=".8"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#2C3E50"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#2C3E50" stroke-width="1.5"/>
  </svg>`,

  fantasma: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="#D7BDE2" opacity=".7"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="#D7BDE2" opacity=".7"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#E8DAEF" opacity=".7"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#E8DAEF" opacity=".7"/>
    <circle cx="30" cy="32" r="4" fill="#4A235A" opacity=".4"/>
    <circle cx="70" cy="32" r="4" fill="#4A235A" opacity=".4"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#4A235A" opacity=".5"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#4A235A" stroke-width="1.5" opacity=".5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#4A235A" stroke-width="1.5" opacity=".5"/>
  </svg>`,

  nebula: `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="nebulaGrad">
        <stop offset="0%" stop-color="#9B8FD4"/>
        <stop offset="50%" stop-color="#5D4F9E"/>
        <stop offset="100%" stop-color="#2C1F5C"/>
      </radialGradient>
    </defs>
    <ellipse cx="30" cy="35" rx="22" ry="20" fill="url(#nebulaGrad)"/>
    <ellipse cx="70" cy="35" rx="22" ry="20" fill="url(#nebulaGrad)"/>
    <ellipse cx="32" cy="50" rx="16" ry="14" fill="#9B8FD4" opacity=".7"/>
    <ellipse cx="68" cy="50" rx="16" ry="14" fill="#9B8FD4" opacity=".7"/>
    <circle cx="25" cy="28" r="1.5" fill="#fff"/>
    <circle cx="35" cy="38" r="1" fill="#fff"/>
    <circle cx="65" cy="28" r="1.5" fill="#fff"/>
    <circle cx="75" cy="38" r="1" fill="#fff"/>
    <circle cx="30" cy="32" r="4" fill="#1A0D2E" opacity=".6"/>
    <circle cx="70" cy="32" r="4" fill="#1A0D2E" opacity=".6"/>
    <ellipse cx="50" cy="45" rx="3" ry="18" fill="#1A0D2E"/>
    <line x1="50" y1="28" x2="44" y2="20" stroke="#1A0D2E" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="56" y2="20" stroke="#1A0D2E" stroke-width="1.5"/>
  </svg>`
};
/* ============ SVG DAS PLANTAS (por estágio) ============ */
function svgPlanta(idPlanta, estagio) {
  // estagio: 0-100 (0=broto, 100=flor pronta)
  // Retorna o SVG certo pro estágio
  
  const nome = ESPECIES.plantas[idPlanta]?.nome || idPlanta;
  
  // Cores por planta (pra diferenciar visualmente)
  const cores = {
    ipe:       { flor: '#F4D03F', fruta: null,      tronco: '#8B4513' },
    juazeiro:  { flor: '#7DCEA0', fruta: '#B7950B', tronco: '#654321' },
    angico:    { flor: '#A0522D', fruta: null,      tronco: '#5D4037' },
    aroeira:   { flor: '#E74C3C', fruta: '#C0392B', tronco: '#6D4C41' },
    umbuzeiro: { flor: '#B7950B', fruta: '#F1C40F', tronco: '#795548' },
    samambaia: { flor: '#27AE60', fruta: null,      tronco: '#1E8449' },
    cerejeira: { flor: '#F29DB5', fruta: null,      tronco: '#5D4037' },
    bordo:     { flor: '#E67E22', fruta: null,      tronco: '#5D4037' },
    carvalho:  { flor: '#229954', fruta: '#7D6608', tronco: '#5D4037' },
    magnolia:  { flor: '#F5F5F5', fruta: null,      tronco: '#5D4037' },
    tulipa:    { flor: '#E91E63', fruta: null,      tronco: '#27AE60' },
    lavanda:   { flor: '#9B59B6', fruta: null,      tronco: '#7D3C98' },
    hibisco:   { flor: '#E74C3C', fruta: null,      tronco: '#27AE60' },
    lotus:     { flor: '#F8C8DC', fruta: null,      tronco: '#27AE60' }
  };
  
  const c = cores[idPlanta] || cores.ipe;
  
  // BROTO (0-30%)
  if (estagio < 30) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="90" rx="20" ry="5" fill="#654321" opacity=".4"/>
      <line x1="50" y1="90" x2="50" y2="65" stroke="#27AE60" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="44" cy="62" rx="8" ry="5" fill="#2ECC71" transform="rotate(-30 44 62)"/>
      <ellipse cx="56" cy="62" rx="8" ry="5" fill="#2ECC71" transform="rotate(30 56 62)"/>
    </svg>`;
  }
  
  // MUDA (30-70%)
  if (estagio < 70) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="90" rx="22" ry="6" fill="#654321" opacity=".4"/>
      <rect x="46" y="60" width="8" height="30" fill="${c.tronco}" rx="2"/>
      <circle cx="50" cy="50" r="22" fill="${c.flor}" opacity=".5"/>
      <circle cx="38" cy="55" r="12" fill="${c.flor}" opacity=".4"/>
      <circle cx="62" cy="55" r="12" fill="${c.flor}" opacity=".4"/>
      <circle cx="50" cy="48" r="4" fill="#fff" opacity=".3"/>
    </svg>`;
  }
  
  // FLOR PRONTA (70-100%)
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="90" rx="25" ry="7" fill="#654321" opacity=".4"/>
    <rect x="46" y="55" width="8" height="35" fill="${c.tronco}" rx="2"/>
    <circle cx="50" cy="45" r="28" fill="${c.flor}"/>
    <circle cx="32" cy="55" r="16" fill="${c.flor}"/>
    <circle cx="68" cy="55" r="16" fill="${c.flor}"/>
    ${c.fruta ? `<circle cx="42" cy="42" r="4" fill="${c.fruta}"/>
                <circle cx="58" cy="48" r="4" fill="${c.fruta}"/>` : ''}
    <circle cx="42" cy="38" r="6" fill="#fff" opacity=".3"/>
  </svg>`;
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
  const bx = $('bXarope');                    
  if (bx) bx.style.display = S.sick > n ? '' : 'none';   
}

let ultimoPedidoMercado = 0;
let vezesPediuMercado = 0;

function foodTick() {
  const n = Date.now();
  
  // Checa se tá com pouca comida no estoque
  const estoqueTotal = Object.values(S.estoque || {}).reduce((a, b) => a + b, 0);
  
  // Se tem pouca comida E fome baixa → ela pede pra ir ao mercado
  if (estoqueTotal <= 1 && S.fome < 50 &&
      n - ultimoPedidoMercado > 60000 &&   // a cada 1 minuto no máximo
      !gOn && !P.classList.contains('on') && S.pers) {
    
    ultimoPedidoMercado = n;
    vezesPediuMercado++;
    
    // Fala + reação dependendo da personalidade
    let fala = 'Tô com fome... podemos ir ao mercado? 🛒';
    let expressao = 'sad';
    
    if (S.pers === 'carinhosa') {
      fala = 'Amor, tô sem comidinha... vamos ao mercado? 🥺';
      expressao = 'sad';
    } else if (S.pers === 'brincalhona') {
      fala = 'Mercado! Mercado! Vamos? 🛒✨';
      expressao = 'happy';
    } else if (S.pers === 'temperamental') {
      fala = 'Cadê a comida?! Vamos ao mercado AGORA! 😤';
      expressao = 'angry';
    } else if (S.pers === 'curiosa') {
      fala = 'O que tem no mercado hoje? Vamos ver! 👀';
      expressao = 'curious';
    } else if (S.pers === 'tranquila') {
      fala = 'Tô com fome... mas sem pressa. 🍽️';
      expressao = 'sleepy';
    } else if (S.pers === 'reservada') {
      fala = '... comida. 🍽️';
      expressao = 'neutral';
    }
    
    // Mostra o painel especial
    panel(
      `<h3>🛒 Hora do mercado!</h3>` +
      `<p style="font-size:15px;margin:12px 0">${fala}</p>` +
      `<p style="font-size:13px;opacity:.7;margin:8px 0">
        Estoque atual: ${estoqueTotal} comida(s)<br>
        Fome: ${Math.round(S.fome)}%
      </p>` +
      `<button id="btnIrMercado" style="font-size:16px;padding:14px;background:#f7d9e4;color:#1b1824">
        🛒 Ir ao Mercado
      </button>` +
      `<button id="btnIgnorar" style="font-size:14px;padding:10px;opacity:.7;margin-top:8px">
        Depois...
      </button>`
    );
    
    // Reação visual
    set(expressao, 3000, fala);
    
    // Handler dos botões
    setTimeout(() => {
      const btnIr = document.getElementById('btnIrMercado');
      const btnIgnorar = document.getElementById('btnIgnorar');
      
      if (btnIr) {
        btnIr.onclick = () => {
          P.classList.remove('on');
          S.humor = clamp(S.humor + 5);   // feliz por ir
          say('Eba! Vamos! 🛒✨');
          setTimeout(() => painelLoja(), 400);
        };
      }
      
      if (btnIgnorar) {
        btnIgnorar.onclick = () => {
          P.classList.remove('on');
          
          // Fica triste se ignorar
          if (S.pers === 'temperamental') {
            set('angry', 2500, 'Você me ignora?! 😤');
          } else if (S.pers === 'carinhosa') {
            set('sad', 2500, 'Tá bom... 😢');
          } else {
            set('sad', 2000, '...');
          }
          
          S.humor = clamp(S.humor - 3);
          save();
        };
      }
    }, 100);
    
    // Aumenta o humor se ela pediu muitas vezes e você ignorou
    if (vezesPediuMercado >= 3) {
      S.humor = clamp(S.humor - 2);
      vezesPediuMercado = 0;   // reseta
    }
    
    save();
    return;
  }
  
  // Lógica antiga (comida normal)
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
      ganharMoedas(score);
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
          ganharMoedas(score * 2);
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
       ganharMoedas(5);
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

/* ============ MUNDO (modo Nébula) ============ */
function mundo() {
  if (S.sick > Date.now()) { say('Tô gripada... 🤧'); return; }

  if (S.conectado) {
    panel(
      '<h3>✨ Nébula City</h3>' +
      `<p style="font-size:13px;opacity:.7;margin:0 0 12px">Conectada! Escolha onde ir:</p>` +
      '<button data-x="loja" style="font-size:16px;padding:14px">🛒 Mercado</button>' +
      '<button data-x="boutique" style="font-size:16px;padding:14px">👗 Boutique</button>' +
      '<button data-x="spa" style="font-size:16px;padding:14px">💆 Spa</button>' +
      '<button data-x="clinica" style="font-size:16px;padding:14px">🏥 Clínica</button>' +
      '<button data-x="biblioteca" style="font-size:16px;padding:14px">📚 Biblioteca</button>' +
      '<button data-x="parque" style="font-size:16px;padding:14px">🌳 Parque</button>' +
      '<button data-x="jogos" style="font-size:16px;padding:14px">🎮 Jogos</button>' +
      '<hr style="border-color:#ffffff20;margin:12px 0">' +
      '<button data-x="desconectar" style="font-size:14px;opacity:.7">🔌 Desconectar</button>'
    );
    return;
  }

  panel(
    '<h3>✨ Mundo</h3>' +
    '<p style="font-size:14px;opacity:.8;line-height:1.5">' +
      'Conecte-se à Nébula City para visitar lojas, spa e mais!' +
    '</p>' +
    '<button data-x="conectar" style="font-size:17px;padding:16px">🔗 Conectar Cidade</button>' +
    '<hr style="border-color:#ffffff20;margin:12px 0">' +
    '<button data-p="praca">🌳 Praça</button>' +
    '<button data-p="jardim">🌱 Jardim</button>' +
    `<div style="font-size:14px;opacity:.7;margin-top:8px">Descobertas: ${(S.mem || []).join(' ') || 'nada ainda'}</div>`
  );
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

function panel(h) {
  P.innerHTML = h + '<button data-x="close">Fechar</button>';
  P.classList.add('on');
}

/* ============ ESCOLHA DE MODO ============ */
function modoPanel() {
  P.innerHTML = `
    <h3>O que é este dispositivo?</h3>
    <p style="opacity:.7;font-size:14px;margin:8px 0 16px">
      Escolha uma vez. Depois só muda nas configurações.
    </p>
    <button data-modo="nebo" style="font-size:18px;padding:16px">
      💗 É uma Nébula
      <div style="font-size:12px;opacity:.7;margin-top:4px">
        Eu vou cuidar dela
      </div>
    </button>
    <button data-modo="cidade" style="font-size:18px;padding:16px">
      🏙️ É a Cidade
      <div style="font-size:12px;opacity:.7;margin-top:4px">
        Vai mostrar várias Nebos
      </div>
    </button>
  `;
  P.classList.add('on');

  setTimeout(() => {
    P.querySelectorAll('[data-modo]').forEach(b => {
      b.onclick = () => {
        S.modo = b.dataset.modo;
        save();
        P.classList.remove('on');
        iniciarModo();
      };
    });
  }, 100);
}

function iniciarModo() {
  if (S.modo === 'cidade') {
    document.body.classList.add('modo-cidade');
    abrirCidade();
  } else {
    document.body.classList.remove('modo-cidade');
    if (!S.nome) setTimeout(welcomePanel, 400);
    else if (!S.pers) setTimeout(persPanel, 800);
  }
}
/* ============ CIDADE ============ */
const CIDADE_PREDIOS = {
  // Fileira de cima (prédios altos)
  jogos:        { x: 7,  y: 15, w: 20, h: 30, nome: '🎮 Jogos Central', fala: 'Hora de brincar! 🎮' },
  biblioteca:   { x: 29, y: 15, w: 20, h: 30, nome: '📚 Biblioteca',    fala: 'Vou ler um livro! 📚' },
  boutique:     { x: 50, y: 15, w: 20, h: 30, nome: '👗 Boutique',      fala: 'Roupinhas! 👗' },
  mercado:      { x: 72, y: 15, w: 22, h: 30, nome: '🛒 Mercado',       fala: 'Vou comprar frutinhas! 🍎' },

  // Meio (parque, borboletas, área verde)
  borboletas:   { x: 13, y: 55, w: 20, h: 18, nome: '🦋 Espaço Borboletas', fala: 'Borboletas! 🦋' },
  parque:       { x: 36, y: 52, w: 26, h: 20, nome: '🌳 Parque',            fala: 'Vou passear! 🌳' },
  praca:        { x: 66, y: 55, w: 22, h: 18, nome: '🌿 Área Verde',        fala: 'Que calmo aqui...' },

  // Fileira de baixo (prédios pequenos)
  clinica:      { x: 13, y: 88, w: 15, h: 11, nome: '🏥 Clínica',       fala: 'Vou me cuidar! 🏥' },
  spa:          { x: 38, y: 88, w: 15, h: 11, nome: '💆 Spa',           fala: 'Aaah, que delícia! 🥒' },
  observatorio: { x: 59, y: 88, w: 15, h: 11, nome: '🔭 Observatório',  fala: 'Ver estrelas! 🔭' }
};
const NEBO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340">
  <defs><radialGradient id="g-lavanda" gradientUnits="userSpaceOnUse" cx="200" cy="175" r="190"><stop offset="0" stop-color="#D8D2F2"/><stop offset=".55" stop-color="#D8D2F2"/><stop offset="1" stop-color="#9A8FD0"/></radialGradient></defs>
  <g fill="#5D4F9E" stroke="#5D4F9E" stroke-width="7" stroke-linejoin="round"><circle cx="150" cy="80" r="50"/><circle cx="230" cy="70" r="52"/><circle cx="300" cy="105" r="46"/><circle cx="345" cy="165" r="48"/><circle cx="335" cy="235" r="50"/><circle cx="270" cy="275" r="52"/><circle cx="190" cy="285" r="54"/><circle cx="110" cy="270" r="50"/><circle cx="65" cy="215" r="48"/><circle cx="60" cy="150" r="48"/><circle cx="95" cy="100" r="46"/><ellipse cx="200" cy="178" rx="140" ry="100"/></g>
  <g fill="url(#g-lavanda)"><circle cx="150" cy="80" r="50"/><circle cx="230" cy="70" r="52"/><circle cx="300" cy="105" r="46"/><circle cx="345" cy="165" r="48"/><circle cx="335" cy="235" r="50"/><circle cx="270" cy="275" r="52"/><circle cx="190" cy="285" r="54"/><circle cx="110" cy="270" r="50"/><circle cx="65" cy="215" r="48"/><circle cx="60" cy="150" r="48"/><circle cx="95" cy="100" r="46"/><ellipse cx="200" cy="178" rx="140" ry="100"/></g>
  <clipPath id="e1-lavanda"><ellipse cx="150" cy="190" rx="26" ry="34"/></clipPath>
  <ellipse cx="150" cy="190" rx="26" ry="34" fill="#fff" fill-opacity=".35"/>
  <g clip-path="url(#e1-lavanda)"><path d="M120 198 Q150 188 180 198 V230 H120Z" fill="#5D4F9E" fill-opacity=".38"/><path d="M120 198 Q150 188 180 198" fill="none" stroke="#5D4F9E" stroke-width="3"/><circle cx="142" cy="208" r="3.5" fill="#fff"/></g>
  <ellipse cx="150" cy="190" rx="26" ry="34" fill="none" stroke="#5D4F9E" stroke-width="3.5"/><circle cx="143" cy="173" r="2.5" fill="#fff"/><clipPath id="e2-lavanda"><ellipse cx="248" cy="180" rx="26" ry="34"/></clipPath>
  <ellipse cx="248" cy="180" rx="26" ry="34" fill="#fff" fill-opacity=".35"/>
  <g clip-path="url(#e2-lavanda)"><path d="M218 188 Q248 178 278 188 V220 H218Z" fill="#5D4F9E" fill-opacity=".38"/><path d="M218 188 Q248 178 278 188" fill="none" stroke="#5D4F9E" stroke-width="3"/><circle cx="240" cy="198" r="3.5" fill="#fff"/></g>
  <ellipse cx="248" cy="180" rx="26" ry="34" fill="none" stroke="#5D4F9E" stroke-width="3.5"/><circle cx="241" cy="163" r="2.5" fill="#fff"/>
  <ellipse cx="118" cy="230" rx="14" ry="8" fill="#F29DB5" fill-opacity=".4"/><ellipse cx="282" cy="222" rx="14" ry="8" fill="#F29DB5" fill-opacity=".4"/>
  <path d="M186 228 q7 9 14 0 q7 9 14 0" fill="none" stroke="#5D4F9E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
/* ============ MOSTRAR NEBULAS NA CIDADE ============ */
async function mostrarNebulasNaCidade() {
  const lista = await lerNebulas();
  const container = document.getElementById('outrasNebos');
  if (!container) return;

  // Limpa tudo
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<p style="opacity:.5;font-size:13px;padding:10px">Nenhuma outra Nébula na sala ainda...</p>';
    return;
  }

  // Cabeçalho
  container.innerHTML = `<h4 style="margin:0 0 8px;font-size:13px">🌟 ${lista.length} Nébula(s) na sala</h4>`;

  // Cada Nébula vira um "card" clicável
  lista.forEach((n, i) => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: #ffffff1a;
      padding: 8px;
      border-radius: 12px;
      margin: 6px 0;
      cursor: pointer;
      transition: background .2s;
    `;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:30px;height:30px;flex-shrink:0">${NEBO_SVG}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.nome || 'Nebo'}</div>
          <div style="font-size:10px;opacity:.5">${n.id}</div>
        </div>
      </div>
      <div style="font-size:11px;margin-top:6px;display:flex;gap:6px;justify-content:space-around">
        <span>😊${Math.round(n.humor||0)}</span>
        <span>🍎${Math.round(n.fome||0)}</span>
        <span>🔋${Math.round(n.energia||0)}</span>
      </div>
    `;

    card.onmouseenter = () => card.style.background = '#ffffff33';
    card.onmouseleave = () => card.style.background = '#ffffff1a';

    card.onclick = () => {
      mostrarBalao(`${n.nome} diz oi! 👋`);
    };

    container.appendChild(card);
  });
}
function abrirCidade() {
  let cidade = document.getElementById('cidade');
  if (!cidade) {
    cidade = document.createElement('div');
        cidade.innerHTML = `
      <img id="cidadeMapa" src="cidade.jpeg" alt="Nébula City">
      <div id="cidadeNebo">${NEBO_SVG}</div>
      <div id="cidadeBalao"></div>
      <button id="cidadeVoltar">← Voltar</button>
      <div id="outrasNebos" style="
        position:absolute;top:60px;right:12px;
        max-width:200px;max-height:60vh;overflow:auto;
        background:#1b1824e6;border-radius:14px;padding:10px;
        font-size:13px;color:#fff;z-index:30;
      "></div>
    `;
    document.body.appendChild(cidade);

    for (const [id, p] of Object.entries(CIDADE_PREDIOS)) {
      const area = document.createElement('div');
      area.className = 'predio';
      area.dataset.p = id;
      area.style.cssText = `left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%`;
      cidade.appendChild(area);
    }

    cidade.querySelectorAll('.predio').forEach(el => {
      el.onclick = () => clicarPredio(el.dataset.p);
    });

    document.getElementById('cidadeVoltar').onclick = () => {
      cidade.classList.remove('on');
    };
  }

   cidade.classList.add('on');
  setTimeout(() => mostrarBalao('Onde vamos hoje? ✨'), 400);
  mostrarNebulasNaCidade();
  setInterval(mostrarNebulasNaCidade, 15000);   // ← atualiza a cada 15s
}

function mostrarBalao(texto) {
  const b = document.getElementById('cidadeBalao');
  if (!b) return;
  b.textContent = texto;
  b.classList.add('on');
  clearTimeout(window._balaoTimer);
  window._balaoTimer = setTimeout(() => b.classList.remove('on'), 2200);
}

function clicarPredio(id) {
  const p = CIDADE_PREDIOS[id];
  if (!p) return;
  mostrarBalao(p.fala);
  setTimeout(() => {
    // NÃO esconde a cidade. Só mostra o painel por cima.
    panel(`<h3>${p.nome}</h3><p style="opacity:.7">Em breve ✨</p>`);
  }, 1200);
}
/* ============ CONECTAR CIDADE ============ */
function painelConectar() {
  panel(
    '<h3>🔗 Conectar Cidade</h3>' +
    `<p style="font-size:14px;opacity:.8;line-height:1.5">
      O ID desta Nébula é:<br>
      <code style="background:#ffffff20;padding:6px 10px;border-radius:6px;font-size:14px;display:inline-block;margin-top:6px">${S.id || 'sem ID'}</code>
    </p>` +
    '<p style="font-size:14px;opacity:.8;line-height:1.5;margin-top:14px">' +
      'Cole o ID da Cidade pra conectar:' +
    '</p>' +
    '<input id="idCidade" type="text" placeholder="Ex: CITY-XXXX" maxlength="20" ' +
      'style="width:100%;padding:12px;border-radius:12px;border:0;font-size:15px;' +
      'background:#ffffff1a;color:#fff;box-sizing:border-box;margin:8px 0">' +
    '<button id="btnConectar">Conectar</button>' +
    '<p style="font-size:12px;opacity:.5;margin-top:12px">' +
      '🔜 Em breve: conexão real via internet!' +
    '</p>'
  );

  setTimeout(() => {
    const btn = document.getElementById('btnConectar');
    const inp = document.getElementById('idCidade');
    if (!btn) return;
    btn.onclick = () => {
      const id = (inp.value || '').trim().toUpperCase();
      if (!id) {
        inp.style.background = '#ff000044';
        return;
      }
      S.conectado = true;
S.cidadeId = id;
save();
say('Conectada! ✨');
salvarNoFirebase();   // ← ESSA LINHA NOVA!
P.classList.remove('on');
setTimeout(mundo, 400);
    };
  }, 100);
}
/* ============ PAINÉIS DOS LUGARES (placeholders) ============ */
/* ============ MERCADO ============ */
let carrinho = {};   // { '🍎': 2, '🍕': 1 }

/* ============ MÚSICA DO MERCADO ============ */
let musicaMercado = null;

function tocarMusicaMercado() {
  if (musicaMercado) return;   // já tá tocando
  
  // Melodia tipo supermercado (loop)
  const melodia = [
    N.DO, N.MI, N.SOL, N.MI,
    N.FA, N.LA, N.DO2, N.LA,
    N.SOL, N.SI, N.RE2 || N.RE, N.SI,
    N.DO, N.MI, N.SOL, N.DO
  ];
  
  let i = 0;
  musicaMercado = setInterval(() => {
    SOM.nota(melodia[i % melodia.length], 0.25, 'triangle', 0.04);
    i++;
  }, 350);
}

function pararMusicaMercado() {
  if (musicaMercado) {
    clearInterval(musicaMercado);
    musicaMercado = null;
  }
}
/* ============ SOM DO JARDIM ============ */
let somJardim = null;

function tocarSomJardim() {
  if (somJardim) return;
  
  // Melodia suave, tipo passarinhos + vento
  const melodia = [
    N.DO2, N.MI2 || N.DO2, N.SOL, N.MI,
    N.DO2, N.RE2, N.SOL, N.MI,
    N.FA, N.LA, N.DO2, N.LA,
    N.SOL, N.MI, N.DO, N.MI
  ];
  
  let i = 0;
  somJardim = setInterval(() => {
    // Notas aleatórias tipo passarinho
    if (Math.random() < 0.3) {
      SOM.nota(melodia[i % melodia.length], 0.4, 'sine', 0.03);
    }
    i++;
  }, 800);
}

function pararSomJardim() {
  if (somJardim) {
    clearInterval(somJardim);
    somJardim = null;
  }
}

function painelLoja() {
  carrinho = {};
  tocarMusicaMercado();
  
  // Reset (ela parou de pedir)
  vezesPediuMercado = 0;
  
  renderMercado();
}
function renderMercado() {
  const secoes = {
    saudavel:    { emoji: '🥗', nome: 'Saudáveis' },
    industrial:  { emoji: '🍔', nome: 'Industrializados' },
    doce:        { emoji: '🍰', nome: 'Doces' }
  };

  // Monta HTML de cada seção
  let html = '<h3>🛒 Mercado</h3>';
  html += `<p style="font-size:13px;opacity:.7;margin:0 0 8px">Você tem: 🪙 ${S.moedas || 0}</p>`;

  for (const [tipo, info] of Object.entries(secoes)) {
    const comidas = Object.entries(CATALOGO).filter(([_, c]) => c.tipo === tipo);
    if (comidas.length === 0) continue;

    html += `<div style="margin:12px 0 6px;font-size:14px"><b>${info.emoji} ${info.nome}</b></div>`;
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
    comidas.forEach(([emoji, c]) => {
      const noCarrinho = carrinho[emoji] || 0;
      html += `
        <div class="item-mercado" data-add="${emoji}" style="
          background:#ffffff1a;border-radius:10px;padding:8px 4px;
          text-align:center;cursor:pointer;transition:background .2s;
          border:2px solid ${noCarrinho > 0 ? '#f7d9e4' : 'transparent'};
        ">
          <div style="font-size:24px">${emoji}</div>
          <div style="font-size:10px;opacity:.7">${c.preco}🪙</div>
          ${noCarrinho > 0 ? `<div style="font-size:10px;color:#f7d9e4;font-weight:bold">x${noCarrinho}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  // Total do carrinho
  let total = 0;
  let itensCarrinho = '';
  const itens = Object.entries(carrinho).filter(([_, q]) => q > 0);
  if (itens.length > 0) {
    itens.forEach(([emoji, q]) => {
      const preco = CATALOGO[emoji].preco * q;
      total += preco;
      itensCarrinho += `${emoji}x${q} `;
    });
  }

  html += `<hr style="border-color:#ffffff20;margin:12px 0">`;
  html += `<div style="font-size:14px;margin:8px 0">
    🛒 Carrinho: ${itensCarrinho || '<span style="opacity:.5">vazio</span>'}
  </div>`;
  html += `<div style="font-size:16px;font-weight:bold;margin:8px 0">
    Total: 🪙 ${total}
  </div>`;

  // Botões
  if (itens.length > 0) {
    html += `<button id="btnPagar" style="font-size:16px;padding:14px;background:#f7d9e4;color:#1b1824">✓ Pagar ${total}🪙</button>`;
  }

  panel(html);

  // Handlers
  setTimeout(() => {
    // Clique nas comidas
    document.querySelectorAll('[data-add]').forEach(el => {
      el.onclick = () => {
        const emoji = el.dataset.add;
        carrinho[emoji] = (carrinho[emoji] || 0) + 1;
        SOM.nota(700 + Math.random() * 200, 0.05, 'sine', 0.08);
        renderMercado();
      };
    });

    // Pagar
    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
      btnPagar.onclick = () => {
        const total = Object.entries(carrinho).reduce((soma, [emoji, q]) => 
          soma + (CATALOGO[emoji]?.preco || 0) * q, 0);
        
        if ((S.moedas || 0) < total) {
          say('Não tenho moedas suficientes... 😢');
          return;
        }

        // Debita
        S.moedas -= total;

        // Adiciona ao estoque
        Object.entries(carrinho).forEach(([emoji, q]) => {
          S.estoque[emoji] = (S.estoque[emoji] || 0) + q;
        });

        save();
        SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.08, 'sine', 0.1);
        say('Comprei tudinho! 🛒✨');
        
                // Para a música
        pararMusicaMercado();

        // Fecha e volta
        P.classList.remove('on');
        carrinho = {};
        
        // Volta pro Mundo depois de 1s
        setTimeout(() => {
          if (S.conectado) mundo();
        }, 1000);
      };
    }
  }, 100);
}
/* ============ PAINEL DO SPA ============ */
function painelSpa() {
  const CUSTO = 10;
  
  if ((S.moedas || 0) < CUSTO) {
    panel(
      '<h3>💆 Spa</h3>' +
      `<p style="opacity:.8;margin:12px 0">
        Pra relaxar no Spa, preciso de <b>🪙 ${CUSTO} moedas</b>.
      </p>` +
      `<p style="opacity:.6;font-size:13px">
        Você tem: 🪙 ${S.moedas || 0}<br>
        Faça um minigame pra ganhar mais!
      </p>`
    );
    return;
  }
  
  panel(
    '<h3>💆 Spa</h3>' +
    `<p style="opacity:.8;margin:12px 0">
      Relaxar no Spa custa <b>🪙 ${CUSTO} moedas</b>.
    </p>` +
    `<p style="opacity:.6;font-size:13px;margin-bottom:16px">
      Você tem: 🪙 ${S.moedas || 0}
    </p>` +
    '<button id="btnFazerSpa" style="font-size:16px;padding:14px">💆 Relaxar agora</button>'
  );
  
  setTimeout(() => {
    const btn = document.getElementById('btnFazerSpa');
    if (!btn) return;
    btn.onclick = fazerSpa;
  }, 100);
}

function fazerSpa() {
  const CUSTO = 10;
  S.moedas = (S.moedas || 0) - CUSTO;
  save();
  P.classList.remove('on');
  abrirTelaSpa();
}

/* ============ SPA ============ */
function abrirTelaSpa() {
  const tela = document.createElement('div');
  tela.id = 'telaSpa';
  tela.style.cssText = `
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, #d8b8e0 0%, #a88fc8 100%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    animation: fadeIn .4s;
    overflow: hidden;
  `;
  
  tela.innerHTML = `
    <h1 style="font-size:24px;margin:0 0 4px">💆 Spa</h1>
    <p style="opacity:.8;margin:0 0 20px;font-size:14px">Relaxando...</p>
    
    <div style="position:relative;width:240px;height:240px;margin:10px 0">
      <svg viewBox="0 0 240 240" style="width:100%;height:100%;overflow:visible">
        
        <!-- Toalha enrolada na cabeça -->
        <path d="M50 80 Q120 30 190 80 L190 95 Q120 55 50 95 Z" fill="#fff" opacity=".9"/>
        <circle cx="120" cy="60" r="14" fill="#fff" opacity=".9"/>
        <ellipse cx="120" cy="60" rx="14" ry="6" fill="#e8d5e8" opacity=".5"/>
        
        <!-- Corpo da nuvem -->
        <ellipse cx="120" cy="140" rx="85" ry="65" fill="#f7d9e4"/>
        <circle cx="75" cy="105" r="38" fill="#f7d9e4"/>
        <circle cx="165" cy="105" r="38" fill="#f7d9e4"/>
        
        <!-- Máscara de pepino (olhos) -->
        <ellipse cx="88" cy="120" rx="20" ry="13" fill="#7bc47f"/>
        <ellipse cx="152" cy="120" rx="20" ry="13" fill="#7bc47f"/>
        <ellipse cx="88" cy="117" rx="16" ry="9" fill="#a8dba8" opacity=".6"/>
        <ellipse cx="152" cy="117" rx="16" ry="9" fill="#a8dba8" opacity=".6"/>
        <!-- Brilho do pepino -->
        <circle cx="82" cy="115" r="2" fill="#fff" opacity=".7"/>
        <circle cx="146" cy="115" r="2" fill="#fff" opacity=".7"/>
        
        <!-- Bochechas rosas -->
        <ellipse cx="55" cy="150" rx="14" ry="8" fill="#f29db5" opacity=".6"/>
        <ellipse cx="185" cy="150" rx="14" ry="8" fill="#f29db5" opacity=".6"/>
        
        <!-- Boquinha relaxada -->
        <path d="M105 155 q15 12 30 0" stroke="#5d4f9e" stroke-width="3" fill="none" stroke-linecap="round"/>
        
        <!-- Unha sendo pintada (animação) -->
        <g id="unha">
          <!-- Mãozinha / unha -->
          <ellipse cx="200" cy="180" rx="10" ry="14" fill="#f7d9e4" stroke="#5d4f9e" stroke-width="2"/>
          <!-- Esmalte sendo aplicado -->
          <ellipse cx="200" cy="180" rx="7" ry="10" fill="#f29db5" opacity=".8">
            <animate attributeName="ry" values="2;10;10" dur="3s" repeatCount="indefinite"/>
          </ellipse>
          <!-- Pincel -->
          <line x1="200" y1="155" x2="200" y2="170" stroke="#8b6b4a" stroke-width="3" stroke-linecap="round"/>
          <rect x="197" y="145" width="6" height="12" fill="#d4a574" rx="2"/>
          <ellipse cx="200" cy="145" rx="3" ry="6" fill="#f29db5"/>
        </g>
        
        <!-- Brilhinhos -->
        <text x="40" y="60" font-size="20" opacity=".8" class="sparkle">✨</text>
        <text x="190" y="70" font-size="16" opacity=".8" class="sparkle">✨</text>
        <text x="60" y="210" font-size="16" opacity=".8" class="sparkle">✨</text>
        <text x="180" y="215" font-size="20" opacity=".8" class="sparkle">✨</text>
      </svg>
    </div>
    
    <p id="spaTexto" style="font-size:17px;margin-top:20px;min-height:24px">Aaah... que delícia 🥒</p>
    
    <!-- Barra de progresso -->
    <div style="width:200px;height:6px;background:#ffffff33;border-radius:6px;margin-top:16px;overflow:hidden">
      <div id="spaProgresso" style="height:100%;width:0%;background:#fff;border-radius:6px;transition:width 1s linear"></div>
    </div>
    
    <p style="opacity:.6;font-size:12px;margin-top:12px">Relaxando por 8 segundos...</p>
  `;
  
  document.body.appendChild(tela);
  
  // Som relaxante (harpa suave, repetido)
  SOM.melodia([N.SOL, N.MI, N.DO, N.MI], 0.5, 'sine', 0.06);
  setTimeout(() => SOM.melodia([N.FA, N.LA, N.DO2, N.LA], 0.5, 'sine', 0.06), 2000);
  setTimeout(() => SOM.melodia([N.SOL, N.MI, N.DO, N.MI], 0.5, 'sine', 0.06), 4000);
  setTimeout(() => SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.5, 'sine', 0.08), 6000);
  
  // Falas que trocam a cada 2 segundos
  const falas = [
    'Aaah... que delícia 😊',
    'Tô relaxando... 😌',
    'Que paz... ✨',
    'Pintando a unha 💅',
    'Ficou linda! 💗'
  ];
  
  const texto = document.getElementById('spaTexto');
  const progresso = document.getElementById('spaProgresso');
  let passo = 0;
  const TOTAL = 8000;
  const PASSO_TEMPO = 1600;
  
  const interval = setInterval(() => {
    passo++;
    if (passo < falas.length) {
      texto.textContent = falas[passo];
    }
    progresso.style.width = Math.min(100, (passo * PASSO_TEMPO / TOTAL) * 100) + '%';
  }, PASSO_TEMPO);
  
  // Depois de 8 segundos, termina
  setTimeout(() => {
    clearInterval(interval);
    progresso.style.width = '100%';
    
    // Aplica benefícios
    S.saude = clamp(S.saude + 15);
    S.humor = clamp(S.humor + 10);
    S.energia = clamp(S.energia + 5);
    save();
    
    // Tela final
    tela.innerHTML = `
      <div style="font-size:80px;animation:bounceIn .6s">✨</div>
      <h1 style="font-size:32px;margin:16px 0 8px">Tô renovada!</h1>
      <p style="font-size:15px;opacity:.9">
        ❤️ +15 · 😊 +10 · 🔋 +5
      </p>
      <p style="font-size:13px;opacity:.7;margin-top:12px">Unhas lindas 💅</p>
    `;
    
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.15, 'sine', 0.12);
    
    setTimeout(() => {
      tela.style.animation = 'fadeOut .5s forwards';
      setTimeout(() => {
        tela.remove();
        say('Tô renovada! 💅✨');
      }, 500);
    }, 2500);
  }, TOTAL);
}
function painelClinica()   { panel('<h3>🏥 Clínica</h3><p style="opacity:.7">Em breve! Vou me cuidar aqui. 💊</p>'); }
function painelBiblioteca(){ panel('<h3>📚 Biblioteca</h3><p style="opacity:.7">Em breve! Vou ler livros aqui. 📖</p>'); }
function painelParque()    { abrirParque(); }
function painelJogos()     { panel('<h3>🎮 Jogos</h3><p style="opacity:.7">Em breve! Vou brincar aqui. 🎲</p>'); }
P.onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;

  // Fechar
  if (d.x === 'close') {
    P.classList.remove('on');
    pararMusicaMercado();
  }
  else if (d.x === 'bolsa') {
    P.classList.remove('on');
    abrirBolsa();
  }
  // Conectar / Desconectar
  else if (d.x === 'conectar') {
    P.classList.remove('on');
    painelConectar();
  }
  else if (d.x === 'desconectar') {
    S.conectado = false;
    S.cidadeId = null;
    save();
    say('Desconectei...');
    P.classList.remove('on');
  }

  // Lugares da cidade
  else if (d.x === 'loja')        { P.classList.remove('on'); painelLoja(); }
  else if (d.x === 'spa')         { P.classList.remove('on'); painelSpa(); }
  else if (d.x === 'clinica')     { P.classList.remove('on'); painelClinica(); }
  else if (d.x === 'biblioteca')  { P.classList.remove('on'); painelBiblioteca(); }
  else if (d.x === 'parque')      { P.classList.remove('on'); painelParque(); }
  else if (d.x === 'jogos')       { P.classList.remove('on'); painelJogos(); }
  else if (d.x === 'boutique')    { P.classList.remove('on'); painelBoutique(); }

  // Coisas antigas
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
/* ============ BOUTIQUE ============ */
let abaAtual = 'cabeca';

function painelBoutique() {
  renderBoutique();
}

function renderBoutique() {
  const abas = {
    cabeca: { emoji: '🌸', nome: 'Cabeça' },
    oculos: { emoji: '🕶️', nome: 'Óculos' },
    olhos:  { emoji: '🎨', nome: 'Olhos'  },
    fundo:  { emoji: '🌌', nome: 'Fundos' }
  };

  // Botões das abas
  let html = '<h3>👗 Boutique</h3>';
  html += `<p style="font-size:13px;opacity:.7;margin:0 0 8px">Você tem: 🪙 ${S.moedas || 0}</p>`;

  // Abas
  html += '<div style="display:flex;gap:6px;margin:12px 0">';
  for (const [id, info] of Object.entries(abas)) {
    const ativo = abaAtual === id;
    html += `<button data-aba="${id}" style="
      flex:1;padding:10px 4px;font-size:12px;
      background:${ativo ? '#f7d9e4' : '#ffffff1a'};
      color:${ativo ? '#1b1824' : '#fff'};
      border:0;border-radius:10px;cursor:pointer;
    ">${info.emoji}<br>${info.nome}</button>`;
  }
  html += '</div>';

  // Itens da aba atual
  const itens = BOUTIQUE[abaAtual] || {};
  const comprados = S.compras || [];
  const equipado = S.equipado || {};

  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';

  for (const [emoji, item] of Object.entries(itens)) {
    const comprado = comprados.includes(emoji);
    const usando = equipado[abaAtual] === emoji;

    html += `
      <div class="item-boutique" data-item="${emoji}" data-aba="${abaAtual}" style="
        background:${usando ? '#f7d9e4' : (comprado ? '#ffffff33' : '#ffffff1a')};
        border-radius:12px;padding:10px 4px;
        text-align:center;cursor:pointer;
        border:2px solid ${usando ? '#f7d9e4' : 'transparent'};
        position:relative;
      ">
        <div style="font-size:28px">${emoji}</div>
        <div style="font-size:10px;opacity:.7;margin-top:2px">${item.nome}</div>
        <div style="font-size:11px;font-weight:bold;margin-top:4px;color:${usando ? '#1b1824' : '#fff'}">
          ${usando ? '✓ USANDO' : (comprado ? 'EQUIPAR' : `${item.preco}🪙`)}
        </div>
      </div>
    `;
  }

  html += '</div>';

  // Botão de tirar
  const temAlgoEquipado = equipado[abaAtual];
  if (temAlgoEquipado) {
    html += `<button id="btnTirar" style="
      font-size:14px;padding:10px;margin-top:12px;
      background:#ff6666;color:#fff;opacity:.8;
    ">🗑️ Tirar ${temAlgoEquipado}</button>`;
  }

  panel(html);

  // Handlers
  setTimeout(() => {
    // Abas
    document.querySelectorAll('[data-aba]:not(.item-boutique)').forEach(b => {
      b.onclick = () => {
        abaAtual = b.dataset.aba;
        renderBoutique();
      };
    });

    // Itens
    document.querySelectorAll('.item-boutique').forEach(el => {
      el.onclick = () => {
        const emoji = el.dataset.item;
        const aba = el.dataset.aba;
        clicarItemBoutique(emoji, aba);
      };
    });

    // Tirar
    const btnTirar = document.getElementById('btnTirar');
    if (btnTirar) {
      btnTirar.onclick = () => {
        const equipado = S.equipado || {};
        equipado[abaAtual] = null;
        S.equipado = equipado;
        save();
        SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
        say('Tirei! 🗑️');
        aplicarVisual();
        renderBoutique();
      };
    }
  }, 100);
}

function clicarItemBoutique(emoji, aba) {
  const item = BOUTIQUE[aba][emoji];
  if (!item) return;

  const comprados = S.compras || [];
  const equipado = S.equipado || {};
  const jaComprou = comprados.includes(emoji);
  const jaUsando = equipado[aba] === emoji;

  // Se já tá usando → desequipa
  if (jaUsando) {
    equipado[aba] = null;
    S.equipado = equipado;
    save();
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
    say('Tirei! 🗑️');
    aplicarVisual();
    renderBoutique();
    return;
  }

  // Se já comprou → só equipa
  if (jaComprou) {
    equipado[aba] = emoji;
    S.equipado = equipado;
    save();
    SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1);
    say('Equipei! ✨');
    aplicarVisual();
    renderBoutique();
    return;
  }

  // Se não comprou → tenta comprar
  if ((S.moedas || 0) < item.preco) {
    say('Não tenho moedas suficientes... 😢');
    return;
  }

  S.moedas -= item.preco;
  comprados.push(emoji);
  S.compras = comprados;
  equipado[aba] = emoji;
  S.equipado = equipado;
  save();
  SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12);
  say('Comprei! ✨');
  aplicarVisual();
  renderBoutique();
}
/* ============ BOLSA ============ */
let bolsaAbaAtual = 'plantas';

function abrirBolsa() {
  bolsaAbaAtual = 'plantas';
  renderBolsa();
}

function abrirBolsaComAba(aba) {
  bolsaAbaAtual = aba;
  renderBolsa();
}

function renderBolsa() {
  const plantas = S.bolsaPlantas || [];
  const borboletas = S.bolsaBorboletas || [];
  const total = plantas.length + borboletas.length;
  const cheio = total >= BOLSA_MAX;
  
  let html = '<h3>🎒 Bolsa</h3>';
  html += `<p style="font-size:13px;opacity:.7;margin:0 0 12px">
    ${total}/${BOLSA_MAX} itens ${cheio ? '· <span style="color:#ff6666">CHEIA</span>' : ''}
  </p>`;
  
  // Abas
  html += `<div style="display:flex;gap:6px;margin:12px 0">
    <button data-bolsa-aba="plantas" style="
      flex:1;padding:10px;font-size:14px;
      background:${bolsaAbaAtual === 'plantas' ? '#f7d9e4' : '#ffffff1a'};
      color:${bolsaAbaAtual === 'plantas' ? '#1b1824' : '#fff'};
      border:0;border-radius:10px;cursor:pointer;
    ">🌱 Plantas (${plantas.length})</button>
    <button data-bolsa-aba="borboletas" style="
      flex:1;padding:10px;font-size:14px;
      background:${bolsaAbaAtual === 'borboletas' ? '#f7d9e4' : '#ffffff1a'};
      color:${bolsaAbaAtual === 'borboletas' ? '#1b1824' : '#fff'};
      border:0;border-radius:10px;cursor:pointer;
    ">🦋 Borboletas (${borboletas.length})</button>
  </div>`;
  
  // Conteúdo
  html += '<div style="max-height:50vh;overflow-y:auto">';
  html += renderBolsaConteudo(bolsaAbaAtual);
  html += '</div>';
  
  // Aviso se cheia
  if (cheio) {
    html += `<p style="font-size:12px;color:#ff6666;text-align:center;margin-top:12px">
      ⚠️ Bolsa cheia! Descartar pra ganhar mais.
    </p>`;
  }
  
  panel(html);
  
  // Handlers
  setTimeout(() => {
    document.querySelectorAll('[data-bolsa-aba]').forEach(b => {
      b.onclick = () => abrirBolsaComAba(b.dataset.bolsaAba);
    });
    
    document.querySelectorAll('[data-item-idx]').forEach(el => {
      el.onclick = () => {
        const tipo = el.dataset.itemTipo;
        const idx = Number(el.dataset.itemIdx);
        abrirItemBolsa(tipo, idx);
      };
    });
  }, 100);
}

function renderBolsaConteudo(tipo) {
  if (tipo === 'plantas') {
    const plantas = S.bolsaPlantas || [];
    if (plantas.length === 0) {
      return '<p style="opacity:.5;text-align:center;padding:30px">Nenhuma planta ainda... 🌱</p>';
    }
    
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    
    plantas.forEach((semente, i) => {
      // Verifica se tá equipada em algum canteiro
      const canteiro = (S.canteiros || []).findIndex(c => c && c.sementeIdx === i);
      const equipada = canteiro >= 0;
      
      // Estágio atual (se equipada)
      let estagio = 0;
      if (equipada) {
        const c = S.canteiros[canteiro];
        estagio = c.crescendo || 0;
      }
      
      const esp = ESPECIES.plantas[semente];
      const svg = svgPlanta(semente, equipada ? estagio : 100);
      const cor = RARIDADE_COR[esp?.raridade] || '#888';
      
      html += `
        <div class="item-bolsa" data-item-idx="${i}" data-item-tipo="plantas" style="
          background:rgba(255,255,255,.1);
          border-radius:12px;padding:8px;text-align:center;cursor:pointer;
          border:2px solid ${equipada ? '#7BC47F' : 'rgba(255,255,255,.2)'};
          position:relative;
        ">
          <div style="position:absolute;top:4px;right:6px;width:6px;height:6px;border-radius:50%;background:${cor}"></div>
          <div style="width:60px;height:60px;margin:0 auto">${svg}</div>
          <div style="font-size:10px;margin-top:4px">${esp?.nome || semente}</div>
          ${equipada ? `<div style="font-size:9px;color:#7BC47F;font-weight:bold;margin-top:2px">✓ ${estagio}%</div>` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  if (tipo === 'borboletas') {
    const borboletas = S.bolsaBorboletas || [];
    if (borboletas.length === 0) {
      return '<p style="opacity:.5;text-align:center;padding:30px">Nenhuma borboleta ainda... 🦋</p>';
    }
    
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    
    borboletas.forEach((tipoB, i) => {
      const esp = ESPECIES.borboletas[tipoB];
      const svg = SVG_BORBOLETA[tipoB] || '';
      const cor = RARIDADE_COR[esp?.raridade] || '#888';
      
      // Verifica se tá equipada em alguma planta
      const equipada = (S.borboletasParque || []).some(b => b.bolsaIdx === i);
      
      html += `
        <div class="item-bolsa" data-item-idx="${i}" data-item-tipo="borboletas" style="
          background:rgba(255,255,255,.1);
          border-radius:12px;padding:8px;text-align:center;cursor:pointer;
          border:2px solid ${equipada ? '#7BC47F' : 'rgba(255,255,255,.2)'};
          position:relative;
        ">
          <div style="position:absolute;top:4px;right:6px;width:6px;height:6px;border-radius:50%;background:${cor}"></div>
          <div style="width:60px;height:50px;margin:0 auto">${svg}</div>
          <div style="font-size:10px;margin-top:4px">${esp?.nome || tipoB}</div>
          ${equipada ? `<div style="font-size:9px;color:#7BC47F;font-weight:bold;margin-top:2px">✓ no parque</div>` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  return '';
}

function abrirItemBolsa(tipo, idx) {
  const item = tipo === 'plantas' ? S.bolsaPlantas[idx] : S.bolsaBorboletas[idx];
  if (!item) return;
  
  const esp = tipo === 'plantas' 
    ? ESPECIES.plantas[item] 
    : ESPECIES.borboletas[item];
  
  let html = `<h3>${esp?.nome || item}</h3>`;
  html += `<p style="font-size:12px;opacity:.7;margin:8px 0">
    Raridade: <b style="color:${RARIDADE_COR[esp?.raridade] || '#888'}">${esp?.raridade || '?'}</b>
  </p>`;
  
  if (tipo === 'plantas') {
    html += `<button data-acao="equipar-planta" data-idx="${idx}" style="font-size:15px;padding:12px">🌱 Equipar num canteiro</button>`;
  } else {
    html += `<button data-acao="equipar-borboleta" data-idx="${idx}" style="font-size:15px;padding:12px">🦋 Equipar numa planta</button>`;
  }
  
  html += `<button data-acao="descartar" data-tipo="${tipo}" data-idx="${idx}" style="
    font-size:14px;padding:10px;margin-top:8px;
    background:#ff666688;color:#fff;
  ">🗑️ Descartar</button>`;
  
  panel(html);
  
  setTimeout(() => {
    document.querySelectorAll('[data-acao]').forEach(b => {
      b.onclick = () => {
        const acao = b.dataset.acao;
        if (acao === 'descartar') {
          descartarItem(b.dataset.tipo, Number(b.dataset.idx));
        } else if (acao === 'equipar-planta') {
          escolherCanteiroParaSemente(Number(b.dataset.idx));
        } else if (acao === 'equipar-borboleta') {
          escolherPlantaParaBorboleta(Number(b.dataset.idx));
        }
      };
    });
  }, 100);
}

function descartarItem(tipo, idx) {
  const item = tipo === 'plantas' ? S.bolsaPlantas[idx] : S.bolsaBorboletas[idx];
  if (!item) return;
  
  const esp = tipo === 'plantas' ? ESPECIES.plantas[item] : ESPECIES.borboletas[item];
  
  if (!confirm(`Descartar ${esp?.nome || item}?`)) return;
  
  // Se for planta equipada, tira do canteiro
  if (tipo === 'plantas') {
    const ci = (S.canteiros || []).findIndex(c => c && c.sementeIdx === idx);
    if (ci >= 0) S.canteiros[ci] = null;
    S.bolsaPlantas.splice(idx, 1);
  } else {
    // Se for borboleta equipada, tira do parque
    S.borboletasParque = (S.borboletasParque || []).filter(b => b.bolsaIdx !== idx);
    S.bolsaBorboletas.splice(idx, 1);
  }
  
  save();
  SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
  say('Descartei! 🗑️');
  renderBolsa();
}

/* ============ EQUIPAR SEMENTE NUM CANTEIRO ============ */
function escolherCanteiroParaSemente(idxSemente) {
  const canteiros = S.canteiros || [];
  
  let html = '<h3>🌱 Escolher canteiro</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">';
  
  for (let i = 0; i < 7; i++) {
    const c = canteiros[i];
    const vazio = !c;
    
    html += `
      <div class="escolher-canteiro" data-slot="${i}" style="
        background:${vazio ? '#ffffff1a' : '#ffffff0a'};
        border:2px dashed ${vazio ? '#7BC47F' : '#ffffff33'};
        border-radius:12px;padding:12px;text-align:center;
        cursor:${vazio ? 'pointer' : 'not-allowed'};
        opacity:${vazio ? 1 : .4};
      ">
        <div style="font-size:24px">${vazio ? '🟫' : '🌿'}</div>
        <div style="font-size:10px;margin-top:4px">${vazio ? 'vazio' : 'ocupado'}</div>
      </div>
    `;
  }
  
  html += '</div>';
  panel(html);
  
  setTimeout(() => {
    document.querySelectorAll('.escolher-canteiro').forEach(el => {
      el.onclick = () => {
        const slot = Number(el.dataset.slot);
        if (canteiros[slot]) {
          say('Esse canteiro tá ocupado! 🌿');
          return;
        }
        equiparSemente(slot, idxSemente);
      };
    });
  }, 100);
}

function equiparSemente(slot, idxSemente) {
  const semente = S.bolsaPlantas[idxSemente];
  if (!semente) return;
  
  S.canteiros = S.canteiros || [];
  S.canteiros[slot] = {
    semente: semente,
    sementeIdx: idxSemente,
    crescendo: 0,
    regasHoje: 0,
    ultimaRegaData: '',
    plantadaEm: Date.now()
  };
  
  save();
  SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1);
  say('Plantei! 🌱');
  P.classList.remove('on');
  
  // Atualiza o parque se estiver aberto
  if (document.getElementById('telaParque')) {
    renderCanteiros();
  }
}

/* ============ EQUIPAR BORBOLETA NUMA PLANTA ============ */
function escolherPlantaParaBorboleta(idxBorboleta) {
  const canteiros = S.canteiros || [];
  const plantasDisponiveis = [];
  
  for (let i = 0; i < 7; i++) {
    const c = canteiros[i];
    if (c && c.crescendo >= 70) {
      plantasDisponiveis.push({ slot: i, canteiro: c });
    }
  }
  
  if (plantasDisponiveis.length === 0) {
    say('Precisa de uma planta florida! 🌸');
    return;
  }
  
  // Se só tem 1, equipa direto
  if (plantasDisponiveis.length === 1) {
    equiparBorboleta(plantasDisponiveis[0].slot, idxBorboleta);
    return;
  }
  
  // Várias: escolhe
  let html = '<h3>🦋 Escolher planta</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">';
  
  plantasDisponiveis.forEach(p => {
    const esp = ESPECIES.plantas[p.canteiro.semente];
    const svg = svgPlanta(p.canteiro.semente, 100);
    html += `
      <div class="escolher-planta" data-slot="${p.slot}" style="
        background:#ffffff1a;border:2px solid #7BC47F;
        border-radius:12px;padding:8px;text-align:center;cursor:pointer;
      ">
        <div style="width:60px;height:60px;margin:0 auto">${svg}</div>
        <div style="font-size:10px;margin-top:4px">${esp?.nome || '?'}</div>
      </div>
    `;
  });
  
  html += '</div>';
  panel(html);
  
  setTimeout(() => {
    document.querySelectorAll('.escolher-planta').forEach(el => {
      el.onclick = () => equiparBorboleta(Number(el.dataset.slot), idxBorboleta);
    });
  }, 100);
}

function equiparBorboleta(slot, idxBorboleta) {
  const borboleta = S.bolsaBorboletas[idxBorboleta];
  if (!borboleta) return;
  
  // Limite de 3 borboletas por pessoa
  if ((S.borboletasParque || []).length >= 3) {
    say('Máximo 3 borboletas no parque! 🦋');
    return;
  }
  
  S.borboletasParque = S.borboletasParque || [];
  S.borboletasParque.push({
    tipo: borboleta,
    slot: slot,
    bolsaIdx: idxBorboleta,
    nasceu: Date.now()
  });
  
  save();
  SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12);
  say('Borboleta equipada! 🦋');
  P.classList.remove('on');
  
  // Atualiza o parque se estiver aberto
  if (document.getElementById('telaParque')) {
    renderCanteiros();
  }
}
/* ============ PRESENTE ============ */
function tentarPresente(chance) {
  // chance: 0.20 = 20%, 0.30 = 30%, etc
  if (Math.random() > chance) return;
  
  // Verifica se bolsa tá cheia
  const totalBolsa = (S.bolsaPlantas || []).length + (S.bolsaBorboletas || []).length;
  if (totalBolsa >= BOLSA_MAX) {
    say('Bolsa cheia! Não consigo pegar presente 🎒');
    return;
  }
  
  // Se já tem um presente na tela, não cria outro
  if (document.getElementById('presenteFlutuante')) return;
  
  // Cria o presente flutuante
  const presente = document.createElement('div');
  presente.id = 'presenteFlutuante';
  presente.textContent = '🎁';
  presente.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 80px;
    cursor: pointer;
    z-index: 250;
    animation: presentePulsa 1s ease-in-out infinite;
    filter: drop-shadow(0 4px 12px rgba(247,217,228,.8));
    user-select: none;
  `;
  document.body.appendChild(presente);
  
  presente.onclick = () => {
    presente.remove();
    abrirPresente();
  };
  
  // Some sozinho depois de 15s se não clicar
  setTimeout(() => {
    if (document.getElementById('presenteFlutuante')) {
      presente.remove();
      say('O presente fugiu... 🎁💨');
    }
  }, 15000);
}

function abrirPresente() {
  // Sorteia tipo de presente
  const r = Math.random();
  let escolhido = 'semente';
  if (r < 0.71) escolhido = 'semente';        // 71%
  else if (r < 0.97) escolhido = 'ovo';       // 26%
  else escolhido = 'borboleta';               // 3%
  
  if (escolhido === 'semente') {
    const plantas = Object.keys(ESPECIES.plantas);
    const semente = rnd(plantas);
    S.bolsaPlantas = S.bolsaPlantas || [];
    S.bolsaPlantas.push(semente);
    save();
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.12);
    set('surprised', 3000, '🎁 Semente de ' + ESPECIES.plantas[semente].nome + '!');
    
  } else if (escolhido === 'ovo') {
    const borb = rnd(Object.keys(ESPECIES.borboletas));
    S.bolsaBorboletas = S.bolsaBorboletas || [];
    S.bolsaBorboletas.push('ovo-' + borb);
    save();
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.12);
    set('surprised', 3000, '🎁 Um ovo misterioso!');
    
  } else {
    const borb = rnd(Object.keys(ESPECIES.borboletas));
    S.bolsaBorboletas = S.bolsaBorboletas || [];
    S.bolsaBorboletas.push(borb);
    save();
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2, N.MI, N.SOL], 0.12, 'sine', 0.14);
    set('surprised', 4000, '🎁 Borboleta ' + ESPECIES.borboletas[borb].nome + '!');
  }
  
  // Animação de brilho
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      heart(innerWidth / 2 + (Math.random() - 0.5) * 200, innerHeight / 2);
    }, i * 150);
  }
}
/* ============ PARQUE ============ */
function abrirParque() {
  tocarSomJardim();
  
  const parque = document.createElement('div');
  parque.id = 'telaParque';
  parque.style.cssText = `
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 40%, #8FBC8F 40%, #6B8E23 100%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    color: #fff;
    overflow: hidden;
    animation: fadeIn .4s;
  `;
  parque.innerHTML = `
     <!-- CÉU -->
    <div style="
      position:absolute;
      inset:0;
      background:linear-gradient(
        180deg,
        #BFE8F5 0%,
        #DDF3F2 38%,
        #B9D99B 38%,
        #8DBB70 100%
      );
      z-index:0;
    "></div>

    <!-- NUVENS DELICADAS -->
    <div style="
      position:absolute;
      top:75px;
      left:12%;
      width:75px;
      height:25px;
      background:rgba(255,255,255,.65);
      border-radius:30px;
      z-index:1;
    ">
      <div style="
        position:absolute;
        width:35px;
        height:35px;
        left:12px;
        top:-18px;
        background:rgba(255,255,255,.65);
        border-radius:50%;
      "></div>
      <div style="
        position:absolute;
        width:30px;
        height:30px;
        right:12px;
        top:-13px;
        background:rgba(255,255,255,.65);
        border-radius:50%;
      "></div>
    </div>

    <div style="
      position:absolute;
      top:125px;
      right:10%;
      width:60px;
      height:20px;
      background:rgba(255,255,255,.5);
      border-radius:30px;
      z-index:1;
    ">
      <div style="
        position:absolute;
        width:28px;
        height:28px;
        left:8px;
        top:-14px;
        background:rgba(255,255,255,.5);
        border-radius:50%;
      "></div>
    </div>

    <!-- SOL SUAVE -->
    <div style="
      position:absolute;
      top:72px;
      right:28px;
      width:48px;
      height:48px;
      border-radius:50%;
      background:#FFE9A8;
      box-shadow:0 0 25px rgba(255,220,120,.45);
      z-index:1;
    "></div>

    <!-- CAMADA DE FUNDO -->
    <div style="
      position:absolute;
      left:-10%;
      right:-10%;
      top:34%;
      height:20%;
      background:#7EAB68;
      border-radius:50% 50% 0 0;
      opacity:.65;
      z-index:2;
    "></div>

    <!-- ÁRVORES DO FUNDO -->
    <div style="
      position:absolute;
      top:28%;
      left:3%;
      width:75px;
      height:120px;
      z-index:3;
    ">
      <div style="
        position:absolute;
        left:32px;
        bottom:0;
        width:12px;
        height:65px;
        background:#8B6242;
        border-radius:8px;
      "></div>

      <div style="
        position:absolute;
        left:0;
        top:0;
        width:75px;
        height:75px;
        background:#60965D;
        border-radius:48% 52% 45% 55%;
      "></div>
    </div>

    <div style="
      position:absolute;
      top:30%;
      right:2%;
      width:85px;
      height:125px;
      z-index:3;
    ">
      <div style="
        position:absolute;
        left:36px;
        bottom:0;
        width:13px;
        height:70px;
        background:#8B6242;
        border-radius:8px;
      "></div>

      <div style="
        position:absolute;
        left:0;
        top:0;
        width:85px;
        height:82px;
        background:#6A9D61;
        border-radius:50% 45% 55% 48%;
      "></div>
    </div>

    <!-- CHÃO PRINCIPAL -->
    <div style="
      position:absolute;
      left:-5%;
      right:-5%;
      top:47%;
      bottom:0;
      background:#91BD73;
      border-radius:50% 50% 0 0;
      z-index:4;
    "></div>

    <!-- CAMINHO -->
    <div style="
      position:absolute;
      left:50%;
      top:48%;
      transform:translateX(-50%);
      width:110px;
      height:52%;
      background:#D9C69A;
      border-radius:55px 55px 0 0;
      opacity:.8;
      z-index:5;
    "></div>

    <!-- LAGO CENTRAL -->
    <div style="
      position:absolute;
      left:50%;
      top:53%;
      transform:translateX(-50%);
      width:190px;
      height:105px;
      background:#79BBD0;
      border-radius:50%;
      box-shadow:
        inset 0 -8px 15px rgba(54,112,130,.18),
        0 5px 12px rgba(65,100,65,.15);
      z-index:6;
    ">
      <!-- brilho da água -->
      <div style="
        position:absolute;
        top:27px;
        left:32px;
        width:45px;
        height:6px;
        border-radius:50%;
        background:rgba(255,255,255,.42);
      "></div>

      <div style="
        position:absolute;
        top:55px;
        right:30px;
        width:30px;
        height:5px;
        border-radius:50%;
        background:rgba(255,255,255,.32);
      "></div>

      <!-- pequena margem -->
      <div style="
        position:absolute;
        left:8px;
        right:8px;
        bottom:-3px;
        height:12px;
        border-radius:50%;
        background:rgba(92,128,69,.22);
      "></div>
    </div>

    <!-- ESPAÇO PARA LÓTUS -->
    <div style="
      position:absolute;
      left:50%;
      top:61%;
      transform:translateX(-50%);
      font-size:22px;
      z-index:7;
      opacity:.85;
    ">✿</div>

    <!-- PEQUENOS DETALHES DO GRAMADO -->
    <div style="
      position:absolute;
      left:18%;
      top:60%;
      width:35px;
      height:8px;
      border-top:2px solid rgba(70,120,60,.45);
      border-radius:50%;
      transform:rotate(-12deg);
      z-index:7;
    "></div>

    <div style="
      position:absolute;
      right:18%;
      top:67%;
      width:30px;
      height:8px;
      border-top:2px solid rgba(70,120,60,.4);
      border-radius:50%;
      transform:rotate(15deg);
      z-index:7;
    "></div>

    <!-- TÍTULO -->
    <div style="
      position:absolute;
      top:15px;
      left:50%;
      transform:translateX(-50%);
      text-align:center;
      color:#31553A;
      z-index:30;
      text-shadow:0 1px 2px rgba(255,255,255,.5);
    ">
      <h2 style="
        margin:0;
        font-size:22px;
        font-weight:700;
      ">Parque</h2>

      <p style="
        margin:4px 0;
        font-size:12px;
        opacity:.8;
      ">
        <span id="contagemParque"></span>
      </p>
    </div>

    <!-- BOTÃO SAIR -->
    <button id="sairParque" style="
      position:absolute;
      top:calc(env(safe-area-inset-top, 0px) + 15px);
      left:15px;
      background:rgba(255,255,255,.72);
      color:#31553A;
      border:1px solid rgba(70,110,70,.15);
      border-radius:22px;
      padding:10px 17px;
      font-size:15px;
      cursor:pointer;
      z-index:40;
      box-shadow:0 3px 10px rgba(60,90,60,.12);
      backdrop-filter:blur(8px);
    ">← Sair</button>

    <!-- BOTÃO BOLSA -->
    <button id="btnBolsaParque" style="
      position:absolute;
      top:calc(env(safe-area-inset-top, 0px) + 15px);
      right:15px;
      background:rgba(255,255,255,.72);
      color:#31553A;
      border:1px solid rgba(70,110,70,.15);
      border-radius:22px;
      padding:10px 17px;
      font-size:15px;
      cursor:pointer;
      z-index:40;
      box-shadow:0 3px 10px rgba(60,90,60,.12);
      backdrop-filter:blur(8px);
    ">🎒 Bolsa</button>

    <!-- CANTEIROS -->
    <div id="canteiros" style="
      position:absolute;
      left:0;
      right:0;
      bottom:0;
      min-height:105px;
      padding:12px;
      padding-bottom:calc(env(safe-area-inset-bottom, 0px) + 12px);
      display:grid;
      grid-template-columns:repeat(4, minmax(65px,1fr));
      gap:8px;
      background:linear-gradient(
        180deg,
        rgba(71,103,54,0) 0%,
        rgba(71,103,54,.12) 25%,
        rgba(71,103,54,.3) 100%
      );
      z-index:20;
      overflow-y:auto;
      max-height:30%;
    "></div>
`;

  
  document.body.appendChild(parque);
  
  // Renderiza canteiros
  renderCanteiros();
  
  // Handlers dos botões (Sair e Bolsa)
  setTimeout(() => {
    const btnSair = document.getElementById('sairParque');
    if (btnSair) {
      btnSair.onclick = () => {
        pararSomJardim();
        parque.remove();
      };
    }
    
    const btnBolsa = document.getElementById('btnBolsaParque');
    if (btnBolsa) {
      btnBolsa.onclick = () => abrirBolsa();
    }
  }, 100);
  
  // 🎁 Tenta dar presente (20% de chance)
  setTimeout(() => tentarPresente(0.20), 2000);
}

function renderCanteiros() {
  const container = document.getElementById('canteiros');
  if (!container) return;
  
  const canteiros = S.canteiros || [];
  const max = 7;
  
  let html = '';
  for (let i = 0; i < max; i++) {
    const canteiro = canteiros[i];
    
    if (canteiro && canteiro.semente) {
      // Canteiro com planta
      const svg = svgPlanta(canteiro.semente, canteiro.crescendo || 0);
      html += `
        <div class="canteiro-cheio" data-slot="${i}" style="
          background:rgba(255,255,255,.15);
          border-radius:12px;
          padding:8px 4px;
          text-align:center;
          cursor:pointer;
          border:2px solid rgba(255,255,255,.3);
        ">
          <div style="width:100%;height:60px">${svg}</div>
          <div style="font-size:10px;opacity:.9;margin-top:4px">${canteiro.crescendo || 0}%</div>
        </div>
      `;
    } else {
      // Canteiro vazio
      html += `
        <div class="canteiro-vazio" data-slot="${i}" style="
          background:rgba(0,0,0,.2);
          border-radius:12px;
          padding:8px 4px;
          text-align:center;
          cursor:pointer;
          border:2px dashed rgba(255,255,255,.3);
        ">
          <div style="font-size:30px;opacity:.4;padding:15px 0">+</div>
          <div style="font-size:10px;opacity:.6">plantar</div>
        </div>
      `;
    }
  }
  
  container.innerHTML = html;
  
  // Atualiza contagem
  const contagem = document.getElementById('contagemParque');
  if (contagem) {
    const ocupados = (S.canteiros || []).filter(c => c && c.semente).length;
    contagem.textContent = `${ocupados}/${max} plantas · 🦋 ${(S.bolsaBorboletas || []).length} na bolsa`;
  }
  
  // Handlers
  setTimeout(() => {
    document.querySelectorAll('.canteiro-vazio').forEach(el => {
      el.onclick = () => {
        const slot = Number(el.dataset.slot);
        plantarNoCanteiro(slot);
      };
    });
    
    document.querySelectorAll('.canteiro-cheio').forEach(el => {
      el.onclick = () => {
        const slot = Number(el.dataset.slot);
        regarCanteiro(slot);
      };
    });
  }, 100);
}

function plantarNoCanteiro(slot) {
  const bolsa = S.bolsaPlantas || [];
  
  if (bolsa.length === 0) {
    say('Bolsa vazia! Ganhe sementes primeiro 🌱');
    return;
  }
  
  // Se só tem 1 semente, planta direto
  if (bolsa.length === 1) {
    S.canteiros = S.canteiros || [];
    S.canteiros[slot] = {
      semente: bolsa[0],
      sementeIdx: 0,
      crescendo: 0,
      regasHoje: 0,
      ultimaRegaData: '',
      plantadaEm: Date.now()
    };
    save();
    SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1);
    say('Plantei! 🌱');
    renderCanteiros();
    return;
  }
  
  // Várias sementes: abre painel de escolha
  let html = '<h3>🌱 Escolher semente</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
  
  bolsa.forEach((semente, idx) => {
    const esp = ESPECIES.plantas[semente];
    const svg = svgPlanta(semente, 100);
    html += `
      <div class="escolher-semente" data-idx="${idx}" style="
        background:rgba(255,255,255,.15);
        border-radius:12px;
        padding:8px;
        text-align:center;
        cursor:pointer;
      ">
        <div style="width:60px;height:60px;margin:0 auto">${svg}</div>
        <div style="font-size:10px;margin-top:4px">${esp?.nome || semente}</div>
      </div>
    `;
  });
  
  html += '</div>';
  panel(html);
  
  setTimeout(() => {
    document.querySelectorAll('.escolher-semente').forEach(el => {
      el.onclick = () => {
        const idx = Number(el.dataset.idx);
        const semente = S.bolsaPlantas[idx];
        if (!semente) return;
        
        S.canteiros = S.canteiros || [];
        S.canteiros[slot] = {
          semente: semente,
          sementeIdx: idx,
          crescendo: 0,
          regasHoje: 0,
          ultimaRegaData: '',
          plantadaEm: Date.now()
        };
        save();
        SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1);
        say('Plantei! 🌱');
        P.classList.remove('on');
        renderCanteiros();
      };
    });
  }, 100);
}

function regarCanteiro(slot) {
  const canteiro = (S.canteiros || [])[slot];
  if (!canteiro) return;
  
  // Checa regas do dia
  const hoje = new Date().toDateString();
  const ultimaRega = canteiro.ultimaRegaData || '';
  
  if (ultimaRega !== hoje) {
    canteiro.regasHoje = 0;
    canteiro.ultimaRegaData = hoje;
  }
  
  if (canteiro.regasHoje >= 3) {
    say('Já reguei 3 vezes hoje 💧');
    return;
  }
  
  if (canteiro.crescendo >= 100) {
    say('Já tá pronta! 🌸');
    return;
  }
  
  canteiro.regasHoje++;
  canteiro.crescendo = Math.min(100, canteiro.crescendo + 10);
  canteiro.ultimaRega = Date.now();
  S.canteiros[slot] = canteiro;
  save();
  
  SOM.melodia([N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.08);
  say('Reguei! 💧 +10%');
  renderCanteiros();
}
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
  
  // Gera preferências
  const p = gerarPreferencias();
  S.favoritas = p.favoritas;
  S.detestadas = p.detestadas;
  
  P.classList.remove('on');
  say('Eu sou ' + k + '! ✨');
  save();
  
  // Mostra as preferências (fofo!)
  setTimeout(() => {
    say('Adoro ' + S.favoritas.join(' ') + ' 💗');
  }, 2800);
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
  const moedasHtml =
    `<div class="st" style="font-size:14px">🪙 <b>${S.moedas || 0}</b> moedas</div>`;
  $('estado').innerHTML =
    nomeHtml +
    moedasHtml +
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
aplicarVisual();   // ← ADICIONA (aplica o que tava equipado)
if (!S.modo) setTimeout(modoPanel, 400);
else iniciarModo();
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
    location.reload();
  };
  document.body.appendChild(aviso);
}
