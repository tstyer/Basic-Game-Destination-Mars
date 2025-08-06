// ---
// Code will be mixed with jQuery and regular JS to demonstrate understanding of both.
// ---

// Global variables
let velocityY = 0;
let gravity = 0.5;
let isJumping = false;
let platforms = [];
let gameArea;
let spaceBug;

// --- DOM code (only runs in the browser) ---
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {
    // Select DOM elements
    const $music = $('#music');
    const $musicToggle = $('#music_toggle');
    gameArea = document.querySelector('.game_area');
    spaceBug = document.querySelector('.space_bug');

    // Center the spaceBug horizontally
    const bugWidth = spaceBug.offsetWidth;
    const gameAreaWidth = gameArea.offsetWidth;
    const startingLeft = (gameAreaWidth / 2) - (bugWidth / 2);
    spaceBug.style.left = `${startingLeft}px`;

    // LEFT key listener
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        moveLeft(spaceBug);
        console.log("Jump Left");
      }
    });

    // RIGHT key listener
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        moveRight(spaceBug);
        console.log("Jump Right");
      }
    });

    // Push HTML platform on DOM load
    const existingPlatform = document.querySelector(".platform");
    if (existingPlatform) platforms.push(existingPlatform);

    // Start platforms falling
    startPlatformFall();

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
  });
}

// --- Functions ---

// 1. Music Toggle
function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) {
    audio.play();
    console.log("Music playing...");
  } else {
    audio.pause();
    console.log("Music paused...");
  }
}

// 2. Platform Creation
function createPlatform(x, y) {
  const platform = document.createElement("div");
  platform.className = "platform";
  platform.style.left = `${x}px`;
  platform.style.top = `${y}px`;

  // Create new image for every new platform (div)
  const platformImage = document.createElement("img");
  platformImage.src = "assets/images/space_rock_platform.png";
  platformImage.alt = "space platform";

  // Add fresh image to the div
  platform.appendChild(platformImage);

  const gameAreaEl = document.querySelector("game_area");
  gameAreaEl.appendChild(platform);

  platforms.push(platform);
  return platform;
}

// 3. Move Bug Left
function moveLeft(spaceBug) {
  const currentLeft = parseInt(spaceBug.style.left, 10) || 0;
  const newLeft = Math.max(0, currentLeft - 5);
  spaceBug.style.left = `${newLeft}px`;

  const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_left.PNG")) {
    bugImage.src = "assets/images/space_bug_left.PNG";
  }
}

// 4. Move Bug Right
function moveRight(spaceBug) {
  const currentRight = parseInt(spaceBug.style.left, 10) || 0;
  const newRight = Math.max(0, currentRight + 5);
  spaceBug.style.left = `${newRight}px`;

  const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_right.PNG")) {
    bugImage.src = "assets/images/space_bug_right.PNG";
  }
}

// 5. Update platform positions - falling platforms
function updatePlatforms() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  platforms.forEach((platform, index) => {
    let currentTop = parseInt(platform.style.top, 10);
    let newTop = currentTop + 2;

    if (newTop > area.offsetHeight) {
      area.removeChild(platform);
      platforms.splice(index, 1);
    } else {
      platform.style.top = `${newTop}px`;
    }
  });
}

// Function 6 - generate platform fall loop

function startPlatformFall() {
  setInterval(() => {
    updatePlatforms();

    if (Math.random() < 0.02 && platforms.length < 5) {
      generatePlatform();
    };

    }, 30);
};

// Function 7 - generating the platforms

function generatePlatform() {
  // Setting the width
  const x = Math.floor(Math.random() * 300);
  // Starting at the top
  const y = 0; // start at the top
  createPlatform(x, y);
};

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
    generatePlatforms
  };
}
