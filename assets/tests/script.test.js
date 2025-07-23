/**
 * @jest-environment jsdom
 */

// first test: testing the music toggle
describe("music toggle function", () => {
    // describing the two variables to use in the test
    let checkbox, audio;

    // before each test, set up the DOM
    beforeEach(() => {
        document.body.innerHTML = 
        <label>
        <input type="checkbox" id="music_toggle">
        </label>
        <audio id="music">
        <source src="assets/music/example.mp3" type="audio/mpeg">
        </audio>
    `;
    })

    
};