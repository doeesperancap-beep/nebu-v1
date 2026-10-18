/* ============ CIDADE ============ */
async function mostrarNebulasNaCidade() {
  const lista = await lerNebulas();
  const container = document.getElementById('outrasNebos');
  if (!container) return;

  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<p style="opacity:.5;font-size:13px;padding:10px">Nenhuma outra Nébula na sala ainda...</p>';
    return;
  }

  container.innerHTML = `<h4 style="margin:0 0 8px;font-size:13px">🌟 ${lista.length} Nébula(s) na sala</h4>`;

  lista.forEach((n, i) => {
    const card = document.createElement('div');
    card.style.cssText = `background: #ffffff1a; padding: 8px; border-radius: 12px; margin: 6px 0; cursor: pointer; transition: background .2s;`;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:30px;height:30px;flex-shrink:0">${NEBO_SVG}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.nome || 'Nebo'}</div>
          <div style="font-size:10px;opacity:.5">${n.id}</div>
        </div>
      </div>
      <div style="font-size:11px;margin-top:6px;display:flex;gap:6px;justify-content:space-around">
        <span>😊${Math.round(n.humor||0)}</span>
        <span>🍎${Math.round(n.fome||0)}</span>
        <span>🔋${Math.round(n.energia||0)}</span>
      </div>
    `;

    card.onmouseenter = () => card.style.background = '#ffffff33';
    card.onmouseleave = () => card.style.background = '#ffffff1a';
    card.onclick = () => mostrarBalao(`${n.nome} diz oi! 👋`);

    container.appendChild(card);
  });
}

let intervaloNebos = null;

function abrirCidade() {
  let cidade = document.getElementById('cidade');
  if (!cidade) {
    cidade = document.createElement('div');
    cidade.innerHTML = `
      <img id="cidadeMapa" src="cidade.jpeg" alt="Nébula City">
      <div id="cidadeNebo">${NEBO_SVG}</div>
      <div id="cidadeBalao"></div>
      <button id="cidadeVoltar">← Voltar</button>
      <div id="outrasNebos" style="position:absolute;top:60px;right:12px;max-width:200px;max-height:60vh;overflow:auto;background:#1b1824e6;border-radius:14px;padding:10px;font-size:13px;color:#fff;z-index:30;"></div>
    `;
    document.body.appendChild(cidade);

    for (const [id, p] of Object.entries(CIDADE_PREDIOS)) {
      const area = document.createElement('div');
      area.className = 'predio';
      area.dataset.p = id;
      area.style.cssText = `left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%`;
      cidade.appendChild(area);
    }

    cidade.querySelectorAll('.predio').forEach(el => {
      el.onclick = () => clicarPredio(el.dataset.p);
    });

    document.getElementById('cidadeVoltar').onclick = () => {
      cidade.classList.remove('on');
    };
  }

  cidade.classList.add('on');
  setTimeout(() => mostrarBalao('Onde vamos hoje? ✨'), 400);
  mostrarNebulasNaCidade();
  
  if (intervaloNebos) clearInterval(intervaloNebos);
  intervaloNebos = setInterval(mostrarNebulasNaCidade, 15000);
}

function mostrarBalao(texto) {
  const b = document.getElementById('cidadeBalao');
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
  setTimeout(() => {
    panel(`<h3>${p.nome}</h3><p style="opacity:.7">Em breve ✨</p>`);
  }, 1200);
}
