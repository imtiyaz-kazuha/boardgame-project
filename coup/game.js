/**
 * Coup: Dystopian Syndicate Engine (2 to 6 Players)
 * Full Game Loop with Autonomous Bluffing/Challenging Bots,
 * P2P WebRTC Multi-Peer Sync, Circular Table Layout & Canvas VFX.
 */

// 5 Cyberpunk Syndicate Character Definitions
const ROLES = {
  DUKE: {
    key: 'duke',
    name: 'Duke',
    icon: '👑',
    cardClass: 'card-duke',
    action: 'Tax (+3 coins)',
    blocks: 'Foreign Aid',
    desc: 'Takes 3 coins from Treasury. Blocks Foreign Aid.'
  },
  ASSASSIN: {
    key: 'assassin',
    name: 'Assassin',
    icon: '🗡️',
    cardClass: 'card-assassin',
    action: 'Assassinate (Pay 3c)',
    blocks: 'None',
    desc: 'Pays 3 coins to assassinate another player\'s influence.'
  },
  CAPTAIN: {
    key: 'captain',
    name: 'Captain',
    icon: '📜',
    cardClass: 'card-captain',
    action: 'Steal 2 coins',
    blocks: 'Stealing',
    desc: 'Steals 2 coins from a target player. Blocks Stealing.'
  },
  AMBASSADOR: {
    key: 'ambassador',
    name: 'Ambassador',
    icon: '🔍',
    cardClass: 'card-ambassador',
    action: 'Exchange 2 cards',
    blocks: 'Stealing',
    desc: 'Draws 2 cards from deck, keeps preferred cards. Blocks Stealing.'
  },
  CONTESSA: {
    key: 'contessa',
    name: 'Contessa',
    icon: '🛡️',
    cardClass: 'card-contessa',
    action: 'None (Defensive)',
    blocks: 'Assassination',
    desc: 'Blocks assassination attempts on yourself.'
  }
};

// 15-Card Master Deck (3 of each role)
function createCoupDeck() {
  const deck = [];
  const roles = [ROLES.DUKE, ROLES.ASSASSIN, ROLES.CAPTAIN, ROLES.AMBASSADOR, ROLES.CONTESSA];
  roles.forEach(role => {
    for (let i = 0; i < 3; i++) {
      deck.push({ ...role, id: `${role.key}_${i}` });
    }
  });
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// Game State Object
let coupState = {
  mode: 'bots', // 'bots' or 'p2p'
  myPlayerIdx: 0,
  currentTurn: 0,
  treasury: 50,
  deck: [],
  players: [], // Array of { id, name, isBot, coins, cards: [{...role, isAlive: true}] }
  winner: null,
  pendingAction: null, // { actorIdx, actionType, targetIdx, claimedRole, blockedBy: null, blockRole: null }
  reactionState: null // { stage: 'action_challenge_or_block' | 'block_challenge', timeoutId }
};

let vfxCanvas, vfxCtx;
let activeParticles = [];
let peerEngine = null;

// Audio Sound Synthesis using Web Audio API (Zero downloads / Zero latency)
let audioCtx = null;
function playSound(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.12); // E6
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.18);
    } else if (type === 'slash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.setValueAtTime(900, t + 0.08);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  } catch (e) {
    // Audio context allowed after user gesture
  }
}

// Initialize Coup
function initCoup() {
  vfxCanvas = document.getElementById('vfxCanvas');
  vfxCtx = vfxCanvas.getContext('2d');
  resizeVfxCanvas();
  window.addEventListener('resize', resizeVfxCanvas);

  setupUIEventListeners();
  startVfxLoop();

  // Start with default 6 players (1 human + 5 bots)
  startMatch(6, 1);
}

function resizeVfxCanvas() {
  const container = document.querySelector('.table-viewport');
  if (container && vfxCanvas) {
    vfxCanvas.width = container.clientWidth;
    vfxCanvas.height = container.clientHeight;
  }
}

// Start New Match
function startMatch(totalPlayers = 6, humanCount = 1) {
  const deck = createCoupDeck();
  const nick = document.getElementById('nicknameInput').value.trim() || 'Agent-1';

  coupState.treasury = 50 - (totalPlayers * 2);
  coupState.deck = deck;
  coupState.currentTurn = 0;
  coupState.winner = null;
  coupState.pendingAction = null;
  coupState.reactionState = null;

  const botNames = ['NeonCipher', 'ViperX', 'BaronBlade', 'GhostOperative', 'NyxSyndicate'];

  coupState.players = [];
  for (let i = 0; i < totalPlayers; i++) {
    const isHuman = (i < humanCount);
    const pName = (i === 0) ? nick : (isHuman ? `Agent-${i + 1}` : botNames[(i - 1) % botNames.length]);
    const card1 = { ...coupState.deck.pop(), isAlive: true };
    const card2 = { ...coupState.deck.pop(), isAlive: true };

    coupState.players.push({
      id: i,
      name: pName,
      isBot: !isHuman,
      coins: 2,
      cards: [card1, card2]
    });
  }

  renderTableLayout();
  renderMyHand();
  updateCommandControls();

  const activeP = coupState.players[coupState.currentTurn];
  setCenterPrompt(`Match initiated! It is <strong>${activeP.name}</strong>'s turn.`);

  if (activeP.isBot) {
    setTimeout(handleBotTurn, 900);
  }
}

// Render 6-Player Circle Table Layout
function renderTableLayout() {
  const container = document.getElementById('seatsContainer');
  container.innerHTML = '';

  const table = document.getElementById('circleTable');
  const radiusX = table.clientWidth / 2 + 15;
  const radiusY = table.clientHeight / 2 + 5;
  const cx = table.clientWidth / 2;
  const cy = table.clientHeight / 2;

  // Active rival opponents (excluding player 0 / me, who is in bottom dock)
  const otherPlayers = coupState.players.filter(p => p.id !== 0);
  const totalOthers = otherPlayers.length;

  otherPlayers.forEach((p, index) => {
    // Distribute rival seats along the top/side arc of the table (from 170 deg to 10 deg)
    // Avoid placing any seat at bottom (90 deg) where player 0's hand dock is!
    const startAngle = Math.PI * 0.95; // Left-mid
    const endAngle = Math.PI * 0.05;   // Right-mid
    
    // Spread evenly across top arc
    const angle = totalOthers === 1 ? -Math.PI / 2 : startAngle + index * ((2 * Math.PI - (startAngle - endAngle)) / (totalOthers - 1));

    const x = cx + radiusX * Math.cos(angle) - 70; // 70 = half width of seat
    const y = cy + radiusY * Math.sin(angle) - 45;

    const seat = document.createElement('div');
    seat.id = `seat_${p.id}`;
    seat.className = `player-seat ${isPlayerDead(p) ? 'seat-dead' : ''}`;
    seat.style.left = `${x}px`;
    seat.style.top = `${y}px`;

    const isCurrent = (coupState.currentTurn === p.id && !coupState.winner);

    let cardsHtml = '';
    p.cards.forEach(c => {
      if (c.isAlive) {
        cardsHtml += `<div class="card-mini" title="Active Hidden Card">🂠</div>`;
      } else {
        cardsHtml += `<div class="card-mini card-mini-dead" title="${c.name} (Eliminated)">${c.icon}</div>`;
      }
    });

    seat.innerHTML = `
      <div class="seat-badge ${isCurrent ? 'seat-active' : ''}">
        <div class="seat-name" style="color:#f8fafc;">
          ${p.name} ${p.isBot ? '<span style="font-size:0.68rem; color:#94a3b8;">🤖</span>' : ''}
        </div>
        <div class="seat-coins">🪙 ${p.coins} Coins</div>
      </div>
      <div class="seat-cards-row">
        ${cardsHtml}
      </div>
    `;

    container.appendChild(seat);
  });

  document.getElementById('treasuryCoinsCount').textContent = coupState.treasury;
}

// Render Human Player's Hand Cards (Bottom Dock)
function renderMyHand() {
  const container = document.getElementById('myHandCards');
  container.innerHTML = '';

  const me = coupState.players[coupState.myPlayerIdx];
  if (!me) return;

  document.getElementById('myPlayerLabel').textContent = me.name;
  document.getElementById('myCoinBadge').textContent = `🪙 ${me.coins} Coins`;

  me.cards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `character-card ${card.cardClass} ${card.isAlive ? '' : 'card-eliminated'}`;

    cardEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; font-weight:800; color:#fbbf24;">INFLUENCE</span>
        <span style="font-size:0.75rem;">${card.isAlive ? 'ACTIVE' : 'DEAD'}</span>
      </div>
      <div class="card-portrait">${card.icon}</div>
      <div>
        <div class="card-title">${card.name}</div>
        <div class="card-power">${card.action}</div>
      </div>
    `;

    container.appendChild(cardEl);
  });
}

// Update Active Command Console Buttons
function updateCommandControls() {
  const me = coupState.players[coupState.myPlayerIdx];
  const isMyTurn = (coupState.currentTurn === coupState.myPlayerIdx) && !isPlayerDead(me) && !coupState.winner && !coupState.pendingAction;

  const btnIncome = document.getElementById('actIncome');
  const btnAid = document.getElementById('actForeignAid');
  const btnTax = document.getElementById('actTax');
  const btnSteal = document.getElementById('actSteal');
  const btnAssassinate = document.getElementById('actAssassinate');
  const btnExchange = document.getElementById('actExchange');
  const btnCoup = document.getElementById('actCoup');

  if (!isMyTurn) {
    [btnIncome, btnAid, btnTax, btnSteal, btnAssassinate, btnExchange, btnCoup].forEach(b => b.disabled = true);
    return;
  }

  // Mandatory Coup Rule: If you hold 10 or more coins, you MUST launch Coup
  if (me.coins >= 10) {
    [btnIncome, btnAid, btnTax, btnSteal, btnAssassinate, btnExchange].forEach(b => b.disabled = true);
    btnCoup.disabled = false;
    showToast("Mandatory Coup!", "You hold 10+ coins. You MUST launch a Coup!", "💥");
    return;
  }

  btnIncome.disabled = false;
  btnAid.disabled = false;
  btnTax.disabled = false;
  btnSteal.disabled = (getActiveOpponents(coupState.myPlayerIdx).length === 0);
  btnAssassinate.disabled = (me.coins < 3 || getActiveOpponents(coupState.myPlayerIdx).length === 0);
  btnExchange.disabled = false;
  btnCoup.disabled = (me.coins < 7 || getActiveOpponents(coupState.myPlayerIdx).length === 0);
}

function isPlayerDead(player) {
  return player.cards.every(c => !c.isAlive);
}

function getActiveOpponents(playerIdx) {
  return coupState.players.filter(p => p.id !== playerIdx && !isPlayerDead(p));
}

// ==========================================
// CORE GAME ACTIONS & BLUFFING ENGINE
// ==========================================

function executeActionPrompt(actorIdx, actionType, targetIdx = null) {
  const actor = coupState.players[actorIdx];
  let claimedRole = null;
  let canBeBlocked = false;
  let canBeChallenged = false;

  if (actionType === 'income') {
    actor.coins += 1;
    coupState.treasury -= 1;
    playSound('coin');
    spawnCoinsVFX(actorIdx, 1);
    showToast("Income", `${actor.name} collected 1 Income coin.`, "🪙");
    setCenterPrompt(`<strong>${actor.name}</strong> took 1 Income coin.`);
    finishActionTurn();
    return;
  }

  if (actionType === 'foreign_aid') {
    canBeBlocked = true; // Any player claiming Duke can block
    setCenterPrompt(`<strong>${actor.name}</strong> declared Foreign Aid (+2 coins).`);
  } else if (actionType === 'tax') {
    claimedRole = ROLES.DUKE;
    canBeChallenged = true;
    setCenterPrompt(`<strong>${actor.name}</strong> claims Duke to take 3 Tax coins.`);
  } else if (actionType === 'steal') {
    claimedRole = ROLES.CAPTAIN;
    canBeChallenged = true;
    canBeBlocked = true; // Target can claim Captain or Ambassador
    const target = coupState.players[targetIdx];
    setCenterPrompt(`<strong>${actor.name}</strong> claims Captain to steal 2 coins from <strong>${target.name}</strong>.`);
  } else if (actionType === 'assassinate') {
    claimedRole = ROLES.ASSASSIN;
    canBeChallenged = true;
    canBeBlocked = true; // Target can claim Contessa
    actor.coins -= 3;
    coupState.treasury += 3;
    const target = coupState.players[targetIdx];
    setCenterPrompt(`<strong>${actor.name}</strong> pays 3 coins and claims Assassin targeting <strong>${target.name}</strong>!`);
  } else if (actionType === 'exchange') {
    claimedRole = ROLES.AMBASSADOR;
    canBeChallenged = true;
    setCenterPrompt(`<strong>${actor.name}</strong> claims Ambassador to exchange influence cards.`);
  } else if (actionType === 'coup') {
    actor.coins -= 7;
    coupState.treasury += 7;
    playSound('slash');
    const target = coupState.players[targetIdx];
    spawnAttackVFX(actorIdx, targetIdx, '#ef4444');
    setCenterPrompt(`💥 <strong>${actor.name}</strong> launched an unblockable Coup on <strong>${target.name}</strong>!`);
    showToast("COUP LAUNCHED!", `${actor.name} launched a Coup against ${target.name}!`, "💥");

    // Force target to eliminate a card
    triggerCardLoss(targetIdx, () => {
      finishActionTurn();
    });
    return;
  }

  // Record pending action for Challenge / Block reaction window
  coupState.pendingAction = {
    actorIdx,
    actionType,
    targetIdx,
    claimedRole,
    canBeBlocked,
    canBeChallenged,
    blockedBy: null,
    blockRole: null
  };

  startReactionPhase('action_challenge_or_block');
}

// Start Reaction Window (Challenge or Block)
function startReactionPhase(stage) {
  coupState.reactionState = { stage };
  const action = coupState.pendingAction;
  const actor = coupState.players[action.actorIdx];
  const me = coupState.players[coupState.myPlayerIdx];
  const amIAlive = !isPlayerDead(me);

  const banner = document.getElementById('reactionBanner');
  const btnChallenge = document.getElementById('btnChallenge');
  const btnBlock = document.getElementById('btnBlock');
  const btnPass = document.getElementById('btnPass');

  // Human reaction banner visibility
  if (amIAlive && action.actorIdx !== coupState.myPlayerIdx) {
    banner.style.display = 'flex';

    if (stage === 'action_challenge_or_block') {
      document.getElementById('reactionTitle').textContent = `Reaction to ${actor.name}'s ${action.actionType.toUpperCase()}`;
      btnChallenge.style.display = action.canBeChallenged ? 'inline-flex' : 'none';

      // Can I block?
      let canIBlock = false;
      if (action.actionType === 'foreign_aid') canIBlock = true; // Anyone can claim Duke
      if (action.actionType === 'steal' && action.targetIdx === coupState.myPlayerIdx) canIBlock = true; // Target can claim Captain/Ambassador
      if (action.actionType === 'assassinate' && action.targetIdx === coupState.myPlayerIdx) canIBlock = true; // Target can claim Contessa

      btnBlock.style.display = canIBlock ? 'inline-flex' : 'none';
    } else if (stage === 'block_challenge') {
      const blocker = coupState.players[action.blockedBy];
      document.getElementById('reactionTitle').textContent = `${blocker.name} claims ${action.blockRole.name} to BLOCK!`;
      btnChallenge.style.display = 'inline-flex';
      btnBlock.style.display = 'none';
    }
  } else {
    banner.style.display = 'none';
  }

  // Trigger Autonomous Bots Reaction checks
  evaluateBotReactions(stage);
}

// Autonomous Bot Reaction Evaluation
function evaluateBotReactions(stage) {
  const action = coupState.pendingAction;
  const livingBots = coupState.players.filter(p => p.isBot && !isPlayerDead(p) && p.id !== action.actorIdx);

  // Short thinking timer for reactions
  setTimeout(() => {
    if (!coupState.pendingAction) return;

    if (stage === 'action_challenge_or_block') {
      // 1. Check if any bot wants to challenge the action
      for (const bot of livingBots) {
        if (action.canBeChallenged && botDecidesToChallenge(bot, action.claimedRole)) {
          resolveChallenge(bot.id, action.actorIdx, action.claimedRole, () => {
            // Action failed due to successful challenge
            finishActionTurn();
          }, () => {
            // Action verified, continue to resolve
            applyActionEffect(action);
          });
          return;
        }
      }

      // 2. Check if a valid bot wants to BLOCK the action
      for (const bot of livingBots) {
        if (action.canBeBlocked) {
          const blockRole = botDecidesToBlock(bot, action);
          if (blockRole) {
            declareBlock(bot.id, blockRole);
            return;
          }
        }
      }

      // If no human response after 3 seconds and no bot reacted, auto-pass
      if (action.actorIdx !== coupState.myPlayerIdx) {
        // Human had a chance; bot will auto-resolve if no interaction
      }
    } else if (stage === 'block_challenge') {
      // Check if any bot challenges the blocker
      for (const bot of livingBots) {
        if (bot.id !== action.blockedBy && botDecidesToChallenge(bot, action.blockRole)) {
          resolveChallenge(bot.id, action.blockedBy, action.blockRole, () => {
            // Blocker lied! Block fails, action succeeds!
            showToast("Blocker Caught!", `${coupState.players[action.blockedBy].name} was caught bluffing their block!`, "💥");
            applyActionEffect(action);
          }, () => {
            // Blocker told truth! Block holds, action negated!
            showToast("Block Succeeded!", `${coupState.players[action.blockedBy].name} proved their block! Action blocked.`, "🛡️");
            finishActionTurn();
          });
          return;
        }
      }
    }
  }, 1200);
}

// Bot Challenge Heuristic (Probabilistic)
function botDecidesToChallenge(bot, claimedRole) {
  if (!claimedRole) return false;
  // Count how many copies of this role the bot itself holds
  const myCopies = bot.cards.filter(c => c.key === claimedRole.key).length;
  // If bot holds 2 copies or 3 copies, chance of opponent holding one is near zero!
  if (myCopies >= 2) return Math.random() < 0.85;
  if (myCopies === 1) return Math.random() < 0.22;
  // Small random skeptic bluff-call
  return Math.random() < 0.08;
}

// Bot Block Decision Heuristic
function botDecidesToBlock(bot, action) {
  // Foreign Aid block: Claim Duke
  if (action.actionType === 'foreign_aid') {
    const hasDuke = bot.cards.some(c => c.isAlive && c.key === 'duke');
    if (hasDuke || Math.random() < 0.35) return ROLES.DUKE;
  }
  // Steal block: Target claims Captain or Ambassador
  if (action.actionType === 'steal' && action.targetIdx === bot.id) {
    const hasShield = bot.cards.some(c => c.isAlive && (c.key === 'captain' || c.key === 'ambassador'));
    if (hasShield) return ROLES.CAPTAIN;
    if (Math.random() < 0.5) return ROLES.CAPTAIN; // Defensive bluff
  }
  // Assassination block: Target claims Contessa
  if (action.actionType === 'assassinate' && action.targetIdx === bot.id) {
    const hasContessa = bot.cards.some(c => c.isAlive && c.key === 'contessa');
    if (hasContessa) return ROLES.CONTESSA;
    if (Math.random() < 0.75) return ROLES.CONTESSA; // Desperate bluff to survive!
  }
  return null;
}

// Declare a Block
function declareBlock(blockerIdx, blockRole) {
  playSound('alert');
  const action = coupState.pendingAction;
  action.blockedBy = blockerIdx;
  action.blockRole = blockRole;

  const blocker = coupState.players[blockerIdx];
  showToast("SHIELD DECLARED!", `${blocker.name} claims ${blockRole.name} to BLOCK the action!`, "🛡️");
  setCenterPrompt(`🛡️ <strong>${blocker.name}</strong> declared block claiming <strong>${blockRole.name}</strong>! Anyone challenge?`);

  spawnShieldVFX(blockerIdx);

  // Transition to Block Challenge window
  startReactionPhase('block_challenge');
}

// Resolve a Challenge (challenger vs claimant)
function resolveChallenge(challengerIdx, claimantIdx, claimedRole, onLieSuccess, onTruthSuccess) {
  const challenger = coupState.players[challengerIdx];
  const claimant = coupState.players[claimantIdx];

  playSound('alert');
  showToast("⚔️ CHALLENGE!", `${challenger.name} challenged ${claimant.name}'s claim of ${claimedRole.name}!`, "⚔️");
  setCenterPrompt(`⚔️ <strong>${challenger.name}</strong> CHALLENGED <strong>${claimant.name}</strong>'s ${claimedRole.name}!`);

  const hasRealCard = claimant.cards.some(c => c.isAlive && c.key === claimedRole.key);

  setTimeout(() => {
    if (hasRealCard) {
      // CLAIMANT WAS TELLING THE TRUTH!
      // Claimant reveals card, shuffles into court deck, and draws a fresh card!
      showToast("TRUTH PROVED!", `${claimant.name} revealed a real ${claimedRole.name}! ${challenger.name} loses influence!`, "✨");

      // Swap claimant card for fresh one from deck
      const realIdx = claimant.cards.findIndex(c => c.isAlive && c.key === claimedRole.key);
      const returned = claimant.cards[realIdx];
      coupState.deck.push(returned);
      coupState.deck = shuffleDeck(coupState.deck);
      claimant.cards[realIdx] = { ...coupState.deck.pop(), isAlive: true };

      renderMyHand();

      // Challenger loses an influence card!
      triggerCardLoss(challengerIdx, () => {
        onTruthSuccess();
      });
    } else {
      // CLAIMANT WAS BLUFFING / LYING!
      showToast("BLUFF CAUGHT!", `${claimant.name} was CAUGHT LYING! They lose influence!`, "💥");

      // Claimant loses an influence card!
      triggerCardLoss(claimantIdx, () => {
        onLieSuccess();
      });
    }
  }, 1000);
}

// Apply Action Effect once permitted
function applyActionEffect(action) {
  const actor = coupState.players[action.actorIdx];

  if (action.actionType === 'foreign_aid') {
    actor.coins += 2;
    coupState.treasury -= 2;
    playSound('coin');
    spawnCoinsVFX(action.actorIdx, 2);
    showToast("Foreign Aid Granted", `${actor.name} received 2 coins.`, "💰");
    finishActionTurn();
  } else if (action.actionType === 'tax') {
    actor.coins += 3;
    coupState.treasury -= 3;
    playSound('coin');
    spawnCoinsVFX(action.actorIdx, 3);
    showToast("Tax Collected", `${actor.name} collected 3 Duke coins.`, "👑");
    finishActionTurn();
  } else if (action.actionType === 'steal') {
    const target = coupState.players[action.targetIdx];
    const stolen = Math.min(2, target.coins);
    target.coins -= stolen;
    actor.coins += stolen;
    playSound('coin');
    spawnCoinsVFX(action.actorIdx, stolen);
    showToast("Coins Stolen", `${actor.name} stole ${stolen} coins from ${target.name}!`, "📜");
    finishActionTurn();
  } else if (action.actionType === 'assassinate') {
    const target = coupState.players[action.targetIdx];
    playSound('slash');
    spawnAttackVFX(action.actorIdx, action.targetIdx, '#f87171');
    showToast("Assassination Successful!", `${target.name}'s influence was eliminated by ${actor.name}!`, "🗡️");
    triggerCardLoss(action.targetIdx, () => {
      finishActionTurn();
    });
  } else if (action.actionType === 'exchange') {
    if (action.actorIdx === coupState.myPlayerIdx) {
      openAmbassadorModal();
    } else {
      // Bot ambassador: randomly swaps with court deck
      const bot = actor;
      const drawn = [coupState.deck.pop(), coupState.deck.pop()];
      const pool = [...bot.cards.filter(c => c.isAlive), ...drawn];
      // Keep best cards
      const kept = pool.slice(0, bot.cards.filter(c => c.isAlive).length);
      const returned = pool.slice(bot.cards.filter(c => c.isAlive).length);
      returned.forEach(c => coupState.deck.push(c));
      coupState.deck = shuffleDeck(coupState.deck);

      let aliveIdx = 0;
      bot.cards.forEach((c, idx) => {
        if (c.isAlive) {
          bot.cards[idx] = { ...kept[aliveIdx++], isAlive: true };
        }
      });
      showToast("Ambassador Exchange", `${bot.name} exchanged influence cards with the court deck.`, "🔍");
      finishActionTurn();
    }
  }
}

// Trigger Loss of 1 Influence Card
function triggerCardLoss(playerIdx, callback) {
  const p = coupState.players[playerIdx];
  const livingCards = p.cards.filter(c => c.isAlive);

  if (livingCards.length === 0) {
    if (callback) callback();
    return;
  }

  // If only 1 living card, auto-eliminate it
  if (livingCards.length === 1) {
    livingCards[0].isAlive = false;
    onCardEliminated(playerIdx, livingCards[0], callback);
    return;
  }

  // Human player gets choice modal
  if (playerIdx === coupState.myPlayerIdx) {
    openCardLossModal(callback);
  } else {
    // Bot selects a card to lose (sacrifices duplicate or lower value)
    livingCards[0].isAlive = false;
    onCardEliminated(playerIdx, livingCards[0], callback);
  }
}

function onCardEliminated(playerIdx, deadCard, callback) {
  const p = coupState.players[playerIdx];
  playSound('slash');
  showToast("INFLUENCE LOST!", `${p.name} lost their ${deadCard.name}!`, "☠️");

  if (isPlayerDead(p)) {
    showToast("PLAYER ELIMINATED!", `☠️ ${p.name} has been completely eliminated from the syndicate!`, "🩸");
  }

  renderTableLayout();
  renderMyHand();
  checkVictory();

  if (callback) setTimeout(callback, 800);
}

// Finish Current Turn & Pass to Next Living Player
function finishActionTurn() {
  document.getElementById('reactionBanner').style.display = 'none';
  coupState.pendingAction = null;
  coupState.reactionState = null;

  renderTableLayout();
  renderMyHand();

  if (checkVictory()) return;

  // Next active turn
  do {
    coupState.currentTurn = (coupState.currentTurn + 1) % coupState.players.length;
  } while (isPlayerDead(coupState.players[coupState.currentTurn]));

  renderTableLayout();
  updateCommandControls();

  const nextP = coupState.players[coupState.currentTurn];
  setCenterPrompt(`It is <strong>${nextP.name}</strong>'s turn.`);

  if (nextP.isBot) {
    setTimeout(handleBotTurn, 1000);
  }
}

// Autonomous Bot Turn Decision Making
function handleBotTurn() {
  if (coupState.winner || coupState.pendingAction) return;
  const botIdx = coupState.currentTurn;
  const bot = coupState.players[botIdx];
  if (isPlayerDead(bot)) return;

  const opponents = getActiveOpponents(botIdx);
  if (opponents.length === 0) return;

  // Sort opponents by coin threat (target wealthiest rival)
  opponents.sort((a, b) => b.coins - a.coins);
  const primeTarget = opponents[0].id;

  // 1. Mandatory Coup on 10+ coins
  if (bot.coins >= 10) {
    executeActionPrompt(botIdx, 'coup', primeTarget);
    return;
  }

  // 2. Launch Coup on 7+ coins (65% chance)
  if (bot.coins >= 7 && Math.random() < 0.65) {
    executeActionPrompt(botIdx, 'coup', primeTarget);
    return;
  }

  // 3. Assassinate on 3+ coins
  if (bot.coins >= 3 && (bot.cards.some(c => c.isAlive && c.key === 'assassin') || Math.random() < 0.35)) {
    executeActionPrompt(botIdx, 'assassinate', primeTarget);
    return;
  }

  // 4. Steal (Captain)
  if (bot.cards.some(c => c.isAlive && c.key === 'captain') || Math.random() < 0.3) {
    executeActionPrompt(botIdx, 'steal', primeTarget);
    return;
  }

  // 5. Duke Tax (+3)
  if (bot.cards.some(c => c.isAlive && c.key === 'duke') || Math.random() < 0.4) {
    executeActionPrompt(botIdx, 'tax');
    return;
  }

  // 6. Foreign Aid
  if (Math.random() < 0.5) {
    executeActionPrompt(botIdx, 'foreign_aid');
    return;
  }

  // Fallback: Safe Income
  executeActionPrompt(botIdx, 'income');
}

// Check Victory Condition (Last player alive)
function checkVictory() {
  const living = coupState.players.filter(p => !isPlayerDead(p));
  if (living.length === 1) {
    coupState.winner = living[0].id;
    const winner = living[0];
    showToast("👑 SYNDICATE WON!", `${winner.name} eliminated all rivals and seized total control of the syndicate!`, "🏆");

    const modal = document.getElementById('victoryModal');
    document.getElementById('victoryWinnerTitle').textContent = `${winner.name} Reigns Supreme!`;
    document.getElementById('victoryWinnerSubtitle').textContent = `With unmatched cunning and deception, ${winner.name} eliminated all other syndicate agents!`;
    modal.style.display = 'flex';
    spawnVictoryConfetti();
    return true;
  }
  return false;
}

// Ambassador Modal Logic
function openAmbassadorModal() {
  const modal = document.getElementById('exchangeModal');
  const container = document.getElementById('exchangeCardsContainer');
  const btn = document.getElementById('confirmExchangeBtn');
  container.innerHTML = '';

  const me = coupState.players[coupState.myPlayerIdx];
  const livingCards = me.cards.filter(c => c.isAlive);
  const neededKeepCount = livingCards.length;
  document.getElementById('keepCountLabel').textContent = neededKeepCount;

  // Draw 2 new cards from deck
  const drawn = [coupState.deck.pop(), coupState.deck.pop()];
  const allPool = [...livingCards, ...drawn];
  const selectedCards = [];

  allPool.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `character-card ${card.cardClass}`;
    cardEl.style.cursor = 'pointer';
    cardEl.innerHTML = `
      <div style="font-size:0.75rem; font-weight:800; color:#fbbf24;">SELECT TO KEEP</div>
      <div class="card-portrait">${card.icon}</div>
      <div class="card-title">${card.name}</div>
    `;

    cardEl.addEventListener('click', () => {
      const foundIdx = selectedCards.indexOf(card);
      if (foundIdx >= 0) {
        selectedCards.splice(foundIdx, 1);
        cardEl.style.transform = 'none';
        cardEl.style.borderColor = 'rgba(255,255,255,0.15)';
      } else {
        if (selectedCards.length < neededKeepCount) {
          selectedCards.push(card);
          cardEl.style.transform = 'translateY(-10px)';
          cardEl.style.borderColor = '#34d399';
        }
      }
      btn.disabled = (selectedCards.length !== neededKeepCount);
    });

    container.appendChild(cardEl);
  });

  btn.onclick = () => {
    // Return non-selected cards to court deck
    allPool.forEach(c => {
      if (!selectedCards.includes(c)) coupState.deck.push(c);
    });
    coupState.deck = shuffleDeck(coupState.deck);

    // Apply kept cards to hand
    let sIdx = 0;
    me.cards.forEach((c, idx) => {
      if (c.isAlive) {
        me.cards[idx] = { ...selectedCards[sIdx++], isAlive: true };
      }
    });

    modal.style.display = 'none';
    renderMyHand();
    showToast("Exchange Complete", "Cards swapped with the court deck.", "🔍");
    finishActionTurn();
  };

  modal.style.display = 'flex';
}

// Card Loss Modal for Human Player
function openCardLossModal(callback) {
  const modal = document.getElementById('cardLossModal');
  const container = document.getElementById('lossCardsContainer');
  container.innerHTML = '';

  const me = coupState.players[coupState.myPlayerIdx];
  me.cards.forEach((card, idx) => {
    if (!card.isAlive) return;

    const cardEl = document.createElement('div');
    cardEl.className = `character-card ${card.cardClass}`;
    cardEl.style.cursor = 'pointer';
    cardEl.innerHTML = `
      <div style="font-size:0.75rem; font-weight:800; color:#ef4444;">CLICK TO SACRIFICE</div>
      <div class="card-portrait">${card.icon}</div>
      <div class="card-title">${card.name}</div>
    `;

    cardEl.addEventListener('click', () => {
      card.isAlive = false;
      modal.style.display = 'none';
      onCardEliminated(coupState.myPlayerIdx, card, callback);
    });

    container.appendChild(cardEl);
  });

  modal.style.display = 'flex';
}

// Helper Target Picker
function openTargetPicker(title, onSelect) {
  const modal = document.getElementById('targetPickerModal');
  const container = document.getElementById('targetPickerButtons');
  document.getElementById('targetModalTitle').textContent = title;
  container.innerHTML = '';

  const opponents = getActiveOpponents(coupState.myPlayerIdx);
  opponents.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'target-player-btn';
    btn.innerHTML = `
      <div>${p.name}</div>
      <div style="font-size:0.75rem; color:#fbbf24;">🪙 ${p.coins} Coins</div>
    `;
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
      onSelect(p.id);
    });
    container.appendChild(btn);
  });

  document.getElementById('closeTargetPickerBtn').onclick = () => {
    modal.style.display = 'none';
  };

  modal.style.display = 'flex';
}

function setCenterPrompt(html) {
  document.getElementById('centerActionPrompt').innerHTML = html;
}

// UI Event Listeners
function setupUIEventListeners() {
  document.getElementById('actIncome').addEventListener('click', () => executeActionPrompt(coupState.myPlayerIdx, 'income'));
  document.getElementById('actForeignAid').addEventListener('click', () => executeActionPrompt(coupState.myPlayerIdx, 'foreign_aid'));
  document.getElementById('actTax').addEventListener('click', () => executeActionPrompt(coupState.myPlayerIdx, 'tax'));
  document.getElementById('actExchange').addEventListener('click', () => executeActionPrompt(coupState.myPlayerIdx, 'exchange'));

  document.getElementById('actSteal').addEventListener('click', () => {
    openTargetPicker("Select Player to Steal 2 Coins From", (targetId) => {
      executeActionPrompt(coupState.myPlayerIdx, 'steal', targetId);
    });
  });

  document.getElementById('actAssassinate').addEventListener('click', () => {
    openTargetPicker("Select Target for Assassination (Pay 3c)", (targetId) => {
      executeActionPrompt(coupState.myPlayerIdx, 'assassinate', targetId);
    });
  });

  document.getElementById('actCoup').addEventListener('click', () => {
    openTargetPicker("Launch Unblockable Coup (Pay 7c)", (targetId) => {
      executeActionPrompt(coupState.myPlayerIdx, 'coup', targetId);
    });
  });

  // Challenge / Block Buttons
  document.getElementById('btnChallenge').addEventListener('click', () => {
    document.getElementById('reactionBanner').style.display = 'none';
    const action = coupState.pendingAction;
    if (coupState.reactionState.stage === 'action_challenge_or_block') {
      resolveChallenge(coupState.myPlayerIdx, action.actorIdx, action.claimedRole, () => {
        finishActionTurn();
      }, () => {
        applyActionEffect(action);
      });
    } else if (coupState.reactionState.stage === 'block_challenge') {
      resolveChallenge(coupState.myPlayerIdx, action.blockedBy, action.blockRole, () => {
        applyActionEffect(action);
      }, () => {
        finishActionTurn();
      });
    }
  });

  document.getElementById('btnBlock').addEventListener('click', () => {
    document.getElementById('reactionBanner').style.display = 'none';
    const action = coupState.pendingAction;
    let blockRole = ROLES.DUKE;
    if (action.actionType === 'steal') blockRole = ROLES.CAPTAIN;
    if (action.actionType === 'assassinate') blockRole = ROLES.CONTESSA;
    declareBlock(coupState.myPlayerIdx, blockRole);
  });

  document.getElementById('btnPass').addEventListener('click', () => {
    document.getElementById('reactionBanner').style.display = 'none';
    const action = coupState.pendingAction;
    if (coupState.reactionState.stage === 'action_challenge_or_block') {
      if (action.blockedBy === null) {
        applyActionEffect(action);
      }
    } else {
      finishActionTurn();
    }
  });

  // Modals & Navigation
  document.getElementById('openRulesBtn').onclick = () => document.getElementById('rulesModal').style.display = 'flex';
  document.getElementById('closeRulesBtn').onclick = () => document.getElementById('rulesModal').style.display = 'none';
  document.getElementById('openLobbyBtn').onclick = () => document.getElementById('lobbyModal').style.display = 'flex';
  document.getElementById('closeLobbyBtn').onclick = () => document.getElementById('lobbyModal').style.display = 'none';
  document.getElementById('rematchBtn').onclick = () => {
    document.getElementById('victoryModal').style.display = 'none';
    startMatch(coupState.players.length, 1);
  };

  setupLobbyEvents();
}

function setupLobbyEvents() {
  const tabBots = document.getElementById('tabBots');
  const tabCreate = document.getElementById('tabCreate');
  const tabJoin = document.getElementById('tabJoin');
  const viewBots = document.getElementById('viewBots');
  const viewCreate = document.getElementById('viewCreate');
  const viewJoin = document.getElementById('viewJoin');

  function switchTab(t) {
    [tabBots, tabCreate, tabJoin].forEach(b => b.classList.remove('active'));
    viewBots.style.display = 'none';
    viewCreate.style.display = 'none';
    viewJoin.style.display = 'none';

    if (t === 'bots') {
      tabBots.classList.add('active');
      viewBots.style.display = 'block';
    } else if (t === 'create') {
      tabCreate.classList.add('active');
      viewCreate.style.display = 'block';
    } else {
      tabJoin.classList.add('active');
      viewJoin.style.display = 'block';
    }
  }

  tabBots.onclick = () => switchTab('bots');
  tabCreate.onclick = () => switchTab('create');
  tabJoin.onclick = () => switchTab('join');

  document.getElementById('startSoloBotsBtn').onclick = () => {
    const totalCount = parseInt(document.getElementById('botCountSelect').value, 10);
    document.getElementById('lobbyModal').style.display = 'none';
    startMatch(totalCount, 1);
    showToast("Syndicate Deployed", `Table set with You + ${totalCount - 1} Tactical Bots!`, "🤖");
  };

  document.getElementById('hostRoomBtn').onclick = () => {
    const totalCount = parseInt(document.getElementById('totalSeatsSelect').value, 10);
    const humanCount = parseInt(document.getElementById('humanCountSelect').value, 10);
    const roomCode = document.getElementById('roomNameInput').value.trim();

    coupState.mode = 'p2p';
    initMultiP2P(totalCount);
    const code = peerEngine.initHost(roomCode);

    document.getElementById('hostWaitingArea').style.display = 'block';
    const shareInput = document.getElementById('shareLinkInput');
    shareInput.value = `${window.location.origin}${window.location.pathname}?room=${code}`;
  };

  document.getElementById('startMultiplayerMatchBtn').onclick = () => {
    document.getElementById('lobbyModal').style.display = 'none';
    const totalCount = parseInt(document.getElementById('totalSeatsSelect').value, 10);
    startMatch(totalCount, peerEngine ? (peerEngine.clientConns.length + 1) : 1);
    if (peerEngine) peerEngine.send({ type: 'MATCH_STARTED', state: coupState });
  };

  document.getElementById('connectRoomBtn').onclick = () => {
    const nick = document.getElementById('nicknameInput').value.trim() || 'Agent-2';
    const code = document.getElementById('joinRoomCodeInput').value.trim();
    if (!code) {
      alert("Please enter target room code!");
      return;
    }
    coupState.mode = 'p2p';
    initMultiP2P(6);
    peerEngine.initJoin(code, nick);
  };
}

function initMultiP2P(maxPlayers = 6) {
  if (peerEngine) peerEngine.destroy();

  peerEngine = new MultiPeerEngine({
    gamePrefix: 'coup',
    maxPlayers: maxPlayers,
    onStatus: (status) => {
      const el = document.getElementById('joinStatusText');
      if (el) el.textContent = status;
    },
    onPlayerJoined: (client) => {
      document.getElementById('waitingCountText').textContent = `Connected: ${peerEngine.clientConns.length + 1} / ${maxPlayers} Players`;
      showToast("Agent Infiltrated", `${client.name} joined the syndicate table!`, "👋");
    },
    onData: (data) => {
      if (data.type === 'MATCH_STARTED') {
        coupState = data.state;
        renderTableLayout();
        renderMyHand();
        updateCommandControls();
      }
    }
  });
}

// ==========================================
// VFX PARTICLE ENGINE (Sparks, Coins, Slashes)
// ==========================================

function startVfxLoop() {
  function loop() {
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

      if (p.type === 'coin') {
        vfxCtx.beginPath();
        vfxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        vfxCtx.fill();
      } else if (p.type === 'slash') {
        vfxCtx.strokeStyle = p.color;
        vfxCtx.lineWidth = p.size;
        vfxCtx.beginPath();
        vfxCtx.moveTo(p.x, p.y);
        vfxCtx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
        vfxCtx.stroke();
      }

      vfxCtx.restore();
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

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

function spawnCoinsVFX(playerIdx, amount) {
  const pt = getSeatCenter(playerIdx);
  for (let i = 0; i < amount * 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    activeParticles.push({
      type: 'coin',
      x: pt.x,
      y: pt.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 3,
      color: '#facc15',
      life: 0.6 + Math.random() * 0.3,
      maxLife: 0.9
    });
  }
}

function spawnAttackVFX(fromIdx, toIdx, color = '#ef4444') {
  const p1 = getSeatCenter(fromIdx);
  const p2 = getSeatCenter(toIdx);

  for (let i = 0; i < 24; i++) {
    activeParticles.push({
      type: 'slash',
      x: p2.x + (Math.random() - 0.5) * 30,
      y: p2.y + (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: 3 + Math.random() * 3,
      color: color,
      life: 0.5 + Math.random() * 0.4,
      maxLife: 0.9
    });
  }
}

function spawnShieldVFX(playerIdx) {
  const pt = getSeatCenter(playerIdx);
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    activeParticles.push({
      type: 'coin',
      x: pt.x,
      y: pt.y,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      size: 3,
      color: '#a855f7',
      life: 0.5,
      maxLife: 0.5
    });
  }
}

function spawnVictoryConfetti() {
  const colors = ['#f59e0b', '#38bdf8', '#a855f7', '#ef4444', '#10b981'];
  for (let i = 0; i < 100; i++) {
    activeParticles.push({
      type: 'coin',
      x: vfxCanvas.width / 2,
      y: vfxCanvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.5 + Math.random() * 1.0,
      maxLife: 2.5
    });
  }
}

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

window.addEventListener('DOMContentLoaded', () => {
  initCoup();

  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    document.getElementById('lobbyModal').style.display = 'flex';
    document.getElementById('tabJoin').click();
    document.getElementById('joinRoomCodeInput').value = room;
  }
});
