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

function abrirTelaSpa() {
  const tela = document.createElement('div');
  tela.id = 'telaSpa';
  tela.style.cssText = `
    position: fixed; inset: 0; background: linear-gradient(180deg, #d8b8e0 0%, #a88fc8 100%);
    z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #fff; animation: fadeIn .4s; overflow: hidden;
  `;
  
  tela.innerHTML = `
    <h1 style="font-size:24px;margin:0 0 4px">💆 Spa</h1>
    <p style="opacity:.8;margin:0 0 20px;font-size:14px">Relaxando...</p>
    <div style="position:relative;width:240px;height:240px;margin:10px 0">
      <svg viewBox="0 0 240 240" style="width:100%;height:100%;overflow:visible">
        <path d="M50 80 Q120 30 190 80 L190 95 Q120 55 50 95 Z" fill="#fff" opacity=".9"/>
        <circle cx="120" cy="60" r="14" fill="#fff" opacity=".9"/>
        <ellipse cx="120" cy="60" rx="14" ry="6" fill="#e8d5e8" opacity=".5"/>
        <ellipse cx="120" cy="140" rx="85" ry="65" fill="#f7d9e4"/>
        <circle cx="75" cy="105" r="38" fill="#f7d9e4"/>
        <circle cx="165" cy="105" r="38" fill="#f7d9e4"/>
        <ellipse cx="88" cy="120" rx="20" ry="13" fill="#7bc47f"/>
        <ellipse cx="152" cy="120" rx="20" ry="13" fill="#7bc47f"/>
        <ellipse cx="88" cy="117" rx="16" ry="9" fill="#a8dba8" opacity=".6"/>
        <ellipse cx="152" cy="117" rx="16" ry="9" fill="#a8dba8" opacity=".6"/>
        <circle cx="82" cy="115" r="2" fill="#fff" opacity=".7"/>
        <circle cx="146" cy="115" r="2" fill="#fff" opacity=".7"/>
        <ellipse cx="55" cy="150" rx="14" ry="8" fill="#f29db5" opacity=".6"/>
        <ellipse cx="185" cy="150" rx="14" ry="8" fill="#f29db5" opacity=".6"/>
        <path d="M105 155 q15 12 30 0" stroke="#5d4f9e" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g id="unha">
          <ellipse cx="200" cy="180" rx="10" ry="14" fill="#f7d9e4" stroke="#5d4f9e" stroke-width="2"/>
          <ellipse cx="200" cy="180" rx="7" ry="10" fill="#f29db5" opacity=".8">
            <animate attributeName="ry" values="2;10;10" dur="3s" repeatCount="indefinite"/>
          </ellipse>
          <line x1="200" y1="155" x2="200" y2="170" stroke="#8b6b4a" stroke-width="3" stroke-linecap="round"/>
          <rect x="197" y="145" width="6" height="12" fill="#d4a574" rx="2"/>
          <ellipse cx="200" cy="145" rx="3" ry="6" fill="#f29db5"/>
        </g>
        <text x="40" y="60" font-size="20" opacity=".8" class="sparkle">✨</text>
        <text x="190" y="70" font-size="16" opacity=".8" class="sparkle">✨</text>
        <text x="60" y="210" font-size="16" opacity=".8" class="sparkle">✨</text>
        <text x="180" y="215" font-size="20" opacity=".8" class="sparkle">✨</text>
      </svg>
    </div>
    <p id="spaTexto" style="font-size:17px;margin-top:20px;min-height:24px">Aaah... que delícia 🥒</p>
    <div style="width:200px;height:6px;background:#ffffff33;border-radius:6px;margin-top:16px;overflow:hidden">
      <div id="spaProgresso" style="height:100%;width:0%;background:#fff;border-radius:6px;transition:width 1s linear"></div>
    </div>
    <p style="opacity:.6;font-size:12px;margin-top:12px">Relaxando por 8 segundos...</p>
  `;
  
  document.body.appendChild(tela);
  SOM.melodia([N.SOL, N.MI, N.DO, N.MI], 0.5, 'sine', 0.06);
  setTimeout(() => SOM.melodia([N.FA, N.LA, N.DO2, N.LA], 0.5, 'sine', 0.06), 2000);
  setTimeout(() => SOM.melodia([N.SOL, N.MI, N.DO, N.MI], 0.5, 'sine', 0.06), 4000);
  setTimeout(() => SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.5, 'sine', 0.08), 6000);
  
  const falas = ['Aaah... que delícia 😊', 'Tô relaxando... 😌', 'Que paz... ✨', 'Pintando a unha 💅', 'Ficou linda! 💗'];
  const texto = document.getElementById('spaTexto');
  const progresso = document.getElementById('spaProgresso');
  let passo = 0;
  const TOTAL = 8000;
  const PASSO_TEMPO = 1600;
  
  const interval = setInterval(() => {
    passo++;
    if (passo < falas.length) texto.textContent = falas[passo];
    progresso.style.width = Math.min(100, (passo * PASSO_TEMPO / TOTAL) * 100) + '%';
  }, PASSO_TEMPO);
  
  setTimeout(() => {
    clearInterval(interval);
    progresso.style.width = '100%';
    S.saude = clamp(S.saude + 15);
    S.humor = clamp(S.humor + 10);
    S.energia = clamp(S.energia + 5);
    save();
    tela.innerHTML = `
      <div style="font-size:80px;animation:bounceIn .6s">✨</div>
      <h1 style="font-size:32px;margin:16px 0 8px">Tô renovada!</h1>
      <p style="font-size:15px;opacity:.9">❤️ +15 · 😊 +10 · 🔋 +5</p>
      <p style="font-size:13px;opacity:.7;margin-top:12px">Unhas lindas 💅</p>
    `;
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.15, 'sine', 0.12);
    setTimeout(() => {
      tela.style.animation = 'fadeOut .5s forwards';
      setTimeout(() => { tela.remove(); say('Tô renovada! 💅✨'); }, 500);
    }, 2500);
  }, TOTAL);
}

function painelClinica()   { panel('<h3>🏥 Clínica</h3><p style="opacity:.7">Em breve! Vou me cuidar aqui. 💊</p>'); }
function painelJogos()     { panel('<h3>🎮 Jogos</h3><p style="opacity:.7">Em breve! Vou brincar aqui. 🎲</p>'); }

/* ============ MERCADO ============ */
let carrinho = {};
let musicaMercado = null;
let vezesPediuMercado = 0;

function tocarMusicaMercado() {
  if (musicaMercado) return;
  const melodia = [N.DO, N.MI, N.SOL, N.MI, N.FA, N.LA, N.DO2, N.LA, N.SOL, N.SI, N.RE2 || N.RE, N.SI, N.DO, N.MI, N.SOL, N.DO];
  let i = 0;
  musicaMercado = setInterval(() => { SOM.nota(melodia[i % melodia.length], 0.25, 'triangle', 0.04); i++; }, 350);
}

function pararMusicaMercado() {
  if (musicaMercado) { clearInterval(musicaMercado); musicaMercado = null; }
}

function painelLoja() {
  carrinho = {};
  tocarMusicaMercado();
  vezesPediuMercado = 0;
  renderMercado();
}

function renderMercado() {
  const secoes = { saudavel: { emoji: '🥗', nome: 'Saudáveis' }, industrial: { emoji: '🍔', nome: 'Industrializados' }, doce: { emoji: '🍰', nome: 'Doces' } };
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
        <div class="item-mercado" data-add="${emoji}" style="background:#ffffff1a;border-radius:10px;padding:8px 4px;text-align:center;cursor:pointer;transition:background .2s;border:2px solid ${noCarrinho > 0 ? '#f7d9e4' : 'transparent'};">
          <div style="font-size:24px">${emoji}</div>
          <div style="font-size:10px;opacity:.7">${c.preco}🪙</div>
          ${noCarrinho > 0 ? `<div style="font-size:10px;color:#f7d9e4;font-weight:bold">x${noCarrinho}</div>` : ''}
        </div>`;
    });
    html += '</div>';
  }

  let total = 0, itensCarrinho = '';
  const itens = Object.entries(carrinho).filter(([_, q]) => q > 0);
  if (itens.length > 0) {
    itens.forEach(([emoji, q]) => {
      const item = CATALOGO[emoji];
      total += (item?.preco || 0) * q;
      itensCarrinho += `${emoji}x${q} `;
    });
  }

  html += `<hr style="border-color:#ffffff20;margin:12px 0">`;
  html += `<div style="font-size:14px;margin:8px 0">🛒 Carrinho: ${itensCarrinho || '<span style="opacity:.5">vazio</span>'}</div>`;
  html += `<div style="font-size:16px;font-weight:bold;margin:8px 0">Total: 🪙 ${total}</div>`;

  if (itens.length > 0) html += `<button id="btnPagar" style="font-size:16px;padding:14px;background:#f7d9e4;color:#1b1824">✓ Pagar ${total}🪙</button>`;
  panel(html);

  setTimeout(() => {
    document.querySelectorAll('[data-add]').forEach(el => {
      el.onclick = () => { carrinho[el.dataset.add] = (carrinho[el.dataset.add] || 0) + 1; SOM.nota(700 + Math.random() * 200, 0.05, 'sine', 0.08); renderMercado(); };
    });

    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
      btnPagar.onclick = () => {
        const total = Object.entries(carrinho).reduce((soma, [emoji, q]) => soma + (CATALOGO[emoji]?.preco || 0) * q, 0);
        if ((S.moedas || 0) < total) { say('Não tenho moedas suficientes... 😢'); return; }
        S.moedas -= total;
        if (!S.estoque) S.estoque = {};
        Object.entries(carrinho).forEach(([emoji, q]) => { S.estoque[emoji] = (S.estoque[emoji] || 0) + q; });
        SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.08, 'sine', 0.1); say('Comprei tudinho! 🛒✨');
        pararMusicaMercado(); P.classList.remove('on'); carrinho = {};
        setTimeout(() => { if (S.conectado) mundo(); }, 1000);
      };
    }
  }, 100);
}

/* ============ DOCERIA ============ */
function docMostrarConteudo(html) { const area = document.getElementById('doc-bancada-conteudo'); if (area) area.innerHTML = html; }
function abrirDoceria() {
  P.classList.remove('on');
  let doceria = document.getElementById('doceria'); if (doceria) doceria.remove();
  doceria = document.createElement('div'); doceria.id = 'doceria';
  doceria.innerHTML = `
    <div id="doc-topo"><button id="doc-sair" class="doc-btn-topo"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>Sair</span></button><div id="doc-botoes-direita"><button id="doc-livro" class="doc-btn-topo doc-btn-roxo"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/></svg><span>Livro de Receitas</span></button><button id="doc-ingredientes" class="doc-btn-topo doc-btn-verde"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M9 2v3"/><path d="M15 2v3"/><path d="M5 5h14a1 1 0 0 1 1 1v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1z"/><path d="M4 10h16"/></svg><span>Ingredientes</span></button></div></div>
    <div id="doc-cozinha"><div id="doc-parede"></div><div id="doc-prateleira"><div class="doc-pote" style="background:#f5c7d6"></div><div class="doc-pote" style="background:#b8dfd0"></div><div class="doc-pote" style="background:#d8c4ec"></div></div><div id="doc-quadro">☕</div><div id="doc-geladeira"><div class="doc-geladeira-linha"></div><div class="doc-geladeira-linha"></div></div><div id="doc-fogao"><div class="doc-fogao-topo"><div class="doc-boca"></div><div class="doc-boca"></div></div><div class="doc-fogao-porta"></div></div><div id="doc-coifa"></div><div id="doc-luminaria"><div class="doc-luz"></div></div></div>
    <div id="doc-bancada"><div id="doc-toalha"></div><div id="doc-bancada-conteudo"></div></div><div id="doc-tapete"></div>`;
  document.body.appendChild(doceria);
  document.getElementById('doc-sair').onclick = () => doceria.remove();
  document.getElementById('doc-livro').onclick = () => abrirLivroReceitas();
  document.getElementById('doc-ingredientes').onclick = () => abrirIngredientesDoceria();
}

function abrirLivroReceitas() { docMostrarConteudo(`<div id="livro-header"><h2>📖 Livro de Receitas</h2><p>Escolha uma receita pra fazer</p></div><div id="livro-lista"></div>`); renderLivroReceitas(); }
function renderLivroReceitas() {
  const lista = document.getElementById('livro-lista'); if (!lista) return;
  let html = '';
  for (const [id, r] of Object.entries(RECEITAS)) {
    const check = verificarIngredientes(r);
    html += `<div class="livro-receita" data-receita="${id}"><div class="livro-receita-emoji">${r.emoji}</div><div class="livro-receita-info"><div class="livro-receita-nome">${r.nome}</div><div class="livro-receita-status ${check.temTudo ? 'ok' : 'falta'}">${check.temTudo ? '✅ Pronto pra fazer' : '❌ Faltam ingredientes'}</div></div></div>`;
  }
  lista.innerHTML = html;
  setTimeout(() => document.querySelectorAll('.livro-receita').forEach(el => el.onclick = () => clicarReceita(el.dataset.receita)), 50);
}

function verificarIngredientes(receita) {
  const falta = [];
  for (const [chave, qtd] of Object.entries(receita.ingredientes)) {
    const tem = S.ingredientes?.[chave] || 0;
    if (tem < qtd) falta.push({ chave, nome: INGREDIENTES[chave]?.nome || chave, emoji: INGREDIENTES[chave]?.emoji || '?', tem, precisa: qtd });
  }
  return { temTudo: falta.length === 0, falta };
}

function clicarReceita(id) {
  const r = RECEITAS[id]; if (!r) return; const check = verificarIngredientes(r);
  if (!check.temTudo) {
    let htmlFalta = '<div id="receita-detalhe">' + `<h2>${r.emoji} ${r.nome}</h2><p class="receita-sub">Faltam esses ingredientes:</p><div class="receita-falta-lista">`;
    check.falta.forEach(f => { htmlFalta += `<div class="receita-falta-item"><span class="receita-falta-emoji">${f.emoji}</span><span class="receita-falta-nome">${f.nome}</span><span class="receita-falta-qtd">${f.tem}/${f.precisa}</span></div>`; });
    htmlFalta += '</div><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button><button id="btnComprarIng" class="doc-btn-acao doc-btn-verde">🫙 Comprar Ingredientes</button></div>';
    docMostrarConteudo(htmlFalta);
    setTimeout(() => { document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas; document.getElementById('btnComprarIng').onclick = abrirIngredientesDoceria; }, 50); return;
  }
  let htmlOk = '<div id="receita-detalhe">' + `<h2>${r.emoji} ${r.nome}</h2><p class="receita-sub">Ingredientes:</p><div class="receita-ing-lista">`;
  for (const [chave, qtd] of Object.entries(r.ingredientes)) { const ing = INGREDIENTES[chave]; htmlOk += `<div class="receita-ing-item"><span>${ing.emoji}</span><span>${ing.nome}</span><span class="receita-ing-qtd">x${qtd}</span></div>`; }
  htmlOk += '</div><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button><button id="btnComecar" class="doc-btn-acao doc-btn-roxo">👩‍🍳 Começar a fazer</button></div>';
  docMostrarConteudo(htmlOk);
  setTimeout(() => { document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas; document.getElementById('btnComecar').onclick = () => iniciarPreparo(id); }, 50);
}

let preparoAtual = null;
function iniciarPreparo(id) { if (!RECEITAS[id]) return; preparoAtual = { id, passo: 0 }; renderPreparo(); }
function renderPreparo() {
  if (!preparoAtual) return; const r = RECEITAS[preparoAtual.id]; const passo = r.passos[preparoAtual.passo]; const total = r.passos.length; const num = preparoAtual.passo + 1;
  let bolinhas = ''; for (let i = 0; i < total; i++) bolinhas += `<span class="prep-bola ${i < num ? 'ok' : ''}"></span>`;
  docMostrarConteudo(`<div id="prep-tela"><div id="prep-topo"><h2>${r.emoji} ${r.nome}</h2><p>Passo ${num} de ${total}</p></div><div id="prep-bolinhas">${bolinhas}</div><div id="prep-texto">${passo.texto}</div><button id="prep-acao" class="prep-acao">${passo.acao}</button><button id="prep-cancelar" class="doc-btn-acao doc-btn-cinza">Cancelar</button></div>`);
  setTimeout(() => { document.getElementById('prep-acao').onclick = avancarPreparo; document.getElementById('prep-cancelar').onclick = () => { preparoAtual = null; abrirLivroReceitas(); }; }, 50);
}

function avancarPreparo() {
  if (!preparoAtual) return; const r = RECEITAS[preparoAtual.id]; const passo = r.passos[preparoAtual.passo]; const btn = document.getElementById('prep-acao');
  if (btn) { const rect = btn.getBoundingClientRect(); const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2; voarEmoji(passo.acao, cx, cy); btn.style.transform = 'scale(.6)'; btn.style.opacity = '.4'; for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2; criarBrilho(cx, cy, Math.cos(ang) * 60, Math.sin(ang) * 60); } }
  SOM.melodia([N.DO + Math.random() * 150, N.MI + Math.random() * 150], 0.08, 'sine', 0.1); vib(30); preparoAtual.passo++;
  if (preparoAtual.passo >= r.passos.length) { setTimeout(() => { iniciarForno(preparoAtual.id); preparoAtual = null; }, 500); return; }
  setTimeout(renderPreparo, 450);
}

function voarEmoji(emoji, x, y) {
  const el = document.createElement('div'); el.textContent = emoji;
  el.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; font-size: 60px; z-index: 9999; pointer-events: none; transform: translate(-50%, -50%); transition: all .5s cubic-bezier(.3, 1.4, .5, 1); filter: drop-shadow(0 4px 8px rgba(93,79,158,.4));`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.left = x + 'px'; el.style.top = (y - 150) + 'px'; el.style.transform = 'translate(-50%, -50%) scale(1.4) rotate(15deg)'; });
  setTimeout(() => { el.style.top = (innerHeight - 100) + 'px'; el.style.transform = 'translate(-50%, -50%) scale(.5) rotate(-15deg)'; el.style.opacity = '0'; }, 300);
  setTimeout(() => el.remove(), 900);
}

function criarBrilho(x, y, dx, dy) {
  const el = document.createElement('div'); el.textContent = '✨';
  el.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; font-size: 18px; z-index: 9998; pointer-events: none; transform: translate(-50%, -50%); transition: all .5s ease-out; opacity: 1;`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.left = (x + dx) + 'px'; el.style.top = (y + dy) + 'px'; el.style.opacity = '0'; el.style.fontSize = '10px'; });
  setTimeout(() => el.remove(), 600);
}

function iniciarForno(id) {
  const r = RECEITAS[id]; if (!r) return;
  for (const [chave, qtd] of Object.entries(r.ingredientes)) { S.ingredientes[chave] = (S.ingredientes[chave] || 0) - qtd; if (S.ingredientes[chave] <= 0) delete S.ingredientes[chave]; } save();
  docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji">${r.emoji}</div><h2>Assando...</h2><p>Tira do forno na hora certa!</p><div id="forno-barra-wrap"><div id="forno-barra"><div id="forno-barra-preenche"></div><div id="forno-zona-boa"></div></div></div><button id="btnTirarForno" class="doc-btn-acao doc-btn-roxo">🔥 Tirar do forno</button></div>`);
  setTimeout(() => rodarMinigameForno(id), 50);
}

function rodarMinigameForno(id) {
  const r = RECEITAS[id]; if (!r) return; const barra = document.getElementById('forno-barra-preenche'); const zona = document.getElementById('forno-zona-boa'); const btn = document.getElementById('btnTirarForno'); if (!barra || !btn) return;
  const ZONA_INICIO = 60, ZONA_FIM = 85; zona.style.left = ZONA_INICIO + '%'; zona.style.width = (ZONA_FIM - ZONA_INICIO) + '%';
  let progresso = 0, terminou = false; const duracao = 3000 + (r.tempo / 1000) * 300; const passo = 100 / (duracao / 50);
  const iv = setInterval(() => { if (terminou) return; progresso += passo; if (progresso > 100) progresso = 100; barra.style.width = progresso + '%'; if (progresso >= 100) { clearInterval(iv); terminou = true; setTimeout(() => finalizarDoce(id, 'queimou'), 200); } }, 50);
  btn.onclick = () => { if (terminou) return; terminou = true; clearInterval(iv); btn.style.transform = 'scale(.9)'; setTimeout(() => btn.style.transform = '', 150); if (progresso < ZONA_INICIO) finalizarDoce(id, 'cru'); else if (progresso > ZONA_FIM) finalizarDoce(id, 'queimou'); else finalizarDoce(id, 'perfeito'); };
}

function finalizarDoce(id, resultado) {
  const r = RECEITAS[id]; if (!r) return;
  if (resultado === 'perfeito') {
    if (!S.estoque) S.estoque = {}; const chaveCaseiro = 'caseiro_' + r.emoji; S.estoque[chaveCaseiro] = (S.estoque[chaveCaseiro] || 0) + 1; save();
    docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji" class="pulse">${r.emoji}</div><h2>Ficou pronto! ✨</h2><p>${r.nome} perfeito</p><p style="font-size:12px;opacity:.6;margin-top:8px">Foi pro estoque — come quando quiser 💗</p><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-roxo">📖 Voltar ao Livro</button></div>`);
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12); setTimeout(() => document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas, 50); return;
  }
  if (resultado === 'cru') {
    S.humor = clamp(S.humor - 2); save(); docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji">🥣</div><h2>Tá cru... 😖</h2><p>Tirou do forno cedo demais</p><button id="btnVoltarForno" class="doc-btn-acao doc-btn-cinza">← Voltar</button></div>`);
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.2, 'sawtooth', 0.1); setTimeout(() => document.getElementById('btnVoltarForno').onclick = abrirLivroReceitas, 50); return;
  }
  S.humor = clamp(S.humor - 4); save(); docMostrarConteudo(`<div id="forno-tela"><div id="forno-emoji" class="queimado">💨</div><h2>Queimou! 🔥</h2><p>Passou do ponto...</p><button id="btnVoltarForno" class="doc-btn-acao doc-btn-cinza">← Voltar</button></div>`);
  SOM.melodia([N.DO_BAIXO, N.DO_BAIXO, N.DO_BAIXO], 0.15, 'sawtooth', 0.12); setTimeout(() => document.getElementById('btnVoltarForno').onclick = abrirLivroReceitas, 50);
}

function abrirIngredientesDoceria() {
  docMostrarConteudo(`<div id="ing-header"><h2>🫙 Ingredientes</h2><p id="ing-moedas">Você tem: 🪙 ${S.moedas || 0}</p></div><div id="ing-lista"></div><button id="btnVoltarLivro" class="doc-btn-acao doc-btn-cinza">← Voltar</button>`);
  renderIngredientes(); setTimeout(() => document.getElementById('btnVoltarLivro').onclick = abrirLivroReceitas, 50);
}

function renderIngredientes() {
  const lista = document.getElementById('ing-lista'); if (!lista) return; let html = '';
  for (const [chave, ing] of Object.entries(INGREDIENTES)) { const qtd = S.ingredientes?.[chave] || 0; const podeComprar = (S.moedas || 0) >= ing.preco; html += `<div class="ing-item ${podeComprar ? '' : 'ing-sem-moeda'}" data-ing="${chave}"><div class="ing-emoji">${ing.emoji}</div><div class="ing-info"><div class="ing-nome">${ing.nome}</div><div class="ing-preco">🪙 ${ing.preco}</div></div><div class="ing-qtd">${qtd > 0 ? 'x' + qtd : ''}</div></div>`; }
  lista.innerHTML = html; setTimeout(() => document.querySelectorAll('.ing-item').forEach(el => el.onclick = () => comprarIngrediente(el.dataset.ing)), 50);
}

function comprarIngrediente(chave) {
  const ing = INGREDIENTES[chave]; if (!ing) return; if ((S.moedas || 0) < ing.preco) { say('Não tenho moedas suficientes... 😢'); SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sawtooth', 0.1); return; }
  S.moedas -= ing.preco; if (!S.ingredientes) S.ingredientes = {}; S.ingredientes[chave] = (S.ingredientes[chave] || 0) + 1; save(); SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.1);
  const moedasEl = document.getElementById('ing-moedas'); if (moedasEl) moedasEl.textContent = `Você tem: 🪙 ${S.moedas || 0}`; renderIngredientes();
}

/* ============ BIBLIOTECA ============ */
const ESTANTE_LUGARES = 24;
function abrirBiblioteca() {
  P.classList.remove('on'); let bib = document.getElementById('biblioteca'); if (bib) bib.remove();
  bib = document.createElement('div'); bib.id = 'biblioteca';
  bib.innerHTML = `
    <div id="bib-topo"><button id="bib-sair" class="bib-btn-topo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span></button><button id="bib-loja" class="bib-btn-topo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span>Loja</span></button></div>
    <div id="bib-parede"></div><div id="bib-janela"></div><div class="bib-quadro q1">🌙</div><div class="bib-quadro q2">🌸</div>
    <div id="bib-estante"><div id="bib-estante-fundo"></div><div class="bib-fileira f1"></div><div class="bib-fileira f2"></div><div class="bib-fileira f3"></div><div class="bib-fileira f4"></div><div class="bib-prateleira p1"></div><div class="bib-prateleira p2"></div><div class="bib-prateleira p3"></div><div class="bib-prateleira p4"></div><div id="bib-base"></div></div>
    <div id="bib-chao"></div><div id="bib-tapete"></div><div id="bib-planta"></div>`;
  document.body.appendChild(bib);
  document.getElementById('bib-sair').onclick = () => bib.remove(); desenharEstante(bib); document.getElementById('bib-loja').onclick = () => abrirLojaLivros();
}

function desenharEstante(bib) {
  const fileiras = bib.querySelectorAll('.bib-fileira'); if (!fileiras.length) return;
  const comprados = S.livrosComprados || []; const estante = S.estante || {}; const livrosNaEstante = new Set(Object.values(estante)); const disponiveis = comprados.filter(id => !livrosNaEstante.has(id)); const temDisponiveis = disponiveis.length > 0;
  fileiras.forEach((fileira, fi) => { fileira.innerHTML = ''; for (let i = 0; i < 6; i++) { const idx = fi * 6 + i; const livroId = estante[String(idx)]; if (livroId && LIVROS[livroId]) { fileira.appendChild(criarLivroNaEstante(livroId, idx)); } else { const slot = document.createElement('div'); slot.className = 'bib-slot' + (temDisponiveis ? ' tem-livro' : ''); slot.dataset.idx = idx; slot.onclick = () => abrirEscolhaLivro(idx); fileira.appendChild(slot); } } });
}

function criarLivroNaEstante(livroId, idx) {
  const L = LIVROS[livroId]; const el = document.createElement('div'); el.className = 'bib-livro raridade-' + (L.raridade || 'comum'); el.dataset.idx = idx; el.dataset.livro = livroId;
  el.style.background = `linear-gradient(135deg, ${L.cor} 0%, ${ajustarCor(L.cor, -20)} 60%, ${L.cor} 100%)`; el.style.setProperty('--bib-cor2', L.cor2 || '#d4af37');
  const txt = document.createElement('div'); txt.className = 'bib-livro-txt'; txt.textContent = L.nome; el.appendChild(txt);
  const autor = document.createElement('div'); autor.className = 'bib-livro-autor'; autor.textContent = L.autor; el.appendChild(autor);
  el.onclick = (e) => { e.stopPropagation(); abrirMenuLivro(livroId, idx); }; return el;
}

function ajustarCor(hex, delta) { const h = hex.replace('#', ''); const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + delta)); const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + delta)); const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + delta)); return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''); }

function abrirEscolhaLivro(idx) {
  const old = document.getElementById('bib-escolha'); if (old) old.remove();
  const comprados = S.livrosComprados || []; const estante = S.estante || {}; const naEstante = new Set(Object.values(estante)); const disponiveis = comprados.filter(id => !naEstante.has(id));
  const modal = document.createElement('div'); modal.id = 'bib-escolha'; let html = `<div id="bib-escolha-card"><h3>📚 Colocar livro</h3><p>Escolha um livro pra colocar aqui</p>`;
  if (disponiveis.length === 0) { html += `<div class="bib-escolha-vazio">Você ainda não tem livros<br>fora da estante! 🛍️<br><br>Compre novos na <b>Loja</b>.</div>`; } else { disponiveis.forEach(id => { const L = LIVROS[id]; if (!L) return; html += `<div class="bib-escolha-item" data-id="${id}"><div class="bib-escolha-mini" style="background:linear-gradient(135deg, ${L.cor} 0%, ${ajustarCor(L.cor, -20)} 100%);"></div><div class="bib-escolha-info"><div class="bib-escolha-nome">${L.nome}</div><div class="bib-escolha-autor">${L.autor}</div></div></div>`; }); }
  html += `<button id="bib-escolha-cancelar">Cancelar</button></div>`; modal.innerHTML = html; document.body.appendChild(modal);
  modal.querySelectorAll('.bib-escolha-item').forEach(el => { el.onclick = () => { const livroId = el.dataset.id; if (!S.estante) S.estante = {}; S.estante[String(idx)] = livroId; save(); SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.1); modal.remove(); const bib = document.getElementById('biblioteca'); if (bib) desenharEstante(bib); }; });
  document.getElementById('bib-escolha-cancelar').onclick = () => modal.remove(); modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function abrirMenuLivro(livroId, idx) {
  const old = document.getElementById('bib-menu'); if (old) old.remove(); const L = LIVROS[livroId]; if (!L) return;
  const modal = document.createElement('div'); modal.id = 'bib-menu'; S.livrosLidos = S.livrosLidos || {}; const info = S.livrosLidos[livroId]; const agora = Date.now(); const cooldownMs = BIB_CONFIG.cooldownMin * 60 * 1000; const podeLer = !info || (agora - info.ultimaLeitura >= cooldownMs);
  let statusTxt = ''; if (!info) statusTxt = '<p style="font-size:11px;opacity:.5;margin:4px 0 14px;">📖 Ainda não leu</p>'; else if (!podeLer) { const faltaMin = Math.ceil((cooldownMs - (agora - info.ultimaLeitura)) / 60000); statusTxt = `<p style="font-size:11px;opacity:.5;margin:4px 0 14px;">⏳ Pode reler em ${faltaMin} min</p>`; } else { statusTxt = `<p style="font-size:11px;opacity:.5;margin:4px 0 14px;">${info.gostou ? '💗 Ela gostou' : '😕 Ela não gostou'}</p>`; }
  modal.innerHTML = `<div id="bib-menu-card"><h3>${L.nome}</h3><p>${L.autor}</p>${statusTxt}<button id="bib-menu-ler" style="background:#d8c4ec;color:#5d4f9e;">📖 Ler</button><button id="bib-menu-tirar" style="background:#f5c8c8;color:#8b3a3a;">🗑️ Tirar da estante</button><button id="bib-menu-cancelar" style="background:#e8e0e8;color:#5d4f9e;">Cancelar</button></div>`; document.body.appendChild(modal);
  document.getElementById('bib-menu-ler').onclick = () => { modal.remove(); lerLivro(livroId); };
  document.getElementById('bib-menu-tirar').onclick = () => { if (!S.estante) S.estante = {}; delete S.estante[String(idx)]; save(); SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1); modal.remove(); const bib = document.getElementById('biblioteca'); if (bib) desenharEstante(bib); };
  document.getElementById('bib-menu-cancelar').onclick = () => modal.remove(); modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function lerLivro(livroId) {
  const L = LIVROS[livroId]; if (!L) return; S.livrosLidos = S.livrosLidos || {}; const info = S.livrosLidos[livroId]; const agora = Date.now(); const cooldownMs = BIB_CONFIG.cooldownMin * 60 * 1000;
  if (info && (agora - info.ultimaLeitura < cooldownMs)) { say(rnd(BIB_CONFIG.falaAindaNao), 3000); set('sleepy', 2500); SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.08); return; }
  if (info) { const falas = info.gostou ? BIB_CONFIG.falaJaLeuGostou : BIB_CONFIG.falaJaLeuNaoGostou; say(rnd(falas), 3500); set(info.gostou ? 'carinho' : 'sad', 2800); if (info.gostou) { S.humor = clamp(S.humor + Math.round(BIB_CONFIG.humorGostou * 0.5)); ganharMoedas(Math.round(BIB_CONFIG.moedasGostou * 0.5)); } else { S.humor = clamp(S.humor + Math.round(BIB_CONFIG.humorNaoGostou * 0.5)); } info.ultimaLeitura = agora; save(); return; }
  const gostou = Math.random() * 100 < BIB_CONFIG.chanceGostar; S.livrosLidos[livroId] = { gostou: gostou, ultimaLeitura: agora }; set('curious', 3500, '📖 ...');
  if (gostou) { S.humor = clamp(S.humor + BIB_CONFIG.humorGostou); ganharMoedas(BIB_CONFIG.moedasGostou); SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.12); vib([30, 40, 30]); setTimeout(() => { say(rnd(BIB_CONFIG.falaGostou), 3500); set('carinho', 3000); setTimeout(() => heart(innerWidth / 2, innerHeight / 2), 200); }, 3600); } else { S.humor = clamp(S.humor + BIB_CONFIG.humorNaoGostou); SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.15, 'sawtooth', 0.1); setTimeout(() => { say(rnd(BIB_CONFIG.falaNaoGostou), 3500); set('sad', 3000); }, 3600); } save();
}

function abrirLojaLivros() {
  const old = document.getElementById('bib-loja-painel'); if (old) old.remove(); const painel = document.createElement('div'); painel.id = 'bib-loja-painel'; document.body.appendChild(painel); renderizarLojaLivros();
}

function renderizarLojaLivros() {
  const painel = document.getElementById('bib-loja-painel'); if (!painel) return; const comprados = S.livrosComprados || []; const total = Object.keys(LIVROS).length; const temTodos = comprados.length >= total;
  let html = `<div id="bib-loja-card"><div id="bib-loja-topo"><h2>🛍️ Loja de Livros</h2><div id="bib-loja-moedas">🪙 ${S.moedas || 0}</div></div><div id="bib-loja-lista">`;
  const ordenados = Object.entries(LIVROS).sort((a, b) => a[1].nome.localeCompare(b[1].nome, 'pt-BR'));
  ordenados.forEach(([id, L]) => { const jaTem = comprados.includes(id); const podeComprar = (S.moedas || 0) >= L.preco; const classes = ['bib-loja-item', jaTem ? 'comprado' : '', (!jaTem && !podeComprar) ? 'sem-moedas' : ''].filter(Boolean).join(' '); html += `<div class="${classes}" data-id="${id}"><div class="bib-loja-capa" style="background:linear-gradient(135deg, ${L.cor} 0%, ${ajustarCor(L.cor, -25)} 60%, ${L.cor} 100%); --bib-cor2:${L.cor2 || '#d4af37'};"></div><div class="bib-loja-info"><div class="bib-loja-nome">${L.nome}</div><div class="bib-loja-autor">${L.autor}</div>${jaTem ? `<div class="bib-loja-preco comprado">✓ COMPRADO</div>` : `<div class="bib-loja-preco">🪙 ${L.preco}</div>`}</div></div>`; });
  html += `</div><div id="bib-loja-rodape"><div id="bib-loja-progresso">📚 ${comprados.length} / ${total} livros na coleção${temTodos ? ' — COMPLETA! 🎉' : ''}</div><button id="bib-loja-fechar">Fechar</button></div></div>`; painel.innerHTML = html;
  setTimeout(() => { painel.querySelectorAll('.bib-loja-item').forEach(el => el.onclick = () => comprarLivro(el.dataset.id)); const btnFechar = document.getElementById('bib-loja-fechar'); if (btnFechar) btnFechar.onclick = () => { painel.remove(); const bib = document.getElementById('biblioteca'); if (bib) desenharEstante(bib); }; painel.onclick = (e) => { if (e.target === painel) { painel.remove(); const bib = document.getElementById('biblioteca'); if (bib) desenharEstante(bib); } }; }, 50);
}

function comprarLivro(id) {
  const L = LIVROS[id]; if (!L) return; const comprados = S.livrosComprados || []; if (comprados.includes(id)) { SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1); toastCompra('Você já tem esse livro! 📚'); return; } if ((S.moedas || 0) < L.preco) { SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sawtooth', 0.12); toastCompra('Moedas insuficientes... 😢'); return; }
  S.moedas -= L.preco; comprados.push(id); S.livrosComprados = comprados; save(); SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.08, 'sine', 0.12); vib([30, 40, 30]); toastCompra(`📚 ${L.nome} comprado!`); renderizarLojaLivros(); const bib = document.getElementById('biblioteca'); if (bib) desenharEstante(bib);
}

function toastCompra(txt) { const el = document.createElement('div'); el.className = 'bib-toast-compra'; el.textContent = txt; document.body.appendChild(el); setTimeout(() => el.remove(), 1600); }

/* ============ BOUTIQUE ============ */
let abaAtual = 'cabeca';
function painelBoutique() { renderBoutique(); }
function renderBoutique() {
  const abas = { cabeca: { emoji: '🌸', nome: 'Cabeça' }, oculos: { emoji: '🕶️', nome: 'Óculos' }, olhos: { emoji: '🎨', nome: 'Olhos' }, fundo: { emoji: '🌌', nome: 'Fundos' } }; let html = '<h3>👗 Boutique</h3>'; html += `<p style="font-size:13px;opacity:.7;margin:0 0 8px">Você tem: 🪙 ${S.moedas || 0}</p>`; html += '<div style="display:flex;gap:6px;margin:12px 0">';
  for (const [id, info] of Object.entries(abas)) { const ativo = abaAtual === id; html += `<button data-aba="${id}" style="flex:1;padding:10px 4px;font-size:12px;background:${ativo ? '#f7d9e4' : '#ffffff1a'};color:${ativo ? '#1b1824' : '#fff'};border:0;border-radius:10px;cursor:pointer;">${info.emoji}<br>${info.nome}</button>`; }
  html += '</div>'; const itens = BOUTIQUE[abaAtual] || {}; const comprados = S.compras || []; const equipado = S.equipado || {}; html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
  for (const [emoji, item] of Object.entries(itens)) { const comprado = comprados.includes(emoji); const usando = equipado[abaAtual] === emoji; html += `<div class="item-boutique" data-item="${emoji}" data-aba="${abaAtual}" style="background:${usando ? '#f7d9e4' : (comprado ? '#ffffff33' : '#ffffff1a')};border-radius:12px;padding:10px 4px;text-align:center;cursor:pointer;border:2px solid ${usando ? '#f7d9e4' : 'transparent'};position:relative;"><div style="font-size:28px">${emoji}</div><div style="font-size:10px;opacity:.7;margin-top:2px">${item.nome}</div><div style="font-size:11px;font-weight:bold;margin-top:4px;color:${usando ? '#1b1824' : '#fff'}">${usando ? '✓ USANDO' : (comprado ? 'EQUIPAR' : `${item.preco}🪙`)}</div></div>`; }
  html += '</div>'; const temAlgoEquipado = equipado[abaAtual]; if (temAlgoEquipado) { html += `<button id="btnTirar" style="font-size:14px;padding:10px;margin-top:12px;background:#ff6666;color:#fff;opacity:.8;">🗑️ Tirar ${temAlgoEquipado}</button>`; } panel(html);
  setTimeout(() => { document.querySelectorAll('[data-aba]:not(.item-boutique)').forEach(b => b.onclick = () => { abaAtual = b.dataset.aba; renderBoutique(); }); document.querySelectorAll('.item-boutique').forEach(el => el.onclick = () => { const emoji = el.dataset.item; const aba = el.dataset.aba; clicarItemBoutique(emoji, aba); }); const btnTirar = document.getElementById('btnTirar'); if (btnTirar) { btnTirar.onclick = () => { const equipado = S.equipado || {}; equipado[abaAtual] = null; S.equipado = equipado; save(); SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1); say('Tirei! 🗑️'); aplicarVisual(); renderBoutique(); }; } }, 100);
}

function clicarItemBoutique(emoji, aba) {
  const item = BOUTIQUE[aba][emoji]; if (!item) return; const comprados = S.compras || []; const equipado = S.equipado || {}; const jaComprou = comprados.includes(emoji); const jaUsando = equipado[aba] === emoji;
  if (jaUsando) { equipado[aba] = null; S.equipado = equipado; save(); SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1); say('Tirei! 🗑️'); aplicarVisual(); renderBoutique(); return; }
  if (jaComprou) { equipado[aba] = emoji; S.equipado = equipado; save(); SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1); say('Equipei! ✨'); aplicarVisual(); renderBoutique(); return; }
  if ((S.moedas || 0) < item.preco) { say('Não tenho moedas suficientes... 😢'); return; }
  S.moedas -= item.preco; comprados.push(emoji); S.compras = comprados; equipado[aba] = emoji; S.equipado = equipado; save(); SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12); say('Comprei! ✨'); aplicarVisual(); renderBoutique();
}

/* ============ CASA ============ */
$('bCasa').onclick = abrirCasa;
const CASA_CONFIG = { tipos: { single_home: { nome: 'Single Home', desc: 'Uma casinha aconchegante pra começar', preco: 150, tipo: 'pequena' } } };
function abrirCasa() {
  P.classList.remove('on'); let casa = document.getElementById('casa'); if (casa) casa.remove(); casa = document.createElement('div'); casa.id = 'casa';
  if (!S.casa || !S.casa.tipo) { casa.innerHTML = renderComprarCasa(); document.body.appendChild(casa); ligarBotoesComprarCasa(casa); return; }
  casa.innerHTML = renderInteriorCasa(); document.body.appendChild(casa); ligarBotoesCasa(casa);
}

function renderComprarCasa() {
  const tipos = CASA_CONFIG.tipos; const moedas = S.moedas || 0; let cards = '';
  for (const [id, t] of Object.entries(tipos)) { const podeComprar = moedas >= t.preco; cards += `<div class="casa-card"><div class="casa-preview"><div class="casa-porta"></div><div class="casa-janela-mini"></div><div class="casa-janela-mini dir"></div></div><div class="casa-nome">🏠 ${t.nome}</div><div class="casa-desc">${t.desc}</div><div class="casa-preco">🪙 ${t.preco}</div><button class="casa-btn-comprar" data-casa="${id}" ${podeComprar ? '' : 'disabled'}>${podeComprar ? '✓ Comprar' : '🪙 Moedas insuficientes'}</button></div>`; }
  return `<button id="casa-sair" class="bib-btn-topo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span></button><div id="casa-sem-casa"><h1>🏠 Sua Casa</h1><p class="sub">Você ainda não tem uma casa!<br>Escolha uma pra começar:</p>${cards}<div class="casa-moedas-info">Você tem: 🪙 ${moedas}</div></div>`;
}

function ligarBotoesComprarCasa(casa) {
  const sair = casa.querySelector('#casa-sair'); if (sair) sair.onclick = () => casa.remove();
  casa.querySelectorAll('[data-casa]').forEach(btn => { btn.onclick = () => { const id = btn.dataset.casa; const t = CASA_CONFIG.tipos[id]; if (!t) return; if ((S.moedas || 0) < t.preco) return; S.moedas -= t.preco; S.casa = { tipo: id, compradaEm: Date.now() }; save(); SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.14); vib([30, 40, 30]); casa.remove(); setTimeout(abrirCasa, 300); }; });
}

function renderInteriorCasa() { return `<button id="casa-sair" class="bib-btn-topo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span></button><div id="casa-interior"><div id="casa-parede"></div><div id="casa-janela"><div id="casa-janela-caixilho"></div></div><div id="casa-luz"></div><div id="casa-chao"></div><div id="casa-tapete"></div></div><div id="casa-nav"><button class="casa-nav-btn" data-ir="rua">🚪 Sair pra rua</button><button class="casa-nav-btn" data-ir="varanda">🌿 Ir pro quintal</button></div>`; }
function renderFachadaCasa() { return `<button id="casa-sair" class="bib-btn-topo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span></button><div id="casa-fachada"><div id="casa-ceu"></div><div id="casa-sol"></div><div id="casa-nuvens">☁️ ☁️</div><div id="casa-predio"><div id="casa-telhado"></div><div id="casa-corpo"><div id="casa-porta-externa"></div><div id="casa-janela-externa esq"></div><div id="casa-janela-externa dir"></div></div></div><div id="casa-rua"></div></div><div id="casa-nav"><button class="casa-nav-btn" data-ir="interior">🚪 Entrar em casa</button></div>`; }
function renderVarandaCasa() { return `<button id="casa-sair" class="bib-btn-topo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span></button><div id="casa-varanda"><div id="casa-varanda-ceu"></div><div id="casa-varanda-estrelas"></div><div id="casa-varanda-cerca"></div><div id="casa-varanda-pedras"></div><div id="casa-varanda-postes"><div class="casa-lampada" style="left:15%"></div><div class="casa-lampada" style="left:50%"></div><div class="casa-lampada" style="left:85%"></div></div><div id="casa-varanda-fio"></div><div id="casa-varanda-grama"></div><div id="casa-varanda-deck"></div></div><div id="casa-nav"><button class="casa-nav-btn" data-ir="interior">🏠 Voltar pra dentro</button></div>`; }

function ligarBotoesCasa(casa) {
  const sair = casa.querySelector('#casa-sair'); if (sair) sair.onclick = () => casa.remove();
  casa.querySelectorAll('[data-ir]').forEach(btn => { btn.onclick = () => { const destino = btn.dataset.ir; casa.remove(); setTimeout(() => abrirCasaEm(destino), 150); }; });
}

function abrirCasaEm(tela) { let casa = document.getElementById('casa'); if (casa) casa.remove(); casa = document.createElement('div'); casa.id = 'casa'; if (tela === 'rua') casa.innerHTML = renderFachadaCasa(); else if (tela === 'varanda') casa.innerHTML = renderVarandaCasa(); else casa.innerHTML = renderInteriorCasa(); document.body.appendChild(casa); ligarBotoesCasa(casa); }
