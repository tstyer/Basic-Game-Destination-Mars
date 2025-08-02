// ---
// Code will be mized with jQuery and regular JS to demonstrate understanding of both.
// --- 

// Only runs in browser with jQuery available.
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  
  // On loading the webpage, then... 
  $(document).ready(function () {

  // MAIN VARIABLES
  const $music = $('#music');
  const $musicToggle = $('#music_toggle');
  const gameArea = document.querySelector('.game_area');
  const spaceBug = document.querySelector('.space_bug');
  let velocityY = 0;
  let gravity = 0.5;
  let isJumping = false;
  let platforms = [];

  // Center the spaceBug horizontally in pixels
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


// First function - Music Toggle

function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) {
    audio.play();
    console.log("Music playing...");
  } else {
    audio.pause();
    console.log("Music paused...");
  }
}

// Second function - Platform Generation

function createPlatform(x, y) {                  // x,y coordinates position the platform on the screen.
  const platform = document.createElement("div");
  platform.className = "platform";               // Assign a classname to it so it is styled in CSS.
  platform.style.left = `${x}px`;
  platform.style.top = `${y}px`;
  const gameArea = document.getElementById("game-area");
  gameArea.appendChild(platform);                // AppendChild will add the new element as a child to the focused parent element (#game_area)
  platforms.push(platform);                      // The push method will add the new platform w/coordinates to end of array.
  return platform;                               // return actually calls the function so it can be tested.
}

// Third function - space bug moves left

function moveLeft(spaceBug) {
  const currentLeft = parseInt(spaceBug.style.left, 10) || 0; // This converts the string ("100px") into 100px. || 0 ensures you go back to Zero if is current position not set. 
  const newLeft = Math.max(0, currentLeft - 5);               // New left moves left by 5px. 
  spaceBug.style.left = `${newLeft}px`;                       // moveLeft() now shifts it left by 5px. 

  // Add new left-facing image
  const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_left.PNG")) {
    bugImage.src = "assets/images/space_bug_left.PNG";
  }
}

// Fourth Function - jump right

function moveRight (spaceBug) {
 const currentRight = parseInt(spaceBug.style.left, 10) || 0;
 const newRight = Math.max(0, currentRight + 5);
 spaceBug.style.left = `${newRight}px`;

 const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_right.PNG")) {
    bugImage.src = "assets/images/space_bug_right.PNG";
  }
};



module.exports = {
  createPlatform,
  handleMusicToggle, 
  moveLeft, 
  moveRight
};


