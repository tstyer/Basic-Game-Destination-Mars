// ---
// Code will be mized with jQuery and regular JS to demonstrate understanding of both.
// --- 

// NOTE: There are more than expected notes here for my learning. 

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

    // Platform Array

    let platforms = [];

    // Left-key event listener

    document.addEventListener("keydown", (e) =>{
      if(e.key === ArrowLeft) {
        moveLeft(spaceBug);
      }
    });

    if ($music.length) {
      const music = $music[0];

      // This is to restore saved setting from localStorage and keep music playing. 
      const musicOn = localStorage.getItem("music_on") === "true";

      // Start or pause the music based on the saved value. 
      if (musicOn) {
        music.play().catch(() => {
          // Autoplay blocked — plays on user interaction
        });
      } else {
        music.pause();
      }

      // If toggle exists (only on settings page), sync it and add event listener.
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

function moveLeft (spaceBug) {
  const currentLeft = parseInt(spaceBug.style.left, 10) || 0; // This converts the string ("100px") into 100px. || 0 ensures you go back to Zero if is current position not set. 
  const newLeft = Math.max(0, currentLeft - 5);               // New left moves left by 5px. 
  spaceBug.style.left = `${newLeft}px`;                       // moveLeft() now shifts it left by 5px. 

  // Add new left-facing image
  const bugImage = spaceBug.querySelector("img");
  if (bugImage && !bugImage.src.includes("space_bug_left.PNG")) {
    bugImage.src = "assets/images/space_bug_left.PNG";
  }
}


module.exports = {
  createPlatform,
  handleMusicToggle, 
  moveLeft
};


