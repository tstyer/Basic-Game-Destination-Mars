/** 
 * @jest-environment jsdom
 */

// ! NOTE: Notes in this file are also made for my learning, so they might be longer and more detailed than expected.

// 1: Tests Relating To The Music Toggle.

// First, import the function you are testing from the script.js file:
const { handleMusicToggle } = require("../script");

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

// 2: Tests Relating To The Space Bug / Space Craft

const { createPlatform } = require("../script");

describe("Generate new platforms", () => {
  beforeEach(() => {
    // Mock the dom structure before each test, so the test runs smoothly. 
    document.body.innerHTML = `<div id="game-area"></div>`;
    global.gameArea = document.getElementById("game-area"); 
  });

  describe("New element named 'Platform' created", () => {
    test("The returned element should be a <div>", () => {
      const platform = createPlatform(100, 200);
      expect(platform).toBeInstanceOf(HTMLElement);
      expect(platform.tagName).toBe("DIV");
    });
  });
});


// Test 3: Using arrows to move the space bug

const { moveLeft } = require("../script");

describe("Space Bug moves when arrow keys pushed", () => {
  describe("Space Bug moves left on left key", () => {

    beforeEach(() => {
      document.body.innerHTML = 
      `<div class="space_bug" style="left: 100px; position: absolute;">
        <img src="assets/images/space_bug_right.PNG" />
      </div>`;

      global.spaceBug = document.querySelector(".space_bug");    // Assigns the varaibles spaceBug to a global scale. 
    });

    test("Space Bug continues left on left key down", () => {
      moveLeft(spaceBug);
      expect(spaceBug.style.left).toBe("95px");                  // Every left key down moev left by 5px.
    })
  })
});

// Test 4 - New platforms

const { updatePlatforms, platforms } = require("../script");

describe("Platforms fall and cycle", () => {
  describe("platforms move down when updatePlatform is called", () => {
    let gameArea;
    let platform;

    beforeEach(() => {

      // Begin to set up mock game area, starting with mock html
      document.body.innerHTML = `<div class="game_area"></div>`;

      gameArea = document.querySelector(".game_area");

      // I neded to manually define offsetHeight (jsdom doesn't compute it)
      Object.defineProperty(gameArea, "offsetHeight", {
        configurable: true,
        value: 500,
      });

      // I need to create a mock platform in the dom
      platform = document.createElement("div");
      platform.className = "platform";
      platform.style.position = "absolute";
      platform.style.top = "100px";
      platform.style.left = "50px";

      gameArea.appendChild(platform);

      // Use the same platforms array that updatePlatforms() uses
      platforms.length = 0;            // clear existing contents
      platforms.push(platform);       // add the test platform
    });

    test("platform top increases by 2px", () => {
      updatePlatforms();
      expect(platforms[0].style.top).toBe("102px");
    });
  });
});

// Test 5 - Falling platforms function

const { startPlatformFall } = require("../script");

describe("Platforms start to fall when game starts", () => {
  describe("An interval is set", () => {

    // Mock DOM area
    beforeEach(() => {

      // Jest offers fake timers to be used in mock's
      jest.useFakeTimers();
      // Need to spy on setInterval within the test
      jest.spyOn(global, "setInterval");
    });

    // First test

    test("Calls setInterval", () => {
      startPlatformFall();
      expect(setInterval).toHaveBeenCalled();
    })
  })
})

// Test 6 - generate platforms regularly

const { generatePLatforms } = require("../script");

describe("Platforms falling generator called", => () {
  describe("createPlatform is called", => () {

    beforeEach(() => {
    // Mock the createPlatform function --- REF: (learned from: https://jestjs.io/docs/mock-functions)
    jest.spyOn(script, "createPlatform").mockImplementation(() => {});

    // I also need to mock math.random from the function --- REF: (learned from: https://jestjs.io/docs/mock-functions)
    jest.spyOn(script, "random").mockReturnValue("0.5");
    })
  })
  // 
})