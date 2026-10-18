/* ============ 9. DOENÇA / XAROPE ============ */
function sickTick() {
  const n = Date.now();
  if (S.sick && S.sick <= n) {
    S.sick = 0;
    say('Passou! 😊'); set('happy', 2500);
  } else if (!S.sick && !gOn && Math.random() < .0006) {
    S.sick = n + 4 * 60000;
    say('Atchim! 🤧 🌡️ 37,8'); set('sick', 0);
  }
  const bx = $('bXarope');                    
  if (bx) bx.style.display = S.sick > n ? '' : 'none';
}

function xarope() {
  if (!S.sick || S.sick <= Date.now()) {
    say('Não estou doente agora... 🙂');
    return;
  }
  S.sick = 0;
  S.saude = clamp(S.saude + 15);
  S.humor = clamp(S.humor + 3);
  P.classList.remove('on');
  say('Xarope tomado! Já me sinto melhor 🍯');
  set('happy', 2500);
  if ($('bXarope')) $('bXarope').style.display = 'none';
  save();
}

/* ============ FEDOR (quando limpeza baixa) ============ */
setInterval(() => {
  if (S.limpeza >= 30) return;
  if (gOn) return;
  if (Math.random() > .3) return;

  const el = document.createElement('div');
  el.textContent = '💨';
  el.style.cssText = `
    position: fixed;
    left: ${innerWidth / 2 + (Math.random() * 200 - 100)}px;
    top: ${innerHeight / 2 + 100}px;
    font-size: 32px;
    z-index: 999;
    pointer-events: none;
    opacity: 0.8;
    transition: all 2.5s ease-out;
  `;
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.top = (innerHeight / 2 - 50) + 'px';
    el.style.opacity = '0';
    el.style.fontSize = '50px';
  });

  setTimeout(() => el.remove(), 2600);
}, 5000);

setInterval(() => {
  if (gOn) return;
  if (S.limpeza >= 30) return;
  if (Date.now() - lastAct < 30000) return;
  if (Math.random() > .15) return;

  if (S.limpeza < 15) {
    say('Tô precisando de banho... 🥺');
  } else {
    say('Acho que tô meio sujinha... 💨');
  }
}, 60000);
