/* ============================================================
   NÉBULA — mundo.js
   Cidade em linha reta (painel só-leitura das Nebos do Firebase)
   ============================================================ */

/* ---------- Configuração da cidade ---------- */
window.CIDADE = {
  altura: 320,
  calcadaAltura: 62,
  alturaPredio: 150,
  predios: [
    { id: 'biblioteca',   nome: 'Biblioteca',   x: 30,   largura: 135 },
    { id: 'boutique',     nome: 'Boutique',     x: 190,  largura: 135 },
    { id: 'mercado',      nome: 'Mercado',      x: 350,  largura: 135 },
    { id: 'cafeteria',    nome: 'Cafeteria',    x: 510,  largura: 135 },
    { id: 'clinica',      nome: 'Clínica',      x: 670,  largura: 135 },
    { id: 'spa',          nome: 'SPA',          x: 830,  largura: 135 },
    { id: 'observatorio', nome: 'Observatório', x: 990,  largura: 135 }
  ],
  praca: { id: 'praca', nome: 'Praça', x: 1150, largura: 330 },
  poste: { largura: 29, altura: 120 }
};

/* ---------- SVGs dos prédios (inline) ---------- */
const SVG_PREDIO = {
  biblioteca: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="Biblioteca"><rect x="2" y="34" width="76" height="56" fill="#F6E6C9"/><polygon points="-2,36 40,8 82,36" fill="#B9824F" stroke="#8D5A34" stroke-width="1.5" stroke-linejoin="round"/><rect x="0" y="34" width="80" height="5" fill="#8D5A34"/><circle cx="40" cy="24" r="10" fill="#8D5A34" stroke="#F6E6C9" stroke-width="2"/><rect x="33" y="19" width="6.5" height="9" fill="#fff"/><rect x="40.5" y="19" width="6.5" height="9" fill="#fff"/><g fill="#FFE9A8" opacity="0.45"><rect x="10" y="48" width="12" height="20"/><rect x="58" y="48" width="12" height="20"/></g><g fill="#FFF6E3"><rect x="4" y="40" width="8" height="46"/><rect x="20" y="40" width="8" height="46"/><rect x="52" y="40" width="8" height="46"/><rect x="68" y="40" width="8" height="46"/></g><rect x="12" y="52" width="8" height="14" fill="#FFE9A8"/><rect x="60" y="52" width="8" height="14" fill="#FFE9A8"/><path d="M32 90 V68 a8 8 0 0 1 16 0 V90Z" fill="#7A4A2A"/><rect x="0" y="86" width="80" height="4" fill="#E0CFAE"/></svg>`,

  boutique: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="Boutique"><rect x="2" y="30" width="76" height="60" fill="#FBDDF0"/><circle cx="16" cy="28" r="10" fill="#fff"/><circle cx="32" cy="21" r="12" fill="#fff"/><circle cx="48" cy="21" r="12" fill="#fff"/><circle cx="64" cy="28" r="10" fill="#fff"/><rect x="6" y="28" width="68" height="8" fill="#fff"/><circle cx="40" cy="24" r="10" fill="#C45BD8"/><polygon points="40,17 43,21 45,31 35,31 37,21" fill="#fff"/><g fill="#FFE9A8" opacity="0.45"><rect x="3" y="59" width="22" height="22" rx="3"/><rect x="55" y="59" width="22" height="22" rx="3"/></g><rect x="6" y="62" width="16" height="16" rx="2" fill="#FFE9A8" stroke="#8A4FD0" stroke-width="2"/><rect x="58" y="62" width="16" height="16" rx="2" fill="#FFE9A8" stroke="#8A4FD0" stroke-width="2"/><path d="M30 90 V68 a10 10 0 0 1 20 0 V90Z" fill="#FFE9A8" stroke="#8A4FD0" stroke-width="3"/><rect x="0" y="44" width="80" height="6" fill="#F06BB5"/><g fill="#F06BB5"><circle cx="5" cy="50" r="5"/><circle cx="15" cy="50" r="5"/><circle cx="25" cy="50" r="5"/><circle cx="35" cy="50" r="5"/><circle cx="45" cy="50" r="5"/><circle cx="55" cy="50" r="5"/><circle cx="65" cy="50" r="5"/><circle cx="75" cy="50" r="5"/></g></svg>`,

  mercado: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="Mercado"><rect x="2" y="34" width="76" height="56" fill="#F6EFCF"/><path d="M0 38 Q40 -8 80 38Z" fill="#3FA05A"/><circle cx="40" cy="23" r="10" fill="#fff" stroke="#2E7D45" stroke-width="2"/><circle cx="40" cy="25" r="5" fill="#E0443E"/><path d="M40 20 q3 -4 6 -3 q-2 4 -6 3Z" fill="#4CAF50"/><rect x="6" y="58" width="68" height="32" fill="#8A5A32"/><rect x="8" y="58" width="64" height="8" fill="#FFE9A8" opacity="0.4"/><g><circle cx="15" cy="65" r="4" fill="#E0443E"/><circle cx="26" cy="65" r="4" fill="#F5A623"/><circle cx="37" cy="65" r="4" fill="#8BC34A"/><circle cx="48" cy="65" r="4" fill="#E0443E"/><circle cx="59" cy="65" r="4" fill="#F5A623"/><circle cx="20" cy="76" r="4" fill="#8BC34A"/><circle cx="32" cy="76" r="4" fill="#E0443E"/><circle cx="44" cy="76" r="4" fill="#F5A623"/><circle cx="56" cy="76" r="4" fill="#7E57C2"/></g><rect x="0" y="46" width="80" height="10" fill="#3FA05A"/><rect x="10" y="46" width="10" height="10" fill="#fff"/><rect x="30" y="46" width="10" height="10" fill="#fff"/><rect x="50" y="46" width="10" height="10" fill="#fff"/><rect x="70" y="46" width="10" height="10" fill="#fff"/></svg>`,

  cafeteria: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="Cafeteria"><rect x="2" y="30" width="76" height="60" fill="#F2DCC8"/><rect x="-2" y="24" width="84" height="8" rx="2" fill="#8D5A34"/><circle cx="40" cy="12" r="11" fill="#fff" stroke="#8D5A34" stroke-width="3"/><rect x="34" y="9" width="10" height="8" rx="2" fill="#8D5A34"/><circle cx="45.5" cy="12.5" r="2.4" fill="none" stroke="#8D5A34" stroke-width="1.4"/><path d="M37 7 q-2 -3 0 -5 M41 7 q-2 -3 0 -5" fill="none" stroke="#C9A173" stroke-width="1.2" stroke-linecap="round"/><rect x="0" y="40" width="80" height="10" fill="#C98A4B"/><rect x="10" y="40" width="10" height="10" fill="#fff"/><rect x="30" y="40" width="10" height="10" fill="#fff"/><rect x="50" y="40" width="10" height="10" fill="#fff"/><rect x="70" y="40" width="10" height="10" fill="#fff"/><rect x="6" y="56" width="32" height="28" rx="3" fill="#FFD98A" opacity="0.5"/><rect x="8" y="58" width="28" height="24" rx="3" fill="#FFD98A" stroke="#8D5A34" stroke-width="2"/><line x1="22" y1="58" x2="22" y2="82" stroke="#8D5A34" stroke-width="1.5"/><rect x="46" y="56" width="22" height="34" rx="2" fill="#7A4A2A"/><rect x="50" y="60" width="14" height="14" rx="1.5" fill="#FFE9A8"/><circle cx="64" cy="76" r="1.3" fill="#E8C98A"/><rect x="70" y="64" width="9" height="20" rx="1" fill="#3A4A44" stroke="#8D5A34" stroke-width="1.2"/><path d="M72 70 h5 M72 74 h4" stroke="#fff" stroke-width="1" stroke-linecap="round"/></svg>`,

  clinica: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="Clínica"><rect x="2" y="36" width="76" height="54" fill="#EEF7FB"/><rect x="-2" y="30" width="84" height="7" rx="2" fill="#2BB5A5"/><circle cx="40" cy="16" r="12" fill="#fff" stroke="#2BB5A5" stroke-width="3"/><rect x="38" y="9" width="4" height="14" fill="#E6556A"/><rect x="33" y="14" width="14" height="4" fill="#E6556A"/><g fill="#BFE6F2" opacity="0.5"><rect x="3" y="50" width="18" height="28" rx="3"/><rect x="59" y="50" width="18" height="28" rx="3"/></g><rect x="6" y="52" width="14" height="22" rx="2" fill="#BFE6F2"/><rect x="60" y="52" width="14" height="22" rx="2" fill="#BFE6F2"/><path d="M13 56 v14 M6 63 h14" stroke="#fff" stroke-width="1.5"/><path d="M67 56 v14 M60 63 h14" stroke="#fff" stroke-width="1.5"/><rect x="26" y="56" width="28" height="34" rx="2" fill="#BFE6F2" stroke="#2BB5A5" stroke-width="2"/><line x1="40" y1="56" x2="40" y2="90" stroke="#2BB5A5" stroke-width="1.5"/><rect x="22" y="44" width="36" height="8" rx="2" fill="#2BB5A5"/></svg>`,

  spa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="SPA"><rect x="2" y="38" width="76" height="52" fill="#E7E2FA"/><path d="M-2 42 Q40 -8 82 42Z" fill="#8A7FE0"/><ellipse cx="34" cy="12" rx="3.5" ry="6" fill="#F0A8F0" transform="rotate(-25 34 12)"/><ellipse cx="46" cy="12" rx="3.5" ry="6" fill="#F0A8F0" transform="rotate(25 46 12)"/><ellipse cx="40" cy="11" rx="3.5" ry="7" fill="#F7C0F7"/><rect x="20" y="22" width="40" height="20" rx="3" fill="#5B52C8"/><text x="40" y="36.5" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="#fff">SPA</text><g fill="#FFE9A8" opacity="0.4"><rect x="4" y="54" width="18" height="26" rx="3"/><rect x="58" y="54" width="18" height="26" rx="3"/></g><rect x="6" y="50" width="68" height="5" fill="#5B52C8"/><rect x="28" y="58" width="24" height="32" rx="4" fill="#C9C0F5"/><line x1="40" y1="58" x2="40" y2="90" stroke="#8A7FE0" stroke-width="1.5"/></svg>`,

  observatorio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 92 102" role="img" aria-label="Observatório"><rect x="8" y="38" width="64" height="52" fill="#D6DCF7"/><path d="M6 40 A34 30 0 0 1 74 40Z" fill="#5560C8"/><rect x="37" y="12" width="6" height="26" fill="#FFE9A8"/><line x1="42" y1="30" x2="68" y2="4" stroke="#9AA3E8" stroke-width="7" stroke-linecap="round"/><line x1="64" y1="8" x2="70" y2="2" stroke="#3B3F8F" stroke-width="7" stroke-linecap="round"/><circle cx="20" cy="58" r="7" fill="#FFE9A8" opacity="0.4"/><circle cx="60" cy="58" r="7" fill="#FFE9A8" opacity="0.4"/><circle cx="20" cy="58" r="5" fill="#FFE9A8"/><circle cx="60" cy="58" r="5" fill="#FFE9A8"/><path d="M32 90 V70 a8 8 0 0 1 16 0 V90Z" fill="#7C6CF0"/></svg>`
};

/* ---------- SVG do poste ---------- */
const SVG_POSTE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 6 24 94" role="img" aria-label="Poste"><ellipse cx="12" cy="97" rx="7" ry="2" fill="#000" opacity="0.12"/><rect x="10.5" y="26" width="3" height="70" fill="#4A4A6A"/><rect x="7" y="92" width="10" height="4" rx="1" fill="#4A4A6A"/><polygon points="6,20 12,12 18,20" fill="#4A4A6A"/><circle class="poste-brilho" cx="12" cy="26" r="12" fill="#FFF3B8" opacity="0.12"/><rect class="poste-luz" x="7" y="19" width="10" height="13" rx="3" fill="#4A4A6A"/></svg>`;

/* ---------- SVG da praça ---------- */
const SVG_PRACA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 20 220 80" role="img" aria-label="Praça"><rect x="0" y="86" width="220" height="10" rx="2" fill="#EBE6F7"/><rect x="0" y="86" width="220" height="2.5" fill="#D8D2EC"/><ellipse cx="34" cy="86" rx="34" ry="7" fill="#7ACB58"/><ellipse cx="186" cy="86" rx="34" ry="7" fill="#7ACB58"/><ellipse cx="110" cy="84" rx="32" ry="8" fill="#B8C4E8"/><ellipse cx="110" cy="82" rx="26" ry="6" fill="#7EC8F5"/><rect x="107" y="62" width="6" height="20" fill="#C9D1F0"/><ellipse cx="110" cy="62" rx="12" ry="3.5" fill="#B8C4E8"/><path d="M110 58 Q98 46 94 64" stroke="#9ADBFF" stroke-width="2" fill="none"/><path d="M110 58 Q122 46 126 64" stroke="#9ADBFF" stroke-width="2" fill="none"/><path d="M110 58 V44" stroke="#9ADBFF" stroke-width="2" fill="none"/><circle cx="110" cy="41" r="2.5" fill="#BFE8FF"/><ellipse cx="62" cy="88" rx="13" ry="3.5" fill="#8A5A32"/><ellipse cx="158" cy="88" rx="13" ry="3.5" fill="#8A5A32"/><rect x="4" y="76" width="26" height="4" rx="1" fill="#A56E3F"/><rect x="4" y="70" width="26" height="3" rx="1" fill="#8A5A32"/><rect x="7" y="80" width="2.5" height="6" fill="#5A3A20"/><rect x="24" y="80" width="2.5" height="6" fill="#5A3A20"/><rect x="190" y="76" width="26" height="4" rx="1" fill="#A56E3F"/><rect x="190" y="70" width="26" height="3" rx="1" fill="#8A5A32"/><rect x="193" y="80" width="2.5" height="6" fill="#5A3A20"/><rect x="210" y="80" width="2.5" height="6" fill="#5A3A20"/></svg>`;

/* ============================================================
   RENDERIZAR A CIDADE
   ============================================================ */
function renderCidade() {
  const cena = document.getElementById('mundoCena');
  if (!cena) return;

  // Limpa (mantém só as camadas de céu/calçada/estrelas)
  cena.querySelectorAll('.it, .lb').forEach(e => e.remove());

  // Prédios + postes + rótulos
  CIDADE.predios.forEach(p => {
    const svg = SVG_PREDIO[p.id];
    if (!svg) return;

    const el = document.createElement('div');
    el.className = 'it';
    el.style.cssText = `left:${p.x}px;width:${p.largura}px;height:${CIDADE.alturaPredio}px;bottom:${CIDADE.calcadaAltura}px`;
    el.innerHTML = svg;
    cena.appendChild(el);

    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.style.cssText = `left:${p.x}px;width:${p.largura}px`;
    lb.textContent = p.nome;
    cena.appendChild(lb);

    // Poste à direita do prédio
    const px = p.x + p.largura - 12;
    const poste = document.createElement('div');
    poste.className = 'it';
    poste.style.cssText = `left:${px}px;width:${CIDADE.poste.largura}px;height:${CIDADE.poste.altura}px;bottom:${CIDADE.calcadaAltura - 2}px`;
    poste.innerHTML = SVG_POSTE;
    cena.appendChild(poste);
  });

  // Praça
  const praca = document.createElement('div');
  praca.className = 'it';
  praca.style.cssText = `left:${CIDADE.praca.x}px;width:${CIDADE.praca.largura}px;height:150px;bottom:50px`;
  praca.innerHTML = SVG_PRACA;
  cena.appendChild(praca);

  const lbPraca = document.createElement('div');
  lbPraca.className = 'lb';
  lbPraca.style.cssText = `left:${CIDADE.praca.x}px;width:${CIDADE.praca.largura}px`;
  lbPraca.textContent = CIDADE.praca.nome;
  cena.appendChild(lbPraca);

  // Largura total da cena
  const total = CIDADE.praca.x + CIDADE.praca.largura + 40;
  cena.style.width = total + 'px';
}

/* ============================================================
   CÉU DINÂMICO POR HORÁRIO
   ============================================================ */
function atualizarCeu() {
  const m = document.getElementById('mundo');
  if (!m) return;
  const h = new Date().getHours();
  const root = document.documentElement;

  if (h >= 5 && h < 8) {
    // Amanhecer
    root.style.setProperty('--ceu-topo', '#A8C8E8');
    root.style.setProperty('--ceu-base', '#FFD9C0');
    root.style.setProperty('--calcada', '#EDE6F5');
    root.style.setProperty('--calcada-borda', '#D8D2EC');
    m.classList.remove('noite');
  } else if (h >= 8 && h < 17) {
    // Dia
    root.style.setProperty('--ceu-topo', '#9FD8F5');
    root.style.setProperty('--ceu-base', '#D9F1FF');
    root.style.setProperty('--calcada', '#EBE6F7');
    root.style.setProperty('--calcada-borda', '#D8D2EC');
    m.classList.remove('noite');
  } else if (h >= 17 && h < 19) {
    // Pôr do sol
    root.style.setProperty('--ceu-topo', '#8AA8D8');
    root.style.setProperty('--ceu-base', '#FFB88A');
    root.style.setProperty('--calcada', '#E8DCE8');
    root.style.setProperty('--calcada-borda', '#D0C4D8');
    m.classList.remove('noite');
  } else {
    // Noite
    root.style.setProperty('--ceu-topo', '#1B2340');
    root.style.setProperty('--ceu-base', '#2A3A5C');
    root.style.setProperty('--calcada', '#2A2A3E');
    root.style.setProperty('--calcada-borda', '#1E1E2E');
    m.classList.add('noite');
  }
}

/* ============================================================
   ABRIR / FECHAR MUNDO
   ============================================================ */
function abrirMundo() {
  let m = document.getElementById('mundo');

  // Cria o container na primeira vez
  if (!m) {
    m = document.createElement('div');
    m.id = 'mundo';
    m.innerHTML = `
      <div id="mundoTopo">
        <button id="mundoVoltar">← Voltar</button>
        <div id="mundoInfo">Nébula City</div>
      </div>
      <div id="mundoWrap">
        <div id="mundoCena">
          <div id="mundoSky"></div>
          <div id="mundoEstrelas"></div>
          <div id="mundoCalcada"></div>
        </div>
      </div>
      <div id="mundoVazio"></div>
    `;
    document.body.appendChild(m);

    document.getElementById('mundoVoltar').onclick = fecharMundo;
  }

  renderCidade();
  atualizarCeu();
  m.classList.add('on');

  // Atualiza o céu a cada 5 minutos (caso o usuário deixe aberto)
  if (window._mundoCeuTimer) clearInterval(window._mundoCeuTimer);
  window._mundoCeuTimer = setInterval(atualizarCeu, 5 * 60 * 1000);
}

function fecharMundo() {
  const m = document.getElementById('mundo');
  if (m) m.classList.remove('on');
  if (window._mundoCeuTimer) {
    clearInterval(window._mundoCeuTimer);
    window._mundoCeuTimer = null;
  }
}

/* Expõe globalmente */
window.abrirMundo = abrirMundo;
window.fecharMundo = fecharMundo;
window.renderCidade = renderCidade;
window.atualizarCeu = atualizarCeu;
