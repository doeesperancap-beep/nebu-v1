/* ============ 10. MINIGAMES ============ */
let gOn = 0, gx = .5;

function startGame() {
  P.classList.remove('on');
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8;background:#000d';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  let fr = [], score = 0, t0 = Date.now(), last = t0;
  gOn = 1;
  c.onpointermove = e => gx = e.clientX / innerWidth;

  const iv = setInterval(() => {
    const n = Date.now(), dt = (n - last) / 1000; last = n;
    x.clearRect(0, 0, c.width, c.height);
    if (Math.random() < .05)
      fr.push({ x: Math.random(), y: 0, e: Math.random() < .06 ? '🍰' : rnd(['🍎', '🍓', '🍌']) });
    x.font = '34px serif'; x.textAlign = 'center';
    fr.forEach(f => { f.y += dt * (f.e === '🍰' ? 330 : 220); x.fillText(f.e, f.x * c.width, f.y); });
    const by = c.height - 90, bx = gx * c.width;
    x.fillText('🧺', bx, by + 20);
    fr = fr.filter(f => {
      if (f.y > by - 10 && f.y < by + 30 && Math.abs(f.x * c.width - bx) < 45) {
        score += f.e === '🍰' ? 5 : 1;
        if (f.e === '🍰') { say('Docinho! 🍰✨'); vib([40, 30, 80]); }
        return false;
      }
      return f.y < c.height;
    });
    x.font = '20px sans-serif'; x.fillStyle = '#fff';
    x.fillText('🍎 ' + score + '   ⏱ ' + Math.max(0, 40 - Math.round((n - t0) / 1000)), c.width / 2, 50);
    if (n - t0 > 40000)  {
      clearInterval(iv); c.remove(); gOn = 0;
      S.humor = clamp(S.humor + Math.min(25, score * 3 * pm('play')));
      S.energia = clamp(S.energia - 4);
      ganharMoedas(score);
      say('Fez ' + score + ' pontos! 🏆');
      if (score >= 10) startDance(7);
      else { set('happy', 3500); wig(); }
      save();
    }
  }, 33);
}

function startButterflies() {
  P.classList.remove('on');
  gOn = 1;
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8;background:#000a';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  let bf = [], fx = [], score = 0, t0 = Date.now(), last = t0, sp = 0;

  c.onpointerdown = e => {
    const i = bf.findIndex(b => Math.hypot(b.x - e.clientX, b.y - e.clientY) < 55);
    if (i >= 0) { fx.push({ x: bf[i].x, y: bf[i].y, t: 0 }); bf.splice(i, 1); score++; vib(20); }
  };

  const iv = setInterval(() => {
    const n = Date.now(), dt = (n - last) / 1000; last = n; sp -= dt;
    if (sp <= 0 && bf.length < 6) {
      sp = .7 + Math.random() * .6;
      const ty = rnd(['lenta', 'rapida', 'zig', 'curva', 'breve']), L = Math.random() < .5;
      bf.push({
        x: L ? -20 : c.width + 20,
        y: 60 + Math.random() * (c.height - 200),
        vx: (L ? 1 : -1) * ({ lenta: 45, rapida: 130 }[ty] || 80),
        vy: 0, ty, t: 0, life: ty === 'breve' ? 2.6 : 99
      });
    }
    x.clearRect(0, 0, c.width, c.height);
    x.textAlign = 'center'; x.font = '42px serif';
    bf = bf.filter(b => {
      b.t += dt;
      if (b.ty === 'zig' && Math.random() < dt * 1.8) b.vy = (Math.random() - .5) * 160;
      if (b.ty === 'curva') b.vy = Math.sin(b.t * 3) * 90;
      b.x += b.vx * dt;
      b.y = Math.max(40, Math.min(c.height - 100, b.y + b.vy * dt));
      x.fillText('🦋', b.x, b.y);
      return b.t < b.life && b.x > -40 && b.x < c.width + 40;
    });
    fx = fx.filter(f => {
      f.t += dt;
      x.globalAlpha = Math.max(0, 1 - f.t * 2.5);
      x.fillText('✨', f.x, f.y - f.t * 40);
      x.globalAlpha = 1;
      return f.t < .4;
    });
    x.font = '20px sans-serif'; x.fillStyle = '#fff';
    x.fillText('🦋 ' + score + '   ⏱ ' + Math.max(0, 25 - Math.round((n - t0) / 1000)), c.width / 2, 50);
    if (n - t0 > 25000) {
      clearInterval(iv); c.remove(); gOn = 0;
      S.humor = clamp(S.humor + Math.min(25, score * 3 * pm('play')));
      S.energia = clamp(S.energia - 4);
      SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.1, 'sine', 0.1);
      ganharMoedas(score * 2);
      say('Capturou ' + score + ' 🦋✨');
      if (score >= 8) startDance(6); else set('happy', 3000);
      save();
    }
  }, 33);
}

function startBath() {
  P.classList.remove('on');
  gOn = 1;
  escolherSabonete();
}

function escolherSabonete() {
  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8;background:#f5e8f0';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  const sabKeys = Object.keys(SABONETES);
  let posicoes = [];

  function desenhar() {
    const L = c.width;
    const A = c.height;
    x.clearRect(0, 0, L, A);
    x.fillStyle = '#f5e8f0';
    x.fillRect(0, 0, L, A);
    x.fillStyle = 'rgba(255, 255, 255, .4)';
    for (let i = 0; i < L; i += 40) {
      for (let j = 0; j < A; j += 40) {
        if ((i / 40 + j / 40) % 2 === 0) x.fillRect(i, j, 40, 40);
      }
    }

    x.font = 'bold 24px sans-serif';
    x.fillStyle = '#5d4f9e';
    x.textAlign = 'center';
    x.textBaseline = 'top';
    x.fillText('🛁 Escolha o sabonete', L / 2, 50);
    x.font = '14px sans-serif';
    x.globalAlpha = .6;
    x.fillText('Qual vai usar hoje?', L / 2, 82);
    x.globalAlpha = 1;

    const cols = 2;
    const linhas = Math.ceil(sabKeys.length / cols);
    const raio = Math.min(L / 5, A / 8);
    const espacoX = L / cols;
    const espacoY = (A * 0.55) / linhas;
    const inicioY = A * 0.22;

    posicoes = [];

    sabKeys.forEach((k, i) => {
      const sab = SABONETES[k];
      const col = i % cols;
      const lin = Math.floor(i / cols);
      const cx = espacoX * (col + 0.5);
      const cy = inicioY + espacoY * (lin + 0.5);

      x.beginPath();
      x.arc(cx, cy, raio, 0, 7);
      x.fillStyle = sab.cor;
      x.fill();
      x.strokeStyle = '#5d4f9e';
      x.lineWidth = 3;
      x.stroke();

      x.beginPath();
      x.arc(cx - raio * 0.3, cy - raio * 0.3, raio * 0.15, 0, 7);
      x.fillStyle = 'rgba(255,255,255,.7)';
      x.fill();

      x.font = `${raio * 1.1}px serif`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(sab.emoji, cx, cy);

      x.font = 'bold 15px sans-serif';
      x.fillStyle = '#5d4f9e';
      x.textBaseline = 'top';
      x.fillText(sab.nome, cx, cy + raio + 12);

      posicoes.push({ key: k, x: cx, y: cy, raio: raio * 1.2 });
    });

    x.font = '14px sans-serif';
    x.fillStyle = '#5d4f9e';
    x.globalAlpha = .5;
    x.textAlign = 'center';
    x.fillText('Toque fora pra cancelar', L / 2, A - 40);
    x.globalAlpha = 1;
  }

  desenhar();

  const redesenhar = () => {
    c.width = innerWidth;
    c.height = innerHeight;
    desenhar();
  };
  addEventListener('resize', redesenhar);
  addEventListener('orientationchange', redesenhar);

  const clicar = e => {
    const cx = e.clientX;
    const cy = e.clientY;

    for (const p of posicoes) {
      const d = Math.hypot(cx - p.x, cy - p.y);
      if (d < p.raio) {
        SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.1);
        vib(20);
        c.removeEventListener('pointerdown', clicar);
        removeEventListener('resize', redesenhar);
        removeEventListener('orientationchange', redesenhar);
        c.remove();
        comecarBanho(p.key);
        return;
      }
    }

    c.removeEventListener('pointerdown', clicar);
    removeEventListener('resize', redesenhar);
    removeEventListener('orientationchange', redesenhar);
    c.remove();
    gOn = 0;
    SOM.melodia([N.DO_BAIXO], 0.1, 'sine', 0.08);
  };

  c.addEventListener('pointerdown', clicar);
}

function comecarBanho(sabKey) {
  const sab = SABONETES[sabKey];
  if (!sab) return;

  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8';
  document.body.appendChild(c);
  const x = c.getContext('2d');

  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;z-index:9;left:0;right:0;bottom:24px;text-align:center';
  const b = document.createElement('button');
  b.style.cssText = 'background:#ffffff26;color:#fff;border:0;border-radius:22px;padding:12px 22px;font-size:17px';
  b.textContent = '🧼 Esfregar';
  bar.appendChild(b);
  document.body.append(c, bar);

  const saboneteEl = document.createElement('div');
  saboneteEl.textContent = sab.emoji;
  saboneteEl.style.cssText = `position: fixed; bottom: 100px; left: 20px; font-size: 50px; z-index: 9; pointer-events: none; filter: drop-shadow(0 4px 8px rgba(93,79,158,.3)); animation: flt 2s ease-in-out infinite;`;
  document.body.appendChild(saboneteEl);

  let step = 0, foam = [], down = 0;
  say(sab.fala, 3200);

  const draw = () => {
    x.clearRect(0, 0, c.width, c.height);
    foam.forEach(f => {
      x.beginPath();
      x.arc(f.x, f.y, f.r, 0, 7);
      x.fillStyle = sab.cor;
      x.fill();
      x.beginPath();
      x.arc(f.x - f.r * 0.3, f.y - f.r * 0.3, f.r * 0.2, 0, 7);
      x.fillStyle = 'rgba(255,255,255,.6)';
      x.fill();
    });
  };

  b.onclick = () => {
    if (step === 0) {
      step = 1;
      b.style.display = 'none';
      say('Arraste o dedo para esfregar 🫧');
    } else if (step === 2) {
      step = 3;
      b.style.display = 'none';
      say('Agora enxágue arrastando 🚿');
    }
  };

  c.onpointerdown = () => down = 1;
  c.onpointerup = c.onpointercancel = () => down = 0;
  c.onpointermove = e => {
    if (!down || step < 1 || step === 2) return;
    const px = e.clientX, py = e.clientY;

    if (step === 1) {
      foam.push({ x: px + Math.random() * 30 - 15, y: py + Math.random() * 30 - 15, r: 14 + Math.random() * 16 });
      set('sleepy', 1500, foam.length === 1 ? sab.fala : '');
      if (foam.length >= 70) {
        step = 2;
        b.textContent = '🚿 Enxaguar';
        b.style.display = '';
      }
    } else if (step === 3) {
      foam = foam.filter(f => Math.hypot(f.x - px, f.y - py) > 55);
      if (!foam.length) {
        c.remove();
        bar.remove();
        saboneteEl.remove();
        gOn = 0;

        S.humor = clamp(S.humor + 8);
        S.saude = clamp(S.saude + 3);
        S.limpeza = clamp(S.limpeza + 100);
        say('Limpinha com cheirinho de ' + sab.nome.toLowerCase() + '! ✨');
        ganharMoedas(5);
        startDance(6);
        setTimeout(() => set('carinho', 2500, '🥰'), 6200);
        save();
        return;
      }
    }
    draw();
  };
}

function startDino() {
  P.classList.remove('on');
  gOn = 1;

  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  c.style.cssText = 'position:fixed;inset:0;z-index:8;background:#f5e8d0';
  document.body.appendChild(c);
  const x = c.getContext('2d');

  const chao = c.height - 100;
  const nebo = { x: 80, y: chao, vy: 0, noChao: true };
  let bolos = [];
  let proxBolo = 0;
  let pontos = 0;
  let terminou = false;
  let recordePontos = S.recordeDino || 0;
  let recordeNome = 'Você';

  lerRecordeDino().then(rec => {
    if (rec && rec.pontos > recordePontos) {
      recordePontos = rec.pontos;
      recordeNome = rec.nome || 'Nebo';
    } else if (rec) {
      recordeNome = rec.nome || 'Nebo';
    }
  });

  const pular = () => {
    if (nebo.noChao && !terminou) {
      nebo.vy = -22;
      nebo.noChao = false;
      SOM.nota(700, 0.08, 'sine', 0.1);
      vib(20);
    }
  };
  c.onpointerdown = pular;

  const iv = setInterval(() => {
    if (terminou) return;
    const n = Date.now();

    nebo.vy += 1.5;
    nebo.y += nebo.vy;
    if (nebo.y >= chao) {
      nebo.y = chao;
      nebo.vy = 0;
      nebo.noChao = true;
    }

    if (bolos.length === 0 && n > proxBolo) {
      bolos.push({ x: c.width + 40 });
      proxBolo = n + 1400;
    }

    const vel = 10;
    bolos = bolos.filter(k => {
      k.x -= vel;
      const bateu = nebo.x + 30 > k.x && nebo.x - 20 < k.x + 40 && nebo.y + 20 > chao - 20;

      if (bateu) {
        terminou = true;
        clearInterval(iv);
        c.remove();
        gOn = 0;
        S.humor = clamp(S.humor - 3);
        let novoRecordeLocal = false;
        if (pontos > (S.recordeDino || 0)) {
          S.recordeDino = pontos;
          novoRecordeLocal = true;
        }
        if (pontos > 0) ganharMoedas(pontos);
        save();

        if (pontos > recordePontos) {
          salvarRecordeDino(pontos, S.nome || 'Nebo', S.id || 'sem-id');
        }

        if (novoRecordeLocal || pontos > recordePontos) {
          SOM.melodia([N.DO, N.MI, N.SOL, N.DO2], 0.12, 'sine', 0.14);
          say('🏆 NOVO RECORDE GLOBAL! ' + pontos + ' bolos!');
        } else {
          SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.2, 'sawtooth', 0.1);
          say('Ai! Bati no bolo 😢');
        }
        return false;
      }

      if (k.x < nebo.x - 40 && !k._contado) {
        k._contado = true;
        pontos += 1;
        SOM.nota(900, 0.06, 'sine', 0.08);
      }
      return k.x > -100;
    });

    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = '#8b6b4a';
    x.fillRect(0, chao + 40, c.width, 20);
    x.fillStyle = '#c9a878';
    x.fillRect(0, chao + 40, c.width, 6);

    x.font = '40px serif';
    x.textAlign = 'right';
    x.fillText('☀️', c.width - 30, 70);

    x.textAlign = 'center';
    x.fillText('☁️', (n / 60) % (c.width + 100) - 50, 100);
    x.fillText('☁️', (n / 90) % (c.width + 100) - 50, 150);

    x.font = '55px serif';
    bolos.forEach(k => {
      x.fillText('🍰', k.x + 25, chao + 30);
    });

    const ex = nebo.x;
    const ey = nebo.y - 35;

    x.fillStyle = '#f7d9e4';
    x.beginPath();
    x.ellipse(ex - 14, ey, 14, 16, 0, 0, 7);
    x.fill();
    x.beginPath();
    x.ellipse(ex + 14, ey, 14, 16, 0, 0, 7);
    x.fill();

    x.strokeStyle = '#5d4f9e';
    x.lineWidth = 3;
    x.beginPath();
    x.ellipse(ex - 14, ey, 14, 16, 0, 0, 7);
    x.stroke();
    x.beginPath();
    x.ellipse(ex + 14, ey, 14, 16, 0, 0, 7);
    x.stroke();

    x.fillStyle = '#fff';
    x.beginPath();
    x.arc(ex - 18, ey - 6, 3, 0, 7);
    x.fill();
    x.beginPath();
    x.arc(ex + 10, ey - 6, 3, 0, 7);
    x.fill();

    x.fillStyle = 'rgba(242, 157, 181, .5)';
    x.beginPath();
    x.ellipse(ex - 30, ey + 10, 7, 4, 0, 0, 7);
    x.fill();
    x.beginPath();
    x.ellipse(ex + 30, ey + 10, 7, 4, 0, 0, 7);
    x.fill();

    x.textAlign = 'left';
    x.font = '22px sans-serif';
    x.fillStyle = '#5d4f9e';
    x.fillText('🍰 ' + pontos, 20, 40);

    x.textAlign = 'right';
    x.font = '14px sans-serif';
    x.fillStyle = '#5d4f9e';
    x.fillText('🏆 ' + recordeNome + ' — ' + recordePontos, c.width - 20, 40);

    if (pontos > recordePontos && recordePontos > 0) {
      x.fillStyle = '#2e6b52';
      x.fillText('🎉 batendo o recorde!', c.width - 20, 62);
    }
  }, 40);
}
