/* ============ MERCADO ============ */
let carrinho = {};
let musicaMercado = null;
let vezesPediuMercado = 0; // <- Corrigido o erro do guia!

function tocarMusicaMercado() {
  if (musicaMercado) return;
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

function painelLoja() {
  carrinho = {};
  tocarMusicaMercado();
  vezesPediuMercado = 0;
  renderMercado();
}

function renderMercado() {
  const secoes = {
    saudavel:    { emoji: '🥗', nome: 'Saudáveis' },
    industrial:  { emoji: '🍔', nome: 'Industrializados' },
    doce:        { emoji: '🍰', nome: 'Doces' },
  };

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
        </div>
      `;
    });
    html += '</div>';
  }

  let total = 0;
  let itensCarrinho = '';
  const itens = Object.entries(carrinho).filter(([_, q]) => q > 0);
  if (itens.length > 0) {
    itens.forEach(([emoji, q]) => {
      const item = CATALOGO[emoji];
      const preco = (item?.preco || 0) * q;
      total += preco;
      itensCarrinho += `${emoji}x${q} `;
    });
  }

  html += `<hr style="border-color:#ffffff20;margin:12px 0">`;
  html += `<div style="font-size:14px;margin:8px 0">🛒 Carrinho: ${itensCarrinho || '<span style="opacity:.5">vazio</span>'}</div>`;
  html += `<div style="font-size:16px;font-weight:bold;margin:8px 0">Total: 🪙 ${total}</div>`;

  if (itens.length > 0) {
    html += `<button id="btnPagar" style="font-size:16px;padding:14px;background:#f7d9e4;color:#1b1824">✓ Pagar ${total}🪙</button>`;
  }

  panel(html);

  setTimeout(() => {
    document.querySelectorAll('[data-add]').forEach(el => {
      el.onclick = () => {
        const emoji = el.dataset.add;
        carrinho[emoji] = (carrinho[emoji] || 0) + 1;
        SOM.nota(700 + Math.random() * 200, 0.05, 'sine', 0.08);
        renderMercado();
      };
    });

    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
      btnPagar.onclick = () => {
        const total = Object.entries(carrinho).reduce((soma, [emoji, q]) => {
          const item = CATALOGO[emoji];
          return soma + (item?.preco || 0) * q;
        }, 0);
        
        if ((S.moedas || 0) < total) {
          say('Não tenho moedas suficientes... 😢');
          return;
        }

        S.moedas -= total;

        if (!S.estoque) S.estoque = {};
        Object.entries(carrinho).forEach(([emoji, q]) => {
          S.estoque[emoji] = (S.estoque[emoji] || 0) + q;
        });

        SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.08, 'sine', 0.1);
        say('Comprei tudinho! 🛒✨');
        pararMusicaMercado();
        P.classList.remove('on');
        carrinho = {};
        setTimeout(() => { if (S.conectado) mundo(); }, 1000);
      };
    }
  }, 100);
}
