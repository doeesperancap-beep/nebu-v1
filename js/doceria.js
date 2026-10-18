/* ============================================================
   doceria.js — cozinha, livro de receitas, preparo, forno
   ============================================================ */

/* ---------- Auxiliares ---------- */
function docMostrarConteudo(html) {
  const area = $('doc-bancada-conteudo');
  if (area) area.innerHTML = html;
}

function docLimparConteudo() {
  const area = $('doc-bancada-conteudo');
  if (area) area.innerHTML = '';
}

/* ---------- Livro de receitas ---------- */
function abrirLivroReceitas() {
  docMostrarConteudo(`
    <div id="livro-header">
      <h2>📖 Livro de Receitas</h2>
      <p>Escolha uma receita pra fazer</p>
    </div>
    <div id="livro-lista"></div>
  `);
  renderLivroReceitas();
}

function renderLivroReceitas() {
  const lista = $('livro-lista');
  if (!lista) return;

  let html = '';
  for (const [id, r] of Object.entries(RECEITAS)) {
    const check = verificarIngredientes(r);
    html += `
      <div class="livro-receita" data-receita="${id}">
        <div class="livro-receita-emoji">${r.emoji}</div>
        <div class="livro-receita-info">
          <div class="livro-receita-nome">${r.nome}</div>
          <div class="livro-receita-status ${check.temTudo ? 'ok' : 'falta'}">
            ${check.temTudo ? '✅ Pronto pra fazer' : '❌ Faltam ingredientes'}
          </div>
        </div>
      </div>`;
  }
  lista.innerHTML = html;

  lista.querySelectorAll('.livro-receita').forEach(el => {
    el.onclick = () => clicarReceita(el.dataset.receita);
  });
}

function verificarIngredientes(receita) {
  const falta = [];
  for (const [chave, qtd] of Object.entries(receita.ingredientes)) {
    const tem = S.ingredientes?.[chave] || 0;
    if (tem < qtd) {
      falta.push({
        chave,
        nome: INGREDIENTES[chave]?.nome || chave,
        emoji: INGREDIENTES[chave]?.emoji || '?',
        tem,
        precisa: qtd
      });
    }
  }
  return { temTudo: falta.length === 0, falta };
}

function clicarReceita(id) {
  const r = RECEITAS[id];
  if (!r) return;

  const check = verificarIngredientes(r);

  if (!check.temTudo) {
    let h = '<div id="receita-detalhe">';
    h += `<h2>${r.emoji} ${r.nome}</h2>`;
    h += '<p class="receita-sub">Faltam esses ingredientes:</p>';
    h += '<div class="receita-falta-lista">';
    check.falta.forEach(f => {
      h += `
        <div class="receita-falta-item">
          <span class="receita-falta-emoji">${f.emoji}</span>
          <span class="receita-falta-nome">${f.nome}</span>
          <span class="receita-falta-qtd">${f.tem}/${f.precisa}</span>
        </div>`;
    });
    h += '</div>';
    h += '<button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button>';
    h += '<button id="btnComprarIng" class="doc-btn-acao doc-btn-verde">🫙 Comprar Ingredientes</button>';
    h += '</div>';

    docMostrarConteudo(h);
    $('btnVoltarLivro').onclick = abrirLivroReceitas;
    $('btnComprarIng').onclick = abrirIngredientesDoceria;
    return;
  }

  let h = '<div id="receita-detalhe">';
  h += `<h2>${r.emoji} ${r.nome}</h2>`;
  h += '<p class="receita-sub">Ingredientes:</p>';
  h += '<div class="receita-ing-lista">';
  for (const [chave, qtd] of Object.entries(r.ingredientes)) {
    const ing = INGREDIENTES[chave];
    h += `
      <div class="receita-ing-item">
        <span>${ing.emoji}</span>
        <span>${ing.nome}</span>
        <span class="receita-ing-qtd">x${qtd}</span>
      </div>`;
  }
  h += '</div>';
  h += '<button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button>';
  h += '<button id="btnComecar" class="doc-btn-acao doc-btn-roxo">👩‍🍳 Começar a fazer</button>';
  h += '</div>';

  docMostrarConteudo(h);
  $('btnVoltarLivro').onclick = abrirLivroReceitas;
  $('btnComecar').onclick = () => iniciarPreparo(id);
}

/* ---------- Preparo (passo a passo) ---------- */
let preparoAtual = null;     // { id, passo }
let preparoTravado = false;  // evita clique duplo avançar 2 passos

function iniciarPreparo(id) {
  if (!RECEITAS[id]) return;
  preparoAtual = { id, passo: 0 };
  renderPreparo();
}

function renderPreparo() {
  if (!preparoAtual) return;
  preparoTravado = false;

  const r = RECEITAS[preparoAtual.id];
  const passo = r.passos[preparoAtual.passo];
  const total = r.passos.length;
  const num = preparoAtual.passo + 1;

  let bolinhas = '';
  for (let i = 0; i < total; i++) bolinhas += `<span class="prep-bola ${i < num ? 'ok' : ''}"></span>`;

  docMostrarConteudo(`
    <div id="prep-tela">
      <div id="prep-topo">
        <h2>${r.emoji} ${r.nome}</h2>
        <p>Passo ${num} de ${total}</p>
      </div>
      <div id="prep-bolinhas">${bolinhas}</div>
      <div id="prep-texto">${passo.texto}</div>
      <button id="prep-acao" class="prep-acao">${passo.acao}</button>
      <button id="prep-cancelar" class="doc-btn-acao doc-btn-cinza">Cancelar</button>
    </div>
  `);

  $('prep-acao').onclick = avancarPreparo;
  $('prep-cancelar').onclick = () => {
    preparoAtual = null;
    abrirLivroReceitas();
  };
}

function avancarPreparo() {
  if (!preparoAtual || preparoTravado) return;
  preparoTravado = true;

  const id = preparoAtual.id;
  const r = RECEITAS[id];
  const passo = r.passos[preparoAtual.passo];

  const btn = $('prep-acao');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    voarEmoji(passo.acao, cx, cy);
    btn.style.transform = 'scale(.6)';
    btn.style.opacity = '.4';

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      criarBrilho(cx, cy, Math.cos(ang) * 60, Math.sin(ang) * 60);
    }
  }

  SOM.melodia([N.DO + Math.random() * 150, N.MI + Math.random() * 150], 0.08, 'sine', 0.1);
  vib(30);

  preparoAtual.passo++;

  if (preparoAtual.passo >= r.passos.length) {
    setTimeout(() => {
      if (!preparoAtual) return;      // cancelou nesse meio tempo
      preparoAtual = null;
      iniciarForno(id);
    }, 500);
    return;
  }

  setTimeout(renderPreparo, 450);
}

function voarEmoji(emoji, x, y) {
  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px;
    font-size: 60px; z-index: 9999; pointer-events: none;
    transform: translate(-50%, -50%);
    transition: all .5s cubic-bezier(.3, 1.4, .5, 1);
    filter: drop-shadow(0 4px 8px rgba(93,79,158,.4));
  `;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.top = (y - 150) + 'px';
    el.style.transform = 'translate(-50%, -50%) scale(1.4) rotate(15deg)';
  });
  setTimeout(() => {
    el.style.top = (innerHeight - 100) + 'px';
    el.style.transform = 'translate(-50%, -50%) scale(.5) rotate(-15deg)';
    el.style.opacity = '0';
  }, 300);
  setTimeout(() => el.remove(), 900);
}

function criarBrilho(x, y, dx, dy) {
  const el = document.createElement('div');
  el.textContent = '✨';
  el.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px;
    font-size: 18px; z-index: 9998; pointer-events: none;
    transform: translate(-50%, -50%);
    transition: all .5s ease-out; opacity: 1;
  `;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.left = (x + dx) + 'px';
    el.style.top = (y + dy) + 'px';
    el.style.opacity = '0';
    el.style.fontSize = '10px';
  });
  setTimeout(() => el.remove(), 600);
}

/* ---------- Forno (minigame) ---------- */
function iniciarForno(id) {
  const r = RECEITAS[id];
  if (!r) return;

  // Gasta os ingredientes agora
  for (const [chave, qtd] of Object.entries(r.ingredientes)) {
    S.ingredientes[chave] = (S.ingredientes[chave] || 0) - qtd;
    if (S.ingredientes[chave] <= 0) delete S.ingredientes[chave];
  }
  save();

  docMostrarConteudo(`
    <div id="forno-tela">
      <div id="forno-emoji">${r.emoji}</div>
      <h2>Assando...</h2>
      <p>Tira do forno na hora certa!</p>

      <div id="forno-barra-wrap">
        <div id="forno-barra">
          <div id="forno-barra-preenche"></div>
          <div id="forno-zona-boa"></div>
        </div>
      </div>

      <button id="btnTirarForno" class="doc-btn-acao doc-btn-roxo">🔥 Tirar do forno</button>
    </div>
  `);

  rodarMinigameForno(id);
}

function rodarMinigameForno(id) {
  const r = RECEITAS[id];
  if (!r) return;

  const barra = $('forno-barra-preenche');
  const zona = $('forno-zona-boa');
  const btn = $('btnTirarForno');
  if (!barra || !btn) return;

  const ZONA_INICIO = 60, ZONA_FIM = 85;
  zona.style.left = ZONA_INICIO + '%';
  zona.style.width = (ZONA_FIM - ZONA_INICIO) + '%';

  let progresso = 0;
  let terminou = false;

  const duracao = 3000 + (r.tempo / 1000) * 300;   // ms
  const passo = 100 / (duracao / 50);               // % por frame

  const iv = setInterval(() => {
    if (terminou) return;
    progresso = Math.min(100, progresso + passo);
    barra.style.width = progresso + '%';

    if (progresso >= 100) {
      clearInterval(iv);
      terminou = true;
      setTimeout(() => finalizarDoce(id, 'queimou'), 200);
    }
  }, 50);

  btn.onclick = () => {
    if (terminou) return;
    terminou = true;
    clearInterval(iv);

    btn.style.transform = 'scale(.9)';
    setTimeout(() => btn.style.transform = '', 150);

    if (progresso < ZONA_INICIO) finalizarDoce(id, 'cru');
    else if (progresso > ZONA_FIM) finalizarDoce(id, 'queimou');
    else finalizarDoce(id, 'perfeito');
  };
}

function finalizarDoce(id, resultado) {
  const r = RECEITAS[id];
  if (!r) return;

  if (resultado === 'perfeito') {
    if (!S.estoque) S.estoque = {};
    const chave = 'caseiro_' + r.emoji;
    S.estoque[chave] = (S.estoque[chave] || 0) + 1;
    save();

    docMostrarConteudo(`
      <div id="forno-tela">
        <div id="forno-emoji" class="pulse">${r.emoji}</div>
        <h2>Ficou pronto! ✨</h2>
        <p>${r.nome} perfeito</p>
        <p style="font-size:12px;opacity:.6;margin-top:8px">Foi pro estoque — come quando quiser 💗</p>
        <button id="btnVoltarLivro" class="doc-btn-acao doc-btn-roxo">📖 Voltar ao Livro</button>
      </div>
    `);
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12);
    $('btnVoltarLivro').onclick = abrirLivroReceitas;
    return;
  }

  if (resultado === 'cru') {
    S.humor = clamp(S.humor - 2);
    save();
    docMostrarConteudo(`
      <div id="forno-tela">
        <div id="forno-emoji">🥣</div>
        <h2>Tá cru... 😖</h2>
        <p>Tirou do forno cedo demais</p>
        <button id="btnVoltarForno" class="doc-btn-acao doc-btn-cinza">← Voltar</button>
      </div>
    `);
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.2, 'sawtooth', 0.1);
    $('btnVoltarForno').onclick = abrirLivroReceitas;
    return;
  }

  // Queimou
  S.humor = clamp(S.humor - 4);
  save();
  docMostrarConteudo(`
    <div id="forno-tela">
      <div id="forno-emoji" class="queimado">💨</div>
      <h2>Queimou! 🔥</h2>
      <p>Passou do ponto...</p>
      <button id="btnVoltarForno" class="doc-btn-acao doc-btn-cinza">← Voltar</button>
    </div>
  `);
  SOM.melodia([N.DO_BAIXO, N.DO_BAIXO, N.DO_BAIXO], 0.15, 'sawtooth', 0.12);
  $('btnVoltarForno').onclick = abrirLivroReceitas;
}

/* ---------- Comprar ingredientes ---------- */
function abrirIngredientesDoceria() {
  docMostrarConteudo(`
    <div id="ing-header">
      <h2>🫙 Ingredientes</h2>
      <p id="ing-moedas">Você tem: 🪙 ${S.moedas || 0}</p>
    </div>
    <div id="ing-lista"></div>
    <button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button>
  `);
  renderIngredientes();
  $('btnVoltarLivro').onclick = abrirLivroReceitas;
}

function renderIngredientes() {
  const lista = $('ing-lista');
  if (!lista) return;

  let html = '';
  for (const [chave, ing] of Object.entries(INGREDIENTES)) {
    const qtd = S.ingredientes?.[chave] || 0;
    const podeComprar = (S.moedas || 0) >= ing.preco;
    html += `
      <div class="ing-item ${podeComprar ? '' : 'ing-sem-moeda'}" data-ing="${chave}">
        <div class="ing-emoji">${ing.emoji}</div>
        <div class="ing-info">
          <div class="ing-nome">${ing.nome}</div>
          <div class="ing-preco">🪙 ${ing.preco}</div>
        </div>
        <div class="ing-qtd">${qtd > 0 ? 'x' + qtd : ''}</div>
      </div>`;
  }
  lista.innerHTML = html;

  lista.querySelectorAll('.ing-item').forEach(el => {
    el.onclick = () => comprarIngrediente(el.dataset.ing);
  });
}

function comprarIngrediente(chave) {
  const ing = INGREDIENTES[chave];
  if (!ing) return;

  if ((S.moedas || 0) < ing.preco) {
    say('Não tenho moedas suficientes... 😢');
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sawtooth', 0.1);
    return;
  }

  S.moedas -= ing.preco;
  if (!S.ingredientes) S.ingredientes = {};
  S.ingredientes[chave] = (S.ingredientes[chave] || 0) + 1;
  save();
  SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.1);

  const moedasEl = $('ing-moedas');
  if (moedasEl) moedasEl.textContent = `Você tem: 🪙 ${S.moedas || 0}`;
  renderIngredientes();
}

/* ---------- Tela da Doceria ---------- */
function abrirDoceria() {
  P.classList.remove('on');

  let doceria = $('doceria');
  if (doceria) doceria.remove();

  doceria = document.createElement('div');
  doceria.id = 'doceria';
  doceria.innerHTML = `
    <div id="doc-topo">
      <button id="doc-sair" class="doc-btn-topo">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>Sair</span>
      </button>

      <div id="doc-botoes-direita">
        <button id="doc-livro" class="doc-btn-topo doc-btn-roxo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/>
            <path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>
          </svg>
          <span>Livro de Receitas</span>
        </button>
        <button id="doc-ingredientes" class="doc-btn-topo doc-btn-verde">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 2h8"/><path d="M9 2v3"/><path d="M15 2v3"/>
            <path d="M5 5h14a1 1 0 0 1 1 1v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1z"/>
            <path d="M4 10h16"/>
          </svg>
          <span>Ingredientes</span>
        </button>
      </div>
    </div>

    <div id="doc-cozinha">
      <div id="doc-parede"></div>
      <div id="doc-prateleira">
        <div class="doc-pote" style="background:#f5c7d6"></div>
        <div class="doc-pote" style="background:#b8dfd0"></div>
        <div class="doc-pote" style="background:#d8c4ec"></div>
      </div>
      <div id="doc-quadro">☕</div>
      <div id="doc-geladeira">
        <div class="doc-geladeira-linha"></div>
        <div class="doc-geladeira-linha"></div>
      </div>
      <div id="doc-fogao">
        <div class="doc-fogao-topo">
          <div class="doc-boca"></div>
          <div class="doc-boca"></div>
        </div>
        <div class="doc-fogao-porta"></div>
      </div>
      <div id="doc-coifa"></div>
      <div id="doc-luminaria"><div class="doc-luz"></div></div>
    </div>

    <div id="doc-bancada">
      <div id="doc-toalha"></div>
      <div id="doc-bancada-conteudo"></div>
    </div>

    <div id="doc-tapete"></div>
  `;
  document.body.appendChild(doceria);

  $('doc-sair').onclick = () => { preparoAtual = null; doceria.remove(); };
  $('doc-livro').onclick = abrirLivroReceitas;
  $('doc-ingredientes').onclick = abrirIngredientesDoceria;
}
