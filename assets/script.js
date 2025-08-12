// ---
// Code will be mixed with jQuery and regular JS to demonstrate understanding of both.
// ---

// ---
// Destination: Mars - Game Script (fixed start + gravity)
// ---

// --- Globals ---
let velocityY = 0;
let velocityX = 0;
let gravity = 0.5;
let isJumping = false;

const jump_horizontal_speed = 3; // The horizontal speed when going left or right.
const air_drag = 0.15;           // This slows the bug when in the air. 

// This tracks which keys are currently being held:
const keys = { left: false, right: false};

let platforms = [];
let platformSpacingCounter = 0;

let gameArea;
let spaceBug;

let hasAcknowledged = false;   // clicked the modal button
let gameStarted = false;       // pressed Space after acknowledging
let fallIntervalId = null;     // stores setInterval id

// Timing & speed
const tick_ms = 14;
let platform_speed = 1.7;

// Spawning
const platform_spacing = 120;  // pixels between spawns
const max_platforms = 12;      // on-screen cap

// (unused now, keep if you plan to add horizontal separation later)
const x_speparation = 140;
let lastSpawnX = null;

// --- DOM code (only runs in the browser) ---
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {

    // Select DOM elements
    const $music = $('#music');
    const $musicToggle = $('#music_toggle');
    gameArea = document.querySelector('.game_area');
    spaceBug = document.querySelector('.space_bug');

    // Display pop-up instructions on index.html
    const isHome = /(^\/$|index\.html$)/.test(window.location.pathname);
    if (isHome && gameArea) {
      const modal = document.getElementById("howto_box");
      const okBtn = document.getElementById("howto_ok");
      if (modal && okBtn) {
        modal.classList.add("is-open");        // show on initial load
        okBtn.addEventListener("click", () => { // close on click
          hasAcknowledged = true;               // user confirmed
          modal.classList.remove("is-open");
          modal.setAttribute("aria-hidden", "true");
        });
      }
    }

    // Center the spaceBug horizontally
    if (spaceBug && gameArea) {
      const bugWidth = spaceBug.offsetWidth || 60;
      const gameAreaWidth = gameArea.offsetWidth || 600;
      const startingLeft = (gameAreaWidth / 2) - (bugWidth / 2);
      spaceBug.style.left = `${startingLeft}px`;

      // Ensure there is a numeric bottom to work with for gravity
      if (!spaceBug.style.bottom) {
        const computedBottom = getComputedStyle(spaceBug).bottom || "80px";
        spaceBug.style.bottom = computedBottom;
      }
    }

    // Single key listener: Space to start/jump, arrows to move (after start)
    document.addEventListener("keydown", (e) => {
      // Space starts game (after OK) or jumps
      if (e.code === "Space") {
        if (!hasAcknowledged) return;   // must click “Okay, got it.” first
        e.preventDefault();

        if (!gameStarted) {
          startGame();
        } else {
          jump();
        }
        return; // stop here so arrows below don't run on same event
      }

        // This Tracks arrow-key state
      if (e.key === "ArrowLeft")  keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;

       // Move only after game started
      if (!gameStarted) return;
      if (e.key === "ArrowLeft")  moveLeft(spaceBug);
      if (e.key === "ArrowRight") moveRight(spaceBug);
      });

      document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft")  keys.left = false;
        if (e.key === "ArrowRight") keys.right = false;
        });

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft")  keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

    // Push HTML platform on DOM load (if present)
    const existingPlatform = document.querySelector(".platform");
    if (existingPlatform) {
      existingPlatform.style.top = "0px";
      existingPlatform.style.left = "100px";
      platforms.push(existingPlatform);
    }

    // Music toggle logic
    if ($music.length) {
      const music = $music[0];
      const musicOn = localStorage.getItem("music_on") === "true";

      if (musicOn) {
        music.play().catch(() => {});
      } else {
        music.pause();
      }

      if ($musicToggle.length) {
        $musicToggle.prop("checked", musicOn);
        $musicToggle.on("change", function () {
          localStorage.setItem("music_on", this.checked);
          handleMusicToggle(this, music);
        });
      }
    }

    // DO NOT auto-start falling here—Space (after OK) will start it
    // startPlatformFall(); // intentionally omitted
  });
}

// --- Functions ---

// Music Toggle
function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) {
    audio.play();
    console.log("Music playing...");
  } else {
    audio.pause();
    console.log("Music paused...");
  }
}

// Create Platform
function createPlatform(x, y) {
  const platform = document.createElement("div");
  platform.className = "platform";
  platform.style.left = `${x}px`;
  platform.style.top = `${y}px`;

  const platformImage = document.createElement("img");
  platformImage.src = "assets/images/space_rock_platform.png";
  platformImage.alt = "space platform";

  platform.appendChild(platformImage);

  const gameAreaEl = document.querySelector(".game_area");
  gameAreaEl.appendChild(platform);

  platforms.push(platform);
  return platform;
}

// Move Bug Left
function moveLeft(spaceBug) {
  const currentLeft = parseInt(spaceBug.style.left, 10) || 0;
  const newLeft = Math.max(0, currentLeft - 5);
  spaceBug.style.left = `${newLeft}px`;

  const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_left.PNG")) {
    bugImage.src = "assets/images/space_bug_left.PNG";
  }
}

// Move Bug Right
function moveRight(spaceBug) {
  const currentRight = parseInt(spaceBug.style.left, 10) || 0;
  const newRight = Math.max(0, currentRight + 5);
  spaceBug.style.left = `${newRight}px`;

  const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_right.PNG")) {
    bugImage.src = "assets/images/space_bug_right.PNG";
  }
}

// Jumping bug
function jump() {
  if (!isJumping) {
    velocityY = -10;
    isJumping = true;

    if (keys.left && !keys.right)      velocityX = -jump_horizontal_speed;
    else if (keys.right && !keys.left) velocityX =  jump_horizontal_speed;
    else                               velX =  0; // straight up if still
  }
}

// Gravity applied to bug each tick
function applyGravity() {
  if (!spaceBug || !gameArea) return;

  // --- vertical ---
  const currentBottom = parseInt(spaceBug.style.bottom || "80", 10);
  velocityY += gravity;
  let newBottom = currentBottom - velocityY;

  if (newBottom <= 0) {
    newBottom = 0;
    velocityY = 0;
    isJumping = false;
    velocityX = 0; // stop sliding once you land
  }
  spaceBug.style.bottom = `${newBottom}px`;

  // --- horizontal (only relevant while in air but harmless on ground) ---
  const areaW = gameArea.clientWidth;
  const bugW  = spaceBug.offsetWidth || 60;

  let left = parseInt(spaceBug.style.left || "0", 10);
  left += velocityX;

  // keep inside bounds
  left = Math.max(0, Math.min(left, areaW - bugW));
  spaceBug.style.left = `${left}px`;

  // air drag to gently reduce sideways speed
  if (isJumping) {
    if (velocityX > 0)      velocityX = Math.max(0, velocityX - air_drag);
    else if (velocityX < 0) velocityX = Math.min(0, velocityX + air_drag);
  }
}

// Update platform positions - falling platforms
function updatePlatforms() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const areaHeight = area.clientHeight; // inside the white border

  // iterate backwards since we splice the array
  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];
    const currentTop = parseInt(platform.style.top, 10) || 0;
    const newTop = currentTop + platform_speed;
    const platH = platform.offsetHeight || 0;

    // remove when platform's bottom reaches the bottom of the area
    if (newTop >= areaHeight - platH) {
      area.removeChild(platform);
      platforms.splice(i, 1);
    } else {
      platform.style.top = `${newTop}px`;
    }
  }
}

// Start platform fall + physics loop (returns interval id)
function startPlatformFall() {
  const id = setInterval(() => {
    // platforms
    updatePlatforms();

    // player physics
    applyGravity();

    // spawning logic
    platformSpacingCounter += platform_speed;
    if (platformSpacingCounter >= platform_spacing && platforms.length < max_platforms) {
      generatePlatform();
      platformSpacingCounter = 0;
    }
  }, tick_ms);
  return id;
}

// Start game helper
function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  if (!fallIntervalId) {
    fallIntervalId = startPlatformFall();
  }
}

// Generate a platform at a random X across the game area
function generatePlatform() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const platform_width = 100;
  const margin = 16;

  const minX = margin;
  const maxX = Math.max(minX, area.clientWidth - platform_width - margin);

  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const y = 0; // top

  createPlatform(x, y);
}

// --- Exports for Jest Testing ---
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
