/* ============ 5. SENSORES ============ */
let gotO = 0, gotM = 0, batOK = 0, permAsked = 0;

async function askPerm() {
  if (permAsked) return;
  permAsked = 1;
  try {
    for (const C of [window.DeviceMotionEvent, window.DeviceOrientationEvent])
      if (C?.requestPermission) await C.requestPermission();
  } catch {}
}

function startSensors() {
  addEventListener('deviceorientation', onOri);
  addEventListener('devicemotion', onMot);
  startBattery();
}

let lastG = null, lastD = 0, sw = 0, swT = 0, swCool = 0, cool = 0;

function onOri(e) {
  if (e.beta == null) return;
  gotO = 1;
  const t = Date.now();

  if (t - swT > 5000) { swT = t; sw = 0; }
  if (lastG != null) {
    const d = (e.gamma || 0) - lastG;
    if (Math.abs(d) > 1.5 && d * lastD < 0 && Math.abs(e.gamma) < 25) sw++;
    if (Math.abs(d) > 1.5) lastD = d;
  }
  lastG = e.gamma || 0;
  if (sw >= 6 && t > swCool) {
    swCool = t + 9000; sw = 0;
    set('sleepy', 5000, 'Zzz... 😴');
    S.energia = clamp(S.energia + 6); save();
  }

  const g = clamp(e.gamma || 0, -45, 45) / 45;
  const b = clamp((e.beta || 0) - 55, -40, 40) / 40;
  if (!['scared', 'dizzy'].includes(mood))
    eyes.style.transform = `translate(${g * 30}px, ${b * 18}px)`;

  if (t < cool) return;
  if (e.beta < 15) {
    cool = t + 5000;
    set('sleepy', 3500, 'Aaaah... 🥱');
    S.energia = clamp(S.energia + 3); save();
  } else if (e.beta > 115) {
    cool = t + 4000;
    set('scared', 2500, 'Aaah, vou cair! 😨');
  }
}

/* ---------- DETECÇÃO DE MOVIMENTO ---------- */
let free = 0;
let shakes = 0, lastShake = 0;
let ultimaSacudida = 0;
let walkingPeaks = [], lastPeak = 0;
let walkingCool = 0, dizzyCool = 0;

function onMot(e) {
  const ag = e.accelerationIncludingGravity;
  const t = Date.now();

  if (ag && ag.x != null) {
    gotM = 1;
    const G = Math.hypot(ag.x, ag.y, ag.z);
    if (G < 2.5) {
      if (++free >= 4) { free = 0; set('scared', 2500, 'Aaah, tô caindo! 😱'); }
    } else free = 0;
  }

  if (ag && ag.x != null) {
    const G = Math.hypot(ag.x, ag.y, ag.z);
    const excess = Math.abs(G - 9.8);

    if (excess > 20 && t > dizzyCool) {
      if (t - lastShake > 100) {
        lastShake = t;
        shakes++;
        if (t - ultimaSacudida > 300) shakes = 0;
        ultimaSacudida = t;

        if (shakes >= 5) {
          shakes = 0;
          dizzyCool = t + 4000;
          walkingCool = t + 4000;
          walkingPeaks = [];

          SOM.melodia([N.LA, N.FA, N.RE, N.DO_BAIXO], 0.1, 'sine', 0.1);
          set('dizzy', 2500, 'Tô tonta! 😵');
          setTimeout(() => {
            if (S.humor >= 50) {
              SOM.melodia([N.DO_BAIXO, N.DO_BAIXO], 0.1, 'sawtooth', 0.1);
              set('angry', 2500, 'Para! 😠');
            } else {
              set('cry', 3000, 'Buáá... 😢');
            }
          }, 2600);
        }
      }
    }
  }

  if (ag && ag.x != null && t > walkingCool) {
    const G = Math.hypot(ag.x, ag.y, ag.z);
    if (G > 13 && G < 22) {
      const interval = t - lastPeak;
      if (interval > 250 && interval < 700) {
        lastPeak = t;
        walkingPeaks.push(t);
        walkingPeaks = walkingPeaks.filter(x => t - x < 3500);
        if (walkingPeaks.length >= 5) {
          walkingPeaks = [];
          walkingCool = t + 8000;
          wig();
          set('curious', 3000, 'Vamos passear? 🚶');
        }
      }
    }
  }
}

function startBattery() {
  if (!navigator.getBattery) return;
  navigator.getBattery().then(b => {
    batOK = 1;
    let warned = false;
    const check = () => {
      if (b.level < .2 && !b.charging && !warned) {
        warned = true; say('Estou ficando sem energia...');
      }
    };
    check();
    b.addEventListener('levelchange', check);
  }).catch(() => {});
}

addEventListener('offline', () => set('sad', 4000, 'Sem internet... 📵'));
addEventListener('online',  () => set('happy', 2500, 'Voltou a internet! 📶'));
