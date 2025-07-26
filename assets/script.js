// ---
// Code will be mized with jQuery and regular JS to demonstrate understanding of both
// --- 

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

// Second function - 

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

      // CONTINUE FROM BELOW - WRITE THE BEGINNING, THEN START TO WRITE THE TEST FOR THE NEW FUNCTION
      // This is saved in the 'Game Section Work' folder in chat GPT


      // Logic used for the space bug
      const bugContainer = $(".space_bug");
      // This if statement exists to ensure the code only runs if the space bug is available.
      if(bugContainer) {
        const bugImage = $("img");
      }

    }
  });
}



module.exports = handleMusicToggle;
