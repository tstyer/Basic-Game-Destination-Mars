/** @jest-environment jsdom */

/**
 * Star Hopper — unified Jest tests (CommonJS)
 * Expects your script to export:
 *  - handleMusicToggle, applyGravity, startPlatformFall,
 *    generatePlatform, createPlatform, checkPlatformCollision, (optional) tickPlatforms
 *  - _test hooks: { setSpaceBug, setVelocityY, setGravity, getVelocityY, getIsJumping }
 *
 * If names differ, tweak the requires/spies below.
 */

/* --------------------------- Music toggle --------------------------- */
describe("Handle Music Toggle", () => {
  let handleMusicToggle;
  let checkbox, audio;

  beforeEach(() => {
    jest.resetModules();
    const mod = require("../script");
    handleMusicToggle = mod.handleMusicToggle;

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
  let setSpaceBug, setVelocityY, setGravity, getVelocityY, getIsJumping;
  let bug;

  beforeEach(() => {
    jest.resetModules();
    script = require("../script");

    ({ setSpaceBug, setVelocityY, setGravity, getVelocityY, getIsJumping } =
      script._test || {});

    // Guard if hooks are missing
    if (!setSpaceBug) throw new Error("Missing _test hooks in script.js");

    bug = document.createElement("div");
    bug.style.position = "absolute";
    bug.style.bottom = "80px";

    setSpaceBug(bug);
    setVelocityY(0);
    setGravity(0.5);

    // Avoid side effects from collisions during unit test
    script.checkPlatformCollision = jest.fn();
  });

  test("updates bottom and calls checkPlatformCollision", () => {
    script.applyGravity();
    expect(bug.style.bottom).toBe("79.5px"); // 80 - (0 + 0.5)
    expect(script.checkPlatformCollision).toHaveBeenCalledWith(79.5);
  });

  test("stops at ground, resets velocity, clears jumping flag", () => {
    bug.style.bottom = "1px";
    setVelocityY(2);   // falling
    setGravity(0.5);

    script.applyGravity();

    expect(bug.style.bottom).toBe("0px");
    expect(getVelocityY()).toBe(0);
    expect(getIsJumping()).toBe(false);
  });
});

/* ----------------------- startPlatformFall/timers ----------------------- */
describe("Platforms start to fall when game starts", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    script = require("../script");
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("calls setInterval when startPlatformFall is invoked", () => {
    const spy = jest.spyOn(global, "setInterval");
    script.startPlatformFall();
    expect(spy).toHaveBeenCalled();
  });

  test("interval callback runs at least once", () => {
    if (typeof script.tickPlatforms === "function") {
      const tickSpy = jest.spyOn(script, "tickPlatforms");
      script.startPlatformFall();
      jest.runOnlyPendingTimers();
      expect(tickSpy).toHaveBeenCalled();
    } else {
      // Smoke-test that timers are scheduled and runnable
      script.startPlatformFall();
      expect(() => jest.runOnlyPendingTimers()).not.toThrow();
    }
  });
});

/* --------------------------- generatePlatform --------------------------- */
describe("generatePlatform", () => {
  let script;

  beforeEach(() => {
    jest.resetModules();
    script = require("../script");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("calls createPlatform with y=0 and computed x", () => {
    const randSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const createSpy = jest
      .spyOn(script, "createPlatform")
      .mockImplementation(() => {});

    script.generatePlatform();

    expect(createSpy).toHaveBeenCalledWith(150, 0); // floor(0.5*300)
    randSpy.mockRestore();
  });

  test("x stays within bounds [0, 299]", () => {
    const createSpy = jest
      .spyOn(script, "createPlatform")
      .mockImplementation(() => {});

    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)        // -> x 0
      .mockReturnValueOnce(0.99999); // -> x 299

    script.generatePlatform();
    script.generatePlatform();

    expect(createSpy).toHaveBeenNthCalledWith(1, 0, 0);
    expect(createSpy).toHaveBeenNthCalledWith(2, 299, 0);
  });
});
