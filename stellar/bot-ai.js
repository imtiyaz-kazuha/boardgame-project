/**
 * Bot AI Engine for Stellar Dominion
 * Decides strategic 4X moves without analysis paralysis or infinite loops.
 */

if (typeof TECH_TREE === 'undefined' && typeof require !== 'undefined') {
  var { TECH_TREE, SHIP_TYPES, StellarRules } = require('./rules.js');
}

class StellarBotAI {
  static executeTurn(state, botIdx, hexEngine) {
    const bot = state.players[botIdx];
    if (!bot || !bot.isBot) return;

    let ap = state.actionPointsRemaining;

    // 1. Research Tech if science allows
    const affordableTech = TECH_TREE.find(t => !bot.unlockedTechs.includes(t.id) && bot.science >= t.cost);
    if (affordableTech && ap > 0) {
      bot.science -= affordableTech.cost;
      bot.unlockedTechs.push(affordableTech.id);
      ap--;
    }

    // 2. Colonize with Colony Ship if standing on an uncolonized planet
    const colonyShip = bot.fleets.find(s => s.type === 'colony');
    if (colonyShip && ap > 0) {
      const cellKey = `${colonyShip.q},${colonyShip.r}`;
      const cell = state.map[cellKey];
      if (cell && cell.type.startsWith('planet') && !cell.colony && bot.minerals >= 6 && bot.energy >= 4) {
        bot.minerals -= 6;
        bot.energy -= 4;
        cell.colony = { owner: botIdx, level: 1, districts: ['mining_district'] };
        // Consume colony ship
        bot.fleets = bot.fleets.filter(s => s.id !== colonyShip.id);
        ap--;
      }
    }

    // 3. Move Scout or Ships towards unexplored/adjacent sectors
    for (const ship of bot.fleets) {
      if (ap <= 0) break;
      if (ship.hasMovedThisTurn) continue;

      const neighbors = hexEngine.getNeighbors(ship.q, ship.r);
      const validMoves = neighbors.filter(n => state.map[`${n.q},${n.r}`]);

      // Prioritize unexplored hexes or uncolonized planets
      const unexplored = validMoves.filter(n => !bot.discoveredHexes.includes(`${n.q},${n.r}`));
      const target = (unexplored.length > 0) ? unexplored[0] : validMoves[Math.floor(Math.random() * validMoves.length)];

      if (target) {
        ship.q = target.q;
        ship.r = target.r;
        ship.hasMovedThisTurn = true;
        ap--;

        // Check combat in target hex
        StellarRules.resolveContestedCombat(state, ship.q, ship.r);
        StellarRules.updateFogOfWar(state, botIdx);
      }
    }

    // 4. Build Frigate or Colony Ship if resources permit
    if (ap > 0 && bot.minerals >= 8 && bot.energy >= 6) {
      // Find bot's homeworld or first colony
      const botBase = Object.values(state.map).find(c => c.colony && c.colony.owner === botIdx);
      if (botBase && bot.fleets.filter(f => f.q === botBase.q && f.r === botBase.r).length < 3) {
        const typeToBuild = (bot.fleets.some(s => s.type === 'colony')) ? 'frigate' : 'colony';
        const spec = SHIP_TYPES[typeToBuild];
        bot.minerals -= spec.cost.minerals;
        bot.energy -= spec.cost.energy;
        bot.fleets.push({
          id: `f_${botIdx}_${Date.now()}_${Math.floor(Math.random() * 100)}`,
          owner: botIdx,
          type: typeToBuild,
          q: botBase.q,
          r: botBase.r,
          hull: spec.hull,
          shields: spec.shields,
          hasMovedThisTurn: true
        });
        ap--;
      }
    }

    state.actionPointsRemaining = 0;
  }
}

if (typeof module !== 'undefined') {
  module.exports = StellarBotAI;
}
