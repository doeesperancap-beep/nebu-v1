/* ============================================================
   cidade.js — mundo, cidade, mercado, spa, boutique, conectar
   ============================================================ */

/* ---------- Mundo (menu) ---------- */
function mundo() {
  if (S.sick > Date.now()) { say('Tô gripada... 🤧'); return; }

  if (S.conectado) {
    panel(
      '<h3>✨ Nébula City</h3>' +
      '<p style="font-size:13px;opacity:.7;margin:0 0 12px">Conectada! Escolha onde ir:</p>' +
      '<button data-x="loja" style="font-size:16px;padding:14px">🛒 Mercado</button>' +
      '<button data-x="boutique" style="font-size:16px;padding:14px">👗 Boutique</button>' +
      '<button data-x="spa" style="font-size:16px;padding:14px">💆 Spa</button>' +
      '<button data-x="clinica" style="font-size:16px;padding:14px">🏥 Clínica</button>' +
      '<button data-x="biblioteca" style="font-size:16px;padding:14px">📚 Biblioteca</button>' +
      '<button data-x="jogos" style="font-size:16px;padding:14px">🎮 Jogos</button>' +
      '<button data-x="doceria" style="font-size:16px;padding:14px">🍰 Doceria</button>' +
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
    `<div style="font-size:14px;opacity:.7;margin-top:8px">Descobertas: ${esc((S.mem || []).join(' ')) || 'nada ainda'}</div>`
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

/* ---------- Conectar à cidade ---------- */
function painelConectar() {
  panel(
    '<h3>🔗 Conectar Cidade</h3>' +
    `<p style="font-size:14px;opacity:.8;line-height:1.5">
      O ID desta Nébula é:<br>
      <code style="background:#ffffff20;padding:6px 10px;border-radius:6px;font-size:14px;display:inline-block;margin-top:6px">${esc(S.id || 'sem ID')}</code>
    </p>` +
    '<p style="font-size:14px;opacity:.8;line-height:1.5;margin-top:14px">Cole o ID da Cidade pra conectar:</p>' +
    '<input id="idCidade" type="text" placeholder="Ex: CITY-XXXX" maxlength="20" ' +
      'style="width:100%;padding:12px;border-radius:12px;border:0;font-size:15px;' +
      'background:#ffffff1a;color:#fff;box-sizing:border-box;margin:8px 0">' +
    '<button id="btnConectar">Conectar</button>' +
    '<p style="font-size:12px;opacity:.5;margin-top:12px">🔜 Em breve: conexão real via internet!</p>'
  );

  const btn = $('btnConectar');
  const inp = $('idCidade');
  btn.onclick = () => {
    const id = (inp.value || '').trim().toUpperCase();
    if (!id) { inp.style.background = '#ff000044'; return; }
    S.conectado = true;
    S.cidadeId = id;
    save();
    say('Conectada! ✨');
    salvarNoFirebase();
    P.classList.remove('on');
    setTimeout(mundo, 400);
  };
}

/* ---------- Tela da Cidade (modo Cidade) ---------- */
let cidadeTimer = null;

async function mostrarNebulasNaCidade() {
  const lista = await lerNebulas();
  const container = $('outrasNebos');
  if (!container) return;

  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<p style="opacity:.5;font-size:13px;padding:10px">Nenhuma outra Nébula na sala ainda...</p>';
    return;
  }

  container.innerHTML = `<h4 style="margin:0 0 8px;font-size:13px">🌟 ${lista.length} Nébula(s) na sala</h4>`;

  lista.forEach(n => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#ffffff1a;padding:8px;border-radius:12px;margin:6px 0;cursor:pointer;transition:background .2s';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:30px;height:30px;flex-shrink:0">${NEBO_SVG}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.nome || 'Nebo')}</div>
          <div style="font-size:10px;opacity:.5">${esc(n.id)}</div>
        </div>
      </div>
      <div style="font-size:11px;margin-top:6px;display:flex;gap:6px;justify-content:space-around">
        <span>😊${Math.round(Number(n.humor) || 0)}</span>
        <span>🍎${Math.round(Number(n.fome) || 0)}</span>
        <span>🔋${Math.round(Number(n.energia) || 0)}</span>
      </div>
    `;
    card.onmouseenter = () => card.style.background = '#ffffff33';
    card.onmouseleave = () => card.style.background = '#ffffff1a';
    card.onclick = () => mostrarBalao(`${String(n.nome || 'Nebo').slice(0, 12)} diz oi! 👋`);
    container.appendChild(card);
  });
}

function abrirCidade() {
  let cidade = $('cidade');
  if (!cidade) {
    cidade = document.createElement('div');
    cidade.id = 'cidade';
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
      area.onclick = () => clicarPredio(id);
      cidade.appendChild(area);
    }

    $('cidadeVoltar').onclick = () => {
      cidade.classList.remove('on');
      clearInterval(cidadeTimer);
      cidadeTimer = null;
    };
  }

  cidade.classList.add('on');
  setTimeout(() => mostrarBalao('Onde vamos hoje? ✨'), 400);
  mostrarNebulasNaCidade();
  clearInterval(cidadeTimer);                                   // ← evita timers empilhados
  cidadeTimer = setInterval(mostrarNebulasNaCidade, 15000);
}

function mostrarBalao(texto) {
  const b = $('cidadeBalao');
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
  setTimeout(() => panel(`<h3>${p.nome}</h3><p style="opacity:.7">Em breve ✨</p>`), 1200);
}

/* ---------- Mercado ---------- */
let carrinho = {};
let musicaMercado = null;

function tocarMusicaMercado() {
  if (musicaMercado) return;
  const melodia = [
    N.DO, N.MI, N.SOL, N.MI,  N.FA, N.LA, N.DO2, N.LA,
    N.SOL, N.SI, N.RE2, N.SI, N.DO, N.MI, N.SOL, N.DO
  ];
  let i = 0;
  musicaMercado = setInterval(() => {
    SOM.nota(melodia[i % melodia.length], 0.25, 'triangle', 0.04);
    i++;
  }, 350);
}

function pararMusicaMercado() {
  if (musicaMercado) { clearInterval(musicaMercado); musicaMercado = null; }
}

function painelLoja() {
  carrinho = {};
  tocarMusicaMercado();
  renderMercado();
}

function renderMercado() {
  const secoes = {
    saudavel:   { emoji: '🥗', nome: 'Saudáveis' },
    industrial: { emoji: '🍔', nome: 'Industrializados' },
    doce:       { emoji: '🍰', nome: 'Doces' }
  };

  let html = '<h3>🛒 Mercado</h3>';
  html += `<p style="font-size:13px;opacity:.7;margin:0 0 8px">Você tem: 🪙 ${S.moedas || 0}</p>`;

  for (const [tipo, info] of Object.entries(secoes)) {
    const comidas = Object.entries(CATALOGO).filter(([_, c]) => c.tipo === tipo);
    if (!comidas.length) continue;
    html += `<div style="margin:12px 0 6px;font-size:14px"><b>${info.emoji} ${info.nome}</b></div>`;
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
    comidas.forEach(([emoji, c]) => {
      const q = carrinho[emoji] || 0;
      html += `
        <div class="item-mercado" data-add="${emoji}" style="
          background:#ffffff1a;border-radius:10px;padding:8px 4px;
          text-align:center;cursor:pointer;transition:background .2s;
          border:2px solid ${q > 0 ? '#f7d9e4' : 'transparent'};">
          <div style="font-size:24px">${emoji}</div>
          <div style="font-size:10px;opacity:.7">${c.preco}🪙</div>
          ${q > 0 ? `<div style="font-size:10px;color:#f7d9e4;font-weight:bold">x${q}</div>` : ''}
        </div>`;
    });
    html += '</div>';
  }

  let total = 0, itensCarrinho = '';
  const itens = Object.entries(carrinho).filter(([_, q]) => q > 0);
  itens.forEach(([emoji, q]) => {
    total += (CATALOGO[emoji]?.preco || 0) * q;
    itensCarrinho += `${emoji}x${q} `;
  });

  html += '<hr style="border-color:#ffffff20;margin:12px 0">';
  html += `<div style="font-size:14px;margin:8px 0">🛒 Carrinho: ${itensCarrinho || '<span style="opacity:.5">vazio</span>'}</div>`;
  html += `<div style="font-size:16px;font-weight:bold;margin:8px 0">Total: 🪙 ${total}</div>`;
  if (itens.length > 0)
    html += `<button id="btnPagar" style="font-size:16px;padding:14px;background:#f7d9e4;color:#1b1824">✓ Pagar ${total}🪙</button>`;

  panel(html);

  P.querySelectorAll('[data-add]').forEach(el => {
    el.onclick = () => {
      const emoji = el.dataset.add;
      carrinho[emoji] = (carrinho[emoji] || 0) + 1;
      SOM.nota(700 + Math.random() * 200, 0.05, 'sine', 0.08);
      renderMercado();
    };
  });

  const btnPagar = $('btnPagar');
  if (btnPagar) {
    btnPagar.onclick = () => {
      if ((S.moedas || 0) < total) { say('Não tenho moedas suficientes... 😢'); return; }

      S.moedas -= total;
      if (!S.estoque) S.estoque = {};
      Object.entries(carrinho).forEach(([emoji, q]) => {
        S.estoque[emoji] = (S.estoque[emoji] || 0) + q;
      });
      save();

      SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.08, 'sine', 0.1);
      say('Comprei tudinho! 🛒✨');
      pararMusicaMercado();
      P.classList.remove('on');
      carrinho = {};
      setTimeout(() => { if (S.conectado) mundo(); }, 1000);
    };
  }
}

/* ---------- Spa ---------- */
const SPA_CUSTO = 10;

function painelSpa() {
  if ((S.moedas || 0) < SPA_CUSTO) {
    panel(
      '<h3>💆 Spa</h3>' +
      `<p style="opacity:.8;margin:12px 0">Pra relaxar no Spa, preciso de <b>🪙 ${SPA_CUSTO} moedas</b>.</p>` +
      `<p style="opacity:.6;font-size:13px">Você tem: 🪙 ${S.moedas || 0}<br>Faça um minigame pra ganhar mais!</p>`
    );
    return;
  }

  panel(
    '<h3>💆 Spa</h3>' +
    `<p style="opacity:.8;margin:12px 0">Relaxar no Spa custa <b>🪙 ${SPA_CUSTO} moedas</b>.</p>` +
    `<p style="opacity:.6;font-size:13px;margin-bottom:16px">Você tem: 🪙 ${S.moedas || 0}</p>` +
    '<button id="btnFazerSpa" style="font-size:16px;padding:14px">💆 Relaxar agora</button>'
  );
  $('btnFazerSpa').onclick = fazerSpa;
}

function fazerSpa() {
  S.moedas = (S.moedas || 0) - SPA_CUSTO;
  save();
  P.classList.remove('on');
  abrirTelaSpa();
}

function abrirTelaSpa() {
  const tela = document.createElement('div');
  tela.id = 'telaSpa';
  tela.style.cssText = `
    position: fixed; inset: 0;
    background: linear-gradient(180deg, #d8b8e0 0%, #a88fc8 100%);
    z-index: 100; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
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

        <g>
          <ellipse cx="200" cy="180" rx="10" ry="14" fill="#f7d9e4" stroke="#5d4f9e" stroke-width="2"/>
          <ellipse cx="200" cy="180" rx="7" ry="10" fill="#f29db5" opacity=".8">
            <animate attributeName="ry" values="2;10;10" dur="3s" repeatCount="indefinite"/>
          </ellipse>
          <line x1="200" y1="155" x2="200" y2="170" stroke="#8b6b4a" stroke-width="3" stroke-linecap="round"/>
          <rect x="197" y="145" width="6" height="12" fill="#d4a574" rx="2"/>
          <ellipse cx="200" cy="145" rx="3" ry="6" fill="#f29db5"/>
        </g>

        <text x="40" y="60" font-size="20" opacity=".8">✨</text>
        <text x="190" y="70" font-size="16" opacity=".8">✨</text>
        <text x="60" y="210" font-size="16" opacity=".8">✨</text>
        <text x="180" y="215" font-size="20" opacity=".8">✨</text>
      </svg>
    </div>

    <p id="spaTexto" style="font-size:17px;margin-top:20px;min-height:24px">Aaah... que delícia 🥒</p>

    <div style="width:200px;height:6px;background:#ffffff33;border-radius:6px;margin-top:16px;overflow:hidden">
      <div id="spaProgresso" style="height:100%;width:0%;background:#fff;border-radius:6px;transition:width 1s linear"></div>
    </div>
    <p style="opacity:.6;font-size:12px;margin-top:12px">Relaxando por 8 segundos...</p>
  `;
  document.body.appendChild(tela);

  // Harpa suave
  SOM.melodia([N.SOL, N.MI, N.DO, N.MI], 0.5, 'sine', 0.06);
  setTimeout(() => SOM.melodia([N.FA, N.LA, N.DO2, N.LA], 0.5, 'sine', 0.06), 2000);
  setTimeout(() => SOM.melodia([N.SOL, N.MI, N.DO, N.MI], 0.5, 'sine', 0.06), 4000);
  setTimeout(() => SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.5, 'sine', 0.08), 6000);

  const falas = ['Aaah... que delícia 😊', 'Tô relaxando... 😌', 'Que paz... ✨', 'Pintando a unha 💅', 'Ficou linda! 💗'];
  const texto = $('spaTexto');
  const progresso = $('spaProgresso');
  const TOTAL = 8000, PASSO_TEMPO = 1600;
  let passo = 0;

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

/* ---------- Placeholders ---------- */
function painelClinica() { panel('<h3>🏥 Clínica</h3><p style="opacity:.7">Em breve! Vou me cuidar aqui. 💊</p>'); }
function painelJogos()   { panel('<h3>🎮 Jogos</h3><p style="opacity:.7">Em breve! Vou brincar aqui. 🎲</p>'); }

/* ---------- Boutique ---------- */
let abaAtual = 'cabeca';

function painelBoutique() { renderBoutique(); }

function renderBoutique() {
  const abas = {
    cabeca: { emoji: '🌸', nome: 'Cabeça' },
    oculos: { emoji: '🕶️', nome: 'Óculos' },
    olhos:  { emoji: '🎨', nome: 'Olhos' },
    fundo:  { emoji: '🌌', nome: 'Fundos' }
  };

  let html = '<h3>👗 Boutique</h3>';
  html += `<p style="font-size:13px;opacity:.7;margin:0 0 8px">Você tem: 🪙 ${S.moedas || 0}</p>`;

  html += '<div style="display:flex;gap:6px;margin:12px 0">';
  for (const [id, info] of Object.entries(abas)) {
    const ativo = abaAtual === id;
    html += `<button data-aba="${id}" style="
      flex:1;padding:10px 4px;font-size:12px;
      background:${ativo ? '#f7d9e4' : '#ffffff1a'};
      color:${ativo ? '#1b1824' : '#fff'};
      border:0;border-radius:10px;cursor:pointer;">${info.emoji}<br>${info.nome}</button>`;
  }
  html += '</div>';

  const itens = BOUTIQUE[abaAtual] || {};
  const comprados = S.compras || [];
  const equipado = S.equipado || {};

  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
  for (const [emoji, item] of Object.entries(itens)) {
    const comprado = comprados.includes(emoji);
    const usando = equipado[abaAtual] === emoji;
    html += `
      <div class="item-boutique" data-item="${emoji}" style="
        background:${usando ? '#f7d9e4' : (comprado ? '#ffffff33' : '#ffffff1a')};
        border-radius:12px;padding:10px 4px;text-align:center;cursor:pointer;
        border:2px solid ${usando ? '#f7d9e4' : 'transparent'};position:relative;">
        <div style="font-size:28px">${emoji}</div>
        <div style="font-size:10px;opacity:.7;margin-top:2px">${item.nome}</div>
        <div style="font-size:11px;font-weight:bold;margin-top:4px;color:${usando ? '#1b1824' : '#fff'}">
          ${usando ? '✓ USANDO' : (comprado ? 'EQUIPAR' : `${item.preco}🪙`)}
        </div>
      </div>`;
  }
  html += '</div>';

  if (equipado[abaAtual]) {
    html += `<button id="btnTirar" style="font-size:14px;padding:10px;margin-top:12px;background:#ff6666;color:#fff;opacity:.8">🗑️ Tirar ${equipado[abaAtual]}</button>`;
  }

  panel(html);

  P.querySelectorAll('button[data-aba]').forEach(b => {
    b.onclick = () => { abaAtual = b.dataset.aba; renderBoutique(); };
  });
  P.querySelectorAll('.item-boutique').forEach(el => {
    el.onclick = () => clicarItemBoutique(el.dataset.item, abaAtual);
  });

  const btnTirar = $('btnTirar');
  if (btnTirar) {
    btnTirar.onclick = () => {
      S.equipado = S.equipado || {};
      S.equipado[abaAtual] = null;
      save();
      SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
      say('Tirei! 🗑️');
      aplicarVisual();
      renderBoutique();
    };
  }
}

function clicarItemBoutique(emoji, aba) {
  const item = BOUTIQUE[aba][emoji];
  if (!item) return;

  const comprados = S.compras || [];
  const equipado = S.equipado || {};
  const jaComprou = comprados.includes(emoji);
  const jaUsando = equipado[aba] === emoji;

  if (jaUsando) {
    equipado[aba] = null;
    S.equipado = equipado;
    save();
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
    say('Tirei! 🗑️');
    aplicarVisual(); renderBoutique();
    return;
  }

  if (jaComprou) {
    equipado[aba] = emoji;
    S.equipado = equipado;
    save();
    SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1);
    say('Equipei! ✨');
    aplicarVisual(); renderBoutique();
    return;
  }

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
  aplicarVisual(); renderBoutique();
}
