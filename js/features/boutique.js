/* ============ BOUTIQUE ============ */
let abaAtual = 'cabeca';

function painelBoutique() {
  renderBoutique();
}

function aplicarVisual() {
  document.querySelectorAll('.acessorio-nebo').forEach(e => e.remove());
  const eq = S.equipado || {};

  if (eq.cabeca) {
    const el = document.createElement('div');
    el.className = 'acessorio-nebo'; el.textContent = eq.cabeca;
    el.style.cssText = `position: absolute; top: -20px; right: -30px; font-size: calc(var(--ew) * 0.5); z-index: 10; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));`;
    document.getElementById('face').appendChild(el);
  }

  if (eq.oculos) {
    const el = document.createElement('div');
    el.className = 'acessorio-nebo'; el.textContent = eq.oculos;
    el.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: calc(var(--ew) * 1.8); z-index: 11; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,.5));`;
    document.getElementById('eyes').appendChild(el);
  }

  if (eq.olhos) {
    const cor = BOUTIQUE.olhos[eq.olhos]?.cor;
    if (cor) document.documentElement.style.setProperty('--eye', cor);
  } else {
    document.documentElement.style.setProperty('--eye', '#f7d9e4');
  }

  if (eq.fundo) {
    const cor = BOUTIQUE.fundo[eq.fundo]?.cor;
    if (cor) {
      document.body.style.background = cor;
      if (eq.fundo === '🌌' || eq.fundo === '🌠' || eq.fundo === '🌉') {
        document.body.style.background = `${cor} radial-gradient(circle at 30% 30%, #ffffff22 0 1px, transparent 2px), radial-gradient(circle at 70% 60%, #ffffff22 0 1px, transparent 2px), radial-gradient(circle at 50% 80%, #ffffff22 0 1px, transparent 2px), ${cor}`;
        document.body.style.backgroundSize = '200px 200px, 300px 300px, 150px 150px, auto';
      }
    }
  } else {
    document.body.style.background = '#000';
    document.body.style.backgroundImage = 'none';
  }
}

function renderBoutique() {
  const abas = { cabeca: { emoji: '🌸', nome: 'Cabeça' }, oculos: { emoji: '🕶️', nome: 'Óculos' }, olhos: { emoji: '🎨', nome: 'Olhos' }, fundo: { emoji: '🌌', nome: 'Fundos' } };
  let html = '<h3>👗 Boutique</h3>';
  html += `<p style="font-size:13px;opacity:.7;margin:0 0 8px">Você tem: 🪙 ${S.moedas || 0}</p>`;
  html += '<div style="display:flex;gap:6px;margin:12px 0">';

  for (const [id, info] of Object.entries(abas)) {
    const ativo = abaAtual === id;
    html += `<button data-aba="${id}" style="flex:1;padding:10px 4px;font-size:12px;background:${ativo ? '#f7d9e4' : '#ffffff1a'};color:${ativo ? '#1b1824' : '#fff'};border:0;border-radius:10px;cursor:pointer;">${info.emoji}<br>${info.nome}</button>`;
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
      <div class="item-boutique" data-item="${emoji}" data-aba="${abaAtual}" style="background:${usando ? '#f7d9e4' : (comprado ? '#ffffff33' : '#ffffff1a')};border-radius:12px;padding:10px 4px;text-align:center;cursor:pointer;border:2px solid ${usando ? '#f7d9e4' : 'transparent'};position:relative;">
        <div style="font-size:28px">${emoji}</div><div style="font-size:10px;opacity:.7;margin-top:2px">${item.nome}</div>
        <div style="font-size:11px;font-weight:bold;margin-top:4px;color:${usando ? '#1b1824' : '#fff'}">${usando ? '✓ USANDO' : (comprado ? 'EQUIPAR' : `${item.preco}🪙`)}</div>
      </div>`;
  }
  html += '</div>';

  const temAlgoEquipado = equipado[abaAtual];
  if (temAlgoEquipado) {
    html += `<button id="btnTirar" style="font-size:14px;padding:10px;margin-top:12px;background:#ff6666;color:#fff;opacity:.8;">🗑️ Tirar ${temAlgoEquipado}</button>`;
  }

  panel(html);

  setTimeout(() => {
    document.querySelectorAll('[data-aba]:not(.item-boutique)').forEach(b => b.onclick = () => { abaAtual = b.dataset.aba; renderBoutique(); });
    document.querySelectorAll('.item-boutique').forEach(el => el.onclick = () => clicarItemBoutique(el.dataset.item, el.dataset.aba));
    const btnTirar = document.getElementById('btnTirar');
    if (btnTirar) {
      btnTirar.onclick = () => {
        const eq = S.equipado || {}; eq[abaAtual] = null; S.equipado = eq; save();
        SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1); say('Tirei! 🗑️');
        aplicarVisual(); renderBoutique();
      };
    }
  }, 100);
}

function clicarItemBoutique(emoji, aba) {
  const item = BOUTIQUE[aba][emoji];
  if (!item) return;
  const comprados = S.compras || [];
  const equipado = S.equipado || {};
  const jaComprou = comprados.includes(emoji);
  const jaUsando = equipado[aba] === emoji;

  if (jaUsando) {
    equipado[aba] = null; S.equipado = equipado; save();
    SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sine', 0.1); say('Tirei! 🗑️');
    aplicarVisual(); renderBoutique(); return;
  }

  if (jaComprou) {
    equipado[aba] = emoji; S.equipado = equipado; save();
    SOM.melodia([N.DO, N.MI, N.SOL], 0.1, 'sine', 0.1); say('Equipei! ✨');
    aplicarVisual(); renderBoutique(); return;
  }

  if ((S.moedas || 0) < item.preco) { say('Não tenho moedas suficientes... 😢'); return; }

  S.moedas -= item.preco; comprados.push(emoji); S.compras = comprados; equipado[aba] = emoji; S.equipado = equipado; save();
  SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.12); say('Comprei! ✨');
  aplicarVisual(); renderBoutique();
}
