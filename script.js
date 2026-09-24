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
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 1600);
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
  osc.frequency.setValueAtTime(type === 'win' ? 620 : 330, ctx.currentTime);
  if (type === 'win') osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 0.01);
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
      <div class="game-kicker">NIVEL 01 · CONTROL DE DAÑOS</div>
      <h2>Elegí tu situación actual.</h2>
      <p class="game-copy">No hay respuesta correcta. Hay respuestas más preocupantes que otras.</p>
      <div class="choices">
        <button class="choice-btn" data-answer="mail">📩 Tengo 14 mails que dicen “rapidito”.</button>
        <button class="choice-btn" data-answer="meeting">🧑‍💻 Estoy en una reunión que pudo ser un mail.</button>
        <button class="choice-btn" data-answer="focus">🧠 Estoy fingiendo concentración profesional.</button>
        <button class="choice-btn" data-answer="fine">😎 Estoy impecable. Este test me ofende.</button>
      </div>
    </div>
  `;

  gameContent.querySelectorAll('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const replies = {
        mail: 'Diagnóstico: exceso de “rapiditos”. Grave.',
        meeting: 'Confirmado: delito corporativo menor.',
        focus: 'La actuación merece premio.',
        fine: 'Qué seguridad. La auditoría continúa igual.'
      };
      showToast(replies[btn.dataset.answer]);
      setTimeout(nextLevel, 620);
    }, { once: true });
  });
}

function renderLevelTwo() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 02 · EVASIÓN</div>
      <h2>Intentá seguir trabajando.</h2>
      <p class="game-copy">Ese es literalmente el objetivo. Te debería resultar facilísimo.</p>
      <div class="office-zone" id="officeZone">
        <button class="runaway-btn" id="runawayBtn">Seguir trabajando</button>
        <button class="good-btn" id="goodBtn">Bueno, mini break</button>
      </div>
    </div>
  `;

  const zone = document.getElementById('officeZone');
  const runaway = document.getElementById('runawayBtn');
  const goodBtn = document.getElementById('goodBtn');
  let escapes = 0;

  const moveButton = () => {
    escapes += 1;
    const maxX = Math.max(15, zone.clientWidth - runaway.offsetWidth - 15);
    const maxY = Math.max(15, zone.clientHeight - runaway.offsetHeight - 70);
    runaway.style.left = `${15 + Math.random() * (maxX - 15)}px`;
    runaway.style.top = `${15 + Math.random() * (maxY - 15)}px`;
    runaway.style.transform = 'none';
    if (escapes === 2) runaway.textContent = 'Dale, trabajá';
    if (escapes === 4) runaway.textContent = '¿En serio?';
    if (escapes === 6) runaway.textContent = 'Último intento';
    beep();
  };

  runaway.addEventListener('mouseenter', moveButton);
  runaway.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveButton();
  }, { passive: false });
  runaway.addEventListener('click', moveButton);

  goodBtn.addEventListener('click', () => {
    showToast('Decisión sorprendentemente sensata.');
    nextLevel();
  }, { once: true });
}

function renderLevelThree() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 03 · REFLEJOS POST-OFICINA</div>
      <h2>Prueba científica totalmente inventada.</h2>
      <p class="game-copy">Tocá el botón naranja todas las veces que puedas durante 8 segundos.</p>
      <div class="scoreline">
        <span>Puntos: <strong id="score">0</strong></span>
        <span>Tiempo: <strong id="timeLeft">8.0</strong>s</span>
      </div>
      <div class="reflex-panel" id="reflexPanel">
        <button class="reflex-target" id="reflexTarget">tocá</button>
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
      ? 'Sos peligrosamente bueno evitando trabajar.'
      : score >= 9
        ? 'Nivel de distracción: saludable.'
        : 'Claramente seguís pensando en el trabajo. Preocupante.';
    showToast(`${score} puntos. ${verdict}`);
    setTimeout(nextLevel, 1050);
  }, 8000);
}

function renderLevelFour() {
  gameContent.innerHTML = `
    <div class="game-card">
      <div class="game-kicker">NIVEL 04 · COMPENSACIÓN</div>
      <h2>Elegí tu premio.</h2>
      <p class="game-copy">La empresa no lo aprobó. Por suerte, no trabaja acá.</p>
      <div class="reward-grid">
        <button class="reward-card" data-reward="Un meme premium, elegido con criterios cuestionables">
          <span class="reward-emoji">🫡</span>
          <strong>Meme premium</strong>
          <small>Curaduría artesanal. Cero garantía de buen gusto.</small>
        </button>
        <button class="reward-card" data-reward="Un audio mío de 30 segundos diciendo cualquier pavada">
          <span class="reward-emoji">🎙️</span>
          <strong>Audio sorpresa</strong>
          <small>Máximo 30 segundos. Probablemente innecesario.</small>
        </button>
        <button class="reward-card" data-reward="7 minutos de break conmigo">
          <span class="reward-emoji">⏳</span>
          <strong>7 min robados</strong>
          <small>Canjeable cuando logres escaparte del trabajo.</small>
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
  finalMessage.textContent = 'Tu jornada sigue, sí. Pero ahora oficialmente fue interrumpida por motivos importantes y totalmente serios.';
  showScreen('final');
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: 95 }, () => ({
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight * 0.25,
    w: 5 + Math.random() * 7,
    h: 8 + Math.random() * 10,
    vy: 2.3 + Math.random() * 3.2,
    vx: -1.1 + Math.random() * 2.2,
    r: Math.random() * Math.PI,
    vr: -0.12 + Math.random() * 0.24,
    hue: [28, 166, 345, 215][Math.floor(Math.random() * 4)]
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
      ctx.fillStyle = `hsl(${p.hue} 85% 68%)`;
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
  const text = `Reclamo oficialmente mi premio de Break.exe: ${chosenReward} 😌`;
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.textContent = 'Reclamo copiado. Ahora queda presentarlo ante la autoridad correspondiente.';
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

window.addEventListener('resize', () => {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width = innerWidth * (window.devicePixelRatio || 1);
  canvas.height = innerHeight * (window.devicePixelRatio || 1);
});
