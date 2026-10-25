/**
 * Stellar Dominion: UI, Canvas Renderer, Audio Synthesis, and Networking
 */

let canvas, ctx;
let hexEngine;
let gameState;
let myPlayerIdx = 0;
let isP2P = false;
let peerEngine = null;

// Camera / Pan & Zoom
let camera = { x: 0, y: 0, zoom: 1 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };

// Selection state
let selectedHex = null; // { q, r }
let selectedShip = null; // ship reference

// Initialize Game on Window Load
window.addEventListener('DOMContentLoaded', () => {
  initStellar();
});

function initStellar() {
  canvas = document.getElementById('hexCanvas');
  ctx = canvas.getContext('2d');
  hexEngine = new HexEngine(44);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize new 4-player game state
  gameState = StellarRules.createInitialGameState(4, 4);
  StellarRules.updateFogOfWar(gameState, myPlayerIdx);

  setupViewportInteractions();
  setupHUDButtons();
  setupTechTreeModal();
  setupLobbyEvents();

  updateHUD();
  centerCameraOnPlayer(myPlayerIdx);
  startRenderLoop();
}

function resizeCanvas() {
  const container = document.getElementById('viewport');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

function centerCameraOnPlayer(pIdx) {
  const p = gameState.players[pIdx];
  const home = Object.values(gameState.map).find(c => c.colony && c.colony.owner === pIdx);
  if (home) {
    const pt = hexEngine.axialToPixel(home.q, home.r);
    camera.x = canvas.width / 2 - pt.x;
    camera.y = canvas.height / 2 - pt.y;
  }
}

// 60FPS Canvas Render Loop
function startRenderLoop() {
  function loop() {
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  const myPlayer = gameState.players[myPlayerIdx];
  const discovered = new Set(myPlayer.discoveredHexes);

  // 1. Draw Star Hex Tiles
  Object.values(gameState.map).forEach(cell => {
    const pt = hexEngine.axialToPixel(cell.q, cell.r);
    const isDiscovered = discovered.has(`${cell.q},${cell.r}`);

    hexEngine.drawHexPath(ctx, pt.x, pt.y, hexEngine.hexSize - 1.5);

    if (!isDiscovered) {
      // Shrouded Deep Space Fog
      ctx.fillStyle = '#060a17';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
      return;
    }

    // Visible Sector Fill Colors
    let fill = '#0f172a';
    if (cell.type === 'galactic_core') fill = '#1e1b4b';
    else if (cell.type === 'planet_terrestrial') fill = '#064e3b';
    else if (cell.type === 'planet_volcanic') fill = '#450a0a';
    else if (cell.type === 'planet_oceanic') fill = '#0c4a6e';
    else if (cell.type === 'asteroids') fill = '#1c1917';
    else if (cell.type === 'nebula') fill = '#3b0764';
    else if (cell.type === 'alien_vault') fill = '#14532d';

    ctx.fillStyle = fill;
    ctx.fill();

    // Colony borders
    if (cell.colony) {
      const ownerF = FACTIONS[cell.colony.owner];
      ctx.strokeStyle = ownerF.color;
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
    }
    ctx.stroke();

    // Render Tile Icons & Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '16px sans-serif';

    let icon = '🌌';
    if (cell.type === 'galactic_core') icon = '🌀';
    else if (cell.type === 'planet_terrestrial') icon = '🌍';
    else if (cell.type === 'planet_volcanic') icon = '🌋';
    else if (cell.type === 'planet_oceanic') icon = '🌊';
    else if (cell.type === 'asteroids') icon = '🪨';
    else if (cell.type === 'nebula') icon = '✨';
    else if (cell.type === 'alien_vault') icon = '🏛️';

    ctx.fillText(icon, pt.x, pt.y - 6);

    // Colony owner flag
    if (cell.colony) {
      const ownerF = FACTIONS[cell.colony.owner];
      ctx.font = '11px sans-serif';
      ctx.fillText(ownerF.flag, pt.x, pt.y + 14);
    }
  });

  // 2. Draw Selected Hex Highlight
  if (selectedHex) {
    const pt = hexEngine.axialToPixel(selectedHex.q, selectedHex.r);
    hexEngine.drawHexPath(ctx, pt.x, pt.y, hexEngine.hexSize + 1);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // 3. Draw Fleet Units
  gameState.players.forEach(p => {
    p.fleets.forEach(ship => {
      if (!discovered.has(`${ship.q},${ship.r}`)) return; // Hidden in fog

      const pt = hexEngine.axialToPixel(ship.q, ship.r);
      const isSelected = selectedShip && selectedShip.id === ship.id;

      // Ship badge ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y + 4, 13, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      if (isSelected) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const spec = SHIP_TYPES[ship.type];
      ctx.fillText(spec.icon, pt.x, pt.y + 4);
    });
  });

  ctx.restore();
}

// Mouse / Touch Viewport Navigation & Selection
function setupViewportInteractions() {
  const container = document.getElementById('viewport');

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStart = { x: e.clientX - camera.x, y: e.clientY - camera.y };
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      camera.x = e.clientX - dragStart.x;
      camera.y = e.clientY - dragStart.y;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (isDragging) {
      isDragging = false;
      // If minimal movement, treat as click
      const movedDist = Math.hypot(e.clientX - (dragStart.x + camera.x), e.clientY - (dragStart.y + camera.y));
      if (movedDist < 6) {
        handleHexClick(e.clientX, e.clientY);
      }
    }
  });

  // Touch Support
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStart = { x: e.touches[0].clientX - camera.x, y: e.touches[0].clientY - camera.y };
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      camera.x = e.touches[0].clientX - dragStart.x;
      camera.y = e.touches[0].clientY - dragStart.y;
    }
  });

  window.addEventListener('touchend', (e) => {
    if (isDragging) {
      isDragging = false;
    }
  });
}

// Handle Hex Clicks
function handleHexClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left - camera.x) / camera.zoom;
  const py = (clientY - rect.top - camera.y) / camera.zoom;

  const hexCoord = hexEngine.pixelToAxial(px, py);
  const cell = gameState.map[`${hexCoord.q},${hexCoord.r}`];
  if (!cell) return;

  selectedHex = hexCoord;

  // Check if a fleet belonging to the player is in this hex
  const myPlayer = gameState.players[myPlayerIdx];
  const shipsHere = myPlayer.fleets.filter(s => s.q === hexCoord.q && s.r === hexCoord.r);

  if (shipsHere.length > 0) {
    selectedShip = shipsHere[0];
  } else {
    selectedShip = null;
  }

  updateTacticalDock(cell);
}

// Update Tactical Bottom Dock Controls
function updateTacticalDock(cell) {
  const title = document.getElementById('inspectTitle');
  const sub = document.getElementById('inspectSub');
  const actMove = document.getElementById('actMove');
  const actColonize = document.getElementById('actColonize');
  const actBuild = document.getElementById('actBuildShip');

  title.textContent = cell.name;
  let desc = `Yield: ⚡+${cell.energy} 🪨+${cell.minerals} 🔬+${cell.science}`;
  if (cell.colony) {
    desc += ` • Colony: ${FACTIONS[cell.colony.owner].name}`;
  }
  if (selectedShip) {
    desc += ` • Ship: ${SHIP_TYPES[selectedShip.type].name} (Hull: ${selectedShip.hull})`;
  }
  sub.textContent = desc;

  // Move Fleet button
  actMove.disabled = !selectedShip || selectedShip.hasMovedThisTurn || gameState.actionPointsRemaining <= 0;

  // Colonize button
  const p = gameState.players[myPlayerIdx];
  const hasColonyShip = selectedShip && selectedShip.type === 'colony';
  const canAffordColony = p.minerals >= 6 && p.energy >= 4;
  actColonize.disabled = !hasColonyShip || cell.colony || !cell.type.startsWith('planet') || !canAffordColony || gameState.actionPointsRemaining <= 0;

  // Build Frigate button (can build at owned colony)
  const isMyColony = cell.colony && cell.colony.owner === myPlayerIdx;
  const canAffordFrigate = p.minerals >= 5 && p.energy >= 3;
  actBuild.disabled = !isMyColony || !canAffordFrigate || gameState.actionPointsRemaining <= 0;
}

// Setup Tactical Action Button Listeners
function setupHUDButtons() {
  // Move Fleet Action: Move to adjacent sector
  document.getElementById('actMove').addEventListener('click', () => {
    if (!selectedShip || selectedShip.hasMovedThisTurn || gameState.actionPointsRemaining <= 0) return;

    const neighbors = hexEngine.getNeighbors(selectedShip.q, selectedShip.r);
    // Find unvisited adjacent or first valid neighbor
    const validMoves = neighbors.filter(n => gameState.map[`${n.q},${n.r}`]);
    if (validMoves.length === 0) return;

    // Advance to next neighboring hex
    const target = validMoves[0];
    selectedShip.q = target.q;
    selectedShip.r = target.r;
    selectedShip.hasMovedThisTurn = true;
    gameState.actionPointsRemaining--;

    StellarRules.resolveContestedCombat(gameState, target.q, target.r);
    StellarRules.updateFogOfWar(gameState, myPlayerIdx);

    showToast("Fleet Advanced", `Moved fleet to sector (${target.q}, ${target.r})`, "🚀");
    updateHUD();
    handleHexClick(canvas.width / 2, canvas.height / 2);
  });

  // Found Colony Action
  document.getElementById('actColonize').addEventListener('click', () => {
    if (!selectedHex || !selectedShip || selectedShip.type !== 'colony') return;
    const cell = gameState.map[`${selectedHex.q},${selectedHex.r}`];
    const p = gameState.players[myPlayerIdx];

    p.minerals -= 6;
    p.energy -= 4;
    cell.colony = { owner: myPlayerIdx, level: 1, districts: ['headquarters'] };
    // Consume colony ship
    p.fleets = p.fleets.filter(s => s.id !== selectedShip.id);
    selectedShip = null;
    gameState.actionPointsRemaining--;

    showToast("Colony Established!", `Claimed ${cell.name} for the ${p.name}!`, "🌍");
    updateHUD();
    updateTacticalDock(cell);
  });

  // Build Frigate Action
  document.getElementById('actBuildShip').addEventListener('click', () => {
    if (!selectedHex) return;
    const cell = gameState.map[`${selectedHex.q},${selectedHex.r}`];
    const p = gameState.players[myPlayerIdx];

    p.minerals -= 5;
    p.energy -= 3;
    p.fleets.push({
      id: `f_${myPlayerIdx}_${Date.now()}`,
      owner: myPlayerIdx,
      type: 'frigate',
      q: cell.q,
      r: cell.r,
      hull: SHIP_TYPES.frigate.hull,
      shields: SHIP_TYPES.frigate.shields,
      hasMovedThisTurn: true
    });
    gameState.actionPointsRemaining--;

    showToast("Warship Commissioned", `Frigate launched at ${cell.name}!`, "🛠️");
    updateHUD();
    updateTacticalDock(cell);
  });

  // End Turn Action
  document.getElementById('endTurnBtn').addEventListener('click', () => {
    endPlayerTurn();
  });
}

function endPlayerTurn() {
  // Execute autonomous bot turns
  for (let i = 1; i < gameState.players.length; i++) {
    gameState.actionPointsRemaining = 3;
    StellarBotAI.executeTurn(gameState, i, hexEngine);
  }

  // Turn Income & Reset Phase
  gameState.round++;
  gameState.actionPointsRemaining = 3;

  gameState.players.forEach((p, idx) => {
    const inc = StellarRules.computePlayerIncome(gameState, idx);
    p.energy += inc.energy;
    p.minerals += inc.minerals;
    p.science += inc.science;
    p.fleets.forEach(s => s.hasMovedThisTurn = false);
  });

  StellarRules.updateFogOfWar(gameState, myPlayerIdx);
  showToast("New Galactic Round", `Round ${gameState.round} has begun! Resources accrued.`, "🌌");

  updateHUD();

  // Check Victory Condition
  if (gameState.round >= gameState.maxRounds) {
    concludeGalacticWar();
  }
}

// Update Top Command HUD
function updateHUD() {
  const p = gameState.players[myPlayerIdx];
  const inc = StellarRules.computePlayerIncome(gameState, myPlayerIdx);

  document.getElementById('resEnergy').textContent = p.energy;
  document.getElementById('rateEnergy').textContent = `(+${inc.energy})`;

  document.getElementById('resMinerals').textContent = p.minerals;
  document.getElementById('rateMinerals').textContent = `(+${inc.minerals})`;

  document.getElementById('resScience').textContent = p.science;
  document.getElementById('rateScience').textContent = `(+${inc.science})`;

  document.getElementById('apCount').textContent = `${gameState.actionPointsRemaining} / 3`;
  document.getElementById('roundBadge').textContent = `Round ${gameState.round} / ${gameState.maxRounds}`;
}

// Setup Tech Tree Modal
function setupTechTreeModal() {
  const modal = document.getElementById('techModal');
  document.getElementById('openTechBtn').addEventListener('click', () => {
    renderTechList();
    modal.style.display = 'flex';
  });
  document.getElementById('closeTechBtn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

function renderTechList() {
  const list = document.getElementById('techList');
  list.innerHTML = '';
  const p = gameState.players[myPlayerIdx];

  TECH_TREE.forEach(tech => {
    const isUnlocked = p.unlockedTechs.includes(tech.id);
    const card = document.createElement('div');
    card.className = `tech-card ${isUnlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:1.2rem;">${tech.icon}</span>
        <span style="font-size:0.75rem; font-weight:800; color:${isUnlocked ? '#10b981' : '#38bdf8'};">
          ${isUnlocked ? '✓ RESEARCHED' : `🔬 ${tech.cost} Science`}
        </span>
      </div>
      <div style="font-weight:800; font-size:0.95rem; margin-top:6px;">${tech.name}</div>
      <div style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">${tech.desc}</div>
    `;

    if (!isUnlocked) {
      card.addEventListener('click', () => {
        if (p.science >= tech.cost && gameState.actionPointsRemaining > 0) {
          p.science -= tech.cost;
          p.unlockedTechs.push(tech.id);
          gameState.actionPointsRemaining--;
          showToast("Technology Breakthrough!", `Researched ${tech.name}!`, "💡");
          updateHUD();
          renderTechList();
        } else {
          showToast("Insufficient Science", `Requires ${tech.cost} 🔬 Science points!`, "⚠️");
        }
      });
    }

    list.appendChild(card);
  });
}

// Setup Multiplayer Lobby
function setupLobbyEvents() {
  const modal = document.getElementById('lobbyModal');
  document.getElementById('openLobbyBtn').addEventListener('click', () => { modal.style.display = 'flex'; });
  document.getElementById('closeLobbyBtn').addEventListener('click', () => { modal.style.display = 'none'; });

  const tabSolo = document.getElementById('tabSolo');
  const tabHost = document.getElementById('tabHost');
  const tabJoin = document.getElementById('tabJoin');
  const viewSolo = document.getElementById('viewSolo');
  const viewHost = document.getElementById('viewHost');
  const viewJoin = document.getElementById('viewJoin');

  function switchTab(t) {
    [tabSolo, tabHost, tabJoin].forEach(b => b.classList.remove('active'));
    viewSolo.style.display = 'none';
    viewHost.style.display = 'none';
    viewJoin.style.display = 'none';

    if (t === 'solo') {
      tabSolo.classList.add('active');
      viewSolo.style.display = 'block';
    } else if (t === 'host') {
      tabHost.classList.add('active');
      viewHost.style.display = 'block';
    } else {
      tabJoin.classList.add('active');
      viewJoin.style.display = 'block';
    }
  }

  tabSolo.onclick = () => switchTab('solo');
  tabHost.onclick = () => switchTab('host');
  tabJoin.onclick = () => switchTab('join');

  document.getElementById('startSoloBtn').onclick = () => {
    modal.style.display = 'none';
    isP2P = false;
    myPlayerIdx = 0;
    gameState = StellarRules.createInitialGameState(4, 4);
    StellarRules.updateFogOfWar(gameState, myPlayerIdx);
    updateHUD();
    centerCameraOnPlayer(myPlayerIdx);
    showToast("Galaxy Initialized", "Commanding Solarian Concordat vs 3 Rival AI Empires!", "🚀");
  };

  // Host P2P
  document.getElementById('hostRoomBtn').onclick = () => {
    isP2P = true;
    myPlayerIdx = 0;
    initStellarP2P();
    const code = peerEngine.initHost();
    document.getElementById('hostWaitingArea').style.display = 'block';
    const shareInput = document.getElementById('shareLinkInput');
    shareInput.value = `${window.location.origin}${window.location.pathname}?room=${code}`;
  };

  document.getElementById('startMultiBtn').onclick = () => {
    modal.style.display = 'none';
    gameState = StellarRules.createInitialGameState(4, 4);
    // Mark connected human slots
    if (peerEngine && peerEngine.clientConns) {
      peerEngine.clientConns.forEach(c => {
        if (gameState.players[c.playerIndex]) {
          gameState.players[c.playerIndex].name = c.name;
          gameState.players[c.playerIndex].isBot = false;
        }
      });
    }
    StellarRules.updateFogOfWar(gameState, myPlayerIdx);
    updateHUD();
    centerCameraOnPlayer(myPlayerIdx);
    if (peerEngine) {
      peerEngine.broadcast({ type: 'MATCH_STARTED', state: gameState });
    }
    showToast("Galactic War Begun!", "Multiplayer match active across star sectors!", "🚀");
  };

  // Join P2P
  document.getElementById('connectRoomBtn').onclick = () => {
    const code = document.getElementById('joinRoomInput').value.trim();
    if (!code) {
      alert("Please enter a room code!");
      return;
    }
    isP2P = true;
    initStellarP2P();
    peerEngine.initJoin(code, 'Admiral');
  };
}

function initStellarP2P() {
  if (peerEngine) peerEngine.destroy();

  const modal = document.getElementById('lobbyModal');

  peerEngine = new MultiPeerEngine({
    gamePrefix: 'stellar',
    maxPlayers: 4,
    onStatus: (msg) => {
      const el = document.getElementById('joinStatusText');
      if (el) el.textContent = msg;
      const hostWaiting = document.getElementById('connectedBadge');
      if (hostWaiting && peerEngine.isHost) {
        hostWaiting.textContent = `Connected: ${peerEngine.clientConns.length + 1} / 4 Admirals`;
      }
    },
    onPlayerJoined: (client) => {
      showToast("Admiral Connected", `${client.name} entered the Galactic Command Nexus!`, "👋");
      const hostWaiting = document.getElementById('connectedBadge');
      if (hostWaiting) {
        hostWaiting.textContent = `Connected: ${peerEngine.clientConns.length + 1} / 4 Admirals`;
      }
    },
    onData: (data) => {
      if (data.type === '_SYS_ASSIGN_SLOT') {
        myPlayerIdx = data.playerIndex;
        const fMeta = FACTIONS[data.playerIndex];
        showToast("Assigned Faction", `Commanding the ${fMeta.name}!`, "🪐");
        const statusEl = document.getElementById('joinStatusText');
        if (statusEl) {
          statusEl.textContent = `Connected as ${fMeta.name} (${data.totalConnected}/${data.maxPlayers}). Waiting for host...`;
        }
      } else if (data.type === '_SYS_LOBBY_UPDATE') {
        const statusEl = document.getElementById('joinStatusText');
        if (statusEl) {
          statusEl.textContent = `Connected: ${data.totalConnected} / ${data.maxPlayers} Admirals. Waiting for host...`;
        }
      } else if (data.type === 'MATCH_STARTED') {
        modal.style.display = 'none';
        const savedIdx = myPlayerIdx;
        gameState = data.state;
        myPlayerIdx = savedIdx;
        StellarRules.updateFogOfWar(gameState, myPlayerIdx);
        updateHUD();
        centerCameraOnPlayer(myPlayerIdx);
        showToast("Galaxy Unveiled", "The host has initiated the galactic war!", "🚀");
      } else if (data.type === 'SYNC_STATE') {
        const savedIdx = myPlayerIdx;
        gameState = data.state;
        myPlayerIdx = savedIdx;
        StellarRules.updateFogOfWar(gameState, myPlayerIdx);
        updateHUD();
      }
    }
  });
}

// Final Game Over Score Calculation & Discord Webhook
function concludeGalacticWar() {
  gameState.players.forEach(p => {
    let score = p.unlockedTechs.length * 10;
    Object.values(gameState.map).forEach(cell => {
      if (cell.colony && cell.colony.owner === p.id) score += 15;
    });
    score += p.fleets.length * 5;
    p.finalScore = score;
  });

  gameState.players.sort((a, b) => b.finalScore - a.finalScore);
  const victor = gameState.players[0];

  showToast("DOMINION ACHIEVED!", `${victor.name} has unified the galaxy!`, "👑");

  if (typeof sendDiscordMatchReport === 'function') {
    const fields = gameState.players.map((p, rank) => ({
      name: `#${rank + 1} ${p.name}`,
      value: `**Score: ${p.finalScore}** (Techs: ${p.unlockedTechs.length} | Ships: ${p.fleets.length})`,
      inline: true
    }));

    sendDiscordMatchReport({
      gameName: 'Stellar Dominion: 4X Galactic Empires',
      gameIcon: '🌌',
      color: 0x38bdf8,
      winner: victor.name,
      summary: `**${victor.name}** established absolute galactic hegemony after 30 galactic eras!`,
      fields: fields
    });
  }
}

// Toast System
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
