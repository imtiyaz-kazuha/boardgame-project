/**
 * Heist Royale: Casino Vault
 * Simultaneous Secret Action Selection, Greed Collision, & High-Stakes Looting
 * Pure Web Audio Synthesis + Canvas VFX + Multi-Peer P2P Engine
 */

// Sound FX Synthesis
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const now = audioCtx.currentTime;

  if (type === 'coin') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'alarm') {
    // Two-tone klaxon
    [0, 0.15, 0.3].forEach(t => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now + t);
      osc.frequency.setValueAtTime(450, now + t + 0.08);
      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.14);
      osc.start(now + t);
      osc.stop(now + t + 0.14);
    });
  } else if (type === 'reveal') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(700, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'bank') {
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + i * 0.08);
      g.gain.setValueAtTime(0.25, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      o.start(now + i * 0.08);
      o.stop(now + i * 0.08 + 0.2);
    });
  }
}

// 6 Core Heist Action Cards (Permanent Hand)
const HEIST_CARDS = [
  {
    id: 'safecracker',
    name: 'Safecracker',
    cardClass: 'card-safecracker',
    img: 'assets/card_safecracker.jpg',
    desc: 'Steal 3 Gold from the vault. Fails if any other player also picks Safecracker!'
  },
  {
    id: 'catburglar',
    name: 'Cat Burglar',
    cardClass: 'card-catburglar',
    img: 'assets/card_catburglar.jpg',
    desc: 'Steal the Giant Diamond (+5 Gold)! Fails if another player picks Cat Burglar!'
  },
  {
    id: 'hacker',
    name: 'Hacker',
    cardClass: 'card-hacker',
    img: 'assets/card_hacker.jpg',
    desc: 'EMP Blast! Steal 1 Gold from every rogue who successfully scores this turn.'
  },
  {
    id: 'pickpocket',
    name: 'Pickpocket',
    cardClass: 'card-pickpocket',
    img: 'assets/card_pickpocket.jpg',
    desc: 'Target a rival rogue. If they score gold this turn, snatch half of it!'
  },
  {
    id: 'snitch',
    name: 'The Snitch',
    cardClass: 'card-snitch',
    img: 'assets/card_snitch.jpg',
    desc: 'Alert SWAT. If 2 or more rogues collide in greed this turn, collect a +4 Gold bounty!'
  },
  {
    id: 'getaway',
    name: 'Getaway Driver',
    cardClass: 'card-getaway',
    img: 'assets/card_getaway.jpg',
    desc: 'Bank all your loose gold into your permanent safehouse (banked gold can never be stolen).'
  }
];

// Game State
let gameState = {
  mode: 'ai',
  playerCount: 4,
  myPlayerIdx: 0,
  round: 1,
  maxRounds: 8,
  vaultGold: 32,
  players: [],
  selectedAction: null,
  selectedTarget: null,
  isResolving: false,
  gameOver: false
};

const BOT_ROGUES = ['Shadow Fox', 'Lucky Duke', 'Raven', 'Slick Rico', 'Ghost', 'Viper'];

function initGameSession(playerCount = 4, myName = 'Mastermind') {
  gameState.playerCount = playerCount;
  gameState.round = 1;
  gameState.vaultGold = playerCount * 8;
  gameState.selectedAction = null;
  gameState.selectedTarget = null;
  gameState.isResolving = false;
  gameState.gameOver = false;
  gameState.players = [];

  for (let i = 0; i < playerCount; i++) {
    const isBot = (gameState.mode === 'ai') ? (i !== 0) : false;
    const name = i === 0 ? myName : BOT_ROGUES[(i - 1) % BOT_ROGUES.length];
    gameState.players.push({
      id: i,
      name,
      isBot,
      looseGold: 2,
      bankedGold: 0,
      chosenCard: null,
      chosenTarget: null,
      lastGains: 0
    });
  }

  renderSeatsLayout();
  renderHandCards();
  updateVaultDisplay();

  showToast("Heist Commenced!", "Round 1 begins! Choose your secret action card.", "💎");
}

// Render Seats Around Circular Casino Table
function renderSeatsLayout() {
  const container = document.getElementById('seatsContainer');
  container.innerHTML = '';
  const total = gameState.players.length;

  const table = document.getElementById('casinoTable');
  const rx = (table.clientWidth / 2) - 30;
  const ry = (table.clientHeight / 2) - 30;
  const cx = table.clientWidth / 2;
  const cy = table.clientHeight / 2;

  gameState.players.forEach((p, idx) => {
    const angle = ((idx - gameState.myPlayerIdx + total) % total) * (2 * Math.PI / total) + (Math.PI / 2);
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);

    const seat = document.createElement('div');
    seat.id = `seat_${p.id}`;
    seat.className = `player-seat ${p.chosenCard ? 'locked-in' : ''}`;
    seat.style.left = `${x}px`;
    seat.style.top = `${y}px`;

    const isMe = (p.id === gameState.myPlayerIdx);
    const cardStatus = p.chosenCard 
      ? (gameState.isResolving ? `🃏 ${p.chosenCard.name}` : '🔒 Ready') 
      : 'Thinking...';

    seat.innerHTML = `
      <div class="seat-name-text">${isMe ? '⭐ ' : ''}${p.name}</div>
      <div class="seat-gold-badge">
        <span>💰 ${p.looseGold}</span>
        <span style="color:#10b981;">🏦 ${p.bankedGold}</span>
      </div>
      <div class="seat-action-indicator" style="${p.chosenCard ? 'color:#10b981;' : ''}">
        ${cardStatus}
      </div>
    `;

    container.appendChild(seat);
  });
}

// Render Hand Cards (Permanent Tactical Options)
function renderHandCards() {
  const container = document.getElementById('myHandCardsRow');
  container.innerHTML = '';
  const me = gameState.players[gameState.myPlayerIdx];
  if (!me) return;

  // Stash status in header bar
  document.getElementById('myStashText').innerHTML = `💰 <strong>${me.looseGold} Loose</strong> • <span style="color:#10b981;">🏦 ${me.bankedGold} Banked</span>`;

  HEIST_CARDS.forEach(card => {
    const cardEl = document.createElement('div');
    const isSelected = (gameState.selectedAction && gameState.selectedAction.id === card.id);
    cardEl.className = `heist-card ${card.cardClass} ${isSelected ? 'selected-card' : ''}`;

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
      if (gameState.isResolving || gameState.gameOver) return;

      if (card.id === 'pickpocket') {
        openPickpocketPicker(card, cardEl);
      } else {
        lockInPlayerChoice(card, null, cardEl);
      }
    });

    container.appendChild(cardEl);
  });
}

// Lock In Card Choice
function lockInPlayerChoice(card, targetId = null, cardEl = null) {
  gameState.selectedAction = card;
  gameState.selectedTarget = targetId;

  const me = gameState.players[gameState.myPlayerIdx];
  me.chosenCard = card;
  me.chosenTarget = targetId;

  playSound('reveal');

  const statusBadge = document.getElementById('selectionStatusBadge');
  statusBadge.textContent = `Locked In: ${card.name}`;
  statusBadge.style.color = '#10b981';
  statusBadge.style.background = 'rgba(16, 185, 129, 0.25)';

  renderHandCards();
  renderSeatsLayout();

  // If playing against bots, let bots make their choices and resolve the round!
  if (gameState.mode === 'ai') {
    triggerBotDecisions();
    setTimeout(resolveSimultaneousRound, 1200);
  }
}

// Pickpocket Target Modal
function openPickpocketPicker(card, cardEl) {
  const modal = document.getElementById('targetPickerModal');
  const grid = document.getElementById('suspectsPickerGrid');
  grid.innerHTML = '';

  gameState.players.forEach(p => {
    if (p.id === gameState.myPlayerIdx) return;
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.style.padding = '12px 8px';
    btn.innerHTML = `
      <div style="font-weight:800; font-size:0.95rem;">${p.name}</div>
      <div style="font-size:0.75rem; color:#fbbf24; margin-top:2px;">💰 ${p.looseGold} Loose Gold</div>
    `;
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      lockInPlayerChoice(card, p.id, cardEl);
    });
    grid.appendChild(btn);
  });

  modal.style.display = 'flex';
}

document.getElementById('cancelTargetBtn').addEventListener('click', () => {
  document.getElementById('targetPickerModal').style.display = 'none';
});

// Bot AI Decision Heuristics
function triggerBotDecisions() {
  gameState.players.forEach(p => {
    if (!p.isBot) return;

    // Smart Bot Heuristics:
    // 1. If loose gold >= 5, high probability to call Getaway Driver and bank it
    if (p.looseGold >= 5 && Math.random() < 0.65) {
      p.chosenCard = HEIST_CARDS.find(c => c.id === 'getaway');
      return;
    }

    // 2. If someone is wealthy, consider pickpocketing them
    const wealthyRival = [...gameState.players]
      .filter(x => x.id !== p.id)
      .sort((a, b) => b.looseGold - a.looseGold)[0];

    if (wealthyRival && wealthyRival.looseGold >= 4 && Math.random() < 0.4) {
      p.chosenCard = HEIST_CARDS.find(c => c.id === 'pickpocket');
      p.chosenTarget = wealthyRival.id;
      return;
    }

    // 3. Balanced chance between Safecracker, Cat Burglar, Hacker, Snitch
    const options = [
      HEIST_CARDS.find(c => c.id === 'safecracker'),
      HEIST_CARDS.find(c => c.id === 'catburglar'),
      HEIST_CARDS.find(c => c.id === 'hacker'),
      HEIST_CARDS.find(c => c.id === 'snitch')
    ];

    p.chosenCard = options[Math.floor(Math.random() * options.length)];
  });
}

// SIMULTANEOUS REVEAL & ROUND RESOLUTION
function resolveSimultaneousRound() {
  gameState.isResolving = true;
  playSound('reveal');

  // Center countdown or announce
  const announcement = document.getElementById('centerAnnouncement');
  announcement.innerHTML = "💥 <strong>CARDS REVEALED!</strong> Resolving vault heists...";

  renderSeatsLayout();

  // Count choices
  const counts = { safecracker: 0, catburglar: 0 };
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'safecracker') counts.safecracker++;
    if (p.chosenCard.id === 'catburglar') counts.catburglar++;
    p.lastGains = 0;
  });

  let collisionCount = 0;
  if (counts.safecracker > 1) collisionCount += counts.safecracker;
  if (counts.catburglar > 1) collisionCount += counts.catburglar;

  // Visual Alarm if Collisions Occur
  if (collisionCount > 0) {
    playSound('alarm');
    gameState.players.forEach(p => {
      if ((p.chosenCard.id === 'safecracker' && counts.safecracker > 1) || 
          (p.chosenCard.id === 'catburglar' && counts.catburglar > 1)) {
        const seat = document.getElementById(`seat_${p.id}`);
        if (seat) seat.classList.add('alarm-collision');
      }
    });
  }

  // 1. SAFECRACKER: +3 Gold if alone
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'safecracker') {
      if (counts.safecracker === 1) {
        const stolen = Math.min(3, gameState.vaultGold);
        gameState.vaultGold -= stolen;
        p.looseGold += stolen;
        p.lastGains += stolen;
      }
    }
  });

  // 2. CAT BURGLAR: +5 Gold if alone
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'catburglar') {
      if (counts.catburglar === 1) {
        const stolen = Math.min(5, gameState.vaultGold);
        gameState.vaultGold -= stolen;
        p.looseGold += stolen;
        p.lastGains += stolen;
      }
    }
  });

  // 3. PICKPOCKET: Snatch half of target's gains this round
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'pickpocket' && p.chosenTarget !== null) {
      const victim = gameState.players.find(x => x.id === p.chosenTarget);
      if (victim && victim.lastGains > 0) {
        const snatched = Math.ceil(victim.lastGains / 2);
        victim.looseGold -= snatched;
        p.looseGold += snatched;
        showToast("Pickpocketed!", `${p.name} snatched 💰 ${snatched} Gold from ${victim.name}!`, "🥷");
      }
    }
  });

  // 4. HACKER: Steal 1 gold from every player who scored
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'hacker') {
      let drained = 0;
      gameState.players.forEach(other => {
        if (other.id !== p.id && other.lastGains > 0 && other.looseGold > 0) {
          other.looseGold--;
          p.looseGold++;
          drained++;
        }
      });
      if (drained > 0) {
        showToast("EMP Drained!", `${p.name} siphoned 💰 ${drained} Gold with an EMP blast!`, "⚡");
      }
    }
  });

  // 5. THE SNITCH: SWAT Bounty if collisions occurred
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'snitch') {
      if (collisionCount >= 2) {
        p.looseGold += 4;
        showToast("SWAT Bounty!", `🚨 ${p.name} tipped off SWAT during the vault collision and claimed +4 Gold bounty!`, "👮");
      }
    }
  });

  // 6. GETAWAY DRIVER: Bank loose gold into permanent safehouse
  gameState.players.forEach(p => {
    if (p.chosenCard.id === 'getaway') {
      if (p.looseGold > 0) {
        p.bankedGold += p.looseGold;
        const bankedAmount = p.looseGold;
        p.looseGold = 0;
        if (p.id === gameState.myPlayerIdx) {
          playSound('bank');
          showToast("Loot Secured!", `🏦 You successfully banked 💰 ${bankedAmount} Gold into your safehouse!`, "🔒");
        }
      }
    }
  });

  setTimeout(() => {
    playSound('coin');
    renderSeatsLayout();
    renderHandCards();
    updateVaultDisplay();

    // Check Victory Condition
    checkRoundEndOrVictory();
  }, 1600);
}

// Vault & Round UI
function updateVaultDisplay() {
  document.getElementById('vaultGoldCount').textContent = `💰 ${gameState.vaultGold} Gold`;
  document.getElementById('roundTrackerText').textContent = `Round ${gameState.round} / ${gameState.maxRounds}`;
}

// Round Advance / Victory Check
function checkRoundEndOrVictory() {
  // Check if anyone hit 15+ Banked Gold
  const winner = gameState.players.find(p => p.bankedGold >= 15);

  if (winner || gameState.round >= gameState.maxRounds || gameState.vaultGold <= 0) {
    endHeistGame();
    return;
  }

  // Advance to next round
  gameState.round++;
  gameState.isResolving = false;
  gameState.selectedAction = null;
  gameState.selectedTarget = null;

  gameState.players.forEach(p => {
    p.chosenCard = null;
    p.chosenTarget = null;
  });

  const statusBadge = document.getElementById('selectionStatusBadge');
  statusBadge.textContent = "Select Your Move";
  statusBadge.style.color = '#fbbf24';
  statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';

  document.getElementById('centerAnnouncement').innerHTML = `Round ${gameState.round} begun! Pick your next secret move.`;

  renderSeatsLayout();
  renderHandCards();
  updateVaultDisplay();
}

// Final Game Over Scoreboard
function endHeistGame() {
  gameState.gameOver = true;

  // Calculate final net worth: Banked Gold (Full 100%) + Loose Gold (50% value due to risk)
  gameState.players.forEach(p => {
    p.finalScore = p.bankedGold + Math.floor(p.looseGold * 0.5);
  });

  gameState.players.sort((a, b) => b.finalScore - a.finalScore);
  const grandWinner = gameState.players[0];

  const modal = document.getElementById('victoryModal');
  const title = document.getElementById('victoryTitle');
  const sub = document.getElementById('victorySubtitle');
  const scoreList = document.getElementById('victoryScoreList');
  scoreList.innerHTML = '';

  title.textContent = `${grandWinner.name.toUpperCase()} ESCAPED!`;
  sub.textContent = `${grandWinner.name} escaped the casino vault with the greatest fortune!`;

  gameState.players.forEach((p, rank) => {
    const row = document.createElement('div');
    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; font-weight:700;";
    row.innerHTML = `
      <span>${rank === 0 ? '👑' : `#${rank + 1}`} ${p.name}</span>
      <span style="color:#fbbf24;">${p.finalScore} Net Worth (🏦 ${p.bankedGold} Banked + 💰 ${p.looseGold} Loose)</span>
    `;
    scoreList.appendChild(row);
  });

  modal.style.display = 'flex';
}

document.getElementById('vicPlayAgainBtn').addEventListener('click', () => {
  document.getElementById('victoryModal').style.display = 'none';
  initGameSession(gameState.playerCount, gameState.players[0].name);
});

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

// Rules & Lobby Setup
const rulesModal = document.getElementById('rulesModal');
document.getElementById('openRulesBtn').addEventListener('click', () => rulesModal.style.display = 'flex');
document.getElementById('closeRulesBtn').addEventListener('click', () => rulesModal.style.display = 'none');

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

let selectedAICount = 4;
document.querySelectorAll('.playerCountBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.playerCountBtn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = 'var(--border-color)';
    });
    btn.classList.add('active');
    btn.style.borderColor = '#fbbf24';
    selectedAICount = parseInt(btn.dataset.count, 10);
  });
});

document.getElementById('startAIBtn').addEventListener('click', () => {
  const nick = document.getElementById('playerNameInput').value.trim() || 'Mastermind';
  gameState.mode = 'ai';
  lobbyModal.style.display = 'none';
  initGameSession(selectedAICount, nick);
});

// P2P Multiplayer (MultiPeerEngine)
let multiPeer = null;

document.getElementById('hostRoomBtn').addEventListener('click', () => {
  const nick = document.getElementById('playerNameInput').value.trim() || 'Mastermind Host';
  gameState.mode = 'p2p';
  gameState.myPlayerIdx = 0;

  multiPeer = new MultiPeerEngine({
    gamePrefix: 'heistroyale',
    onStatus: (msg) => {
      const b = document.getElementById('connectedPlayersBadge');
      if (b) b.textContent = msg;
    },
    onPlayerJoin: (client) => {
      showToast("Rogue Infiltrated!", `${client.name || 'Rogue'} joined the heist crew!`, "👋");
    },
    onData: (data) => {
      if (data.type === 'SYNC_STATE') {
        gameState = data.state;
        renderSeatsLayout();
        renderHandCards();
        updateVaultDisplay();
      }
    }
  });

  const code = multiPeer.initHost();
  document.getElementById('hostWaitingArea').style.display = 'block';
  const fullUrl = `${window.location.origin}${window.location.pathname}?room=${code}`;
  document.getElementById('shareLinkInput').value = fullUrl;
});

document.getElementById('startMultiplayerBtn').addEventListener('click', () => {
  const nick = document.getElementById('playerNameInput').value.trim() || 'Mastermind Host';
  lobbyModal.style.display = 'none';
  initGameSession(4, nick);
  if (multiPeer) {
    multiPeer.broadcast({ type: 'SYNC_STATE', state: gameState });
  }
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
  const code = document.getElementById('joinRoomInput').value.trim();
  const nick = document.getElementById('playerNameInput').value.trim() || 'Guest Rogue';
  if (!code) {
    alert("Please enter a room code!");
    return;
  }
  gameState.mode = 'p2p';
  multiPeer = new MultiPeerEngine({
    gamePrefix: 'heistroyale',
    onStatus: (msg) => {
      document.getElementById('joinStatusText').textContent = msg;
    },
    onData: (data) => {
      if (data.type === 'SYNC_STATE') {
        lobbyModal.style.display = 'none';
        gameState = data.state;
        renderSeatsLayout();
        renderHandCards();
        updateVaultDisplay();
      }
    }
  });
  multiPeer.initJoin(code, nick);
});

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    lobbyModal.style.display = 'flex';
    switchTab('join');
    document.getElementById('joinRoomInput').value = room;
  } else {
    initGameSession(4, 'Mastermind');
  }
});
