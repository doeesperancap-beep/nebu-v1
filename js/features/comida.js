/* ============ 8. COMIDA ============ */
const FOODS = ['🍎', '🍓', '🥒', '🍌'];
let lastTray = 0;

function prefs() {
  const c = Object.keys(S.food || {}).filter(k => S.food[k] > 2);
  if (!S.pref || Date.now() > S.pref.until)
    S.pref = c.length ? { f: rnd(c), until: Date.now() + 6048e5 } : null;
  if (!S.dis || (S.pref && S.dis === S.pref.f))
    S.dis = rnd(FOODS.filter(x => !S.pref || x !== S.pref.f));
}

function eat(f) {
  if ((S.estoque[f] || 0) <= 0) {
    say('Não tenho ' + f + ' no estoque... 😢');
    return;
  }

  const ehCaseiro = f.startsWith('caseiro_');
  const chaveReal = ehCaseiro ? f.replace('caseiro_', '') : f;
  const c = CATALOGO[chaveReal];

  if (!c) {
    say('Não sei o que é isso... 🤔');
    return;
  }

  S.estoque[f] -= 1;
  if (S.estoque[f] <= 0) delete S.estoque[f];
  P.classList.remove('on');
  S.fome = clamp(S.fome + 15);
  
  let humorGanho = c.humor;
  let extraFala = '';
  let extraExpressao = '';
  
  if ((S.favoritas || []).includes(f)) {
    humorGanho = c.humor * 2;
    extraFala = ' (meu favorito!)';
    extraExpressao = 'carinho';
  } else if ((S.detestadas || []).includes(f)) {
    humorGanho = Math.min(-3, c.humor * -1);
    extraFala = ' (eca!)';
    extraExpressao = 'sad';
  }
  
  S.humor = clamp(S.humor + humorGanho);
  S.saude = clamp(S.saude + c.saude);
  
  let fala = 'Nham! ' + f;
  let expressao = extraExpressao || 'happy';
  let msgExtra = extraFala;
  if (c.humor >= 7) {
    fala = 'Adoro! ' + f;
    expressao = 'carinho';
  } else if (c.humor >= 5) {
    fala = 'Que delícia! ' + f;
  } else if (c.saude >= 3) {
    fala = 'Saudável! ' + f + ' 🥗';
  } else if (c.saude < 0) {
    fala = 'Hmm... ' + f;
  }

  if (c.saude <= -2) {
    msgExtra = ' (muito bom )';
  } else if (c.saude >= 2) {
    msgExtra = ' ✨';
  }

  set(expressao, 2500, fala + msgExtra);
  SOM.melodia([N.MI, N.SOL], 0.1, 'triangle', 0.1);

  if (c.humor >= 6) {
    setTimeout(() => heart(innerWidth / 2, innerHeight / 2), 300);
  }

  if (ehCaseiro) {
    let bonus = 30;
    if ((S.favoritas || []).includes(chaveReal)) bonus += 15;
    ganharMoedas(bonus);
    setTimeout(() => {
      say(`Que delícia! +${bonus} 🪙 de carinho 💗`, 3500);
    }, 800);
  }
  save();
}

function foodTray() {
  const temEstoque = Object.keys(S.estoque || {}).filter(f => (S.estoque[f] || 0) > 0);

  if (temEstoque.length === 0) {
    panel(
      '<h3>🍽️ Comida</h3>' +
      '<p style="opacity:.7;margin:12px 0">Não tem nada no estoque...</p>' +
      '<p style="opacity:.6;font-size:13px">Vá ao mercado comprar comidinhas! 🛒</p>'
    );
    return;
  }

  panel(
    '<h3>🍽️ Comida</h3>' +
    '<p style="font-size:13px;opacity:.7;margin:0 0 12px">O que tenho pra comer:</p>' +
    temEstoque.map(f => {
      const qtd = S.estoque[f] || 0;
      const ehCaseiro = f.startsWith('caseiro_');
      const emoji = ehCaseiro ? f.replace('caseiro_', '') : f;
      const label = ehCaseiro ? ' (feito em casa)' : '';
      const cor = ehCaseiro ? 'background:#f7d9e4;color:#1b1824' : '';
      return `<button data-f="${f}" style="font-size:20px;padding:12px;display:flex;justify-content:space-between;align-items:center;${cor}">
        <span>${emoji}${label}</span>
        <span style="font-size:12px;opacity:.6">x${qtd}</span>
      </button>`;
    }).join('')
  );
}
