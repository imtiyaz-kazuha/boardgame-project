# Imtiboard Digital Playground 🎲

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-38bdf8?style=for-the-badge&logo=google-chrome&logoColor=white)](https://imtiyaz-kazuha.github.io/boardgame-project/home/)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-22c55e?style=for-the-badge&logo=github&logoColor=white)](https://imtiyaz-kazuha.github.io/boardgame-project/home/)
[![WebRTC](https://img.shields.io/badge/Multiplayer-PeerJS%20WebRTC-f59e0b?style=for-the-badge&logo=webrtc&logoColor=white)](https://peerjs.com/)
[![Built for Fun](https://img.shields.io/badge/Built%20by-Imtiyaz%20for%20Fun-a855f7?style=for-the-badge)](https://imtiyaz-kazuha.github.io/boardgame-project/home/)

> **A free, serverless, peer-to-peer web gaming portal designed for instant cross-device board game sessions with friends or smart autonomous AI bots.**

---

## 🌟 Key Architecture & Highlights

* **100% Serverless & Zero Cost:** Runs entirely client-side on GitHub Pages. No backend hosting, database bills, or monthly subscription fees.
* **Direct WebRTC P2P Multiplayer:** Browser-to-browser data sync using PeerJS. Host a match, send a quick room link or code, and play without logging in.
* **Smart Autonomous AI Bots:** Every game features solo play against intelligent heuristic/BFS tactical bots that automatically backfill vacant multiplayer seats.
* **Tactile Glassmorphism UI:** Built with sleek neo-dark cyberpunk aesthetics, Canvas particle explosions, sound synthesis via Web Audio API, and full touch-first responsive design for mobile, tablet, and desktop.
* **No Downloads or Installs:** Instant play directly inside any modern browser (Chrome, Edge, Safari, Firefox).

---

## 🎮 Playable Games Roster

| Game | Theme / Genre | Players | Mode | Highlights |
| :--- | :--- | :---: | :---: | :--- |
| **🕵️ Dancing Criminal**<br>*(Hannin wa Odoru)* | Social Deduction & Card Dancing | 3–6 | Solo vs AI / P2P | Unique comic art, physical card flight animations, K-9 sniff picker, Alibi bluffs, and sudden escape finishes! |
| **👑 Coup: Syndicate** | Political Bluffing & Deception | 2–6 | Solo vs AI / P2P | Circular neon table, 10s challenge timers, assassination shields, Ambassador exchanges, and unblockable coups. |
| **🚂 Connect 4 America** | Transcontinental Network Strategy | 2 | Solo vs AI / P2P | Interactive GPS relief map across 20 US hubs, BFS quest pathfinding, dynamic 3:5:4:1 card draw odds, and `< 2` remaining routes end trigger. |
| **🎲 Ludo Royale** | Classic Parchisi / Token Race | 2–4 | Solo vs AI / P2P | 52-tile interactive board, bonus rolls on 6, token capture knockouts, safe zones, and smooth 3D dice physics. |

---

### Detailed Game Overviews

### 1. 🕵️ Dancing Criminal (`/criminaldance/`)
* **Inspiration:** *Hannin wa Odoru (The Criminal Dances)*
* **Objective:** Pass cards and deduce who holds the secret Criminal card.
  * **🦹 Criminal Victory:** Play the Criminal as your **very last card** to escape and win with your secret Accomplice!
  * **👮 Detective Victory:** Accuse the Criminal holder with the **Detective**, question with the **Police Inspector**, or sniff them out with the **Police Dog (K-9)**!
* **Highlights:** Unique fictional comic illustrations on every single card, custom frosted-glass text overlays, full card flight trajectory animations with spark trails, and zero intrusive popups.

### 2. 👑 Coup: Syndicate (`/coup/`)
* **Inspiration:** *Coup (Indie Boards & Cards)*
* **Objective:** Eliminate the influence of rival agents and be the last player standing with secret cards.
* **Roles:** 👑 Duke, 🗡️ Assassin, 📜 Captain, 🛡️ Contessa, 🔍 Ambassador.
* **Highlights:** 10-second reaction timers with fast-pass auto-advance, bluff probability AI heuristics, interactive seat badges, and canvas coin/slash VFX.

### 3. 🚂 Connect 4 America (`/connect4america/`)
* **Inspiration:** *Ticket to Ride meets Catan*
* **Objective:** Build an interstate transit network spanning 20 US hub cities across 17 distinct states and districts using train, highway, and aerial flight corridors.
* **Highlights:** Real Haversine geographic distance scoring ($\approx 1\text{ pt per } 80\text{ km}$), 12 shared cross-country bounty quests, balanced `3:5:4:1` card draw odds, and custom victory confetti modals.

### 4. 🎲 Ludo Royale (`/ludo/`)
* **Inspiration:** *Classic Parchisi / Ludo*
* **Objective:** Navigate all 4 colored tokens around the 52-tile circuit and down your home runway into the center pocket.
* **Highlights:** Bonus rolls on 6, token knockback captures, protective star safe zones, and automatic bot takeovers.

---

## 🛠️ Tech Stack & Implementation

```
┌────────────────────────────────────────────────────────┐
│                    Web Browser                         │
│  HTML5 + CSS3 Variables + Vanilla ES6 Modules          │
├────────────────────────┬───────────────────────────────┤
│    Graphics & Audio    │         Multiplayer           │
│  • HTML5 Canvas VFX    │  • PeerJS (WebRTC DataChannel)│
│  • Web Audio API Synth │  • MultiPeer Mesh Engine      │
│  • Leaflet.js Mapping  │  • Zero Server Backend        │
└────────────────────────┴───────────────────────────────┘
```

* **Frontend:** Clean Vanilla JavaScript (ES6+), semantic HTML5, and responsive CSS (zero heavy front-end frameworks like React/Angular needed for ultra-fast load times).
* **Multiplayer Engine:** Custom-built [`multi-peer-engine.js`](file:///c:/Users/Asus/Downloads/Digital boardgame proj/shared/multi-peer-engine.js) wrapping WebRTC PeerJS to orchestrate real-time host/client room synchronization.
* **Map Engine:** Leaflet.js rendering OpenStreetMap and Esri World Physical Shaded Relief tiles.
* **Sound & FX:** Procedurally generated sound effects synthesized in real-time via Web Audio API oscillators (no bulky audio files to download).

---

## 🚀 Local Development & Testing

Want to test or run the project locally?

1. **Clone the repository:**
   ```bash
   git clone https://github.com/imtiyaz-kazuha/boardgame-project.git
   cd boardgame-project
   ```

2. **Serve with any local static HTTP server:**
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node.js npx
   npx serve .
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8000/home/` in your browser.

---

## 📜 License & Credits

* **Author:** Built by **Imtiyaz** for pure fun! 🚀
* **Hosting:** Deployed via **GitHub Pages**.
* **License:** Open source under the [MIT License](LICENSE).
