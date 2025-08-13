// ---
// Destination: Mars — IMG landing + sticky + Mars meter + ramp + ground-touch grace + instant walking + horizontal clamp
// ---

// ==== Physics / State ====
let velocityY = 0;
let velocityX = 0;
let isJumping = false;

const gravity = 0.45;
const jumpHorizontalSpeed = 4.5;
const airDrag = 0.10;
const airAccel = 0.45;
const maxAirSpeed = 7;

// Key state
const keys = { left: false, right: false };

// Movement tunables
const groundStepPx = 4;               // pixels per tick while walking on ground/platform

// Image collision tunables
const platformCollisionTopInsetPx = 10; // skip transparent pixels at top of platform PNG
const bugFootOffsetPx = 55;             // adjust for transparent pixels at bottom of bug PNG

// ==== Platforms / Spawning ====
let platforms = [];
let platformSpacingCounter = 0;

const tickMs = 14;
let platformSpeed = 1.7;                // will start slower, then ramp to this
const platformSpacingPx = 120;
const maxPlatforms = 12;
const platformWidth = 100;
const spawnMargin = 16;

// NEW: clamp horizontal distance between consecutive spawns
const maxHorizontalStepPx = 140;        // ↓ lower to make platforms closer (e.g., 120, 100)
let lastSpawnX = null;                   // remember last spawn X to clamp around it

// ==== Mars Meter / Difficulty ====
const startDistance = 1000;
let distanceRemaining = startDistance;
const landingDecrement = 5;            // Mars decreases per platform landing
const slowSpeed = 1.1;                  // starting easy speed
const fastSpeed = 1.7;                  // ramped speed (your current value)
const speedRampThreshold = 500;         // when distanceRemaining <= this, use fast speed
let speedUpApplied = false;

// ==== DOM handles / Game flow ====
let gameArea;
let spaceBug;
let distanceLabel;                      // .distance-label

let hasAcknowledged = false; // clicked “Okay, got it.”
let gameStarted = false;     // pressed Space after acknowledging
let loopId = null;           // setInterval id

// Ground grace: allow exactly one safe ground touch after starting
let allowOneGroundTouch = true;
let isOnGround = false;      // track ground state to detect air->ground transitions

// ==== DOM code (browser only) ====
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {
    const $music = $('#music');
    const $musicToggle = $('#music_toggle');
    gameArea = document.querySelector('.game_area');
    spaceBug = document.querySelector('.space_bug');
    distanceLabel = document.querySelector('.distance-label');

    // Modal only on index.html
    const isHome = /(^\/$|index\.html$)/.test(window.location.pathname);
    if (isHome && gameArea) {
      showModal(
        "How to Play",
        `<p>Use ← → to move. Press Space to jump. Land on platforms to climb!<br>(Press Space after closing to start.)</p>`,
        "Okay, got it.",
        () => { hasAcknowledged = true; closeModal(); }
      );
    }

    // Center the bug; ensure numeric bottom for physics
    if (spaceBug && gameArea) {
      const bugW = spaceBug.offsetWidth || 60;
      const areaW = gameArea.offsetWidth || 600;
      spaceBug.style.left = `${(areaW - bugW) / 2}px`;

      if (!spaceBug.style.bottom) {
        const computedBottom = getComputedStyle(spaceBug).bottom || "80px";
        spaceBug.style.bottom = computedBottom;
      }
    }

    // Initialize Mars label
    updateDistanceLabel();

    // Key handlers: set flags, no immediate movement (instant walking happens each tick)
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        if (!hasAcknowledged) return;
        e.preventDefault();
        if (!gameStarted) startGame();
        else jump();
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault(); // avoid page scroll, feels snappier
        if (e.key === "ArrowLeft")  keys.left  = true;
        if (e.key === "ArrowRight") keys.right = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft")  keys.left  = false;
      if (e.key === "ArrowRight") keys.right = false;
    });

    // Seed any existing platform in markup
    const existingPlatform = document.querySelector(".platform");
    if (existingPlatform) {
      existingPlatform.style.top = "0px";
      existingPlatform.style.left = "100px";
      platforms.push(existingPlatform);
    }

    // Music toggle
    if ($music.length) {
      const music = $music[0];
      const musicOn = localStorage.getItem("music_on") === "true";
      if (musicOn) music.play().catch(() => {}); else music.pause();

      if ($musicToggle.length) {
        $musicToggle.prop("checked", musicOn);
        $musicToggle.on("change", function () {
          localStorage.setItem("music_on", this.checked);
          handleMusicToggle(this, music);
        });
      }
    }
  });
}

// ==== Modal helpers (re-use #howto_box) ====
function showModal(titleHTML, bodyHTML, buttonText, onClick) {
  const overlay = document.getElementById("howto_box");
  if (!overlay) return;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");

  const box = overlay.querySelector(".howto-box");
  if (box) {
    box.innerHTML = `
      <h2>${titleHTML}</h2>
      <div class="howto-body">${bodyHTML}</div>
      <button id="howto_ok" class="howto-btn">${buttonText}</button>
    `;
    const okBtn = box.querySelector("#howto_ok");
    if (okBtn) okBtn.onclick = onClick;
  }
}
function closeModal() {
  const overlay = document.getElementById("howto_box");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
}

// ==== Music toggle ====
function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) audio.play(); else audio.pause();
}

// ==== Platform creation ====
function createPlatform(x, y) {
  const platform = document.createElement("div");
  platform.className = "platform";
  platform.style.left = `${x}px`;
  platform.style.top = `${y}px`;

  const img = document.createElement("img");
  img.src = "assets/images/space_rock_platform.png";
  img.alt = "space platform";
  platform.appendChild(img);

  const area = document.querySelector(".game_area");
  area.appendChild(platform);

  platforms.push(platform);
  return platform;
}

// ==== Ground walking each tick (instant, continuous while standing) ====
function setBugFacing(dir) {
  const img = spaceBug?.querySelector("img");
  if (!img) return;
  const want = dir === "left"
    ? "assets/images/space_bug_left.PNG"
    : "assets/images/space_bug_right.PNG";
  if (!img.src.includes(dir === "left" ? "left" : "right")) img.src = want;
}

function applyGroundMovement() {
  if (!gameStarted || !spaceBug || !gameArea) return;
  if (isJumping) return; // only walk when standing on ground/platform (sticky)

  let left = parseFloat(spaceBug.style.left || "0");
  const maxLeft = gameArea.clientWidth - (spaceBug.offsetWidth || 60);

  if (keys.left && !keys.right) {
    left = Math.max(0, left - groundStepPx);
    setBugFacing("left");
  } else if (keys.right && !keys.left) {
    left = Math.min(maxLeft, left + groundStepPx);
    setBugFacing("right");
  }
  spaceBug.style.left = `${left}px`;
}

// ==== (Legacy) Ground move helpers use the same step (kept for completeness) ====
function moveLeft(el) {
  const left = parseInt(el.style.left, 10) || 0;
  el.style.left = `${Math.max(0, left - groundStepPx)}px`;
  const img = el.querySelector("img");
  if (img && !img.src.includes("space_bug_left.PNG")) {
    img.src = "assets/images/space_bug_left.PNG";
  }
}
function moveRight(el) {
  const left = parseInt(el.style.left, 10) || 0;
  const maxLeft = (gameArea?.clientWidth || left) - (el.offsetWidth || 60);
  el.style.left = `${Math.min(maxLeft, left + groundStepPx)}px`;
  const img = el.querySelector("img");
  if (img && !img.src.includes("space_bug_right.PNG")) {
    img.src = "assets/images/space_bug_right.PNG";
  }
}

// ==== Jump ====
function jump() {
  if (isJumping) return;
  velocityY = -14;
  isJumping = true;

  if (keys.left && !keys.right)      velocityX = -jumpHorizontalSpeed;
  else if (keys.right && !keys.left) velocityX =  jumpHorizontalSpeed;
  else                                velocityX =  0; // straight up if still
}

// ==== Physics (vertical + IMG landing + sticky + bounds) ====
function applyGravity() {
  if (!spaceBug || !gameArea) return;

  const bugW  = spaceBug.offsetWidth || 60;

  // Sticky standing on platform image
  if (!isJumping) {
    const supportBottom = getSupportBottomOnImage(bugW); // null if no support
    if (supportBottom != null) {
      isOnGround = false; // definitely not on ground while on a platform
      spaceBug.style.bottom = `${supportBottom}px`;
      velocityY = 0;
      const leftClamp = Math.max(0, Math.min(parseFloat(spaceBug.style.left || "0"), gameArea.clientWidth - bugW));
      spaceBug.style.left = `${leftClamp}px`;
      return;
    }
  }

  // Vertical integration (falling or in-air)
  const prevBottom = parseFloat(spaceBug.style.bottom || "80");
  velocityY += gravity;
  let nextBottom = prevBottom - velocityY; // positive velocityY moves bug down

  // Try to land on a platform image while falling
  if (velocityY > 0) {
    const landing = getLandingBottomOnImageMoving(prevBottom, nextBottom, bugW);
    if (landing) {
      isOnGround = false; // landing on platform, not ground
      nextBottom = landing.bottom;
      velocityY = 0;
      isJumping = false;
      velocityX = 0;

      // Progress toward Mars
      applyLandingProgress();
    }
  }

  // --- ground handling (only on air -> ground transition) ---
  if (nextBottom <= 0) {
    nextBottom = 0;

    const wasInAir = !isOnGround; // prior state
    isOnGround = true;

    spaceBug.style.bottom = `${nextBottom}px`;

    if (gameStarted && wasInAir) {
      if (allowOneGroundTouch) {
        // First ground touch after start is safe; consume it
        allowOneGroundTouch = false;
        velocityY = 0;
        isJumping = false;
        velocityX = 0;
        return;
      } else {
        gameOver();
        return;
      }
    }
    // If we were already on ground, nothing else to do.
  } else {
    // We’re in the air
    isOnGround = false;
    spaceBug.style.bottom = `${nextBottom}px`;
  }

  // Horizontal integration + mid-air steering
  let left = parseFloat(spaceBug.style.left || "0");

  if (isJumping) {
    if (keys.left && !keys.right) {
      velocityX = Math.max(-maxAirSpeed, velocityX - airAccel);
    } else if (keys.right && !keys.left) {
      velocityX = Math.min(maxAirSpeed, velocityX + airAccel);
    } else {
      if (velocityX > 0)      velocityX = Math.max(0, velocityX - airDrag);
      else if (velocityX < 0) velocityX = Math.min(0, velocityX + airDrag);
    }
  }

  left += velocityX;
  left = Math.max(0, Math.min(left, gameArea.clientWidth - bugW)); // clamp
  spaceBug.style.left = `${left}px`;
}

// ==== Landing progress / UI ====
function applyLandingProgress() {
  if (distanceRemaining <= 0) return;
  distanceRemaining = Math.max(0, distanceRemaining - landingDecrement);
  updateDistanceLabel();

  // Speed ramp
  if (!speedUpApplied && distanceRemaining <= speedRampThreshold) {
    platformSpeed = fastSpeed;
    speedUpApplied = true;
  }

  // Win condition
  if (distanceRemaining === 0) {
    youWin();
  }
}

function updateDistanceLabel() {
  if (!distanceLabel) return;
  distanceLabel.textContent = `Mars: ${distanceRemaining}`;
}

// ==== Win / Game Over / Reset ====
function youWin() {
  stopLoop();
  gameStarted = false;
  const score = startDistance - distanceRemaining; // should be 1000 here
  showModal(
    "You made it to Mars!",
    `<p>Your score: <strong>${score}</strong></p><p>Press “Restart” and then Space to play again.</p>`,
    "Restart",
    () => { closeModal(); resetGameState(); }
  );
}

function gameOver() {
  stopLoop();
  gameStarted = false;
  isJumping = false;
  const score = startDistance - distanceRemaining;
  showModal(
    "Game Over",
    `<p>Your score: <strong>${score}</strong></p><p>Press “Restart” and then Space to try again.</p>`,
    "Restart",
    () => { closeModal(); resetGameState(); }
  );
}

function resetGameState() {
  // Reset meters & speed ramp
  distanceRemaining = startDistance;
  speedUpApplied = false;
  platformSpeed = slowSpeed;
  updateDistanceLabel();

  // Reset player
  velocityX = 0; velocityY = 0; isJumping = false;
  if (spaceBug && gameArea) {
    const bugW = spaceBug.offsetWidth || 60;
    const areaW = gameArea.offsetWidth || 600;
    spaceBug.style.left = `${(areaW - bugW) / 2}px`;
    spaceBug.style.bottom = "80px";

    // Seed first spawn near the bug’s start so it’s reachable
    const bugLeft = parseFloat(spaceBug.style.left || "0");
    lastSpawnX = bugLeft + bugW / 2 - platformWidth / 2;
  } else {
    lastSpawnX = null;
  }

  // Clear platforms
  const area = gameArea || document.querySelector(".game_area");
  if (area) {
    platforms.forEach(p => { if (p.parentNode === area) area.removeChild(p); });
  }
  platforms = [];
  platformSpacingCounter = 0;

  // Restore ground grace for the next run
  allowOneGroundTouch = true;
  isOnGround = false;

  // Wait for Space to start
  hasAcknowledged = true;
  gameStarted = false;
}

// ==== Loop control ====
function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  // Start easy, then ramp later
  platformSpeed = slowSpeed;
  speedUpApplied = false;

  // Ground grace setup
  allowOneGroundTouch = true;
  isOnGround = false;

  // Seed first spawn near the bug so it’s reachable
  if (spaceBug && gameArea) {
    const bugW = spaceBug.offsetWidth || 60;
    const bugLeft = parseFloat(spaceBug.style.left || "0");
    lastSpawnX = bugLeft + bugW / 2 - platformWidth / 2;
  } else {
    lastSpawnX = null;
  }

  if (!loopId) loopId = startLoop();
}
function stopLoop() {
  if (loopId) {
    clearInterval(loopId);
    loopId = null;
  }
}

// ==== Main loop ====
function startLoop() {
  return setInterval(() => {
    updatePlatforms();      // platforms move down first
    applyGroundMovement();  // instant walking while standing (no key-repeat lag)
    applyGravity();         // then resolve player movement/landing

    // spawn after travel distance
    platformSpacingCounter += platformSpeed;
    if (platformSpacingCounter >= platformSpacingPx && platforms.length < maxPlatforms) {
      generatePlatform();
      platformSpacingCounter = 0;
    }
  }, tickMs);
}

// ==== Support / Landing helpers ====
function getSupportBottomOnImage(bugW, supportEps = 8) {
  const area = gameArea;
  const areaRect = area.getBoundingClientRect();
  const areaH = area.clientHeight;
  const offX = area.clientLeft;
  const offY = area.clientTop;

  const bugLeft  = parseFloat(spaceBug.style.left || "0");
  const bugRight = bugLeft + bugW;
  const currentBottom = parseFloat(spaceBug.style.bottom || "0");

  let bestBottom = null;
  let bestDelta = Infinity;

  for (let i = 0; i < platforms.length; i++) {
    const imgEl = platforms[i].querySelector('img');
    if (!imgEl) continue;

    const r = imgEl.getBoundingClientRect();
    const currTop  = (r.top - areaRect.top - offY) + platformCollisionTopInsetPx;
    const imgLeft  = (r.left - areaRect.left - offX);
    const imgRight = imgLeft + r.width;

    if (!(bugRight > imgLeft && bugLeft < imgRight)) continue;

    const desiredBottom = Math.max(0, areaH - currTop - bugFootOffsetPx);
    const delta = Math.abs(desiredBottom - currentBottom);

    if (desiredBottom <= currentBottom + supportEps && delta < bestDelta) {
      bestDelta = delta;
      bestBottom = desiredBottom;
    }
  }

  return (bestDelta <= supportEps) ? bestBottom : null;
}

function getLandingBottomOnImageMoving(prevBottom, nextBottom, bugW) {
  const area = gameArea;
  const areaRect = area.getBoundingClientRect();
  const areaH = area.clientHeight;
  const offX = area.clientLeft;
  const offY = area.clientTop;
  const EPS = 4;

  const prevFeet = areaH - prevBottom;
  const nextFeet = areaH - nextBottom;

  const bugLeft  = parseFloat(spaceBug.style.left || "0");
  const bugRight = bugLeft + bugW;

  let best = null;
  let closestDelta = Infinity;

  for (let i = 0; i < platforms.length; i++) {
    const plat = platforms[i];
    const imgEl = plat.querySelector('img');
    if (!imgEl) continue;

    const r = imgEl.getBoundingClientRect();

    let currTop  = (r.top  - areaRect.top  - offY);
    const imgLeft  = (r.left - areaRect.left - offX);
    const imgRight = imgLeft + r.width;

    const overlapsX = bugRight > imgLeft && bugLeft < imgRight;
    if (!overlapsX) continue;

    currTop += platformCollisionTopInsetPx;     // skip transparent top
    const prevTop = currTop - platformSpeed;    // previous tick

    const crossed = (prevFeet <= prevTop + EPS) && (nextFeet >= currTop - EPS);
    if (crossed) {
      const candidateBottom = Math.max(0, areaH - currTop - bugFootOffsetPx);
      const midTop = (prevTop + currTop) * 0.5;
      const delta = Math.abs(midTop - prevFeet);
      if (delta < closestDelta) {
        closestDelta = delta;
        best = { bottom: candidateBottom, platformEl: plat };
      }
    }
  }

  return best;
}

// ==== Platforms ====
function updatePlatforms() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const areaH = area.clientHeight;

  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];
    const top = parseFloat(platform.style.top || `${platform.offsetTop}`) || 0;
    const newTop = top + platformSpeed;
    const h = platform.offsetHeight || 0;

    if (newTop >= areaH - h) {
      area.removeChild(platform);
      platforms.splice(i, 1);
    } else {
      platform.style.top = `${newTop}px`;
    }
  }
}

// NEW: clamp spawn X within a window around the previous platform (or bug at start)
function generatePlatform() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const areaW = area.clientWidth;
  const minWall = spawnMargin;
  const maxWall = areaW - platformWidth - spawnMargin;

  // If we don’t have a previous platform yet, use the bug as reference
  const bugLeft  = parseFloat(spaceBug?.style.left || "0");
  const bugW     = spaceBug?.offsetWidth || 60;
  const bugCenterX = bugLeft + bugW / 2;

  const refX = (lastSpawnX != null)
    ? lastSpawnX
    : (bugCenterX - platformWidth / 2);

  // Window around refX (clamped to walls)
  const windowMin = Math.max(minWall, refX - maxHorizontalStepPx);
  const windowMax = Math.min(maxWall, refX + maxHorizontalStepPx);

  // Safety in case margins make the window collapse
  const minX = Math.min(windowMin, windowMax);
  const maxX = Math.max(windowMin, windowMax);

  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  lastSpawnX = x; // remember for the next spawn

  const y = 0;
  createPlatform(x, y);
}

// ==== Exports (for tests) ====
if (typeof module !== "undefined") {
  module.exports = {
    handleMusicToggle,
    moveLeft,
    moveRight,
    createPlatform,
    updatePlatforms,
    startLoop: startLoop, // start via startGame()
    generatePlatform,
    applyGravity,
  };
}
