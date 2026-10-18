/* ============================================================
   biblioteca.js — estante, leitura, loja de livros
   ============================================================ */

/* ---------- Auxiliar ---------- */
function ajustarCor(hex, delta) {
  const h = hex.replace('#', '');
  const f = i => Math.max(0, Math.min(255, parseInt(h.slice(i, i + 2), 16) + delta));
  return '#' + [f(0), f(2), f(4)].map(v => v.toString(16).padStart(2, '0')).join('');
}

function redesenharEstante() {
  const bib = $('biblioteca');
  if (bib) desenharEstante(bib);
}

/* ---------- Estante ---------- */
function desenharEstante(bib) {
  const fileiras = bib.querySelectorAll('.bib-fileira');
  if (!fileiras.length) return;

  const comprados = S.livrosComprados || [];
  const estante = S.estante || {};

  const naEstante = new Set(Object.values(estante));
  const temDisponiveis = comprados.some(id => !naEstante.has(id));

  fileiras.forEach((fileira, fi) => {
    fileira.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const idx = fi * 6 + i;
      const livroId = estante[String(idx)];

      if (livroId && LIVROS[livroId]) {
        fileira.appendChild(criarLivroNaEstante(livroId, idx));
      } else {
        const slot = document.createElement('div');
        slot.className = 'bib-slot' + (temDisponiveis ? ' tem-livro' : '');
        slot.dataset.idx = idx;
        slot.onclick = () => abrirEscolhaLivro(idx);
        fileira.appendChild(slot);
      }
    }
  });
}

function criarLivroNaEstante(livroId, idx) {
  const L = LIVROS[livroId];
  const el = document.createElement('div');
  el.className = 'bib-livro raridade-' + (L.raridade || 'comum');
  el.dataset.idx = idx;
  el.dataset.livro = livroId;
  el.style.background = `linear-gradient(135deg, ${L.cor} 0%, ${ajustarCor(L.cor, -20)} 60%, ${L.cor} 100%)`;
  el.style.setProperty('--bib-cor2', L.cor2 || '#d4af37');

  const txt = document.createElement('div');
  txt.className = 'bib-livro-txt';
  txt.textContent = L.nome;
  el.appendChild(txt);

  const autor = document.createElement('div');
  autor.className = 'bib-livro-autor';
  autor.textContent = L.autor;
  el.appendChild(autor);

  el.onclick = e => { e.stopPropagation(); abrirMenuLivro(livroId, idx); };
  return el;
}

/* ---------- Escolher livro pra colocar ---------- */
function abrirEscolhaLivro(idx) {
  const old = $('bib-escolha');
  if (old) old.remove();

  const comprados = S.livrosComprados || [];
  const naEstante = new Set(Object.values(S.estante || {}));
  const disponiveis = comprados.filter(id => !naEstante.has(id));

  const modal = document.createElement('div');
  modal.id = 'bib-escolha';

  let html = `
    <div id="bib-escolha-card">
      <h3>📚 Colocar livro</h3>
      <p>Escolha um livro pra colocar aqui</p>
  `;

  if (disponiveis.length === 0) {
    html += `
      <div class="bib-escolha-vazio">
        Você ainda não tem livros<br>fora da estante! 🛍️<br><br>
        Compre novos na <b>Loja</b>.
      </div>`;
  } else {
    disponiveis.forEach(id => {
      const L = LIVROS[id];
      if (!L) return;
      html += `
        <div class="bib-escolha-item" data-id="${id}">
          <div class="bib-escolha-mini" style="background:linear-gradient(135deg, ${L.cor} 0%, ${ajustarCor(L.cor, -20)} 100%);"></div>
          <div class="bib-escolha-info">
            <div class="bib-escolha-nome">${L.nome}</div>
            <div class="bib-escolha-autor">${L.autor}</div>
          </div>
        </div>`;
    });
  }

  html += '<button id="bib-escolha-cancelar">Cancelar</button></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);

  modal.querySelectorAll('.bib-escolha-item').forEach(el => {
    el.onclick = () => {
      if (!S.estante) S.estante = {};
      S.estante[String(idx)] = el.dataset.id;
      save();
      SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.1);
      modal.remove();
      redesenharEstante();
    };
  });

  $('bib-escolha-cancelar').onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

/* ---------- Menu do livro ---------- */
function abrirMenuLivro(livroId, idx) {
  const old = $('bib-menu');
  if (old) old.remove();

  const L = LIVROS[livroId];
  if (!L) return;

  S.livrosLidos = S.livrosLidos || {};
  const info = S.livrosLidos[livroId];
  const agora = Date.now();
  const cooldownMs = BIB_CONFIG.cooldownMin * 60 * 1000;
  const podeLer = !info || (agora - info.ultimaLeitura >= cooldownMs);

  let statusTxt;
  if (!info) {
    statusTxt = '📖 Ainda não leu';
  } else if (!podeLer) {
    const faltaMin = Math.ceil((cooldownMs - (agora - info.ultimaLeitura)) / 60000);
    statusTxt = `⏳ Pode reler em ${faltaMin} min`;
  } else {
    statusTxt = info.gostou ? '💗 Ela gostou' : '😕 Ela não gostou';
  }

  const modal = document.createElement('div');
  modal.id = 'bib-menu';
  modal.innerHTML = `
    <div id="bib-menu-card">
      <h3>${L.nome}</h3>
      <p>${L.autor}</p>
      <p style="font-size:11px;opacity:.5;margin:4px 0 14px;">${statusTxt}</p>
      <button id="bib-menu-ler" style="background:#d8c4ec;color:#5d4f9e;">📖 Ler</button>
      <button id="bib-menu-tirar" style="background:#f5c8c8;color:#8b3a3a;">🗑️ Tirar da estante</button>
      <button id="bib-menu-cancelar" style="background:#e8e0e8;color:#5d4f9e;">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);

  $('bib-menu-ler').onclick = () => { modal.remove(); lerLivro(livroId); };

  $('bib-menu-tirar').onclick = () => {
    if (!S.estante) S.estante = {};
    delete S.estante[String(idx)];
    save();
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
    modal.remove();
    redesenharEstante();
  };

  $('bib-menu-cancelar').onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

/* ---------- Ler livro ---------- */
function lerLivro(livroId) {
  const L = LIVROS[livroId];
  if (!L) return;

  S.livrosLidos = S.livrosLidos || {};
  const info = S.livrosLidos[livroId];
  const agora = Date.now();
  const cooldownMs = BIB_CONFIG.cooldownMin * 60 * 1000;

  // Ainda em cooldown
  if (info && (agora - info.ultimaLeitura < cooldownMs)) {
    say(rnd(BIB_CONFIG.falaAindaNao), 3000);
    set('sleepy', 2500);
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.08);
    return;
  }

  // Já leu antes (efeito menor)
  if (info) {
    const falas = info.gostou ? BIB_CONFIG.falaJaLeuGostou : BIB_CONFIG.falaJaLeuNaoGostou;
    say(rnd(falas), 3500);
    set(info.gostou ? 'carinho' : 'sad', 2800);

    if (info.gostou) {
      S.humor = clamp(S.humor + Math.round(BIB_CONFIG.humorGostou * 0.5));
      ganharMoedas(Math.round(BIB_CONFIG.moedasGostou * 0.5));
    } else {
      S.humor = clamp(S.humor + Math.round(BIB_CONFIG.humorNaoGostou * 0.5));
    }
    info.ultimaLeitura = agora;
    save();
    return;
  }

  // Primeira leitura
  const gostou = Math.random() * 100 < BIB_CONFIG.chanceGostar;
  S.livrosLidos[livroId] = { gostou, ultimaLeitura: agora };

  set('curious', 3500, '📖 ...');

  if (gostou) {
    S.humor = clamp(S.humor + BIB_CONFIG.humorGostou);
    ganharMoedas(BIB_CONFIG.moedasGostou);
    SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.12);
    vib([30, 40, 30]);

    setTimeout(() => {
      say(rnd(BIB_CONFIG.falaGostou), 3500);
      set('carinho', 3000);
      setTimeout(() => heart(innerWidth / 2, innerHeight / 2), 200);
    }, 3600);
  } else {
    S.humor = clamp(S.humor + BIB_CONFIG.humorNaoGostou);
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.15, 'sawtooth', 0.1);

    setTimeout(() => {
      say(rnd(BIB_CONFIG.falaNaoGostou), 3500);
      set('sad', 3000);
    }, 3600);
  }
  save();
}

/* ---------- Loja de livros ---------- */
function abrirLojaLivros() {
  const old = $('bib-loja-painel');
  if (old) old.remove();

  const painel = document.createElement('div');
  painel.id = 'bib-loja-painel';
  document.body.appendChild(painel);
  renderizarLojaLivros();
}

function fecharLojaLivros() {
  const painel = $('bib-loja-painel');
  if (painel) painel.remove();
  redesenharEstante();
}

function renderizarLojaLivros() {
  const painel = $('bib-loja-painel');
  if (!painel) return;

  const comprados = S.livrosComprados || [];
  const total = Object.keys(LIVROS).length;
  const temTodos = comprados.length >= total;

  let html = `
    <div id="bib-loja-card">
      <div id="bib-loja-topo">
        <h2>🛍️ Loja de Livros</h2>
        <div id="bib-loja-moedas">🪙 ${S.moedas || 0}</div>
      </div>
      <div id="bib-loja-lista">
  `;

  const ordenados = Object.entries(LIVROS).sort((a, b) => a[1].nome.localeCompare(b[1].nome, 'pt-BR'));

  ordenados.forEach(([id, L]) => {
    const jaTem = comprados.includes(id);
    const podeComprar = (S.moedas || 0) >= L.preco;
    const classes = ['bib-loja-item', jaTem ? 'comprado' : '', (!jaTem && !podeComprar) ? 'sem-moedas' : '']
      .filter(Boolean).join(' ');

    html += `
      <div class="${classes}" data-id="${id}">
        <div class="bib-loja-capa"
             style="background:linear-gradient(135deg, ${L.cor} 0%, ${ajustarCor(L.cor, -25)} 60%, ${L.cor} 100%);
                    --bib-cor2:${L.cor2 || '#d4af37'};"></div>
        <div class="bib-loja-info">
          <div class="bib-loja-nome">${L.nome}</div>
          <div class="bib-loja-autor">${L.autor}</div>
          ${jaTem
            ? '<div class="bib-loja-preco comprado">✓ COMPRADO</div>'
            : `<div class="bib-loja-preco">🪙 ${L.preco}</div>`}
        </div>
      </div>`;
  });

  html += `
      </div>
      <div id="bib-loja-rodape">
        <div id="bib-loja-progresso">
          📚 ${comprados.length} / ${total} livros na coleção${temTodos ? ' — COMPLETA! 🎉' : ''}
        </div>
        <button id="bib-loja-fechar">Fechar</button>
      </div>
    </div>
  `;
  painel.innerHTML = html;

  painel.querySelectorAll('.bib-loja-item').forEach(el => {
    el.onclick = () => comprarLivro(el.dataset.id);
  });
  $('bib-loja-fechar').onclick = fecharLojaLivros;
  painel.onclick = e => { if (e.target === painel) fecharLojaLivros(); };
}

function comprarLivro(id) {
  const L = LIVROS[id];
  if (!L) return;

  const comprados = S.livrosComprados || [];

  if (comprados.includes(id)) {
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1);
    toastCompra('Você já tem esse livro! 📚');
    return;
  }
  if ((S.moedas || 0) < L.preco) {
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sawtooth', 0.12);
    toastCompra('Moedas insuficientes... 😢');
    return;
  }

  S.moedas -= L.preco;
  comprados.push(id);
  S.livrosComprados = comprados;
  save();

  SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.08, 'sine', 0.12);
  vib([30, 40, 30]);
  toastCompra(`📚 ${L.nome} comprado!`);

  renderizarLojaLivros();
  redesenharEstante();
}

function toastCompra(txt) {
  const el = document.createElement('div');
  el.className = 'bib-toast-compra';
  el.textContent = txt;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

/* ---------- Tela da Biblioteca ---------- */
function abrirBiblioteca() {
  P.classList.remove('on');

  let bib = $('biblioteca');
  if (bib) bib.remove();

  bib = document.createElement('div');
  bib.id = 'biblioteca';
  bib.innerHTML = `
    <div id="bib-topo">
      <button id="bib-sair" class="bib-btn-topo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/>
        </svg>
        <span>Sair</span>
      </button>

      <button id="bib-loja" class="bib-btn-topo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span>Loja</span>
      </button>
    </div>

    <div id="bib-parede"></div>
    <div id="bib-janela"></div>
    <div class="bib-quadro q1">🌙</div>
    <div class="bib-quadro q2">🌸</div>

    <div id="bib-estante">
      <div id="bib-estante-fundo"></div>
      <div class="bib-fileira f1"></div>
      <div class="bib-fileira f2"></div>
      <div class="bib-fileira f3"></div>
      <div class="bib-fileira f4"></div>
      <div class="bib-prateleira p1"></div>
      <div class="bib-prateleira p2"></div>
      <div class="bib-prateleira p3"></div>
      <div class="bib-prateleira p4"></div>
      <div id="bib-base"></div>
    </div>

    <div id="bib-chao"></div>
    <div id="bib-tapete"></div>
    <div id="bib-planta"></div>
  `;
  document.body.appendChild(bib);

  $('bib-sair').onclick = () => bib.remove();
  $('bib-loja').onclick = abrirLojaLivros;
  desenharEstante(bib);
}
