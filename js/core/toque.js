/* ============ 6. TOQUE ============ */
const ptrs = new Map();
let sx = null, sy = null, moved = 0, petD = 0, rev = 0, lastDx = 0;
let lastX = 0, lastY = 0, pinch0 = 0, multi = 0, pinched = 0, tMulti = 0;
let hold, taps = [], lastAct = Date.now(), stage = 0, tickleCool = 0;

const dist = () => {
  const p = [...ptrs.values()];
  return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
};
const act = () => { lastAct = Date.now(); stage = 0; };

function pet(m, t) {
  if (mood !== m) set(m, 1300, t);
  else {
    until = Date.now() + 1300;
    clearTimeout(mt);
    mt = setTimeout(() => set(baseMood(), 0), 1300);
  }
}

addEventListener('pointerdown', e => {
  act();
  if (gOn) return;
  if (!permAsked) { permAsked = 1; askPerm().then(startSensors); }
  if (e.target.closest('button,#estado,#panel')) return;

  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) {
    sx = lastX = e.clientX;
    sy = lastY = e.clientY;
    moved = 0; petD = 0; rev = 0; multi = 0; pinched = 0;
    hold = setTimeout(() => {
      if (!moved) {
        const dx = (sx < innerWidth / 2 ? 1 : -1) * 40;
        eyes.style.transform = `translate(${dx}px, 0)`;
        set('scared', 1800, 'Me solta! 😖');
      }
    }, 700);
  } else {
    clearTimeout(hold);
    multi = 1; tMulti = Date.now(); pinch0 = dist();
  }
});

addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return;
  act();
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (ptrs.size === 2) {
    const d = dist();
    if (Math.abs(d - pinch0) > 40) {
      pinched = 1;
      set('scared', 1800, 'Ai! 😨');
      pinch0 = d;
    }
    return;
  }
  if (sx == null || multi) return;

  if (Math.hypot(e.clientX - sx, e.clientY - sy) > 12) {
    moved = 1;
    clearTimeout(hold);
    look(e.clientX, e.clientY);
  }

  if (moved) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    petD += Math.hypot(dx, dy);
    if (dx * lastDx < 0 && Math.abs(dx) > 3) rev++;
    if (Math.abs(dx) > 3) lastDx = dx;
    lastX = e.clientX; lastY = e.clientY;

    if (rev >= 10 && Date.now() > tickleCool) {
      rev = 0; wig();
      tickleCool = Date.now() + 2500;
      pet('tickle', 'Hahaha, cócegas! 🤣');
      S.humor = clamp(S.humor + 4);
      SOM.melodia([N.DO, N.MI, N.SOL], 0.06, 'sine', 0.08);
    } else if (petD > 700 * pm('thr') && rev < 3 && Date.now() > tickleCool) {
      pet('carinho', 'Ronrom... 😍');
      heart(e.clientX, e.clientY);
    } else if (petD > 120 * thrPet() && rev < 3 && Date.now() > tickleCool) {
      SOM.melodia([N.DO, N.MI, N.SOL], 0.08, 'sine', 0.08);
      pet('happy', '');
      heart(e.clientX, e.clientY);
      S.bond = (S.bond || 0) + 1;
      S.humor = clamp(S.humor + 5 * pm('pet'));
    }
  }
});

function up(e) {
  clearTimeout(hold);
  if (!ptrs.has(e.pointerId)) return;
  ptrs.delete(e.pointerId);

  if (multi) {
    if (ptrs.size === 0) {
      if (!pinched && Date.now() - tMulti < 450) {
        set('sleepy', 4000, 'Zzz... 😴');
        S.energia = clamp(S.energia + 8);
      }
      multi = 0; sx = null; resetLook();
    }
    return;
  }

  if (sx == null) return;
  const was = moved;
  sx = null; resetLook();
  if (was) return;

  const t = Date.now();
  taps = taps.filter(x => t - x < 1100);
  taps.push(t);
  const n = taps.length;

  if (n >= (S.pers === 'temperamental' ? 2 : 3)) {
    set('angry', 2500, 'Para! 😠');
    S.humor = clamp(S.humor - 3 * pm('irr'));
    taps = []; return;
  }
  if (n === 2) { set('curious', 2200, '?'); return; }
  set('happy', 1600, '');
}

addEventListener('pointerup', up);
addEventListener('pointercancel', up);
