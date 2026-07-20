const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const scoreTwoEl = document.querySelector("#scoreTwo");
const sizeEl = document.querySelector("#size");
const highScoreEl = document.querySelector("#highScore");
const message = document.querySelector("#message");
const startButton = document.querySelector("#startButton");
const twoPlayerButton = document.querySelector("#twoPlayerButton");
const playerOneStat = document.querySelector("#playerOneStat");
const playerTwoStat = document.querySelector("#playerTwoStat");
const playerNames = document.querySelector(".player-names");
const playerOneNameInput = document.querySelector("#playerOneName");
const playerTwoNameInput = document.querySelector("#playerTwoName");
const hint = document.querySelector("#hint");

let player;
let food = [];
let score = 0;
let running = false;
let lastTime = 0;
let highScore = Number.parseInt(localStorage.getItem("boltabitiHighScore") || "0", 10) || 0;
let competition = null;

const pointer = { x: 0, y: 0 };

function resize() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  if (player) {
    player.x = Math.max(player.radius, Math.min(rect.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(rect.height - player.radius, player.y));
  }
}

function dimensions() {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function makeOrb(forceEdible = false) {
  const { width, height } = dimensions();
  const minRadius = 5;
  const maxRadius = forceEdible
    ? Math.max(minRadius, player.radius * 0.75)
    : Math.min(42, player.radius * 1.65);
  const radius = minRadius + Math.random() * Math.max(1, maxRadius - minRadius);
  let orb;

  do {
    orb = {
      x: radius + Math.random() * Math.max(1, width - radius * 2),
      y: radius + Math.random() * Math.max(1, height - radius * 2),
      radius,
      baseRadius: radius,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.7 + Math.random() * 0.8,
      pulseDepth: 0.28 + Math.random() * 0.2
    };
  } while (Math.hypot(orb.x - player.x, orb.y - player.y) < radius + player.radius + 70);

  return orb;
}

function resetRound() {
  const { width, height } = dimensions();
  player = { x: width / 2, y: height / 2, radius: 20 };
  pointer.x = player.x;
  pointer.y = player.y;
  score = 0;
  food = Array.from({ length: 18 }, (_, index) => makeOrb(index < 12));
  updateStats();
}

function updateStats() {
  scoreEl.textContent = competition?.turn === 1 ? competition.scores[0] : score;
  sizeEl.textContent = Math.round(player.radius);
  highScoreEl.textContent = highScore;
  if (competition) scoreTwoEl.textContent = competition.turn === 1 ? score : 0;
}

function setPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
}

function update(delta) {
  const { width, height } = dimensions();
  const follow = 1 - Math.pow(0.001, delta);
  player.x += (pointer.x - player.x) * follow;
  player.y += (pointer.y - player.y) * follow;
  player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

  for (let index = food.length - 1; index >= 0; index -= 1) {
    const orb = food[index];
    orb.pulse += delta * orb.pulseSpeed;
    orb.radius = orb.baseRadius * (1 + Math.sin(orb.pulse) * orb.pulseDepth);
    const touching = Math.hypot(player.x - orb.x, player.y - orb.y) < player.radius + orb.radius;
    if (!touching) continue;

    if (player.radius > orb.radius * 1.08) {
      player.radius = Math.sqrt(player.radius ** 2 + orb.radius ** 2 * 0.38);
      score += Math.max(1, Math.round(orb.radius));
      food.splice(index, 1, makeOrb(Math.random() < 0.65));
      updateStats();
    } else if (orb.radius > player.radius * 1.08) {
      endRound();
      return;
    }
  }
}

function circle(x, y, radius, fill, glow) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function draw() {
  const { width, height } = dimensions();
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#ffffff0a";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  for (const orb of food) {
    const edible = player.radius > orb.radius * 1.08;
    circle(orb.x, orb.y, orb.radius, edible ? "#6ee7a8" : "#ff6b7a", edible ? "#46dda0" : "#ff4058");
  }
  circle(player.x, player.y, player.radius, "#75b8ff", "#379bff");
  circle(player.x - player.radius * .25, player.y - player.radius * .25, player.radius * .22, "#d9efff", "transparent");
}

function frame(time) {
  const delta = Math.min((time - lastTime) / 1000, 0.035);
  lastTime = time;
  if (running) update(delta);
  draw();
  requestAnimationFrame(frame);
}

function startRound() {
  resetRound();
  playerNames.classList.add("hidden");
  message.classList.add("hidden");
  running = true;
  lastTime = performance.now();
}

function showMainChoices(text) {
  message.querySelector("p").textContent = text;
  playerNames.classList.remove("hidden");
  startButton.classList.remove("hidden");
  twoPlayerButton.classList.remove("hidden");
  startButton.textContent = "Einn leikmaður";
  twoPlayerButton.textContent = "Hefja keppni";
}

function startSinglePlayer() {
  competition = null;
  playerOneStat.firstChild.textContent = "Stig ";
  playerTwoStat.classList.add("hidden");
  hint.textContent = "Boltar stækka og minnka. Grænir eru ætir; bíddu eftir að rauðir minnki eða farðu fram hjá þeim.";
  startRound();
}

function competitionAction() {
  if (!competition) {
    competition = {
      names: [playerOneNameInput.value.trim() || "Leikmaður 1", playerTwoNameInput.value.trim() || "Leikmaður 2"],
      scores: [0, 0],
      turn: 0
    };
    playerOneStat.firstChild.textContent = `${competition.names[0]} `;
    playerTwoStat.firstChild.textContent = `${competition.names[1]} `;
    playerTwoStat.classList.remove("hidden");
    hint.textContent = `${competition.names[0]} spilar fyrst. Síðan fær ${competition.names[1]} sömu leikreglur.`;
    startRound();
    return;
  }

  if (competition.turn === 1) startRound();
}

function saveHighScore(value) {
  if (value <= highScore) return;
  highScore = value;
  localStorage.setItem("boltabitiHighScore", String(highScore));
}

function endRound() {
  running = false;
  saveHighScore(score);
  updateStats();
  message.querySelector("h2").textContent = "Leik lokið";

  if (!competition) {
    showMainChoices(`Þú fékkst ${score} stig. Hæsta skor: ${highScore}.`);
  } else if (competition.turn === 0) {
    competition.scores[0] = score;
    competition.turn = 1;
    scoreEl.textContent = competition.scores[0];
    scoreTwoEl.textContent = 0;
    message.querySelector("p").textContent = `${competition.names[0]} fékk ${score} stig. Nú er komið að ${competition.names[1]}.`;
    playerNames.classList.add("hidden");
    startButton.classList.add("hidden");
    twoPlayerButton.textContent = `${competition.names[1]} byrjar`;
  } else {
    competition.scores[1] = score;
    scoreTwoEl.textContent = score;
    const [first, second] = competition.scores;
    const result = first === second
      ? `Jafntefli, ${first}–${second}!`
      : `${competition.names[first > second ? 0 : 1]} vinnur, ${first}–${second}!`;
    competition = null;
    showMainChoices(`${result} Hæsta skor: ${highScore}.`);
  }
  message.classList.remove("hidden");
}

canvas.addEventListener("pointermove", setPointer);
canvas.addEventListener("pointerdown", setPointer);
startButton.addEventListener("click", startSinglePlayer);
twoPlayerButton.addEventListener("click", competitionAction);
window.addEventListener("resize", resize);

resize();
resetRound();
highScoreEl.textContent = highScore;
requestAnimationFrame(frame);
