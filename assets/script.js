function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) {
    audio.play();
    console.log("Music playing...");
  } else {
    audio.pause();
    console.log("Music paused...");
  }
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
    }
  });
}

module.exports = handleMusicToggle;
