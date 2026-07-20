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

let players = [];
let food = [];
let mode = "single";
let running = false;
let lastTime = 0;
let highScore = Number.parseInt(localStorage.getItem("boltabitiHighScore") || "0", 10) || 0;
const pointer = { x: 0, y: 0 };
const keys = new Set();

function dimensions() {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  for (const player of players) keepOnBoard(player, rect.width, rect.height);
}

function keepOnBoard(player, width, height) {
  player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));
}

function newPlayer(name, x, y, color, glow, controls = null) {
  return { name, x, y, radius: 20, score: 0, color, glow, controls, alive: true };
}

function makeOrb(forceEdible = false) {
  const { width, height } = dimensions();
  const living = players.filter((player) => player.alive);
  const referenceRadius = Math.max(20, ...living.map((player) => player.radius));
  const minRadius = 5;
  const maxRadius = forceEdible ? Math.max(minRadius, referenceRadius * 0.75) : Math.min(42, referenceRadius * 1.65);
  const radius = minRadius + Math.random() * Math.max(1, maxRadius - minRadius);
  let orb;

  // Never search forever for an empty spot when a large player fills the board.
  for (let attempt = 0; attempt < 80; attempt += 1) {
    orb = {
      x: radius + Math.random() * Math.max(1, width - radius * 2),
      y: radius + Math.random() * Math.max(1, height - radius * 2),
      radius,
      baseRadius: radius,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.7 + Math.random() * 0.8,
      pulseDepth: 0.28 + Math.random() * 0.2
    };
    const safe = living.every((player) => Math.hypot(orb.x - player.x, orb.y - player.y) >= radius + player.radius + 35);
    if (safe) return orb;
  }
  return orb;
}

function resetRound(selectedMode) {
  mode = selectedMode;
  const { width, height } = dimensions();
  if (mode === "versus") {
    const nameOne = playerOneNameInput.value.trim() || "Leikmaður 1";
    const nameTwo = playerTwoNameInput.value.trim() || "Leikmaður 2";
    players = [
      newPlayer(nameOne, width * 0.25, height / 2, "#75b8ff", "#379bff", ["KeyW", "KeyS", "KeyA", "KeyD"]),
      newPlayer(nameTwo, width * 0.75, height / 2, "#d6a8ff", "#a45cff", ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])
    ];
  } else {
    players = [newPlayer("Leikmaður", width / 2, height / 2, "#75b8ff", "#379bff")];
    pointer.x = players[0].x;
    pointer.y = players[0].y;
  }
  food = Array.from({ length: 18 }, (_, index) => makeOrb(index < 12));
  updateStats();
}

function updateStats() {
  scoreEl.textContent = players[0]?.score ?? 0;
  scoreTwoEl.textContent = players[1]?.score ?? 0;
  sizeEl.textContent = Math.round(players[0]?.radius ?? 20);
  highScoreEl.textContent = highScore;
}

function setPointer(event) {
  if (mode !== "single") return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
}

function movePlayers(delta) {
  const { width, height } = dimensions();
  if (mode === "single") {
    const player = players[0];
    const follow = 1 - Math.pow(0.001, delta);
    player.x += (pointer.x - player.x) * follow;
    player.y += (pointer.y - player.y) * follow;
  } else {
    for (const player of players) {
      if (!player.alive) continue;
      const [up, down, left, right] = player.controls;
      let dx = Number(keys.has(right)) - Number(keys.has(left));
      let dy = Number(keys.has(down)) - Number(keys.has(up));
      if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
      player.x += dx * 230 * delta;
      player.y += dy * 230 * delta;
    }
  }
  for (const player of players) keepOnBoard(player, width, height);
}

function update(delta) {
  movePlayers(delta);
  for (const orb of food) {
    orb.pulse += delta * orb.pulseSpeed;
    orb.radius = orb.baseRadius * (1 + Math.sin(orb.pulse) * orb.pulseDepth);
  }

  for (const player of players) {
    if (!player.alive) continue;
    for (let index = food.length - 1; index >= 0; index -= 1) {
      const orb = food[index];
      if (Math.hypot(player.x - orb.x, player.y - orb.y) >= player.radius + orb.radius) continue;
      if (player.radius > orb.radius * 1.08) {
        player.radius = Math.sqrt(player.radius ** 2 + orb.radius ** 2 * 0.38);
        player.score += Math.max(1, Math.round(orb.radius));
        food.splice(index, 1, makeOrb(Math.random() < 0.65));
        updateStats();
      } else if (orb.radius > player.radius * 1.08) {
        player.alive = false;
        if (mode === "single") { endRound(); return; }
        break;
      }
    }
  }
  if (mode === "versus" && players.some((player) => !player.alive)) endRound();
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
  const largest = Math.max(20, ...players.filter((player) => player.alive).map((player) => player.radius));
  for (const orb of food) {
    const edible = largest > orb.radius * 1.08;
    circle(orb.x, orb.y, orb.radius, edible ? "#6ee7a8" : "#ff6b7a", edible ? "#46dda0" : "#ff4058");
  }
  for (const player of players) {
    if (!player.alive) continue;
    circle(player.x, player.y, player.radius, player.color, player.glow);
    circle(player.x - player.radius * .25, player.y - player.radius * .25, player.radius * .22, "#d9efff", "transparent");
  }
}

function frame(time) {
  const delta = Math.min(Math.max(0, (time - lastTime) / 1000), 0.035);
  lastTime = time;
  if (running) update(delta);
  draw();
  requestAnimationFrame(frame);
}

function startRound(selectedMode) {
  resetRound(selectedMode);
  playerNames.classList.add("hidden");
  message.classList.add("hidden");
  running = true;
  lastTime = performance.now();
}

function showMainChoices(text) {
  message.querySelector("h2").textContent = "Leik lokið";
  message.querySelector("p").textContent = text;
  playerNames.classList.remove("hidden");
  startButton.classList.remove("hidden");
  twoPlayerButton.classList.remove("hidden");
  startButton.textContent = "Spila aftur einn";
  twoPlayerButton.textContent = "Ný tveggja manna keppni";
  message.classList.remove("hidden");
}

function startSinglePlayer() {
  playerOneStat.firstChild.textContent = "Stig ";
  playerTwoStat.classList.add("hidden");
  hint.textContent = "Stýrðu með mús eða fingri. Grænir boltar eru ætir; forðastu rauða.";
  startRound("single");
}

function startCompetition() {
  const nameOne = playerOneNameInput.value.trim() || "Leikmaður 1";
  const nameTwo = playerTwoNameInput.value.trim() || "Leikmaður 2";
  playerOneStat.firstChild.textContent = `${nameOne} `;
  playerTwoStat.firstChild.textContent = `${nameTwo} `;
  playerTwoStat.classList.remove("hidden");
  hint.textContent = `${nameOne}: WASD · ${nameTwo}: örvatakkar. Sá sem lifir lengur vinnur; stig ráða ef báðir falla.`;
  startRound("versus");
}

function saveHighScore(value) {
  if (value <= highScore) return;
  highScore = value;
  localStorage.setItem("boltabitiHighScore", String(highScore));
}

function endRound() {
  if (!running) return;
  running = false;
  keys.clear();
  for (const player of players) saveHighScore(player.score);
  updateStats();
  if (mode === "single") {
    showMainChoices(`Þú fékkst ${players[0].score} stig. Hæsta skor: ${highScore}.`);
    return;
  }

  const [first, second] = players;
  let result;
  if (first.alive !== second.alive) result = `${first.alive ? first.name : second.name} vinnur!`;
  else if (first.score === second.score) result = `Jafntefli, ${first.score}–${second.score}!`;
  else result = `${first.score > second.score ? first.name : second.name} vinnur, ${first.score}–${second.score}!`;
  showMainChoices(`${result} Hæsta skor: ${highScore}.`);
}

canvas.addEventListener("pointermove", setPointer);
canvas.addEventListener("pointerdown", setPointer);
startButton.addEventListener("click", startSinglePlayer);
twoPlayerButton.addEventListener("click", startCompetition);
window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", resize);

resize();
resetRound("single");
highScoreEl.textContent = highScore;
requestAnimationFrame(frame);
