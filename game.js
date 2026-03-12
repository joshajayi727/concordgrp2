/* ============================================
   ConcordGrp2 Starter Edition — game.js
   Reaction Timer Game with Leaderboard
   ============================================ */

'use strict';

// ── State ────────────────────────────────────
const State = {
  IDLE:    'idle',
  WAITING: 'waiting',
  READY:   'ready',
  RESULT:  'result',
};

let currentState   = State.IDLE;
let startTimestamp = 0;
let waitTimeout    = null;
let scores         = [];          // { name, time, timestamp }
let totalAttempts  = 0;
let bestTime       = Infinity;

// ── DOM References ───────────────────────────
const DOM = {
  message:     document.getElementById('message'),
  scoreDisp:   document.getElementById('score-display'),
  startBtn:    document.getElementById('start-btn'),
  clickBtn:    document.getElementById('click-btn'),
  nickname:    document.getElementById('nickname'),
  scoreList:   document.getElementById('score-list'),
  gameArena:   document.getElementById('game-arena'),
  countdown:   document.getElementById('countdown-display'),
  ratingBadge: document.getElementById('rating-badge'),
  statBest:    document.getElementById('stat-best'),
  statAvg:     document.getElementById('stat-avg'),
  statPlays:   document.getElementById('stat-plays'),
};

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadScoresFromStorage();
  renderLeaderboard();
  updateStats();

  // Wire up buttons
  DOM.startBtn.addEventListener('click', startGame);
  DOM.clickBtn.addEventListener('click', recordReaction);

  // Allow Enter key to start
  DOM.nickname.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && currentState === State.IDLE) startGame();
  });

  setMessage('Enter your callsign and press START', 'default');
});

// ── Game Logic ───────────────────────────────

function startGame() {
  if (currentState === State.WAITING || currentState === State.READY) return;

  clearTimeout(waitTimeout);
  DOM.startBtn.style.display      = 'none';
  DOM.clickBtn.style.display      = 'none';
  DOM.scoreDisp.textContent       = '';
  DOM.ratingBadge.textContent     = '';
  DOM.ratingBadge.className       = '';

  currentState = State.WAITING;
  setArenaState('state-waiting');
  setMessage('GET READY...', 'wait');
  DOM.gameArena.style.cursor = 'default';

  // Random delay between 1.5s and 5s
  const delay = Math.random() * 3500 + 1500;

  waitTimeout = setTimeout(triggerReady, delay);
}

function triggerReady() {
  if (currentState !== State.WAITING) return;

  currentState   = State.READY;
  startTimestamp = performance.now();       // high-res timer

  setArenaState('state-go');
  setMessage('⚡ CLICK NOW! ⚡', 'go');
  DOM.clickBtn.style.display  = 'block';
  DOM.gameArena.style.cursor  = 'pointer';

  // Also allow clicking anywhere on the arena
  DOM.gameArena.addEventListener('click', handleArenaClick, { once: true });
}

function handleArenaClick() {
  // Fires when arena background is clicked (excluding the button itself)
  if (currentState === State.READY) recordReaction();
}

function recordReaction() {
  if (currentState !== State.READY) return;

  const reactionTime = Math.round(performance.now() - startTimestamp);
  currentState = State.RESULT;

  clearTimeout(waitTimeout);
  DOM.clickBtn.style.display  = 'none';
  DOM.gameArena.style.cursor  = 'default';
  setArenaState('state-result');

  totalAttempts++;

  const nick = DOM.nickname.value.trim() || 'ANON';

  // Store score
  const entry = { name: nick.toUpperCase().slice(0, 12), time: reactionTime, timestamp: Date.now() };
  scores.push(entry);
  scores.sort((a, b) => a.time - b.time);

  // Update personal best
  if (reactionTime < bestTime) bestTime = reactionTime;

  saveScoresToStorage();
  renderLeaderboard();
  updateStats();

  // Display result
  const rating = getRating(reactionTime);
  DOM.scoreDisp.textContent = `${reactionTime} ms`;

  setMessage(rating.message, 'result');
  showRatingBadge(rating);

  // Reset to idle — show start button again
  setTimeout(() => {
    DOM.startBtn.style.display = 'block';
    currentState = State.IDLE;
  }, 400);
}

// Called if user clicks too early
function earlyClick() {
  if (currentState !== State.WAITING) return;

  clearTimeout(waitTimeout);
  currentState = State.IDLE;

  setArenaState('');
  setMessage('TOO EARLY! Wait for the signal.', 'early');
  DOM.clickBtn.style.display   = 'none';

  setTimeout(() => {
    DOM.startBtn.style.display = 'block';
    setMessage('Enter your callsign and press START', 'default');
  }, 1500);
}

// Attach early-click handler to arena during waiting state
DOM.gameArena.addEventListener('click', () => {
  if (currentState === State.WAITING) earlyClick();
});

// ── Rating System ─────────────────────────────
function getRating(ms) {
  if (ms < 150) return { label: 'GOD MODE',   cls: 'rating-god',     message: 'IMPOSSIBLE. ARE YOU HUMAN?' };
  if (ms < 200) return { label: 'ELITE',       cls: 'rating-elite',   message: 'ELITE REFLEXES! 🚀' };
  if (ms < 280) return { label: 'SHARP',       cls: 'rating-good',    message: 'SHARP REACTION! Well done.' };
  if (ms < 380) return { label: 'AVERAGE',     cls: 'rating-average', message: 'Not bad. Keep training.' };
  return              { label: 'SLOW',          cls: 'rating-slow',    message: 'Too slow. Try again!' };
}

function showRatingBadge(rating) {
  DOM.ratingBadge.textContent = rating.label;
  DOM.ratingBadge.className   = rating.cls;
}

// ── Stats ─────────────────────────────────────
function updateStats() {
  // Best time
  if (DOM.statBest) {
    DOM.statBest.textContent = bestTime === Infinity ? '---' : `${bestTime}ms`;
  }

  // Average of all attempts
  if (DOM.statAvg && scores.length > 0) {
    const avg = Math.round(scores.reduce((sum, s) => sum + s.time, 0) / scores.length);
    DOM.statAvg.textContent = `${avg}ms`;
  } else if (DOM.statAvg) {
    DOM.statAvg.textContent = '---';
  }

  // Total plays
  if (DOM.statPlays) {
    DOM.statPlays.textContent = totalAttempts;
  }
}

// ── Leaderboard ───────────────────────────────
function renderLeaderboard() {
  if (!DOM.scoreList) return;

  const top = scores.slice(0, 8);

  if (top.length === 0) {
    DOM.scoreList.innerHTML = '<p class="leaderboard-empty">NO SCORES YET — BE THE FIRST!</p>';
    return;
  }

  DOM.scoreList.innerHTML = top.map((entry, i) => {
    const rankClass = i < 3 ? `rank-${i + 1}` : '';
    const medal     = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1;
    return `
      <li class="score-item ${rankClass}" style="animation-delay: ${i * 0.05}s">
        <span class="rank-badge">${medal}</span>
        <span class="player-name">${escapeHtml(entry.name)}</span>
        <span class="player-score">${entry.time}ms</span>
      </li>`;
  }).join('');
}

// ── UI Helpers ────────────────────────────────
function setMessage(text, type = 'default') {
  if (!DOM.message) return;
  DOM.message.textContent = text;
  DOM.message.className   = '';
  if (type === 'wait')   DOM.message.classList.add('msg-wait');
  if (type === 'go')     DOM.message.classList.add('msg-go');
  if (type === 'result') DOM.message.classList.add('msg-result');
  if (type === 'early')  DOM.message.classList.add('msg-early');
}

function setArenaState(stateClass) {
  if (!DOM.gameArena) return;
  DOM.gameArena.className = stateClass;
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

// ── Persistence (localStorage) ───────────────
function saveScoresToStorage() {
  try {
    const data = {
      scores:        scores.slice(0, 20),   // keep top 20
      totalAttempts,
      bestTime: bestTime === Infinity ? null : bestTime,
    };
    localStorage.setItem('concordgrp2_scores', JSON.stringify(data));
  } catch (_) {
    // Storage unavailable (e.g. private browsing) — silently ignore
  }
}

function loadScoresFromStorage() {
  try {
    const raw = localStorage.getItem('concordgrp2_scores');
    if (!raw) return;
    const data    = JSON.parse(raw);
    scores        = Array.isArray(data.scores) ? data.scores : [];
    totalAttempts = Number(data.totalAttempts) || 0;
    bestTime      = data.bestTime != null ? Number(data.bestTime) : Infinity;
  } catch (_) {
    scores = [];
  }
}
