/* ============ MUNDO (modo Nébula) ============ */
function mundo() {
  if (S.sick > Date.now()) { say('Tô gripada... 🤧'); return; }

  if (S.conectado) {
    panel(
      '<h3>✨ Nébula City</h3>' +
      `<p style="font-size:13px;opacity:.7;margin:0 0 12px">Conectada! Escolha onde ir:</p>` +
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
    `<div style="font-size:14px;opacity:.7;margin-top:8px">Descobertas: ${(S.mem || []).join(' ') || 'nada ainda'}</div>`
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

/* ============ CONECTAR CIDADE ============ */
function painelConectar() {
  panel(
    '<h3>🔗 Conectar Cidade</h3>' +
    `<p style="font-size:14px;opacity:.8;line-height:1.5">
      O ID desta Nébula é:<br>
      <code style="background:#ffffff20;padding:6px 10px;border-radius:6px;font-size:14px;display:inline-block;margin-top:6px">${S.id || 'sem ID'}</code>
    </p>` +
    '<p style="font-size:14px;opacity:.8;line-height:1.5;margin-top:14px">' +
      'Cole o ID da Cidade pra conectar:' +
    '</p>' +
    '<input id="idCidade" type="text" placeholder="Ex: CITY-XXXX" maxlength="20" ' +
      'style="width:100%;padding:12px;border-radius:12px;border:0;font-size:15px;' +
      'background:#ffffff1a;color:#fff;box-sizing:border-box;margin:8px 0">' +
    '<button id="btnConectar">Conectar</button>' +
    '<p style="font-size:12px;opacity:.5;margin-top:12px">' +
      '🔜 Em breve: conexão real via internet!' +
    '</p>'
  );

  setTimeout(() => {
    const btn = document.getElementById('btnConectar');
    const inp = document.getElementById('idCidade');
    if (!btn) return;
    btn.onclick = () => {
      const id = (inp.value || '').trim().toUpperCase();
      if (!id) {
        inp.style.background = '#ff000044';
        return;
      }
      S.conectado = true;
      S.cidadeId = id;
      save();
      say('Conectada! ✨');
      salvarNoFirebase();
      P.classList.remove('on');
      setTimeout(mundo, 400);
    };
  }, 100);
}
