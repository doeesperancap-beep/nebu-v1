/* ============ 2. ESTADO ============ */
const SAVE_KEY = 'nebula-v2';
const DEFAULT = {
  modo: null,
  nome: null,
  id: null,
  moedas: 0,
  conectado: false,
  cidadeId: null,
  energia: 100, fome: 100, saude: 100, humor: 100, limpeza: 100,
  bond: 0, pers: null, sick: 0, greet: '',
  food: {}, pref: null, dis: null,
  places: {}, mem: [], lastDance: null,
  estoque: { '🍎': 3, '🍓': 2, '🥭': 1, '🍕': 0, '🍰': 0 },
  favoritas: [],
  detestadas: [],
  compras: [],
  ingredientes: {},
  docesProntos: [],
  equipado: { cabeca: null, oculos: null, olhos: null, fundo: null },
  recordeDino: 0,
  last: Date.now()
};

function gerarPreferencias() {
  const todas = Object.keys(CATALOGO);
  const favoritas = [];
  while (favoritas.length < 3) {
    const c = todas[Math.floor(Math.random() * todas.length)];
    if (!favoritas.includes(c)) favoritas.push(c);
  }
  const detestadas = [];
  while (detestadas.length < 3) {
    const c = todas[Math.floor(Math.random() * todas.length)];
    if (!favoritas.includes(c) && !detestadas.includes(c)) detestadas.push(c);
  }
  return { favoritas, detestadas };
}

function gerarID(nome) {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codigo = Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join('');
  const nomeLimpo = (nome || 'NEBO').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'NEBO';
  return `NB-${nomeLimpo}-${codigo}`;
}

let S = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    const s = raw ? { ...DEFAULT, ...raw } : { ...DEFAULT };
    if (!s.ingredientes) s.ingredientes = {};
    if (!s.docesProntos) s.docesProntos = [];
    const MIGRACAO_ING = { '🥛': 'ing_leite', '🌾': 'ing_farinha', '🥚': 'ing_ovo', '🍬': 'ing_acucar', '🍫': 'ing_chocolate' };
    Object.entries(MIGRACAO_ING).forEach(([antiga, nova]) => {
      if (s.ingredientes[antiga]) {
        s.ingredientes[nova] = (s.ingredientes[nova] || 0) + s.ingredientes[antiga];
        delete s.ingredientes[antiga];
      }
    });
    return s;
  } catch { return { ...DEFAULT }; }
})();

const awayAtBoot = Math.max(0, (Date.now() - S.last) / 60000);

function save() {
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {}
}

function ganharMoedas(qtd) {
  if (!qtd) return;
  S.moedas = (S.moedas || 0) + qtd;
  save();
  mostrarMoedas(qtd);
}

function mostrarMoedas(qtd) {
  const toast = document.createElement('div');
  toast.textContent = `🪙 +${qtd}`;
  toast.style.cssText = `position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #f7d9e4; color: #1b1824; padding: 10px 20px; border-radius: 22px; font-size: 18px; font-weight: bold; z-index: 9999; pointer-events: none; box-shadow: 0 4px 20px rgba(247,217,228,.5); animation: moedaSobe 1.6s ease-out forwards;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

function decay(min, mul = 1) {
  if (!Number.isFinite(min) || min <= 0) return;
  S.energia = clamp(S.energia - .4 * min * mul);
  S.fome    = clamp(S.fome    - .5 * min * mul);
  S.limpeza = clamp(S.limpeza - .25 * min * mul);
  const extra = (S.fome < 30 || S.energia < 30 || S.limpeza < 30) ? .3 : 0;
  S.humor  = clamp(S.humor - (.3 + extra + (S.sick > Date.now() ? .3 : 0)) * min);
  S.saude  = clamp(S.saude + ((S.fome < 20 || S.energia < 20 || S.limpeza < 15) ? -.5 : .3) * min);
}

function offline(min) {
  min = Math.min(min, 480);
  decay(min * .4);
  if (min > 240) S.energia = Math.max(S.energia, 60);
  ['energia', 'fome', 'saude', 'humor'].forEach(k => S[k] = Math.max(S[k], 20));
}

offline(awayAtBoot);
S.last = Date.now();

const isNight = () => { const h = new Date().getHours(); return h >= 22 || h < 6; };
const baseMood = () => S.sick > Date.now() ? 'sick' : (isNight() || S.energia < 20) ? 'sleepy' : (S.humor < 25 || S.fome < 20) ? 'sad' : 'neutral';
