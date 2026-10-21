// Cities data with coordinates on 800x500 map
const CITIES = [
  { id: 'london', name: 'London', x: 120, y: 150 },
  { id: 'paris', name: 'Paris', x: 230, y: 220 },
  { id: 'berlin', name: 'Berlin', x: 380, y: 130 },
  { id: 'rome', name: 'Rome', x: 320, y: 360 },
  { id: 'cairo', name: 'Cairo', x: 490, y: 410 },
  { id: 'moscow', name: 'Moscow', x: 570, y: 110 },
  { id: 'dubai', name: 'Dubai', x: 670, y: 350 },
  { id: 'tokyo', name: 'Tokyo', x: 730, y: 190 }
];

// Available rail routes between cities
const ROUTES = [
  { id: 'r1', from: 'london', to: 'paris', length: 2, color: 'blue', claimedBy: null },
  { id: 'r2', from: 'london', to: 'berlin', length: 3, color: 'green', claimedBy: null },
  { id: 'r3', from: 'paris', to: 'berlin', length: 2, color: 'yellow', claimedBy: null },
  { id: 'r4', from: 'paris', to: 'rome', length: 3, color: 'red', claimedBy: null },
  { id: 'r5', from: 'berlin', to: 'rome', length: 3, color: 'purple', claimedBy: null },
  { id: 'r6', from: 'berlin', to: 'moscow', length: 3, color: 'blue', claimedBy: null },
  { id: 'r7', from: 'rome', to: 'cairo', length: 3, color: 'yellow', claimedBy: null },
  { id: 'r8', from: 'cairo', to: 'dubai', length: 3, color: 'red', claimedBy: null },
  { id: 'r9', from: 'moscow', to: 'tokyo', length: 4, color: 'green', claimedBy: null },
  { id: 'r10', from: 'dubai', to: 'tokyo', length: 3, color: 'purple', claimedBy: null },
  { id: 'r11', from: 'moscow', to: 'dubai', length: 3, color: 'yellow', claimedBy: null }
];

// Game State
let gameState = {
  currentTurn: 1, // 1 for Player 1, 2 for Player 2
  p1Score: 0,
  p2Score: 0,
  p1Trains: 15,
  p2Trains: 15,
  routes: JSON.parse(JSON.stringify(ROUTES)),
  cards: {
    blue: 2,
    red: 2,
    green: 2,
    yellow: 2,
    purple: 1,
    wild: 1
  }
};

let peerEngine = null;
let myPlayerNum = 1; // 1 for host/local, 2 for client joiner
let isOnline = false;

// DOM references
const routesGroup = document.getElementById('routesGroup');
const citiesGroup = document.getElementById('citiesGroup');
const turnIndicator = document.getElementById('turnIndicator');
const p1ScoreEl = document.getElementById('p1Score');
const p2ScoreEl = document.getElementById('p2Score');
const p1TrainsEl = document.getElementById('p1Trains');
const p2TrainsEl = document.getElementById('p2Trains');
const p1StatsEl = document.getElementById('p1Stats');
const p2StatsEl = document.getElementById('p2Stats');

// Render board
function renderBoard() {
  routesGroup.innerHTML = '';
  citiesGroup.innerHTML = '';

  const cityMap = {};
  CITIES.forEach(c => cityMap[c.id] = c);

  // Render routes
  gameState.routes.forEach(route => {
    const from = cityMap[route.from];
    const to = cityMap[route.to];

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', 'route-segment');
    line.setAttribute('data-id', route.id);

    if (route.claimedBy === 1) {
      line.classList.add('claimed-p1');
    } else if (route.claimedBy === 2) {
      line.classList.add('claimed-p2');
    }

    line.addEventListener('click', () => handleRouteClick(route.id));
    routesGroup.appendChild(line);
  });

  // Render cities
  CITIES.forEach(city => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'city-node');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', city.x);
    circle.setAttribute('cy', city.y);
    circle.setAttribute('r', '11');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', city.x);
    label.setAttribute('y', city.y + 24);
    label.setAttribute('class', 'city-label');
    label.textContent = city.name;

    g.appendChild(circle);
    g.appendChild(label);
    citiesGroup.appendChild(g);
  });

  updateUI();
}

function updateUI() {
  p1ScoreEl.textContent = `${gameState.p1Score} pts`;
  p2ScoreEl.textContent = `${gameState.p2Score} pts`;
  p1TrainsEl.textContent = gameState.p1Trains;
  p2TrainsEl.textContent = gameState.p2Trains;

  if (gameState.currentTurn === 1) {
    turnIndicator.textContent = `Turn: Player 1 (Blue)${isOnline && myPlayerNum === 1 ? ' - YOUR TURN' : ''}`;
    turnIndicator.style.borderColor = 'rgba(56, 189, 248, 0.5)';
    turnIndicator.style.color = '#38bdf8';
    p1StatsEl.classList.add('player-active');
    p2StatsEl.classList.remove('player-active');
  } else {
    turnIndicator.textContent = `Turn: Player 2 (Red)${isOnline && myPlayerNum === 2 ? ' - YOUR TURN' : ''}`;
    turnIndicator.style.borderColor = 'rgba(244, 63, 94, 0.5)';
    turnIndicator.style.color = '#f43f5e';
    p2StatsEl.classList.add('player-active');
    p1StatsEl.classList.remove('player-active');
  }

  // Update cards
  ['blue', 'red', 'green', 'yellow', 'purple', 'wild'].forEach(color => {
    const el = document.getElementById(`cnt-${color}`);
    if (el) el.textContent = gameState.cards[color] || 0;
  });
}

function handleRouteClick(routeId) {
  if (isOnline && gameState.currentTurn !== myPlayerNum) {
    alert("Wait for opponent's turn!");
    return;
  }

  const route = gameState.routes.find(r => r.id === routeId);
  if (!route || route.claimedBy !== null) return;

  const currentP = gameState.currentTurn;
  const trainCount = currentP === 1 ? gameState.p1Trains : gameState.p2Trains;

  if (trainCount < route.length) {
    alert("Not enough trains to claim this track!");
    return;
  }

  // Claim track
  route.claimedBy = currentP;
  const points = route.length * 4;

  if (currentP === 1) {
    gameState.p1Trains -= route.length;
    gameState.p1Score += points;
  } else {
    gameState.p2Trains -= route.length;
    gameState.p2Score += points;
  }

  // Switch turn
  gameState.currentTurn = currentP === 1 ? 2 : 1;
  renderBoard();

  // Sync over P2P if active
  if (peerEngine && isOnline) {
    peerEngine.send({
      type: 'STATE_UPDATE',
      state: gameState
    });
  }

  checkEndGame();
}

function checkEndGame() {
  if (gameState.p1Trains <= 2 || gameState.p2Trains <= 2) {
    const winner = gameState.p1Score > gameState.p2Score ? 'Player 1' : 'Player 2';
    setTimeout(() => {
      alert(`Game Finished! ${winner} wins the Continental Grand Tour! 🏆`);
    }, 150);
  }
}

// Action button handlers
document.getElementById('drawCardsBtn').addEventListener('click', () => {
  if (isOnline && gameState.currentTurn !== myPlayerNum) {
    alert("Wait for opponent's turn!");
    return;
  }
  const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'wild'];
  const c1 = colors[Math.floor(Math.random() * colors.length)];
  const c2 = colors[Math.floor(Math.random() * colors.length)];
  gameState.cards[c1] = (gameState.cards[c1] || 0) + 1;
  gameState.cards[c2] = (gameState.cards[c2] || 0) + 1;

  // Turn ends after drawing cards
  gameState.currentTurn = gameState.currentTurn === 1 ? 2 : 1;
  updateUI();

  if (peerEngine && isOnline) {
    peerEngine.send({
      type: 'STATE_UPDATE',
      state: gameState
    });
  }
});

document.getElementById('resetGameBtn').addEventListener('click', () => {
  if (confirm("Restart current match?")) {
    resetMatch();
  }
});

function resetMatch() {
  gameState = {
    currentTurn: 1,
    p1Score: 0,
    p2Score: 0,
    p1Trains: 15,
    p2Trains: 15,
    routes: JSON.parse(JSON.stringify(ROUTES)),
    cards: { blue: 2, red: 2, green: 2, yellow: 2, purple: 1, wild: 1 }
  };
  renderBoard();
  if (peerEngine && isOnline) {
    peerEngine.send({
      type: 'STATE_UPDATE',
      state: gameState
    });
  }
}

// Multiplayer Modal & WebRTC
const p2pModal = document.getElementById('p2pModal');
const multiplayerBtn = document.getElementById('multiplayerBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomLinkBox = document.getElementById('roomLinkBox');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const connectionStatus = document.getElementById('connectionStatus');

multiplayerBtn.addEventListener('click', () => { p2pModal.style.display = 'flex'; });
closeModalBtn.addEventListener('click', () => { p2pModal.style.display = 'none'; });

function initP2PEngine() {
  peerEngine = new PeerEngine({
    gamePrefix: 'c4w',
    onStatus: (status) => {
      connectionStatus.textContent = status;
    },
    onConnected: ({ isHost }) => {
      isOnline = true;
      myPlayerNum = isHost ? 1 : 2;
      connectionStatus.textContent = `Online! You are Player ${myPlayerNum} (${isHost ? 'Blue' : 'Red'})`;
      setTimeout(() => { p2pModal.style.display = 'none'; }, 1000);
      updateUI();
    },
    onData: (data) => {
      if (data.type === 'STATE_UPDATE') {
        gameState = data.state;
        renderBoard();
      }
    },
    onDisconnected: () => {
      isOnline = false;
      alert("Opponent disconnected!");
    }
  });
}

createRoomBtn.addEventListener('click', () => {
  if (!peerEngine) initP2PEngine();
  const roomCode = peerEngine.initHost();
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
  roomLinkBox.style.display = 'block';
  roomLinkBox.innerHTML = `Room Code: <strong>${roomCode.toUpperCase()}</strong><br><a href="${shareUrl}" target="_blank" style="color:#38bdf8; font-size:0.8rem;">${shareUrl}</a>`;
});

joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim();
  if (!code) return;
  if (!peerEngine) initP2PEngine();
  peerEngine.initJoin(code);
});

// Auto-join from URL parameter
window.addEventListener('DOMContentLoaded', () => {
  renderBoard();
  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get('room');
  if (roomCode) {
    p2pModal.style.display = 'flex';
    roomCodeInput.value = roomCode;
    initP2PEngine();
    peerEngine.initJoin(roomCode);
  }
});
