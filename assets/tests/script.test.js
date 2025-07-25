/** 
 * @jest-environment jsdom
 */

// ! NOTE: Notes in this file are also made for my learning, so might be longer and more detailed than expected

// The first thing you do is import the function you are testing from the script.js file:

const musicOn = require("../script");

// Parent description of all Music Toggle tests
describe("Music Toggle Functionality", () => {
    describe("on switch", () => {
        test("should play music when switched on", () => {
            expect(musicOn()).toPlay("assets\music\chill_synthwave_playlist_snapshot _white_bat_audio.mp3");
        })
    })

    describe("off switch", () => {

    })
})

// CONTINUE WITH THE ABOVE FROM VIDEO 3 IN LETS MEET JEST. 

// - You need to create a mock to test if music was called, this is because there is no macher, like .toPlay for music. Use chat GPT to help with the mocks and keep what you have as is, following the video. 