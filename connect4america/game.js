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

// Coast to Coast US Missions & Regional Expansions (Expanded to 12 Diverse Quests!)
const MISSIONS_POOL = [
  // Mega Coast-to-Coast Transcontinentals (20-25 pts)
  { id: 'm1', name: 'Transcontinental Express', from: 'seattle', to: 'newyork', pts: 24, desc: 'Connect Seattle (WA) to New York (NY)' },
  { id: 'm2', name: 'Historic Route 66', from: 'losangeles', to: 'chicago', pts: 18, desc: 'Connect Los Angeles (CA) to Chicago (IL)' },
  { id: 'm3', name: 'Sunshine Route', from: 'miami', to: 'sanfrancisco', pts: 25, desc: 'Connect Miami (FL) to San Francisco (CA)' },
  { id: 'm4', name: 'Lone Star Capitol Run', from: 'dallas', to: 'washington', pts: 18, desc: 'Connect Dallas (TX) to Washington D.C.' },
  { id: 'm5', name: 'Rocky Mountain Flyway', from: 'denver', to: 'boston', pts: 20, desc: 'Connect Denver (CO) to Boston (MA)' },
  { id: 'm6', name: 'Pacific Cascades & Coast', from: 'seattle', to: 'losangeles', pts: 14, desc: 'Connect Seattle (WA) to Los Angeles (CA)' },

  // New High-Stakes Regional & Diagonal Quests
  { id: 'm7', name: 'Great Lakes to Gulf', from: 'chicago', to: 'neworleans', pts: 16, desc: 'Connect Chicago (IL) to New Orleans (LA)' },
  { id: 'm8', name: 'Atlantic Seaboard Line', from: 'boston', to: 'miami', pts: 20, desc: 'Connect Boston (MA) to Miami (FL)' },
  { id: 'm9', name: 'Northern Border Pioneer', from: 'seattle', to: 'minneapolis', pts: 18, desc: 'Connect Seattle (WA) to Minneapolis (MN)' },
  { id: 'm10', name: 'Southwest Desert Express', from: 'sanfrancisco', to: 'houston', pts: 22, desc: 'Connect San Francisco (CA) to Houston (TX)' },
  { id: 'm11', name: 'Midwest Motor Corridor', from: 'detroit', to: 'dallas', pts: 16, desc: 'Connect Detroit (MI) to Dallas (TX)' },
  { id: 'm12', name: 'Heartland Connection', from: 'minneapolis', to: 'atlanta', pts: 16, desc: 'Connect Minneapolis (MN) to Atlanta (GA)' }
];

// Game State
let state = {
  mode: 'ai',
  isHost: true,
  myNum: 1,
  currentTurn: 1,
  p1Name: 'Player 1',
  p2Name: 'AI Conductor',
  p1Color: '#38bdf8', // Team Blue
  p2Color: '#f43f5e', // Team Red
  p1Score: 0,
  p2Score: 0,
  p1TotalKm: 0,
  p2TotalKm: 0,
  p1StatesCount: 0,
  p2StatesCount: 0,
  p1Routes: [],
  p2Routes: [],
  claimed: {}, // routeId -> { player: 1|2, usedMode: 'train'|'road'|'flight'|'joker' }
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
    // Train (Green #10b981), Road (Yellow #facc15), Flight (Dark Purple #581c87 / #7e22ce)
    let primaryColor = '#10b981';
    let dashStyle = null;

    if (route.modes.includes('flight') && !route.modes.includes('train')) {
      primaryColor = '#6b21a8'; // Dark Purple
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
      weight: 8, // Thicker stroke for easy clicking on mobile & desktop
      opacity: 0.85,
      dashArray: dashStyle,
      interactive: true,
      className: 'clickable-route'
    }).addTo(map);

    const modeList = route.modes.map(m => {
      if (m === 'train') return '<span style="color:#10b981;">🚂 Train</span>';
      if (m === 'road') return '<span style="color:#facc15;">🚗 Road</span>';
      if (m === 'flight') return '<span style="color:#a855f7;">✈️ Flight</span>';
      return m;
    }).join(' OR ');

    line.bindTooltip(`
      <b>${from.name} (${from.state}) ↔ ${to.name} (${to.state})</b><br>
      Distance: <b>${route.km.toLocaleString()} km</b><br>
      Supports: <b>${modeList}</b> (Costs ${route.cost}x tickets)<br>
      <i>Rule: 1 mode type per state per player!</i>
    `, { sticky: true });

    line.on('click', () => handleRouteClick(route.id));
    polylines[route.id] = { line, defaultColor: primaryColor, defaultDash: dashStyle };
  });

  // Render City Markers (Pins) with Live Capacity Pips
  renderCityPins();

  // Highlight turn indicator when turn is active
  updateTurnIndicator();
}

function renderCityPins() {
  US_CITIES.forEach(city => {
    const iconHtml = `
      <div class="pin-circle ${city.hasAirport ? 'has-airport' : ''}"></div>
      <div class="pin-label">
        <span>${city.name} (${city.state})${city.hasAirport ? ' ✈️' : ''}</span>
      </div>
    `;

    if (markers[city.id]) {
      const icon = L.divIcon({
        className: 'city-pin',
        html: iconHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 8]
      });
      markers[city.id].setIcon(icon);
      markers[city.id].setPopupContent(`
        <b>${city.name}, ${city.state}</b><br>
        ${city.hasAirport ? '✈️ Major Air Hub (Supports Flights)' : '🚂 Overland Hub (Train / Road)'}
      `);
    } else {
      const icon = L.divIcon({
        className: 'city-pin',
        html: iconHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 8]
      });
      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <b>${city.name}, ${city.state}</b><br>
        ${city.hasAirport ? '✈️ Major Air Hub (Supports Flights)' : '🚂 Overland Hub (Train / Road)'}
      `);
      markers[city.id] = marker;
    }
  });
}

// Check player ticket affordability
function getAffordableMode(playerNum, route) {
  const tickets = playerNum === 1 ? state.p1Tickets : state.p2Tickets;

  for (const mode of route.modes) {
    const regular = tickets[mode] || 0;
    const jokers = tickets.joker || 0;
    if (regular + jokers >= route.cost) {
      return { mode, useJokers: Math.max(0, route.cost - regular) };
    }
  }

  return null;
}

// Smooth In-Game Toast (replaces intrusive browser alert dialogs)
function showToast(title, desc, icon = 'ℹ️') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-box';
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div style="flex:1;">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// Open Route Placement Modal
let pendingRouteId = null;

function handleRouteClick(routeId) {
  if (state.gameOver) return;

  if (state.mode === 'p2p' && state.currentTurn !== state.myNum) {
    showToast("Wait Your Turn", "It is currently your opponent's turn to play.", "⏳");
    return;
  }
  if (state.mode === 'ai' && state.currentTurn === 2) return;

  if (state.claimed[routeId]) {
    showToast("Route Taken", "This transit corridor is already claimed by an explorer.", "🚫");
    return;
  }

  const route = US_ROUTES.find(r => r.id === routeId);
  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);
  const from = cityMap[route.from];
  const to = cityMap[route.to];

  pendingRouteId = routeId;
  const player = state.currentTurn;
  const tickets = player === 1 ? state.p1Tickets : state.p2Tickets;

  // Open modal
  const claimModal = document.getElementById('claimModal');
  const title = document.getElementById('claimRouteTitle');
  const sub = document.getElementById('claimRouteSub');
  const options = document.getElementById('claimOptionsContainer');
  const notice = document.getElementById('claimNotice');

  title.textContent = `${from.name} (${from.state}) ↔ ${to.name} (${to.state})`;
  sub.textContent = `Distance: ${route.km.toLocaleString()} km • Required Tickets: ${route.cost}x`;
  options.innerHTML = '';
  notice.textContent = '';

  route.modes.forEach(mode => {
    const regular = tickets[mode] || 0;
    const jokers = tickets.joker || 0;
    const canPay = (regular + jokers) >= route.cost;
    const jokersNeeded = Math.max(0, route.cost - regular);

    let modeIcon = '🚂 Train';
    if (mode === 'road') modeIcon = '🚗 Road';
    if (mode === 'flight') modeIcon = '✈️ Flight';

    const btn = document.createElement('button');
    btn.className = 'mode-select-btn';
    btn.disabled = !canPay;
    btn.style.opacity = !canPay ? '0.45' : '1';

    let costDesc = `${route.cost}x ${mode}`;
    if (jokersNeeded > 0) {
      costDesc += ` (${regular}x ${mode} + ${jokersNeeded}x 🃏)`;
    }

    btn.innerHTML = `
      <span>${modeIcon}</span>
      <span style="font-size:0.8rem; font-weight:600; color:${canPay ? '#34d399' : '#ef4444'};">${costDesc}</span>
    `;

    btn.addEventListener('click', () => {
      confirmClaimRoute(routeId, mode, jokersNeeded);
      claimModal.style.display = 'none';
    });

    options.appendChild(btn);
  });

  claimModal.style.display = 'flex';
}

function confirmClaimRoute(routeId, chosenMode, useJokers) {
  const route = US_ROUTES.find(r => r.id === routeId);
  const player = state.currentTurn;
  const tickets = player === 1 ? state.p1Tickets : state.p2Tickets;
  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);

  // Deduct
  const regularSpent = route.cost - useJokers;
  tickets[chosenMode] -= regularSpent;
  if (useJokers > 0) {
    tickets.joker -= useJokers;
  }

  // Claim
  state.claimed[routeId] = { player, mode: chosenMode };
  const ptsEarned = Math.round(route.km / 80);
  if (player === 1) {
    state.p1Routes.push(routeId);
    state.p1Score += ptsEarned;
  } else {
    state.p2Routes.push(routeId);
    state.p2Score += ptsEarned;
  }

  showToast("Route Established!", `${cityMap[route.from].name} to ${cityMap[route.to].name} claimed (+${ptsEarned} pts)!`, "🚂");

  updateStateCounts();
  checkMissions();
  renderCityPins();
  updateVisuals();

  // Check Game End: concludes when less than or equal to 2 unclaimed paths remain on the board (<= 2)
  const totalClaimedCount = Object.keys(state.claimed).length;
  const remainingRoutes = US_ROUTES.length - totalClaimedCount;
  if (remainingRoutes <= 2) {
    const endReason = `reached network capacity (only ${remainingRoutes} path${remainingRoutes === 1 ? '' : 's'} remaining)`;
    endGame(state.p1Score >= state.p2Score ? 1 : 2, endReason);
    return;
  }

  // Next Turn
  state.currentTurn = state.currentTurn === 1 ? 2 : 1;
  updateUI();

  if (state.mode === 'p2p' && peerEngine) {
    peerEngine.send({ type: 'SYNC_STATE', state });
  }

  if (state.mode === 'ai' && state.currentTurn === 2 && !state.gameOver) {
    setTimeout(playAITurn, 850);
  }
}

// Close claim modal button
document.getElementById('closeClaimModalBtn').addEventListener('click', () => {
  document.getElementById('claimModal').style.display = 'none';
});

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
      // Announce with smooth in-game toast (no annoying browser alert modal)
      showToast("🎯 QUEST COMPLETED!", `${c.winner} completed: "${c.mission.name}" (+${c.mission.pts} pts)! Vanished from board!`, "🏆");
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
      // Determine claimed team color
      const teamColor = claim.player === 1 ? state.p1Color : state.p2Color;

      // Visual distinction based on mode placed so players know what vehicle was placed
      // Train = Solid, Road = Dense Dash, Flight = Double Dot
      let placedDash = null;
      let placedWeight = 6;
      if (claim.mode === 'road') {
        placedDash = '8, 4';
        placedWeight = 5;
      } else if (claim.mode === 'flight') {
        placedDash = '2, 6';
        placedWeight = 6;
      }

      item.line.setStyle({
        color: teamColor,
        weight: placedWeight,
        opacity: 0.95,
        dashArray: placedDash
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
  document.getElementById('labelP1').textContent = `${state.p1Name} (${state.p1Color === '#38bdf8' ? 'Blue' : 'Red'})`;
  document.getElementById('labelP2').textContent = `${state.p2Name} (${state.p2Color === '#38bdf8' ? 'Blue' : 'Red'})`;
  document.getElementById('labelP1').style.color = state.p1Color;
  document.getElementById('labelP2').style.color = state.p2Color;

  document.getElementById('circP1Bar').style.background = state.p1Color;
  document.getElementById('circP2Bar').style.background = state.p2Color;

  const totalRoutesCount = US_ROUTES.length;
  const claimedCount = Object.keys(state.claimed).length;
  const remainingRoutes = Math.max(0, totalRoutesCount - claimedCount);

  document.getElementById('subP1').textContent = `States: ${state.p1StatesCount}/17 • ${state.p1TotalKm.toLocaleString()} km`;
  document.getElementById('subP2').textContent = `States: ${state.p2StatesCount}/17 • ${state.p2TotalKm.toLocaleString()} km`;

  // HUD Progress: tracks remaining unclaimed routes towards the < 2 end condition
  const routesProgressPct = Math.min(100, Math.round((claimedCount / (totalRoutesCount - 1)) * 100));
  document.getElementById('hudP1Name').textContent = `${state.p1Name}: ${state.p1Score} pts (${state.p1StatesCount} states)`;
  document.getElementById('hudP2Name').textContent = `${state.p2Name}: ${state.p2Score} pts (${state.p2StatesCount} states) • ${remainingRoutes} paths left`;

  const p1Share = (state.p1Score + state.p2Score) > 0 
    ? Math.round((state.p1Score / (state.p1Score + state.p2Score)) * 100) 
    : 50;
  document.getElementById('circP1Bar').style.width = `${p1Share}%`;
  document.getElementById('circP2Bar').style.width = `${100 - p1Share}%`;

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

  // Turn indicator update
  updateTurnIndicator();

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

function updateTurnIndicator() {
  const isMyTurn = (state.mode === 'ai' && state.currentTurn === 1) || (state.mode === 'p2p' && state.currentTurn === state.myNum);
  const turnPill = document.getElementById('turnPill');
  if (turnPill) {
    if (isMyTurn && !state.gameOver) {
      turnPill.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.6)';
    } else {
      turnPill.style.boxShadow = 'none';
    }
  }
}

// Master Strategic AI Conductor (BFS Pathfinding, Quest Hunting, & Long-Chain Optimization)
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

  const cityMap = {};
  US_CITIES.forEach(c => cityMap[c.id] = c);

  // Helper BFS: find shortest remaining hops for a player between two cities
  function getShortestPathHops(fromId, toId, myClaimedRoutes) {
    const myRoutesSet = new Set(myClaimedRoutes);
    const queue = [{ city: fromId, hops: 0 }];
    const visited = new Set([fromId]);

    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.city === toId) return curr.hops;

      // Find all connected edges via unclaimed or own routes
      US_ROUTES.forEach(r => {
        let neighbor = null;
        if (r.from === curr.city) neighbor = r.to;
        else if (r.to === curr.city) neighbor = r.from;

        if (neighbor && !visited.has(neighbor)) {
          // If already claimed by opponent, path is blocked!
          const claim = state.claimed[r.id];
          if (!claim || claim.player === 2) {
            visited.add(neighbor);
            const additionalHop = (claim && claim.player === 2) ? 0 : 1;
            queue.push({ city: neighbor, hops: curr.hops + additionalHop });
          }
        }
      });
    }
    return 999; // Unreachable
  }

  // Strategic AI Decision: Should the AI claim a route or draw tickets?
  // If the AI has an affordable route that connects a mission or yields high points, take it.
  // If affordable routes are low value or will burn too many jokers, draw more tickets to build a stronger hand.
  if (affordable.length > 0) {
    let best = null;
    let highestScore = -Infinity;

    affordable.forEach(({ route, match }) => {
      // Base score from distance
      let weight = route.km * 2;

      // Check if claiming this route directly finishes an active mission
      const testRoutes = [...state.p2Routes, route.id];
      state.activeMissions.forEach(m => {
        // BFS check
        const hopsBefore = getShortestPathHops(m.from, m.to, state.p2Routes);
        const hopsAfter = getShortestPathHops(m.from, m.to, testRoutes);

        if (hopsAfter === 0) {
          // DIRECT COMPLETION OF QUEST!
          weight += 50000 + (m.pts * 1000);
        } else if (hopsAfter < hopsBefore && hopsAfter <= 2) {
          // High-priority step advancing closer to quest completion
          weight += 18000 + (m.pts * 300);
        } else if (hopsAfter < hopsBefore) {
          weight += 8000;
        }

        // Tactical Block: check if HUMAN is 1 hop away from claiming this mission!
        const humanHops = getShortestPathHops(m.from, m.to, state.p1Routes);
        if (humanHops === 1 && (route.from === m.from || route.to === m.to || route.from === m.to || route.to === m.from)) {
          weight += 25000; // Counter-claim to deny huge quest bounty!
        }
      });

      // Chain continuity: bonus if route links to existing AI network
      const connectsToMyNetwork = state.p2Routes.some(id => {
        const r = US_ROUTES.find(x => x.id === id);
        return r && (r.from === route.from || r.to === route.to || r.from === route.to || r.to === route.from);
      });
      if (connectsToMyNetwork) {
        weight += 6000;
      }

      // Expansion bonus for new states
      const claimedStates = new Set();
      state.p2Routes.forEach(id => {
        const r = US_ROUTES.find(x => x.id === id);
        if (r) {
          claimedStates.add(cityMap[r.from].state);
          claimedStates.add(cityMap[r.to].state);
        }
      });
      if (!claimedStates.has(cityMap[route.from].state) || !claimedStates.has(cityMap[route.to].state)) {
        weight += 4500;
      }

      // Air corridor bonus: flights give enormous instant points
      if (match.mode === 'flight') {
        weight += 4000;
      }

      // Joker conservation penalty on small low-importance routes
      if (match.useJokers > 0) {
        if (route.km < 1200) {
          weight -= 3000 * match.useJokers;
        }
      }

      if (weight > highestScore) {
        highestScore = weight;
        best = { route, match };
      }
    });

    // If best option is too weak and AI has fewer than 6 tickets, draw instead to prepare for big moves
    const totalAITickets = state.p2Tickets.train + state.p2Tickets.road + state.p2Tickets.flight + state.p2Tickets.joker;
    if (highestScore < 8000 && totalAITickets < 6) {
      drawRandomTickets(2);
      showToast("AI Tactical Draw", "AI Conductor drew 2 transit tickets to prepare a strategic expansion.", "🤖");
      state.currentTurn = 1;
      updateUI();
      return;
    }

    const { route, match } = best || affordable[0];
    const tickets = state.p2Tickets;

    // Deduct
    const regularSpent = route.cost - match.useJokers;
    tickets[match.mode] -= regularSpent;
    if (match.useJokers > 0) tickets.joker -= match.useJokers;

    state.claimed[route.id] = { player: 2, mode: match.mode };
    state.p2Routes.push(route.id);
    state.p2Score += Math.round(route.km / 80);

    updateStateCounts();
    checkMissions();
    renderCityPins();
    updateVisuals();

    const totalClaimedCount = Object.keys(state.claimed).length;
    const remainingRoutes = US_ROUTES.length - totalClaimedCount;
    if (remainingRoutes <= 2) {
      endGame(state.p1Score >= state.p2Score ? 1 : 2, `reached network capacity (only ${remainingRoutes} path${remainingRoutes === 1 ? '' : 's'} remaining)`);
      return;
    }

    showToast("AI Move", `AI Conductor claimed route from ${cityMap[route.from].name} to ${cityMap[route.to].name}!`, "🤖");
    state.currentTurn = 1;
    updateUI();
  } else {
    // Cannot afford any route: draw tickets
    drawRandomTickets(2);
    showToast("AI Move", "AI Conductor drew 2 transit tickets.", "🤖");
    state.currentTurn = 1;
    updateUI();
  }
}

// Draw Tickets (Ratio Flight:Road:Train:Joker = 3:5:4:1, Total = 13 units)
function drawRandomTickets(playerNum) {
  const rollTicket = () => {
    // Total weight = 3 (flight) + 5 (road) + 4 (train) + 1 (joker) = 13
    const rand = Math.floor(Math.random() * 13);
    if (rand < 3) return 'flight';         // 3/13 (~23.1%)
    if (rand < 8) return 'road';           // 5/13 (~38.5%)
    if (rand < 12) return 'train';         // 4/13 (~30.8%)
    return 'joker';                        // 1/13 (~7.7%)
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
    showToast("Wait Your Turn", "It is your opponent's turn to play.", "⏳");
    return;
  }
  if (state.mode === 'ai' && state.currentTurn === 2) return;

  drawRandomTickets(state.currentTurn);
  showToast("Tickets Drawn!", "Added 2 transit tickets to your hand.", "🎫");

  state.currentTurn = state.currentTurn === 1 ? 2 : 1;
  updateUI();

  if (state.mode === 'p2p' && peerEngine) {
    peerEngine.send({ type: 'SYNC_STATE', state });
  }

  if (state.mode === 'ai' && state.currentTurn === 2 && !state.gameOver) {
    setTimeout(playAITurn, 850);
  }
});

// Confetti VFX Engine for Victory Screen
let victoryParticles = [];
let confettiAnimId = null;

function spawnVictoryConfetti() {
  const canvas = document.getElementById('victoryConfettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f59e0b', '#38bdf8', '#a855f7', '#ef4444', '#10b981', '#ec4899', '#facc15'];
  victoryParticles = [];

  for (let i = 0; i < 150; i++) {
    victoryParticles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      gravity: 0.35 + Math.random() * 0.2,
      opacity: 1
    });
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = victoryParticles.length - 1; i >= 0; i--) {
      const p = victoryParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.vx *= 0.99;

      if (p.y > canvas.height + 20) {
        victoryParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    }

    if (victoryParticles.length > 0) {
      confettiAnimId = requestAnimationFrame(renderConfetti);
    }
  }

  confettiAnimId = requestAnimationFrame(renderConfetti);
}

function endGame(winnerNum, reason) {
  state.gameOver = true;
  const winnerName = winnerNum === 1 ? state.p1Name : state.p2Name;
  const p1Final = state.p1Score;
  const p2Final = state.p2Score;

  let grandWinner = winnerName;
  let isTie = false;
  if (p1Final > p2Final) {
    grandWinner = state.p1Name;
  } else if (p2Final > p1Final) {
    grandWinner = state.p2Name;
  } else {
    isTie = true;
  }

  const modal = document.getElementById('victoryModal');
  const icon = document.getElementById('victoryIcon');
  const title = document.getElementById('victoryWinnerTitle');
  const sub = document.getElementById('victoryWinnerSubtitle');

  if (isTie) {
    icon.textContent = "🤝";
    title.textContent = "HONORABLE DRAW!";
    sub.textContent = `Both conductors engineered networks of equal mastery (${p1Final} pts each) before paths ran out!`;
  } else {
    icon.textContent = grandWinner === state.p1Name ? "🏆" : "🤖";
    title.textContent = `${grandWinner.toUpperCase()} VICTORIOUS!`;
    sub.textContent = `${grandWinner} completed the expedition with superior strategic route planning! (${reason})`;
  }

  // Populate scoreboard
  document.getElementById('vicP1Name').textContent = state.p1Name;
  document.getElementById('vicP1Score').textContent = `${p1Final} pts`;
  document.getElementById('vicP1Stats').textContent = `${state.p1StatesCount}/17 states • ${state.p1TotalKm.toLocaleString()} km`;

  document.getElementById('vicP2Name').textContent = state.p2Name;
  document.getElementById('vicP2Score').textContent = `${p2Final} pts`;
  document.getElementById('vicP2Stats').textContent = `${state.p2StatesCount}/17 states • ${state.p2TotalKm.toLocaleString()} km`;

  modal.style.display = 'flex';
  spawnVictoryConfetti();
}

// Play Again button inside victory modal
document.getElementById('vicPlayAgainBtn').addEventListener('click', () => {
  document.getElementById('victoryModal').style.display = 'none';
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  resetGameSession();
});

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

const closeLobbyBtn = document.getElementById('closeLobbyBtn');
if (closeLobbyBtn) {
  closeLobbyBtn.addEventListener('click', () => {
    lobbyModal.style.display = 'none';
  });
}

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
  state.currentTurn = 1;
  state.gameOver = false;
  state.p1Tickets = { train: 3, road: 3, flight: 2, joker: 1 };
  state.p2Tickets = { train: 3, road: 3, flight: 2, joker: 1 };
  state.completedLog = [];

  // Randomize Team Colors (Blue vs Red)
  const isP1Blue = Math.random() < 0.5;
  state.p1Color = isP1Blue ? '#38bdf8' : '#f43f5e';
  state.p2Color = isP1Blue ? '#f43f5e' : '#38bdf8';
  const myTeamName = (state.myNum === 1 ? state.p1Color : state.p2Color) === '#38bdf8' ? 'TEAM BLUE 🔵' : 'TEAM RED 🔴';

  // Deal 4 shared high-stakes quests on the board
  const shuffled = [...MISSIONS_POOL].sort(() => 0.5 - Math.random());
  state.activeMissions = [shuffled[0], shuffled[1], shuffled[2], shuffled[3]];

  renderCityPins();
  updateVisuals();
  updateUI();

  // Prompt player what team color they are playing
  setTimeout(() => {
    showToast("Color Assigned!", `You are playing as ${myTeamName}!`, "🎲");
  }, 400);
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
