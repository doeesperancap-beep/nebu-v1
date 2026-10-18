/* ============================================================
   main.js — painel, modo, boas-vindas, botões, loop, atualização
   (carrega por ÚLTIMO)
   ============================================================ */

/* ---------- Painel genérico ---------- */
function panel(h) {
  P.innerHTML = h + '<button data-x="close">Fechar</button>';
  P.classList.add('on');
}

/* ---------- Escolha de modo ---------- */
function modoPanel() {
  P.innerHTML = `
    <h3>O que é este dispositivo?</h3>
    <p style="opacity:.7;font-size:14px;margin:8px 0 16px">
      Escolha uma vez. Depois só muda nas configurações.
    </p>
    <button data-modo="nebo" style="font-size:18px;padding:16px">
      💗 É uma Nébula
      <div style="font-size:12px;opacity:.7;margin-top:4px">Eu vou cuidar dela</div>
    </button>
    <button data-modo="cidade" style="font-size:18px;padding:16px">
      🏙️ É a Cidade
      <div style="font-size:12px;opacity:.7;margin-top:4px">Vai mostrar várias Nebos</div>
    </button>
  `;
  P.classList.add('on');

  P.querySelectorAll('[data-modo]').forEach(b => {
    b.onclick = () => {
      S.modo = b.dataset.modo;
      save();
      P.classList.remove('on');
      iniciarModo();
    };
  });
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

/* ---------- Boas-vindas ---------- */
function welcomePanel() {
  P.innerHTML = `
    <h3>Oi! Como você vai me chamar?</h3>
    <input id="nomeInput" type="text" maxlength="12" placeholder="Ex: Luna"
           style="width:100%;padding:12px;border-radius:12px;border:0;font-size:17px;
                  margin:8px 0;background:#ffffff1a;color:#fff;box-sizing:border-box">
    <button id="nomeOk">Pronto! ✨</button>
  `;
  P.classList.add('on');

  const input = $('nomeInput');
  const botao = $('nomeOk');

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') botao.click(); });

  botao.onclick = () => {
    const nome = input.value.trim();
    if (!nome) { input.style.background = '#ff000044'; return; }

    S.nome = nome;
    S.id = gerarID(nome);
    save();

    P.innerHTML = `
      <h3>Prazer, ${esc(nome)}! 💗</h3>
      <p style="opacity:.7;font-size:14px">Seu ID: <code>${esc(S.id)}</code></p>
    `;
    setTimeout(() => { P.classList.remove('on'); persPanel(); }, 2000);
  };
}

function persPanel() {
  panel('<h3>Como será a Nébula?</h3>' +
    PERS.map(p => `<button data-pers="${p.split(' ')[1]}">${p}</button>`).join('') +
    '<button data-pers="sorteio">🎲 Surpresa</button>');
}

function choose(k) {
  if (k === 'sorteio') k = rnd(PERS).split(' ')[1];
  S.pers = k;

  const p = gerarPreferencias();
  S.favoritas = p.favoritas;
  S.detestadas = p.detestadas;

  P.classList.remove('on');
  say('Eu sou ' + k + '! ✨');
  save();

  setTimeout(() => say('Adoro ' + S.favoritas.join(' ') + ' 💗'), 2800);
}

/* ---------- Estado ---------- */
function drawEstado() {
  const rows = [
    ['🔋', 'Energia', S.energia],
    ['🍎', 'Fome', S.fome],
    ['❤️', 'Saúde', S.saude],
    ['😊', 'Humor', S.humor],
    ['🧼', 'Limpeza', S.limpeza]
  ];
  const nomeHtml = S.nome
    ? `<div class="st" style="font-size:14px"><b>${esc(S.nome)}</b> <span style="opacity:.5;font-size:12px">${esc(S.id || '')}</span></div>`
    : '';
  const moedasHtml = `<div class="st" style="font-size:14px">🪙 <b>${S.moedas || 0}</b> moedas</div>`;

  $('estado').innerHTML =
    nomeHtml + moedasHtml +
    rows.map(r => `<div class="st"><span>${r[0]}</span><i><b style="width:${Math.round(r[2])}%"></b></i><span>${Math.round(r[2])}%</span></div>`).join('') +
    `<div class="st" style="font-size:12px;opacity:.7">Sensores: inclinar ${gotO ? '✅' : '❌'} · mexer ${gotM ? '✅' : '❌'} · vibrar ${navigator.vibrate ? '✅' : '❌'} · bateria ${batOK ? '✅' : '❌'}</div>`;
}

/* ---------- Botões da barra ---------- */
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
  '<h3>🎮 Brincar</h3>' +
  '<button data-g="f">🍎 Cesta de Frutas</button>' +
  '<button data-g="b">🦋 Borboletas</button>' +
  '<button data-g="d">🦖 Dino</button>' +
  '<button data-x="dance">💃 Dançar</button>'
);

$('bMundo').onclick = mundo;
$('bXarope').onclick = xarope;
$('bCasa').onclick = abrirCasa;

/* ---------- Handler global dos botões do painel ---------- */
P.onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;

  if (d.x === 'close') { P.classList.remove('on'); pararMusicaMercado(); }

  // Conexão
  else if (d.x === 'conectar') { P.classList.remove('on'); painelConectar(); }
  else if (d.x === 'desconectar') {
    S.conectado = false;
    S.cidadeId = null;
    save();
    sairDoFirebase();
    say('Desconectei...');
    P.classList.remove('on');
  }

  // Lugares da cidade
  else if (d.x === 'loja')       { P.classList.remove('on'); painelLoja(); }
  else if (d.x === 'spa')        { P.classList.remove('on'); painelSpa(); }
  else if (d.x === 'clinica')    { P.classList.remove('on'); painelClinica(); }
  else if (d.x === 'biblioteca') { P.classList.remove('on'); abrirBiblioteca(); }
  else if (d.x === 'jogos')      { P.classList.remove('on'); painelJogos(); }
  else if (d.x === 'doceria')    { P.classList.remove('on'); abrirDoceria(); }
  else if (d.x === 'boutique')   { P.classList.remove('on'); painelBoutique(); }

  // Cuidar / brincar
  else if (d.x === 'food')   foodTray();
  else if (d.x === 'bath')   startBath();
  else if (d.x === 'xarope') xarope();
  else if (d.x === 'dance')  { P.classList.remove('on'); startDance(10); }
  else if (d.f)    eat(d.f);
  else if (d.p)    visit(d.p);
  else if (d.pers) choose(d.pers);
  else if (d.g === 'f') startGame();
  else if (d.g === 'b') startButterflies();
  else if (d.g === 'd') startDino();
};

/* ---------- Início ---------- */
prefs();
aplicarVisual();
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

/* ---------- Loop principal (a cada 5s) ---------- */
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
  } else if (hiddenAt) {
    offline((Date.now() - hiddenAt) / 60000);
    S.last = Date.now();
    save();
    set(baseMood(), 0);
    hiddenAt = 0;
  }
});

/* ---------- Aviso de atualização ---------- */
(function checkVersion() {
  const VERSAO_KEY = 'nebula-versao-vista';
  try {
    const versaoNova = Number(document.querySelector('meta[name="version"]')?.content || 1);
    const versaoVista = Number(localStorage.getItem(VERSAO_KEY) || 0);

    if (versaoVista && versaoVista < versaoNova) mostrarAviso(versaoNova, VERSAO_KEY);
    else localStorage.setItem(VERSAO_KEY, versaoNova);
  } catch {}
})();

function mostrarAviso(nova, key) {
  const KEY_PREMIO = 'nebula-premio-versao';
  const jaPegou = Number(localStorage.getItem(KEY_PREMIO) || 0) >= nova;

  const aviso = document.createElement('div');
  aviso.id = 'aviso-atualizacao';

  if (jaPegou) {
    aviso.textContent = BIB_CONFIG.avisoTextoJaPego;
    aviso.onclick = () => {
      localStorage.setItem(key, nova);
      location.reload();
    };
  } else {
    aviso.textContent = BIB_CONFIG.avisoTexto.replace('{m}', BIB_CONFIG.moedasAtualizacao);
    aviso.onclick = () => {
      ganharMoedas(BIB_CONFIG.moedasAtualizacao);
      localStorage.setItem(KEY_PREMIO, nova);
      localStorage.setItem(key, nova);

      aviso.textContent = `🎉 +${BIB_CONFIG.moedasAtualizacao} moedas!`;
      aviso.style.background = '#b8dfd0';
      aviso.style.color = '#2e6b52';

      setTimeout(() => location.reload(), 1000);
    };
  }
  document.body.appendChild(aviso);
}
