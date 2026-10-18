/* ============ CASA DA NÉBULA ============ */
const CASA_CONFIG = {
  tipos: {
    single_home: {
      nome: 'Single Home',
      desc: 'Uma casinha aconchegante pra começar',
      preco: 150,
      tipo: 'pequena'
    }
  }
};

function abrirCasa() {
  P.classList.remove('on');
  let casa = document.getElementById('casa');
  if (casa) casa.remove();

  casa = document.createElement('div');
  casa.id = 'casa';

  if (!S.casa || !S.casa.tipo) {
    casa.innerHTML = renderComprarCasa();
    document.body.appendChild(casa);
    ligarBotoesComprarCasa(casa);
    return;
  }

  casa.innerHTML = renderInteriorCasa();
  document.body.appendChild(casa);
  ligarBotoesCasa(casa);
}

function renderComprarCasa() {
  const tipos = CASA_CONFIG.tipos;
  const moedas = S.moedas || 0;
  let cards = '';
  for (const [id, t] of Object.entries(tipos)) {
    const podeComprar = moedas >= t.preco;
    cards += `
      <div class="casa-card">
        <div class="casa-preview">
          <div class="casa-porta"></div>
          <div class="casa-janela-mini"></div>
          <div class="casa-janela-mini dir"></div>
        </div>
        <div class="casa-nome">🏠 ${t.nome}</div>
        <div class="casa-desc">${t.desc}</div>
        <div class="casa-preco">🪙 ${t.preco}</div>
        <button class="casa-btn-comprar" data-casa="${id}" ${podeComprar ? '' : 'disabled'}>
          ${podeComprar ? '✓ Comprar' : '🪙 Moedas insuficientes'}
        </button>
      </div>
    `;
  }

  return `
    <button id="casa-sair" class="bib-btn-topo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span>
    </button>
    <div id="casa-sem-casa">
      <h1>🏠 Sua Casa</h1>
      <p class="sub">Você ainda não tem uma casa!<br>Escolha uma pra começar:</p>
      ${cards}
      <div class="casa-moedas-info">Você tem: 🪙 ${moedas}</div>
    </div>
  `;
}

function ligarBotoesComprarCasa(casa) {
  const sair = casa.querySelector('#casa-sair');
  if (sair) sair.onclick = () => casa.remove();

  casa.querySelectorAll('[data-casa]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.casa;
      const t = CASA_CONFIG.tipos[id];
      if (!t) return;
      if ((S.moedas || 0) < t.preco) return;

      S.moedas -= t.preco;
      S.casa = { tipo: id, compradaEm: Date.now() };
      save();

      SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.14);
      vib([30, 40, 30]);

      casa.remove();
      setTimeout(abrirCasa, 300);
    };
  });
}

function renderInteriorCasa() {
  return `
    <button id="casa-sair" class="bib-btn-topo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span>
    </button>
    <div id="casa-interior">
      <div id="casa-parede"></div>
      <div id="casa-janela"><div id="casa-janela-caixilho"></div></div>
      <div id="casa-luz"></div>
      <div id="casa-chao"></div>
      <div id="casa-tapete"></div>
    </div>
    <div id="casa-nav">
      <button class="casa-nav-btn" data-ir="rua">🚪 Sair pra rua</button>
      <button class="casa-nav-btn" data-ir="varanda">🌿 Ir pro quintal</button>
    </div>
  `;
}

function renderFachadaCasa() {
  return `
    <button id="casa-sair" class="bib-btn-topo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span>
    </button>
    <div id="casa-fachada">
      <div id="casa-ceu"></div>
      <div id="casa-sol"></div>
      <div id="casa-nuvens">☁️ ☁️</div>
      <div id="casa-predio">
        <div id="casa-telhado"></div>
        <div id="casa-corpo">
          <div id="casa-porta-externa"></div>
          <div id="casa-janela-externa esq"></div>
          <div id="casa-janela-externa dir"></div>
        </div>
      </div>
      <div id="casa-rua"></div>
    </div>
    <div id="casa-nav">
      <button class="casa-nav-btn" data-ir="interior">🚪 Entrar em casa</button>
    </div>
  `;
}

function renderVarandaCasa() {
  return `
    <button id="casa-sair" class="bib-btn-topo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg><span>Sair</span>
    </button>
    <div id="casa-varanda">
      <div id="casa-varanda-ceu"></div>
      <div id="casa-varanda-estrelas"></div>
      <div id="casa-varanda-cerca"></div>
      <div id="casa-varanda-pedras"></div>
      <div id="casa-varanda-postes">
        <div class="casa-lampada" style="left:15%"></div>
        <div class="casa-lampada" style="left:50%"></div>
        <div class="casa-lampada" style="left:85%"></div>
      </div>
      <div id="casa-varanda-fio"></div>
      <div id="casa-varanda-grama"></div>
      <div id="casa-varanda-deck"></div>
    </div>
    <div id="casa-nav">
      <button class="casa-nav-btn" data-ir="interior">🏠 Voltar pra dentro</button>
    </div>
  `;
}

function ligarBotoesCasa(casa) {
  const sair = casa.querySelector('#casa-sair');
  if (sair) sair.onclick = () => casa.remove();

  casa.querySelectorAll('[data-ir]').forEach(btn => {
    btn.onclick = () => {
      const destino = btn.dataset.ir;
      casa.remove();
      setTimeout(() => abrirCasaEm(destino), 150);
    };
  });
}

function abrirCasaEm(tela) {
  let casa = document.getElementById('casa');
  if (casa) casa.remove();

  casa = document.createElement('div');
  casa.id = 'casa';

  if (tela === 'rua') casa.innerHTML = renderFachadaCasa();
  else if (tela === 'varanda') casa.innerHTML = renderVarandaCasa();
  else casa.innerHTML = renderInteriorCasa();

  document.body.appendChild(casa);
  ligarBotoesCasa(casa);
}
