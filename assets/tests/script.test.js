/** 
 * @jest-environment jsdom
 */

// ! NOTE: Notes in this file are also made for my learning, so might be longer and more detailed than expected

// The first thing you do is import the function you are testing from the script.js file:

const handleMusicToggle = require("../script");

// Parent description of all Music Toggle tests
describe("Handle Music Toggle", () => {
    describe("on switch", () => {

        // Variables need to be described outside the beforeEach scope.
        let checkbox, audio;
            
            // Before each test... 
            beforeEach(() => {
                // Need to create mock checkbox and audio for this type of test
                checkbox = document.createElement("input");
                checkbox.type = "checkbox";

                audio = document.createElement("audio");
                audio.play = jest.fn();
                audio.pause = jest.fn();
            });

            // First test on music toggle

            test("plays music when checkbox is checked", () => {
            checkbox.checked = true;

            handleMusicToggle(checkbox, audio);

            expect(audio.play).toHaveBeenCalled();
            expect(audio.pause).not.toHaveBeenCalled();
            });
    });
});

 

