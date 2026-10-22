/**
 * Buzzer Clash: Trivia Duel
 * P2P / Solo-vs-Bot High Stakes First-To-Buzz Trivia Engine
 */

// Global State
let matchConfig = {
  mode: 'ai', // 'ai', 'host', 'join'
  playerName: 'Brainiac',
  genre: 'all',
  totalQuestions: 20,
  botDiff: 'scholar', // 'rookie', 'scholar', 'master'
  isHost: true
};

let matchState = {
  activeQuestionIndex: 0,
  questions: [],
  scores: { p1: 0, p2: 0 },
  playerNames: { p1: 'You', p2: 'Athena AI' },
  buzzerState: 'open', // 'open', 'p1_answering', 'p2_answering', 'p1_steal_window', 'p2_steal_window', 'locked', 'finished'
  activeAnsweringPlayer: null, // 'p1' or 'p2'
  currentQuestion: null,
  timerSeconds: 15,
  timerInterval: null,
  botTimer: null,
  isLockedOut: { p1: false, p2: false },
  correctIndex: 0
};

// Peer Engine Wrapper
let p2p = null;

// Built-in curated Fallback automotive & general questions to guarantee 0-lag play if API is slow
const CURATED_CARS_QUESTIONS = [
  {
    category: "Cars & Automotive",
    question: "Which iconic Japanese sports car is known as 'Godzilla'?",
    correctAnswer: "Nissan Skyline GT-R",
    incorrectAnswers: ["Toyota Supra", "Mazda RX-7", "Honda NSX"]
  },
  {
    category: "Cars & Automotive",
    question: "What does the 'GT' designation stand for in Gran Turismo cars?",
    correctAnswer: "Gran Turismo / Grand Touring",
    incorrectAnswers: ["Gas Turbo", "Gear Transmission", "Greatest Track"]
  },
  {
    category: "Cars & Automotive",
    question: "Which supercar manufacturer produces the iconic Aventador and Huracán?",
    correctAnswer: "Lamborghini",
    incorrectAnswers: ["Ferrari", "Pagani", "Bugatti"]
  },
  {
    category: "Cars & Automotive",
    question: "What legendary engine layout is the Porsche 911 famous for?",
    correctAnswer: "Rear-engine Flat-6 (Boxer)",
    incorrectAnswers: ["Front-engine V8", "Mid-engine V10", "Inline-4 Turbo"]
  },
  {
    category: "Cars & Automotive",
    question: "Which Formula 1 team has won the most Constructors' Championships in history?",
    correctAnswer: "Scuderia Ferrari",
    incorrectAnswers: ["McLaren", "Mercedes-AMG", "Red Bull Racing"]
  },
  {
    category: "Cars & Automotive",
    question: "What was the first mass-produced hybrid automobile launched worldwide?",
    correctAnswer: "Toyota Prius",
    incorrectAnswers: ["Honda Insight", "Tesla Model S", "Chevrolet Volt"]
  },
  {
    category: "Cars & Automotive",
    question: "Which car company holds the record for creating the 300+ mph Bugatti Chiron Super Sport?",
    correctAnswer: "Bugatti",
    incorrectAnswers: ["Koenigsegg", "Hennessey", "Rimac"]
  },
  {
    category: "Cars & Automotive",
    question: "What legendary American muscle car was introduced in 1964 and created the 'Pony Car' class?",
    correctAnswer: "Ford Mustang",
    incorrectAnswers: ["Chevrolet Camaro", "Dodge Challenger", "Pontiac GTO"]
  }
];

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initLobbyListeners();
  startNewMatch();
});

function initLobbyListeners() {
  document.getElementById('openLobbyBtn').addEventListener('click', () => {
    document.getElementById('lobbyModal').style.display = 'flex';
  });

  // Check URL params for room invite code ?room=
  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = urlParams.get('room');
  if (roomCode) {
    document.getElementById('lobbyModal').style.display = 'flex';
    setMode('join');
    document.getElementById('joinRoomInput').value = roomCode;
  }
}

function closeLobbyModal() {
  document.getElementById('lobbyModal').style.display = 'none';
}

function setMode(mode) {
  matchConfig.mode = mode;
  const tabAi = document.getElementById('tabAiModeBtn');
  const tabHost = document.getElementById('tabHostModeBtn');
  const tabJoin = document.getElementById('tabJoinModeBtn');
  const botWrap = document.getElementById('botDifficultyWrapper');
  const hostArea = document.getElementById('hostWaitingArea');
  const joinArea = document.getElementById('joinInputArea');
  const actionBtn = document.getElementById('modalActionBtn');

  tabAi.className = mode === 'ai' ? 'btn btn-primary' : 'btn btn-secondary';
  tabHost.className = mode === 'host' ? 'btn btn-primary' : 'btn btn-secondary';
  tabJoin.className = mode === 'join' ? 'btn btn-primary' : 'btn btn-secondary';

  if (mode === 'ai') {
    botWrap.style.display = 'block';
    hostArea.style.display = 'none';
    joinArea.style.display = 'none';
    actionBtn.textContent = '🚀 Start Match vs Bot';
  } else if (mode === 'host') {
    botWrap.style.display = 'none';
    hostArea.style.display = 'block';
    joinArea.style.display = 'none';
    actionBtn.textContent = '👑 Launch P2P Room';
    setupP2PHost();
  } else if (mode === 'join') {
    botWrap.style.display = 'none';
    hostArea.style.display = 'none';
    joinArea.style.display = 'block';
    actionBtn.textContent = '🔗 Connect & Join Room';
  }
}

function handleModalAction() {
  const name = document.getElementById('playerNameInput').value.trim() || 'Brainiac';
  matchConfig.playerName = name;
  matchConfig.genre = document.getElementById('genreSelect').value;
  matchConfig.totalQuestions = parseInt(document.getElementById('questionCountSelect').value, 10);
  matchConfig.botDiff = document.getElementById('botDiffSelect').value;

  if (matchConfig.mode === 'ai') {
    closeLobbyModal();
    startNewMatch();
  } else if (matchConfig.mode === 'join') {
    const code = document.getElementById('joinRoomInput').value.trim();
    if (!code) {
      alert("Please enter a room code!");
      return;
    }
    setupP2PJoin(code);
  } else if (matchConfig.mode === 'host') {
    if (!p2p || !p2p.getConnectedPeers().length) {
      if (!confirm("No friend connected yet. Start with bot opponent until someone joins?")) {
        return;
      }
      matchConfig.mode = 'ai';
    }
    closeLobbyModal();
    startNewMatch();
  }
}

// -------------------------------------------------------------
// P2P Multiplayer Networking via MultiPeerEngine
// -------------------------------------------------------------
function setupP2PHost() {
  const code = 'clash-' + Math.floor(1000 + Math.random() * 9000);
  const shareInput = document.getElementById('shareRoomInput');
  shareInput.value = `${window.location.origin}${window.location.pathname}?room=${code}`;

  p2p = new MultiPeerEngine({
    roomId: code,
    isHost: true,
    playerName: matchConfig.playerName,
    onPlayerJoin: (id, name) => {
      document.getElementById('connectedPeerBadge').textContent = `✅ Opponent connected: ${name}!`;
      document.getElementById('connectedPeerBadge').style.color = '#34d399';
      matchState.playerNames.p2 = name;
      updateHudNames();
    },
    onData: (data) => {
      handleP2PMessage(data);
    }
  });
  p2p.init();
}

function setupP2PJoin(code) {
  p2p = new MultiPeerEngine({
    roomId: code,
    isHost: false,
    playerName: matchConfig.playerName,
    onConnectedToHost: () => {
      closeLobbyModal();
      document.getElementById('liveStatusToast').textContent = "🔗 Connected to host! Match starting...";
    },
    onData: (data) => {
      handleP2PMessage(data);
    }
  });
  p2p.init();
}

function handleP2PMessage(msg) {
  if (msg.type === 'SYNC_QUESTION') {
    matchState.activeQuestionIndex = msg.qIndex;
    matchState.currentQuestion = msg.question;
    matchState.scores = msg.scores;
    matchState.playerNames = msg.playerNames;
    renderCurrentQuestion(msg.question);
    startTimer(15);
  } else if (msg.type === 'BUZZ_CLAIM') {
    // Other player buzzed in first!
    handleRemoteBuzz(msg.player);
  } else if (msg.type === 'ANSWER_RESULT') {
    handleAnswerResult(msg.player, msg.isCorrect, msg.selectedIdx);
  }
}

// Category Mapping for The Trivia API and OpenTDB
const CATEGORY_MAP = {
  cars: { ttaTag: 'cars', opentdbCat: 28 },
  geography: { ttaCat: 'geography', opentdbCat: 22 },
  history: { ttaCat: 'history', opentdbCat: 23 },
  science: { ttaCat: 'science', opentdbCat: 17 },
  computers: { ttaTag: 'technology', opentdbCat: 18 },
  video_games: { ttaTag: 'video_games', opentdbCat: 15 },
  anime: { ttaTag: 'anime', opentdbCat: 31 },
  mythology: { ttaTag: 'mythology', opentdbCat: 20 },
  film_and_tv: { ttaCat: 'film_and_tv', opentdbCat: 11 },
  music: { ttaCat: 'music', opentdbCat: 12 },
  sport_and_leisure: { ttaCat: 'sport_and_leisure', opentdbCat: 21 },
  food_and_drink: { ttaCat: 'food_and_drink', opentdbCat: 9 },
  arts_and_literature: { ttaCat: 'arts_and_literature', opentdbCat: 10 },
  society_and_culture: { ttaCat: 'society_and_culture', opentdbCat: 24 },
  animals: { ttaTag: 'animals', opentdbCat: 27 }
};

// -------------------------------------------------------------
// Fetch Questions from The Trivia API / OpenTDB with Curated Fallbacks
// -------------------------------------------------------------
async function fetchMatchQuestions(count, genre) {
  let fetchedQuestions = [];
  const catConfig = CATEGORY_MAP[genre];

  // 1. Try The Trivia API v2
  try {
    let url = `https://the-trivia-api.com/v2/questions?limit=${count}`;
    if (catConfig) {
      if (catConfig.ttaTag) {
        url += `&tags=${catConfig.ttaTag}`;
      } else if (catConfig.ttaCat) {
        url += `&categories=${catConfig.ttaCat}`;
      }
    }

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      fetchedQuestions = data.map(q => ({
        category: (q.category || genre).replace(/_/g, ' '),
        question: q.question.text,
        correctAnswer: q.correctAnswer,
        incorrectAnswers: q.incorrectAnswers
      }));
    }
  } catch (err) {
    console.warn("Live Trivia API error, switching to OpenTDB fallback:", err);
  }

  // 2. OpenTDB fallback if count is not satisfied or category needs more volume
  if (fetchedQuestions.length < count) {
    try {
      const needed = count - fetchedQuestions.length;
      let openTdbUrl = `https://opentdb.com/api.php?amount=${needed}`;
      if (catConfig && catConfig.opentdbCat) {
        openTdbUrl += `&category=${catConfig.opentdbCat}`;
      }

      const res2 = await fetch(openTdbUrl);
      const data2 = await res2.json();
      if (data2.results && data2.results.length) {
        const decoded = data2.results.map(q => ({
          category: decodeHtml(q.category),
          question: decodeHtml(q.question),
          correctAnswer: decodeHtml(q.correct_answer),
          incorrectAnswers: q.incorrect_answers.map(a => decodeHtml(a))
        }));
        fetchedQuestions = [...fetchedQuestions, ...decoded];
      }
    } catch (e2) {
      console.warn("OpenTDB fallback failed, utilizing curated deck:", e2);
    }
  }

  // 3. Final safety fallback to curated deck for cars or general fill
  if (genre === 'cars' || fetchedQuestions.length < count) {
    fetchedQuestions = [...fetchedQuestions, ...CURATED_CARS_QUESTIONS];
  }

  // Shuffle and trim to requested totalQuestions
  fetchedQuestions.sort(() => Math.random() - 0.5);
  return fetchedQuestions.slice(0, count);
}

function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// -------------------------------------------------------------
// Core Game Loop & Buzzer Engine
// -------------------------------------------------------------
async function startNewMatch() {
  document.getElementById('victoryModal').style.display = 'none';
  matchState.activeQuestionIndex = 0;
  matchState.scores = { p1: 0, p2: 0 };
  matchState.playerNames.p1 = matchConfig.playerName;
  matchState.playerNames.p2 = matchConfig.mode === 'ai' ? getBotName(matchConfig.botDiff) : (matchState.playerNames.p2 || 'Opponent');

  updateHudNames();
  updateScoreboard();

  document.getElementById('qText').innerHTML = `<span style="color:#38bdf8; animation:pulse 1s infinite;">📡 Connecting to Trivia Network...</span>`;

  matchState.questions = await fetchMatchQuestions(matchConfig.totalQuestions, matchConfig.genre);
  if (!matchState.questions.length) {
    matchState.questions = CURATED_CARS_QUESTIONS;
  }

  loadQuestion(0);
}

function getBotName(diff) {
  if (diff === 'rookie') return 'Rookie Bot 🟢';
  if (diff === 'scholar') return 'Scholar AI 🟡';
  return 'Grandmaster Athena 🔴';
}

function updateHudNames() {
  document.getElementById('p1Name').textContent = matchState.playerNames.p1;
  document.getElementById('p2Name').textContent = matchState.playerNames.p2;
}

function updateScoreboard() {
  document.getElementById('p1Score').textContent = `${matchState.scores.p1} pts`;
  document.getElementById('p2Score').textContent = `${matchState.scores.p2} pts`;
}

function loadQuestion(index) {
  if (index >= matchState.questions.length) {
    endMatch();
    return;
  }

  matchState.activeQuestionIndex = index;
  const q = matchState.questions[index];
  matchState.currentQuestion = q;
  matchState.isLockedOut = { p1: false, p2: false };
  matchState.buzzerState = 'open';
  matchState.activeAnsweringPlayer = null;

  renderCurrentQuestion(q);
  startTimer(15);

  // If host in P2P, sync with remote peer
  if (p2p && matchConfig.mode === 'host') {
    p2p.broadcast({
      type: 'SYNC_QUESTION',
      qIndex: index,
      question: q,
      scores: matchState.scores,
      playerNames: matchState.playerNames
    });
  }

  // Schedule AI action if in bot mode
  if (matchConfig.mode === 'ai') {
    scheduleAiBuzzer();
  }
}

function renderCurrentQuestion(q) {
  document.getElementById('qGenreTag').textContent = q.category || 'General';
  document.getElementById('qProgressTag').textContent = `Question ${matchState.activeQuestionIndex + 1} / ${matchState.questions.length}`;
  document.getElementById('qText').textContent = q.question;

  // Build 4 options with randomized order
  const options = [q.correctAnswer, ...q.incorrectAnswers];
  options.sort(() => Math.random() - 0.5);
  matchState.correctIndex = options.indexOf(q.correctAnswer);

  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`ans${i}`);
    btn.className = 'answer-btn';
    btn.disabled = false;
    const textEl = btn.querySelector('.answer-text');
    textEl.textContent = options[i] || '—';
  }

  // Reset Pod states
  document.getElementById('p1Pod').className = 'player-pod';
  document.getElementById('p2Pod').className = 'player-pod';
  document.getElementById('p1StatusBadge').textContent = 'READY';
  document.getElementById('p1StatusBadge').style.color = 'var(--neon-cyan)';
  document.getElementById('p2StatusBadge').textContent = 'READY';
  document.getElementById('p2StatusBadge').style.color = 'var(--neon-purple)';

  setStatusToast('⚡ Buzzer is LIVE! First to answer locks the question.');
}

function startTimer(seconds) {
  clearInterval(matchState.timerInterval);
  matchState.timerSeconds = seconds;
  const timerVal = document.getElementById('countdownVal');
  const timerLabel = document.getElementById('timerLabel');

  timerVal.textContent = seconds;
  timerVal.style.color = seconds <= 5 ? 'var(--neon-red)' : 'var(--neon-cyan)';

  matchState.timerInterval = setInterval(() => {
    matchState.timerSeconds--;
    timerVal.textContent = matchState.timerSeconds;

    if (matchState.timerSeconds <= 5) {
      timerVal.style.color = 'var(--neon-red)';
    }

    if (matchState.timerSeconds <= 0) {
      clearInterval(matchState.timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  if (matchState.buzzerState === 'open') {
    // 15 seconds passed and nobody buzzed in -> Question skipped!
    setStatusToast('⏰ 15 seconds expired! Question skipped. Nobody scored.');
    revealCorrectAnswer();
    setTimeout(() => {
      loadQuestion(matchState.activeQuestionIndex + 1);
    }, 2000);
  } else if (matchState.buzzerState.includes('steal_window')) {
    // The 5 second steal window expired without the second player answering!
    setStatusToast('⏰ 5-second steal window expired! Question forfeited.');
    revealCorrectAnswer();
    setTimeout(() => {
      loadQuestion(matchState.activeQuestionIndex + 1);
    }, 2000);
  }
}

// -------------------------------------------------------------
// Buzzer & High-Stakes Answer Handling
// -------------------------------------------------------------
function handleAnswerClick(selectedIdx) {
  // If player is already locked out or question is finished, ignore
  if (matchState.isLockedOut.p1 || matchState.buzzerState === 'locked' || matchState.buzzerState === 'finished') {
    return;
  }

  if (matchState.buzzerState === 'open') {
    // Player 1 claims the buzzer!
    processPlayerAnswer('p1', selectedIdx);
  } else if (matchState.buzzerState === 'p1_steal_window') {
    // Player 1 has a free 5-second steal chance after Player 2 failed!
    processPlayerAnswer('p1', selectedIdx);
  }
}

function processPlayerAnswer(player, selectedIdx) {
  clearInterval(matchState.timerInterval);
  clearTimeout(matchState.botTimer);

  const isP1 = player === 'p1';
  const otherPlayer = isP1 ? 'p2' : 'p1';
  const isCorrect = selectedIdx === matchState.correctIndex;
  const chosenBtn = document.getElementById(`ans${selectedIdx}`);

  // Broadcast if P2P
  if (p2p) {
    p2p.broadcast({
      type: 'ANSWER_RESULT',
      player,
      isCorrect,
      selectedIdx
    });
  }

  handleAnswerResult(player, isCorrect, selectedIdx);
}

function handleAnswerResult(player, isCorrect, selectedIdx) {
  const isP1 = player === 'p1';
  const otherPlayer = isP1 ? 'p2' : 'p1';
  const chosenBtn = document.getElementById(`ans${selectedIdx}`);
  const playerName = matchState.playerNames[player];

  if (isCorrect) {
    // CORRECT! Award points based on speed
    const pointsAwarded = Math.max(400, matchState.timerSeconds * 60 + 200);
    matchState.scores[player] += pointsAwarded;
    updateScoreboard();

    chosenBtn.classList.add('correct');
    setStatusToast(`🎉 ${playerName} BUZZED IN & GOT IT RIGHT! (+${pointsAwarded} pts)`);
    matchState.buzzerState = 'finished';

    // Highlight winning pod
    document.getElementById(`${player}Pod`).classList.add('active-buzzer');

    setTimeout(() => {
      loadQuestion(matchState.activeQuestionIndex + 1);
    }, 2200);

  } else {
    // WRONG ANSWER! High-Stakes Penalty: Lose points & lock out for 5-sec steal window
    const penalty = 250;
    matchState.scores[player] = Math.max(0, matchState.scores[player] - penalty);
    updateScoreboard();

    chosenBtn.classList.add('incorrect');
    matchState.isLockedOut[player] = true;
    document.getElementById(`${player}Pod`).classList.add('locked-out');
    document.getElementById(`${player}StatusBadge`).textContent = 'WRONG (-250)';
    document.getElementById(`${player}StatusBadge`).style.color = 'var(--neon-red)';

    // Check if other player can steal!
    if (!matchState.isLockedOut[otherPlayer]) {
      matchState.buzzerState = `${otherPlayer}_steal_window`;
      const otherName = matchState.playerNames[otherPlayer];
      setStatusToast(`💥 ${playerName} was WRONG! 5-second STEAL chance for ${otherName}!`);
      
      // Start intense 5-second steal countdown
      startTimer(5);
      document.getElementById('timerLabel').textContent = 'STEAL WINDOW';

      // If other player is Bot, simulate bot steal attempt
      if (matchConfig.mode === 'ai' && otherPlayer === 'p2') {
        scheduleAiSteal();
      }
    } else {
      // Both failed!
      setStatusToast('💀 Both players failed! Question discarded.');
      revealCorrectAnswer();
      setTimeout(() => {
        loadQuestion(matchState.activeQuestionIndex + 1);
      }, 2200);
    }
  }
}

function revealCorrectAnswer() {
  const correctBtn = document.getElementById(`ans${matchState.correctIndex}`);
  if (correctBtn) {
    correctBtn.classList.add('correct');
  }
}

function setStatusToast(msg) {
  document.getElementById('statusMsg').textContent = msg;
}

// -------------------------------------------------------------
// Human-Like Simulated AI Opponent (No Cheating!)
// -------------------------------------------------------------
function scheduleAiBuzzer() {
  clearTimeout(matchState.botTimer);

  // Difficulty settings: Accuracy % and simulated reading reaction time
  let accuracy = 0.50; // Rookie: ~50%
  let minSec = 4.0;
  let maxSec = 8.5;

  if (matchConfig.botDiff === 'scholar') {
    accuracy = 0.72; // Scholar: ~72%
    minSec = 3.0;
    maxSec = 6.5;
  } else if (matchConfig.botDiff === 'master') {
    accuracy = 0.86; // Master: ~86%
    minSec = 2.0;
    maxSec = 4.5;
  }

  const thinkingTimeMs = (Math.random() * (maxSec - minSec) + minSec) * 1000;

  matchState.botTimer = setTimeout(() => {
    // Only buzz if buzzer is still open and human hasn't answered
    if (matchState.buzzerState === 'open') {
      const isCorrectDecision = Math.random() < accuracy;
      let chosenIdx = matchState.correctIndex;

      if (!isCorrectDecision) {
        // Pick one of the 3 incorrect answers at random!
        const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== matchState.correctIndex);
        chosenIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      }

      processPlayerAnswer('p2', chosenIdx);
    }
  }, thinkingTimeMs);
}

function scheduleAiSteal() {
  clearTimeout(matchState.botTimer);

  // During 5-second steal window, AI has 65% chance to attempt steal after 2 seconds
  matchState.botTimer = setTimeout(() => {
    if (matchState.buzzerState === 'p2_steal_window') {
      const willAttempt = Math.random() < 0.80;
      if (willAttempt) {
        const isRight = Math.random() < 0.70;
        let chosenIdx = matchState.correctIndex;
        if (!isRight) {
          const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== matchState.correctIndex);
          chosenIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        }
        processPlayerAnswer('p2', chosenIdx);
      }
    }
  }, 2200);
}

// -------------------------------------------------------------
// Match Conclusion & Discord Webhook
// -------------------------------------------------------------
function endMatch() {
  clearInterval(matchState.timerInterval);
  clearTimeout(matchState.botTimer);

  const p1 = { name: matchState.playerNames.p1, score: matchState.scores.p1 };
  const p2 = { name: matchState.playerNames.p2, score: matchState.scores.p2 };

  let winnerName = p1.name;
  let winnerScore = p1.score;
  let loserName = p2.name;
  let loserScore = p2.score;

  if (p2.score > p1.score) {
    winnerName = p2.name;
    winnerScore = p2.score;
    loserName = p1.name;
    loserScore = p1.score;
  } else if (p1.score === p2.score) {
    winnerName = 'Tie Match';
  }

  const modal = document.getElementById('victoryModal');
  const title = document.getElementById('vicTitle');
  const sub = document.getElementById('vicSubtitle');
  const breakdown = document.getElementById('vicBreakdown');

  title.textContent = winnerName === 'Tie Match' ? 'IT’S A DRAW!' : `${winnerName.toUpperCase()} VICTORIOUS!`;
  sub.textContent = `${matchState.questions.length} questions completed across ${matchConfig.genre.toUpperCase()}.`;

  breakdown.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:800;">
      <span>🥇 1st Place: <strong>${winnerName}</strong></span>
      <span style="color:var(--neon-amber);">${winnerScore} pts</span>
    </div>
    <div style="display:flex; justify-content:space-between; font-weight:700; color:var(--text-muted);">
      <span>🥈 2nd Place: ${loserName}</span>
      <span>${loserScore} pts</span>
    </div>
  `;

  modal.style.display = 'flex';

  // Send stylized Discord Match Report
  if (typeof sendDiscordMatchReport === 'function') {
    sendDiscordMatchReport({
      gameName: 'Buzzer Clash: Trivia Duel',
      gameIcon: '⚡',
      color: 0x38bdf8,
      winner: winnerName,
      summary: `Completed **${matchState.questions.length}** high-stakes trivia rounds in category **${matchConfig.genre.toUpperCase()}**!`,
      fields: [
        {
          name: `🥇 Champion: ${winnerName}`,
          value: `**${winnerScore} Points**`,
          inline: true
        },
        {
          name: `🥈 Runner-up: ${loserName}`,
          value: `**${loserScore} Points**`,
          inline: true
        },
        {
          name: '🎮 Settings',
          value: `Mode: \`${matchConfig.mode.toUpperCase()}\` • Genre: \`${matchConfig.genre}\``,
          inline: false
        }
      ]
    });
  }
}

function startNewGameFromVictory() {
  document.getElementById('victoryModal').style.display = 'none';
  startNewMatch();
}
