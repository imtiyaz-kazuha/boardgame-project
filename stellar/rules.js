/**
 * Stellar Rules & State Engine
 * Pure logic module: validation, combat, economy, and deterministic actions.
 */

if (typeof HexEngine === 'undefined' && typeof require !== 'undefined') {
  var HexEngine = require('./hex-engine.js');
}

const FACTIONS = [
  {
    id: 0,
    name: 'Solarian Concordat',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    flag: '☀️',
    trait: '+20% Mineral extraction, starts with reinforced Hull plating.'
  },
  {
    id: 1,
    name: 'Vortex Syndicate',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    flag: '🌀',
    trait: '+25% Energy economy, hyper-efficient starship jumpgates.'
  },
  {
    id: 2,
    name: 'Aethelgard Ascendancy',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    flag: '👁️',
    trait: '+30% Science research rate, psychic vision through deep space.'
  },
  {
    id: 3,
    name: 'Kryx Swarm',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    flag: '🦂',
    trait: '+20% Fleet production speed, aggressive swarm frigates.'
  }
];

const SHIP_TYPES = {
  scout: {
    name: 'Scout Probe',
    icon: '🛰️',
    cost: { minerals: 3, energy: 2 },
    upkeep: 1,
    hull: 2,
    shields: 0,
    attack: 1,
    speed: 2,
    vision: 2
  },
  colony: {
    name: 'Colony Ship',
    icon: '🛸',
    cost: { minerals: 6, energy: 4 },
    upkeep: 1,
    hull: 3,
    shields: 1,
    attack: 0,
    speed: 1,
    vision: 1
  },
  frigate: {
    name: 'Frigate',
    icon: '🚀',
    cost: { minerals: 5, energy: 3 },
    upkeep: 1,
    hull: 4,
    shields: 2,
    attack: 3,
    speed: 1,
    vision: 1
  },
  cruiser: {
    name: 'Cruiser',
    icon: '🛳️',
    cost: { minerals: 10, energy: 6 },
    upkeep: 2,
    hull: 8,
    shields: 4,
    attack: 6,
    speed: 1,
    vision: 1
  },
  dreadnought: {
    name: 'Dreadnought',
    icon: '⚡',
    cost: { minerals: 20, energy: 12 },
    upkeep: 4,
    hull: 16,
    shields: 8,
    attack: 12,
    speed: 1,
    vision: 2
  }
};

const TECH_TREE = [
  {
    id: 'warp_drive',
    tier: 1,
    name: 'Ion Warp Thrusters',
    cost: 8,
    desc: '+1 Fleet Movement Speed for all combat vessels.',
    icon: '🚀'
  },
  {
    id: 'mining_automation',
    tier: 1,
    name: 'Automated Mineral Siphon',
    cost: 8,
    desc: '+2 Mineral income per planetary colony.',
    icon: '🪨'
  },
  {
    id: 'plasma_shields',
    tier: 2,
    name: 'Plasma Shield Matrix',
    cost: 16,
    desc: '+2 Shields to all starships.',
    icon: '🛡️'
  },
  {
    id: 'orbital_labs',
    tier: 2,
    name: 'Orbital Research Habitats',
    cost: 16,
    desc: '+3 Science research points per planetary colony.',
    icon: '🔬'
  },
  {
    id: 'cruiser_tech',
    tier: 3,
    name: 'Capital Ship Engineering',
    cost: 26,
    desc: 'Unlocks construction of Heavy Cruisers.',
    icon: '🛳️'
  },
  {
    id: 'galactic_nexus',
    tier: 4,
    name: 'Galactic Ascendance Nexus',
    cost: 40,
    desc: 'Dominion Victory Wonder! Grants +30 Victory score.',
    icon: '🌌'
  }
];

class StellarRules {
  static createInitialGameState(numPlayers = 4, radius = 4) {
    const hexEngine = new HexEngine(42);
    const grid = hexEngine.generateMapGrid(radius);

    // Planetary generation seed
    const terrainTypes = ['empty', 'empty', 'planet_terrestrial', 'planet_volcanic', 'planet_oceanic', 'asteroids', 'nebula', 'alien_vault'];

    const map = {};
    grid.forEach(cell => {
      // Keep center coordinate as Ancient Galactic Core
      if (cell.q === 0 && cell.r === 0) {
        map[cell.key] = {
          q: cell.q,
          r: cell.r,
          type: 'galactic_core',
          name: 'Galactic Core',
          minerals: 4,
          energy: 4,
          science: 4,
          colony: null,
          hasVault: true
        };
        return;
      }

      const roll = Math.random();
      let type = 'empty';
      let name = 'Deep Void';
      let minerals = 0;
      let energy = 1;
      let science = 0;

      if (roll < 0.35) {
        type = 'empty';
        name = 'Deep Space';
      } else if (roll < 0.55) {
        type = 'planet_terrestrial';
        name = 'Terran World';
        minerals = 2;
        energy = 2;
        science = 1;
      } else if (roll < 0.68) {
        type = 'planet_volcanic';
        name = 'Volcanic Forge World';
        minerals = 4;
        energy = 1;
        science = 0;
      } else if (roll < 0.80) {
        type = 'planet_oceanic';
        name = 'Oceanic Biosphere';
        minerals = 1;
        energy = 3;
        science = 2;
      } else if (roll < 0.90) {
        type = 'asteroids';
        name = 'Mineral Asteroids';
        minerals = 3;
        energy = 0;
        science = 0;
      } else if (roll < 0.96) {
        type = 'nebula';
        name = 'Dense Nebula';
        minerals = 0;
        energy = 2;
        science = 2;
      } else {
        type = 'alien_vault';
        name = 'Precursor Vault';
        minerals = 2;
        energy = 2;
        science = 4;
      }

      map[cell.key] = {
        q: cell.q,
        r: cell.r,
        type,
        name,
        minerals,
        energy,
        science,
        colony: null
      };
    });

    // Faction Start Locations along map perimeter
    const startCoordinates = [
      { q: 0, r: -radius }, // North
      { q: radius, r: -radius }, // Northeast
      { q: 0, r: radius }, // South
      { q: -radius, r: radius } // Southwest
    ];

    const players = [];
    for (let i = 0; i < numPlayers; i++) {
      const fMeta = FACTIONS[i];
      const startCoord = startCoordinates[i % startCoordinates.length];
      const startKey = `${startCoord.q},${startCoord.r}`;

      // Designate Capital Homeworld
      if (map[startKey]) {
        map[startKey].type = 'homeworld';
        map[startKey].name = `${fMeta.name} Homeworld`;
        map[startKey].minerals = 3;
        map[startKey].energy = 3;
        map[startKey].science = 2;
        map[startKey].colony = {
          owner: i,
          level: 1,
          districts: ['headquarters']
        };
      }

      players.push({
        id: i,
        name: fMeta.name,
        color: fMeta.color,
        isBot: i !== 0,
        energy: 12,
        minerals: 12,
        science: 4,
        income: { energy: 3, minerals: 3, science: 2 },
        unlockedTechs: [],
        discoveredHexes: [startKey],
        fleets: [
          {
            id: `f_${i}_scout`,
            owner: i,
            type: 'scout',
            q: startCoord.q,
            r: startCoord.r,
            hull: SHIP_TYPES.scout.hull,
            shields: SHIP_TYPES.scout.shields,
            hasMovedThisTurn: false
          },
          {
            id: `f_${i}_colony`,
            owner: i,
            type: 'colony',
            q: startCoord.q,
            r: startCoord.r,
            hull: SHIP_TYPES.colony.hull,
            shields: SHIP_TYPES.colony.shields,
            hasMovedThisTurn: false
          }
        ]
      });
    }

    return {
      round: 1,
      maxRounds: 30,
      currentTurn: 0,
      radius,
      map,
      players,
      actionPointsRemaining: 3,
      maxActionPoints: 3,
      winner: null,
      battleLog: []
    };
  }

  // Calculate Per-Turn Resource Income for a Player
  static computePlayerIncome(state, playerIdx) {
    const p = state.players[playerIdx];
    let e = 0;
    let m = 0;
    let s = 0;

    // Colonized hex output
    Object.values(state.map).forEach(cell => {
      if (cell.colony && cell.colony.owner === playerIdx) {
        e += cell.energy;
        m += cell.minerals;
        s += cell.science;
        if (p.unlockedTechs.includes('mining_automation')) m += 2;
        if (p.unlockedTechs.includes('orbital_labs')) s += 3;
      }
    });

    // Faction bonuses
    if (playerIdx === 0) m = Math.floor(m * 1.2); // Solarian: +20% minerals
    if (playerIdx === 1) e = Math.floor(e * 1.25); // Vortex: +25% energy
    if (playerIdx === 2) s = Math.floor(s * 1.3); // Aethelgard: +30% science

    // Fleet upkeep deductions
    let upkeep = 0;
    p.fleets.forEach(ship => {
      const spec = SHIP_TYPES[ship.type];
      if (spec) upkeep += spec.upkeep;
    });

    e = Math.max(0, e - upkeep);

    return { energy: e, minerals: m, science: s, upkeep };
  }

  // Reveal fog of war around a player's fleet units
  static updateFogOfWar(state, playerIdx) {
    const p = state.players[playerIdx];
    const hexEngine = new HexEngine(42);
    const discoveredSet = new Set(p.discoveredHexes);

    // Reveal around colonies
    Object.values(state.map).forEach(cell => {
      if (cell.colony && cell.colony.owner === playerIdx) {
        discoveredSet.add(`${cell.q},${cell.r}`);
        hexEngine.getNeighbors(cell.q, cell.r).forEach(n => {
          if (state.map[`${n.q},${n.r}`]) discoveredSet.add(`${n.q},${n.r}`);
        });
      }
    });

    // Reveal around active ships
    p.fleets.forEach(ship => {
      discoveredSet.add(`${ship.q},${ship.r}`);
      const range = (p.unlockedTechs.includes('warp_drive') || playerIdx === 2) ? 2 : 1;
      hexEngine.getNeighbors(ship.q, ship.r).forEach(n => {
        if (state.map[`${n.q},${n.r}`]) discoveredSet.add(`${n.q},${n.r}`);
      });
    });

    p.discoveredHexes = Array.from(discoveredSet);
  }

  // Tactical Space Combat Resolution in a Contested Hex
  static resolveContestedCombat(state, q, r) {
    const shipsInHex = [];
    state.players.forEach(p => {
      p.fleets.forEach(ship => {
        if (ship.q === q && ship.r === r) {
          shipsInHex.push({ player: p, ship, spec: SHIP_TYPES[ship.type] });
        }
      });
    });

    // Group by owner
    const owners = [...new Set(shipsInHex.map(s => s.player.id))];
    if (owners.length <= 1) return null; // No contest

    // Battle occurs between first two factions
    const sideA = shipsInHex.filter(s => s.player.id === owners[0]);
    const sideB = shipsInHex.filter(s => s.player.id === owners[1]);

    const attackA = sideA.reduce((sum, s) => sum + s.spec.attack, 0) + Math.floor(Math.random() * 3);
    const attackB = sideB.reduce((sum, s) => sum + s.spec.attack, 0) + Math.floor(Math.random() * 3);

    // Apply damage to side B
    let damageRemainingB = attackA;
    sideB.forEach(entry => {
      const dmg = Math.min(entry.ship.hull, damageRemainingB);
      entry.ship.hull -= dmg;
      damageRemainingB -= dmg;
    });

    // Apply damage to side A
    let damageRemainingA = attackB;
    sideA.forEach(entry => {
      const dmg = Math.min(entry.ship.hull, damageRemainingA);
      entry.ship.hull -= dmg;
      damageRemainingA -= dmg;
    });

    // Remove destroyed ships
    state.players.forEach(p => {
      p.fleets = p.fleets.filter(ship => ship.hull > 0);
    });

    const report = {
      q,
      r,
      factionA: sideA[0].player.name,
      factionB: sideB[0].player.name,
      dmgDealtA: attackA,
      dmgDealtB: attackB
    };

    state.battleLog.push(report);
    return report;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { FACTIONS, SHIP_TYPES, TECH_TREE, StellarRules };
}
