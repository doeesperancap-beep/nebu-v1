/* ============ SPA ============ */
function painelSpa() {
  const CUSTO = 10;
  
  if ((S.moedas || 0) < CUSTO) {
    panel(
      '<h3>💆 Spa</h3>' +
      `<p style="opacity:.8;margin:12px 0">Pra relaxar no Spa, preciso de <b>🪙 ${CUSTO} moedas</b>.</p>` +
      `<p style="opacity:.6;font-size:13px">Você tem: 🪙 ${S.moedas || 0}<br>Faça um minigame pra ganhar mais!</p>`
    );
    return;
  }
  
  panel(
    '<h3>💆 Spa</h3>' +
    `<p style="opacity:.8;margin:12px 0">Relaxar no Spa custa <b>🪙 ${CUSTO} moedas</b>.</p>` +
    `<p style="opacity:.6;font-size:13px;margin-bottom:16px">Você tem: 🪙 ${S.moedas || 0}</p>` +
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
  tela.style.cssText = `position: fixed; inset: 0; background: linear-gradient(180deg, #d8b8e0 0%, #a88fc8 100%); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; animation: fadeIn .4s; overflow: hidden;`;
  
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
      setTimeout(() => {
        tela.remove();
        say('Tô renovada! 💅✨');
      }, 500);
    }, 2500);
  }, TOTAL);
}

function painelClinica()   { panel('<h3>🏥 Clínica</h3><p style="opacity:.7">Em breve! Vou me cuidar aqui. 💊</p>'); }
function painelJogos()     { panel('<h3>🎮 Jogos</h3><p style="opacity:.7">Em breve! Vou brincar aqui. 🎲</p>'); }
