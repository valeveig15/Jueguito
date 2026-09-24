const screens = {
  intro: document.getElementById('screenIntro'),
  game: document.getElementById('screenGame'),
  final: document.getElementById('screenFinal')
};

const gameContent = document.getElementById('gameContent');
const levelLabel = document.getElementById('levelLabel');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const toast = document.getElementById('toast');
const soundToggle = document.getElementById('soundToggle');
const voucherText = document.getElementById('voucherText');
const finalMessage = document.getElementById('finalMessage');
const copyFeedback = document.getElementById('copyFeedback');

let level = 1;
let soundOn = true;
let reflexTimer = null;
let reflexCountdown = null;
let chosenReward = '7 minutos de break conmigo';

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 1650);
}

function beep(type = 'click') {
  if (!soundOn) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type === 'win' ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(type === 'win' ? 520 : 285, ctx.currentTime);
  if (type === 'win') osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.10, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (type === 'win' ? 0.28 : 0.12));

  osc.start();
  osc.stop(ctx.currentTime + (type === 'win' ? 0.3 : 0.14));
  osc.onended = () => ctx.close();
}

function updateProgress() {
  const pct = level * 25;
  levelLabel.textContent = `Nivel ${level} de 4`;
  progressText.textContent = `${pct}%`;
  progressBar.style.width = `${pct}%`;
}

function nextLevel() {
  beep();
  level += 1;
  updateProgress();
  renderLevel();
}

function renderLevel() {
  if (reflexTimer) clearTimeout(reflexTimer);
  if (reflexCountdown) clearInterval(reflexCountdown);

  if (level === 1) renderLevelOne();
  if (level === 2) renderLevelTwo();
  if (level === 3) renderLevelThree();
  if (level === 4) renderLevelFour();
}

function renderLevelOne() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 01 · AUDITORÍA BOVINA</div>
      <h2>¿Cómo viene el turno?</h2>
      <p class="game-copy">Elegí la opción más cercana a tu realidad. La precisión científica es completamente opcional.</p>
      <div class="choices">
        <button class="choice-btn" data-answer="cow">🐄 Una vaca me mira como si supiera algo.</button>
        <button class="choice-btn" data-answer="milk">🥛 Estoy entre ordeñe y ordeñe.</button>
        <button class="choice-btn" data-answer="mud">👢 Ya acepté que hoy el barro ganó.</button>
        <button class="choice-btn" data-answer="fine">😎 Todo bajo control. Sospechosamente.</button>
      </div>
    </div>
  `;

  gameContent.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const replies = {
        cow: 'Esa vaca sabe demasiado. Seguimos investigando.',
        milk: 'Diagnóstico: jornada 73% leche, 27% paciencia.',
        mud: 'El barro siempre gana. Está en el reglamento.',
        fine: 'Demasiada seguridad. La inspección continúa.'
      };
      showToast(replies[btn.dataset.answer]);
      setTimeout(nextLevel, 650);
    }, { once: true });
  });
}

function renderLevelTwo() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 02 · INTENTO DE REGRESO</div>
      <h2>Bueno, volvé a trabajar.</h2>
      <p class="game-copy">Dale. Tocá el botón y terminamos con esto. Debería ser facilísimo.</p>
      <div class="paddock-zone" id="paddockZone">
        <button class="runaway-btn" id="runawayBtn">Volver con las vacas</button>
        <button class="good-btn" id="goodBtn">Bueno, 30 segundos más</button>
      </div>
    </div>
  `;

  const zone = document.getElementById('paddockZone');
  const runaway = document.getElementById('runawayBtn');
  const goodBtn = document.getElementById('goodBtn');
  let escapes = 0;

  const moveButton = () => {
    escapes += 1;
    const maxX = Math.max(20, zone.clientWidth - runaway.offsetWidth - 18);
    const maxY = Math.max(20, zone.clientHeight - runaway.offsetHeight - 78);
    runaway.style.left = `${18 + Math.random() * Math.max(1, maxX - 18)}px`;
    runaway.style.top = `${16 + Math.random() * Math.max(1, maxY - 16)}px`;
    runaway.style.transform = 'none';

    if (escapes === 2) runaway.textContent = '🐄 Te están esperando';
    if (escapes === 4) runaway.textContent = 'Dale, tambero';
    if (escapes === 6) runaway.textContent = 'La vaca te juzga';
    if (escapes === 8) runaway.textContent = 'Bueno, imposible';
    beep();
  };

  runaway.addEventListener('mouseenter', moveButton);
  runaway.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveButton();
  }, { passive: false });
  runaway.addEventListener('click', moveButton);

  goodBtn.addEventListener('click', () => {
    showToast('Excelente criterio. Las vacas pueden esperar 30 segundos.');
    nextLevel();
  }, { once: true });
}

function renderLevelThree() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 03 · REFLEJOS DE TAMBO</div>
      <h2>Atrapá la vaca.</h2>
      <p class="game-copy">Tocá la vaca todas las veces que puedas durante 8 segundos. No preguntes por qué.</p>
      <div class="scoreline">
        <span>Vacas: <strong id="score">0</strong></span>
        <span>Tiempo: <strong id="timeLeft">8.0</strong>s</span>
      </div>
      <div class="reflex-panel" id="reflexPanel">
        <button class="reflex-target" id="reflexTarget" aria-label="Atrapar vaca">🐄</button>
      </div>
    </div>
  `;

  const panel = document.getElementById('reflexPanel');
  const target = document.getElementById('reflexTarget');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('timeLeft');
  let score = 0;
  let remaining = 8.0;

  function moveTarget() {
    const maxX = panel.clientWidth - target.offsetWidth - 12;
    const maxY = panel.clientHeight - target.offsetHeight - 12;
    target.style.left = `${6 + Math.random() * Math.max(1, maxX - 6)}px`;
    target.style.top = `${6 + Math.random() * Math.max(1, maxY - 6)}px`;
  }

  target.addEventListener('click', () => {
    score += 1;
    scoreEl.textContent = score;
    beep();
    moveTarget();
  });

  moveTarget();
  const startedAt = performance.now();

  reflexCountdown = setInterval(() => {
    const elapsed = (performance.now() - startedAt) / 1000;
    remaining = Math.max(0, 8 - elapsed);
    timeEl.textContent = remaining.toFixed(1);
  }, 100);

  reflexTimer = setTimeout(() => {
    clearInterval(reflexCountdown);
    target.disabled = true;
    target.style.opacity = '0.35';

    const verdict = score >= 16
      ? 'Las vacas no tienen ninguna posibilidad contra vos.'
      : score >= 9
        ? 'Reflejos aprobados. Podés seguir siendo persona funcional.'
        : 'Creo que ya estás cansado. Diagnóstico extremadamente profesional.';

    showToast(`${score} vacas. ${verdict}`);
    setTimeout(nextLevel, 1150);
  }, 8000);
}

function renderLevelFour() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 04 · COMPENSACIÓN POR SERVICIOS RURALES</div>
      <h2>Elegí tu premio.</h2>
      <p class="game-copy">No está incluido en el sueldo. Tampoco fue aprobado por ninguna vaca.</p>
      <div class="reward-grid">
        <button class="reward-card" data-reward="Un meme premium elegido con criterios dudosos">
          <span class="reward-emoji">🫡</span>
          <strong>Meme premium</strong>
          <small>Selección artesanal. Cero garantía de calidad.</small>
        </button>
        <button class="reward-card" data-reward="Un audio mío de 30 segundos diciendo cualquier pavada">
          <span class="reward-emoji">🎙️</span>
          <strong>Audio sorpresa</strong>
          <small>Breve, innecesario y probablemente gracioso.</small>
        </button>
        <button class="reward-card" data-reward="7 minutos de break conmigo">
          <span class="reward-emoji">⏳</span>
          <strong>7 min robados</strong>
          <small>Canjeable cuando logres escapar del tambo un ratito.</small>
        </button>
      </div>
    </div>
  `;

  gameContent.querySelectorAll('.reward-card').forEach((card) => {
    card.addEventListener('click', () => {
      chosenReward = card.dataset.reward;
      finishGame();
    }, { once: true });
  });
}

function finishGame() {
  beep('win');
  voucherText.textContent = chosenReward;
  finalMessage.textContent = 'Listo. Podés volver al mundo de las vacas sabiendo que perdiste unos minutos de productividad por una causa bastante digna.';
  showScreen('final');
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight * 0.25,
    w: 5 + Math.random() * 7,
    h: 8 + Math.random() * 10,
    vy: 2.2 + Math.random() * 3.2,
    vx: -1.1 + Math.random() * 2.2,
    r: Math.random() * Math.PI,
    vr: -0.12 + Math.random() * 0.24,
    hue: [37, 93, 122, 28][Math.floor(Math.random() * 4)]
  }));

  const start = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = `hsl(${p.hue} 58% 64%)`;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (now - start < 2400) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  requestAnimationFrame(frame);
}

function resetGame() {
  level = 1;
  chosenReward = '7 minutos de break conmigo';
  copyFeedback.textContent = '';
  updateProgress();
  showScreen('intro');
}

document.getElementById('startBtn').addEventListener('click', () => {
  level = 1;
  updateProgress();
  showScreen('game');
  renderLevel();
  beep();
});

document.getElementById('replayBtn').addEventListener('click', resetGame);

document.getElementById('copyBtn').addEventListener('click', async () => {
  const text = `Reclamo oficialmente mi premio de Tambo Break: ${chosenReward} 🐄`;
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.textContent = 'Reclamo copiado. Queda presentarlo ante la autoridad competente.';
  } catch {
    copyFeedback.textContent = text;
  }
  beep();
});

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? '🔊' : '🔇';
  soundToggle.setAttribute('aria-label', soundOn ? 'Desactivar sonido' : 'Activar sonido');
  if (soundOn) beep();
});
