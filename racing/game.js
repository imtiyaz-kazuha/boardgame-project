/* =========================================================================
 * IMTI CORSA GT v7.2 — ASSETTO CORSA & iRACING LEVEL TELEMETRY & GT3 SIM
 * ========================================================================= */

// --- 1. CIRCUITS DATABASE WITH 3D ELEVATIONS & DISTINCT ATMOSPHERES ---
const CIRCUITS = {
  solaris: {
    name: "Solaris GP",
    sub: "14 Turns • 2 DRS Zones • Modern Cityscape",
    theme: "solaris",
    drsZones: [
      { detect: 0.90, start: 0.94, end: 0.14 },
      { detect: 0.64, start: 0.68, end: 0.78 }
    ],
    points: [
      new THREE.Vector3(0, 0, -320), new THREE.Vector3(0, 2, 260),
      new THREE.Vector3(95, 6, 340), new THREE.Vector3(175, 4, 220),
      new THREE.Vector3(270, 7, 290), new THREE.Vector3(370, 9, 210),
      new THREE.Vector3(470, 12, 275), new THREE.Vector3(560, 8, 120),
      new THREE.Vector3(440, 5, -30), new THREE.Vector3(260, 2, -10),
      new THREE.Vector3(220, 4, -140), new THREE.Vector3(430, 8, -240),
      new THREE.Vector3(380, 5, -390), new THREE.Vector3(200, 2, -430),
      new THREE.Vector3(55, 0, -440)
    ]
  },
  monza: {
    name: "Monza Speed",
    sub: "11 Turns • 2 DRS Zones • Autumn Parkland",
    theme: "monza",
    drsZones: [{ start: 0.92, end: 0.17 }, { start: 0.52, end: 0.66 }],
    points: [
      new THREE.Vector3(0, 0, -420), new THREE.Vector3(0, 1, 380),
      new THREE.Vector3(42, 3, 435), new THREE.Vector3(90, 4, 410),
      new THREE.Vector3(280, 8, 490), new THREE.Vector3(420, 6, 340),
      new THREE.Vector3(455, 4, 270), new THREE.Vector3(540, 3, 180),
      new THREE.Vector3(460, 1, -160), new THREE.Vector3(390, 3, -250),
      new THREE.Vector3(330, 5, -320), new THREE.Vector3(190, 2, -520),
      new THREE.Vector3(45, 0, -540)
    ]
  },
  spa: {
    name: "Spa-Francorchamps",
    sub: "19 Turns • Eau Rouge Hillclimb & Blanchimont",
    theme: "spa",
    drsZones: [{ start: 0.94, end: 0.12 }, { start: 0.20, end: 0.36 }],
    points: [
      new THREE.Vector3(-140, 2, -420), new THREE.Vector3(-140, 0, -180),
      new THREE.Vector3(-140, 4, 80),   new THREE.Vector3(-110, 19, 200),
      new THREE.Vector3(-30, 30, 240),  new THREE.Vector3(50, 35, 200),
      new THREE.Vector3(140, 32, 110),  new THREE.Vector3(240, 25, -10),
      new THREE.Vector3(350, 19, -160), new THREE.Vector3(450, 10, -310),
      new THREE.Vector3(520, 8, -290),  new THREE.Vector3(490, 6, -160),
      new THREE.Vector3(390, 4, -70),   new THREE.Vector3(310, 5, 0),
      new THREE.Vector3(360, 11, 130),  new THREE.Vector3(410, 17, 260),
      new THREE.Vector3(360, 19, 380),  new THREE.Vector3(250, 21, 460),
      new THREE.Vector3(130, 16, 480),  new THREE.Vector3(10, 12, 430),
      new THREE.Vector3(-110, 7, 350),  new THREE.Vector3(-230, 4, 240),
      new THREE.Vector3(-270, 2, 70),   new THREE.Vector3(-260, 1, -120),
      new THREE.Vector3(-220, 1, -260), new THREE.Vector3(-170, 1, -360)
    ]
  },
  silverstone: {
    name: "Silverstone GP",
    sub: "18 Turns • Maggotts, Becketts & Stowe",
    theme: "silverstone",
    drsZones: [{ start: 0.94, end: 0.12 }, { start: 0.44, end: 0.58 }],
    points: [
      new THREE.Vector3(-140, 0, -320), new THREE.Vector3(-140, 2, 120),
      new THREE.Vector3(-70, 4, 230),   new THREE.Vector3(50, 6, 270),
      new THREE.Vector3(140, 8, 180),   new THREE.Vector3(200, 5, 90),
      new THREE.Vector3(160, 3, -10),   new THREE.Vector3(240, 4, -140),
      new THREE.Vector3(360, 7, -120),  new THREE.Vector3(450, 5, 0),
      new THREE.Vector3(430, 3, 190),   new THREE.Vector3(340, 5, 330),
      new THREE.Vector3(240, 7, 410),   new THREE.Vector3(130, 4, 480),
      new THREE.Vector3(-30, 2, 490),   new THREE.Vector3(-160, 1, 380),
      new THREE.Vector3(-250, 2, 210),  new THREE.Vector3(-260, 0, 10),
      new THREE.Vector3(-240, 0, -190), new THREE.Vector3(-200, 0, -300)
    ]
  },
  suzuka: {
    name: "Suzuka Circuit",
    sub: "16 Turns • High-Speed Esses & 130R",
    theme: "suzuka",
    drsZones: [{ start: 0.93, end: 0.13 }, { start: 0.78, end: 0.88 }],
    points: [
      new THREE.Vector3(0, 0, -260), new THREE.Vector3(0, 3, 210),
      new THREE.Vector3(95, 7, 285), new THREE.Vector3(165, 12, 175),
      new THREE.Vector3(255, 14, 240), new THREE.Vector3(345, 11, 145),
      new THREE.Vector3(450, 8, 235), new THREE.Vector3(580, 5, 150),
      new THREE.Vector3(620, 3, 10), new THREE.Vector3(460, 6, -80),
      new THREE.Vector3(370, 9, -20), new THREE.Vector3(390, 11, -240),
      new THREE.Vector3(260, 7, -390), new THREE.Vector3(105, 3, -320),
      new THREE.Vector3(35, 1, -385)
    ]
  },
  nurburgring: {
    name: "Nürburgring GP",
    sub: "15 Turns • Dunlop Hairpin & Eifel Hills",
    theme: "nurburgring",
    drsZones: [{ start: 0.94, end: 0.15 }, { start: 0.58, end: 0.72 }],
    points: [
      new THREE.Vector3(-60, 14, -300), new THREE.Vector3(-60, 10, 160),
      new THREE.Vector3(-10, 2, 250),   new THREE.Vector3(70, 0, 270),
      new THREE.Vector3(120, 6, 190),   new THREE.Vector3(70, 14, 100),
      new THREE.Vector3(140, 20, 40),   new THREE.Vector3(240, 26, -10),
      new THREE.Vector3(330, 30, -90),  new THREE.Vector3(370, 24, -210),
      new THREE.Vector3(290, 19, -300), new THREE.Vector3(180, 16, -240),
      new THREE.Vector3(100, 14, -330), new THREE.Vector3(180, 17, -430),
      new THREE.Vector3(90, 15, -480),  new THREE.Vector3(-10, 14, -440)
    ]
  }
};

const TRACK_HALF_WIDTH = 10.4;
const KERB_WIDTH = 1.65;
const KERB_HEIGHT = 0.085;
const WALL_OFFSET = 14.5;
const TRACK_SAMPLES = 1000;

let currentCircuitKey = 'solaris';
let trackCurve = null;
let trackSamples = [];
let totalTrackLength = 1;
let minX = 0, maxX = 1, minZ = 0, maxZ = 1;
let isMenuOpen = true;

// Championship Race Mode State
let targetRaceLaps = 3;
let isRaceFinished = false;
let raceStartTime = performance.now();

// --- 2. THREE.JS SCENE, SKY DOME, SUN HALO & SCENERY ---
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1.0);
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x131e33, 0.0005);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2800);

const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x1e293b, 1.0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffaed, 1.35);
sunLight.position.set(-450, 320, 600);
scene.add(sunLight);

let skyDomeMesh = null;
let sunDiscMesh = null;
let sunHaloMesh = null;
let environmentPropsGroup = new THREE.Group();
scene.add(environmentPropsGroup);

let groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(5400, 5400),
  new THREE.MeshLambertMaterial({ color: 0x152c1e })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -0.25;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

function updateCircuitAtmosphere(theme) {
  while (environmentPropsGroup.children.length > 0) {
    environmentPropsGroup.remove(environmentPropsGroup.children[0]);
  }

  let topSky = '#070b19', midSky = '#16264c', lowSky = '#3b426f', horizSky = '#f59e0b';
  let fogColor = 0x131e33, fogDensity = 0.00055;
  let groundColor = 0x152c1e;
  let hemiSky = 0xffedd5, hemiGround = 0x1e293b;
  let sunColor = 0xfffaed, sunIntensity = 1.25;

  if (theme === 'spa') {
    topSky = '#0b1622'; midSky = '#1e2e3d'; lowSky = '#334856'; horizSky = '#64748b';
    fogColor = 0x1e2e3d; fogDensity = 0.00085;
    groundColor = 0x0f2918;
    hemiSky = 0xdbeafe; hemiGround = 0x0f172a;
    sunColor = 0xfef08a; sunIntensity = 1.05;
  } else if (theme === 'monza') {
    topSky = '#0f172a'; midSky = '#1e3a5f'; lowSky = '#7c2d12'; horizSky = '#ea580c';
    fogColor = 0x2a1b18; fogDensity = 0.00045;
    groundColor = 0x2d3716;
    hemiSky = 0xfef3c7; hemiGround = 0x451a03;
    sunColor = 0xffedd5; sunIntensity = 1.35;
  } else if (theme === 'nurburgring') {
    topSky = '#0d131f'; midSky = '#192636'; lowSky = '#2e3d48'; horizSky = '#475569';
    fogColor = 0x1e293b; fogDensity = 0.00095;
    groundColor = 0x14281a;
    hemiSky = 0xe2e8f0; hemiGround = 0x1e293b;
    sunColor = 0xf8fafc; sunIntensity = 1.0;
  } else if (theme === 'silverstone') {
    topSky = '#0a1931'; midSky = '#183863'; lowSky = '#42688f'; horizSky = '#93c5fd';
    fogColor = 0x1e2e42; fogDensity = 0.0005;
    groundColor = 0x16331d;
    hemiSky = 0xe0f2fe; hemiGround = 0x1e293b;
    sunColor = 0xffffff; sunIntensity = 1.3;
  }

  scene.fog.color.setHex(fogColor);
  scene.fog.density = fogDensity;
  hemiLight.color.setHex(hemiSky);
  hemiLight.groundColor.setHex(hemiGround);
  sunLight.color.setHex(sunColor);
  sunLight.intensity = sunIntensity;
  groundMesh.material.color.setHex(groundColor);

  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512; skyCanvas.height = 512;
  const sCtx = skyCanvas.getContext('2d');
  const grad = sCtx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, topSky);
  grad.addColorStop(0.42, midSky);
  grad.addColorStop(0.72, lowSky);
  grad.addColorStop(1.0, horizSky);
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 512, 512);

  const skyTex = new THREE.CanvasTexture(skyCanvas);
  if (skyDomeMesh) scene.remove(skyDomeMesh);
  skyDomeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2200, 32, 24),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
  );
  scene.add(skyDomeMesh);

  if (!sunDiscMesh) {
    sunDiscMesh = new THREE.Mesh(new THREE.CircleGeometry(95, 32), new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false }));
    sunDiscMesh.position.set(-850, 320, 1150);
    sunDiscMesh.lookAt(0, 0, 0);
    scene.add(sunDiscMesh);

    sunHaloMesh = new THREE.Mesh(new THREE.CircleGeometry(210, 32), new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.28, fog: false }));
    sunHaloMesh.position.set(-845, 320, 1145);
    sunHaloMesh.lookAt(0, 0, 0);
    scene.add(sunHaloMesh);
  }

  if (theme === 'solaris' || theme === 'suzuka') {
    const bldgCanvas = document.createElement('canvas');
    bldgCanvas.width = 128; bldgCanvas.height = 256;
    const bCtx = bldgCanvas.getContext('2d');
    bCtx.fillStyle = '#0f172a';
    bCtx.fillRect(0, 0, 128, 256);
    for (let y = 8; y < 248; y += 10) {
      for (let x = 8; x < 120; x += 14) {
        if (Math.random() > 0.38) {
          bCtx.fillStyle = Math.random() > 0.2 ? '#fde68a' : '#38bdf8';
          bCtx.fillRect(x, y, 8, 5);
        }
      }
    }
    const bldgTex = new THREE.CanvasTexture(bldgCanvas);
    const bldgMat = new THREE.MeshLambertMaterial({ map: bldgTex });
    const darkTowerMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2;
      const radius = 700 + Math.random() * 550;
      const cx = 250 + Math.cos(angle) * radius;
      const cz = -40 + Math.sin(angle) * radius;

      if (trackSamples && trackSamples.length > 0) {
        let tooClose = false;
        for (let s = 0; s < trackSamples.length; s += 8) {
          const p = trackSamples[s].pt;
          if ((cx - p.x)**2 + (cz - p.z)**2 < 45 * 45) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;
      }

      const w = 32 + Math.random() * 45;
      const d = 32 + Math.random() * 45;
      const h = 65 + Math.random() * 220;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), Math.random() > 0.25 ? bldgMat : darkTowerMat);
      mesh.position.set(cx, h / 2 - 2, cz);
      environmentPropsGroup.add(mesh);
    }
  } else {
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.9, 5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const foliageGeo = new THREE.ConeGeometry(4.2, 11, 7);
    const foliageColor = theme === 'monza' ? 0x854d0e : 0x14532d;
    const foliageMat = new THREE.MeshLambertMaterial({ color: foliageColor });

    for (let i = 0; i < 160; i++) {
      const angle = (i / 160) * Math.PI * 2;
      const radius = 320 + Math.random() * 750;
      const tx = 180 + Math.cos(angle) * radius;
      const tz = -60 + Math.sin(angle) * radius;

      if (trackSamples && trackSamples.length > 0) {
        let tooClose = false;
        for (let s = 0; s < trackSamples.length; s += 5) {
          const p = trackSamples[s].pt;
          if ((tx - p.x)**2 + (tz - p.z)**2 < 34 * 34) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;
      }

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.5;
      const fol = new THREE.Mesh(foliageGeo, foliageMat);
      fol.position.y = 9.5;
      tree.add(trunk, fol);

      const scale = 0.8 + Math.random() * 0.9;
      tree.scale.set(scale, scale, scale);
      tree.position.set(tx, 0, tz);
      environmentPropsGroup.add(tree);
    }
  }
}

// --- 3. PROCEDURAL BRAKING BOARDS & DRS SIGNS ---
const signTextures = {};
function getSignMaterial(label, bgHex) {
  const key = `${label}_${bgHex}`;
  if (signTextures[key]) return signTextures[key];
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx2 = c.getContext('2d');
  ctx2.fillStyle = bgHex;
  ctx2.fillRect(0, 0, 256, 128);
  ctx2.lineWidth = 8;
  ctx2.strokeStyle = '#ffffff';
  ctx2.strokeRect(4, 4, 248, 120);
  ctx2.fillStyle = '#ffffff';
  ctx2.font = '900 66px monospace';
  ctx2.textAlign = 'center';
  ctx2.textBaseline = 'middle';
  ctx2.fillText(label, 128, 66);
  signTextures[key] = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.DoubleSide });
  return signTextures[key];
}

let circuitGroup = new THREE.Group();
scene.add(circuitGroup);
let racingLineMesh = null;
let showRacingLine = false;

function loadCircuit(circuitKey) {
  currentCircuitKey = circuitKey;
  const spec = CIRCUITS[circuitKey];
  document.getElementById('minimapTitle').textContent = spec.name;

  while (circuitGroup.children.length > 0) {
    circuitGroup.remove(circuitGroup.children[0]);
  }

  trackCurve = new THREE.CatmullRomCurve3(spec.points, true, 'centripetal', 0.35);
  trackSamples = [];
  minX = Infinity; maxX = -Infinity; minZ = Infinity; maxZ = -Infinity;

  for (let i = 0; i < TRACK_SAMPLES; i++) {
    const t = i / TRACK_SAMPLES;
    const pt = trackCurve.getPointAt(t);
    const tan = trackCurve.getTangentAt(t).normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    trackSamples.push({ i, t, pt, tan, right, curvature: 0 });
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.z < minZ) minZ = pt.z;
    if (pt.z > maxZ) maxZ = pt.z;
  }

  updateCircuitAtmosphere(spec.theme || currentCircuitKey);

  for (let i = 0; i < TRACK_SAMPLES; i++) {
    const prev = trackSamples[(i - 6 + TRACK_SAMPLES) % TRACK_SAMPLES].tan;
    const next = trackSamples[(i + 6) % TRACK_SAMPLES].tan;
    trackSamples[i].curvature = prev.z * next.x - prev.x * next.z;
  }

  const kerbActiveL = new Uint8Array(TRACK_SAMPLES);
  const kerbActiveR = new Uint8Array(TRACK_SAMPLES);

  for (let i = 0; i < TRACK_SAMPLES; i++) {
    const c = trackSamples[i].curvature;
    if (Math.abs(c) > 0.16) {
      if (c > 0) {
        for (let w = -14; w <= 16; w++) kerbActiveR[(i + w + TRACK_SAMPLES) % TRACK_SAMPLES] = 1;
        for (let w = -28; w <= 36; w++) kerbActiveL[(i + w + TRACK_SAMPLES) % TRACK_SAMPLES] = 1;
      } else {
        for (let w = -14; w <= 16; w++) kerbActiveL[(i + w + TRACK_SAMPLES) % TRACK_SAMPLES] = 1;
        for (let w = -28; w <= 36; w++) kerbActiveR[(i + w + TRACK_SAMPLES) % TRACK_SAMPLES] = 1;
      }
    }
  }

  totalTrackLength = trackCurve.getLength();
  const metersPerSample = totalTrackLength / TRACK_SAMPLES;

  const asphaltPos = [], asphaltIdx = [];
  const kerbPos = [], kerbCol = [], kerbIdx = [];
  const runoffPos = [], runoffCol = [], runoffIdx = [];
  const wallPos = [], wallCol = [], wallIdx = [];
  const linePos = [], lineCol = [], lineIdx = [];
  const wallH = 1.15;

  for (let i = 0; i <= TRACK_SAMPLES; i++) {
    const idx = i % TRACK_SAMPLES;
    const s = trackSamples[idx];
    const pL = s.pt.clone().addScaledVector(s.right, -TRACK_HALF_WIDTH);
    const pR = s.pt.clone().addScaledVector(s.right,  TRACK_HALF_WIDTH);

    asphaltPos.push(pL.x, pL.y + 0.015, pL.z, pR.x, pR.y + 0.015, pR.z);

    const roL = s.pt.clone().addScaledVector(s.right, -(WALL_OFFSET - 0.2));
    const roR = s.pt.clone().addScaledVector(s.right,  (WALL_OFFSET - 0.2));
    runoffPos.push(
      roL.x, roL.y + 0.008, roL.z,
      pL.x,  pL.y  + 0.012, pL.z,
      pR.x,  pR.y  + 0.012, pR.z,
      roR.x, roR.y + 0.008, roR.z
    );

    const isSharpTurn = Math.abs(s.curvature) > 0.22;
    const roColorL = isSharpTurn && s.curvature > 0 ? [0.76, 0.64, 0.45] : [0.20, 0.22, 0.26];
    const roColorR = isSharpTurn && s.curvature < 0 ? [0.76, 0.64, 0.45] : [0.20, 0.22, 0.26];
    runoffCol.push(roColorL[0], roColorL[1], roColorL[2], roColorL[0], roColorL[1], roColorL[2]);
    runoffCol.push(roColorR[0], roColorR[1], roColorR[2], roColorR[0], roColorR[1], roColorR[2]);

    const wL = s.pt.clone().addScaledVector(s.right, -WALL_OFFSET);
    const wR = s.pt.clone().addScaledVector(s.right,  WALL_OFFSET);
    wallPos.push(
      wL.x, wL.y,         wL.z,
      wL.x, wL.y + wallH, wL.z,
      wR.x, wR.y,         wR.z,
      wR.x, wR.y + wallH, wR.z
    );

    const isBlue = Math.floor(i / 4) % 2 === 0;
    const wc = isBlue ? [0.82, 0.85, 0.90] : [0.15, 0.38, 0.68];
    for (let k = 0; k < 4; k++) wallCol.push(wc[0], wc[1], wc[2]);

    const apexShift = THREE.MathUtils.clamp(s.curvature * 12, -TRACK_HALF_WIDTH * 0.58, TRACK_HALF_WIDTH * 0.58);
    const lineCenter = s.pt.clone().addScaledVector(s.right, apexShift);
    const lL = lineCenter.clone().addScaledVector(s.right, -0.48);
    const lR = lineCenter.clone().addScaledVector(s.right,  0.48);
    linePos.push(lL.x, lL.y + 0.038, lL.z, lR.x, lR.y + 0.038, lR.z);
    const aheadCurve = Math.abs(trackSamples[(idx + 22) % TRACK_SAMPLES].curvature);
    const rc = (aheadCurve > 0.28) ? [0.95, 0.18, 0.28] : [0.06, 0.72, 0.50];
    lineCol.push(rc[0], rc[1], rc[2], rc[0], rc[1], rc[2]);

    if (i < TRACK_SAMPLES) {
      const bA = i * 2;
      asphaltIdx.push(bA, bA + 1, bA + 2, bA + 1, bA + 3, bA + 2);
      lineIdx.push(bA, bA + 1, bA + 2, bA + 1, bA + 3, bA + 2);

      const bRO = i * 4;
      runoffIdx.push(bRO, bRO + 1, bRO + 4, bRO + 1, bRO + 5, bRO + 4);
      runoffIdx.push(bRO + 2, bRO + 3, bRO + 6, bRO + 3, bRO + 7, bRO + 6);

      const bW = i * 4;
      wallIdx.push(bW, bW + 1, bW + 4, bW + 1, bW + 5, bW + 4);
      wallIdx.push(bW + 2, bW + 6, bW + 3, bW + 3, bW + 6, bW + 7);

      const nextIdx = (i + 1) % TRACK_SAMPLES;
      const nextS = trackSamples[nextIdx];
      const npL = nextS.pt.clone().addScaledVector(nextS.right, -TRACK_HALF_WIDTH);
      const npR = nextS.pt.clone().addScaledVector(nextS.right,  TRACK_HALF_WIDTH);

      if (kerbActiveL[idx] && kerbActiveL[nextIdx]) {
        const baseK = kerbPos.length / 3;
        const saw0 = (i % 2 === 0) ? KERB_HEIGHT : KERB_HEIGHT * 0.75;
        const saw1 = ((i + 1) % 2 === 0) ? KERB_HEIGHT : KERB_HEIGHT * 0.75;

        const kL0_in  = pL.clone();
        const kL0_mid = s.pt.clone().addScaledVector(s.right, -(TRACK_HALF_WIDTH + 0.35));
        const kL0_out = s.pt.clone().addScaledVector(s.right, -(TRACK_HALF_WIDTH + KERB_WIDTH));

        const kL1_in  = npL.clone();
        const kL1_mid = nextS.pt.clone().addScaledVector(nextS.right, -(TRACK_HALF_WIDTH + 0.35));
        const kL1_out = nextS.pt.clone().addScaledVector(nextS.right, -(TRACK_HALF_WIDTH + KERB_WIDTH));

        kerbPos.push(
          kL0_out.x, kL0_out.y + saw0 * 0.85, kL0_out.z,
          kL0_mid.x, kL0_mid.y + saw0,        kL0_mid.z,
          kL0_in.x,  kL0_in.y  + 0.02,        kL0_in.z,
          kL1_out.x, kL1_out.y + saw1 * 0.85, kL1_out.z,
          kL1_mid.x, kL1_mid.y + saw1,        kL1_mid.z,
          kL1_in.x,  kL1_in.y  + 0.02,        kL1_in.z
        );

        const isRed0 = i % 2 === 0;
        const kc0 = isRed0 ? [0.88, 0.14, 0.20] : [0.96, 0.97, 0.99];
        const isRed1 = (i + 1) % 2 === 0;
        const kc1 = isRed1 ? [0.88, 0.14, 0.20] : [0.96, 0.97, 0.99];

        for (let k = 0; k < 3; k++) kerbCol.push(kc0[0], kc0[1], kc0[2]);
        for (let k = 0; k < 3; k++) kerbCol.push(kc1[0], kc1[1], kc1[2]);

        kerbIdx.push(baseK, baseK + 1, baseK + 3, baseK + 1, baseK + 4, baseK + 3);
        kerbIdx.push(baseK + 1, baseK + 2, baseK + 4, baseK + 2, baseK + 5, baseK + 4);
      }

      if (kerbActiveR[idx] && kerbActiveR[nextIdx]) {
        const baseK = kerbPos.length / 3;
        const saw0 = (i % 2 === 0) ? KERB_HEIGHT : KERB_HEIGHT * 0.75;
        const saw1 = ((i + 1) % 2 === 0) ? KERB_HEIGHT : KERB_HEIGHT * 0.75;

        const kR0_in  = pR.clone();
        const kR0_mid = s.pt.clone().addScaledVector(s.right, (TRACK_HALF_WIDTH + 0.35));
        const kR0_out = s.pt.clone().addScaledVector(s.right, (TRACK_HALF_WIDTH + KERB_WIDTH));

        const kR1_in  = npR.clone();
        const kR1_mid = nextS.pt.clone().addScaledVector(nextS.right, (TRACK_HALF_WIDTH + 0.35));
        const kR1_out = nextS.pt.clone().addScaledVector(nextS.right, (TRACK_HALF_WIDTH + KERB_WIDTH));

        kerbPos.push(
          kR0_in.x,  kR0_in.y  + 0.02,        kR0_in.z,
          kR0_mid.x, kR0_mid.y + saw0,        kR0_mid.z,
          kR0_out.x, kR0_out.y + saw0 * 0.85, kR0_out.z,
          kR1_in.x,  kR1_in.y  + 0.02,        kR1_in.z,
          kR1_mid.x, kR1_mid.y + saw1,        kR1_mid.z,
          kR1_out.x, kR1_out.y + saw1 * 0.85, kR1_out.z
        );

        const isRed0 = i % 2 === 0;
        const kc0 = isRed0 ? [0.88, 0.14, 0.20] : [0.96, 0.97, 0.99];
        const isRed1 = (i + 1) % 2 === 0;
        const kc1 = isRed1 ? [0.88, 0.14, 0.20] : [0.96, 0.97, 0.99];

        for (let k = 0; k < 3; k++) kerbCol.push(kc0[0], kc0[1], kc0[2]);
        for (let k = 0; k < 3; k++) kerbCol.push(kc1[0], kc1[1], kc1[2]);

        kerbIdx.push(baseK, baseK + 1, baseK + 3, baseK + 1, baseK + 4, baseK + 3);
        kerbIdx.push(baseK + 1, baseK + 2, baseK + 4, baseK + 2, baseK + 5, baseK + 4);
      }
    }
  }

  const aspGeo = new THREE.BufferGeometry();
  aspGeo.setAttribute('position', new THREE.Float32BufferAttribute(asphaltPos, 3));
  aspGeo.setIndex(asphaltIdx);
  aspGeo.computeVertexNormals();
  const aspMesh = new THREE.Mesh(aspGeo, new THREE.MeshStandardMaterial({ color: 0x242730, roughness: 0.86 }));
  aspMesh.receiveShadow = true;
  circuitGroup.add(aspMesh);

  const roGeo = new THREE.BufferGeometry();
  roGeo.setAttribute('position', new THREE.Float32BufferAttribute(runoffPos, 3));
  roGeo.setAttribute('color', new THREE.Float32BufferAttribute(runoffCol, 3));
  roGeo.setIndex(runoffIdx);
  roGeo.computeVertexNormals();
  const roMesh = new THREE.Mesh(roGeo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  roMesh.receiveShadow = true;
  circuitGroup.add(roMesh);

  const kGeo = new THREE.BufferGeometry();
  kGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbPos, 3));
  kGeo.setAttribute('color', new THREE.Float32BufferAttribute(kerbCol, 3));
  kGeo.setIndex(kerbIdx);
  kGeo.computeVertexNormals();
  const kMesh = new THREE.Mesh(kGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }));
  kMesh.castShadow = true;
  kMesh.receiveShadow = true;
  circuitGroup.add(kMesh);

  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.Float32BufferAttribute(wallPos, 3));
  wGeo.setAttribute('color', new THREE.Float32BufferAttribute(wallCol, 3));
  wGeo.setIndex(wallIdx);
  wGeo.computeVertexNormals();
  circuitGroup.add(new THREE.Mesh(wGeo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));

  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  lGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
  lGeo.setIndex(lineIdx);
  racingLineMesh = new THREE.Mesh(lGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  racingLineMesh.visible = showRacingLine;
  circuitGroup.add(racingLineMesh);

  const sf = trackSamples[0];
  const gantry = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  const pL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 7.5, 0.9), postMat);
  pL.position.set(-TRACK_HALF_WIDTH - 2, 3.75, 0);
  const pR = pL.clone();
  pR.position.x = TRACK_HALF_WIDTH + 2;
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry((TRACK_HALF_WIDTH + 2.5) * 2, 1.5, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  topBar.position.set(0, 7.2, 0);
  const startLine = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_HALF_WIDTH * 2, 2.2),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  startLine.rotation.x = -Math.PI / 2;
  startLine.position.y = 0.03;
  gantry.add(pL, pR, topBar, startLine);
  gantry.position.copy(sf.pt);
  gantry.rotation.y = Math.atan2(sf.tan.x, sf.tan.z);
  circuitGroup.add(gantry);

  const apexIndices = [];
  let lastApex = -85;
  for (let i = 30; i < TRACK_SAMPLES - 20; i++) {
    if (Math.abs(trackSamples[i].curvature) > 0.32 && i - lastApex > 60) {
      apexIndices.push({ index: i, sign: Math.sign(trackSamples[i].curvature) });
      lastApex = i;
    }
  }
  const boardGeo = new THREE.PlaneGeometry(2.4, 1.2);
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.3, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

  apexIndices.forEach((apex) => {
    const outsideSide = apex.sign >= 0 ? -1 : 1;
    [200, 100, 50].forEach((distMeters) => {
      const offsetSamples = Math.round((distMeters * 0.6) / metersPerSample);
      const idx = (apex.index - offsetSamples + TRACK_SAMPLES) % TRACK_SAMPLES;
      const s = trackSamples[idx];
      const bgHex = distMeters === 50 ? '#e11d48' : distMeters === 100 ? '#f59e0b' : '#0f172a';
      const boardGroup = new THREE.Group();
      const signMesh = new THREE.Mesh(boardGeo, getSignMaterial(`${distMeters}m`, bgHex));
      signMesh.position.y = 1.3;
      signMesh.rotation.y = Math.PI;
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.y = 0.65;
      boardGroup.add(signMesh, poleMesh);
      boardGroup.position.copy(s.pt.clone().addScaledVector(s.right, outsideSide * (TRACK_HALF_WIDTH + 2.4)));
      boardGroup.rotation.y = Math.atan2(s.tan.x, s.tan.z);
      circuitGroup.add(boardGroup);
    });
  });

  spec.drsZones.forEach((zone) => {
    const idx = Math.floor(zone.start * TRACK_SAMPLES) % TRACK_SAMPLES;
    const s = trackSamples[idx];
    const drsSign = new THREE.Group();
    const signMesh = new THREE.Mesh(boardGeo, getSignMaterial('DRS', '#059669'));
    signMesh.position.y = 1.5;
    signMesh.rotation.y = Math.PI;
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 0.75;
    drsSign.add(signMesh, poleMesh);
    drsSign.position.copy(s.pt.clone().addScaledVector(s.right, -(TRACK_HALF_WIDTH + 2.5)));
    drsSign.rotation.y = Math.atan2(s.tan.x, s.tan.z);
    circuitGroup.add(drsSign);
  });
}

// --- 4. 3D HIGH-FIDELITY GT3 CAR FACTORY ---
function createGT3CarModel(hexColor) {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const paintMat = new THREE.MeshStandardMaterial({
    color: hexColor,
    metalness: 0.72,
    roughness: 0.18
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x111c2e,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.65,
    transparent: true,
    opacity: 0.88
  });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.25, roughness: 0.55 });
  const grillMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ledGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const brakeLightMat = new THREE.MeshBasicMaterial({ color: 0x550000 });

  const underbody = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.12, 4.40), carbonMat);
  underbody.position.set(0, 0.18, 0.0);
  bodyPivot.add(underbody);

  const mainHull = new THREE.Group();
  bodyPivot.add(mainHull);

  const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.22, 1.65), paintMat);
  hoodMesh.position.set(0, 0.44, 1.25);
  hoodMesh.rotation.x = -0.09;
  mainHull.add(hoodMesh);

  const waistMesh = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.36, 1.70), paintMat);
  waistMesh.position.set(0, 0.42, -0.25);
  mainHull.add(waistMesh);

  const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.28, 1.25), paintMat);
  rearDeck.position.set(0, 0.52, -1.55);
  rearDeck.rotation.x = 0.07;
  mainHull.add(rearDeck);

  const cockpit = new THREE.Group();
  cockpit.position.set(0, 0.65, -0.15);
  bodyPivot.add(cockpit);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 1.25), paintMat);
  roof.position.set(0, 0.50, -0.15);
  cockpit.add(roof);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.06, 0.85), glassMat);
  windshield.position.set(0, 0.34, 0.65);
  windshield.rotation.x = -0.58;
  cockpit.add(windshield);

  const noseCone = new THREE.Mesh(new THREE.BoxGeometry(1.80, 0.28, 0.45), paintMat);
  noseCone.position.set(0, 0.34, 2.05);
  mainHull.add(noseCone);

  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.10, 0.22), headLightMat);
  headL.position.set(-0.68, 0.42, 2.08);
  headL.rotation.y = 0.24;
  const headR = headL.clone();
  headR.position.x = 0.68;
  headR.rotation.y = -0.24;
  mainHull.add(headL, headR);

  const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.07, 0.62), carbonMat);
  splitter.position.set(0, 0.18, 2.22);
  bodyPivot.add(splitter);

  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.22, 0.52), carbonMat);
  diffuser.position.set(0, 0.24, -2.18);
  diffuser.rotation.x = -0.22;
  bodyPivot.add(diffuser);

  const brakeLightBar = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.09, 0.06), brakeLightMat);
  brakeLightBar.position.set(0, 0.58, -2.24);
  bodyPivot.add(brakeLightBar);

  const rearWingFlap = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.065, 0.48), carbonMat);
  rearWingFlap.position.set(0, 1.28, -2.16);
  rearWingFlap.rotation.x = 0.24;
  bodyPivot.add(rearWingFlap);

  const wheels = [];
  const wheelOffsets = [
    { id: 'FL', x: -0.98, z: 1.40 }, { id: 'FR', x:  0.98, z: 1.40 },
    { id: 'RL', x: -0.98, z: -1.38 }, { id: 'RR', x:  0.98, z: -1.38 }
  ];

  const tireGeo = new THREE.CylinderGeometry(0.355, 0.355, 0.34, 20);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.92 });
  const rimGeo = new THREE.CylinderGeometry(0.225, 0.225, 0.35, 12);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });

  wheelOffsets.forEach((w) => {
    const steerPivot = new THREE.Group();
    steerPivot.position.set(w.x, 0.35, w.z);

    const rollMesh = new THREE.Mesh(tireGeo, tireMat);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rollMesh.add(rimMesh);

    steerPivot.add(rollMesh);
    root.add(steerPivot);
    wheels.push({ steerPivot, rollMesh });
  });

  scene.add(root);
  return { root, bodyPivot, mainHull, cockpit, splitter, rearWingFlap, brakeLightMat, wheels };
}

const playerVisual = createGT3CarModel(0xe11d48);

// Smoke System
const smokePuffs = [];
const smokeGeo = new THREE.SphereGeometry(0.35, 7, 7);
const smokeMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.55 });
const fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 });

function spawnDamageSmoke(x, y, z, isCritical) {
  const mesh = new THREE.Mesh(smokeGeo, isCritical ? fireMat.clone() : smokeMat.clone());
  mesh.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.3, z + (Math.random() - 0.5) * 0.4);
  const scaleInit = 0.5 + Math.random() * 0.4;
  mesh.scale.set(scaleInit, scaleInit, scaleInit);
  scene.add(mesh);
  smokePuffs.push({
    mesh,
    life: 0,
    maxLife: isCritical ? 1.4 : 0.9,
    vx: (Math.random() - 0.5) * 1.5,
    vy: 1.8 + Math.random() * 1.6,
    vz: (Math.random() - 0.5) * 1.5
  });
}

function updateSmokePuffs(dt) {
  for (let i = smokePuffs.length - 1; i >= 0; i--) {
    const p = smokePuffs[i];
    p.life += dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    const progress = p.life / p.maxLife;
    p.mesh.scale.multiplyScalar(1 + dt * 2.2);
    p.mesh.material.opacity = Math.max(0, 0.6 * (1 - progress));
    if (p.life >= p.maxLife) {
      scene.remove(p.mesh);
      smokePuffs.splice(i, 1);
    }
  }
}

// --- 5. AGGRESSIVE PRO LATE-BRAKING PHYSICS AI ---
const AI_COLORS = [0x38bdf8, 0x10b981, 0xa855f7, 0xf97316, 0xeab308, 0xec4899, 0x6366f1];
let aiCars = [];
let aiSkillMultiplier = 1.0;

function spawnAiGrid(count) {
  aiCars.forEach(ai => scene.remove(ai.visual.root));
  aiCars = [];

  for (let i = 0; i < count; i++) {
    const visual = createGT3CarModel(AI_COLORS[i % AI_COLORS.length]);
    const startIdx = (24 + (i + 1) * 16) % TRACK_SAMPLES;
    const s = trackSamples[startIdx];
    const lanePref = ((i % 2 === 0) ? -1 : 1) * 2.8;
    const spawnPos = s.pt.clone().addScaledVector(s.right, lanePref);

    aiCars.push({
      id: i + 1,
      visual,
      x: spawnPos.x,
      z: spawnPos.z,
      yaw: Math.atan2(s.tan.x, s.tan.z),
      vx: 0,
      vz: 0,
      yawRate: 0,
      steerAngle: 0,
      throttle: 0,
      brake: 0,
      lanePref,
      laps: 1,
      progressT: s.t,
      passedHalfway: false,
      lastTrackIdx: startIdx,
      paceFactor: (0.98 + (i / Math.max(1, count)) * 0.08) * aiSkillMultiplier,
      wheelRot: 0,
      drsEligible: false,
      drsActive: false,
      ersBattery: 100,
      ersActive: false,
      ersCooldown: Math.random() * 2.0
    });
  }
}

function findNearestTrackSample(x, z) {
  let bestIdx = 0, bestDistSq = Infinity;
  for (let i = 0; i < TRACK_SAMPLES; i++) {
    const p = trackSamples[i].pt;
    const dSq = (x - p.x)**2 + (z - p.z)**2;
    if (dSq < bestDistSq) { bestDistSq = dSq; bestIdx = i; }
  }
  return {
    index: bestIdx,
    sample: trackSamples[bestIdx],
    dist: Math.sqrt(bestDistSq)
  };
}

function stepAiPhysics(dt) {
  const zones = (CIRCUITS[currentCircuitKey] && CIRCUITS[currentCircuitKey].drsZones) || [];
  const allRacers = [car, ...aiCars];

  aiCars.forEach((ai) => {
    const nearest = findNearestTrackSample(ai.x, ai.z);
    ai.progressT = nearest.sample.t;

    if (nearest.index > 500 && nearest.index < 620) ai.passedHalfway = true;
    if (ai.passedHalfway && ai.lastTrackIdx > 920 && nearest.index < 80) {
      ai.laps += 1;
      ai.passedHalfway = false;
    }
    ai.lastTrackIdx = nearest.index;

    const speedMs = Math.hypot(ai.vx, ai.vz);

    let maxCurveAhead = 0;
    let curveDistMeters = 0;
    const scanHorizon = 38;
    for (let k = 2; k <= scanHorizon; k++) {
      const sampleK = trackSamples[(nearest.index + k) % TRACK_SAMPLES];
      const cAbs = Math.abs(sampleK.curvature);
      if (cAbs > maxCurveAhead) {
        maxCurveAhead = cAbs;
        curveDistMeters = k * (totalTrackLength / TRACK_SAMPLES);
      }
    }

    const isStraight = maxCurveAhead < 0.012;
    const topSpeedMs = 84 * ai.paceFactor;
    const targetApexSpeedMs = Math.max(20.0 * ai.paceFactor, topSpeedMs - maxCurveAhead * 95);

    const decelRate = 13.8 * ai.paceFactor;
    const speedDiffSq = Math.max(0, speedMs * speedMs - targetApexSpeedMs * targetApexSpeedMs);
    const requiredBrakingDist = speedDiffSq / (2 * decelRate);

    if (speedMs > targetApexSpeedMs + 0.8 && curveDistMeters <= requiredBrakingDist + 3.5) {
      ai.brake = Math.min(1.0, 0.82 + (speedMs - targetApexSpeedMs) / 7.0);
      ai.throttle = 0;
    } else {
      ai.throttle = 1.0;
      ai.brake = 0;
    }

    const apexOffset = THREE.MathUtils.clamp(nearest.sample.curvature * 14.5, -6.8, 6.8);
    const cornerFactor = THREE.MathUtils.clamp(maxCurveAhead * 3.8, 0, 1.0);
    const desiredLateral = THREE.MathUtils.lerp(ai.lanePref, apexOffset, cornerFactor * 0.85);

    const lookaheadSamples = isStraight ? Math.max(24, Math.round(speedMs * 0.55)) : Math.max(11, Math.round(speedMs * 0.28));
    const targetIdx = (nearest.index + lookaheadSamples) % TRACK_SAMPLES;
    const targetPt = trackSamples[targetIdx].pt.clone().addScaledVector(trackSamples[targetIdx].right, desiredLateral);

    const dx = targetPt.x - ai.x;
    const dz = targetPt.z - ai.z;
    const desiredYaw = Math.atan2(dx, dz);
    const headingError = Math.atan2(Math.sin(desiredYaw - ai.yaw), Math.cos(desiredYaw - ai.yaw));

    const maxSteer = THREE.MathUtils.lerp(0.64, isStraight ? 0.08 : 0.24, THREE.MathUtils.clamp(speedMs / 68, 0, 1));
    const targetSteer = THREE.MathUtils.clamp(headingError * 1.5, -maxSteer, maxSteer);
    ai.steerAngle = THREE.MathUtils.lerp(ai.steerAngle, targetSteer, dt * (isStraight ? 9 : 15));

    let inDrsZone = false;
    for (let zIdx = 0; zIdx < zones.length; zIdx++) {
      const z = zones[zIdx];
      const inThis = (z.start > z.end) ? (ai.progressT >= z.start || ai.progressT <= z.end) : (ai.progressT >= z.start && ai.progressT <= z.end);
      if (inThis) { inDrsZone = true; break; }
    }

    let gapToCarAheadSec = Infinity;
    const aiFwdX = Math.sin(ai.yaw);
    const aiFwdZ = Math.cos(ai.yaw);

    allRacers.forEach(other => {
      if (other === ai) return;
      const odx = other.x - ai.x;
      const odz = other.z - ai.z;
      const fwdDot = odx * aiFwdX + odz * aiFwdZ;
      const directDist = Math.hypot(odx, odz);
      if (fwdDot > 0.5 && directDist < 120) {
        const gapSec = directDist / Math.max(speedMs, 25);
        if (gapSec < gapToCarAheadSec) gapToCarAheadSec = gapSec;
      }
    });

    if (inDrsZone && gapToCarAheadSec <= 1.000 && ai.brake < 0.05 && speedMs > 32) {
      ai.drsActive = true;
    } else {
      ai.drsActive = false;
    }

    if (ai.brake > 0.08) {
      ai.ersBattery = Math.min(100, (ai.ersBattery || 100) + ai.brake * 36 * dt);
    }
    ai.ersCooldown = (ai.ersCooldown || 0) - dt;
    const wantErs = (ai.throttle > 0.8 && (ai.ersBattery || 100) > 8) &&
      ((ai.drsActive) || (gapToCarAheadSec <= 1.2) || (speedMs > 30 && speedMs < 68 && ai.ersCooldown <= 0));

    if (wantErs && (ai.ersBattery || 100) > 0.5) {
      ai.ersActive = true;
      ai.ersBattery = Math.max(0, ai.ersBattery - 18 * dt);
      if (ai.ersBattery <= 8) ai.ersCooldown = 5.0 + Math.random() * 3.0;
    } else {
      ai.ersActive = false;
    }

    const sinY = Math.sin(ai.yaw);
    const cosY = Math.cos(ai.yaw);
    const vLong = ai.vx * sinY + ai.vz * cosY;
    const vLat  = ai.vx * cosY - ai.vz * sinY;

    const drsDragMult = ai.drsActive ? 0.45 : 1.0;
    const drsBoost = (ai.drsActive && speedMs > 36) ? 1700 : 0;
    const ersBoost = ai.ersActive ? 3900 : 0;

    const driveForce = (ai.throttle * 13200 + drsBoost + ersBoost) * ai.paceFactor;
    const brakeForce = ai.brake * 23000;
    const dragForce  = 0.44 * drsDragMult * vLong * Math.abs(vLong);

    const denom = Math.max(Math.abs(vLong), 2.5);
    const slipF = Math.atan2(vLat + 1.36 * ai.yawRate, denom) - ai.steerAngle;
    const slipR = Math.atan2(vLat - 1.44 * ai.yawRate, denom);

    const cornerStiff = 20000 * ai.paceFactor;
    const fLatF = -Math.sin(1.3 * Math.atan(8.8 * slipF)) * cornerStiff;
    const fLatR = -Math.sin(1.3 * Math.atan(9.0 * slipR)) * cornerStiff * 1.15;

    const brakeVecLong = speedMs > 0.3 ? -(vLong / speedMs) * brakeForce : 0;
    const brakeVecLat  = speedMs > 0.3 ? -(vLat  / speedMs) * brakeForce * 1.2 : 0;

    const totalLongF = driveForce + brakeVecLong - dragForce - vLong * 20;
    const totalLatF  = fLatF * Math.cos(ai.steerAngle) + fLatR + brakeVecLat;

    const kinematicYawRate = (vLong / 2.75) * Math.tan(ai.steerAngle);
    const dynamicYawAccel  = (1.36 * fLatF - 1.44 * fLatR - ai.yawRate * 2700) / 2150;
    const blend = THREE.MathUtils.clamp(speedMs / 14, 0, 1);
    ai.yawRate = THREE.MathUtils.lerp(kinematicYawRate, ai.yawRate + dynamicYawAccel * dt, blend);

    const axW = (totalLongF * sinY + totalLatF * cosY) / 1250;
    const azW = (totalLongF * cosY - totalLatF * sinY) / 1250;

    ai.vx += axW * dt;
    ai.vz += azW * dt;
    ai.x  += ai.vx * dt;
    ai.z  += ai.vz * dt;
    ai.yaw += ai.yawRate * dt;

    const wallCheck = findNearestTrackSample(ai.x, ai.z).sample;
    const wallRel = new THREE.Vector3(ai.x - wallCheck.pt.x, 0, ai.z - wallCheck.pt.z);
    const latWall = wallRel.dot(wallCheck.right);
    const maxBarrier = WALL_OFFSET - 1.5;

    if (Math.abs(latWall) > maxBarrier) {
      const safe = wallCheck.pt.clone().addScaledVector(wallCheck.right, Math.sign(latWall) * maxBarrier);
      ai.x = safe.x;
      ai.z = safe.z;
      const trackYaw = Math.atan2(wallCheck.tan.x, wallCheck.tan.z);
      ai.yaw = THREE.MathUtils.lerp(ai.yaw, trackYaw, 0.25);
      ai.vx *= 0.88;
      ai.vz *= 0.88;
    }

    ai.wheelRot += (vLong / 0.35) * dt;
    ai.visual.root.position.set(ai.x, wallCheck.pt.y, ai.z);
    ai.visual.root.rotation.y = ai.yaw;
    ai.visual.brakeLightMat.color.setHex(ai.brake > 0.05 ? 0xff1122 : 0x440000);

    if (ai.visual.rearWingFlap) {
      const targetFlap = ai.drsActive ? 0.02 : 0.24;
      ai.visual.rearWingFlap.rotation.x = THREE.MathUtils.lerp(ai.visual.rearWingFlap.rotation.x, targetFlap, dt * 14);
    }

    ai.visual.wheels.forEach((w, idx) => {
      if (idx < 2) w.steerPivot.rotation.y = ai.steerAngle;
      w.rollMesh.rotation.x = ai.wheelRot;
    });
  });

  const allCars = [car, ...aiCars];
  for (let i = 0; i < allCars.length; i++) {
    for (let j = i + 1; j < allCars.length; j++) {
      const A = allCars[i];
      const B = allCars[j];
      const dx = A.x - B.x;
      const dz = A.z - B.z;
      const dist = Math.hypot(dx, dz);
      const minDist = 2.65;
      if (dist < minDist && dist > 0.01) {
        const nx = dx / dist;
        const nz = dz / dist;
        const overlap = (minDist - dist) * 0.5;
        A.x += nx * overlap;
        A.z += nz * overlap;
        B.x -= nx * overlap;
        B.z -= nz * overlap;

        const rvx = A.vx - B.vx;
        const rvz = A.vz - B.vz;
        const sepVel = rvx * nx + rvz * nz;
        if (sepVel < 0) {
          const impulse = -sepVel * 0.65;
          A.vx += nx * impulse;
          A.vz += nz * impulse;
          B.vx -= nx * impulse;
          B.vz -= nz * impulse;
        }
      }
    }
  }
}

// --- 6. PLAYER STATE WITH REAL MOMENTUM DRS ---
const car = {
  x: 0, y: 0, z: -300, yaw: 0, vx: 0, vz: 0, yawRate: 0,
  mass: 1250, inertia: 2150, wheelbase: 2.75, cgFront: 1.34, cgRear: 1.41, cgHeight: 0.36, trackWidth: 1.96,
  gear: 1, rpm: 1200, idleRpm: 1200, redlineRpm: 8600,
  throttle: 0, brake: 0, handbrake: 0, steerAngle: 0,
  drsAvailable: false, drsActive: false,
  drsGapSec: null, drsCarAhead: null,
  ersBattery: 100, ersActive: false, ersDeployRate: 20, ersHarvestRate: 35,
  compound: 'soft', steerLockScale: 1.0, trailBrakeAssist: 0.85, wingLevel: 8, suspStiffness: 100,
  downforceN: 0, wheelSpinRot: 0,
  damageHealth: 100,
  engineAlive: true,
  engineStalled: false,
  smokeCooldown: 0,
  frontCrumple: 0,
  wingCrumple: 0,
  tires: [{ temp: 82, slip: 0 }, { temp: 82, slip: 0 }, { temp: 84, slip: 0 }, { temp: 84, slip: 0 }],
  laps: 1, progressT: 0, lapStartTime: performance.now(),
  bestLapMs: null, lastLapMs: null, passedHalfway: false, lastTrackIdx: 0
};

const keys = {};
const touchState = { gas: 0, brake: 0, left: 0, right: 0, handbrake: 0 };
let cameraMode = 0;

function bindTouch(btnId, stateProp) {
  const el = document.getElementById(btnId);
  if (!el) return;
  const onDown = (e) => { e.preventDefault(); touchState[stateProp] = 1; };
  const onUp = (e) => { e.preventDefault(); touchState[stateProp] = 0; };
  el.addEventListener('touchstart', onDown, { passive: false });
  el.addEventListener('touchend', onUp, { passive: false });
  el.addEventListener('touchcancel', onUp, { passive: false });
  el.addEventListener('mousedown', onDown);
  el.addEventListener('mouseup', onUp);
  el.addEventListener('mouseleave', onUp);
}
bindTouch('touchGas', 'gas');
bindTouch('touchBrake', 'brake');
bindTouch('touchLeft', 'left');
bindTouch('touchRight', 'right');
bindTouch('touchHandbrake', 'handbrake');

const touchDrsBtn = document.getElementById('touchDrs');
if (touchDrsBtn) {
  touchDrsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (car.drsAvailable && car.brake < 0.05) car.drsActive = !car.drsActive;
  });
}
const touchErsBtn = document.getElementById('touchErs');
if (touchErsBtn) {
  touchErsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (car.ersBattery > 2) car.ersActive = !car.ersActive;
  });
}

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Escape') toggleMainMenu();
  if (isMenuOpen || isRaceFinished) return;
  if (e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    if (car.drsAvailable && car.brake < 0.05) car.drsActive = !car.drsActive;
  }
  if (e.code === 'KeyB' || e.code === 'KeyE') {
    if (car.ersBattery > 2) car.ersActive = !car.ersActive;
  }
  if (e.code === 'KeyC') cycleCamera();
  if (e.code === 'KeyR') resetCarToTrack();
  if (e.code === 'KeyL') toggleRacingLine();
  if (e.code === 'Tab') {
    e.preventDefault();
    document.getElementById('garageModal').classList.toggle('hidden');
  }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Audio Engine
let audioCtx = null, engineOsc = null, engineGain = null, audioEnabled = false;
function initAudioIfAllowed() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      engineOsc = audioCtx.createOscillator();
      engineGain = audioCtx.createGain();
      engineOsc.type = 'sawtooth';
      engineOsc.connect(engineGain);
      engineGain.connect(audioCtx.destination);
      engineGain.gain.value = 0.08;
      engineOsc.start();
      audioEnabled = true;
      const btn = document.getElementById('audioBtn');
      if (btn) btn.textContent = '🔊 Sound: ON';
    } catch (e) {
      console.warn('AudioContext not allowed yet:', e);
    }
  }
}

function toggleAudio() {
  if (!audioCtx) {
    initAudioIfAllowed();
  } else {
    audioEnabled = !audioEnabled;
    if (engineGain) engineGain.gain.value = audioEnabled ? 0.08 : 0.0;
    document.getElementById('audioBtn').textContent = `🔊 Sound: ${audioEnabled ? 'ON' : 'OFF'}`;
  }
}
document.getElementById('audioBtn').addEventListener('click', toggleAudio);

function playCrashSound(intensity) {
  if (!audioCtx || !audioEnabled) return;
  try {
    const osc = audioCtx.createOscillator();
    const noise = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, audioCtx.currentTime + 0.35);
    noise.gain.setValueAtTime(Math.min(0.35, 0.12 + intensity * 0.2), audioCtx.currentTime);
    noise.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38);
    osc.connect(noise);
    noise.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
}

let drsZoneEligibleFlags = {};

function evaluateDrsEligibility(carT, speedMs) {
  const zones = CIRCUITS[currentCircuitKey].drsZones || [];
  let currentActiveZone = null;
  let currentActiveZoneIdx = -1;

  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    const inThis = (z.start > z.end) ? (carT >= z.start || carT <= z.end) : (carT >= z.start && carT <= z.end);
    if (inThis) {
      currentActiveZone = z;
      currentActiveZoneIdx = i;
      break;
    }
  }

  let minGapAheadSec = Infinity;
  let nearestAheadDist = Infinity;
  let carAheadRef = null;

  const playerHeading = car.yaw;
  const playerForwardX = Math.sin(playerHeading);
  const playerForwardZ = Math.cos(playerHeading);

  aiCars.forEach(ai => {
    let tDelta = ai.progressT - carT;
    if (tDelta < -0.5) tDelta += 1.0;
    else if (tDelta > 0.5) tDelta -= 1.0;

    const dx = ai.x - car.x;
    const dz = ai.z - car.z;
    const forwardProjection = dx * playerForwardX + dz * playerForwardZ;
    const directDist = Math.hypot(dx, dz);

    const isAhead = (forwardProjection > 0.3) && (tDelta > -0.04 && tDelta < 0.45 || (directDist < 90 && forwardProjection > 0.5));

    if (isAhead) {
      let distMeters = directDist;
      if (tDelta > 0 && tDelta < 0.35) {
        distMeters = Math.min(directDist, tDelta * totalTrackLength);
      }

      const referenceSpeed = Math.max(speedMs, 25);
      const gapSec = distMeters / referenceSpeed;

      if (distMeters < nearestAheadDist) {
        nearestAheadDist = distMeters;
        minGapAheadSec = gapSec;
        carAheadRef = ai;
      }
    }
  });

  if (minGapAheadSec !== Infinity) {
    car.drsGapSec = minGapAheadSec;
    car.drsCarAhead = carAheadRef;
  } else {
    car.drsGapSec = null;
    car.drsCarAhead = null;
  }

  zones.forEach((z, i) => {
    const detectPoint = z.detect !== undefined ? z.detect : ((z.start - 0.04 + 1.0) % 1.0);
    let distToDetect = carT - detectPoint;
    if (distToDetect < 0) distToDetect += 1.0;

    if (distToDetect < 0.04) {
      if (minGapAheadSec <= 1.000) {
        drsZoneEligibleFlags[i] = true;
      }
    }
  });

  let isEligible = false;
  if (currentActiveZone) {
    const qualifiedAtDetection = !!drsZoneEligibleFlags[currentActiveZoneIdx];
    const qualifiedCurrentlyClose = (minGapAheadSec !== Infinity && minGapAheadSec <= 1.000);

    if (qualifiedAtDetection || qualifiedCurrentlyClose) {
      isEligible = true;
      drsZoneEligibleFlags[currentActiveZoneIdx] = true;
    }
  } else {
    drsZoneEligibleFlags = {};
  }

  return {
    inZone: !!currentActiveZone,
    eligible: isEligible
  };
}

function triggerChequeredFlag() {
  if (isRaceFinished) return;
  isRaceFinished = true;

  const totalMs = performance.now() - raceStartTime;
  const tm = Math.floor(totalMs / 60000);
  const ts = Math.floor((totalMs % 60000) / 1000);
  const tmil = Math.floor(totalMs % 1000);
  const totalStr = `${String(tm).padStart(2, '0')}:${String(ts).padStart(2, '0')}.${String(tmil).padStart(3, '0')}`;

  const pScore = car.laps + car.progressT;
  let finalPos = 1;
  aiCars.forEach(ai => { if ((ai.laps + ai.progressT) > pScore) finalPos++; });

  const modal = document.getElementById('chequeredModal');
  const title = document.getElementById('finishTitle');
  const sub = document.getElementById('finishSubtitle');
  const posEl = document.getElementById('finishPosition');
  const timeEl = document.getElementById('finishTotalTime');
  const bestEl = document.getElementById('finishBestLap');

  if (finalPos === 1) {
    title.textContent = '🏆 WINNER — P1!';
    title.className = 'text-3xl sm:text-4xl font-black text-amber-400 tracking-tight mb-1';
    sub.textContent = 'CHEQUERED FLAG VICTORY!';
  } else if (finalPos <= 3) {
    title.textContent = `PODIUM FINISH — P${finalPos}!`;
    title.className = 'text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mb-1';
    sub.textContent = 'GREAT RACE DRIVE!';
  } else {
    title.textContent = `RACE FINISHED — P${finalPos}`;
    title.className = 'text-3xl sm:text-4xl font-black text-slate-300 tracking-tight mb-1';
    sub.textContent = 'CHECKERED FLAG!';
  }

  posEl.textContent = `P${finalPos} / ${aiCars.length + 1}`;
  timeEl.textContent = totalStr;

  let bestLapFormatted = totalStr;
  if (car.bestLapMs) {
    const bm = Math.floor(car.bestLapMs / 60000);
    const bs = Math.floor((car.bestLapMs % 60000) / 1000);
    const bmil = Math.floor(car.bestLapMs % 1000);
    bestLapFormatted = `${String(bm).padStart(2, '0')}:${String(bs).padStart(2, '0')}.${String(bmil).padStart(3, '0')}`;
  }
  bestEl.textContent = bestLapFormatted;

  modal.classList.remove('hidden');

  if (typeof sendDiscordMatchReport === 'function') {
    sendDiscordMatchReport({
      gameName: 'Imti Corsa GT: Pro Simulator',
      gameIcon: '🏎️',
      color: finalPos === 1 ? 0xf59e0b : 0x38bdf8,
      winner: finalPos === 1 ? 'Player 1 (P1 Champion)' : `AI Winner (Player Finished P${finalPos})`,
      summary: `Grand Prix at **${CIRCUITS[currentCircuitKey].name}** completed! Total Time: **${totalStr}** • Best Lap: **${bestLapFormatted}**`,
      fields: [
        { name: '🏁 Position', value: `P${finalPos} / ${aiCars.length + 1}`, inline: true },
        { name: '⏱️ Total Time', value: totalStr, inline: true },
        { name: '⚡ Best Lap', value: bestLapFormatted, inline: true },
        { name: '🏎️ Circuit', value: CIRCUITS[currentCircuitKey].name, inline: true }
      ]
    });
  }
}

function stepPlayerPhysics(dt) {
  const wantThrottle = (keys['KeyW'] || keys['ArrowUp'] || touchState.gas) ? 1 : 0;
  const wantBrake    = (keys['KeyS'] || keys['ArrowDown'] || touchState.brake) ? 1 : 0;
  const wantHB       = (keys['Space'] || touchState.handbrake) ? 1 : 0;

  let steerInput = 0;
  if (keys['KeyA'] || keys['ArrowLeft'] || touchState.left) steerInput += 1;
  if (keys['KeyD'] || keys['ArrowRight'] || touchState.right) steerInput -= 1;

  const trailModulation = 1.0 - (Math.abs(steerInput) * 0.42 * car.trailBrakeAssist);
  const targetBrake = wantBrake * trailModulation;

  car.throttle = THREE.MathUtils.lerp(car.throttle, wantThrottle, dt * 14);
  car.brake    = THREE.MathUtils.lerp(car.brake, targetBrake, dt * 16);
  car.handbrake = wantHB;

  const speedMs = Math.hypot(car.vx, car.vz);
  const sinY = Math.sin(car.yaw);
  const cosY = Math.cos(car.yaw);

  const vLong = car.vx * sinY + car.vz * cosY;
  const vLat  = car.vx * cosY - car.vz * sinY;

  const nearest = findNearestTrackSample(car.x, car.z);
  car.progressT = nearest.sample.t;
  
  const drsCheck = evaluateDrsEligibility(car.progressT, speedMs);
  car.drsAvailable = drsCheck.eligible;
  if (!car.drsAvailable || wantBrake > 0.05) car.drsActive = false;

  if (car.brake > 0.08) {
    const harvestAmount = car.brake * (speedMs / 45) * car.ersHarvestRate * dt;
    car.ersBattery = Math.min(100, car.ersBattery + harvestAmount);
  }
  if (car.ersActive) {
    if (car.throttle > 0.1 && car.ersBattery > 0.5) {
      car.ersBattery = Math.max(0, car.ersBattery - car.ersDeployRate * dt);
    } else if (car.ersBattery <= 0.5) {
      car.ersActive = false;
    }
  }

  const maxSteerRad = THREE.MathUtils.lerp(0.66, 0.22, THREE.MathUtils.clamp(speedMs / 65, 0, 1)) * car.steerLockScale;
  car.steerAngle = THREE.MathUtils.lerp(car.steerAngle, steerInput * maxSteerRad, dt * 14);

  const drsDragMultiplier = car.drsActive ? 0.45 : 1.0;
  const drsDownforceMultiplier = car.drsActive ? 0.65 : 1.0;
  const aeroBase = (1.85 + car.wingLevel * 0.32) * drsDownforceMultiplier;
  car.downforceN = 0.5 * 1.225 * aeroBase * speedMs * speedMs;

  const dragForce = 0.5 * 1.225 * (0.68 + car.wingLevel * 0.04) * drsDragMultiplier * vLong * Math.abs(vLong);
  const drsMomentumPush = (car.drsActive && speedMs > 38 && car.throttle > 0.8) ? 1800 : 0;

  if (!car.engineAlive) {
    car.rpm = THREE.MathUtils.lerp(car.rpm, 0, dt * 6);
    car.gear = 0;
  } else {
    const rpmTarget = 1200 + (speedMs / 70) * 7200 + car.throttle * 500;
    car.rpm = THREE.MathUtils.clamp(rpmTarget, car.idleRpm, car.redlineRpm);
    car.gear = speedMs < 12 ? 1 : speedMs < 24 ? 2 : speedMs < 38 ? 3 : speedMs < 52 ? 4 : speedMs < 66 ? 5 : 6;
  }

  const powerFactor = car.engineAlive ? (0.35 + 0.65 * (car.damageHealth / 100)) : 0;
  const ersPush = (car.ersActive && car.throttle > 0.1 && car.ersBattery > 0) ? 4200 : 0;
  const driveForce = (car.throttle * 12800 + drsMomentumPush + ersPush) * powerFactor;
  const brakeForce = car.brake * 22000;

  const denom = Math.max(Math.abs(vLong), 2.5);
  const slipAngleF = Math.atan2(vLat + car.cgFront * car.yawRate, denom) - car.steerAngle;
  const slipAngleR = Math.atan2(vLat - car.cgRear  * car.yawRate, denom);

  const fLatF = -Math.sin(1.3 * Math.atan(9.5 * slipAngleF)) * 17500;
  const fLatR = -Math.sin(1.3 * Math.atan(9.8 * slipAngleR)) * 18500 * (car.handbrake ? 0.35 : 1.1);

  const brakeVecLong = speedMs > 0.3 ? -(vLong / speedMs) * brakeForce : 0;
  const brakeVecLat  = speedMs > 0.3 ? -(vLat  / speedMs) * brakeForce * 1.3 : 0;

  const totalLongForce = driveForce + brakeVecLong - dragForce - vLong * 20;
  const totalLatForce  = fLatF * Math.cos(car.steerAngle) + fLatR + brakeVecLat;

  const ackermannYawRate = (vLong / car.wheelbase) * Math.tan(car.steerAngle);
  const dynamicYawAccel  = (car.cgFront * fLatF - car.cgRear * fLatR - car.yawRate * 2600) / car.inertia;
  const speedBlend = THREE.MathUtils.clamp((speedMs - 3.0) / 14.0, 0, 1);
  car.yawRate = THREE.MathUtils.lerp(ackermannYawRate, car.yawRate + dynamicYawAccel * dt, speedBlend);

  const axWorld = (totalLongForce * sinY + totalLatForce * cosY) / car.mass;
  const azWorld = (totalLongForce * cosY - totalLatForce * sinY) / car.mass;

  car.vx += axWorld * dt;
  car.vz += azWorld * dt;

  if (speedMs > 0.2 && speedMs < 14.0 && !car.handbrake) {
    const align = (1.0 - speedMs / 14.0) * 10.0 * dt;
    const forwardSign = vLong >= -0.1 ? 1 : -1;
    car.vx = THREE.MathUtils.lerp(car.vx, Math.sin(car.yaw) * speedMs * forwardSign, align);
    car.vz = THREE.MathUtils.lerp(car.vz, Math.cos(car.yaw) * speedMs * forwardSign, align);
  }

  car.x += car.vx * dt;
  car.z += car.vz * dt;
  car.yaw += car.yawRate * dt;
  car.y = THREE.MathUtils.lerp(car.y || 0, nearest.sample.pt.y, dt * 18);

  const rel = new THREE.Vector3(car.x - nearest.sample.pt.x, 0, car.z - nearest.sample.pt.z);
  const latOff = rel.dot(nearest.sample.right);
  const maxWall = WALL_OFFSET - 1.4;

  const isOffTrack = Math.abs(latOff) > (TRACK_HALF_WIDTH + KERB_WIDTH + 0.3);
  if (isOffTrack && Math.abs(latOff) <= maxWall) {
    const gravelBrake = Math.min(1.0, (Math.abs(latOff) - (TRACK_HALF_WIDTH + KERB_WIDTH)) / 2.5);
    car.vx *= Math.max(0.85, 1.0 - gravelBrake * 3.5 * dt);
    car.vz *= Math.max(0.85, 1.0 - gravelBrake * 3.5 * dt);
    if (speedMs > 10 && Math.random() < 0.25) {
      spawnDamageSmoke(car.x, 0.2, car.z, false);
    }
  }

  if (Math.abs(latOff) > maxWall) {
    const safe = nearest.sample.pt.clone().addScaledVector(nearest.sample.right, Math.sign(latOff) * (maxWall - 0.1));
    car.x = safe.x;
    car.z = safe.z;
    const norm = nearest.sample.right.clone().multiplyScalar(Math.sign(latOff));
    const vVec = new THREE.Vector3(car.vx, 0, car.vz);
    const outSpd = vVec.dot(norm);

    if (outSpd > 0) {
      const normalImpactKmh = Math.abs(outSpd) * 3.6;
      const totalSpeedKmh = Math.hypot(car.vx, car.vz) * 3.6;

      if (normalImpactKmh > 36) {
        const damageLoss = Math.min(65, normalImpactKmh * 0.75);
        car.damageHealth = Math.max(0, car.damageHealth - damageLoss);

        playCrashSound(Math.min(1.0, normalImpactKmh / 90));

        const flashEl = document.getElementById('crashOverlay');
        if (flashEl) {
          flashEl.className = 'pointer-events-none fixed inset-0 bg-red-600/35 z-40 transition-colors duration-150';
          setTimeout(() => {
            flashEl.className = 'pointer-events-none fixed inset-0 bg-red-600/0 z-40 transition-colors duration-300';
          }, 120);
        }

        document.body.classList.remove('shake-impact');
        void document.body.offsetWidth;
        document.body.classList.add('shake-impact');

        car.frontCrumple = Math.min(0.40, car.frontCrumple + 0.12);
        car.wingCrumple  = Math.min(0.30, car.wingCrumple + 0.08);

        for (let s = 0; s < 4; s++) {
          spawnDamageSmoke(car.x, 0.4, car.z, car.damageHealth <= 0);
        }

        if (car.damageHealth <= 0 || (normalImpactKmh > 65 && Math.random() < 0.90)) {
          car.engineAlive = false;
          car.engineStalled = true;
          car.damageHealth = 0;
          const banner = document.getElementById('engineStallBanner');
          if (banner) banner.classList.remove('hidden');

          if (engineGain && audioEnabled && audioCtx) {
            engineGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
          }
        }
      } else if (totalSpeedKmh > 20) {
        car.damageHealth = Math.max(5, car.damageHealth - 1.2 * dt * 30);
        playCrashSound(0.08);
        if (Math.random() < 0.35) {
          spawnDamageSmoke(car.x, 0.3, car.z, false);
        }
      }

      vVec.addScaledVector(norm, -outSpd * 1.15);
      car.vx = vVec.x * 0.88;
      car.vz = vVec.z * 0.88;
    }
  }

  if (nearest.index > 500 && nearest.index < 620) car.passedHalfway = true;
  if (car.passedHalfway && car.lastTrackIdx > 920 && nearest.index < 80) {
    const lapTime = performance.now() - car.lapStartTime;
    car.lastLapMs = lapTime;
    if (!car.bestLapMs || lapTime < car.bestLapMs) car.bestLapMs = lapTime;
    car.lapStartTime = performance.now();
    car.passedHalfway = false;
    car.laps += 1;

    if (car.laps > targetRaceLaps) {
      triggerChequeredFlag();
    } else {
      document.getElementById('lapCountDisplay').textContent = `${car.laps} / ${targetRaceLaps}`;
    }
  }
  car.lastTrackIdx = nearest.index;

  const slipMagF = Math.min(1, Math.abs(slipAngleF) * 2.8 + (car.brake * 0.35));
  const slipMagR = Math.min(1, Math.abs(slipAngleR) * 2.8 + (car.handbrake * 0.7));
  car.tires[0].slip = slipMagF; car.tires[1].slip = slipMagF;
  car.tires[2].slip = slipMagR; car.tires[3].slip = slipMagR;

  if (audioEnabled && audioCtx) {
    engineOsc.frequency.setTargetAtTime(45 + (car.rpm / 8600) * 190, audioCtx.currentTime, 0.03);
  }
}

// --- 7. RENDERING, MINIMAP & HUD UPDATES ---
const gCanvas = document.getElementById('gForceCanvas');
const gCtx = gCanvas ? gCanvas.getContext('2d') : null;
const mapCanvas = document.getElementById('minimapCanvas');
const mapCtx = mapCanvas.getContext('2d');

function drawMinimap() {
  mapCtx.clearRect(0, 0, 105, 88);
  const spanX = Math.max(1, maxX - minX);
  const spanZ = Math.max(1, maxZ - minZ);
  const scale = Math.min(92 / spanX, 76 / spanZ);
  const ox = (105 - spanX * scale) * 0.5;
  const oz = (88  - spanZ * scale) * 0.5;

  mapCtx.strokeStyle = '#475569';
  mapCtx.lineWidth = 2.2;
  mapCtx.beginPath();
  for (let i = 0; i < TRACK_SAMPLES; i += 10) {
    const p = trackSamples[i].pt;
    const mx = ox + (p.x - minX) * scale;
    const my = oz + (p.z - minZ) * scale;
    if (i === 0) mapCtx.moveTo(mx, my); else mapCtx.lineTo(mx, my);
  }
  mapCtx.closePath();
  mapCtx.stroke();

  mapCtx.fillStyle = '#38bdf8';
  aiCars.forEach(ai => {
    mapCtx.beginPath();
    mapCtx.arc(ox + (ai.x - minX) * scale, oz + (ai.z - minZ) * scale, 2.5, 0, Math.PI * 2);
    mapCtx.fill();
  });

  mapCtx.fillStyle = '#f59e0b';
  mapCtx.beginPath();
  mapCtx.arc(ox + (car.x - minX) * scale, oz + (car.z - minZ) * scale, 3.5, 0, Math.PI * 2);
  mapCtx.fill();
}

function updateVisualsAndHUD(dt) {
  playerVisual.root.position.set(car.x, car.y || 0, car.z);
  playerVisual.root.rotation.y = car.yaw;
  playerVisual.brakeLightMat.color.setHex(car.brake > 0.05 ? 0xff1122 : 0x440000);

  const targetFlapAngle = car.drsActive ? 0.02 : 0.24;
  playerVisual.rearWingFlap.rotation.x = THREE.MathUtils.lerp(playerVisual.rearWingFlap.rotation.x, targetFlapAngle, dt * 14);

  const thrEl = document.getElementById('throttleBar');
  const brkEl = document.getElementById('brakeBar');
  const hbEl = document.getElementById('hbBar');
  if (thrEl) thrEl.style.height = `${Math.min(100, Math.round(car.throttle * 100))}%`;
  if (brkEl) brkEl.style.height = `${Math.min(100, Math.round(car.brake * 100))}%`;
  if (hbEl) hbEl.style.height = car.handbrake ? '100%' : '0%';

  playerVisual.mainHull.position.z = -car.frontCrumple * 0.4;
  playerVisual.splitter.position.z = 2.22 - car.frontCrumple * 0.6;

  if (car.damageHealth < 60 || !car.engineAlive) {
    car.smokeCooldown = (car.smokeCooldown || 0) + dt;
    const interval = !car.engineAlive ? 0.05 : car.damageHealth < 30 ? 0.08 : 0.18;
    if (car.smokeCooldown > interval) {
      car.smokeCooldown = 0;
      spawnDamageSmoke(car.x, (car.y || 0) + 0.5, car.z, !car.engineAlive);
    }
  }

  const vLong = car.vx * Math.sin(car.yaw) + car.vz * Math.cos(car.yaw);
  car.wheelSpinRot += (vLong / 0.35) * dt;
  playerVisual.wheels.forEach((w, idx) => {
    if (idx < 2) w.steerPivot.rotation.y = car.steerAngle;
    w.rollMesh.rotation.x = car.wheelSpinRot;
  });

  const forward = new THREE.Vector3(Math.sin(car.yaw), 0, Math.cos(car.yaw));
  const targetFOV = car.drsActive ? 68 : 60;
  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, dt * 6);
  camera.updateProjectionMatrix();

  const cy = car.y || 0;
  if (cameraMode === 0) {
    const targetCam = new THREE.Vector3(car.x, cy + 2.6, car.z).addScaledVector(forward, -6.5);
    camera.position.lerp(targetCam, dt * 12);
    camera.lookAt(new THREE.Vector3(car.x, cy + 0.9, car.z).addScaledVector(forward, 6.0));
  } else {
    camera.position.copy(new THREE.Vector3(car.x, cy + 1.15, car.z).addScaledVector(forward, 0.4));
    camera.lookAt(new THREE.Vector3(car.x, cy + 0.95, car.z).addScaledVector(forward, 16.0));
  }

  const drsBadge = document.getElementById('drsBadge');
  const drsGapText = document.getElementById('drsGapText');
  const aeroText = document.getElementById('aeroDragText');

  if (car.drsGapSec !== null && car.drsGapSec !== Infinity) {
    const gapDisplay = car.drsGapSec.toFixed(3);
    if (car.drsGapSec <= 1.000) {
      drsGapText.textContent = '+' + gapDisplay + 's (<=1.0s OK)';
      drsGapText.className = 'font-bold text-emerald-400';
    } else {
      drsGapText.textContent = '+' + gapDisplay + 's (>1.0s NO DRS)';
      drsGapText.className = 'font-bold text-rose-400';
    }
  } else {
    drsGapText.textContent = 'NO CAR IN 1.0s WINDOW';
    drsGapText.className = 'font-bold text-slate-500';
  }

  if (car.drsActive) {
    drsBadge.textContent = '⚡ DRS OPEN (-55% DRAG)';
    drsBadge.className = 'text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 animate-pulse';
    aeroText.textContent = '⚡ DRS + MOMENTUM SURGE';
    aeroText.className = 'text-[9px] font-bold text-emerald-400 mt-0.5 animate-pulse';
  } else if (car.drsAvailable) {
    drsBadge.textContent = '🟢 DRS ENABLED (<1.0s GAP)';
    drsBadge.className = 'text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse';
    aeroText.textContent = 'DRS ZONE ELIGIBLE';
    aeroText.className = 'text-[9px] text-emerald-300 mt-0.5';
  } else {
    const inZoneAny = CIRCUITS[currentCircuitKey].drsZones.some(z => (z.start > z.end) ? (car.progressT >= z.start || car.progressT <= z.end) : (car.progressT >= z.start && car.progressT <= z.end));
    if (inZoneAny) {
      drsBadge.textContent = 'DRS DENIED (>1.0s GAP)';
      drsBadge.className = 'text-[10px] font-mono font-black px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60';
    } else {
      drsBadge.textContent = 'DRS LOCKED';
      drsBadge.className = 'text-[10px] font-mono font-black px-2 py-0.5 rounded bg-slate-800 text-slate-500';
    }
    aeroText.textContent = car.ersActive ? '⚡ ERS HYBRID ACTIVE' : 'AERO: FULL WING';
    aeroText.className = car.ersActive ? 'text-[9px] font-bold text-cyan-300 animate-pulse mt-0.5' : 'text-[9px] text-slate-400 mt-0.5';
  }

  const ersFill = document.getElementById('ersBatteryFill');
  const ersStatus = document.getElementById('ersStatusText');
  const ersMode = document.getElementById('ersModeText');
  if (ersFill && ersStatus) {
    ersFill.style.width = Math.floor(car.ersBattery) + '%';
    if (car.ersActive) {
      ersStatus.textContent = Math.floor(car.ersBattery) + '% DEPLOYING';
      ersStatus.className = 'text-cyan-300 font-black animate-pulse';
      ersMode.textContent = '⚡ BOOST ENGAGED (+160 BHP)';
      ersMode.className = 'text-cyan-300 font-bold';
    } else if (car.brake > 0.08) {
      ersStatus.textContent = Math.floor(car.ersBattery) + '% RECHARGING';
      ersStatus.className = 'text-emerald-400 font-bold';
      ersMode.textContent = '🔋 HARVESTING BRAKE KINETIC';
      ersMode.className = 'text-emerald-400 font-bold';
    } else {
      ersStatus.textContent = Math.floor(car.ersBattery) + '% READY';
      ersStatus.className = car.ersBattery > 20 ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold';
      ersMode.textContent = 'READY (PRESS B / E)';
      ersMode.className = 'text-slate-400';
    }
  }

  const speedKmh = Math.round(Math.hypot(car.vx, car.vz) * 3.6);
  document.getElementById('speedDisplay').textContent = speedKmh;
  document.getElementById('gearDisplay').textContent = car.engineAlive ? car.gear : 'OFF';
  document.getElementById('rpmText').textContent = car.engineAlive ? `${Math.round(car.rpm)} RPM` : 'ENGINE STALLED';
  document.getElementById('rpmBar').style.width = car.engineAlive ? `${(car.rpm / car.redlineRpm) * 100}%` : '0%';

  const damageFill = document.getElementById('damageHealthFill');
  const damageStatus = document.getElementById('carDamageStatus');
  if (damageFill && damageStatus) {
    damageFill.style.width = `${car.damageHealth}%`;
    if (!car.engineAlive) {
      damageStatus.textContent = '0% • ENGINE DEAD';
      damageStatus.className = 'text-rose-500 font-black animate-pulse';
      damageFill.className = 'h-full bg-rose-600';
    } else if (car.damageHealth < 40) {
      damageStatus.textContent = `${Math.round(car.damageHealth)}% • CRITICAL`;
      damageStatus.className = 'text-rose-400 font-bold';
      damageFill.className = 'h-full bg-rose-500';
    } else if (car.damageHealth < 75) {
      damageStatus.textContent = `${Math.round(car.damageHealth)}% • DAMAGED`;
      damageStatus.className = 'text-amber-400 font-bold';
      damageFill.className = 'h-full bg-amber-400';
    } else {
      damageStatus.textContent = `${Math.round(car.damageHealth)}% HEALTH`;
      damageStatus.className = 'text-emerald-400 font-bold';
      damageFill.className = 'h-full bg-emerald-400';
    }
  }

  const curMs = performance.now() - car.lapStartTime;
  const m = Math.floor(curMs / 60000);
  const s = Math.floor((curMs % 60000) / 1000);
  const mil = Math.floor(curMs % 1000);
  document.getElementById('currentLapTime').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(mil).padStart(3, '0')}`;
  if (car.bestLapMs) {
    const bm = Math.floor(car.bestLapMs / 60000);
    const bs = Math.floor((car.bestLapMs % 60000) / 1000);
    const bmil = Math.floor(car.bestLapMs % 1000);
    const el = document.getElementById('bestLapTime');
    if (el) el.textContent = `${String(bm).padStart(2, '0')}:${String(bs).padStart(2, '0')}.${String(bmil).padStart(3, '0')}`;
  }

  const pScore = car.laps + car.progressT;
  let pos = 1;
  aiCars.forEach(ai => { if ((ai.laps + ai.progressT) > pScore) pos++; });
  document.getElementById('racePosDisplay').textContent = `P${pos}/${aiCars.length + 1}`;

  const ids = ['fl', 'fr', 'rl', 'rr'];
  car.tires.forEach((t, i) => {
    const bar = document.getElementById(`${ids[i]}SlipBar`);
    if (bar) bar.style.height = `${Math.min(100, t.slip * 100)}%`;
  });

  if (gCtx) {
    gCtx.clearRect(0, 0, 80, 80);
    gCtx.strokeStyle = '#334155';
    gCtx.beginPath(); gCtx.arc(40, 40, 16, 0, Math.PI * 2); gCtx.stroke();
    gCtx.beginPath(); gCtx.arc(40, 40, 32, 0, Math.PI * 2); gCtx.stroke();
    gCtx.beginPath(); gCtx.moveTo(40, 4); gCtx.lineTo(40, 76); gCtx.moveTo(4, 40); gCtx.lineTo(76, 40); gCtx.stroke();

    const latG = (car.vx * Math.cos(car.yaw) - car.vz * Math.sin(car.yaw)) * 0.12;
    const lonG = (car.throttle * 0.8 - car.brake * 1.2);
    const gx = THREE.MathUtils.clamp(40 + latG * 18, 6, 74);
    const gy = THREE.MathUtils.clamp(40 - lonG * 18, 6, 74);
    gCtx.fillStyle = '#f59e0b';
    gCtx.beginPath(); gCtx.arc(gx, gy, 4, 0, Math.PI * 2); gCtx.fill();
    document.getElementById('gForceText').textContent = `${Math.abs(latG).toFixed(1)}G | ${Math.abs(lonG).toFixed(1)}G`;
  }

  drawMinimap();
}

// --- 8. MENU & UI ACTION HANDLERS ---
function toggleMainMenu() {
  isMenuOpen = !isMenuOpen;
  document.getElementById('mainMenuOverlay').classList.toggle('hidden', !isMenuOpen);
  document.getElementById('resumeRaceBtn').classList.remove('hidden');
}

let isPitFreezing = false;
let pitFreezeRemaining = 0;

function triggerPitRepairWithFreeze() {
  const nearest = findNearestTrackSample(car.x, car.z).sample;
  car.x = nearest.pt.x;
  car.y = nearest.pt.y;
  car.z = nearest.pt.z;
  car.yaw = Math.atan2(nearest.tan.x, nearest.tan.z);
  car.vx = 0;
  car.vz = 0;
  car.yawRate = 0;
  car.throttle = 0;
  car.brake = 1.0;
  car.gear = 1;
  car.drsActive = false;

  car.damageHealth = 100;
  car.engineAlive = true;
  car.engineStalled = false;
  car.frontCrumple = 0;
  car.wingCrumple = 0;

  if (playerVisual) {
    playerVisual.mainHull.position.set(0, 0, 0);
    playerVisual.splitter.position.set(0, 0.18, 2.22);
  }

  const stallBanner = document.getElementById('engineStallBanner');
  if (stallBanner) stallBanner.classList.add('hidden');

  isPitFreezing = true;
  pitFreezeRemaining = 5.0;

  const overlay = document.getElementById('pitFreezeOverlay');
  if (overlay) overlay.classList.remove('hidden');

  if (audioEnabled && audioCtx) {
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  }
}

function repairAndResetDamage() {
  car.damageHealth = 100;
  car.engineAlive = true;
  car.engineStalled = false;
  car.frontCrumple = 0;
  car.wingCrumple = 0;
  if (playerVisual) {
    playerVisual.mainHull.position.set(0, 0, 0);
    playerVisual.splitter.position.set(0, 0.18, 2.22);
  }
  const stallBanner = document.getElementById('engineStallBanner');
  if (stallBanner) stallBanner.classList.add('hidden');
  const pitOverlay = document.getElementById('pitFreezeOverlay');
  if (pitOverlay) pitOverlay.classList.add('hidden');
  isPitFreezing = false;
  if (audioEnabled && audioCtx && engineGain) {
    engineGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  }
}

function startConfiguredRaceSession() {
  initAudioIfAllowed();

  const circuitEl = document.getElementById('menuCircuitSelect');
  const chosen = circuitEl ? circuitEl.value : 'solaris';

  const aiCountEl = document.getElementById('menuAiCount');
  const aiCount = aiCountEl ? parseInt(aiCountEl.value, 10) : 5;

  const aiSkillEl = document.getElementById('menuAiSkill');
  aiSkillMultiplier = aiSkillEl ? parseFloat(aiSkillEl.value) : 1.0;

  const raceLapsEl = document.getElementById('menuRaceLaps');
  targetRaceLaps = raceLapsEl ? parseInt(raceLapsEl.value, 10) : 3;

  const lineEl = document.getElementById('menuRacingLine');
  const wantLine = lineEl ? (lineEl.value === 'on') : false;

  const compoundEl = document.getElementById('menuCompound');
  if (compoundEl) {
    car.compound = compoundEl.value;
    const badge = document.getElementById('compoundBadge');
    if (badge) badge.textContent = car.compound.toUpperCase();
  }

  loadCircuit(chosen);
  toggleRacingLine(wantLine);

  repairAndResetDamage();
  resetCarToStart();
  spawnAiGrid(aiCount);

  isRaceFinished = false;
  raceStartTime = performance.now();
  car.lapStartTime = raceStartTime;

  const finishModal = document.getElementById('chequeredModal');
  if (finishModal) finishModal.classList.add('hidden');

  const stallBanner = document.getElementById('engineStallBanner');
  if (stallBanner) stallBanner.classList.add('hidden');

  isMenuOpen = false;
  const menuEl = document.getElementById('mainMenuOverlay');
  if (menuEl) menuEl.classList.add('hidden');

  const resumeBtn = document.getElementById('resumeRaceBtn');
  if (resumeBtn) resumeBtn.classList.remove('hidden');
}

function toggleRacingLine(forceVal) {
  showRacingLine = typeof forceVal === 'boolean' ? forceVal : !showRacingLine;
  if (racingLineMesh) racingLineMesh.visible = showRacingLine;
  const btn = document.getElementById('racingLineBtn');
  if (btn) btn.textContent = `📏 Line: ${showRacingLine ? 'ON' : 'OFF'} (L)`;
}

function cycleCamera() {
  cameraMode = (cameraMode + 1) % 2;
  document.getElementById('cameraBtn').textContent = `🎥 ${cameraMode === 0 ? 'Chase (C)' : 'Cockpit (C)'}`;
}

function resetCarToStart() {
  const s = trackSamples[10];
  car.x = s.pt.x; car.y = s.pt.y; car.z = s.pt.z;
  car.yaw = Math.atan2(s.tan.x, s.tan.z);
  car.vx = 0; car.vz = 0; car.yawRate = 0;
  car.gear = 1; car.laps = 1; car.drsActive = false; car.ersActive = false; car.ersBattery = 100; car.drsGapSec = null;
  car.lapStartTime = performance.now();
  car.passedHalfway = false;
  document.getElementById('lapCountDisplay').textContent = `1 / ${targetRaceLaps}`;
  repairAndResetDamage();
}

function resetCarToTrack() {
  triggerPitRepairWithFreeze();
}

document.getElementById('startRaceBtn').addEventListener('click', startConfiguredRaceSession);
document.getElementById('resumeRaceBtn').addEventListener('click', toggleMainMenu);
document.getElementById('openMenuBtn').addEventListener('click', toggleMainMenu);
document.getElementById('cameraBtn').addEventListener('click', cycleCamera);
document.getElementById('racingLineBtn').addEventListener('click', () => toggleRacingLine());
document.getElementById('resetCarBtn').addEventListener('click', resetCarToTrack);
const repairBtn = document.getElementById('repairEngineBtn');
if (repairBtn) repairBtn.addEventListener('click', resetCarToTrack);
document.getElementById('setupToggleBtn').addEventListener('click', () => {
  document.getElementById('garageModal').classList.toggle('hidden');
});
document.getElementById('closeGarageBtn').addEventListener('click', () => {
  document.getElementById('garageModal').classList.add('hidden');
});

document.getElementById('finishRestartBtn').addEventListener('click', () => {
  startConfiguredRaceSession();
});
document.getElementById('finishMenuBtn').addEventListener('click', () => {
  document.getElementById('chequeredModal').classList.add('hidden');
  toggleMainMenu();
});

document.getElementById('setupSteerLock').addEventListener('input', (e) => {
  car.steerLockScale = parseInt(e.target.value, 10) / 100;
  document.getElementById('valSteerLock').textContent = `${e.target.value}%`;
});
document.getElementById('setupTrailAssist').addEventListener('input', (e) => {
  car.trailBrakeAssist = parseInt(e.target.value, 10) / 100;
  document.getElementById('valTrailAssist').textContent = `${e.target.value}%`;
});
document.getElementById('setupWing').addEventListener('input', (e) => {
  car.wingLevel = parseInt(e.target.value, 10);
  document.getElementById('valWing').textContent = `${car.wingLevel} (${car.wingLevel > 7 ? 'High Grip' : car.wingLevel < 4 ? 'Low Drag' : 'Balanced'})`;
});
document.getElementById('setupSusp').addEventListener('input', (e) => {
  car.suspStiffness = parseInt(e.target.value, 10);
  document.getElementById('valSusp').textContent = `${car.suspStiffness} kN/m`;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start Simulation
loadCircuit('solaris');
resetCarToStart();
spawnAiGrid(5);

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;

  if (!isMenuOpen && !isRaceFinished) {
    if (isPitFreezing) {
      pitFreezeRemaining -= dt;
      car.vx = 0;
      car.vz = 0;
      car.yawRate = 0;
      car.throttle = 0;
      car.brake = 1.0;

      const timerText = document.getElementById('pitTimerCount');
      const timerBar  = document.getElementById('pitTimerBar');
      if (timerText) timerText.textContent = `${Math.max(0, pitFreezeRemaining).toFixed(1)}s`;
      if (timerBar) timerBar.style.width = `${Math.max(0, (pitFreezeRemaining / 5.0) * 100)}%`;

      if (pitFreezeRemaining <= 0) {
        isPitFreezing = false;
        const overlay = document.getElementById('pitFreezeOverlay');
        if (overlay) overlay.classList.add('hidden');
      }

      stepAiPhysics(dt * 0.5);
      stepAiPhysics(dt * 0.5);
    } else {
      stepPlayerPhysics(dt * 0.5);
      stepPlayerPhysics(dt * 0.5);
      stepAiPhysics(dt * 0.5);
      stepAiPhysics(dt * 0.5);
    }
  }

  updateSmokePuffs(dt);
  updateVisualsAndHUD(dt);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
