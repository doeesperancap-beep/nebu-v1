let dbFirebase = null;
let salaRef = null;

function iniciarFirebase() {
  if (dbFirebase) return dbFirebase;
  if (typeof firebase === 'undefined') return null;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    dbFirebase = firebase.firestore();
    salaRef = dbFirebase.collection('sala').doc('principal');
    console.log('🔥 Firebase conectado!');
    return dbFirebase;
  } catch (e) {
    console.error('❌ Erro Firebase:', e);
    return null;
  }
}

async function salvarNoFirebase() {
  const db = iniciarFirebase();
  if (!db || !S.id) return;
  try {
    await db.collection('nebulas').doc(S.id).set({
      id: S.id, nome: S.nome || 'Nebo', humor: S.humor, fome: S.fome,
      energia: S.energia, saude: S.saude, moedas: S.moedas || 0,
      pers: S.pers, conectado: S.conectado || false, atualizadoEm: Date.now()
    });
  } catch (e) { console.error('Erro ao salvar:', e); }
}

async function lerNebulas() {
  const db = iniciarFirebase();
  if (!db) return [];
  try {
    const snapshot = await db.collection('nebulas').get();
    const lista = [];
    snapshot.forEach(doc => {
      const dados = doc.data();
      if (dados.id !== S.id) lista.push(dados);
    });
    return lista;
  } catch (e) { return []; }
}

async function sairDoFirebase() {
  const db = iniciarFirebase();
  if (!db || !S.id) return;
  try { await db.collection('nebulas').doc(S.id).delete(); } catch (e) {}
}

setInterval(() => { if (S.id && S.modo === 'nebo') salvarNoFirebase(); }, 30000);

async function lerRecordeDino() {
  const db = iniciarFirebase();
  if (!db) return null;
  try {
    const doc = await db.collection('recordes').doc('dino').get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (e) { return null; }
}

async function salvarRecordeDino(pontos, nomeNebo, idNebo) {
  const db = iniciarFirebase();
  if (!db) return;
  try {
    const doc = await db.collection('recordes').doc('dino').get();
    const atual = doc.exists ? doc.data() : null;
    if (atual && atual.pontos >= pontos) return;
    await db.collection('recordes').doc('dino').set({
      pontos, nome: nomeNebo || 'Nebo', id: idNebo || 'sem-id', atualizadoEm: Date.now()
    });
  } catch (e) {}
}
