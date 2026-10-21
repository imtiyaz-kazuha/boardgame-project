// Target Circumnavigation of Earth in kilometers
const EARTH_CIRCUMFERENCE_KM = 40075;

// Haversine formula to calculate accurate great-circle distance between two GPS coordinates in km
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
const WORLD_CITIES = [
  // Europe
  { id: 'london', name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { id: 'paris', name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { id: 'rome', name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
  { id: 'berlin', name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
  { id: 'moscow', name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
  { id: 'istanbul', name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'Turkey' },

  // Middle East & Africa
  { id: 'cairo', name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { id: 'nairobi', name: 'Nairobi', lat: -1.2921, lng: 36.8219, country: 'Kenya' },
  { id: 'capetown', name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa' },

  // Asia
  { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
  { id: 'bangkok', name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  { id: 'singapore', name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { id: 'beijing', name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China' },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },

  // Oceania
  { id: 'sydney', name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { id: 'auckland', name: 'Auckland', lat: -36.8485, lng: 174.7633, country: 'New Zealand' },

  // Americas
  { id: 'honolulu', name: 'Honolulu', lat: 21.3069, lng: -157.8583, country: 'USA' },
  { id: 'losangeles', name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { id: 'newyork', name: 'New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
  { id: 'mexicocity', name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { id: 'bogota', name: 'Bogota', lat: 4.7110, lng: -74.0721, country: 'Colombia' },
  { id: 'riodejaneiro', name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  { id: 'buenosaires', name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' }
];

// Transit Modes allowed:
// Primary mode sets color:
// 'ferry' -> Blue (dotted)
// 'flight' -> Red (solid)
// 'train' -> Green (solid)
// 'road' -> Yellow (solid)
const WORLD_ROUTES = [
  // Europe Railways, Motorways & Ferries
  { id: 'r_lon_par', from: 'london', to: 'paris', dist: 1, primary: 'train', modes: ['train', 'ferry'], cost: 1 },
  { id: 'r_par_ber', from: 'paris', to: 'berlin', dist: 2, primary: 'train', modes: ['train', 'road'], cost: 2 },
  { id: 'r_par_rom', from: 'paris', to: 'rome', dist: 2, primary: 'road', modes: ['road', 'train'], cost: 2 },
  { id: 'r_ber_mos', from: 'berlin', to: 'moscow', dist: 3, primary: 'train', modes: ['train'], cost: 3 },
  { id: 'r_rom_ist', from: 'rome', to: 'istanbul', dist: 2, primary: 'ferry', modes: ['ferry', 'road'], cost: 2 },
  { id: 'r_ist_mos', from: 'istanbul', to: 'moscow', dist: 2, primary: 'train', modes: ['train', 'road'], cost: 2 },

  // Middle East & Africa Overland Highways & Ferries
  { id: 'r_ist_cai', from: 'istanbul', to: 'cairo', dist: 2, primary: 'ferry', modes: ['ferry', 'road'], cost: 2 },
  { id: 'r_cai_dub', from: 'cairo', to: 'dubai', dist: 2, primary: 'road', modes: ['road'], cost: 2 },
  { id: 'r_cai_nai', from: 'cairo', to: 'nairobi', dist: 3, primary: 'road', modes: ['road'], cost: 3 },
  { id: 'r_nai_cap', from: 'nairobi', to: 'capetown', dist: 3, primary: 'road', modes: ['road', 'train'], cost: 3 },
  { id: 'r_dub_mum', from: 'dubai', to: 'mumbai', dist: 2, primary: 'ferry', modes: ['ferry', 'flight'], cost: 2 },

  // Asia Trans-Siberian, Railways & Roadways
  { id: 'r_mos_bei', from: 'moscow', to: 'beijing', dist: 4, primary: 'train', modes: ['train'], cost: 4 },
  { id: 'r_mum_ban', from: 'mumbai', to: 'bangkok', dist: 3, primary: 'road', modes: ['road', 'train'], cost: 3 },
  { id: 'r_ban_sin', from: 'bangkok', to: 'singapore', dist: 2, primary: 'train', modes: ['train', 'road'], cost: 2 },
  { id: 'r_bei_tok', from: 'beijing', to: 'tokyo', dist: 3, primary: 'ferry', modes: ['ferry', 'flight'], cost: 3 },
  { id: 'r_sin_syd', from: 'singapore', to: 'sydney', dist: 4, primary: 'flight', modes: ['flight', 'ferry'], cost: 4 },
  { id: 'r_tok_syd', from: 'tokyo', to: 'sydney', dist: 4, primary: 'flight', modes: ['flight'], cost: 4 },
  { id: 'r_syd_auc', from: 'sydney', to: 'auckland', dist: 2, primary: 'ferry', modes: ['ferry', 'flight'], cost: 2 },

  // Pacific Trans-Oceanic Bridges
  { id: 'r_tok_hono', from: 'tokyo', to: 'honolulu', dist: 4, primary: 'flight', modes: ['flight'], cost: 4 },
  { id: 'r_auc_hono', from: 'auckland', to: 'honolulu', dist: 4, modes: ['flight'], primary: 'flight', cost: 4 },
  { id: 'r_hono_la', from: 'honolulu', to: 'losangeles', dist: 4, primary: 'flight', modes: ['flight', 'ferry'], cost: 4 },

  // Americas Railways & Highways
  { id: 'r_la_ny', from: 'losangeles', to: 'newyork', dist: 3, primary: 'train', modes: ['train', 'road'], cost: 3 },
  { id: 'r_la_mex', from: 'losangeles', to: 'mexicocity', dist: 2, primary: 'road', modes: ['road', 'train'], cost: 2 },
  { id: 'r_mex_bog', from: 'mexicocity', to: 'bogota', dist: 3, primary: 'road', modes: ['road', 'flight'], cost: 3 },
  { id: 'r_ny_bog', from: 'newyork', to: 'bogota', dist: 3, primary: 'flight', modes: ['flight'], cost: 3 },
  { id: 'r_bog_rio', from: 'bogota', to: 'riodejaneiro', dist: 3, primary: 'road', modes: ['road'], cost: 3 },
  { id: 'r_rio_bue', from: 'riodejaneiro', to: 'buenosaires', dist: 2, primary: 'train', modes: ['train', 'road'], cost: 2 },

  // Atlantic Trans-Oceanic Bridges
  { id: 'r_ny_lon', from: 'newyork', to: 'london', dist: 4, primary: 'flight', modes: ['flight', 'ferry'], cost: 4 },
  { id: 'r_rio_cap', from: 'riodejaneiro', to: 'capetown', dist: 4, primary: 'ferry', modes: ['ferry', 'flight'], cost: 4 },
  { id: 'r_rio_par', from: 'riodejaneiro', to: 'paris', dist: 4, primary: 'flight', modes: ['flight'], cost: 4 }
];

// Secret Missions
const MISSIONS_POOL = [
  { id: 'm1', name: 'Silk & Steel', from: 'london', to: 'tokyo', pts: 20, desc: 'Connect London to Tokyo across Eurasia' },
  { id: 'm2', name: 'Trans-Atlantic Express', from: 'newyork', to: 'paris', pts: 14, desc: 'Connect New York to Paris' },
  { id: 'm3', name: 'Southern Cross', from: 'capetown', to: 'sydney', pts: 22, desc: 'Connect Cape Town to Sydney' },
  { id: 'm4', name: 'Pan-American Highway', from: 'newyork', to: 'buenosaires', pts: 18, desc: 'Connect New York to Buenos Aires' },
  { id: 'm5', name: 'Pacific Odyssey', from: 'tokyo', to: 'losangeles', pts: 16, desc: 'Connect Tokyo to Los Angeles via Honolulu' },
  { id: 'm6', name: 'Spice Route', from: 'cairo', to: 'singapore', pts: 16, desc: 'Connect Cairo to Singapore' }
];

// Game State Definition
let state = {
  mode: 'ai', // 'ai' or 'p2p'
  isHost: true,
  myNum: 1,
  currentTurn: 1, // 1: P1, 2: P2
  p1Name: 'Explorer 1',
  p2Name: 'AI Explorer',
  p1Score: 0,
  p2Score: 0,
  p1TotalKm: 0, // Total accumulated route distance in km
  p2TotalKm: 0,
  p1Routes: [],
  p2Routes: [],
  claimed: {}, // routeId -> playerNum
  p1Tickets: { train: 3, flight: 3, ferry: 2, road: 3 },
  p2Tickets: { train: 3, flight: 3, ferry: 2, road: 3 },
  p1Missions: [],
  p2Missions: [],
  gameOver: false
};

let map = null;
let markers = {};
let polylines = {};
let peerEngine = null;

// Initialize Map with Leaflet & OpenStreetMap tiles
function initMap() {
  if (map) return;

  map = L.map('worldMap', {
    center: [25, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 6,
    worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]]
  });

  // Use Esri World Physical / Shaded Relief Map to show biomes (deserts, forests, mountain terrain) without streets
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 8,
    attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service'
  }).addTo(map);

  const cityMap = {};
  WORLD_CITIES.forEach(c => cityMap[c.id] = c);

  // Precompute realistic distances for routes
  WORLD_ROUTES.forEach(route => {
    const from = cityMap[route.from];
    const to = cityMap[route.to];
    route.km = calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng);
  });

  // Render Routes
  WORLD_ROUTES.forEach(route => {
    const from = cityMap[route.from];
    const to = cityMap[route.to];

    const latlngs = [[from.lat, from.lng], [to.lat, to.lng]];
    
    // Assign color and style based on primary transport mode:
    // - Ferry: Blue Dotted
    // - Flight: Red Solid
    // - Train: Green Solid
    // - Road: Yellow Solid
    let color = '#facc15'; // Default Yellow Road
    let dashArray = null;

    if (route.primary === 'ferry') {
      color = '#38bdf8'; // Blue
      dashArray = '3, 6'; // Dotted line
    } else if (route.primary === 'flight') {
      color = '#ef4444'; // Red
      dashArray = null;
    } else if (route.primary === 'train') {
      color = '#10b981'; // Green
      dashArray = null;
    } else if (route.primary === 'road') {
      color = '#facc15'; // Yellow
      dashArray = null;
    }

    const line = L.polyline(latlngs, {
      color: color,
      weight: 5,
      opacity: 0.85,
      dashArray: dashArray,
      interactive: true
    }).addTo(map);

    // Tooltip showing primary mode and all supported options
    const supportedModesText = route.modes.map(m => {
      if (m === 'train') return '🚂 Train';
      if (m === 'flight') return '✈️ Flight';
      if (m === 'ferry') return '🚢 Ferry';
      if (m === 'road') return '🚗 Road';
      return m;
    }).join(' OR ');

    line.bindTooltip(`
      <b>${from.name} ↔ ${to.name}</b><br>
      Distance: <b>${route.km.toLocaleString()} km</b><br>
      Type: <b>${route.primary.toUpperCase()}</b><br>
      Accepts: <b>${route.cost}x [${supportedModesText}]</b>
    `, { sticky: true });

    line.on('click', () => handleClaimRoute(route.id));
    polylines[route.id] = line;
  });

  // Render City Markers (Pins)
  WORLD_CITIES.forEach(city => {
    const icon = L.divIcon({
      className: 'city-pin',
      html: `
        <div class="pin-circle"></div>
        <div class="pin-label">${city.name}</div>
      `,
      iconSize: [60, 36],
      iconAnchor: [30, 8]
    });

    const marker = L.marker([city.lat, city.lng], { icon: icon }).addTo(map);
    marker.bindPopup(`<b>${city.name}</b> (${city.country})<br>Coordinates: ${city.lat.toFixed(1)}°, ${city.lng.toFixed(1)}°`);
    markers[city.id] = marker;
  });
}

// Check player has enough matching tickets
function canAffordRoute(playerNum, route) {
  const tickets = playerNum === 1 ? state.p1Tickets : state.p2Tickets;
  for (const mode of route.modes) {
    if (tickets[mode] >= route.cost) {
      return mode; // Return first valid mode found
    }
  }
  return null;
}

// Claim a route
function handleClaimRoute(routeId) {
  if (state.gameOver) return;

  // Turn check in online mode
  if (state.mode === 'p2p' && state.currentTurn !== state.myNum) {
    alert("Wait for opponent's turn!");
    return;
  }
  if (state.mode === 'ai' && state.currentTurn === 2) {
    return;
  }

  if (state.claimed[routeId]) {
    alert("This route is already claimed!");
    return;
  }

  const route = WORLD_ROUTES.find(r => r.id === routeId);
  const player = state.currentTurn;
  const validMode = canAffordRoute(player, route);

  if (!validMode) {
    alert(`You do not have ${route.cost} tickets matching [${route.modes.join(', ')}]! Draw tickets first.`);
    return;
  }

  // Deduct tickets
  const tickets = player === 1 ? state.p1Tickets : state.p2Tickets;
  tickets[validMode] -= route.cost;

  // Claim
  state.claimed[routeId] = player;
  if (player === 1) {
    state.p1Routes.push(routeId);
    state.p1Score += Math.round(route.km / 100);
  } else {
    state.p2Routes.push(routeId);
    state.p2Score += Math.round(route.km / 100);
  }

  // Recalculate total kilometers for circumnavigation
  updateCircumnavigation();
  checkMissions();
  updateVisuals();

  // Check Game End Condition: 40,075 km reached
  if (state.p1TotalKm >= EARTH_CIRCUMFERENCE_KM || state.p2TotalKm >= EARTH_CIRCUMFERENCE_KM) {
    endGame(state.p1TotalKm >= EARTH_CIRCUMFERENCE_KM ? 1 : 2, `reached ${EARTH_CIRCUMFERENCE_KM.toLocaleString()} km (Full Earth Circumnavigation)`);
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
    setTimeout(playAITurn, 900);
  }
}

// Compute circumnavigation coverage (sum of all claimed route distances in kilometers)
function updateCircumnavigation() {
  function getKm(routeIds) {
    let sum = 0;
    routeIds.forEach(id => {
      const r = WORLD_ROUTES.find(x => x.id === id);
      if (r && r.km) {
        sum += r.km;
      }
    });
    return sum;
  }

  state.p1TotalKm = getKm(state.p1Routes);
  state.p2TotalKm = getKm(state.p2Routes);
}

// Check Secret Missions completion using BFS
function checkMissions() {
  const checkConnected = (fromId, toId, playerRoutes) => {
    const adj = {};
    playerRoutes.forEach(rid => {
      const r = WORLD_ROUTES.find(x => x.id === rid);
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

  state.p1Missions.forEach(m => {
    if (!m.completed && checkConnected(m.from, m.to, state.p1Routes)) {
      m.completed = true;
      state.p1Score += m.pts;
    }
  });

  state.p2Missions.forEach(m => {
    if (!m.completed && checkConnected(m.from, m.to, state.p2Routes)) {
      m.completed = true;
      state.p2Score += m.pts;
    }
  });
}

function updateVisuals() {
  Object.keys(polylines).forEach(rid => {
    const line = polylines[rid];
    const claimedBy = state.claimed[rid];
    if (claimedBy === 1) {
      line.setStyle({
        color: '#38bdf8',
        weight: 6,
        opacity: 0.95,
        dashArray: null
      });
    } else if (claimedBy === 2) {
      line.setStyle({
        color: '#f43f5e',
        weight: 6,
        opacity: 0.95,
        dashArray: null
      });
    }
  });
}

function updateUI() {
  document.getElementById('scoreP1').textContent = `${state.p1Score} pts`;
  document.getElementById('scoreP2').textContent = `${state.p2Score} pts`;
  document.getElementById('labelP1').textContent = state.p1Name;
  document.getElementById('labelP2').textContent = state.p2Name;

  document.getElementById('subP1').textContent = `Routes: ${state.p1Routes.length} • Distance: ${state.p1TotalKm.toLocaleString()} km`;
  document.getElementById('subP2').textContent = `Routes: ${state.p2Routes.length} • Distance: ${state.p2TotalKm.toLocaleString()} km`;

  // Circumnavigation HUD
  const p1Pct = Math.min(100, Math.round((state.p1TotalKm / EARTH_CIRCUMFERENCE_KM) * 100));
  const p2Pct = Math.min(100, Math.round((state.p2TotalKm / EARTH_CIRCUMFERENCE_KM) * 100));
  document.getElementById('hudP1Name').textContent = `${state.p1Name}: ${state.p1TotalKm.toLocaleString()} / ${EARTH_CIRCUMFERENCE_KM.toLocaleString()} km (${p1Pct}%)`;
  document.getElementById('hudP2Name').textContent = `${state.p2Name}: ${state.p2TotalKm.toLocaleString()} / ${EARTH_CIRCUMFERENCE_KM.toLocaleString()} km (${p2Pct}%)`;

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

  // Display tickets in hand
  const currentTickets = (state.mode === 'p2p' && state.myNum === 2) ? state.p2Tickets : state.p1Tickets;
  document.getElementById('cntTrain').textContent = currentTickets.train;
  document.getElementById('cntFlight').textContent = currentTickets.flight;
  document.getElementById('cntFerry').textContent = currentTickets.ferry;
  document.getElementById('cntRoad').textContent = currentTickets.road;

  // Display Missions
  const missionsList = document.getElementById('missionsList');
  missionsList.innerHTML = '';
  const myMissions = (state.mode === 'p2p' && state.myNum === 2) ? state.p2Missions : state.p1Missions;
  myMissions.forEach(m => {
    const div = document.createElement('div');
    div.className = `mission-item ${m.completed ? 'mission-complete' : ''}`;
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-weight:700;">
        <span>${m.name}</span>
        <span style="color:${m.completed ? '#34d399' : '#f59e0b'};">+${m.pts} pts ${m.completed ? '✓' : ''}</span>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${m.desc}</div>
    `;
    missionsList.appendChild(div);
  });
}

// Strategic AI Globetrotter Engine
function playAITurn() {
  if (state.gameOver || state.currentTurn !== 2) return;

  const available = WORLD_ROUTES.filter(r => !state.claimed[r.id]);
  const affordable = available.filter(r => canAffordRoute(2, r) !== null);

  // Score candidate routes based on:
  // 1. Mission synergy (connects uncompleted mission cities)
  // 2. High distance (km)
  // 3. Efficient ticket usage
  if (affordable.length > 0) {
    let bestRoute = null;
    let highestScore = -Infinity;

    affordable.forEach(route => {
      let weight = route.km;

      // Bonus weight if route touches AI's missions
      state.p2Missions.forEach(m => {
        if (!m.completed) {
          if (route.from === m.from || route.to === m.from || route.from === m.to || route.to === m.to) {
            weight += 8000;
          }
        }
      });

      // Prefer preserving versatile flight tickets when a train/road option exists
      const preferredMode = canAffordRoute(2, route);
      if (preferredMode === 'road' || preferredMode === 'train') {
        weight += 1500;
      }

      if (weight > highestScore) {
        highestScore = weight;
        bestRoute = route;
      }
    });

    const chosen = bestRoute || affordable[0];
    const mode = canAffordRoute(2, chosen);

    state.p2Tickets[mode] -= chosen.cost;
    state.claimed[chosen.id] = 2;
    state.p2Routes.push(chosen.id);
    state.p2Score += Math.round(chosen.km / 100);

    updateCircumnavigation();
    checkMissions();
    updateVisuals();

    if (state.p2TotalKm >= EARTH_CIRCUMFERENCE_KM) {
      endGame(2, `reached ${EARTH_CIRCUMFERENCE_KM.toLocaleString()} km (Full Earth Circumnavigation)`);
      return;
    }

    state.currentTurn = 1;
    updateUI();
  } else {
    // Intelligently draw tickets
    drawRandomTickets(2);
    state.currentTurn = 1;
    updateUI();
  }
}

// Draw Tickets
function drawRandomTickets(playerNum) {
  const types = ['train', 'flight', 'ferry', 'road'];
  const t1 = types[Math.floor(Math.random() * types.length)];
  const t2 = types[Math.floor(Math.random() * types.length)];
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
    setTimeout(playAITurn, 800);
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
    alert(`🏁 GAME OVER!\n\n${winnerName} ${reason}!\n\nFinal Scores:\n${state.p1Name}: ${p1Final} pts\n${state.p2Name}: ${p2Final} pts\n\n🏆 Grand Champion: ${grandWinner}!`);
  }, 200);
}

// Reset view
document.getElementById('centerMapBtn').addEventListener('click', () => {
  if (map) map.setView([25, 10], 2);
});

// Forfeit
document.getElementById('forfeitBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to resign the expedition?")) {
    endGame(state.myNum === 1 ? 2 : 1, "won by opponent resignation");
  }
});

// Modal & Tabs
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
  const nick = document.getElementById('nicknameInput').value.trim() || 'Explorer-1';
  state.mode = 'ai';
  state.p1Name = nick;
  state.p2Name = 'AI Globetrotter';
  state.myNum = 1;
  resetGameSession();
  lobbyModal.style.display = 'none';
});

// Host P2P Room
document.getElementById('hostRoomBtn').addEventListener('click', () => {
  const nick = document.getElementById('nicknameInput').value.trim() || 'Explorer-1';
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
  const nick = document.getElementById('nicknameInput').value.trim() || 'Explorer-2';
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
    gamePrefix: 'c4w',
    onStatus: (msg) => {
      const statusEl = document.getElementById('joinStatusText');
      if (statusEl) statusEl.textContent = msg;
    },
    onConnected: ({ isHost }) => {
      lobbyModal.style.display = 'none';
      if (isHost) {
        // Send state to joined player
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
      alert("Opponent has disconnected from the expedition!");
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
  state.currentTurn = 1;
  state.gameOver = false;
  state.p1Tickets = { train: 3, flight: 3, ferry: 2, road: 3 };
  state.p2Tickets = { train: 3, flight: 3, ferry: 2, road: 3 };

  // Assign 2 random missions each
  const shuffled = [...MISSIONS_POOL].sort(() => 0.5 - Math.random());
  state.p1Missions = [shuffled[0], shuffled[1]].map(m => ({ ...m, completed: false }));
  state.p2Missions = [shuffled[2], shuffled[3]].map(m => ({ ...m, completed: false }));

  // Reset lines
  Object.keys(polylines).forEach(rid => {
    const line = polylines[rid];
    line.setStyle({
      color: '#94a3b8',
      weight: 4,
      opacity: 0.6,
      dashArray: '6, 8'
    });
  });

  updateUI();
}

// Window load init
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  resetGameSession();

  // Check URL query parameters for direct room joining
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    lobbyModal.style.display = 'flex';
    switchTab('join');
    document.getElementById('joinRoomCodeInput').value = room;
  }
});
