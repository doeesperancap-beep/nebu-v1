/* ============ DOCERIA ============ */
function docMostrarConteudo(html) {
  const area = document.getElementById('doc-bancada-conteudo');
  if (area) area.innerHTML = html;
}

function abrirDoceria() {
  P.classList.remove('on');
  let doceria = document.getElementById('doceria');
  if (doceria) doceria.remove();

  doceria = document.createElement('div');
  doceria.id = 'doceria';
  doceria.innerHTML = `
    <div id="doc-topo">
      <button id="doc-sair" class="doc-btn-topo">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>Sair</span>
      </button>
      <div id="doc-botoes-direita">
        <button id="doc-livro" class="doc-btn-topo doc-btn-roxo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/></svg><span>Livro de Receitas</span>
        </button>
        <button id="doc-ingredientes" class="doc-btn-topo doc-btn-verde">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M9 2v3"/><path d="M15 2v3"/><path d="M5 5h14a1 1 0 0 1 1 1v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1z"/><path d="M4 10h16"/></svg><span>Ingredientes</span>
        </button>
      </div>
    </div>
    <div id="doc-cozinha">
      <div id="doc-parede"></div>
      <div id="doc-prateleira"><div class="doc-pote" style="background:#f5c7d6"></div><div class="doc-pote" style="background:#b8dfd0"></div><div class="doc-pote" style="background:#d8c4ec"></div></div>
      <div id="doc-quadro">☕</div>
      <div id="doc-geladeira"><div class="doc-geladeira-linha"></div><div class="doc-geladeira-linha"></div></div>
      <div id="doc-fogao"><div class="doc-fogao-topo"><div class="doc-boca"></div><div class="doc-boca"></div></div><div class="doc-fogao-porta"></div></div>
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

  document.getElementById('doc-sair').onclick = () => doceria.remove();
  document.getElementById('doc-livro').onclick = () => abrirLivroReceitas();
  document.getElementById('doc-ingredientes').onclick = () => abrirIngredientesDoceria();
}

function abrirLivroReceitas() {
  docMostrarConteudo(`
    <div id="livro-header"><h2>📖 Livro de Receitas</h2><p>Escolha uma receita pra fazer</p></div>
    <div id="livro-lista"></div>
  `);
  renderLivroReceitas();
}

function renderLivroReceitas() {
  const lista = document.getElementById('livro-lista');
  if (!lista) return;
  let html = '';
  for (const [id, r] of Object.entries(RECEITAS)) {
    const check = verificarIngredientes(r);
    html += `
      <div class="livro-receita" data-receita="${id}">
        <div class="livro-receita-emoji">${r.emoji}</div>
        <div class="livro-receita-info">
          <div class="livro-receita-nome">${r.nome}</div>
          <div class="livro-receita-status ${check.temTudo ? 'ok' : 'falta'}">${check.temTudo ? '✅ Pronto pra fazer' : '❌ Faltam ingredientes'}</div>
        </div>
      </div>`;
  }
  lista.innerHTML = html;
  setTimeout(() => {
    document.querySelectorAll('.livro-receita').forEach(el => {
      el.onclick = () => clicarReceita(el.dataset.receita);
    });
  }, 50);
}

function verificarIngredientes(receita) {
  const falta = [];
  for (const [chave, qtd] of Object.entries(receita.ingredientes)) {
    const tem = S.ingredientes?.[chave] || 0;
    if (tem < qtd) {
      falta.push({ chave, nome: INGREDIENTES[chave]?.nome || chave, emoji: INGREDIENTES[chave]?.emoji || '?', tem, precisa: qtd });
    }
  }
  return { temTudo: falta.length === 0, falta };
}

function clicarReceita(id) {
  const r = RECEITAS[id];
  if (!r) return;
  const check = verificarIngredientes(r);

  if (!check.temTudo) {
    let htmlFalta = '<div id="receita-detalhe">';
    htmlFalta += `<h2>${r.emoji} ${r.nome}</h2><p class="receita-sub">Faltam esses ingredientes:</p><div class="receita-falta-lista">`;
    check.falta.forEach(f => {
      htmlFalta += `<div class="receita-falta-item"><span class="receita-falta-emoji">${f.emoji}</span><span class="receita-falta-nome">${f.nome}</span><span class="receita-falta-qtd">${f.tem}/${f.precisa}</span></div>`;
    });
    htmlFalta += '</div><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button><button id="btnComprarIng" class="doc-btn-acao doc-btn-verde">🫙 Comprar Ingredientes</button></div>';
    docMostrarConteudo(htmlFalta);
    setTimeout(() => {
      document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas;
      document.getElementById('btnComprarIng').onclick = abrirIngredientesDoceria;
    }, 50);
    return;
  }

  let htmlOk = '<div id="receita-detalhe">';
  htmlOk += `<h2>${r.emoji} ${r.nome}</h2><p class="receita-sub">Ingredientes:</p><div class="receita-ing-lista">`;
  for (const [chave, qtd] of Object.entries(r.ingredientes)) {
    const ing = INGREDIENTES[chave];
    htmlOk += `<div class="receita-ing-item"><span>${ing.emoji}</span><span>${ing.nome}</span><span class="receita-ing-qtd">x${qtd}</span></div>`;
  }
  htmlOk += '</div><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button><button id="btnComecar" class="doc-btn-acao doc-btn-roxo">👩‍🍳 Começar a fazer</button></div>';
  docMostrarConteudo(htmlOk);

  setTimeout(() => {
    document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas;
    document.getElementById('btnComecar').onclick = () => iniciarPreparo(id);
  }, 50);
}

let preparoAtual = null;
function iniciarPreparo(id) {
  if (!RECEITAS[id]) return;
  preparoAtual = { id, passo: 0 };
  renderPreparo();
}

function renderPreparo() {
  if (!preparoAtual) return;
  const r = RECEITAS[preparoAtual.id];
  const passo = r.passos[preparoAtual.passo];
  const total = r.passos.length;
  const num = preparoAtual.passo + 1;
  let bolinhas = '';
  for (let i = 0; i < total; i++) bolinhas += `<span class="prep-bola ${i < num ? 'ok' : ''}"></span>`;

  docMostrarConteudo(`
    <div id="prep-tela">
      <div id="prep-topo"><h2>${r.emoji} ${r.nome}</h2><p>Passo ${num} de ${total}</p></div>
      <div id="prep-bolinhas">${bolinhas}</div>
      <div id="prep-texto">${passo.texto}</div>
      <button id="prep-acao" class="prep-acao">${passo.acao}</button>
      <button id="prep-cancelar" class="doc-btn-acao doc-btn-cinza">Cancelar</button>
    </div>
  `);

  setTimeout(() => {
    document.getElementById('prep-acao').onclick = avancarPreparo;
    document.getElementById('prep-cancelar').onclick = () => { preparoAtual = null; abrirLivroReceitas(); };
  }, 50);
}

function avancarPreparo() {
  if (!preparoAtual) return;
  const r = RECEITAS[preparoAtual.id];
  const passo = r.passos[preparoAtual.passo];
  const btn = document.getElementById('prep-acao');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    voarEmoji(passo.acao, cx, cy);
    btn.style.transform = 'scale(.6)'; btn.style.opacity = '.4';
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      criarBrilho(cx, cy, Math.cos(ang) * 60, Math.sin(ang) * 60);
    }
  }
  SOM.melodia([N.DO + Math.random() * 150, N.MI + Math.random() * 150], 0.08, 'sine', 0.1);
  vib(30);
  preparoAtual.passo++;

  if (preparoAtual.passo >= r.passos.length) {
    setTimeout(() => { iniciarForno(preparoAtual.id); preparoAtual = null; }, 500);
    return;
  }
  setTimeout(renderPreparo, 450);
}

function voarEmoji(emoji, x, y) {
  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; font-size: 60px; z-index: 9999; pointer-events: none; transform: translate(-50%, -50%); transition: all .5s cubic-bezier(.3, 1.4, .5, 1); filter: drop-shadow(0 4px 8px rgba(93,79,158,.4));`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.left = x + 'px'; el.style.top = (y - 150) + 'px'; el.style.transform = 'translate(-50%, -50%) scale(1.4) rotate(15deg)';
  });
  setTimeout(() => {
    el.style.top = (innerHeight - 100) + 'px'; el.style.transform = 'translate(-50%, -50%) scale(.5) rotate(-15deg)'; el.style.opacity = '0';
  }, 300);
  setTimeout(() => el.remove(), 900);
}

function criarBrilho(x, y, dx, dy) {
  const el = document.createElement('div');
  el.textContent = '✨';
  el.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; font-size: 18px; z-index: 9998; pointer-events: none; transform: translate(-50%, -50%); transition: all .5s ease-out; opacity: 1;`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.left = (x + dx) + 'px'; el.style.top = (y + dy) + 'px'; el.style.opacity = '0'; el.style.fontSize = '10px';
  });
  setTimeout(() => el.remove(), 600);
}

function iniciarForno(id) {
  const r = RECEITAS[id];
  if (!r) return;
  for (const [chave, qtd] of Object.entries(r.ingredientes)) {
    S.ingredientes[chave] = (S.ingredientes[chave] || 0) - qtd;
    if (S.ingredientes[chave] <= 0) delete S.ingredientes[chave];
  }
  save();

  docMostrarConteudo(`
    <div id="forno-tela">
      <div id="forno-emoji">${r.emoji}</div>
      <h2>Assando...</h2><p>Tira do forno na hora certa!</p>
      <div id="forno-barra-wrap"><div id="forno-barra"><div id="forno-barra-preenche"></div><div id="forno-zona-boa"></div></div></div>
      <button id="btnTirarForno" class="doc-btn-acao doc-btn-roxo">🔥 Tirar do forno</button>
    </div>
  `);
  setTimeout(() => rodarMinigameForno(id), 50);
}

function rodarMinigameForno(id) {
  const r = RECEITAS[id];
  if (!r) return;
  const barra = document.getElementById('forno-barra-preenche');
  const zona = document.getElementById('forno-zona-boa');
  const btn = document.getElementById('btnTirarForno');
  if (!barra || !btn) return;

  const ZONA_INICIO = 60, ZONA_FIM = 85;
  zona.style.left = ZONA_INICIO + '%';
  zona.style.width = (ZONA_FIM - ZONA_INICIO) + '%';

  let progresso = 0, terminou = false;
  const duracao = 3000 + (r.tempo / 1000) * 300;
  const passo = 100 / (duracao / 50);

  const iv = setInterval(() => {
    if (terminou) return;
    progresso += passo;
    if (progresso > 100) progresso = 100;
    barra.style.width = progresso + '%';
    if (progresso >= 100) {
      clearInterval(iv); terminou = true;
      setTimeout(() => finalizarDoce(id, 'queimou'), 200);
    }
  }, 50);

  btn.onclick = () => {
    if (terminou) return;
    terminou = true; clearInterval(iv);
    btn.style.transform = 'scale(.9)'; setTimeout(() => btn.style.transform = '', 150);
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
    const chaveCaseiro = 'caseiro_' + r.emoji;
    S.estoque[chaveCaseiro] = (S.estoque[chaveCaseiro] || 0) + 1;
    save();
    docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji" class="pulse">${r.emoji}</div><h2>Ficou pronto! ✨</h2><p>${r.nome} perfeito</p><p style="font-size:12px;opacity:.6;margin-top:8px">Foi pro estoque — come quando quiser 💗</p><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-roxo">📖 Voltar ao Livro</button></div>`);
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12);
    setTimeout(() => document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas, 50);
    return;
  }

  if (resultado === 'cru') {
    S.humor = clamp(S.humor - 2); save();
    docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji">🥣</div><h2>Tá cru... 😖</h2><p>Tirou do forno cedo demais</p><button id="btnVoltarForno" class="doc-btn-acao doc-btn-cinza">← Voltar</button></div>`);
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.2, 'sawtooth', 0.1);
    setTimeout(() => document.getElementById('btnVoltarForno').onclick = abrirLivroReceitas, 50);
    return;
  }

  S.humor = clamp(S.humor - 4); save();
  docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji" class="queimado">💨</div><h2>Queimou! 🔥</h2><p>Passou do ponto...</p><button id="btnVoltarForno" class="doc-btn-acao doc-btn-cinza">← Voltar</button></div>`);
  SOM.melodia([N.DO_BAIXO, N.DO_BAIXO, N.DO_BAIXO], 0.15, 'sawtooth', 0.12);
  setTimeout(() => document.getElementById('btnVoltarForno').onclick = abrirLivroReceitas, 50);
}

function abrirIngredientesDoceria() {
  docMostrarConteudo(`<div id="ing-header"><h2>🫙 Ingredientes</h2><p id="ing-moedas">Você tem: 🪙 ${S.moedas || 0}</p></div><div id="ing-lista"></div><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button>`);
  renderIngredientes();
  setTimeout(() => document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas, 50);
}

function renderIngredientes() {
  const lista = document.getElementById('ing-lista');
  if (!lista) return;
  let html = '';
  for (const [chave, ing] of Object.entries(INGREDIENTES)) {
    const qtd = S.ingredientes?.[chave] || 0;
    const podeComprar = (S.moedas || 0) >= ing.preco;
    html += `<div class="ing-item ${podeComprar ? '' : 'ing-sem-moeda'}" data-ing="${chave}"><div class="ing-emoji">${ing.emoji}</div><div class="ing-info"><div class="ing-nome">${ing.nome}</div><div class="ing-preco">🪙 ${ing.preco}</div></div><div class="ing-qtd">${qtd > 0 ? 'x' + qtd : ''}</div></div>`;
  }
  lista.innerHTML = html;
  setTimeout(() => document.querySelectorAll('.ing-item').forEach(el => el.onclick = () => comprarIngrediente(el.dataset.ing)), 50);
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
  const moedasEl = document.getElementById('ing-moedas');
  if (moedasEl) moedasEl.textContent = `Você tem: 🪙 ${S.moedas || 0}`;
  renderIngredientes();
}
