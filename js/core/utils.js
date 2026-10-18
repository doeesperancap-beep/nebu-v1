/* ============ 1. UTILIDADES ============ */
const $ = id => document.getElementById(id);
const body = document.body;
const eyes = $('eyes');
const eyeEls = [...document.querySelectorAll('.eye')];
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const vib = p => { try { navigator.vibrate?.(p); } catch {} };
const P = $('panel');
