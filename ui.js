/* ============ 12. UI ============ */
function panel(h) {
  P.innerHTML = h + '<button data-x="close">Fechar</button>';
  P.classList.add('on');
}

function modoPanel() {
  P.innerHTML = `
    <h3>O que é este dispositivo?</h3>
    <p style="opacity:.7;font-size:14px;margin:8px 0 16px">Escolha uma vez. Depois só muda nas configurações.</p>
    <button data-modo="nebo" style="font-size:18px;padding:16px">💗 É uma Nébula<div style="font-size:12px;opacity:.7;margin-top:4px">Eu vou cuidar dela</div></button>
    <button data-modo="cidade" style="font-size:18px;padding:16px">🏙️ É a Cidade<div style="font-size:12px;opacity:.7;margin-top:4px">Vai mostrar várias Nebos</div></button>
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

function welcomePanel() {
  P.innerHTML = `
    <h3>Oi! Como você vai me chamar?</h3>
    <input id="nomeInput" type="text" maxlength="12" placeholder="Ex: Luna" style="width:100%;padding:12px;border-radius:12px;border:0;font-size:17px;margin:8px 0;background:#ffffff1a;color:#fff;box-sizing:border-box">
    <button id="nomeOk">Pronto! ✨</button>
  `;
  P.classList.add('on');

  setTimeout(() => {
    const input = document.getElementById('nomeInput');
    const botao = document.getElementById('nomeOk');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') botao.click(); });

    botao.onclick = () => {
      const nome = input.value.trim();
      if (!nome) { input.style.background = '#ff000044'; return; }
      S.nome = nome; S.id = gerarID(nome); save();
      P.innerHTML = `<h3>Prazer, ${nome}! 💗</h3><p style="opacity:.7;font-size:14px">Seu ID: <code>${S.id}</code></p>`;
      setTimeout(() => { P.classList.remove('on'); persPanel(); }, 2000);
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
  const p = gerarPreferencias();
  S.favoritas = p.favoritas; S.detestadas = p.detestadas;
  P.classList.remove('on'); say('Eu sou ' + k + '! ✨'); save();
  setTimeout(() => say('Adoro ' + S.favoritas.join(' ') + ' 💗'), 2800);
}

function drawEstado() {
  const rows = [
    ['🔋', 'Energia', S.energia], ['🍎', 'Fome', S.fome], ['❤️', 'Saúde', S.saude], ['😊', 'Humor', S.humor], ['🧼', 'Limpeza', S.limpeza]
  ];
  const nomeHtml = S.nome ? `<div class="st" style="font-size:14px"><b>${S.nome}</b> <span style="opacity:.5;font-size:12px">${S.id || ''}</span></div>` : '';
  const moedasHtml = `<div class="st" style="font-size:14px">🪙 <b>${S.moedas || 0}</b> moedas</div>`;
  $('estado').innerHTML = nomeHtml + moedasHtml + rows.map(r => `<div class="st"><span>${r[0]}</span><i><b style="width:${Math.round(r[2])}%"></b></i><span>${Math.round(r[2])}%</span></div>`).join('') +
    `<div class="st" style="font-size:12px;opacity:.7">Sensores: inclinar ${gotO ? '✅' : '❌'} · mexer ${gotM ? '✅' : '❌'} · vibrar ${navigator.vibrate ? '✅' : '❌'} · bateria ${batOK ? '✅' : '❌'}</div>`;
}

/* ============ BOTÕES DA BARRA ============ */
$('bEstado').onclick = () => { drawEstado(); $('estado').classList.add('on'); setTimeout(() => $('estado').classList.remove('on'), 4500); };
$('estado').onclick = () => $('estado').classList.remove('on');
$('bCuidar').onclick = () => panel('<h3>🧸 Cuidar</h3><button data-x="food">🍎 Comida</button><button data-x="bath">🛁 Banho</button>' + (S.sick > Date.now() ? '<button data-x="xarope">💊 Xarope</button>' : ''));
$('bBrincar').onclick = () => panel('<h3>🎮 Brincar</h3><button data-g="f">🍎 Cesta de Frutas</button><button data-g="b">🦋 Borboletas</button><button data-g="d">🦖 Dino</button><button data-x="dance">💃 Dançar</button>');
$('bMundo').onclick = mundo;
$('bXarope').onclick = xarope;

/* ============ HANDLER GLOBAL DE CLIQUES ============ */
P.onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;

  if (d.x === 'close') { P.classList.remove('on'); pararMusicaMercado(); }
  else if (d.x === 'conectar') { P.classList.remove('on'); painelConectar(); }
  else if (d.x === 'desconectar') { S.conectado = false; S.cidadeId = null; save(); say('Desconectei...'); P.classList.remove('on'); }
  else if (d.x === 'loja') { P.classList.remove('on'); painelLoja(); }
  else if (d.x === 'spa') { P.classList.remove('on'); painelSpa(); }
  else if (d.x === 'clinica') { P.classList.remove('on'); painelClinica(); }
  else if (d.x === 'biblioteca') { P.classList.remove('on'); abrirBiblioteca(); }
  else if (d.x === 'jogos') { P.classList.remove('on'); painelJogos(); }
  else if (d.x === 'doceria') { P.classList.remove('on'); abrirDoceria(); }
  else if (d.x === 'boutique') { P.classList.remove('on'); painelBoutique(); }
  else if (d.x === 'food') foodTray();
  else if (d.x === 'bath') startBath();
  else if (d.x === 'xarope') xarope();
  else if (d.f) eat(d.f);
  else if (d.p) visit(d.p);
  else if (d.pers) choose(d.pers);
  else if (d.g === 'f') startGame();
  else if (d.g === 'b') startButterflies();
  else if (d.g === 'd') startDino();
  else if (d.x === 'dance') { P.classList.remove('on'); startDance(10); }
};
