/**
 * Ludo Royale: Complete 4-Player Strategy Board Game Engine
 * Standard 15x15 Ludo Geometry with Smooth Canvas Rendering, P2P Sync & 3 Autonomous Bots.
 */

const CANVAS_SIZE = 600;
const GRID_CELLS = 15;
const CELL_SIZE = CANVAS_SIZE / GRID_CELLS; // 40px

// Player Colors
const PLAYERS = [
  { id: 0, key: 'red', name: 'Red', color: '#ef4444', darkColor: '#b91c1c', lightColor: '#fca5a5', startIndex: 0 },
  { id: 1, key: 'green', name: 'Green', color: '#10b981', darkColor: '#047857', lightColor: '#6ee7b7', startIndex: 13 },
  { id: 2, key: 'yellow', name: 'Yellow', color: '#facc15', darkColor: '#b45309', lightColor: '#fde047', startIndex: 26 },
  { id: 3, key: 'blue', name: 'Blue', color: '#38bdf8', darkColor: '#0284c7', lightColor: '#93c5fd', startIndex: 39 }
];

// 52-step standard common circular track coordinates [col, row] (0-indexed)
const COMMON_TRACK = [
  // Red side going north
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  // Top turn
  [7, 0], [8, 0],
  // Green side going south
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  // Right turn
  [14, 7], [14, 8],
  // Yellow side going west
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  // Bottom turn
  [7, 14], [6, 14],
  // Blue side going north
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  // Left turn
  [0, 7], [0, 6]
];

// Home column runways (5 steps before center)
const HOME_RUNWAYS = {
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]]
};

// Base Yard Token Coordinates (4 circles per corner)
const YARD_COORDS = {
  red: [[2, 2], [3.5, 2], [2, 3.5], [3.5, 3.5]],
  green: [[11, 2], [12.5, 2], [11, 3.5], [12.5, 3.5]],
  yellow: [[11, 11], [12.5, 11], [11, 12.5], [12.5, 12.5]],
  blue: [[2, 11], [3.5, 11], [2, 12.5], [3.5, 12.5]]
};

// Safe Tiles where pieces cannot be knocked out
const SAFE_TILES = [0, 8, 13, 21, 26, 34, 39, 47];

// Animation & VFX State
let animatingTokens = []; // Array of active token step animations
let activeParticles = []; // Shockwaves, sparkles, and blast particles
let isAnimating = false; // Lock interactions during token move animation
let lastFrameTime = performance.now();

// Game State
let gameState = {
  mode: 'bots', // 'bots' or 'p2p'
  myPlayerIdx: 0, // 0: Red, 1: Green, 2: Yellow, 3: Blue
  currentTurn: 0,
  diceRoll: null,
  hasRolled: false,
  selectedTokenIdx: null,
  players: [
    { id: 0, name: 'Player 1', isBot: false, tokens: [-1, -1, -1, -1] }, // -1 = Yard, 0-50 = Track, 51-55 = Runway, 56 = Home
    { id: 1, name: 'Bot Green', isBot: true, tokens: [-1, -1, -1, -1] },
    { id: 2, name: 'Bot Yellow', isBot: true, tokens: [-1, -1, -1, -1] },
    { id: 3, name: 'Bot Blue', isBot: true, tokens: [-1, -1, -1, -1] }
  ],
  winner: null
};

let canvas, ctx;
let peerEngine = null;

// Initialize Ludo Canvas
function initLudo() {
  canvas = document.getElementById('ludoCanvas');
  ctx = canvas.getContext('2d');

  canvas.addEventListener('click', handleCanvasClick);
  document.getElementById('rollBtn').addEventListener('click', handleRollClick);
  document.getElementById('diceCube').addEventListener('click', handleRollClick);

  setupLobbyEvents();
  startAnimationLoop();
  updateUI();
}

// Main 60FPS Animation Loop for Smooth Movement & Particle VFX
function startAnimationLoop() {
  function loop(time) {
    const dt = Math.min((time - lastFrameTime) / 1000, 0.1);
    lastFrameTime = time;

    updateAnimations(dt);
    renderBoard();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// Update Active Animations and Particles
function updateAnimations(dt) {
  // Update Token Animations
  for (let i = animatingTokens.length - 1; i >= 0; i--) {
    const anim = animatingTokens[i];
    anim.elapsed += dt;
    const progress = Math.min(anim.elapsed / anim.stepDuration, 1);

    // Ease-in-out hop interpolation
    const curPt = anim.waypoints[anim.stepIndex];
    const nxtPt = anim.waypoints[anim.stepIndex + 1];

    if (nxtPt) {
      anim.x = curPt.x + (nxtPt.x - curPt.x) * progress;
      anim.y = curPt.y + (nxtPt.y - curPt.y) * progress;
      // Arc hop height (peak in the middle of step)
      anim.arcOffset = Math.sin(progress * Math.PI) * 14;
    }

    if (progress >= 1) {
      anim.stepIndex++;
      anim.elapsed = 0;
      if (anim.stepIndex >= anim.waypoints.length - 1) {
        // Animation finished
        animatingTokens.splice(i, 1);
        if (anim.onComplete) anim.onComplete();
      }
    }
  }

  isAnimating = animatingTokens.length > 0;

  // Update Particles
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.life -= dt;
    if (p.life <= 0) {
      activeParticles.splice(i, 1);
      continue;
    }

    if (p.type === 'shockwave') {
      p.radius += p.speed * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    } else if (p.type === 'particle') {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt; // gravity
      p.alpha = Math.max(0, p.life / p.maxLife);
      p.size = Math.max(0, p.initialSize * (p.life / p.maxLife));
      p.rotation += p.vRot * dt;
    }
  }
}

// Render Ludo Board
function renderBoard() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Background grid base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 4 Corner Yard Bases
  drawYard(0, 0, '#ef4444', '#7f1d1d', 'red');
  drawYard(9 * CELL_SIZE, 0, '#10b981', '#064e3b', 'green');
  drawYard(9 * CELL_SIZE, 9 * CELL_SIZE, '#facc15', '#713f12', 'yellow');
  drawYard(0, 9 * CELL_SIZE, '#38bdf8', '#0c4a6e', 'blue');

  // Center Home Triangle
  drawCenterHome();

  // Draw Common Track Cells
  for (let c = 0; c < COMMON_TRACK.length; c++) {
    const [gx, gy] = COMMON_TRACK[c];
    drawTrackCell(gx, gy, c);
  }

  // Draw Colored Runways
  Object.keys(HOME_RUNWAYS).forEach(colorKey => {
    const runway = HOME_RUNWAYS[colorKey];
    const pObj = PLAYERS.find(p => p.key === colorKey);
    runway.forEach(([gx, gy]) => {
      ctx.fillStyle = pObj.color;
      ctx.fillRect(gx * CELL_SIZE + 1, gy * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
  });

  // Draw Tokens
  drawAllTokens();

  // Draw Dynamic VFX Particles
  drawParticles();
}

// Draw Yard Corner
function drawYard(x, y, color, darkColor, key) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 6 * CELL_SIZE, 6 * CELL_SIZE);

  ctx.fillStyle = darkColor;
  ctx.fillRect(x + 12, y + 12, 6 * CELL_SIZE - 24, 6 * CELL_SIZE - 24);

  // 4 Inner token circles
  const yardList = YARD_COORDS[key];
  yardList.forEach(([gx, gy]) => {
    ctx.beginPath();
    ctx.arc(gx * CELL_SIZE, gy * CELL_SIZE, CELL_SIZE * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// Center Triangle Home
function drawCenterHome() {
  const cx = 7.5 * CELL_SIZE;
  const cy = 7.5 * CELL_SIZE;

  // Red Left Triangle
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(6 * CELL_SIZE, 6 * CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.lineTo(6 * CELL_SIZE, 9 * CELL_SIZE);
  ctx.fill();

  // Green Top Triangle
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.moveTo(6 * CELL_SIZE, 6 * CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.lineTo(9 * CELL_SIZE, 6 * CELL_SIZE);
  ctx.fill();

  // Yellow Right Triangle
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(9 * CELL_SIZE, 6 * CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.lineTo(9 * CELL_SIZE, 9 * CELL_SIZE);
  ctx.fill();

  // Blue Bottom Triangle
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(6 * CELL_SIZE, 9 * CELL_SIZE);
  ctx.lineTo(cx, cy);
  ctx.lineTo(9 * CELL_SIZE, 9 * CELL_SIZE);
  ctx.fill();
}

// Track Cell
function drawTrackCell(gx, gy, trackIndex) {
  const x = gx * CELL_SIZE;
  const y = gy * CELL_SIZE;

  ctx.fillStyle = '#1e293b';
  // Starting colored track cell
  if (trackIndex === 0) ctx.fillStyle = '#ef4444';
  if (trackIndex === 13) ctx.fillStyle = '#10b981';
  if (trackIndex === 26) ctx.fillStyle = '#facc15';
  if (trackIndex === 39) ctx.fillStyle = '#38bdf8';

  ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

  // Safe Star Indicator
  if (SAFE_TILES.includes(trackIndex)) {
    ctx.fillStyle = '#f8fafc';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
  }
}

// Draw All Player Tokens (incorporates active hop animations)
function drawAllTokens() {
  gameState.players.forEach((p, pIdx) => {
    const pMeta = PLAYERS[pIdx];

    p.tokens.forEach((pos, tIdx) => {
      let [tx, ty] = getTokenCoords(pIdx, tIdx, pos);
      let arcOffset = 0;
      let scale = 1;

      // Check if this token is currently in flight animation
      const activeAnim = animatingTokens.find(a => a.playerIdx === pIdx && a.tokenIdx === tIdx);
      if (activeAnim) {
        tx = activeAnim.x;
        ty = activeAnim.y;
        arcOffset = activeAnim.arcOffset || 0;
        scale = 1 + (arcOffset / 20) * 0.25; // Expands slightly as it hops
      }

      const drawY = ty - arcOffset;

      // Subtle shadow under airborne token
      if (arcOffset > 0) {
        ctx.beginPath();
        ctx.arc(tx, ty + 4, CELL_SIZE * 0.35 * (1 - arcOffset / 30), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();
      }

      // Token Body
      ctx.beginPath();
      ctx.arc(tx, drawY, CELL_SIZE * 0.38 * scale, 0, Math.PI * 2);
      ctx.fillStyle = pMeta.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Inner Crown / Dot
      ctx.beginPath();
      ctx.arc(tx, drawY, CELL_SIZE * 0.16 * scale, 0, Math.PI * 2);
      ctx.fillStyle = pMeta.darkColor;
      ctx.fill();

      // Highlight active movable tokens (pulse indicator)
      if (
        !isAnimating &&
        gameState.currentTurn === pIdx &&
        gameState.hasRolled &&
        canMoveToken(pIdx, tIdx, gameState.diceRoll)
      ) {
        const pulse = Math.sin(performance.now() / 150) * 3;
        ctx.beginPath();
        ctx.arc(tx, drawY, CELL_SIZE * 0.48 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  });
}

// Draw Active Particle Effects (Captures, Blasts, Shockwaves)
function drawParticles() {
  for (let i = 0; i < activeParticles.length; i++) {
    const p = activeParticles[i];
    ctx.save();

    if (p.type === 'shockwave') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.lineWidth = p.lineWidth || 3;
      ctx.stroke();
    } else if (p.type === 'particle') {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// Helper to draw star shapes for VFX
function drawStar(c, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  c.beginPath();
  c.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    c.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    c.lineTo(x, y);
    rot += step;
  }
  c.lineTo(cx, cy - outerRadius);
  c.closePath();
  c.fill();
}

// Spawn Capture Explosion VFX
function spawnCaptureVFX(x, y, victimColor) {
  // Shockwave 1: Inner intense blast
  activeParticles.push({
    type: 'shockwave',
    x, y,
    radius: 5,
    speed: 120,
    color: '#ffffff',
    lineWidth: 5,
    alpha: 1,
    life: 0.35,
    maxLife: 0.35
  });

  // Shockwave 2: Outer colored burst
  activeParticles.push({
    type: 'shockwave',
    x, y,
    radius: 10,
    speed: 180,
    color: victimColor || '#f59e0b',
    lineWidth: 4,
    alpha: 1,
    life: 0.45,
    maxLife: 0.45
  });

  // 30 Exploding Debris & Spark Particles
  const colors = [victimColor, '#ffffff', '#fbbf24', '#ef4444', '#f87171'];
  for (let i = 0; i < 32; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 210;
    activeParticles.push({
      type: 'particle',
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30, // upward lift
      gravity: 120,
      size: 3 + Math.random() * 4,
      initialSize: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1.0,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.4 ? 'star' : 'circle'
    });
  }

  // Camera canvas micro-shake
  shakeCanvas();
}

// Canvas Screen Shake on Hit
function shakeCanvas() {
  const canvasEl = document.getElementById('ludoCanvas');
  if (!canvasEl) return;
  canvasEl.style.transition = 'transform 0.05s';
  canvasEl.style.transform = 'translate(3px, -3px) rotate(0.4deg)';
  setTimeout(() => {
    canvasEl.style.transform = 'translate(-3px, 2px) rotate(-0.3deg)';
    setTimeout(() => {
      canvasEl.style.transform = 'translate(2px, -1px)';
      setTimeout(() => {
        canvasEl.style.transform = 'none';
        canvasEl.style.transition = '';
      }, 50);
    }, 50);
  }, 50);
}

// Calculate Pixel Position for a token
function getTokenCoords(playerIdx, tokenIdx, pos) {
  const pMeta = PLAYERS[playerIdx];

  // In Yard Base
  if (pos === -1) {
    const [gx, gy] = YARD_COORDS[pMeta.key][tokenIdx];
    return [gx * CELL_SIZE, gy * CELL_SIZE];
  }

  // Finished Home
  if (pos >= 56) {
    const cx = 7.5 * CELL_SIZE;
    const cy = 7.5 * CELL_SIZE;
    const offsets = [[-12, -12], [12, -12], [-12, 12], [12, 12]];
    return [cx + offsets[tokenIdx][0], cy + offsets[tokenIdx][1]];
  }

  // Home Runway (pos 51 to 55)
  if (pos >= 51) {
    const runwayIdx = pos - 51;
    const [gx, gy] = HOME_RUNWAYS[pMeta.key][runwayIdx];
    return [gx * CELL_SIZE + CELL_SIZE / 2, gy * CELL_SIZE + CELL_SIZE / 2];
  }

  // On Global Circular Track (pos 0 to 50)
  const trackIdx = (pMeta.startIndex + pos) % 52;
  const [gx, gy] = COMMON_TRACK[trackIdx];
  return [gx * CELL_SIZE + CELL_SIZE / 2, gy * CELL_SIZE + CELL_SIZE / 2];
}

// Calculate waypoint list for a token moving from oldPos to targetPos
function buildMoveWaypoints(playerIdx, tokenIdx, startPos, endPos) {
  const waypoints = [];
  const startPt = getTokenCoords(playerIdx, tokenIdx, startPos);
  waypoints.push({ x: startPt[0], y: startPt[1] });

  if (startPos === -1) {
    // Coming out of yard: hop directly to track start (0)
    const endPt = getTokenCoords(playerIdx, tokenIdx, 0);
    waypoints.push({ x: endPt[0], y: endPt[1] });
    return waypoints;
  }

  // Intermediate step-by-step path
  for (let s = startPos + 1; s <= endPos; s++) {
    const pt = getTokenCoords(playerIdx, tokenIdx, s);
    waypoints.push({ x: pt[0], y: pt[1] });
  }

  return waypoints;
}

// Can a specific token move with the current roll?
function canMoveToken(playerIdx, tokenIdx, roll) {
  if (!roll) return false;
  const pos = gameState.players[playerIdx].tokens[tokenIdx];

  // Yard: requires roll of 6 to release
  if (pos === -1) {
    return roll === 6;
  }

  // Already home
  if (pos >= 56) return false;

  // Cannot overshoot exact home (step 56)
  if (pos + roll > 56) return false;

  return true;
}

// Check if player has ANY valid moves with the roll
function hasAnyValidMoves(playerIdx, roll) {
  const tokens = gameState.players[playerIdx].tokens;
  return tokens.some((_, i) => canMoveToken(playerIdx, i, roll));
}

// Roll Dice Handler
function handleRollClick() {
  if (gameState.winner || isAnimating) return;
  const isMyTurn = (gameState.mode === 'bots' && gameState.currentTurn === 0) || (gameState.mode === 'p2p' && gameState.currentTurn === gameState.myPlayerIdx);

  if (!isMyTurn) {
    showToast("Wait Your Turn", "It is currently not your turn to roll.", "⏳");
    return;
  }

  if (gameState.hasRolled) {
    showToast("Choose Token", "Click a highlighted piece on the board to move!", "👆");
    return;
  }

  rollDice();
}

function rollDice() {
  const cube = document.getElementById('diceCube');
  cube.classList.remove('dice-landed-pop');
  cube.classList.add('dice-rolling');

  // Multi-face rapid shuffling effect during roll
  const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  let shuffleInterval = setInterval(() => {
    cube.textContent = diceSymbols[Math.floor(Math.random() * 6)];
  }, 70);

  setTimeout(() => {
    clearInterval(shuffleInterval);
    cube.classList.remove('dice-rolling');
    cube.classList.add('dice-landed-pop');

    const roll = Math.floor(Math.random() * 6) + 1;
    gameState.diceRoll = roll;
    gameState.hasRolled = true;

    cube.textContent = diceSymbols[roll - 1];

    const currentP = gameState.players[gameState.currentTurn];
    const pMeta = PLAYERS[gameState.currentTurn];
    showToast(`${pMeta.name} Rolled!`, `${currentP.name} rolled a ${roll}!`, "🎲");

    // Check if player has any valid moves
    if (!hasAnyValidMoves(gameState.currentTurn, roll)) {
      document.getElementById('turnPrompt').textContent = `No moves possible with a ${roll}! Passing turn...`;
      setTimeout(nextTurn, 1000);
    } else {
      document.getElementById('turnPrompt').textContent = `Rolled a ${roll}! Select a piece to advance.`;

      // Auto-move if only 1 token can move
      const movableIndices = [];
      currentP.tokens.forEach((_, idx) => {
        if (canMoveToken(gameState.currentTurn, idx, roll)) movableIndices.push(idx);
      });

      if (movableIndices.length === 1 && !currentP.isBot) {
        setTimeout(() => moveToken(gameState.currentTurn, movableIndices[0]), 300);
      }
    }

    renderBoard();
    updateUI();

    // Sync over P2P if active
    if (gameState.mode === 'p2p' && peerEngine) {
      peerEngine.send({ type: 'DICE_ROLLED', roll: roll, turn: gameState.currentTurn });
    }
  }, 650);
}

// Handle Board Clicks to select token
function handleCanvasClick(e) {
  if (gameState.winner || !gameState.hasRolled || isAnimating) return;
  const isMyTurn = (gameState.mode === 'bots' && gameState.currentTurn === 0) || (gameState.mode === 'p2p' && gameState.currentTurn === gameState.myPlayerIdx);
  if (!isMyTurn) return;

  const rect = canvas.getBoundingClientRect();
  const scale = CANVAS_SIZE / rect.width;
  const clickX = (e.clientX - rect.left) * scale;
  const clickY = (e.clientY - rect.top) * scale;

  const currentP = gameState.currentTurn;
  const tokens = gameState.players[currentP].tokens;

  for (let i = 0; i < tokens.length; i++) {
    const [tx, ty] = getTokenCoords(currentP, i, tokens[i]);
    const dist = Math.hypot(clickX - tx, clickY - ty);

    if (dist <= CELL_SIZE * 0.55 && canMoveToken(currentP, i, gameState.diceRoll)) {
      moveToken(currentP, i);
      break;
    }
  }
}

// Move Token Logic with Smooth Multi-Waypoint Hop Animation
function moveToken(playerIdx, tokenIdx) {
  if (isAnimating) return;
  const p = gameState.players[playerIdx];
  const roll = gameState.diceRoll;
  const oldPos = p.tokens[tokenIdx];
  const targetPos = (oldPos === -1) ? 0 : (oldPos + roll);

  // Build waypoints for smooth jumping
  const waypoints = buildMoveWaypoints(playerIdx, tokenIdx, oldPos, targetPos);

  // Set animating state
  isAnimating = true;
  animatingTokens.push({
    playerIdx,
    tokenIdx,
    waypoints,
    stepIndex: 0,
    elapsed: 0,
    stepDuration: (oldPos === -1) ? 0.35 : 0.16, // Snappy hop per tile
    x: waypoints[0].x,
    y: waypoints[0].y,
    arcOffset: 0,
    onComplete: () => {
      // Finalize token position
      p.tokens[tokenIdx] = targetPos;
      onTokenMoveComplete(playerIdx, tokenIdx, oldPos, targetPos, roll);
    }
  });

  if (oldPos === -1) {
    showToast("Token Released!", `${p.name} released a piece onto the track!`, "🚀");
  }
}

// Post-move completion: captures, victory, bonus turns, and next turns
function onTokenMoveComplete(playerIdx, tokenIdx, oldPos, newPos, roll) {
  const p = gameState.players[playerIdx];
  let capturedVictim = false;

  // Check captures if landing on standard circular track
  if (newPos >= 0 && newPos <= 50) {
    const landingGlobalTrack = (PLAYERS[playerIdx].startIndex + newPos) % 52;

    if (!SAFE_TILES.includes(landingGlobalTrack)) {
      // Check other players on this tile
      gameState.players.forEach((otherP, otherIdx) => {
        if (otherIdx !== playerIdx) {
          otherP.tokens.forEach((otherPos, otherTIdx) => {
            if (otherPos >= 0 && otherPos <= 50) {
              const otherGlobalTrack = (PLAYERS[otherIdx].startIndex + otherPos) % 52;
              if (landingGlobalTrack === otherGlobalTrack) {
                // CAPTURE!
                const [vx, vy] = getTokenCoords(otherIdx, otherTIdx, otherPos);
                spawnCaptureVFX(vx, vy, PLAYERS[otherIdx].color);

                otherP.tokens[otherTIdx] = -1; // Sent back to yard
                showToast("⚔️ CAPTURED!", `${p.name} captured ${otherP.name}'s token and sent it home!`, "💥");
                capturedVictim = true;
              }
            }
          });
        }
      });
    }
  }

  // Check Victory
  if (p.tokens.every(pos => pos >= 56)) {
    endGame(playerIdx);
    return;
  }

  renderBoard();
  updateUI();

  // Sync Move P2P
  if (gameState.mode === 'p2p' && peerEngine) {
    peerEngine.send({ type: 'TOKEN_MOVED', playerIdx, tokenIdx, roll, state: gameState });
  }

  // Bonus Roll on 6 or on Capture!
  if (roll === 6 || capturedVictim) {
    const reason = (roll === 6) ? "rolling a 6" : "capturing an opponent";
    showToast("Bonus Roll!", `${p.name} earned an extra turn for ${reason}!`, "⭐");
    gameState.hasRolled = false;
    document.getElementById('turnPrompt').textContent = `Bonus roll granted for ${reason}!`;
    updateUI();

    if (p.isBot) {
      setTimeout(playBotTurn, 700);
    }
  } else {
    nextTurn();
  }
}

// Next Turn
function nextTurn() {
  gameState.hasRolled = false;
  gameState.diceRoll = null;
  gameState.currentTurn = (gameState.currentTurn + 1) % 4;

  renderBoard();
  updateUI();

  const nextP = gameState.players[gameState.currentTurn];
  const pMeta = PLAYERS[gameState.currentTurn];
  document.getElementById('turnPrompt').textContent = `${pMeta.name}'s turn (${nextP.name}).`;

  if (nextP.isBot && !gameState.winner) {
    setTimeout(playBotTurn, 750);
  }
}

// Autonomous Bot AI
function playBotTurn() {
  if (gameState.winner || isAnimating) return;
  const botIdx = gameState.currentTurn;
  const bot = gameState.players[botIdx];

  // Step 1: 3D Roll dice animation for Bot
  const cube = document.getElementById('diceCube');
  cube.classList.remove('dice-landed-pop');
  cube.classList.add('dice-rolling');

  const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  let shuffleInterval = setInterval(() => {
    cube.textContent = diceSymbols[Math.floor(Math.random() * 6)];
  }, 70);

  setTimeout(() => {
    clearInterval(shuffleInterval);
    cube.classList.remove('dice-rolling');
    cube.classList.add('dice-landed-pop');

    const roll = Math.floor(Math.random() * 6) + 1;
    gameState.diceRoll = roll;
    gameState.hasRolled = true;

    cube.textContent = diceSymbols[roll - 1];

    const pMeta = PLAYERS[botIdx];
    showToast(`${pMeta.name} Rolled`, `${bot.name} rolled a ${roll}!`, "🤖");

    // Step 2: Evaluate best move
    const movable = [];
    bot.tokens.forEach((pos, idx) => {
      if (canMoveToken(botIdx, idx, roll)) {
        movable.push({ idx, pos });
      }
    });

    if (movable.length === 0) {
      document.getElementById('turnPrompt').textContent = `${bot.name} has no valid moves with ${roll}. Passing...`;
      setTimeout(nextTurn, 900);
      return;
    }

    // Strategic Decision Weighting:
    // 1. Capture opponent piece (Highest priority!)
    // 2. Spawn token out of yard on 6
    // 3. Advance closest piece into home
    let bestToken = movable[0].idx;
    let maxWeight = -100;

    movable.forEach(({ idx, pos }) => {
      let weight = 0;

      // Release from yard
      if (pos === -1 && roll === 6) {
        weight += 60;
      }

      // Capture check
      if (pos >= 0) {
        const targetPos = pos + roll;
        if (targetPos <= 50) {
          const landingTrack = (pMeta.startIndex + targetPos) % 52;
          if (!SAFE_TILES.includes(landingTrack)) {
            gameState.players.forEach((otherP, oIdx) => {
              if (oIdx !== botIdx) {
                otherP.tokens.forEach(oPos => {
                  if (oPos >= 0 && oPos <= 50) {
                    const oTrack = (PLAYERS[oIdx].startIndex + oPos) % 52;
                    if (landingTrack === oTrack) {
                      weight += 120; // Massive capture bonus
                    }
                  }
                });
              }
            });
          }
        }
        // Reaching home runway
        if (targetPos >= 51) weight += 40;
        // Closer to home
        weight += pos;
      }

      if (weight > maxWeight) {
        maxWeight = weight;
        bestToken = idx;
      }
    });

    setTimeout(() => {
      moveToken(botIdx, bestToken);
    }, 550);
  }, 650);
}

function endGame(winnerIdx) {
  gameState.winner = winnerIdx;
  const p = gameState.players[winnerIdx];
  const pMeta = PLAYERS[winnerIdx];
  showToast("👑 MATCH WON!", `${p.name} (${pMeta.name}) navigated all 4 tokens home and won the match!`, "🏆");
  document.getElementById('turnPrompt').textContent = `🏆 ${p.name} (${pMeta.name}) Wins!`;
}

// Update Scoreboard UI
function updateUI() {
  const pKeys = ['Red', 'Green', 'Yellow', 'Blue'];

  gameState.players.forEach((p, idx) => {
    const key = pKeys[idx];
    const nameEl = document.getElementById(`p${key}Name`);
    const typeEl = document.getElementById(`p${key}Type`);
    const scoreEl = document.getElementById(`p${key}Score`);
    const cardEl = document.getElementById(`p${key}Card`);

    nameEl.textContent = p.name;
    typeEl.textContent = p.isBot ? '🤖 Autonomous Bot' : '👤 Human Explorer';

    const homeCount = p.tokens.filter(pos => pos >= 56).length;
    scoreEl.textContent = `${homeCount}/4 Home`;

    if (gameState.currentTurn === idx) {
      cardEl.classList.add('active-turn');
    } else {
      cardEl.classList.remove('active-turn');
    }
  });

  // Roll button state
  const rollBtn = document.getElementById('rollBtn');
  const isMyTurn = (gameState.mode === 'bots' && gameState.currentTurn === 0) || (gameState.mode === 'p2p' && gameState.currentTurn === gameState.myPlayerIdx);

  rollBtn.disabled = !isMyTurn || gameState.hasRolled || !!gameState.winner;
  rollBtn.style.opacity = rollBtn.disabled ? '0.5' : '1';
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

// Setup Lobby Tabs & Buttons
function setupLobbyEvents() {
  const lobbyModal = document.getElementById('lobbyModal');
  const openLobbyBtn = document.getElementById('openLobbyBtn');
  const closeLobbyBtn = document.getElementById('closeLobbyBtn');

  const tabBots = document.getElementById('tabBots');
  const tabCreate = document.getElementById('tabCreate');
  const tabJoin = document.getElementById('tabJoin');

  const viewBots = document.getElementById('viewBots');
  const viewCreate = document.getElementById('viewCreate');
  const viewJoin = document.getElementById('viewJoin');

  openLobbyBtn.addEventListener('click', () => { lobbyModal.style.display = 'flex'; });
  closeLobbyBtn.addEventListener('click', () => { lobbyModal.style.display = 'none'; });

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

  tabBots.addEventListener('click', () => switchTab('bots'));
  tabCreate.addEventListener('click', () => switchTab('create'));
  tabJoin.addEventListener('click', () => switchTab('join'));

  // Start Solo Match vs 3 Bots
  document.getElementById('startSoloBotsBtn').addEventListener('click', () => {
    const nick = document.getElementById('nicknameInput').value.trim() || 'Player-1';
    gameState.mode = 'bots';
    gameState.myPlayerIdx = 0;
    gameState.players[0] = { id: 0, name: nick, isBot: false, tokens: [-1, -1, -1, -1] };
    gameState.players[1] = { id: 1, name: 'Bot Green', isBot: true, tokens: [-1, -1, -1, -1] };
    gameState.players[2] = { id: 2, name: 'Bot Yellow', isBot: true, tokens: [-1, -1, -1, -1] };
    gameState.players[3] = { id: 3, name: 'Bot Blue', isBot: true, tokens: [-1, -1, -1, -1] };

    resetMatch();
    lobbyModal.style.display = 'none';
    showToast("Match Started!", "Playing as Red against 3 autonomous Bots!", "🎲");
  });

  // Host P2P Room
  document.getElementById('hostRoomBtn').addEventListener('click', () => {
    const nick = document.getElementById('nicknameInput').value.trim() || 'Player-1';
    const humanCount = parseInt(document.getElementById('humanCountSelect').value, 10);
    const roomCode = document.getElementById('roomNameInput').value.trim();

    gameState.mode = 'p2p';
    gameState.myPlayerIdx = 0;

    initMultiP2P();
    const createdCode = peerEngine.initHost(roomCode);

    document.getElementById('hostWaitingArea').style.display = 'block';
    const shareInput = document.getElementById('shareLinkInput');
    shareInput.value = `${window.location.origin}${window.location.pathname}?room=${createdCode}`;

    // Configure humans and fill rest with bots
    gameState.players[0] = { id: 0, name: nick, isBot: false, tokens: [-1, -1, -1, -1] };
    for (let i = 1; i < 4; i++) {
      if (i < humanCount) {
        gameState.players[i] = { id: i, name: `Waiting...`, isBot: false, tokens: [-1, -1, -1, -1] };
      } else {
        gameState.players[i] = { id: i, name: `Bot ${PLAYERS[i].name}`, isBot: true, tokens: [-1, -1, -1, -1] };
      }
    }
  });

  // Start Multi match now with connected humans + fill remaining seats with bots
  document.getElementById('startMultiplayerMatchBtn').addEventListener('click', () => {
    // Fill any still unconnected human slots with bots
    for (let i = 1; i < 4; i++) {
      if (gameState.players[i].name === 'Waiting...') {
        gameState.players[i].name = `Bot ${PLAYERS[i].name}`;
        gameState.players[i].isBot = true;
      }
    }

    resetMatch();
    lobbyModal.style.display = 'none';
    if (peerEngine) peerEngine.send({ type: 'MATCH_STARTED', state: gameState });
    showToast("Match Started!", "Room started! Remaining seats filled with Bots.", "🚀");
  });

  // Join Room
  document.getElementById('connectRoomBtn').addEventListener('click', () => {
    const nick = document.getElementById('nicknameInput').value.trim() || 'Player-2';
    const code = document.getElementById('joinRoomCodeInput').value.trim();
    if (!code) {
      alert("Please enter target room code!");
      return;
    }

    gameState.mode = 'p2p';
    initMultiP2P();
    peerEngine.initJoin(code, nick);
  });
}

function initMultiP2P() {
  if (peerEngine) peerEngine.destroy();

  peerEngine = new MultiPeerEngine({
    gamePrefix: 'ludo',
    maxPlayers: 4,
    onStatus: (status) => {
      const el = document.getElementById('joinStatusText');
      if (el) el.textContent = status;
    },
    onPlayerJoined: (client) => {
      document.getElementById('waitingCountText').textContent = `Connected: ${peerEngine.clientConns.length + 1} / 4 Players`;
      gameState.players[client.playerIndex] = { id: client.playerIndex, name: client.name, isBot: false, tokens: [-1, -1, -1, -1] };
      showToast("Player Joined!", `${client.name} connected to the room!`, "👋");
      peerEngine.send({ type: 'SYNC_LOBBY', players: gameState.players });
      updateUI();
    },
    onData: (data) => {
      if (data.type === 'MATCH_STARTED' || data.type === 'TOKEN_MOVED') {
        gameState = data.state;
        renderBoard();
        updateUI();
      } else if (data.type === 'DICE_ROLLED') {
        gameState.diceRoll = data.roll;
        gameState.currentTurn = data.turn;
        gameState.hasRolled = true;
        const cube = document.getElementById('diceCube');
        cube.classList.remove('dice-landed-pop');
        cube.classList.add('dice-rolling');

        const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let shuffleInterval = setInterval(() => {
          cube.textContent = diceSymbols[Math.floor(Math.random() * 6)];
        }, 70);

        setTimeout(() => {
          clearInterval(shuffleInterval);
          cube.classList.remove('dice-rolling');
          cube.classList.add('dice-landed-pop');
          cube.textContent = diceSymbols[data.roll - 1];
          renderBoard();
          updateUI();
        }, 650);
      } else if (data.type === 'SYNC_LOBBY') {
        gameState.players = data.players;
        updateUI();
      }
    }
  });
}

function resetMatch() {
  gameState.currentTurn = 0;
  gameState.diceRoll = null;
  gameState.hasRolled = false;
  gameState.winner = null;
  gameState.players.forEach(p => p.tokens = [-1, -1, -1, -1]);
  renderBoard();
  updateUI();
}

window.addEventListener('DOMContentLoaded', () => {
  initLudo();

  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    document.getElementById('lobbyModal').style.display = 'flex';
    document.getElementById('tabJoin').click();
    document.getElementById('joinRoomCodeInput').value = room;
  }
});
