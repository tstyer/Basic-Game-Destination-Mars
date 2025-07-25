// 1: Load JS using jQuery code.

$(document).ready(function () {

    // jQuery to select id's
    const $musicToggle = $('#music_toggle');
    const $music = $('music');

    // Ensure music is paused upon loading
    $music.pause();

})
