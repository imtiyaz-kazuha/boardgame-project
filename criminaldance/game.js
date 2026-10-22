/**
 * Dancing Criminal (Criminal Dance / 犯人は踊る - English Edition)
 * Pure Web Audio Synthesis + Canvas VFX + Multi-Peer P2P Engine
 */

// Sound FX Synthesis
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'card_play') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'pass_card') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.15);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'accuse') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.setValueAtTime(520, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'win_criminal') {
    // Triumphant stealth stinger
    [330, 392, 493, 659].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, now + i * 0.12);
      g.gain.setValueAtTime(0.25, now + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);
      o.start(now + i * 0.12);
      o.stop(now + i * 0.12 + 0.35);
    });
  } else if (type === 'win_detective') {
    // Grand fanfare
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + i * 0.1);
      g.gain.setValueAtTime(0.3, now + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
      o.start(now + i * 0.1);
      o.stop(now + i * 0.1 + 0.4);
    });
  }
}

// Canvas VFX Particles System
const vfxCanvas = document.getElementById('vfxCanvas');
const vfxCtx = vfxCanvas.getContext('2d');
let activeParticles = [];

function resizeVfxCanvas() {
  vfxCanvas.width = vfxCanvas.parentElement.clientWidth;
  vfxCanvas.height = vfxCanvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeVfxCanvas);
resizeVfxCanvas();

function loopVfx() {
  vfxCtx.clearRect(0, 0, vfxCanvas.width, vfxCanvas.height);
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.life -= 0.016;
    if (p.life <= 0) {
      activeParticles.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.alpha = Math.max(0, p.life / p.maxLife);

    vfxCtx.save();
    vfxCtx.globalAlpha = p.alpha;
    vfxCtx.fillStyle = p.color;
    vfxCtx.beginPath();
    vfxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    vfxCtx.fill();
    vfxCtx.restore();
  }
  requestAnimationFrame(loopVfx);
}
requestAnimationFrame(loopVfx);

function spawnCardVFX(x, y, color = '#38bdf8') {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    activeParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 3,
      color,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1.0
    });
  }
}

function spawnVictoryConfetti() {
  const colors = ['#f59e0b', '#38bdf8', '#ef4444', '#10b981', '#a855f7'];
  for (let i = 0; i < 120; i++) {
    activeParticles.push({
      x: vfxCanvas.width / 2,
      y: vfxCanvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.8 + Math.random() * 1.0,
      maxLife: 2.8
    });
  }
}

// Card Definitions with English Names & Unique Fictional Cartoon Art
const CARDS = {
  FIRST_DISCOVERY: {
    id: 'first_discovery',
    name: 'First Discovery',
    type: 'event',
    img: 'assets/card_first_discovery.jpg',
    cardClass: 'card-detective',
    desc: 'The crime scene! The holder of this card plays first to start the round.',
    canPlay: (player, state) => state.isFirstTurn
  },
  CRIMINAL: {
    id: 'criminal',
    name: 'Criminal',
    type: 'criminal',
    img: 'assets/card_criminal.jpg',
    cardClass: 'card-criminal',
    desc: 'Can ONLY be played as your very last card! If played, the Criminal wins immediately!',
    canPlay: (player, state) => player.hand.length === 1
  },
  DETECTIVE: {
    id: 'detective',
    name: 'Detective',
    type: 'investigation',
    img: 'assets/card_detective.jpg',
    cardClass: 'card-detective',
    desc: 'Accuse a suspect with 3 or fewer cards. If they hold the Criminal (and no Alibi), you win!',
    canPlay: (player, state) => {
      return state.players.some((p, idx) => idx !== state.currentTurn && p.hand.length <= 3 && p.hand.length > 0);
    }
  },
  POLICE: {
    id: 'police',
    name: 'Police Inspector',
    type: 'investigation',
    img: 'assets/card_police.jpg',
    cardClass: 'card-detective',
    desc: 'Point to any suspect and question them directly! If they hold the Criminal (and have no Alibi), they are arrested and you win!',
    canPlay: (player, state) => {
      return state.players.some((p, idx) => idx !== state.currentTurn && p.hand.length > 0);
    }
  },
  POLICE_DOG: {
    id: 'police_dog',
    name: 'Police Dog (K-9)',
    type: 'investigation',
    img: 'assets/card_dog.jpg',
    cardClass: 'card-dog',
    desc: 'Choose a suspect, then choose which 1 card from their hand to sniff! If it is the Criminal, they are caught!',
    canPlay: (player, state) => {
      return state.players.some((p, idx) => idx !== state.currentTurn && p.hand.length > 0);
    }
  },
  ACCOMPLICE: {
    id: 'accomplice',
    name: 'Accomplice',
    type: 'secret_ally',
    img: 'assets/card_accomplice.jpg',
    cardClass: 'card-accomplice',
    desc: 'You secretly ally with the Criminal! You win together if the Criminal escapes.',
    canPlay: () => true
  },
  ALIBI: {
    id: 'alibi',
    name: 'Alibi',
    type: 'defense',
    img: 'assets/card_alibi.jpg',
    cardClass: 'card-alibi',
    desc: 'While in your hand, if questioned by Detective or Police, you can claim "Not Guilty" even if holding Criminal!',
    canPlay: () => true
  },
  WITNESS: {
    id: 'witness',
    name: 'Witness',
    type: 'intel',
    img: 'assets/card_witness.jpg',
    cardClass: 'card-info',
    desc: 'Look secretly at a chosen player\'s entire hand.',
    canPlay: (player, state) => {
      return state.players.some((p, idx) => idx !== state.currentTurn && p.hand.length > 0);
    }
  },
  INFO_TRADE: {
    id: 'info_trade',
    name: 'Information Trade',
    type: 'swap',
    img: 'assets/card_trade.jpg',
    cardClass: 'card-info',
    desc: 'Everyone passes 1 card from their hand to the player on their left.',
    canPlay: () => true
  },
  RUMOR: {
    id: 'rumor',
    name: 'Rumor / Gossip',
    type: 'swap',
    img: 'assets/card_rumor.jpg',
    cardClass: 'card-info',
    desc: 'Every player draws 1 random card from the player on their right.',
    canPlay: () => true
  },
  TRADE_SECRETS: {
    id: 'trade_secrets',
    name: 'Trade Secrets',
    type: 'swap',
    img: 'assets/card_trade.jpg',
    cardClass: 'card-accomplice',
    desc: 'Choose a player. You and that player privately swap 1 card each.',
    canPlay: (player, state) => {
      return state.players.some((p, idx) => idx !== state.currentTurn && p.hand.length > 0);
    }
  },
  BOYCOTT: {
    id: 'boycott',
    name: 'Bystander / Civilian',
    type: 'blank',
    img: 'assets/card_alibi.jpg',
    cardClass: 'card-info',
    desc: 'An innocent bystander. No special effect. Discard safely to reduce your hand size.',
    canPlay: () => true
  }
};

// Official Deck Composition (Exact rules from Hannin wa Odoru 3rd Edition)
// Total Pool: 32 Cards (First Discovery x1, Criminal x1, Detective x4, Police x1, Dog x1, Accomplice x2, Alibi x5, Witness x3, Trade x5, Rumor x4, Info Trade x3, Bystander x2)
function generateDeck(playerCount) {
  const cards = [];

  // Mandatory starting cards for all player counts:
  cards.push(CARDS.FIRST_DISCOVERY);
  cards.push(CARDS.CRIMINAL);
  cards.push(CARDS.DETECTIVE);
  cards.push(CARDS.POLICE);
  cards.push(CARDS.ALIBI);
  cards.push(CARDS.ALIBI);

  if (playerCount >= 4) {
    cards.push(CARDS.ACCOMPLICE);
    cards.push(CARDS.POLICE_DOG);
    cards.push(CARDS.WITNESS);
    cards.push(CARDS.INFO_TRADE);
  }

  if (playerCount >= 5) {
    cards.push(CARDS.DETECTIVE);
    cards.push(CARDS.ALIBI);
    cards.push(CARDS.RUMOR);
    cards.push(CARDS.TRADE_SECRETS);
  }

  if (playerCount >= 6) {
    cards.push(CARDS.ACCOMPLICE);
    cards.push(CARDS.WITNESS);
    cards.push(CARDS.TRADE_SECRETS);
    cards.push(CARDS.BOYCOTT);
  }

  // Pool of authentic remaining cards to fill up to exactly (playerCount * 4) cards
  const remainingPool = [
    CARDS.DETECTIVE,
    CARDS.DETECTIVE,
    CARDS.ALIBI,
    CARDS.ALIBI,
    CARDS.TRADE_SECRETS,
    CARDS.TRADE_SECRETS,
    CARDS.TRADE_SECRETS,
    CARDS.RUMOR,
    CARDS.RUMOR,
    CARDS.RUMOR,
    CARDS.INFO_TRADE,
    CARDS.INFO_TRADE,
    CARDS.WITNESS,
    CARDS.BOYCOTT
  ].sort(() => Math.random() - 0.5);

  const needed = (playerCount * 4) - cards.length;
  for (let i = 0; i < needed; i++) {
    cards.push(remainingPool[i % remainingPool.length]);
  }

  // Shuffle thoroughly
  return cards.sort(() => Math.random() - 0.5);
}

// Game State
let gameState = {
  mode: 'ai', // 'ai' or 'p2p'
  playerCount: 4,
  myPlayerIdx: 0,
  currentTurn: 0,
  isFirstTurn: true,
  discardPile: [],
  players: [],
  winnerTeam: null, // 'criminal' or 'detective'
  gameOver: false,
  pendingModalAction: null
};

// Bot Names
const BOT_NAMES = ['Inspector Lestrade', 'Sherlock', 'Viper', 'Shadow Rogue', 'Agent Carter', 'Columbo'];

function initGameSession(playerCount = 4, myName = 'Detective Holmes') {
  const deck = generateDeck(playerCount);

  gameState.playerCount = playerCount;
  gameState.isFirstTurn = true;
  gameState.discardPile = [];
  gameState.winnerTeam = null;
  gameState.gameOver = false;
  gameState.pendingModalAction = null;
  gameState.players = [];

  // Deal 4 cards each
  for (let i = 0; i < playerCount; i++) {
    const isBot = (gameState.mode === 'ai') ? (i !== 0) : false;
    const name = i === 0 ? myName : BOT_NAMES[(i - 1) % BOT_NAMES.length];
    const hand = deck.splice(0, 4);

    gameState.players.push({
      id: i,
      name,
      isBot,
      hand,
      isAccomplice: false
    });
  }

  // Find who holds FIRST_DISCOVERY to start round
  let starterIdx = 0;
  gameState.players.forEach((p, idx) => {
    if (p.hand.some(c => c.id === 'first_discovery')) {
      starterIdx = idx;
    }
  });

  gameState.currentTurn = starterIdx;

  renderTableLayout();
  renderMyHand();
  updateCenterHub();

  const starter = gameState.players[starterIdx];
  showToast("Crime Scene Discovered!", `${starter.name} holds the First Discovery card and starts the investigation!`, "🔍");

  if (starter.isBot) {
    setTimeout(handleBotTurn, 1400);
  }
}

// Render Seats around Circular Table
function renderTableLayout() {
  const container = document.getElementById('seatsContainer');
  container.innerHTML = '';
  const total = gameState.players.length;

  const table = document.getElementById('circleTable');
  const rx = (table.clientWidth / 2) - 20;
  const ry = (table.clientHeight / 2) - 20;
  const cx = table.clientWidth / 2;
  const cy = table.clientHeight / 2;

  gameState.players.forEach((p, idx) => {
    // Relative positioning
    const angle = ((idx - gameState.myPlayerIdx + total) % total) * (2 * Math.PI / total) + (Math.PI / 2);
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    const seat = document.createElement('div');
    seat.id = `seat_${p.id}`;
    seat.className = `table-seat ${gameState.currentTurn === p.id ? 'turn-active' : ''} ${p.hand.length === 0 ? 'is-dead' : ''}`;
    seat.style.left = `${x}px`;
    seat.style.top = `${y}px`;

    const isMe = (p.id === gameState.myPlayerIdx);
    const roleBadge = p.isAccomplice && isMe ? '<span class="seat-role-badge" style="background:#a855f7; color:#fff;">🤝 Accomplice</span>' : '';

    seat.innerHTML = `
      <div class="seat-name">${isMe ? '⭐ ' : ''}${p.name}</div>
      <div class="seat-cards-badge">
        <span>🃏</span>
        <span>${p.hand.length} card${p.hand.length === 1 ? '' : 's'}</span>
      </div>
      ${roleBadge}
    `;

    container.appendChild(seat);
  });

  // Turn badge
  const turnBadge = document.getElementById('turnBadge');
  const currP = gameState.players[gameState.currentTurn];
  if (currP) {
    if (gameState.currentTurn === gameState.myPlayerIdx) {
      turnBadge.innerHTML = "⚡ <strong>YOUR TURN TO PLAY</strong>";
      turnBadge.style.color = '#10b981';
      turnBadge.style.background = 'rgba(16, 185, 129, 0.25)';
      turnBadge.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
    } else {
      turnBadge.innerHTML = `⏳ <strong>${currP.name}'s Round</strong>`;
      turnBadge.style.color = '#38bdf8';
      turnBadge.style.background = 'rgba(56, 189, 248, 0.2)';
      turnBadge.style.boxShadow = 'none';
    }
  }
}

// Render My Bottom Hand Dock
function renderMyHand() {
  const container = document.getElementById('myHandCardsRow');
  const dock = document.querySelector('.my-hand-dock');
  container.innerHTML = '';
  const me = gameState.players[gameState.myPlayerIdx];
  if (!me) return;

  const isMyTurn = (gameState.currentTurn === gameState.myPlayerIdx && !gameState.gameOver);

  // Apply zoom class to bottom dock when it's our turn
  if (isMyTurn) {
    dock.classList.add('my-turn-zoom');
  } else {
    dock.classList.remove('my-turn-zoom');
  }

  me.hand.forEach((card, cardIndex) => {
    const cardEl = document.createElement('div');
    cardEl.className = `game-card ${card.cardClass || ''}`;

    // Can this card be legally played right now?
    const canPlay = isMyTurn && (gameState.isFirstTurn ? card.id === 'first_discovery' : card.canPlay(me, gameState));
    if (!canPlay) {
      cardEl.classList.add('disabled');
    }

    cardEl.innerHTML = `
      <div class="card-art-box">
        <img src="${card.img}" alt="${card.name}">
      </div>
      <div class="card-info-box">
        <div class="card-title-text">${card.name}</div>
        <div class="card-desc-text">${card.desc}</div>
      </div>
    `;

    cardEl.addEventListener('click', () => {
      if (!canPlay) return;
      playHumanCard(cardIndex);
    });

    container.appendChild(cardEl);
  });
}

// Center Discard Pile and Announcements
function updateCenterHub() {
  const discard = document.getElementById('centerDiscard');
  const title = document.getElementById('discardTitle');
  const sub = document.getElementById('discardSub');
  const img = document.getElementById('discardImg');

  if (gameState.discardPile.length > 0) {
    const lastPlayed = gameState.discardPile[gameState.discardPile.length - 1];
    discard.style.display = 'flex';
    title.textContent = lastPlayed.card.name;
    sub.textContent = `Played by ${lastPlayed.player.name}`;
    img.src = lastPlayed.card.img;
  } else {
    discard.style.display = 'none';
  }
}

function setAnnouncement(text) {
  document.getElementById('centerAnnouncement').innerHTML = text;
}

// Human Play Card
let pendingHumanCardPlayed = null;

function playHumanCard(cardIndex) {
  const me = gameState.players[gameState.myPlayerIdx];
  const card = me.hand.splice(cardIndex, 1)[0];
  playSound('card_play');

  gameState.discardPile.push({ card, player: me });
  gameState.isFirstTurn = false;
  pendingHumanCardPlayed = { card, cardIndex };

  updateCenterHub();
  renderMyHand();
  renderTableLayout();

  const seatCenter = getSeatCenter(me.id);
  spawnCardVFX(seatCenter.x, seatCenter.y, '#38bdf8');

  executeCardEffect(me, card);
}

// Cancel action and return the played card back to hand
function cancelHumanCardAction() {
  if (!pendingHumanCardPlayed) return;

  const me = gameState.players[gameState.myPlayerIdx];
  // Pop the card from discard pile
  const discarded = gameState.discardPile.pop();

  // Put card back in hand
  if (discarded && discarded.card) {
    me.hand.splice(pendingHumanCardPlayed.cardIndex, 0, discarded.card);
  }
  pendingHumanCardPlayed = null;

  // Restore center hub & table display
  updateCenterHub();
  renderMyHand();
  renderTableLayout();

  setAnnouncement("Action cancelled. Choose another card to play.");
  showToast("Action Cancelled", "Card returned to your hand. Still your turn!", "↩️");
}

// Card Effects Dispatcher
function executeCardEffect(actor, card) {
  showToast(card.name, `${actor.name} played "${card.name}"!`, "🃏");
  setAnnouncement(`<strong>${actor.name}</strong> played <strong>${card.name}</strong>`);

  // 1. CRIMINAL: Played as final card -> Criminal Wins!
  if (card.id === 'criminal') {
    endGame('criminal', actor);
    return;
  }

  // 2. DETECTIVE: Accuse a suspect with <= 3 cards
  if (card.id === 'detective') {
    if (!actor.isBot) {
      openAccuseSuspectModal('detective');
    } else {
      botExecuteDetective(actor);
    }
    return;
  }

  // 3. POLICE INSPECTOR: Accuse any suspect directly
  if (card.id === 'police') {
    if (!actor.isBot) {
      openAccuseSuspectModal('police');
    } else {
      botExecutePolice(actor);
    }
    return;
  }

  // 4. POLICE DOG: Sniff 1 chosen card from a chosen suspect
  if (card.id === 'police_dog') {
    if (!actor.isBot) {
      openAccuseSuspectModal('police_dog');
    } else {
      botExecuteDog(actor);
    }
    return;
  }

  // 4. ACCOMPLICE: Secret partnership
  if (card.id === 'accomplice') {
    actor.isAccomplice = true;
    showToast("🤝 Secret Alliance!", `${actor.name} secretly became the Accomplice!`, "🤫");
    nextTurn();
    return;
  }

  // 5. WITNESS: Peek at hand
  if (card.id === 'witness') {
    if (!actor.isBot) {
      openWitnessModal();
    } else {
      botExecuteWitness(actor);
    }
    return;
  }

  // 6. INFORMATION TRADE: Everyone passes 1 card to the left!
  if (card.id === 'info_trade') {
    executeInformationTrade();
    return;
  }

  // 7. RUMOR / GOSSIP: Draw 1 card from player on right!
  if (card.id === 'rumor') {
    executeRumorExchange();
    return;
  }

  // 8. TRADE SECRETS: Swap 1 card with a chosen player
  if (card.id === 'trade_secrets') {
    if (!actor.isBot) {
      openTradeSecretsModal();
    } else {
      botExecuteTradeSecrets(actor);
    }
    return;
  }

  // 9. FIRST_DISCOVERY / BOYCOTT / ALIBI: Normal discard
  nextTurn();
}

// Next Turn Handler
function nextTurn() {
  if (gameState.gameOver) return;

  // Check if all players have run out of cards
  const activePlayers = gameState.players.filter(p => p.hand.length > 0);
  if (activePlayers.length === 0) {
    // If cards exhausted and criminal was not caught, criminal team escapes!
    const criminalHolder = gameState.players.find(p => p.hand.some(c => c.id === 'criminal')) || gameState.players[0];
    endGame('criminal', criminalHolder, "All cards exhausted! The Criminal escaped without detection!");
    return;
  }

  // Cycle to next player with cards
  let nextIdx = (gameState.currentTurn + 1) % gameState.players.length;
  while (gameState.players[nextIdx].hand.length === 0) {
    nextIdx = (nextIdx + 1) % gameState.players.length;
  }

  // Re-render my hand and seats whenever turn advances
  gameState.currentTurn = nextIdx;
  renderTableLayout();
  renderMyHand();

  const nextP = gameState.players[nextIdx];
  setAnnouncement(`It is <strong>${nextP.name}</strong>'s turn to investigate.`);

  if (nextP.isBot) {
    setTimeout(handleBotTurn, 1400);
  }
}

// Accuse Modal for Detective, Police Inspector & Police Dog
function openAccuseSuspectModal(actionType) {
  const modal = document.getElementById('targetPickerModal');
  const title = document.getElementById('targetModalTitle');
  const desc = document.getElementById('targetModalDesc');
  const grid = document.getElementById('suspectsPickerGrid');
  grid.innerHTML = '';

  if (actionType === 'detective') {
    title.textContent = "🕵️ Detective's Deduction";
    desc.textContent = "Choose a suspect holding 3 or fewer cards to interrogate:";
  } else if (actionType === 'police') {
    title.textContent = "👮 Police Interrogation";
    desc.textContent = "Point to any suspect at the table to interrogate directly:";
  } else {
    title.textContent = "🐕 K-9 Police Dog";
    desc.textContent = "Choose a suspect to sniff their cards:";
  }

  gameState.players.forEach(p => {
    if (p.id === gameState.myPlayerIdx) return;
    if (p.hand.length === 0) return;
    if (actionType === 'detective' && p.hand.length > 3) return;

    const btn = document.createElement('button');
    btn.className = 'picker-btn';
    btn.innerHTML = `
      <div style="font-size:1.1rem; font-weight:800;">${p.name}</div>
      <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">🃏 ${p.hand.length} cards in hand</div>
    `;

    btn.addEventListener('click', () => {
      modal.style.display = 'none';

      if (actionType === 'police_dog') {
        // Dog card selection: let human choose WHICH card of that suspect's hand to sniff!
        openDogCardPicker(p);
      } else {
        pendingHumanCardPlayed = null; // Confirmed action!
        resolveAccusation(gameState.players[gameState.myPlayerIdx], p, actionType);
      }
    });

    grid.appendChild(btn);
  });

  modal.style.display = 'flex';
}

// Dog Card Picker: Let the player choose which of the suspect's facedown cards to sniff!
function openDogCardPicker(suspect) {
  const modal = document.getElementById('targetPickerModal');
  const title = document.getElementById('targetModalTitle');
  const desc = document.getElementById('targetModalDesc');
  const grid = document.getElementById('suspectsPickerGrid');
  grid.innerHTML = '';

  title.textContent = `🐕 Sniff ${suspect.name}'s Cards`;
  desc.textContent = `Pick which of ${suspect.name}'s ${suspect.hand.length} facedown cards the K-9 should sniff:`;

  suspect.hand.forEach((card, cardIdx) => {
    const btn = document.createElement('button');
    btn.className = 'picker-btn';
    btn.innerHTML = `
      <div style="font-size:2rem; margin-bottom:4px;">🎴</div>
      <div style="font-size:0.9rem; font-weight:800;">Card #${cardIdx + 1}</div>
    `;

    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      pendingHumanCardPlayed = null;
      resolveDogSniff(gameState.players[gameState.myPlayerIdx], suspect, cardIdx);
    });

    grid.appendChild(btn);
  });

  modal.style.display = 'flex';
}

function resolveDogSniff(accuser, suspect, cardIdx) {
  playSound('accuse');
  const sniffedCard = suspect.hand[cardIdx] || suspect.hand[0];

  if (sniffedCard && sniffedCard.id === 'criminal') {
    showToast("DOG CAUGHT THE TRAIL!", `🐕 Card #${cardIdx + 1} was the Criminal! ${suspect.name} is caught!`, "🚨");
    endGame('detective', accuser, `The K-9 tracking dog sniffed out ${suspect.name}'s Criminal card on Card #${cardIdx + 1}!`);
  } else {
    showToast("Scent Clear!", `🐕 Card #${cardIdx + 1} was "${sniffedCard ? sniffedCard.name : 'Clean'}". Not the Criminal.`, "🐾");
    setAnnouncement(`Police dog sniffed Card #${cardIdx + 1} from <strong>${suspect.name}</strong> — clear!`);
    nextTurn();
  }
}

// Resolve Accusations
function resolveAccusation(accuser, suspect, actionType) {
  playSound('accuse');

  const hasCriminal = suspect.hand.some(c => c.id === 'criminal');
  const hasAlibi = suspect.hand.some(c => c.id === 'alibi');

  if (hasCriminal && !hasAlibi) {
    // BUSTED! Detective / Police Wins!
    showToast("BUSTED!", `🚨 ${suspect.name} was caught holding the Criminal!`, "👮");
    endGame('detective', accuser, `${accuser.name} accurately deduced that ${suspect.name} harbored the Criminal!`);
  } else if (hasCriminal && hasAlibi) {
    showToast("ALIBI SHIELD!", `🛡️ ${suspect.name} invoked an Alibi and declared: "I am innocent!"`, "🪓");
    setAnnouncement(`<strong>${suspect.name}</strong> presented an airtight Alibi!`);
    nextTurn();
  } else {
    showToast("INNOCENT!", `❌ ${suspect.name} is NOT the Criminal!`, "🤷");
    setAnnouncement(`<strong>${suspect.name}</strong> proved completely innocent.`);
    nextTurn();
  }
}

// Witness Card (Peek at hand)
function openWitnessModal() {
  const modal = document.getElementById('targetPickerModal');
  const title = document.getElementById('targetModalTitle');
  const desc = document.getElementById('targetModalDesc');
  const grid = document.getElementById('suspectsPickerGrid');
  grid.innerHTML = '';

  title.textContent = "🔍 Question the Witness";
  desc.textContent = "Choose a suspect to privately examine their entire hand:";

  gameState.players.forEach(p => {
    if (p.id === gameState.myPlayerIdx || p.hand.length === 0) return;
    const btn = document.createElement('button');
    btn.className = 'picker-btn';
    btn.textContent = `${p.name} (${p.hand.length} cards)`;
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      pendingHumanCardPlayed = null;
      const cardNames = p.hand.map(c => c.name).join(', ');
      alert(`👁️ WITNESS INTEL:\n\n${p.name}'s hand contains:\n• ${cardNames}`);
      nextTurn();
    });
    grid.appendChild(btn);
  });

  modal.style.display = 'flex';
}

// Information Trade (Everyone simultaneously passes 1 card to the left)
function executeInformationTrade() {
  showToast("🔄 Information Trade!", "Everyone must choose 1 card to pass to their left neighbor!", "🔄");
  setAnnouncement("<strong>Information Trade:</strong> Passing cards to the left...");

  // If human has cards, ask human to pick 1 card to pass
  const me = gameState.players[gameState.myPlayerIdx];
  if (me.hand.length > 0) {
    promptCardPassSelection("Information Trade", "Choose 1 card to pass to your left neighbor:", (chosenCardIdx) => {
      completeTradeLeft(chosenCardIdx);
    });
  } else {
    completeTradeLeft(null);
  }
}

function promptCardPassSelection(titleText, descText, onChosen, isCancelable = false) {
  const modal = document.getElementById('cardSelectModal');
  const title = document.getElementById('cardSelectTitle');
  const desc = document.getElementById('cardSelectDesc');
  const container = document.getElementById('cardSelectContainer');
  const cancelBtn = document.getElementById('cancelCardSelectBtn');
  container.innerHTML = '';

  title.textContent = titleText;
  desc.textContent = descText;

  if (isCancelable) {
    cancelBtn.style.display = 'block';
    cancelBtn.onclick = () => {
      modal.style.display = 'none';
      cancelHumanCardAction();
    };
  } else {
    cancelBtn.style.display = 'none';
  }

  const me = gameState.players[gameState.myPlayerIdx];
  me.hand.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `game-card ${card.cardClass || ''}`;
    cardEl.innerHTML = `
      <div class="card-art-box"><img src="${card.img}" alt="${card.name}"></div>
      <div class="card-info-box">
        <div class="card-title-text">${card.name}</div>
        <div class="card-desc-text">${card.desc}</div>
      </div>
    `;
    cardEl.addEventListener('click', () => {
      modal.style.display = 'none';
      onChosen(idx);
    });
    container.appendChild(cardEl);
  });

  modal.style.display = 'flex';
}

function completeTradeLeft(humanChosenIdx) {
  const passingCards = [];

  gameState.players.forEach(p => {
    if (p.hand.length === 0) {
      passingCards.push(null);
      return;
    }

    if (p.id === gameState.myPlayerIdx && humanChosenIdx !== null) {
      passingCards.push(p.hand.splice(humanChosenIdx, 1)[0]);
    } else {
      // Bot passes: intelligent selection
      const passIdx = botSelectCardToPass(p);
      passingCards.push(p.hand.splice(passIdx, 1)[0]);
    }
  });

  // Distribute to left neighbor ((i + 1) % total)
  const total = gameState.players.length;
  gameState.players.forEach((p, i) => {
    // Player i receives the card passed by player (i - 1 + total) % total
    const cardPassedFromRight = passingCards[(i - 1 + total) % total];
    if (cardPassedFromRight) {
      p.hand.push(cardPassedFromRight);
    }
  });

  playSound('pass_card');
  renderTableLayout();
  renderMyHand();
  nextTurn();
}

// Rumor Exchange (Every player draws 1 random card from player on right)
function executeRumorExchange() {
  showToast("🤫 Rumor Spreads!", "Everyone secretly takes 1 card from their right neighbor!", "👂");
  playSound('pass_card');

  const total = gameState.players.length;
  const stolen = new Array(total).fill(null);

  // Take 1 card from player (i + 1) % total
  gameState.players.forEach((p, i) => {
    const rightNeighborIdx = (i + 1) % total;
    const rightNeighbor = gameState.players[rightNeighborIdx];
    if (rightNeighbor && rightNeighbor.hand.length > 0) {
      const randIdx = Math.floor(Math.random() * rightNeighbor.hand.length);
      stolen[i] = rightNeighbor.hand.splice(randIdx, 1)[0];
    }
  });

  // Give each player the card they pulled from their right neighbor
  gameState.players.forEach((p, i) => {
    if (stolen[i]) {
      p.hand.push(stolen[i]);
    }
  });

  renderTableLayout();
  renderMyHand();
  nextTurn();
}

// Trade Secrets (2 players swap 1 card)
function openTradeSecretsModal() {
  const modal = document.getElementById('targetPickerModal');
  const title = document.getElementById('targetModalTitle');
  const desc = document.getElementById('targetModalDesc');
  const grid = document.getElementById('suspectsPickerGrid');
  grid.innerHTML = '';

  title.textContent = "🤝 Trade Secrets";
  desc.textContent = "Choose a partner to secretly swap 1 card with:";

  gameState.players.forEach(p => {
    if (p.id === gameState.myPlayerIdx || p.hand.length === 0) return;
    const btn = document.createElement('button');
    btn.className = 'picker-btn';
    btn.textContent = `${p.name} (${p.hand.length} cards)`;
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      pendingHumanCardPlayed = null;
      promptCardPassSelection("Trade Secrets", `Choose 1 card to give to ${p.name}:`, (chosenIdx) => {
        const me = gameState.players[gameState.myPlayerIdx];
        const myGivenCard = me.hand.splice(chosenIdx, 1)[0];
        const botGivenIdx = botSelectCardToPass(p);
        const botGivenCard = p.hand.splice(botGivenIdx, 1)[0];

        me.hand.push(botGivenCard);
        p.hand.push(myGivenCard);

        playSound('pass_card');
        showToast("Secrets Traded", `You swapped cards with ${p.name}!`, "🤝");
        renderTableLayout();
        renderMyHand();
        nextTurn();
      }, true);
    });
    grid.appendChild(btn);
  });

  modal.style.display = 'flex';
}

// Bot AI Intelligence
function handleBotTurn() {
  if (gameState.gameOver) return;
  const bot = gameState.players[gameState.currentTurn];
  if (!bot || bot.hand.length === 0) return;

  // 1. Mandatory FIRST_DISCOVERY
  const firstIdx = bot.hand.findIndex(c => c.id === 'first_discovery');
  if (firstIdx !== -1) {
    const card = bot.hand.splice(firstIdx, 1)[0];
    gameState.discardPile.push({ card, player: bot });
    gameState.isFirstTurn = false;
    updateCenterHub();
    renderTableLayout();
    executeCardEffect(bot, card);
    return;
  }

  // 2. CRIMINAL: If it's the last card, play it to win!
  if (bot.hand.length === 1 && bot.hand[0].id === 'criminal') {
    const card = bot.hand.pop();
    gameState.discardPile.push({ card, player: bot });
    updateCenterHub();
    renderTableLayout();
    executeCardEffect(bot, card);
    return;
  }

  // 3. Detective: Play if valid target exists
  const detIdx = bot.hand.findIndex(c => c.id === 'detective');
  if (detIdx !== -1) {
    const validTargets = gameState.players.filter((p, i) => i !== bot.id && p.hand.length <= 3 && p.hand.length > 0);
    if (validTargets.length > 0) {
      const card = bot.hand.splice(detIdx, 1)[0];
      gameState.discardPile.push({ card, player: bot });
      updateCenterHub();
      renderTableLayout();
      executeCardEffect(bot, card);
      return;
    }
  }

  // 4. Police Dog
  const dogIdx = bot.hand.findIndex(c => c.id === 'police_dog');
  if (dogIdx !== -1) {
    const card = bot.hand.splice(dogIdx, 1)[0];
    gameState.discardPile.push({ card, player: bot });
    updateCenterHub();
    renderTableLayout();
    executeCardEffect(bot, card);
    return;
  }

  // 5. Police Inspector
  const policeIdx = bot.hand.findIndex(c => c.id === 'police');
  if (policeIdx !== -1) {
    const card = bot.hand.splice(policeIdx, 1)[0];
    gameState.discardPile.push({ card, player: bot });
    updateCenterHub();
    renderTableLayout();
    executeCardEffect(bot, card);
    return;
  }

  // 5. Play other cards (avoid playing Criminal early!)
  const playableIndices = [];
  bot.hand.forEach((c, idx) => {
    if (c.id !== 'criminal') playableIndices.push(idx);
  });

  const chosenCardIdx = playableIndices.length > 0 ? playableIndices[Math.floor(Math.random() * playableIndices.length)] : 0;
  const card = bot.hand.splice(chosenCardIdx, 1)[0];
  gameState.discardPile.push({ card, player: bot });
  updateCenterHub();
  renderTableLayout();
  executeCardEffect(bot, card);
}

function botExecuteDetective(bot) {
  const suspects = gameState.players.filter((p, i) => i !== bot.id && p.hand.length <= 3 && p.hand.length > 0);
  if (suspects.length === 0) {
    nextTurn();
    return;
  }
  // Target player with fewest cards (most suspicious of being close to winning with Criminal!)
  suspects.sort((a, b) => a.hand.length - b.hand.length);
  const target = suspects[0];
  showToast("Accusation!", `${bot.name} accuses ${target.name} with the Detective card!`, "🕵️");
  setTimeout(() => resolveAccusation(bot, target, 'detective'), 800);
}

function botExecutePolice(bot) {
  const suspects = gameState.players.filter((p, i) => i !== bot.id && p.hand.length > 0);
  if (suspects.length === 0) {
    nextTurn();
    return;
  }
  suspects.sort((a, b) => a.hand.length - b.hand.length);
  const target = suspects[0];
  showToast("Police Interrogation!", `👮 ${bot.name} questions ${target.name} directly!`, "🚨");
  setTimeout(() => resolveAccusation(bot, target, 'police'), 800);
}

function botExecuteDog(bot) {
  const suspects = gameState.players.filter((p, i) => i !== bot.id && p.hand.length > 0);
  if (suspects.length === 0) {
    nextTurn();
    return;
  }
  suspects.sort((a, b) => a.hand.length - b.hand.length);
  const target = suspects[0];
  const cardIdx = Math.floor(Math.random() * target.hand.length);
  showToast("Police Dog!", `${bot.name} sends the K-9 to sniff Card #${cardIdx + 1} of ${target.name}!`, "🐕");
  setTimeout(() => resolveDogSniff(bot, target, cardIdx), 800);
}

function botExecuteWitness(bot) {
  const suspects = gameState.players.filter((p, i) => i !== bot.id && p.hand.length > 0);
  const target = suspects[Math.floor(Math.random() * suspects.length)];
  showToast("Witness Intel", `${bot.name} questioned a witness regarding ${target.name}!`, "👁️");
  nextTurn();
}

function botExecuteTradeSecrets(bot) {
  const suspects = gameState.players.filter((p, i) => i !== bot.id && p.hand.length > 0);
  const partner = suspects[Math.floor(Math.random() * suspects.length)];
  const botCardIdx = botSelectCardToPass(bot);
  const botCard = bot.hand.splice(botCardIdx, 1)[0];

  const partnerCardIdx = (partner.id === gameState.myPlayerIdx) 
    ? 0 
    : botSelectCardToPass(partner);
  const partnerCard = partner.hand.splice(partnerCardIdx, 1)[0];

  bot.hand.push(partnerCard);
  partner.hand.push(botCard);
  showToast("Trade Secrets", `${bot.name} traded secret documents with ${partner.name}!`, "🤝");
  nextTurn();
}

function botSelectCardToPass(bot) {
  // If holding Criminal and heat is high, pass it away! Otherwise pass low-value cards
  const crimIdx = bot.hand.findIndex(c => c.id === 'criminal');
  if (crimIdx !== -1 && Math.random() < 0.4) {
    return crimIdx; // Pass the dancing criminal to confuse opponents!
  }
  const safeIdx = bot.hand.findIndex(c => c.id !== 'criminal');
  return safeIdx !== -1 ? safeIdx : 0;
}

// Victory & Game Over Screen
function endGame(winningTeam, keyPlayer, reason = '') {
  gameState.gameOver = true;
  gameState.winnerTeam = winningTeam;

  const modal = document.getElementById('victoryModal');
  const icon = document.getElementById('victoryIcon');
  const title = document.getElementById('victoryTitle');
  const sub = document.getElementById('victorySubtitle');
  const winnersList = document.getElementById('victoryWinnersList');
  winnersList.innerHTML = '';

  if (winningTeam === 'criminal') {
    playSound('win_criminal');
    icon.textContent = "🦹";
    title.textContent = "CRIMINAL ESCAPED!";
    sub.textContent = reason || `${keyPlayer.name} successfully played the Criminal card as their final act and escaped!`;

    // Criminal + Accomplices win
    gameState.players.forEach(p => {
      const isCrim = p.id === keyPlayer.id;
      const isAcc = p.isAccomplice;
      if (isCrim || isAcc) {
        const row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; font-weight:700;";
        row.innerHTML = `<span>👑 ${p.name}</span><span style="color:#ef4444;">${isCrim ? 'Mastermind Criminal' : 'Secret Accomplice'}</span>`;
        winnersList.appendChild(row);
      }
    });
  } else {
    playSound('win_detective');
    icon.textContent = "🕵️";
    title.textContent = "CASE SOLVED!";
    sub.textContent = reason || `${keyPlayer.name} cracked the case and arrested the Criminal!`;

    // Detective and all non-criminals/accomplices win
    gameState.players.forEach(p => {
      if (!p.isAccomplice && !p.hand.some(c => c.id === 'criminal')) {
        const row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; font-weight:700;";
        row.innerHTML = `<span>⭐ ${p.name}</span><span style="color:#38bdf8;">Innocent Investigator</span>`;
        winnersList.appendChild(row);
      }
    });
  }

  modal.style.display = 'flex';
  spawnVictoryConfetti();
}

document.getElementById('vicPlayAgainBtn').addEventListener('click', () => {
  document.getElementById('victoryModal').style.display = 'none';
  initGameSession(gameState.playerCount, gameState.players[0].name);
});

// Helper: Seat Center Coordinates
function getSeatCenter(playerIdx) {
  const seat = document.getElementById(`seat_${playerIdx}`);
  if (!seat) return { x: vfxCanvas.width / 2, y: vfxCanvas.height / 2 };
  const rect = seat.getBoundingClientRect();
  const canvasRect = vfxCanvas.getBoundingClientRect();
  return {
    x: rect.left - canvasRect.left + rect.width / 2,
    y: rect.top - canvasRect.top + rect.height / 2
  };
}

// Toast Notifications
function showToast(title, desc, icon = 'ℹ️') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-box';
  toast.innerHTML = `
    <div style="font-size:1.3rem;">${icon}</div>
    <div style="flex:1;">
      <div style="font-weight:700; font-size:0.9rem;">${title}</div>
      <div style="font-size:0.8rem; color:#94a3b8;">${desc}</div>
    </div>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// Rules Modal
const rulesModal = document.getElementById('rulesModal');
document.getElementById('openRulesBtn').addEventListener('click', () => rulesModal.style.display = 'flex');
document.getElementById('closeRulesBtn').addEventListener('click', () => rulesModal.style.display = 'none');

// Lobby Modal & Tabs
const lobbyModal = document.getElementById('lobbyModal');
document.getElementById('openLobbyBtn').addEventListener('click', () => lobbyModal.style.display = 'flex');
document.getElementById('closeLobbyBtn').addEventListener('click', () => lobbyModal.style.display = 'none');

const tabAI = document.getElementById('tabAI');
const tabCreate = document.getElementById('tabCreate');
const tabJoin = document.getElementById('tabJoin');
const viewAI = document.getElementById('viewAI');
const viewCreate = document.getElementById('viewCreate');
const viewJoin = document.getElementById('viewJoin');

function switchTab(t) {
  [tabAI, tabCreate, tabJoin].forEach(b => b.classList.remove('active'));
  viewAI.style.display = 'none';
  viewCreate.style.display = 'none';
  viewJoin.style.display = 'none';

  if (t === 'ai') {
    tabAI.classList.add('active');
    viewAI.style.display = 'block';
  } else if (t === 'create') {
    tabCreate.classList.add('active');
    viewCreate.style.display = 'block';
  } else {
    tabJoin.classList.add('active');
    viewJoin.style.display = 'block';
  }
}
tabAI.addEventListener('click', () => switchTab('ai'));
tabCreate.addEventListener('click', () => switchTab('create'));
tabJoin.addEventListener('click', () => switchTab('join'));

// AI Player Count Buttons
let selectedAICount = 4;
document.querySelectorAll('.playerCountBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.playerCountBtn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = 'var(--border-color)';
    });
    btn.classList.add('active');
    btn.style.borderColor = '#38bdf8';
    selectedAICount = parseInt(btn.dataset.count, 10);
  });
});

document.getElementById('startAIBtn').addEventListener('click', () => {
  const nick = document.getElementById('playerNameInput').value.trim() || 'Detective Holmes';
  gameState.mode = 'ai';
  lobbyModal.style.display = 'none';
  initGameSession(selectedAICount, nick);
});

// P2P Multiplayer Engine (Using MultiPeerEngine)
let multiPeer = null;

document.getElementById('hostRoomBtn').addEventListener('click', () => {
  const nick = document.getElementById('playerNameInput').value.trim() || 'Detective Host';
  gameState.mode = 'p2p';
  gameState.myPlayerIdx = 0;

  multiPeer = new MultiPeerEngine({
    gamePrefix: 'crimdance',
    onStatus: (msg) => {
      const b = document.getElementById('connectedPlayersBadge');
      if (b) b.textContent = msg;
    },
    onPlayerJoin: (client) => {
      showToast("Player Joined!", `${client.name || 'Suspect'} entered the investigation room!`, "👋");
    },
    onData: (data) => {
      if (data.type === 'SYNC_STATE') {
        gameState = data.state;
        renderTableLayout();
        renderMyHand();
        updateCenterHub();
      }
    }
  });

  const code = multiPeer.initHost();
  document.getElementById('hostWaitingArea').style.display = 'block';
  const fullUrl = `${window.location.origin}${window.location.pathname}?room=${code}`;
  document.getElementById('shareLinkInput').value = fullUrl;
});

document.getElementById('startMultiplayerBtn').addEventListener('click', () => {
  const nick = document.getElementById('playerNameInput').value.trim() || 'Detective Host';
  lobbyModal.style.display = 'none';
  initGameSession(4, nick);
  if (multiPeer) {
    multiPeer.broadcast({ type: 'SYNC_STATE', state: gameState });
  }
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
  const code = document.getElementById('joinRoomInput').value.trim();
  const nick = document.getElementById('playerNameInput').value.trim() || 'Suspect Guest';
  if (!code) {
    alert("Please enter a room code!");
    return;
  }
  gameState.mode = 'p2p';
  multiPeer = new MultiPeerEngine({
    gamePrefix: 'crimdance',
    onStatus: (msg) => {
      document.getElementById('joinStatusText').textContent = msg;
    },
    onData: (data) => {
      if (data.type === 'SYNC_STATE') {
        lobbyModal.style.display = 'none';
        gameState = data.state;
        renderTableLayout();
        renderMyHand();
        updateCenterHub();
      }
    }
  });
  multiPeer.initJoin(code, nick);
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    lobbyModal.style.display = 'flex';
    switchTab('join');
    document.getElementById('joinRoomInput').value = room;
  } else {
    initGameSession(4, 'Detective Holmes');
  }
});
