// ---
// Code will be mized with jQuery and regular JS to demonstrate understanding of both.
// --- 

// NOTE: There are more than expected notes here for my learning. 


// MAIN VARIABLES

const gameArea = document.getElementById('game_area');
const spaceBug = document.getElementById('space_bug'); 
let velocityY = 0;
let gravity = 0.5;
let isJumping = false;

// Platform Array

let platforms = [];


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

// TUESDAY 29TH - CONTINUE HERE AND SORT THIS FUNCTION AND TEST OUT

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

// Only runs in browser with jQuery available.
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {
    const $music = $('#music');
    const $musicToggle = $('#music_toggle');

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

      // Logic used for the space bug
      const bugContainer = $(".space_bug");
      // This if statement exists to ensure the code only runs if the space bug is available.
      if(bugContainer) {
        const bugImage = $("img");
      }

    }
  });
}


module.exports = {
  createPlatform,
  handleMusicToggle
};


