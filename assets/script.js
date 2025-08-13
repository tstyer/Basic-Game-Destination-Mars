// --- Destination: Mars - precise IMG landing (with bug foot offset) ---

// ==== Physics / State ====
let velocityY = 0;
let velocityX = 0;
let isJumping = false;

const gravity = 0.45;
const jumpHorizontalSpeed = 4.5;
const airDrag = 0.10;
const airAccel = 0.45;
const maxAirSpeed = 7;

// Which keys are held?
const keys = { left: false, right: false };

// Tunables:
// Skip transparent pixels at top of platform PNG when landing:
const platformCollisionTopInsetPx = 10;   // try 8–16
// If your bug PNG has transparent pixels at the bottom, nudge feet down:
const bugFootOffsetPx = 55;               // try 4–10

// ==== Platforms / Spawning ====
let platforms = [];
let platformSpacingCounter = 0;

const tickMs = 14;
let platformSpeed = 1.7;
const platformSpacingPx = 120;
const maxPlatforms = 12;
const platformWidth = 100;
const spawnMargin = 16;

// ==== DOM handles / Game flow ====
let gameArea;
let spaceBug;

let hasAcknowledged = false; // clicked “Okay, got it.”
let gameStarted = false;     // pressed Space after acknowledging
let loopId = null;           // setInterval id

// ==== DOM code (browser only) ====
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {
    const $music = $('#music');
    const $musicToggle = $('#music_toggle');
    gameArea = document.querySelector('.game_area');
    spaceBug = document.querySelector('.space_bug');

    // Modal only on index.html
    const isHome = /(^\/$|index\.html$)/.test(window.location.pathname);
    if (isHome && gameArea) {
      const modal = document.getElementById("howto_box");
      const okBtn = document.getElementById("howto_ok");
      if (modal && okBtn) {
        modal.classList.add("is-open");
        okBtn.addEventListener("click", () => {
          hasAcknowledged = true;
          modal.classList.remove("is-open");
          modal.setAttribute("aria-hidden", "true");
        });
      }
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

    // Single keyboard pipeline
    document.addEventListener("keydown", (e) => {
      // Space: start after OK, later = jump
      if (e.code === "Space") {
        if (!hasAcknowledged) return;
        e.preventDefault();
        if (!gameStarted) startGame();
        else jump();
        return;
      }

      if (e.key === "ArrowLeft")  keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;

      if (!gameStarted) return;
      if (e.key === "ArrowLeft")  moveLeft(spaceBug);
      if (e.key === "ArrowRight") moveRight(spaceBug);
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft")  keys.left = false;
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

// ==== Functions ====

// Music toggle
function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) audio.play(); else audio.pause();
}

// Create platform
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

// Ground move left/right
function moveLeft(el) {
  const left = parseInt(el.style.left, 10) || 0;
  el.style.left = `${Math.max(0, left - 5)}px`;
  const img = el.querySelector("img");
  if (img && !img.src.includes("space_bug_left.PNG")) {
    img.src = "assets/images/space_bug_left.PNG";
  }
}
function moveRight(el) {
  const left = parseInt(el.style.left, 10) || 0;
  const maxLeft = (gameArea?.clientWidth || left) - (el.offsetWidth || 60);
  el.style.left = `${Math.min(maxLeft, left + 5)}px`;
  const img = el.querySelector("img");
  if (img && !img.src.includes("space_bug_right.PNG")) {
    img.src = "assets/images/space_bug_right.PNG";
  }
}

// Jump (initial sideways push depending on held key)
function jump() {
  if (isJumping) return;
  velocityY = -14;
  isJumping = true;

  if (keys.left && !keys.right)      velocityX = -jumpHorizontalSpeed;
  else if (keys.right && !keys.left) velocityX =  jumpHorizontalSpeed;
  else                                velocityX =  0; // straight up if still
}

// Physics (vertical + IMG landing + mid-air steer + bounds)
function applyGravity() {
  if (!spaceBug || !gameArea) return;

  const areaH = gameArea.clientHeight;
  const bugW  = spaceBug.offsetWidth || 60;

  // --- vertical integration ---
  const prevBottom = parseFloat(spaceBug.style.bottom || "80");
  velocityY += gravity;
  let nextBottom = prevBottom - velocityY; // positive velocityY moves bug down

  // Try to land on a platform image only while falling
  if (velocityY > 0) {
    const landedBottom = getLandingBottomOnImageMoving(prevBottom, nextBottom, bugW);
    if (landedBottom != null) {
      nextBottom = landedBottom; // snap feet to image (with insets)
      velocityY = 0;
      isJumping = false;
      velocityX = 0; // remove if you want momentum on landing
    }
  }

  // Ground clamp
  if (nextBottom <= 0) {
    nextBottom = 0;
    velocityY = 0;
    isJumping = false;
    velocityX = 0;
  }

  spaceBug.style.bottom = `${nextBottom}px`;

  // --- horizontal integration + mid-air steering ---
  let left = parseFloat(spaceBug.style.left || "0");

  if (isJumping) {
    if (keys.left && !keys.right) {
      velocityX = Math.max(-maxAirSpeed, velocityX - airAccel);
    } else if (keys.right && !keys.left) {
      velocityX = Math.min(maxAirSpeed, velocityX + airAccel);
    } else {
      // no arrow: bleed speed gently
      if (velocityX > 0)      velocityX = Math.max(0, velocityX - airDrag);
      else if (velocityX < 0) velocityX = Math.min(0, velocityX + airDrag);
    }
  }

  left += velocityX;
  left = Math.max(0, Math.min(left, gameArea.clientWidth - bugW)); // clamp
  spaceBug.style.left = `${left}px`;
}

// Precise landing on the *image* while platforms move.
// Measures image in the game area's padding box; subtracts border (clientTop/Left).
function getLandingBottomOnImageMoving(prevBottom, nextBottom, bugW) {
  const area = gameArea;
  const areaRect = area.getBoundingClientRect();
  const areaH = area.clientHeight;     // content height (no border)
  const offX = area.clientLeft;        // border-left width
  const offY = area.clientTop;         // border-top width
  const EPS = 4;

  // Bug feet from TOP of game area padding box
  const prevFeet = areaH - prevBottom;
  const nextFeet = areaH - nextBottom;

  // Bug horizontal span (already relative to padding box)
  const bugLeft  = parseFloat(spaceBug.style.left || "0");
  const bugRight = bugLeft + bugW;

  let snapBottom = null;
  let closestDelta = Infinity;

  for (let i = 0; i < platforms.length; i++) {
    const plat = platforms[i];
    const imgEl = plat.querySelector('img');
    if (!imgEl) continue;

    const r = imgEl.getBoundingClientRect();

    // Image position relative to game area's padding box
    let currTop  = (r.top  - areaRect.top  - offY);
    const imgLeft  = (r.left - areaRect.left - offX);
    const imgRight = imgLeft + r.width;

    // Horizontal overlap with the IMAGE only
    const overlapsX = bugRight > imgLeft && bugLeft < imgRight;
    if (!overlapsX) continue;

    // Push collision plane *inside* the image & account for platform motion
    currTop += platformCollisionTopInsetPx;            // skip transparent top
    const prevTop = currTop - platformSpeed;           // where it was last tick

    // Did the feet cross the moving top segment this tick?
    const crossed = (prevFeet <= prevTop + EPS) && (nextFeet >= currTop - EPS);
    if (crossed) {
      // Snap feet onto image line, minus bugFootOffset (to counter transparent bug bottom)
      const candidateBottom = Math.max(0, areaH - currTop - bugFootOffsetPx);

      const midTop = (prevTop + currTop) * 0.5;
      const delta = Math.abs(midTop - prevFeet);
      if (delta < closestDelta) {
        closestDelta = delta;
        snapBottom = candidateBottom;
      }
    }
  }

  return snapBottom;
}

// Move platforms (and despawn at bottom line)
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

// Main loop — move platforms first, then physics
function startLoop() {
  return setInterval(() => {
    updatePlatforms();   // platforms move down first
    applyGravity();      // then resolve player movement/landing

    // spawn after travel distance
    platformSpacingCounter += platformSpeed;
    if (platformSpacingCounter >= platformSpacingPx && platforms.length < maxPlatforms) {
      generatePlatform();
      platformSpacingCounter = 0;
    }
  }, tickMs);
}

// Start game (once)
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  if (!loopId) loopId = startLoop();
}

// Spawn platform at random X across area (with margins)
function generatePlatform() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const minX = spawnMargin;
  const maxX = Math.max(minX, area.clientWidth - platformWidth - spawnMargin);

  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const y = 0;
  createPlatform(x, y);
}

// ==== Exports for Jest ====
if (typeof module !== "undefined") {
  module.exports = {
    handleMusicToggle,
    moveLeft,
    moveRight,
    createPlatform,
    updatePlatforms,
    startLoop,
    generatePlatform,
    applyGravity,
  };
}
