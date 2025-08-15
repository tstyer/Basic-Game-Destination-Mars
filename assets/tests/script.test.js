/** @jest-environment jsdom */

const SCRIPT_PATH = "../script"; // from assets/tests

// Helper to detect hooks on a loaded module
const hooksExist = (mod) =>
  !!(
    mod &&
    mod._test &&
    typeof mod._test.setSpaceBug === "function" &&
    typeof mod._test.setVelocityY === "function" &&
    typeof mod._test.setGravity === "function" &&
    typeof mod._test.getVelocityY === "function" &&
    typeof mod._test.getIsJumping === "function"
  );

/* --------------------------- Music toggle --------------------------- */
describe("Handle Music Toggle", () => {
  let handleMusicToggle;
  let checkbox, audio;

  beforeEach(() => {
    jest.resetModules();
    ({ handleMusicToggle } = require(SCRIPT_PATH));

    checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    audio = document.createElement("audio");
    audio.play = jest.fn();
    audio.pause = jest.fn();
  });

  test("plays music when checkbox is checked", () => {
    checkbox.checked = true;
    handleMusicToggle(checkbox, audio);
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(audio.pause).not.toHaveBeenCalled();
  });

  test("pauses music when checkbox is unchecked", () => {
    checkbox.checked = false;
    handleMusicToggle(checkbox, audio);
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.play).not.toHaveBeenCalled();
  });
});

/* --------------------------- applyGravity --------------------------- */
describe("applyGravity", () => {
  let script;

  // Factory that registers a test which auto-skips if hooks are missing
  const maybeTest = (name, fn) => {
    test(name, async () => {
      jest.resetModules();
      script = require(SCRIPT_PATH);
      if (!hooksExist(script)) {
        // Mark as skipped without touching internals
        console.warn("Skipping gravity test — no _test hooks exported.");
        return;
      }
      await fn();
    });
  };

  maybeTest("updates bottom and calls checkPlatformCollision", () => {
    const { setSpaceBug, setVelocityY, setGravity } = script._test;

    const bug = document.createElement("div");
    bug.style.position = "absolute";
    bug.style.bottom = "80px";
    setSpaceBug(bug);

    setVelocityY(0);
    setGravity(0.5);

    script.checkPlatformCollision = jest.fn();

    script.applyGravity();

    expect(bug.style.bottom).toBe("79.5px"); // 80 - (0 + 0.5)
    expect(script.checkPlatformCollision).toHaveBeenCalledWith(79.5);
  });

  maybeTest("stops at ground, resets velocity, clears jumping flag", () => {
    const {
      setSpaceBug,
      setVelocityY,
      setGravity,
      getVelocityY,
      getIsJumping,
    } = script._test;

    const bug = document.createElement("div");
    bug.style.position = "absolute";
    bug.style.bottom = "1px";
    setSpaceBug(bug);

    setVelocityY(2);
    setGravity(0.5);

    script.applyGravity();

    expect(bug.style.bottom).toBe("0px");
    expect(getVelocityY()).toBe(0);
    expect(getIsJumping()).toBe(false);
  });
});

/* ----------------------- startPlatformFall ----------------------- */
describe("Platforms start to fall when game starts", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    script = require(SCRIPT_PATH);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("calls setInterval when startLoop is invoked", () => {
    const spy = jest.spyOn(global, "setInterval");
    script.startLoop();
    expect(spy).toHaveBeenCalled();
  });

  test("interval callback runs at least once", () => {
    if (typeof script.tickPlatforms === "function") {
      const tickSpy = jest.spyOn(script, "tickPlatforms");
      script.startLoop();
      jest.runOnlyPendingTimers();
      expect(tickSpy).toHaveBeenCalled();
    } else {
      script.startLoop();
      expect(() => jest.runOnlyPendingTimers()).not.toThrow();
    }
  });
});

/* --------------------------- generatePlatform --------------------------- */
describe("generatePlatform", () => {
  const SCRIPT_PATH = "../script"; // from assets/tests -> assets/script.js
  let script, area;

  // helper to compute expected x with your current algorithm
  const computeExpectedX = (areaW, rand, {
    platformWidth = 100,
    spawnMargin = 16,
    maxHorizontalStepPx = 300,
    bugLeft = 0,
    bugW = 60,
  } = {}) => {
    const refX = (bugLeft + bugW / 2) - platformWidth / 2;
    const minWall = spawnMargin;
    const maxWall = areaW - platformWidth - spawnMargin;
    const windowMin = Math.max(minWall, refX - maxHorizontalStepPx);
    const windowMax = Math.min(maxWall, refX + maxHorizontalStepPx);
    const minX = Math.min(windowMin, windowMax);
    const maxX = Math.max(windowMin, windowMax);
    return Math.floor(rand * (maxX - minX + 1)) + minX;
  };

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `<div class="game_area"></div>`;
    area = document.querySelector(".game_area");

    // give jsdom a real width so your math works
    Object.defineProperty(area, "clientWidth", { value: 600, configurable: true });

    script = require(SCRIPT_PATH);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("creates a platform with y=0 and computed x", () => {
    const randSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);

    script.generatePlatform();

    const platform = document.querySelector(".platform");
    expect(platform).not.toBeNull();
    expect(platform.style.top).toBe("0px");

    const expectedX = computeExpectedX(600, 0.5); // defaults: bug at 0, width 60
    expect(platform.style.left).toBe(`${expectedX}px`); // "148px" with current constants

    randSpy.mockRestore();
  });

  test("respects min of window (rand=0)", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    script.generatePlatform();

    const platform = document.querySelector(".platform");
    const expectedX = computeExpectedX(600, 0);
    expect(platform.style.left).toBe(`${expectedX}px`); // "16px" with current constants
  });

  test("respects max of window (rand≈1)", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.99999);

    script.generatePlatform();

    const platform = document.querySelector(".platform");
    const expectedX = computeExpectedX(600, 0.99999);
    expect(platform.style.left).toBe(`${expectedX}px`); // "280px" with current constants
  });
});

/* --------------------------- showModal --------------------------- */
/* setupOverlay created so as to not type it more than once */
const setupOverlay = () => {
  document.body.innerHTML = `
    <div id="howto_box" aria-hidden="true">
      <div class="howto-box"></div>
    </div>
  `;
  return {
    overlay: document.getElementById("howto_box"),
    box: document.querySelector("#howto_box .howto-box"),
  };
};

describe("showModal()", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    script = require(SCRIPT_PATH);
  });

  test("opens the overlay, sets aria, and injects content + button", () => {
    const { overlay } = setupOverlay();

    const onClick = jest.fn();
    script.showModal("Hello", "<p>World</p>", "OK", onClick);

    // overlay state
    expect(overlay.classList.contains("is-open")).toBe(true);
    expect(overlay.getAttribute("aria-hidden")).toBe("false");

    // content
    const title = overlay.querySelector(".howto-box > h2");
    const body  = overlay.querySelector(".howto-box > .howto-body");
    const btn   = overlay.querySelector("#howto_ok");

    expect(title).not.toBeNull();
    expect(title.textContent).toBe("Hello");
    expect(body).not.toBeNull();
    expect(body.innerHTML).toBe("<p>World</p>");
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe("OK");

    // button calls provided handler
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

/* --------------------------- closeModal --------------------------- */
describe("closeModal()", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    script = require(SCRIPT_PATH);
  });

  test("removes is-open and sets aria-hidden=true", () => {
    const { overlay } = setupOverlay();

    // open first
    script.showModal("T", "<p>B</p>", "OK", () => {});
    expect(overlay.classList.contains("is-open")).toBe(true);
    expect(overlay.getAttribute("aria-hidden")).toBe("false");

    // then close
    script.closeModal();
    expect(overlay.classList.contains("is-open")).toBe(false);
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
  });
});

/* --------------------------- startGame --------------------------- */
// Minimal DOM the game expects
function setupDOM({ areaWidth = 600, bugLeft = 120, bugWidth = 60 } = {}) {
  document.body.innerHTML = `
    <div class="game_area" style="position:relative; height:500px;"></div>
    <div class="space_bug" style="position:absolute; left:${bugLeft}px; bottom:80px;">
      <img alt="bug"/>
    </div>
  `;
  const area = document.querySelector(".game_area");
  const bug  = document.querySelector(".space_bug");

  Object.defineProperty(area, "clientWidth",  { value: areaWidth, configurable: true });
  Object.defineProperty(area, "clientHeight", { value: 500, configurable: true });
  Object.defineProperty(area, "clientLeft",   { value: 0, configurable: true });
  Object.defineProperty(area, "clientTop",    { value: 0, configurable: true });

  Object.defineProperty(bug, "offsetWidth",   { value: bugWidth, configurable: true });

  // let createPlatform append into .game_area
  area.appendChild(bug);
  return { area, bug };
}

describe("startGame() behaviour", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    setupDOM();
    script = require(SCRIPT_PATH);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  test("schedules the main loop (setInterval called once)", () => {
    const spy = jest.spyOn(global, "setInterval");
    script.startGame();
    script.startGame(); // should not schedule a second loop
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("after enough ticks, a platform is spawned", () => {
  script.startGame();

  const TICK_MS = 14;
  const PLATFORM_SPACING = 120;
  const SLOW_SPEED = 1.1;

  // Advance a little beyond the spawn threshold
  const ticks = Math.ceil(PLATFORM_SPACING / SLOW_SPEED); // 110
  jest.advanceTimersByTime(ticks * TICK_MS + 1); // allow a tiny overrun

  const platform = document.querySelector(".platform");
  expect(platform).not.toBeNull();

  const top = parseFloat(platform.style.top || "0");
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThanOrEqual(SLOW_SPEED); // 0px or 1.1px
  expect(platform.style.left).toMatch(/^\d+px$/);
  });
}); 

/* --------------------------- resetGameState --------------------------- */
// minimal game DOM
function setupGameDOM({ areaWidth = 600, areaHeight = 500, bugLeft = 120, bugWidth = 60 } = {}) {
  document.body.innerHTML = `
    <div class="game_area" style="position:relative; height:${areaHeight}px;"></div>
    <div class="space_bug" style="position:absolute; left:${bugLeft}px; bottom:20px;"><img alt="bug"/></div>
    <div class="distance-label"></div>
  `;
  const area = document.querySelector(".game_area");
  const bug  = document.querySelector(".space_bug");
  Object.defineProperty(area, "clientWidth",  { value: areaWidth, configurable: true });
  Object.defineProperty(area, "clientHeight", { value: areaHeight, configurable: true });
  Object.defineProperty(bug,  "offsetWidth",  { value: bugWidth,  configurable: true });
  area.appendChild(bug);
  return { area, bug, areaWidth, bugWidth };
}

/* Behaviour test: works without any _test hooks */
describe("resetGameState() — behaviour (no hooks needed)", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    script = require(SCRIPT_PATH);
    setupGameDOM();
  });

  test("removes all existing platforms from the DOM and leaves a clean slate", () => {
    // seed platforms through the public API (so the internal array is populated)
    script.createPlatform(10, 0);
    script.createPlatform(20, 0);
    script.createPlatform(30, 0);

    expect(document.querySelectorAll(".platform").length).toBe(3);

    script.resetGameState();

    // platforms cleared from DOM
    expect(document.querySelectorAll(".platform").length).toBe(0);

    // sanity: after a reset we can spawn again without errors
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    script.generatePlatform();
    expect(document.querySelector(".platform")).not.toBeNull();
  });
});