// Real Haversine Distance
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 20 Strategic US States and Capital / Major Hub Cities
const US_CITIES = [
  // West Coast
  { id: 'seattle', name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, hasAirport: true },
  { id: 'sanfrancisco', name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, hasAirport: true },
  { id: 'losangeles', name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, hasAirport: true },
  
  // Mountain / Southwest
  { id: 'lasvegas', name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, hasAirport: true },
  { id: 'phoenix', name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, hasAirport: false },
  { id: 'saltlake', name: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910, hasAirport: false },
  { id: 'denver', name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, hasAirport: true },

  // Midwest & Plains
  { id: 'minneapolis', name: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650, hasAirport: true },
  { id: 'kansascity', name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, hasAirport: false },
  { id: 'chicago', name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, hasAirport: true },
  { id: 'detroit', name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, hasAirport: false },

  // South
  { id: 'dallas', name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, hasAirport: true },
  { id: 'houston', name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, hasAirport: true },
  { id: 'neworleans', name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715, hasAirport: false },
  { id: 'nashville', name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, hasAirport: false },
  { id: 'atlanta', name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, hasAirport: true },
  { id: 'miami', name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, hasAirport: true },

  // East Coast
  { id: 'washington', name: 'Washington D.C.', state: 'DC', lat: 38.9072, lng: -77.0369, hasAirport: true },
  { id: 'newyork', name: 'New York City', state: 'NY', lat: 40.7128, lng: -74.0060, hasAirport: true },
  { id: 'boston', name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, hasAirport: false }
];

// State Transit Capacities:
// Major Hub States (CA, TX, NY, IL) support higher capacity (2 Trains, 2 Roads, 2 Flights)
// Medium States (WA, GA, FL, CO, DC) support (1 Train, 1 Road, 1 Flight)
// Smaller transit states (UT, NV, AZ, MO, TN, MI, LA, MA, MN) support (1 Train, 1 Road, 0 Flight)
const STATE_CAPACITIES = {
  'CA': { train: 2, road: 2, flight: 2, name: 'California (Mega Hub)' },
  'TX': { train: 2, road: 2, flight: 2, name: 'Texas (Mega Hub)' },
  'NY': { train: 2, road: 2, flight: 2, name: 'New York (Mega Hub)' },
  'IL': { train: 2, road: 2, flight: 2, name: 'Illinois (Mega Hub)' },

  'WA': { train: 1, road: 1, flight: 1, name: 'Washington' },
  'GA': { train: 1, road: 1, flight: 1, name: 'Georgia' },
  'FL': { train: 1, road: 1, flight: 1, name: 'Florida' },
  'CO': { train: 1, road: 1, flight: 1, name: 'Colorado' },
  'DC': { train: 1, road: 1, flight: 1, name: 'Washington D.C.' },

  'NV': { train: 1, road: 1, flight: 1, name: 'Nevada' },
  'MN': { train: 1, road: 1, flight: 1, name: 'Minnesota' },
  'AZ': { train: 1, road: 2, flight: 0, name: 'Arizona' },
  'UT': { train: 2, road: 1, flight: 0, name: 'Utah' },
  'MO': { train: 1, road: 2, flight: 0, name: 'Missouri' },
  'MI': { train: 1, road: 1, flight: 0, name: 'Michigan' },
  'LA': { train: 1, road: 2, flight: 0, name: 'Louisiana' },
  'TN': { train: 1, road: 2, flight: 0, name: 'Tennessee' },
  'MA': { train: 1, road: 1, flight: 0, name: 'Massachusetts' }
};

// All distinct US states represented in the game
const TOTAL_GAME_STATES = Array.from(new Set(US_CITIES.map(c => c.state)));

// America Transit Routes
// Supports: 'train', 'road', 'flight'
const US_ROUTES = [
  // West Coast Corridor
  { id: 'r_sea_sf', from: 'seattle', to: 'sanfrancisco', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_sf_la', from: 'sanfrancisco', to: 'losangeles', cost: 1, modes: ['road', 'train'], offset: 0 },
  { id: 'r_la_lv', from: 'losangeles', to: 'lasvegas', cost: 1, modes: ['road'], offset: 0 },
  { id: 'r_la_phx', from: 'losangeles', to: 'phoenix', cost: 1, modes: ['road', 'train'], offset: 0 },

  // Mountain & Southwest
  { id: 'r_sea_slc', from: 'seattle', to: 'saltlake', cost: 2, modes: ['train'], offset: 0 },
  { id: 'r_sf_slc', from: 'sanfrancisco', to: 'saltlake', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_lv_slc', from: 'lasvegas', to: 'saltlake', cost: 1, modes: ['road'], offset: 0 },
  { id: 'r_slc_den', from: 'saltlake', to: 'denver', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_phx_den', from: 'phoenix', to: 'denver', cost: 2, modes: ['road'], offset: 0 },
  { id: 'r_phx_dal', from: 'phoenix', to: 'dallas', cost: 3, modes: ['road', 'train'], offset: 0 },

  // Midwest Corridors
  { id: 'r_den_kc', from: 'denver', to: 'kansascity', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_den_min', from: 'denver', to: 'minneapolis', cost: 3, modes: ['train'], offset: 0 },
  { id: 'r_min_chi', from: 'minneapolis', to: 'chicago', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_kc_chi', from: 'kansascity', to: 'chicago', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_kc_dal', from: 'kansascity', to: 'dallas', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_chi_det', from: 'chicago', to: 'detroit', cost: 1, modes: ['train', 'road'], offset: 0 },

  // South & Texas
  { id: 'r_dal_hou', from: 'dallas', to: 'houston', cost: 1, modes: ['road', 'train'], offset: 0 },
  { id: 'r_hou_no', from: 'houston', to: 'neworleans', cost: 1, modes: ['road', 'train'], offset: 0 },
  { id: 'r_no_atl', from: 'neworleans', to: 'atlanta', cost: 2, modes: ['road', 'train'], offset: 0 },
  { id: 'r_dal_atl', from: 'dallas', to: 'atlanta', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_atl_mia', from: 'atlanta', to: 'miami', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_no_mia', from: 'neworleans', to: 'miami', cost: 3, modes: ['road'], offset: 0 },

  // East Coast & Rust Belt
  { id: 'r_det_ny', from: 'detroit', to: 'newyork', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_chi_nash', from: 'chicago', to: 'nashville', cost: 2, modes: ['road', 'train'], offset: 0 },
  { id: 'r_nash_atl', from: 'nashville', to: 'atlanta', cost: 1, modes: ['road'], offset: 0 },
  { id: 'r_atl_dc', from: 'atlanta', to: 'washington', cost: 2, modes: ['train', 'road'], offset: 0 },
  { id: 'r_dc_ny', from: 'washington', to: 'newyork', cost: 1, modes: ['train', 'road'], offset: 0 },
  { id: 'r_ny_bos', from: 'newyork', to: 'boston', cost: 1, modes: ['train', 'road'], offset: 0 },

  // Direct Transcontinental Air-Corridors between Major Airport Hubs!
  { id: 'r_air_sea_chi', from: 'seattle', to: 'chicago', cost: 3, modes: ['flight'], offset: 15 },
  { id: 'r_air_la_chi', from: 'losangeles', to: 'chicago', cost: 3, modes: ['flight'], offset: 15 },
  { id: 'r_air_la_ny', from: 'losangeles', to: 'newyork', cost: 4, modes: ['flight'], offset: 25 },
  { id: 'r_air_sf_ny', from: 'sanfrancisco', to: 'newyork', cost: 4, modes: ['flight'], offset: 25 },
  { id: 'r_air_chi_ny', from: 'chicago', to: 'newyork', cost: 2, modes: ['flight'], offset: 15 },
  { id: 'r_air_dal_ny', from: 'dallas', to: 'newyork', cost: 3, modes: ['flight'], offset: 15 },
  { id: 'r_air_atl_mia', from: 'atlanta', to: 'miami', cost: 2, modes: ['flight'], offset: 15 },
  { id: 'r_air_den_atl', from: 'denver', to: 'atlanta', cost: 3, modes: ['flight'], offset: 15 }
];

// Coast to Coast US Missions
const MISSIONS_POOL = [
  { id: 'm1', name: 'Transcontinental Express', from: 'seattle', to: 'newyork', pts: 22, desc: 'Connect Seattle (WA) to New York (NY)' },
  { id: 'm2', name: 'Historic Route 66', from: 'losangeles', to: 'chicago', pts: 18, desc: 'Connect Los Angeles (CA) to Chicago (IL)' },
  { id: 'm3', name: 'Sunshine Route', from: 'miami', to: 'sanfrancisco', pts: 24, desc: 'Connect Miami (FL) to San Francisco (CA)' },
  { id: 'm4', name: 'Dixie Corridor', from: 'dallas', to: 'washington', pts: 16, desc: 'Connect Dallas (TX) to Washington D.C.' },
  { id: 'm5', name: 'Rocky Mountain Flyway', from: 'denver', to: 'boston', pts: 16, desc: 'Connect Denver (CO) to Boston (MA)' },
  { id: 'm6', name: 'Pacific Cascades', from: 'seattle', to: 'losangeles', pts: 12, desc: 'Connect Seattle (WA) to Los Angeles (CA)' }
];

// Game State
let state = {
  mode: 'ai',
  isHost: true,
  myNum: 1,
  currentTurn: 1,
  p1Name: 'Player 1',
  p2Name: 'AI Conductor',
  p1Score: 0,
  p2Score: 0,
  p1TotalKm: 0,
  p2TotalKm: 0,
  p1StatesCount: 0,
  p2StatesCount: 0,
  p1Routes: [],
  p2Routes: [],
  claimed: {}, // routeId -> { player: 1|2, usedMode: 'train'|'road'|'flight'|'joker' }
  // State usage tracking: Each player can use each transit mode at most once in a given state!
  // e.g. p1StateUsage['CA'] = ['train', 'flight']
  p1StateUsage: {},
  p2StateUsage: {},
  p1Tickets: { train: 3, road: 3, flight: 2, joker: 1 },
  p2Tickets: { train: 3, road: 3, flight: 2, joker: 1 },
  activeMissions: [], // Shared public quest board
  completedLog: [],
  gameOver: false
};

let map = null;
let markers = {};
let polylines = {};
let peerEngine = null;

// Initialize Map
function initMap() {
  if (map) return;

  // Centered on the Contiguous United States
  map = L.map('usMap', {
    center: [39.0, -96.5],
    zoom: 4,
    minZoom: 3,
    maxZoom: 7,
    worldCopyJump: false,
    maxBounds: [[20, -135], [52, -60]]
  });

  // Esri World Physical / Shaded Relief Map (No street names or highways)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 8,
    attribution: 'Tiles &copy; Esri &mdash; US National Park Service'
  }).addTo(map);

  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);

  // Compute KM for each route
  US_ROUTES.forEach(route => {
    const from = cityMap[route.from];
    const to = cityMap[route.to];
    route.km = calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng);

    // Multi-color dash pattern visualization:
    // We compose the visual dash array to show supported colors
    // Train (Green #10b981), Road (Yellow #facc15), Flight (Red #ef4444)
    let primaryColor = '#10b981';
    let dashStyle = null;

    if (route.modes.includes('flight') && !route.modes.includes('train')) {
      primaryColor = '#ef4444'; // Red solid
      dashStyle = '10, 8';
    } else if (route.modes.includes('road') && !route.modes.includes('train')) {
      primaryColor = '#facc15'; // Yellow solid
    } else if (route.modes.includes('train') && route.modes.includes('road')) {
      primaryColor = '#10b981'; // Green with yellow dots
      dashStyle = '12, 6';
    }

    const latlngs = [[from.lat, from.lng], [to.lat, to.lng]];

    // Apply offset for air routes so they curve / don't overlap overland routes
    if (route.offset) {
      const midLat = (from.lat + to.lat) / 2 + (route.offset / 10);
      const midLng = (from.lng + to.lng) / 2;
      latlngs.splice(1, 0, [midLat, midLng]);
    }

    const line = L.polyline(latlngs, {
      color: primaryColor,
      weight: 5,
      opacity: 0.85,
      dashArray: dashStyle,
      interactive: true
    }).addTo(map);

    const modeList = route.modes.map(m => {
      if (m === 'train') return '<span style="color:#10b981;">🚂 Train</span>';
      if (m === 'road') return '<span style="color:#facc15;">🚗 Road</span>';
      if (m === 'flight') return '<span style="color:#ef4444;">✈️ Flight</span>';
      return m;
    }).join(' OR ');

    line.bindTooltip(`
      <b>${from.name} (${from.state}) ↔ ${to.name} (${to.state})</b><br>
      Distance: <b>${route.km.toLocaleString()} km</b><br>
      Supports: <b>${modeList}</b> (Costs ${route.cost}x tickets)<br>
      <i>Rule: 1 mode type per state per player!</i>
    `, { sticky: true });

    line.on('click', () => handleClaimRoute(route.id));
    polylines[route.id] = { line, defaultColor: primaryColor, defaultDash: dashStyle };
  });

  // Render City Markers (Pins)
  US_CITIES.forEach(city => {
    const icon = L.divIcon({
      className: 'city-pin',
      html: `
        <div class="pin-circle ${city.hasAirport ? 'has-airport' : ''}"></div>
        <div class="pin-label">${city.name} (${city.state})${city.hasAirport ? ' ✈️' : ''}</div>
      `,
      iconSize: [80, 36],
      iconAnchor: [40, 8]
    });

    const marker = L.marker([city.lat, city.lng], { icon: icon }).addTo(map);
    marker.bindPopup(`
      <b>${city.name}, ${city.state}</b><br>
      ${city.hasAirport ? '✈️ <b>Major Airport Hub</b> (Supports Flights)' : '🚂 Overland Hub (Train / Road only)'}
    `);
    markers[city.id] = marker;
  });

  // Highlight border of map when turn is active
  updateTurnNeonBorder();
}

// Check player ticket affordability and state capacity rule
function getAffordableMode(playerNum, route) {
  const tickets = playerNum === 1 ? state.p1Tickets : state.p2Tickets;
  const usage = playerNum === 1 ? state.p1StateUsage : state.p2StateUsage;

  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);
  const stateFrom = cityMap[route.from].state;
  const stateTo = cityMap[route.to].state;

  for (const mode of route.modes) {
    // Check state capacities
    const capFrom = (STATE_CAPACITIES[stateFrom] && STATE_CAPACITIES[stateFrom][mode] !== undefined) ? STATE_CAPACITIES[stateFrom][mode] : 1;
    const capTo = (STATE_CAPACITIES[stateTo] && STATE_CAPACITIES[stateTo][mode] !== undefined) ? STATE_CAPACITIES[stateTo][mode] : 1;

    const countFrom = (usage[stateFrom] || []).filter(m => m === mode).length;
    const countTo = (usage[stateTo] || []).filter(m => m === mode).length;

    if (countFrom >= capFrom || countTo >= capTo) {
      continue; // Exceeds state's transit capacity for this mode
    }

    // Check if tickets or jokers cover the cost
    const regular = tickets[mode] || 0;
    const jokers = tickets.joker || 0;
    if (regular + jokers >= route.cost) {
      return { mode, useJokers: Math.max(0, route.cost - regular) };
    }
  }

  return null;
}

// Claim Route
function handleClaimRoute(routeId) {
  if (state.gameOver) return;

  if (state.mode === 'p2p' && state.currentTurn !== state.myNum) {
    alert("Wait for opponent's turn!");
    return;
  }
  if (state.mode === 'ai' && state.currentTurn === 2) return;

  if (state.claimed[routeId]) {
    alert("This transit route is already claimed!");
    return;
  }

  const route = US_ROUTES.find(r => r.id === routeId);
  const player = state.currentTurn;
  const match = getAffordableMode(player, route);

  if (!match) {
    alert(`Cannot claim! Either you lack tickets, or you have already used that transportation type in one of these states (1 mode type per state rule)!`);
    return;
  }

  // Deduct tickets
  const tickets = player === 1 ? state.p1Tickets : state.p2Tickets;
  const usage = player === 1 ? state.p1StateUsage : state.p2StateUsage;
  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);

  const stateFrom = cityMap[route.from].state;
  const stateTo = cityMap[route.to].state;

  // Spend tickets
  const regularSpent = route.cost - match.useJokers;
  tickets[match.mode] -= regularSpent;
  if (match.useJokers > 0) {
    tickets.joker -= match.useJokers;
  }

  // Record state mode consumption
  if (!usage[stateFrom]) usage[stateFrom] = [];
  if (!usage[stateTo]) usage[stateTo] = [];
  usage[stateFrom].push(match.mode);
  usage[stateTo].push(match.mode);

  // Claim
  state.claimed[routeId] = { player, mode: match.mode };
  if (player === 1) {
    state.p1Routes.push(routeId);
    state.p1Score += Math.round(route.km / 80);
  } else {
    state.p2Routes.push(routeId);
    state.p2Score += Math.round(route.km / 80);
  }

  updateStateCounts();
  checkMissions();
  updateVisuals();

  // Check Game End (All 20 States Connected by either side, or 20 state completion)
  if (state.p1StatesCount >= 20 || state.p2StatesCount >= 20 || Object.keys(state.claimed).length >= US_ROUTES.length) {
    endGame(state.p1StatesCount >= state.p2StatesCount ? 1 : 2, "connected all key American states");
    return;
  }

  // Next Turn
  state.currentTurn = state.currentTurn === 1 ? 2 : 1;
  updateUI();

  // Sync P2P
  if (state.mode === 'p2p' && peerEngine) {
    peerEngine.send({ type: 'SYNC_STATE', state });
  }

  // AI Turn
  if (state.mode === 'ai' && state.currentTurn === 2 && !state.gameOver) {
    setTimeout(playAITurn, 850);
  }
}

// Calculate unique states connected by player
function updateStateCounts() {
  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);

  function getStates(routeIds) {
    const set = new Set();
    routeIds.forEach(id => {
      const r = US_ROUTES.find(x => x.id === id);
      if (r) {
        set.add(cityMap[r.from].state);
        set.add(cityMap[r.to].state);
      }
    });
    return set.size;
  }

  function getKm(routeIds) {
    let sum = 0;
    routeIds.forEach(id => {
      const r = US_ROUTES.find(x => x.id === id);
      if (r) sum += r.km;
    });
    return sum;
  }

  state.p1StatesCount = getStates(state.p1Routes);
  state.p2StatesCount = getStates(state.p2Routes);
  state.p1TotalKm = getKm(state.p1Routes);
  state.p2TotalKm = getKm(state.p2Routes);
}

// Check Secret Missions completion using BFS
function checkMissions() {
  const checkConnected = (fromId, toId, playerRoutes) => {
    const adj = {};
    playerRoutes.forEach(rid => {
      const r = US_ROUTES.find(x => x.id === rid);
      if (!adj[r.from]) adj[r.from] = [];
      if (!adj[r.to]) adj[r.to] = [];
      adj[r.from].push(r.to);
      adj[r.to].push(r.from);
    });

    const queue = [fromId];
    const visited = new Set();
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === toId) return true;
      visited.add(curr);
      (adj[curr] || []).forEach(next => {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      });
    }
    return false;
  };

  // Shared pool elimination: when a mission is achieved by either player, award points and vanish from deck!
  const completedMissions = [];

  state.activeMissions.forEach(m => {
    if (checkConnected(m.from, m.to, state.p1Routes)) {
      state.p1Score += m.pts;
      completedMissions.push({ mission: m, winner: state.p1Name });
    } else if (checkConnected(m.from, m.to, state.p2Routes)) {
      state.p2Score += m.pts;
      completedMissions.push({ mission: m, winner: state.p2Name });
    }
  });

  if (completedMissions.length > 0) {
    completedMissions.forEach(c => {
      // Announce and remove from deck
      alert(`🎯 QUEST COMPLETED!\n\n${c.winner} completed: "${c.mission.name}" (+${c.mission.pts} pts)!\nThis objective has vanished from the board!`);
      state.activeMissions = state.activeMissions.filter(m => m.id !== c.mission.id);
      state.completedLog.push(c);
    });
  }
}

function updateVisuals() {
  Object.keys(polylines).forEach(rid => {
    const item = polylines[rid];
    const claim = state.claimed[rid];
    if (claim) {
      item.line.setStyle({
        color: claim.player === 1 ? '#38bdf8' : '#f43f5e',
        weight: 6,
        opacity: 0.95,
        dashArray: null
      });
    } else {
      item.line.setStyle({
        color: item.defaultColor,
        weight: 5,
        opacity: 0.85,
        dashArray: item.defaultDash
      });
    }
  });
}

function updateUI() {
  document.getElementById('scoreP1').textContent = `${state.p1Score} pts`;
  document.getElementById('scoreP2').textContent = `${state.p2Score} pts`;
  document.getElementById('labelP1').textContent = state.p1Name;
  document.getElementById('labelP2').textContent = state.p2Name;

  document.getElementById('subP1').textContent = `States: ${state.p1StatesCount}/20 • ${state.p1TotalKm.toLocaleString()} km`;
  document.getElementById('subP2').textContent = `States: ${state.p2StatesCount}/20 • ${state.p2TotalKm.toLocaleString()} km`;

  // HUD Progress
  const p1Pct = Math.min(100, Math.round((state.p1StatesCount / 20) * 100));
  const p2Pct = Math.min(100, Math.round((state.p2StatesCount / 20) * 100));
  document.getElementById('hudP1Name').textContent = `${state.p1Name}: ${state.p1StatesCount} / 20 States (${p1Pct}%)`;
  document.getElementById('hudP2Name').textContent = `${state.p2Name}: ${state.p2StatesCount} / 20 States (${p2Pct}%)`;

  document.getElementById('circP1Bar').style.width = `${p1Pct}%`;
  document.getElementById('circP2Bar').style.width = `${p2Pct}%`;

  // Turn pill
  const turnPill = document.getElementById('turnPill');
  const p1Box = document.getElementById('scoreP1Box');
  const p2Box = document.getElementById('scoreP2Box');

  if (state.currentTurn === 1) {
    turnPill.textContent = state.mode === 'p2p' && state.myNum === 2 ? `${state.p1Name}'s Turn` : "Your Turn";
    turnPill.style.color = '#38bdf8';
    p1Box.classList.add('active-p1');
    p2Box.classList.remove('active-p2');
  } else {
    turnPill.textContent = state.mode === 'ai' ? "AI Thinking..." : `${state.p2Name}'s Turn`;
    turnPill.style.color = '#f43f5e';
    p2Box.classList.add('active-p2');
    p1Box.classList.remove('active-p1');
  }

  // Turn indicator neon glow update
  updateTurnNeonBorder();

  // Display tickets in hand
  const currentTickets = (state.mode === 'p2p' && state.myNum === 2) ? state.p2Tickets : state.p1Tickets;
  document.getElementById('cntTrain').textContent = currentTickets.train;
  document.getElementById('cntRoad').textContent = currentTickets.road;
  document.getElementById('cntFlight').textContent = currentTickets.flight;
  document.getElementById('cntJoker').textContent = currentTickets.joker;

  // Display Shared Active Quests / Missions
  const missionsList = document.getElementById('missionsList');
  missionsList.innerHTML = '';
  state.activeMissions.forEach(m => {
    const div = document.createElement('div');
    div.className = 'mission-item';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-weight:700;">
        <span>🎯 ${m.name}</span>
        <span style="color:#f59e0b;">+${m.pts} pts</span>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${m.desc} (First to connect claims & eliminates!)</div>
    `;
    missionsList.appendChild(div);
  });
}

function updateTurnNeonBorder() {
  const neon = document.getElementById('screenNeon');
  const isMyTurn = (state.mode === 'ai' && state.currentTurn === 1) || (state.mode === 'p2p' && state.currentTurn === state.myNum);
  if (isMyTurn && !state.gameOver) {
    neon.classList.add('neon-on');
  } else {
    neon.classList.remove('neon-on');
  }
}
}

// Adaptive Strategic AI
function playAITurn() {
  if (state.gameOver || state.currentTurn !== 2) return;

  const available = US_ROUTES.filter(r => !state.claimed[r.id]);
  const affordable = [];

  available.forEach(route => {
    const match = getAffordableMode(2, route);
    if (match) {
      affordable.push({ route, match });
    }
  });

  if (affordable.length > 0) {
    let best = null;
    let highestScore = -Infinity;

    affordable.forEach(({ route, match }) => {
      let weight = route.km;

      // Mission connection priority: race to claim shared quest before human!
      state.activeMissions.forEach(m => {
        if (route.from === m.from || route.to === m.from || route.from === m.to || route.to === m.to) {
          weight += 7500;
        }
      });

      // Bonus for expanding into new states
      const cityMap = {};
      US_CITIES.forEach(c => cityMap[c.id] = c);
      const usedStates = Object.keys(state.p2StateUsage);
      if (!usedStates.includes(cityMap[route.from].state) || !usedStates.includes(cityMap[route.to].state)) {
        weight += 3500;
      }

      // Conserve rare jokers
      if (match.useJokers > 0) {
        weight -= 2000;
      }

      if (weight > highestScore) {
        highestScore = weight;
        best = { route, match };
      }
    });

    const { route, match } = best || affordable[0];
    const tickets = state.p2Tickets;
    const usage = state.p2StateUsage;
    const cityMap = {};
    US_CITIES.forEach(c => cityMap[c.id] = c);

    const stateFrom = cityMap[route.from].state;
    const stateTo = cityMap[route.to].state;

    // Deduct
    const regularSpent = route.cost - match.useJokers;
    tickets[match.mode] -= regularSpent;
    if (match.useJokers > 0) tickets.joker -= match.useJokers;

    if (!usage[stateFrom]) usage[stateFrom] = [];
    if (!usage[stateTo]) usage[stateTo] = [];
    usage[stateFrom].push(match.mode);
    usage[stateTo].push(match.mode);

    state.claimed[route.id] = { player: 2, mode: match.mode };
    state.p2Routes.push(route.id);
    state.p2Score += Math.round(route.km / 80);

    updateStateCounts();
    checkMissions();
    updateVisuals();

    if (state.p2StatesCount >= 20) {
      endGame(2, "connected all 20 key US states across the nation");
      return;
    }

    state.currentTurn = 1;
    updateUI();
  } else {
    drawRandomTickets(2);
    state.currentTurn = 1;
    updateUI();
  }
}

// Draw Tickets (Train, Road, Flight, with rare Joker)
function drawRandomTickets(playerNum) {
  const rollTicket = () => {
    const rand = Math.random();
    if (rand < 0.40) return 'train';
    if (rand < 0.75) return 'road';
    if (rand < 0.92) return 'flight';
    return 'joker'; // 8% chance of Joker
  };

  const t1 = rollTicket();
  const t2 = rollTicket();
  const t = playerNum === 1 ? state.p1Tickets : state.p2Tickets;
  t[t1]++;
  t[t2]++;
}

document.getElementById('drawTicketsBtn').addEventListener('click', () => {
  if (state.gameOver) return;
  if (state.mode === 'p2p' && state.currentTurn !== state.myNum) {
    alert("Wait for opponent's turn!");
    return;
  }
  if (state.mode === 'ai' && state.currentTurn === 2) return;

  drawRandomTickets(state.currentTurn);
  state.currentTurn = state.currentTurn === 1 ? 2 : 1;
  updateUI();

  if (state.mode === 'p2p' && peerEngine) {
    peerEngine.send({ type: 'SYNC_STATE', state });
  }

  if (state.mode === 'ai' && state.currentTurn === 2 && !state.gameOver) {
    setTimeout(playAITurn, 850);
  }
});

function endGame(winnerNum, reason) {
  state.gameOver = true;
  const winnerName = winnerNum === 1 ? state.p1Name : state.p2Name;
  const p1Final = state.p1Score;
  const p2Final = state.p2Score;

  let grandWinner = winnerName;
  if (p1Final !== p2Final) {
    grandWinner = p1Final > p2Final ? state.p1Name : state.p2Name;
  }

  setTimeout(() => {
    alert(`🏁 EXPEDITION COMPLETE!\n\n${winnerName} ${reason}!\n\nFinal Scores:\n${state.p1Name}: ${p1Final} pts (${state.p1StatesCount}/20 states)\n${state.p2Name}: ${p2Final} pts (${state.p2StatesCount}/20 states)\n\n🏆 Grand Champion: ${grandWinner}!`);
  }, 200);
}

// Reset Map View
document.getElementById('centerMapBtn').addEventListener('click', () => {
  if (map) map.setView([39.0, -96.5], 4);
});

// Forfeit
document.getElementById('forfeitBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to resign the expedition?")) {
    endGame(state.myNum === 1 ? 2 : 1, "won by opponent resignation");
  }
});

// Modal and Tabs
const lobbyModal = document.getElementById('lobbyModal');
const tabAI = document.getElementById('tabAI');
const tabCreate = document.getElementById('tabCreate');
const tabJoin = document.getElementById('tabJoin');
const viewAI = document.getElementById('viewAI');
const viewCreate = document.getElementById('viewCreate');
const viewJoin = document.getElementById('viewJoin');

tabAI.addEventListener('click', () => switchTab('ai'));
tabCreate.addEventListener('click', () => switchTab('create'));
tabJoin.addEventListener('click', () => switchTab('join'));

function switchTab(tab) {
  [tabAI, tabCreate, tabJoin].forEach(b => b.classList.remove('active'));
  viewAI.style.display = 'none';
  viewCreate.style.display = 'none';
  viewJoin.style.display = 'none';

  if (tab === 'ai') {
    tabAI.classList.add('active');
    viewAI.style.display = 'block';
  } else if (tab === 'create') {
    tabCreate.classList.add('active');
    viewCreate.style.display = 'block';
  } else {
    tabJoin.classList.add('active');
    viewJoin.style.display = 'block';
  }
}

document.getElementById('openLobbyBtn').addEventListener('click', () => {
  lobbyModal.style.display = 'flex';
});

// Start AI Match
document.getElementById('startAIBtn').addEventListener('click', () => {
  const nick = document.getElementById('nicknameInput').value.trim() || 'Conductor-1';
  state.mode = 'ai';
  state.p1Name = nick;
  state.p2Name = 'AI Conductor';
  state.myNum = 1;
  resetGameSession();
  lobbyModal.style.display = 'none';
});

// Host P2P Room
document.getElementById('hostRoomBtn').addEventListener('click', () => {
  const nick = document.getElementById('nicknameInput').value.trim() || 'Conductor-1';
  const customRoom = document.getElementById('roomNameInput').value.trim();
  state.mode = 'p2p';
  state.isHost = true;
  state.myNum = 1;
  state.p1Name = nick;

  initP2P();
  const roomCode = peerEngine.initHost(customRoom);
  
  const waitingArea = document.getElementById('hostWaitingArea');
  const shareLinkInput = document.getElementById('shareLinkInput');
  waitingArea.style.display = 'block';

  const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
  shareLinkInput.value = url;
});

// Join P2P Room
document.getElementById('connectRoomBtn').addEventListener('click', () => {
  const nick = document.getElementById('nicknameInput').value.trim() || 'Conductor-2';
  const code = document.getElementById('joinRoomCodeInput').value.trim();
  if (!code) {
    alert("Please enter a room code!");
    return;
  }
  state.mode = 'p2p';
  state.isHost = false;
  state.myNum = 2;
  state.p2Name = nick;

  initP2P();
  peerEngine.initJoin(code);
});

function initP2P() {
  if (peerEngine) peerEngine.destroy();

  peerEngine = new PeerEngine({
    gamePrefix: 'c4a',
    onStatus: (msg) => {
      const statusEl = document.getElementById('joinStatusText');
      if (statusEl) statusEl.textContent = msg;
    },
    onConnected: ({ isHost }) => {
      lobbyModal.style.display = 'none';
      if (isHost) {
        peerEngine.send({
          type: 'HELLO_HOST',
          p1Name: state.p1Name,
          state: state
        });
      } else {
        peerEngine.send({
          type: 'HELLO_CLIENT',
          p2Name: state.p2Name
        });
      }
      updateUI();
    },
    onData: (data) => {
      if (data.type === 'HELLO_HOST') {
        state = data.state;
        state.p1Name = data.p1Name;
        state.myNum = 2;
        updateVisuals();
        updateUI();
      } else if (data.type === 'HELLO_CLIENT') {
        state.p2Name = data.p2Name;
        peerEngine.send({ type: 'SYNC_STATE', state });
        updateUI();
      } else if (data.type === 'SYNC_STATE') {
        state = data.state;
        updateVisuals();
        updateUI();
      }
    },
    onDisconnected: () => {
      alert("Opponent has disconnected from the US transit match!");
    }
  });
}

function resetGameSession() {
  state.claimed = {};
  state.p1Routes = [];
  state.p2Routes = [];
  state.p1Score = 0;
  state.p2Score = 0;
  state.p1TotalKm = 0;
  state.p2TotalKm = 0;
  state.p1StatesCount = 0;
  state.p2StatesCount = 0;
  state.p1StateUsage = {};
  state.p2StateUsage = {};
  state.currentTurn = 1;
  state.gameOver = false;
  state.p1Tickets = { train: 3, road: 3, flight: 2, joker: 1 };
  state.p2Tickets = { train: 3, road: 3, flight: 2, joker: 1 };
  state.completedLog = [];

  // Deal 4 shared high-stakes quests on the board
  const shuffled = [...MISSIONS_POOL].sort(() => 0.5 - Math.random());
  state.activeMissions = [shuffled[0], shuffled[1], shuffled[2], shuffled[3]];

  updateVisuals();
  updateUI();
}

window.addEventListener('DOMContentLoaded', () => {
  initMap();
  resetGameSession();

  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    lobbyModal.style.display = 'flex';
    switchTab('join');
    document.getElementById('joinRoomCodeInput').value = room;
  }
});
