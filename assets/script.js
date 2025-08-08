// ---
// Code will be mixed with jQuery and regular JS to demonstrate understanding of both.
// ---

// Global variables
let velocityY = 0;
let gravity = 0.5;
let isJumping = false;
let platforms = [];
let platformSpacingCounter = 0;
let gameArea;
let spaceBug;

// PlatformFall() speed:
const tick_ms = 14; 
let platform_speed = 1.7; 

// Platform spacing
const platform_spacing = 120;
const max_platforms = 12;
const x_speparation = 140; // Horizontal spacing between platforms.
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
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
          });
       }
     }

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

    // Jumping listener 
    document.addEventListener("keydown", (e) => {
      if(e.code === "space") {
        jump();
      }
    })

    // Push HTML platform on DOM load
    const existingPlatform = document.querySelector(".platform");
    if (existingPlatform) {
      // These are starting values for existing platform
      existingPlatform.style.top = "0px";
      existingPlatform.style.left = "100px"
      platforms.push(existingPlatform);
    }  

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

  const gameAreaEl = document.querySelector(".game_area");
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

// 5. Jumping bug
function jump() {
  if(!isJumping) {
    velocityY = -10;
    isJumping = true;
  }
}

// 6. Update platform positions - falling platforms
function updatePlatforms() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const areaHeight = area.clientHeight; // inside the white border

  // iterate backwards since I splice the array
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

// Function 6 - generate platform fall loop

function startPlatformFall() {
  setInterval(() => {
    updatePlatforms();

    // count how many pixels' worth of fall have happened since last spawn
    platformSpacingCounter += platform_speed;

    // spawn when we've accumulated enough "distance"
    if (platformSpacingCounter >= platform_spacing && platforms.length < max_platforms) {
      generatePlatform();
      platformSpacingCounter = 0;
    }
  }, tick_ms);
}

// Function 7 - generating the platforms

function generatePlatform() {
  const area = gameArea || document.querySelector(".game_area");
  if (!area) return;

  const platform_width = 100; // sets the platform width.
  const margin = 16;

  const minX = margin;
  const maxX = Math.max(minX, area.clientWidth - platform_width - margin);

  const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const y = 0;

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
    generatePlatform
  };
}
