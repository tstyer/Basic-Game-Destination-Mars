/*jslint browser */
/*global $, getComputedStyle, localStorage, module */

// ---
// Destination: Mars
// ---

// ==== Globals ====
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

// pixels per tick while walking on ground/platform
const groundStepPx = 4;

// Skip transparent pixels at top of platform image.
let platformCollisionTopInsetPx = 10;   // was const
// Adjust for transparent pixels at bottom of bug PNG.
let bugFootOffsetPx = 55;               // was const

// ==== Platforms ====
let platforms = [];
let platformSpacingCounter = 0;

const tickMs = 14;

// Top speed of falling platforms after score of 500.
let platformSpeed = 1.7;
const platformSpacingPx = 120;
const maxPlatforms = 12;
let platformWidth = 100;                // was const
const spawnMargin = 16;

// Max horizontal distance between spawns
const maxHorizontalStepPx = 300;

// Remember last spawn X to clamp around it
let lastSpawnX = null;

// ==== Distance to Mars Meter ====
const startDistance = 1000;
let distanceRemaining = startDistance;
// Mars decreases by 5 per platform landing
const landingDecrement = 5;
// Starting easy speed
const slowSpeed = 1.1;
// Increases to this after 500
const fastSpeed = 1.7;
// When distanceRemaining <= this, use fast speed
const speedRampThreshold = 500;
let speedUpApplied = false;

// ==== DOM handles ====
let gameArea;
let spaceBug;
let distanceLabel;

let hasAcknowledged = false; // becomes true after “Okay, got it.”
let gameStarted = false;     // true after Space pressed post-ack
let loopId = null;

// Ground grace: allow exactly one safe ground touch after starting
let allowOneGroundTouch = true;
// Track ground state to detect air->ground transitions
let isOnGround = false;

// For accessible focus restore on modal close
let lastFocus = null;

// ==== Metrics: recompute based on current sprite sizes ====
function recomputeSpriteMetrics() {
  const BUG_BASE_H = 60;
  const BUG_BASE_FOOT = 55;
  const PLAT_BASE_W = 100;
  const PLAT_BASE_H = 115;
  const PLAT_BASE_TOP_INSET = 10;

  const bugH = spaceBug.offsetHeight ?? BUG_BASE_H; // uses value unless null/undefined

  bugFootOffsetPx =
    Math.round((BUG_BASE_FOOT / BUG_BASE_H) * bugH);

  const sampleImg =
    (platforms[0] && platforms[0].querySelector("img")) ||
    document.querySelector(".platform img");

  const platW = sampleImg
    ? (sampleImg.offsetWidth || PLAT_BASE_W)
    : PLAT_BASE_W;

  const platH = sampleImg
    ? (sampleImg.offsetHeight || PLAT_BASE_H)
    : PLAT_BASE_H;

  platformWidth = platW;
  platformCollisionTopInsetPx =
    Math.round((PLAT_BASE_TOP_INSET / PLAT_BASE_H) * platH);
}

// ==== DOM code (browser only) ====
if (globalThis &&
        globalThis.document &&
        globalThis.$) {
  $(document).ready(function () {
    const $music = $("#music");
    const $musicToggle = $("#music_toggle");
    gameArea = document.querySelector(".game_area");
    spaceBug = document.querySelector(".space_bug");
    distanceLabel = document.querySelector(".distance-label");

    // Show modal if it exists on the page (works on Live Server & any path)
    const overlay = document.getElementById("howto_box");
    if (overlay && gameArea) {
      showModal(
        "How to Play",
        "Use ← → to move. Press Space to jump.\n"
          + "Land on platforms to climb!\n"
          + "(Press Space after closing to start.)",
        "Okay, got it.",
        function () {
          hasAcknowledged = true;
          closeModal();
        }
      );
    } else {
      // Allow starting with Space when no modal is present
      hasAcknowledged = true;
    }

    // Center the bug
    if (spaceBug && gameArea) {
      const bugW = spaceBug.offsetWidth || 60;
      const areaW = gameArea.offsetWidth || 600;
      spaceBug.style.left = String((areaW - bugW) / 2) + "px";

      if (!spaceBug.style.bottom) {
        const computedBottom = getComputedStyle(spaceBug).bottom;
        spaceBug.style.bottom = (
                (computedBottom && computedBottom.endsWith("px"))
                ? computedBottom
                : "80px"
            );
      }
    }

    // Seed any existing platform in markup
    const existingPlatform = document.querySelector(".platform");
    if (existingPlatform) {
      existingPlatform.style.top = "0px";
      existingPlatform.style.left = "100px";
      platforms.push(existingPlatform);
    }

    // Compute metrics now that DOM is ready and a platform may exist
    try { recomputeSpriteMetrics(); } catch (e) { /* no-op */ }
    window.addEventListener("resize", function () {
      try { recomputeSpriteMetrics(); } catch (e2) { /* no-op */ }
    });

    // Initialize Mars label
    updateDistanceLabel();

    // Key handlers: set flags; movement applies each tick
    document.addEventListener("keydown", function (e) {
      if (e.code === "Space") {
        if (!hasAcknowledged) {
          return;
        }
        e.preventDefault();
        if (!gameStarted) {
          startGame();
        } else {
          jump();
        }
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // Avoid page scroll, feels snappier
        e.preventDefault();
        if (e.key === "ArrowLeft") {
          keys.left = true;
        }
        if (e.key === "ArrowRight") {
          keys.right = true;
        }
      }
    });

    document.addEventListener("keyup", function (e) {
      if (e.key === "ArrowLeft") {
        keys.left = false;
      }
      if (e.key === "ArrowRight") {
        keys.right = false;
      }
    });

    // Music toggle
    if ($music.length) {
      const music = $music[0];
      const musicOn = localStorage.getItem("music_on") === "true";
      if (musicOn) {
        // non-empty catch to satisfy JSLint
        music.play().catch(function () { return; });
      } else {
        music.pause();
      }

      if ($musicToggle.length) {
        $musicToggle.prop("checked", musicOn);
        $musicToggle.on("change", function (ev) {
          let el = ev.currentTarget;
          localStorage.setItem("music_on", el.checked);
          handleMusicToggle(el, music);
        });
      }
    }
  });
}

// ==== Modal helpers (re-use #howto_box) ====
function showModal(titleHTML, bodyText, buttonText, onClick) {
  const overlay = document.getElementById("howto_box");
  if (!overlay) { return; }

  // To clean up any leftover aria-hidden from old markup
  overlay.removeAttribute("aria-hidden");

  lastFocus = document.activeElement;

  overlay.classList.add("is-open");
  overlay.removeAttribute("hidden"); // visible & in a11y tree
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "howto_title");

  const box = overlay.querySelector(".howto-box");
  if (!box) { return; }

  // Clear content safely
  while (box.firstChild) { box.removeChild(box.firstChild); }

  const h2 = document.createElement("h2");
  h2.id = "howto_title";
  h2.innerHTML = titleHTML;

  const bodyEl = document.createElement("div");
  bodyEl.className = "howto-body";
  bodyEl.innerHTML = bodyText.replace(/\n/g, "<br>");

  const btn = document.createElement("button");
  btn.id = "howto_ok";
  btn.className = "howto-btn";
  btn.textContent = buttonText;
  btn.onclick = onClick;

  box.appendChild(h2);
  box.appendChild(bodyEl);
  box.appendChild(btn);

  // Move focus into the dialog
  btn.focus();
}

function closeModal() {
  const overlay = document.getElementById("howto_box");
  if (!overlay) { return; }

  // Restore focus BEFORE hiding
  const fallback =
    lastFocus ||
    document.querySelector("a.nav-link.current") ||
    document.querySelector("h1") ||
    document.body;

  if (
          fallback &&
          fallback !== document.body &&
          !fallback.hasAttribute("tabindex")
  ) {
    fallback.setAttribute("tabindex", "-1");
    fallback.addEventListener("blur", function () {
      fallback.removeAttribute("tabindex");
    }, { once: true });
  }
  if (fallback) { fallback.focus({ preventScroll: true }); }

  overlay.classList.remove("is-open");
  overlay.setAttribute("hidden", "");
}

// ==== Music toggle ====
function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) {
    audio.play();
  } else {
    audio.pause();
  }
}

// ==== Platform creation ====
function createPlatform(x, y) {
  const platform = document.createElement("div");
  platform.className = "platform";
  platform.style.left = String(x) + "px";
  platform.style.top = String(y) + "px";

  const img = document.createElement("img");
  img.src = "assets/images/space_rock_platform.png";
  img.alt = "space platform";
  platform.appendChild(img);

  const area = gameArea || document.querySelector(".game_area");
  if (!area) { return platform; }
  area.appendChild(platform);

  platforms.push(platform);

  // Ensure metrics match real on-screen sizes
  try { recomputeSpriteMetrics(); } catch (e) { /* no-op */ }

  return platform;
}

// ==== Ground walking per tick ====
function setBugFacing(dir) {
  const img = spaceBug && spaceBug.querySelector("img");
  if (!img) { return; }
  const want = (
    dir === "left"
      ? "assets/images/space_bug_left.PNG"
      : "assets/images/space_bug_right.PNG"
  );
  if (!img.src.includes(dir === "left" ? "left" : "right")) {
    img.src = want;
  }
}

function applyGroundMovement() {
  if (!gameStarted || !spaceBug || !gameArea) { return; }
  if (isJumping) { return; } // only when standing

  let left = parseFloat(spaceBug.style.left || "0");
  const maxLeft = gameArea.clientWidth - (spaceBug.offsetWidth || 60);

  if (keys.left && !keys.right) {
    left = Math.max(0, left - groundStepPx);
    setBugFacing("left");
  } else if (keys.right && !keys.left) {
    left = Math.min(maxLeft, left + groundStepPx);
    setBugFacing("right");
  }
  spaceBug.style.left = String(left) + "px";
}

// ==== Ground move helpers ====
function moveLeft(el) {
  const left = parseInt(el.style.left, 10) || 0;
  el.style.left = String(Math.max(0, left - groundStepPx)) + "px";
  const img = el.querySelector("img");
  if (img && !img.src.includes("space_bug_left.PNG")) {
    img.src = "assets/images/space_bug_left.PNG";
  }
}

function moveRight(el) {
  const left = parseInt(el.style.left, 10) || 0;
  const maxLeft = (
          gameArea
          ? gameArea.clientWidth - (el.offsetWidth || 60)
          : Math.max(0, left)
      );
  const next = Math.min(maxLeft, left + groundStepPx);
  el.style.left = String(Math.max(0, next)) + "px";
  const img = el.querySelector("img");
  if (img && !img.src.includes("space_bug_right.PNG")) {
    img.src = "assets/images/space_bug_right.PNG";
  }
}

// ==== Jump ====
function jump() {
  if (isJumping) { return; }
  velocityY = -14;
  isJumping = true;

  if (keys.left && !keys.right) {
    velocityX = -jumpHorizontalSpeed;
  } else if (keys.right && !keys.left) {
    velocityX = jumpHorizontalSpeed;
  } else {
    velocityX = 0; // straight up
  }
}

// ==== Physics (vertical + image landing + sticky + bounds) ====
function applyGravity() {
  if (!spaceBug || !gameArea) { return; }

  const bugW = spaceBug.offsetWidth || 60;

  // Sticky standing on a platform image
  if (!isJumping) {
    const supportBottom = getSupportBottomOnImage(bugW);
    if (supportBottom !== null && supportBottom !== undefined) {
      isOnGround = false;
      spaceBug.style.bottom = String(supportBottom) + "px";
      velocityY = 0;

      const currentLeft = parseFloat(spaceBug.style.left || "0");
      const maxLeftClamp = gameArea.clientWidth - bugW;
      const leftClamp = Math.max(0, Math.min(currentLeft, maxLeftClamp));
      spaceBug.style.left = String(leftClamp) + "px";
      return;
    }
  }

  // Vertical integration (falling or in-air)
  const prevBottom = parseFloat(spaceBug.style.bottom || "80");
  velocityY += gravity;
  let nextBottom = prevBottom - velocityY; // positive Y means falling

  // Try to land on a platform image while falling
  if (velocityY > 0) {
    const landing = getLandingBottomOnImageMoving(
      prevBottom, nextBottom, bugW
    );
    if (landing) {
      isOnGround = false;
      nextBottom = landing.bottom;
      velocityY = 0;
      isJumping = false;
      velocityX = 0;
      applyLandingProgress();
    }
  }

  // Ground handling (only on air -> ground transition)
  if (nextBottom <= 0) {
    nextBottom = 0;

    const wasInAir = !isOnGround;
    isOnGround = true;

    spaceBug.style.bottom = "0px";

    if (gameStarted && wasInAir) {
      if (allowOneGroundTouch) {
        allowOneGroundTouch = false;
        velocityY = 0;
        isJumping = false;
        velocityX = 0;
        return;
      }
      gameOver();
      return;
    }
  } else {
    // In the air
    isOnGround = false;
    spaceBug.style.bottom = String(nextBottom) + "px";
  }

  // Horizontal integration + mid-air steering
  let left = parseFloat(spaceBug.style.left || "0");

  if (isJumping) {
    if (keys.left && !keys.right) {
      velocityX = Math.max(-maxAirSpeed, velocityX - airAccel);
    } else if (keys.right && !keys.left) {
      velocityX = Math.min(maxAirSpeed, velocityX + airAccel);
    } else {
      if (velocityX > 0) {
        velocityX = Math.max(0, velocityX - airDrag);
      } else if (velocityX < 0) {
        velocityX = Math.min(0, velocityX + airDrag);
      }
    }
  }

  left += velocityX;
  left = Math.max(0, Math.min(left, gameArea.clientWidth - bugW));
  spaceBug.style.left = String(left) + "px";
}

// ==== Landing progress ====
function applyLandingProgress() {
  if (distanceRemaining <= 0) { return; }
  distanceRemaining = Math.max(0, distanceRemaining - landingDecrement);
  updateDistanceLabel();

  // Speed ramp
  if (!speedUpApplied && distanceRemaining <= speedRampThreshold) {
    platformSpeed = fastSpeed;
    speedUpApplied = true;
  }

  if (distanceRemaining === 0) {
    youWin();
  }
}

function updateDistanceLabel() {
  if (!distanceLabel) { return; }
  distanceLabel.textContent = "Mars: " + String(distanceRemaining);
}

// ==== Win / Game Over / Reset ====
function youWin() {
  stopLoop();
  gameStarted = false;
  const score = startDistance - distanceRemaining;

  showModal(
    "You made it to Mars!",
    "Your score: " + String(score) + "\n"
      + "Press “Restart” and then Space to play again.",
    "Restart",
    function () {
      closeModal();
      resetGameState();
    }
  );
}

function gameOver() {
  stopLoop();
  gameStarted = false;
  isJumping = false;
  const score = startDistance - distanceRemaining;

  showModal(
    "Game Over",
    "Your score: " + String(score) + "\n"
      + "Press “Restart” and then Space to try again.",
    "Restart",
    function () {
      closeModal();
      resetGameState();
    }
  );
}

function resetGameState() {
  // Reset meters & speed ramp
  distanceRemaining = startDistance;
  speedUpApplied = false;
  platformSpeed = slowSpeed;
  updateDistanceLabel();

  // Reset player
  velocityX = 0;
  velocityY = 0;
  isJumping = false;

  if (spaceBug && gameArea) {
    const bugW = spaceBug.offsetWidth || 60;
    const areaW = gameArea.offsetWidth || 600;
    spaceBug.style.left = String((areaW - bugW) / 2) + "px";
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
    platforms.forEach(function (p) {
      if (p.parentNode === area) { area.removeChild(p); }
    });
  }
  platforms = [];
  platformSpacingCounter = 0;

  // Restore ground grace for the next run
  allowOneGroundTouch = true;
  isOnGround = false;

  // Wait for Space to start
  hasAcknowledged = true;
  gameStarted = false;

  // Recompute metrics after layout reset
  try { recomputeSpriteMetrics(); } catch (e) { /* no-op */ }
}

// ==== Loop control ====
function startGame() {
  if (gameStarted) { return; }
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

  if (!loopId) {
    loopId = startLoop();
  }
}

function stopLoop() {
  if (loopId) {
    clearInterval(loopId);
    loopId = null;
  }
}

// ==== Main loop ====
function startLoop() {
  return setInterval(function () {
    // Platforms move down first
    updatePlatforms();
    // Instant walking while standing (no key-repeat lag)
    applyGroundMovement();
    // Then resolve player movement/landing
    applyGravity();

    // Spawn after travel distance
    platformSpacingCounter += platformSpeed;
    if (
      platformSpacingCounter >= platformSpacingPx
      && platforms.length < maxPlatforms
    ) {
      generatePlatform();
      platformSpacingCounter = 0;
    }
  }, tickMs);
}

// ==== Landing helpers ====
function getSupportBottomOnImage(bugW, supportEps) {
  let eps = (typeof supportEps === "number" ? supportEps : 8);

  const area = gameArea;
  const areaRect = area.getBoundingClientRect();
  const areaH = area.clientHeight;
  const offX = area.clientLeft;
  const offY = area.clientTop;

  const bugLeft = parseFloat(spaceBug.style.left || "0");
  const bugRight = bugLeft + bugW;
  const currentBottom = parseFloat(spaceBug.style.bottom || "0");

  let bestBottom = null;
  let bestDelta = Infinity;

  platforms.forEach(function (plat) {
    const imgEl = plat.querySelector("img");
    if (!imgEl) { return; }

    const r = imgEl.getBoundingClientRect();
    const currTop =
      (r.top - areaRect.top - offY) + platformCollisionTopInsetPx;
    const imgLeft = (r.left - areaRect.left - offX);
    const imgRight = imgLeft + r.width;

    if (!(bugRight > imgLeft && bugLeft < imgRight)) { return; }

    const desiredBottom =
      Math.max(0, areaH - currTop - bugFootOffsetPx);
    const delta = Math.abs(desiredBottom - currentBottom);

    if (desiredBottom <= currentBottom + eps && delta < bestDelta) {
      bestDelta = delta;
      bestBottom = desiredBottom;
    }
  });

  return (bestDelta <= eps ? bestBottom : null);
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

  const bugLeft = parseFloat(spaceBug.style.left || "0");
  const bugRight = bugLeft + bugW;

  let best = null;
  let closestDelta = Infinity;

  platforms.forEach(function (plat) {
    const imgEl = plat.querySelector("img");
    if (!imgEl) { return; }

    const r = imgEl.getBoundingClientRect();

    let currTop = (r.top - areaRect.top - offY);
    const imgLeft = (r.left - areaRect.left - offX);
    const imgRight = imgLeft + r.width;

    const overlapsX = bugRight > imgLeft && bugLeft < imgRight;
    if (!overlapsX) { return; }

    // Skip transparent top
    currTop += platformCollisionTopInsetPx;
    const prevTop = currTop - platformSpeed;

    const crossed =
      (prevFeet <= prevTop + EPS) && (nextFeet >= currTop - EPS);

    if (crossed) {
      const candidateBottom =
        Math.max(0, areaH - currTop - bugFootOffsetPx);
      const midTop = (prevTop + currTop) * 0.5;
      const delta = Math.abs(midTop - prevFeet);
      if (delta < closestDelta) {
        closestDelta = delta;
        best = { bottom: candidateBottom, platformEl: plat };
      }
    }
  });

  return best;
}

// ==== Platforms ====
function updatePlatforms() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) { return; }

  const areaH = area.clientHeight;

  platforms = platforms.filter(function (platform) {
    const top =
      parseFloat(platform.style.top || String(platform.offsetTop)) || 0;
    const newTop = top + platformSpeed;
    const h = platform.offsetHeight || 0;

    if (newTop >= areaH - h) {
      area.removeChild(platform);
      return false; // drop from array
    }
    platform.style.top = String(newTop) + "px";
    return true; // keep
  });
}

// clamp spawn
function generatePlatform() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) { return; }

  const areaW = area.clientWidth;
  const minWall = spawnMargin;
  const maxWall = areaW - platformWidth - spawnMargin;

  const bugLeft = parseFloat((spaceBug && spaceBug.style.left) || "0");
  const bugW = (spaceBug && spaceBug.offsetWidth) || 60;
  const bugCenterX = bugLeft + bugW / 2;

  const refX = (
    (lastSpawnX !== null && lastSpawnX !== undefined)
      ? lastSpawnX
      : (bugCenterX - (platformWidth / 2))
  );

  const windowMin = Math.max(minWall, refX - maxHorizontalStepPx);
  const windowMax = Math.min(maxWall, refX + maxHorizontalStepPx);

  const minX = Math.min(windowMin, windowMax);
  const maxX = Math.max(windowMin, windowMax);

  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  lastSpawnX = x; // remember for the next spawn

  const y = 0;
  createPlatform(x, y);
}

// ==== Exports (for tests) ====
if (globalThis.module?.exports) {
  module.exports = {
    applyGravity,
    closeModal,
    createPlatform,
    generatePlatform,
    handleMusicToggle,
    moveLeft,
    moveRight,
    resetGameState,
    showModal,
    startGame,
    startLoop,
    updatePlatforms
  };
}
