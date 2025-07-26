function handleMusicToggle(checkbox, audio) {
  if (checkbox.checked) {
    audio.play();
    console.log("Music playing...");
  } else {
    audio.pause();
    console.log("Music paused...");
  }
}

// Only run this block if jQuery exists (for browser only)
if (typeof window !== "undefined" && typeof $ !== "undefined") {
  $(document).ready(function () {
    const $musicToggle = $('#music_toggle');
    const $music = $('#music');

    $music[0].pause();

    $musicToggle.on('change', function () {
      handleMusicToggle(this, $music[0]);
    });
  });
}

module.exports = handleMusicToggle;
