/* ============ DANÇA ============ */
const STY = {
  festa:      ['🪩', 'hop .35s', 'top:-50%;left:50%;transform:translateX(-50%)', 'Festa! 🪩'],
  fofa:       ['🎀', 'sway 1.3s', 'top:-42%;right:6%', 'Dancinha fofa 🥰'],
  estrela:    ['🕶️', 'posea 1.8s', 'top:-2%;left:50%;transform:translateX(-50%);font-size:calc(var(--ew)*2)', 'Show! 😎'],
  chocalho:   ['🪇', 'shk .25s', 'top:25%;left:104%', 'Chocalho! 🎶'],
  maluquinha: ['🎉', 'crz 1.4s', 'top:-50%;left:50%;transform:translateX(-50%)', 'Maluquinha! 🤪'],
  calminha:   ['🌙', 'flt 3s', 'top:-45%;left:-4%', 'Calminha... 🌙']
};
const DW = {
  carinhosa:     { fofa: 5, calminha: 2 },
  tranquila:     { calminha: 6, fofa: 2 },
  brincalhona:   { maluquinha: 5, chocalho: 5, festa: 2 },
  temperamental: { estrela: 4, festa: 3 },
  reservada:     { calminha: 3, fofa: 2 }
};

function pickStyle() {
  const w = Object.assign({ festa: 1, fofa: 1, estrela: 1, chocalho: 1, maluquinha: 1, calminha: 1 }, DW[S.pers] || {});
  let pool = [];
  for (const k in w) for (let i = 0; i < w[k]; i++) pool.push(k);
  if (S.pers === 'curiosa') pool = pool.filter(k => k !== S.lastDance);
  const k = rnd(pool);
  S.lastDance = k;
  return k;
}

let dancing = 0;
function startDance(sec = 10) {
  if (dancing || gOn) return;
  dancing = 1;
  const k = pickStyle();
  const st = STY[k];
  const first = S.pers === 'reservada' ? STY.calminha : st;

  const apply = x => {
    eyes.style.transform = '';
    eyes.style.animation = x[1] + ' ease-in-out infinite';
    acc.textContent = x[0];
    acc.style.cssText = 'display:block;position:absolute;pointer-events:none;font-size:calc(var(--ew)*.55);font-style:normal;' + x[2];
  };

  set('dance', sec * 1000, st[3]);
  vib(Array(sec).fill(60).flatMap(v => [v, 140]));
  apply(first);
  if (first !== st) setTimeout(() => apply(st), 4000);

  setTimeout(() => {
    eyes.style.animation = '';
    acc.style.display = 'none';
    dancing = 0;
    S.humor = clamp(S.humor + 3);
    if (S.pers === 'temperamental') set('angry', 1500, 'Ta-dá! 😤');
    save();
  }, sec * 1000);
}

function joyTick() {
  if (S.humor >= 99 && mood === 'neutral' && !gOn && Math.random() < .01) startDance(5);
}
