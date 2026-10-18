/* ============================================================
   firebase.js — salvar/ler Nébulas e recorde do Dino
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBE4z14rQyaGjaV0ULkWPArLOdpQjUjAWo",
  authDomain: "nebula-city.firebaseapp.com",
  projectId: "nebula-city",
  storageBucket: "nebula-city.firebasestorage.app",
  messagingSenderId: "145504626308",
  appId: "1:145504626308:web:ac124c13d59ef3f7be44d1"
};

let dbFirebase = null;

function iniciarFirebase() {
  if (dbFirebase) return dbFirebase;
  if (typeof firebase === 'undefined') return null;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    dbFirebase = firebase.firestore();
    console.log('🔥 Firebase conectado!');
    return dbFirebase;
  } catch (e) {
    console.error('❌ Erro Firebase:', e);
    return null;
  }
}

/* ---------- Nébulas ---------- */
async function salvarNoFirebase() {
  const db = iniciarFirebase();
  if (!db || !S.id) return;
  try {
    await db.collection('nebulas').doc(S.id).set({
      id: S.id,
      nome: String(S.nome || 'Nebo').slice(0, 12),
      humor: Math.round(S.humor),
      fome: Math.round(S.fome),
      energia: Math.round(S.energia),
      saude: Math.round(S.saude),
      moedas: S.moedas || 0,
      pers: S.pers || null,
      conectado: !!S.conectado,
      atualizadoEm: Date.now()
    });
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

async function lerNebulas() {
  const db = iniciarFirebase();
  if (!db) return [];
  try {
    const snapshot = await db.collection('nebulas').get();
    const lista = [];
    snapshot.forEach(doc => {
      const dados = doc.data();
      if (dados.id !== S.id) lista.push(dados);   // não mostra a si mesma
    });
    return lista;
  } catch (e) {
    console.error('Erro ao ler:', e);
    return [];
  }
}

async function sairDoFirebase() {
  const db = iniciarFirebase();
  if (!db || !S.id) return;
  try {
    await db.collection('nebulas').doc(S.id).delete();
  } catch (e) {
    console.error('Erro ao sair:', e);
  }
}

/* Salva sozinha a cada 30s */
setInterval(() => {
  if (S.id && S.modo === 'nebo') salvarNoFirebase();
}, 30000);

/* ---------- Recorde global do Dino ---------- */
async function lerRecordeDino() {
  const db = iniciarFirebase();
  if (!db) return null;
  try {
    const doc = await db.collection('recordes').doc('dino').get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error('Erro ao ler recorde:', e);
    return null;
  }
}

async function salvarRecordeDino(pontos, nomeNebo, idNebo) {
  const db = iniciarFirebase();
  if (!db) return;
  try {
    const doc = await db.collection('recordes').doc('dino').get();
    const atual = doc.exists ? doc.data() : null;
    if (atual && atual.pontos >= pontos) return;   // só sobrescreve se for maior

    await db.collection('recordes').doc('dino').set({
      pontos: pontos,
      nome: String(nomeNebo || 'Nebo').slice(0, 12),
      id: idNebo || 'sem-id',
      atualizadoEm: Date.now()
    });
  } catch (e) {
    console.error('Erro ao salvar recorde:', e);
  }
}
