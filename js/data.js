/* ============================================================
   data.js — catálogos e configurações (só dados, sem lógica)
   ============================================================ */

/* ---------- Sabonetes ---------- */
const SABONETES = {
  lavanda:  { nome: 'Lavanda',  emoji: '💜', cor: 'rgba(200, 180, 240, .85)', fala: 'Aaah, que cheirinho de lavanda... 😌' },
  limao:    { nome: 'Limão',    emoji: '🍋', cor: 'rgba(255, 240, 150, .85)', fala: 'Uia, azedinho! Me acordou! 🍋' },
  baunilha: { nome: 'Baunilha', emoji: '🤍', cor: 'rgba(255, 245, 230, .9)',  fala: 'Que cheirinho doce... 🥰' },
  morango:  { nome: 'Morango',  emoji: '🍓', cor: 'rgba(255, 200, 220, .85)', fala: 'Cheirinho de morango! 💗' }
};

/* ---------- Personalidade ---------- */
const PM = {
  carinhosa:     { pet: 1.6, thr: .6 },
  curiosa:       { bored: .6 },
  tranquila:     { decay: .7, bored: 1.6 },
  brincalhona:   { play: 1.5, bored: .7 },
  temperamental: { irr: 2 },
  reservada:     { pet: .6 }
};

const PERS = [
  '🥰 carinhosa', '🧐 curiosa', '😴 tranquila',
  '😂 brincalhona', '😤 temperamental', '😶 reservada'
];

/* ---------- Comidas ---------- */
const FOODS = ['🍎', '🍓', '🥒', '🍌'];

const CATALOGO = {
  // 🥗 SAUDÁVEIS
  '🍎': { nome: 'Maçã',       tipo: 'saudavel', preco: 3,  humor: 2, saude: 2 },
  '🍓': { nome: 'Morango',    tipo: 'saudavel', preco: 5,  humor: 3, saude: 2 },
  '🥭': { nome: 'Manga',      tipo: 'saudavel', preco: 6,  humor: 3, saude: 2 },
  '🍉': { nome: 'Melancia',   tipo: 'saudavel', preco: 7,  humor: 4, saude: 2 },
  '🍒': { nome: 'Cereja',     tipo: 'saudavel', preco: 8,  humor: 4, saude: 2 },
  '🫐': { nome: 'Blueberry',  tipo: 'saudavel', preco: 8,  humor: 4, saude: 3 },
  '🍇': { nome: 'Uva',        tipo: 'saudavel', preco: 6,  humor: 3, saude: 2 },
  '🥒': { nome: 'Pepino',     tipo: 'saudavel', preco: 4,  humor: 1, saude: 3 },
  '🥗': { nome: 'Salada',     tipo: 'saudavel', preco: 6,  humor: 2, saude: 4 },
  '🍣': { nome: 'Sushi',      tipo: 'saudavel', preco: 12, humor: 6, saude: 3 },
  '🍵': { nome: 'Chá',        tipo: 'saudavel', preco: 4,  humor: 2, saude: 3 },

  // 🍔 INDUSTRIAIS
  '🍞': { nome: 'Pão',             tipo: 'industrial', preco: 4,  humor: 2, saude: -1 },
  '🍕': { nome: 'Pizza',           tipo: 'industrial', preco: 18, humor: 7, saude: -2 },
  '🍔': { nome: 'Hambúrguer',      tipo: 'industrial', preco: 18, humor: 8, saude: -2 },
  '🧇': { nome: 'Waffle',          tipo: 'industrial', preco: 15, humor: 6, saude: -2 },
  '🥞': { nome: 'Panqueca',        tipo: 'industrial', preco: 14, humor: 6, saude: -2 },
  '🍟': { nome: 'Batata frita',    tipo: 'industrial', preco: 12, humor: 6, saude: -2 },
  '🌭': { nome: 'Cachorro-quente', tipo: 'industrial', preco: 14, humor: 7, saude: -2 },
  '🌮': { nome: 'Taco',            tipo: 'industrial', preco: 15, humor: 7, saude: -2 },
  '🧋': { nome: 'Bubble tea',      tipo: 'industrial', preco: 16, humor: 8, saude: -1 },
  '🍲': { nome: 'Sopa',            tipo: 'industrial', preco: 10, humor: 4, saude: 1 },

  // 🍰 DOCES
  '🍬': { nome: 'Bala',       tipo: 'doce', preco: 3,  humor: 3, saude: -1 },
  '🍭': { nome: 'Pirulito',   tipo: 'doce', preco: 5,  humor: 4, saude: -1 },
  '🍪': { nome: 'Cookie',     tipo: 'doce', preco: 8,  humor: 5, saude: -2 },
  '🍫': { nome: 'Chocolate',  tipo: 'doce', preco: 10, humor: 6, saude: -2 },
  '🧊': { nome: 'Raspadinha', tipo: 'doce', preco: 10, humor: 6, saude: -1 },
  '🍰': { nome: 'Bolo',       tipo: 'doce', preco: 12, humor: 7, saude: -3 },
  '🍦': { nome: 'Sorvete',    tipo: 'doce', preco: 12, humor: 7, saude: -2 },
  '🍩': { nome: 'Donut',      tipo: 'doce', preco: 15, humor: 8, saude: -3 },
  '🧁': { nome: 'Cupcake',    tipo: 'doce', preco: 15, humor: 8, saude: -3 },
  '🍮': { nome: 'Pudim',      tipo: 'doce', preco: 18, humor: 9, saude: -2 }
};

/* ---------- Ingredientes ---------- */
const INGREDIENTES = {
  ing_leite:     { emoji: '🥛', nome: 'Leite',            preco: 4,  tipo: 'ingrediente' },
  ing_ovo:       { emoji: '🥚', nome: 'Ovo',              preco: 2,  tipo: 'ingrediente' },
  ing_farinha:   { emoji: '🌾', nome: 'Farinha de trigo', preco: 3,  tipo: 'ingrediente' },
  ing_acucar:    { emoji: '🍬', nome: 'Açúcar',           preco: 3,  tipo: 'ingrediente' },
  ing_manteiga:  { emoji: '🧈', nome: 'Manteiga',         preco: 5,  tipo: 'ingrediente' },
  ing_creme:     { emoji: '🍶', nome: 'Creme de leite',   preco: 6,  tipo: 'ingrediente' },
  ing_chocolate: { emoji: '🍫', nome: 'Chocolate',        preco: 6,  tipo: 'ingrediente' },
  ing_cafe:      { emoji: '☕', nome: 'Café',             preco: 4,  tipo: 'ingrediente' },
  ing_limao:     { emoji: '🍋', nome: 'Limão',            preco: 3,  tipo: 'ingrediente' },
  ing_fruta:     { emoji: '🍓', nome: 'Fruta',            preco: 4,  tipo: 'ingrediente' },

  // ✨ Mágicos
  ing_mirtilo:   { emoji: '🫐', nome: 'Mirtilos Nebulosos',  preco: 10, tipo: 'ingrediente' },
  ing_maca:      { emoji: '🍎', nome: 'Maçãs-aladas',        preco: 10, tipo: 'ingrediente' },
  ing_amendoim:  { emoji: '🥜', nome: 'Amendoim-unicórnio',  preco: 8,  tipo: 'ingrediente' },
  ing_abobora:   { emoji: '🎃', nome: 'Abóbora Diabrotic',   preco: 12, tipo: 'ingrediente' }
};

/* ---------- Receitas ---------- */
const RECEITAS = {
  pudim: {
    nome: 'Pudim', emoji: '🍮',
    ingredientes: { ing_leite: 2, ing_ovo: 3, ing_acucar: 4 },
    humor: 8, tempo: 4000,
    passos: [
      { texto: 'Quebre os ovos com cuidado',            acao: '🥚' },
      { texto: 'Bata com o açúcar até virar um creme',  acao: '🥄' },
      { texto: 'Aqueça o leite devagar',                acao: '🔥' },
      { texto: 'Misture tudo com carinho',              acao: '💗' },
      { texto: 'Coloque na forma',                      acao: '🍮' },
      { texto: 'Leve ao forno!',                        acao: '🔥' }
    ]
  },
  bolo: {
    nome: 'Bolo', emoji: '🎂',
    ingredientes: { ing_farinha: 2, ing_ovo: 2, ing_leite: 2, ing_acucar: 2, ing_manteiga: 1 },
    humor: 9, tempo: 6000,
    passos: [
      { texto: 'Misture os ovos, açúcar e manteiga', acao: '🥣' },
      { texto: 'Acrescente a farinha',               acao: '🌾' },
      { texto: 'Adicione o leite aos poucos',        acao: '🥛' },
      { texto: 'Bata até formar uma massa lisa',     acao: '🥄' },
      { texto: 'Coloque na forma',                   acao: '🍰' },
      { texto: 'Leve ao forno!',                     acao: '🔥' }
    ]
  },
  biscoito: {
    nome: 'Biscoito', emoji: '🍪',
    ingredientes: { ing_farinha: 2, ing_acucar: 1, ing_ovo: 1, ing_manteiga: 1 },
    humor: 6, tempo: 3000,
    passos: [
      { texto: 'Misture a manteiga e o açúcar', acao: '🧈' },
      { texto: 'Acrescente o ovo',              acao: '🥚' },
      { texto: 'Adicione a farinha',            acao: '🌾' },
      { texto: 'Faça pequenos biscoitos',       acao: '🍪' },
      { texto: 'Coloque na forma',              acao: '🍪' },
      { texto: 'Leve ao forno!',                acao: '🔥' }
    ]
  },
  panqueca: {
    nome: 'Panqueca', emoji: '🥞',
    ingredientes: { ing_farinha: 2, ing_ovo: 1, ing_leite: 2, ing_acucar: 1, ing_manteiga: 1 },
    humor: 7, tempo: 4000,
    passos: [
      { texto: 'Misture a farinha, ovo e leite',   acao: '🥣' },
      { texto: 'Bata até formar uma massa lisa',   acao: '🥄' },
      { texto: 'Aqueça a frigideira com manteiga', acao: '🔥' },
      { texto: 'Coloque a massa na frigideira',    acao: '🥞' },
      { texto: 'Vire quando estiver dourada',      acao: '🥞' },
      { texto: 'Retire e sirva',                   acao: '🍽️' }
    ]
  },
  cappuccino: {
    nome: 'Cappuccino', emoji: '☕',
    ingredientes: { ing_leite: 2, ing_cafe: 1, ing_acucar: 1 },
    humor: 6, tempo: 3000,
    passos: [
      { texto: 'Prepare o café',                 acao: '☕' },
      { texto: 'Aqueça o leite',                 acao: '🔥' },
      { texto: 'Misture o café, leite e açúcar', acao: '🥄' },
      { texto: 'Bata até formar uma espuma',     acao: '🥛' },
      { texto: 'Coloque na xícara e sirva',      acao: '☕' }
    ]
  },
  sorvete: {
    nome: 'Sorvete', emoji: '🍦',
    ingredientes: { ing_leite: 2, ing_creme: 1, ing_acucar: 2, ing_fruta: 2 },
    humor: 8, tempo: 6000,
    passos: [
      { texto: 'Misture o leite e o creme de leite', acao: '🥛' },
      { texto: 'Acrescente o açúcar',                acao: '🍬' },
      { texto: 'Adicione a fruta escolhida',         acao: '🍓' },
      { texto: 'Bata tudo até ficar cremoso',        acao: '🥄' },
      { texto: 'Coloque em um recipiente',           acao: '🥣' },
      { texto: 'Leve ao congelador',                 acao: '❄️' },
      { texto: 'Espere ficar bem gelado',            acao: '🧊' }
    ]
  },
  milkshake: {
    nome: 'Milkshake', emoji: '🥤',
    ingredientes: { ing_leite: 2, ing_creme: 1, ing_fruta: 2, ing_acucar: 1 },
    humor: 7, tempo: 3000,
    passos: [
      { texto: 'Coloque o leite no liquidificador', acao: '🥛' },
      { texto: 'Acrescente o creme de leite',       acao: '🍶' },
      { texto: 'Adicione a fruta escolhida',        acao: '🍓' },
      { texto: 'Junte o açúcar',                    acao: '🍬' },
      { texto: 'Bata até ficar cremoso',            acao: '🥄' },
      { texto: 'Coloque no copo e sirva',           acao: '🥤' }
    ]
  },
  torta_mirtilo: {
    nome: 'Torta de Mirtilos Nebulosos', emoji: '🫐',
    ingredientes: { ing_farinha: 3, ing_manteiga: 1, ing_acucar: 2, ing_mirtilo: 2, ing_creme: 1, ing_limao: 1 },
    humor: 10, tempo: 7000,
    passos: [
      { texto: 'Misture a farinha e o açúcar',             acao: '🌾' },
      { texto: 'Acrescente a manteiga e o creme de leite', acao: '🧈' },
      { texto: 'Amasse até formar uma massa',              acao: '🥣' },
      { texto: 'Prepare os Mirtilos Nebulosos com limão',  acao: '🫐' },
      { texto: 'Coloque o recheio sobre a massa',          acao: '🫐' },
      { texto: 'Leve ao forno!',                           acao: '🔥' },
      { texto: 'Espere esfriar antes de servir',           acao: '❄️' }
    ]
  },
  torta_maca: {
    nome: 'Torta de Maçã-alada Caramelizada', emoji: '🍎',
    ingredientes: { ing_farinha: 3, ing_manteiga: 2, ing_acucar: 3, ing_maca: 2, ing_creme: 1, ing_limao: 1 },
    humor: 10, tempo: 7000,
    passos: [
      { texto: 'Misture a farinha e o açúcar',             acao: '🌾' },
      { texto: 'Acrescente a manteiga e o creme de leite', acao: '🧈' },
      { texto: 'Amasse até formar uma massa',              acao: '🥣' },
      { texto: 'Corte as Maçãs-aladas em fatias',          acao: '🍎' },
      { texto: 'Caramelize as maçãs com açúcar e limão',   acao: '🍯' },
      { texto: 'Coloque sobre a massa',                    acao: '🍎' },
      { texto: 'Leve ao forno!',                           acao: '🔥' },
      { texto: 'Espere esfriar antes de servir',           acao: '❄️' }
    ]
  },
  torta_abobora: {
    nome: 'Torta de Abóbora da Família Diabrotic', emoji: '🎃',
    ingredientes: { ing_farinha: 3, ing_manteiga: 2, ing_acucar: 2, ing_abobora: 2, ing_ovo: 1, ing_creme: 1 },
    humor: 10, tempo: 8000,
    passos: [
      { texto: 'Misture a farinha, manteiga e açúcar',  acao: '🌾' },
      { texto: 'Amasse até formar uma massa',           acao: '🥣' },
      { texto: 'Coloque a massa na forma',              acao: '🎃' },
      { texto: 'Amasse a Abóbora Diabrotic cozida',     acao: '🎃' },
      { texto: 'Misture com o ovo e o creme de leite',  acao: '🥚' },
      { texto: 'Coloque o recheio sobre a massa',       acao: '🎃' },
      { texto: 'Leve ao forno!',                        acao: '🔥' },
      { texto: 'Espere esfriar antes de servir',        acao: '❄️' }
    ]
  },
  pacoca: {
    nome: 'Paçoca Floral', emoji: '🌸',
    ingredientes: { ing_amendoim: 2, ing_acucar: 1, ing_manteiga: 1 },
    humor: 8, tempo: 3000,
    passos: [
      { texto: 'Bata o Amendoim-unicórnio com o açúcar', acao: '🥜' },
      { texto: 'Coloque a mistura em uma vasilha',       acao: '🥣' },
      { texto: 'Amasse até o óleo do amendoim sair',     acao: '🥜' },
      { texto: 'Coloque em uma forma untada',            acao: '🧈' },
      { texto: 'Aperte bem a massa',                     acao: '🥜' },
      { texto: 'Leve à geladeira',                       acao: '❄️' },
      { texto: 'Corte no formato de flor',               acao: '🌸' }
    ]
  }
};

/* ---------- Biblioteca ---------- */
const BIB_CONFIG = {
  cooldownMin: 30,
  chanceGostar: 50,
  humorGostou: 8,
  humorNaoGostou: -4,
  moedasGostou: 5,

  falaGostou: [
    'Que livro bom! 📖💗', 'Adorei essa história! ✨', 'Não conseguia parar de ler! 🥰',
    'Que final maravilhoso! 😍', 'Vou recomendar pra todo mundo! 💫'
  ],
  falaNaoGostou: [
    'Hmm... não curti muito 😕', 'Achei meio chato... 😴', 'Não entendi nada 🤔',
    'Esperava mais... 😑', 'Que tédio 😒'
  ],
  falaJaLeuGostou: [
    'Esse eu já li e amei! 💗', 'Ah, esse é meu favorito! 📖✨', 'Já li de novo, continua incrível! 🥰'
  ],
  falaJaLeuNaoGostou: [
    'Já li esse... não gostei 😕', 'Ah, esse de novo? Não curto 😑', 'Já sei que não gosto desse 😒'
  ],
  falaAindaNao: [
    'Já li faz pouco tempo... ⏳', 'Calma, deixa eu digerir a história 😌', 'Daqui a pouco eu leio de novo 📚'
  ],

  moedasAtualizacao: 120,
  avisoTexto: '✨ Nébula atualizada! Toque para ganhar {m} 🪙',
  avisoTextoJaPego: '✨ Nébula atualizada! Toque para recarregar'
};

const LIVROS = {
  divinos_rivais:      { nome: 'Divinos Rivais', autor: 'Rebecca Ross', preco: 35, cor: '#1a2456', cor2: '#d4af37', raridade: 'comum' },
  promessas_crueis:    { nome: 'Promessas Cruéis', autor: 'Rebecca Ross', preco: 38, cor: '#0d0d0d', cor2: '#c1272d', raridade: 'comum' },
  era_uma_vez:         { nome: 'Era Uma Vez um Coração Partido', autor: 'Stephanie Garber', preco: 35, cor: '#141414', cor2: '#d4af37', raridade: 'comum' },
  principe_cruel:      { nome: 'O Príncipe Cruel', autor: 'Holly Black', preco: 38, cor: '#f5f0e0', cor2: '#c9a227', raridade: 'comum' },
  assistente_vilao:    { nome: 'Assistente do Vilão', autor: 'Hannah Nicole Maehrer', preco: 36, cor: '#3d1e5c', cor2: '#b8860b', raridade: 'comum' },
  jogos_heranca:       { nome: 'Jogos de Herança', autor: 'Jennifer Lynn Barnes', preco: 38, cor: '#1a1a1a', cor2: '#d4af37', raridade: 'comum' },
  nao_e_filmes:        { nome: 'Não É Como nos Filmes', autor: 'Lynn Painter', preco: 32, cor: '#f5b8c8', cor2: '#e895ab', raridade: 'comum' },
  mil_vezes_amor:      { nome: 'Mil Vezes Amor', autor: 'Taylor Jenkins Reid', preco: 30, cor: '#a8c8e0', cor2: '#f5b8c8', raridade: 'comum' },
  orgulho_preconceito: { nome: 'Orgulho e Preconceito', autor: 'Jane Austen', preco: 28, cor: '#4a2c1a', cor2: '#c9a227', raridade: 'comum' },
  iracema:             { nome: 'Iracema', autor: 'José de Alencar', preco: 25, cor: '#8b1a1a', cor2: '#2d5016', raridade: 'comum' },
  morro_ventos:        { nome: 'O Morro dos Ventos Uivantes', autor: 'Emily Brontë', preco: 30, cor: '#2a2a2a', cor2: '#8b8b8b', raridade: 'comum' },
  hp_pedra:            { nome: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', preco: 30, cor: '#6a3d8a', cor2: '#d4af37', raridade: 'comum' },
  hp_azkaban:          { nome: 'Harry Potter e o Prisioneiro de Azkaban', autor: 'J.K. Rowling', preco: 35, cor: '#1e3a5f', cor2: '#d4af37', raridade: 'comum' },
  hp_calice:           { nome: 'Harry Potter e o Cálice de Fogo', autor: 'J.K. Rowling', preco: 40, cor: '#1a2456', cor2: '#e87a2a', raridade: 'comum' },
  pj_ladrao:           { nome: 'Percy Jackson e o Ladrão de Raios', autor: 'Rick Riordan', preco: 30, cor: '#1e5a8a', cor2: '#d4af37', raridade: 'comum' },
  pj_mar:              { nome: 'Percy Jackson e o Mar de Monstros', autor: 'Rick Riordan', preco: 35, cor: '#2d7a7a', cor2: '#d4af37', raridade: 'comum' },
  pj_tita:             { nome: 'Percy Jackson e a Maldição do Titã', autor: 'Rick Riordan', preco: 35, cor: '#2d5016', cor2: '#d4af37', raridade: 'comum' },
  odpd_1:              { nome: 'O Diário de uma Princesa Desastrada', autor: 'Maidy Lacerda', preco: 35, cor: '#f5b8d0', cor2: '#d4708a', raridade: 'comum' },
  odpd_2:              { nome: 'O Diário de uma Princesa Desastrada 2', autor: 'Maidy Lacerda', preco: 35, cor: '#f0a0c0', cor2: '#c85a7a', raridade: 'comum' },
  odpd_3:              { nome: 'O Diário de uma Princesa Desastrada 3', autor: 'Maidy Lacerda', preco: 38, cor: '#e888b0', cor2: '#b84060', raridade: 'comum' },
  odpd_4:              { nome: 'O Diário de uma Princesa Desastrada 4', autor: 'Maidy Lacerda', preco: 40, cor: '#e070a0', cor2: '#a83050', raridade: 'comum' },
  scorpio_1:           { nome: 'O Caderno de Maldades do Scorpio', autor: 'Maidy Lacerda', preco: 38, cor: '#3d1e5c', cor2: '#d4af37', raridade: 'comum' },
  scorpio_2:           { nome: 'O Caderno de Maldades do Scorpio 2', autor: 'Maidy Lacerda', preco: 40, cor: '#2a0d3d', cor2: '#d4af37', raridade: 'comum' }
};

/* ---------- Boutique ---------- */
const BOUTIQUE = {
  cabeca: {
    '🌸': { nome: 'Flor', preco: 10 },
    '🌺': { nome: 'Hibisco', preco: 12 },
    '❄️': { nome: 'Floco de neve', preco: 10 },
    '🎀': { nome: 'Laço', preco: 8 },
    '👒': { nome: 'Chapéu', preco: 20 },
    '🧙': { nome: 'Chapéu de bruxa', preco: 25 },
    '🎃': { nome: 'Abóbora', preco: 15 },
    '👻': { nome: 'Fantasma', preco: 15 },
    '🦇': { nome: 'Morcego', preco: 15 },
    '🎉': { nome: 'Chapéu de festa', preco: 20 },
    '🎈': { nome: 'Balão', preco: 15 },
    '🎁': { nome: 'Presente', preco: 18 }
  },
  oculos: {
    '🕶️': { nome: 'Óculos de sol', preco: 25 },
    '👓': { nome: 'Óculos de grau', preco: 20 },
    '🥽': { nome: 'Óculos de natação', preco: 22 }
  },
  olhos: {
    '🍑': { nome: 'Pêssego rosado', preco: 30, cor: '#F4A99B' },
    '💜': { nome: 'Azul-lavanda',   preco: 30, cor: '#919CCB' },
    '🌊': { nome: 'Turquesa',       preco: 30, cor: '#70BEC6' },
    '🥛': { nome: 'Creme',          preco: 30, cor: '#E8E0C3' },
    '🌿': { nome: 'Verde-menta',    preco: 30, cor: '#93CBB7' }
  },
  fundo: {
    '🌌': { nome: 'Galáxia',           preco: 80, cor: '#1a0d2e' },
    '🌠': { nome: 'Nebulosa de Órion', preco: 80, cor: '#2a0a1a' },
    '🌉': { nome: 'Via Láctea',        preco: 80, cor: '#0a0a2e' }
  }
};

/* ---------- Dança ---------- */
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

/* ---------- Cidade ---------- */
const CIDADE_PREDIOS = {
  jogos:        { x: 7,  y: 15, w: 20, h: 30, nome: '🎮 Jogos Central', fala: 'Hora de brincar! 🎮' },
  biblioteca:   { x: 29, y: 15, w: 20, h: 30, nome: '📚 Biblioteca',    fala: 'Vou ler um livro! 📚' },
  boutique:     { x: 50, y: 15, w: 20, h: 30, nome: '👗 Boutique',      fala: 'Roupinhas! 👗' },
  mercado:      { x: 72, y: 15, w: 22, h: 30, nome: '🛒 Mercado',       fala: 'Vou comprar frutinhas! 🍎' },
  borboletas:   { x: 13, y: 55, w: 20, h: 18, nome: '🦋 Espaço Borboletas', fala: 'Borboletas! 🦋' },
  parque:       { x: 36, y: 52, w: 26, h: 20, nome: '🌳 Parque',            fala: 'Vou passear! 🌳' },
  praca:        { x: 66, y: 55, w: 22, h: 18, nome: '🌿 Área Verde',        fala: 'Que calmo aqui...' },
  clinica:      { x: 13, y: 88, w: 15, h: 11, nome: '🏥 Clínica',       fala: 'Vou me cuidar! 🏥' },
  spa:          { x: 38, y: 88, w: 15, h: 11, nome: '💆 Spa',           fala: 'Aaah, que delícia! 🥒' },
  observatorio: { x: 59, y: 88, w: 15, h: 11, nome: '🔭 Observatório',  fala: 'Ver estrelas! 🔭' }
};

const NEBO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340">
  <defs><radialGradient id="g-lavanda" gradientUnits="userSpaceOnUse" cx="200" cy="175" r="190"><stop offset="0" stop-color="#D8D2F2"/><stop offset=".55" stop-color="#D8D2F2"/><stop offset="1" stop-color="#9A8FD0"/></radialGradient></defs>
  <g fill="#5D4F9E" stroke="#5D4F9E" stroke-width="7" stroke-linejoin="round"><circle cx="150" cy="80" r="50"/><circle cx="230" cy="70" r="52"/><circle cx="300" cy="105" r="46"/><circle cx="345" cy="165" r="48"/><circle cx="335" cy="235" r="50"/><circle cx="270" cy="275" r="52"/><circle cx="190" cy="285" r="54"/><circle cx="110" cy="270" r="50"/><circle cx="65" cy="215" r="48"/><circle cx="60" cy="150" r="48"/><circle cx="95" cy="100" r="46"/><ellipse cx="200" cy="178" rx="140" ry="100"/></g>
  <g fill="url(#g-lavanda)"><circle cx="150" cy="80" r="50"/><circle cx="230" cy="70" r="52"/><circle cx="300" cy="105" r="46"/><circle cx="345" cy="165" r="48"/><circle cx="335" cy="235" r="50"/><circle cx="270" cy="275" r="52"/><circle cx="190" cy="285" r="54"/><circle cx="110" cy="270" r="50"/><circle cx="65" cy="215" r="48"/><circle cx="60" cy="150" r="48"/><circle cx="95" cy="100" r="46"/><ellipse cx="200" cy="178" rx="140" ry="100"/></g>
  <clipPath id="e1-lavanda"><ellipse cx="150" cy="190" rx="26" ry="34"/></clipPath>
  <ellipse cx="150" cy="190" rx="26" ry="34" fill="#fff" fill-opacity=".35"/>
  <g clip-path="url(#e1-lavanda)"><path d="M120 198 Q150 188 180 198 V230 H120Z" fill="#5D4F9E" fill-opacity=".38"/><path d="M120 198 Q150 188 180 198" fill="none" stroke="#5D4F9E" stroke-width="3"/><circle cx="142" cy="208" r="3.5" fill="#fff"/></g>
  <ellipse cx="150" cy="190" rx="26" ry="34" fill="none" stroke="#5D4F9E" stroke-width="3.5"/><circle cx="143" cy="173" r="2.5" fill="#fff"/><clipPath id="e2-lavanda"><ellipse cx="248" cy="180" rx="26" ry="34"/></clipPath>
  <ellipse cx="248" cy="180" rx="26" ry="34" fill="#fff" fill-opacity=".35"/>
  <g clip-path="url(#e2-lavanda)"><path d="M218 188 Q248 178 278 188 V220 H218Z" fill="#5D4F9E" fill-opacity=".38"/><path d="M218 188 Q248 178 278 188" fill="none" stroke="#5D4F9E" stroke-width="3"/><circle cx="240" cy="198" r="3.5" fill="#fff"/></g>
  <ellipse cx="248" cy="180" rx="26" ry="34" fill="none" stroke="#5D4F9E" stroke-width="3.5"/><circle cx="241" cy="163" r="2.5" fill="#fff"/>
  <ellipse cx="118" cy="230" rx="14" ry="8" fill="#F29DB5" fill-opacity=".4"/><ellipse cx="282" cy="222" rx="14" ry="8" fill="#F29DB5" fill-opacity=".4"/>
  <path d="M186 228 q7 9 14 0 q7 9 14 0" fill="none" stroke="#5D4F9E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ---------- Casa ---------- */
const CASA_CONFIG = {
  tipos: {
    single_home: {
      nome: 'Single Home',
      desc: 'Uma casinha aconchegante pra começar',
      preco: 150,
      tipo: 'pequena'
    }
  }
};
