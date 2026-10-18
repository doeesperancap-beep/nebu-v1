/* ============ LOOP PRINCIPAL ============ */
function foodTick() {
  prefs();
}

// --- INICIALIZAÇÃO ---
prefs();
aplicarVisual();

if (!S.modo) {
  setTimeout(modoPanel, 400);
} else {
  iniciarModo();
}

// --- SAUDAÇÃO ---
(() => {
  const d = new Date(), h = d.getHours(), k = d.toDateString();
  if (awayAtBoot > (S.pers === 'carinhosa' ? 60 : 180)) say('Que saudade! 💗');
  else if (S.greet !== k && h >= 6 && h < 12) { S.greet = k; say('Bom dia! ☀️'); }
  else if (isNight()) say('Boa noite... 😴');
  if (!navigator.onLine) say('Sem internet... 📵');
})();

// --- LOOP DE TEMPO ---
setInterval(() => {
  decay(5 / 60);
  sickTick();
  foodTick();
  joyTick();
  save();
  if (['neutral', 'sleepy', 'sad', 'sick', 'bored'].includes(mood))
    set(baseMood(), 0);
}, 5000);

// --- PAUSA EM SEGUNDO PLANO ---
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenAt = Date.now();
  } else {
    if (hiddenAt) {
      const m = (Date.now() - hiddenAt) / 60000;
      offline(m);
      S.last = Date.now();
      save();
      set(baseMood(), 0);
      hiddenAt = 0;
    }
  }
});

// --- AVISO DE ATUALIZAÇÃO ---
(function checkVersion() {
  const VERSAO_KEY = 'nebula-versao-vista';
  const metaTag = document.querySelector('meta[name="version"]');
  const versaoNova = Number(metaTag?.content || 1);
  const versaoVista = Number(localStorage.getItem(VERSAO_KEY) || 0);

  if (versaoVista && versaoVista < versaoNova) {
    mostrarAviso(versaoNova, VERSAO_KEY);
  } else {
    localStorage.setItem(VERSAO_KEY, versaoNova);
  }
})();

function mostrarAviso(nova, key) {
  const KEY_PREMIO = 'nebula-premio-versao';
  const versaoPremiada = Number(localStorage.getItem(KEY_PREMIO) || 0);
  const jaPegou = versaoPremiada >= nova;

  const aviso = document.createElement('div');
  aviso.id = 'aviso-atualizacao';

  if (jaPegou) {
    aviso.textContent = BIB_CONFIG.avisoTextoJaPego;
    aviso.onclick = () => { localStorage.setItem(key, nova); location.reload(); };
  } else {
    aviso.textContent = BIB_CONFIG.avisoTexto.replace('{m}', BIB_CONFIG.moedasAtualizacao);
    aviso.onclick = () => {
      ganharMoedas(BIB_CONFIG.moedasAtualizacao);
      localStorage.setItem(KEY_PREMIO, nova);
      localStorage.setItem(key, nova);
      aviso.textContent = `🎉 +${BIB_CONFIG.moedasAtualizacao} moedas!`;
      aviso.style.background = '#b8dfd0';
      aviso.style.color = '#2e6b52';
      setTimeout(() => location.reload(), 1000);
    };
  }
  document.body.appendChild(aviso);
}
