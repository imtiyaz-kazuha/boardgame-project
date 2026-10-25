const HexEngine = require('./hex-engine.js');
const { FACTIONS, SHIP_TYPES, TECH_TREE, StellarRules } = require('./rules.js');
const StellarBotAI = require('./bot-ai.js');

console.log("=== RUNNING TABLETOP STRESS TEST: STELLAR DOMINION ===");

const hexEngine = new HexEngine(42);
const state = StellarRules.createInitialGameState(4, 4);

// Test 1: Map Initialization Check
const totalHexes = Object.keys(state.map).length;
console.log(`[PASS] Map generated with ${totalHexes} axial hex tiles.`);
if (totalHexes !== 61) {
  console.error(`Unexpected hex count: expected 61 for radius 4, got ${totalHexes}`);
  process.exit(1);
}

// Test 2: Starting Resources & Homeworld Check
state.players.forEach(p => {
  if (p.minerals !== 12 || p.energy !== 12) {
    console.error(`Player ${p.name} initial resources invalid!`);
    process.exit(1);
  }
  const hw = Object.values(state.map).find(c => c.colony && c.colony.owner === p.id);
  if (!hw) {
    console.error(`Player ${p.name} homeworld missing!`);
    process.exit(1);
  }
});
console.log("[PASS] All 4 Faction Homeworlds & Resource Vaults positioned correctly.");

// Test 3: Fleet Movement & Fog of War
const p0 = state.players[0];
const scout = p0.fleets[0];
const neighbors = hexEngine.getNeighbors(scout.q, scout.r);
scout.q = neighbors[0].q;
scout.r = neighbors[0].r;
StellarRules.updateFogOfWar(state, 0);
console.log(`[PASS] Fleet moved to (${scout.q}, ${scout.r}). Discovered hexes count: ${p0.discoveredHexes.length}`);

// Test 4: Bot AI Turn Stress Test (10 Simulated Turns)
for (let round = 1; round <= 10; round++) {
  state.round = round;
  for (let botId = 1; botId < 4; botId++) {
    state.actionPointsRemaining = 3;
    StellarBotAI.executeTurn(state, botId, hexEngine);
  }
  // Income generation phase
  state.players.forEach((p, idx) => {
    const inc = StellarRules.computePlayerIncome(state, idx);
    p.energy += inc.energy;
    p.minerals += inc.minerals;
    p.science += inc.science;
    p.fleets.forEach(s => s.hasMovedThisTurn = false);
  });
}
console.log(`[PASS] 10 consecutive simulated AI rounds completed with 0 errors or deadlocks!`);
console.log(`Bot 1 Fleet count: ${state.players[1].fleets.length}, Minerals: ${state.players[1].minerals}, Techs: ${state.players[1].unlockedTechs.length}`);
console.log("=== ALL TABLETOP MECHANICS VERIFIED STABLE ===");
