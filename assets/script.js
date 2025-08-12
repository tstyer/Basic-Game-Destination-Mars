// ---
// Destination: Mars - Game Script (camelCase consts)
// ---

// ==== Physics / State ====
let velocityY = 0;
let velocityX = 0;
let isJumping = false;

const gravity = 0.5;

const jumpHorizontalSpeed = 3; // horizontal push on jump
const airDrag = 0.15;          // bleed sideways speed when no key held
const airAccel = 0.3;          // mid-air steering accel per tick
const maxAirSpeed = 5;         // clamp sideways speed in air

// Which keys are held?
const keys = { left: false, right: false };

// ==== Platforms / Spawning ====
let platforms = [];
let platformSpacingCounter = 0;

const tickMs = 14;
let platformSpeed = 1.7;           // px per tick (let so you can tweak at runtime)
const platformSpacingPx = 120;     // distance between spawns
const maxPlatforms = 12;           // on-screen cap
const platformWidth = 100;         // match your sprite/CSS
const spawnMargin = 16;            // keep away from edges

// ==== DOM handles / Game flow flags ====
let gameArea;
let spaceBug;

let hasAcknowledged = false; // clicked “Okay, got it.”
let gameStarted = false;     // pressed Space after acknowledging
let fallIntervalId = null;   // setInterval id

// ==== DOM code (browser only) ====
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {
    // DOM elements
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

    // Centre the bug horizontally; ensure numeric bottom for physics
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

      // Track arrow states
      if (e.key === "ArrowLeft")  keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;

      // Ground movement (only once game has started)
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

    // Do NOT auto-start; Space (after OK) will start it
  });
}

// ==== Functions ====

// Music toggle
function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) audio.play();
  else audio.pause();
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

// Ground move left/right (snappy on ground)
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

// Jump (with initial sideways push depending on held key)
function jump() {
  if (isJumping) return;
  velocityY = -10;
  isJumping = true;

  if (keys.left && !keys.right)      velocityX = -jumpHorizontalSpeed;
  else if (keys.right && !keys.left) velocityX =  jumpHorizontalSpeed;
  else                                velocityX =  0; // straight up if still
}

// Physics tick (vertical + mid-air steering + bounds)
function applyGravity() {
  if (!spaceBug || !gameArea) return;

  // Vertical
  const currentBottom = parseInt(spaceBug.style.bottom || "80", 10);
  velocityY += gravity;
  let newBottom = currentBottom - velocityY;

  if (newBottom <= 0) {
    newBottom = 0;
    velocityY = 0;
    isJumping = false;
    velocityX = 0; // kill lateral carry on landing (for crisp control)
  }
  spaceBug.style.bottom = `${newBottom}px`;

  // Horizontal
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

  const areaW = gameArea.clientWidth;
  const bugW  = spaceBug.offsetWidth || 60;

  let left = parseInt(spaceBug.style.left || "0", 10);
  left += velocityX;
  left = Math.max(0, Math.min(left, areaW - bugW)); // clamp
  spaceBug.style.left = `${left}px`;
}

// Platforms falling + despawn at white line
function updatePlatforms() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const areaH = area.clientHeight;

  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];
    const top = parseInt(platform.style.top, 10) || 0;
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

// Start main loop (returns interval id)
function startPlatformFall() {
  const id = setInterval(() => {
    updatePlatforms();
    applyGravity();

    // spawn after travel distance
    platformSpacingCounter += platformSpeed;
    if (platformSpacingCounter >= platformSpacingPx && platforms.length < maxPlatforms) {
      generatePlatform();
      platformSpacingCounter = 0;
    }
  }, tickMs);
  return id;
}

// Start game (once)
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  if (!fallIntervalId) {
    fallIntervalId = startPlatformFall();
  }
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
    platforms,
    startPlatformFall,
    generatePlatform,
    applyGravity,
  };
}
