import { test, expect } from "@playwright/test";
import fs from "node:fs";
const url = process.env.WORLDFOLIO_URL || "http://127.0.0.1:5184/";
fs.mkdirSync(".scratch", { recursive: true });
async function openWorld(page) {
  const errors = [],
    missing = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) missing.push(r.url());
  });
  page.on("request", (r) => {
    if (!r.url().startsWith(new URL(url).origin + "/") && !/^(data|blob):/.test(r.url()))
      external.push(r.url());
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.application?.world?.startingScreen?.area?.active);
  return { errors, missing, external };
}
async function start(page) {
  await page.mouse.move(480, 320);
  await page.waitForFunction(() => window.application.world.startingScreen.area.isIn);
  await page.locator("canvas.js-canvas").click({ position: { x: 480, y: 320 } });
  await page.waitForFunction(() => window.application?.world?.car?.chassis);
  await page.waitForFunction(
    () =>
      window.application.world.reveal.matcapsProgress > 0.999 &&
      window.application.world.reveal.floorShadowsProgress > 0.999,
  );
}
test("vehicle tuning and fixed-step driving match the released r164 world", async ({ page }) => {
  const audit = await openWorld(page);
  await start(page);
  const result = await page.evaluate(() => {
    const callbacks = [],
      time = { delta: 1000 / 60, elapsed: 0, on: (event, fn) => callbacks.push(fn) };
    const controls = {
      actions: { up: false, down: false, left: false, right: false, brake: false, boost: false },
      on: () => {},
    };
    const physics = new window.application.world.physics.constructor({
      time,
      controls,
      config: { cyberTruck: false },
      sizes: window.application.sizes,
      sounds: { play: () => {} },
    });
    const car = physics.car;
    const frames = (n) => {
      for (let i = 0; i < n; i++) {
        time.elapsed += time.delta;
        for (const fn of callbacks) fn();
      }
    };
    frames(240);
    const trajectory = [];
    const drive = (name, actions, framesCount) => {
      Object.keys(controls.actions).forEach((k) => (controls.actions[k] = false));
      Object.assign(controls.actions, actions);
      frames(framesCount);
      trajectory.push({
        name,
        position: car.chassis.body.position.toArray(),
        velocity: car.chassis.body.velocity.toArray(),
        quaternion: car.chassis.body.quaternion.toArray(),
        steering: car.steering,
        speed: car.speed,
      });
    };
    drive("accelerate", { up: true }, 120);
    drive("left turn", { up: true, left: true }, 60);
    drive("brake", { brake: true }, 60);
    drive("reverse", { down: true }, 90);
    drive("boost", { up: true, boost: true }, 90);
    return {
      options: JSON.parse(JSON.stringify(car.options)),
      gravity: physics.world.gravity.toArray(),
      trajectory,
    };
  });
  if (process.env.CAPTURE_BASELINE === "1") {
    expect(await page.evaluate(() => window.__THREE__)).toBe("164");
    if (!url.startsWith("https://pengusto.github.io/worldfolio/"))
      throw new Error("Baseline must come from the released site, before deployment.");
    fs.writeFileSync(
      "tests/fixtures/released-driving.json",
      JSON.stringify(result, null, 2) + "\n",
    );
  }
  const baseline = JSON.parse(fs.readFileSync("tests/fixtures/released-driving.json", "utf8"));
  expect(result.options).toEqual(baseline.options);
  expect(result.gravity).toEqual(baseline.gravity);
  for (let i = 0; i < result.trajectory.length; i++) {
    const current = result.trajectory[i],
      old = baseline.trajectory[i];
    expect(current.name).toBe(old.name);
    for (const key of ["position", "velocity", "quaternion"])
      current[key].forEach((v, j) => expect(v).toBeCloseTo(old[key][j], 8));
    expect(current.steering).toBeCloseTo(old.steering, 8);
    expect(current.speed).toBeCloseTo(old.speed, 8);
  }
  expect(audit).toEqual({ errors: [], missing: [], external: [] });
});
test("released start-screen and car appearance", async ({ page }) => {
  test.skip(
    !!process.env.CI,
    "Pixel baselines are reviewed locally on the same OS/GPU; hosted CI checks behavior.",
  );
  const audit = await openWorld(page);
  await expect(page).toHaveScreenshot("released-start.png", {
    maxDiffPixelRatio: 0.003,
    animations: "disabled",
  });
  await start(page);
  await page.evaluate(() => {
    const app = window.application,
      w = app.world;
    app.time.stop();
    // Stable showcase pose; physics remains independently covered by the fixed-step test.
    const body = w.physics.car.chassis.body;
    body.position.set(-5, 0, 0.55);
    body.quaternion.set(0, 0, 0, 1);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
    for (const fn of app.time.callbacks.base.tick) fn();
    const car = w.car;
    car.chassis.object.position.set(-5, 0, 0.27);
    car.chassis.object.quaternion.set(0, 0, 0, 1);
    car.antena.object.position.copy(car.chassis.object.position);
    car.antena.object.quaternion.copy(car.chassis.object.quaternion);
    const camera = app.camera;
    camera.target.set(-5, 0, 0);
    camera.targetEased.copy(camera.target);
    camera.instance.position
      .copy(camera.target)
      .add(camera.angle.value.clone().normalize().multiplyScalar(camera.zoom.distance));
    camera.instance.lookAt(camera.target);
    app.passes.composer.render();
  });
  await expect(page.locator("canvas")).toHaveScreenshot("released-car.png", {
    clip: { x: 240, y: 160, width: 480, height: 320 },
    maxDiffPixelRatio: 0.02,
    animations: "disabled",
  });
  expect(audit).toEqual({ errors: [], missing: [], external: [] });
});
test("keyboard driving, six project links and profile panel", async ({ page }) => {
  const audit = await openWorld(page);
  await start(page);
  const expected = [
    "penguin-patches",
    "let-him-grill",
    "kaplum-studio",
    "push-my-tabs",
    "cookbook",
    "you-got-this",
  ];
  expect(
    await page.evaluate(() =>
      window.application.world.sections.projects.list.map((p) => p.link.href),
    ),
  ).toEqual(expected.map((n) => "https://github.com/pengusto/" + n));
  for (const key of ["w", "ArrowUp"]) {
    const before = await page.evaluate(() =>
      window.application.world.physics.car.chassis.body.position.toArray(),
    );
    await page.keyboard.down(key);
    await page.waitForFunction((old) => {
      const p = window.application.world.physics.car.chassis.body.position;
      return Math.hypot(p.x - old[0], p.y - old[1]) > 0.2;
    }, before);
    await page.keyboard.up(key);
  }
  await page.locator(".gitskins-profile-ui__toggle").click();
  expect(await page.locator("#gitskins-profile-details").isVisible()).toBe(true);
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    const w = window.application.world,
      a = w.sections.projects.items[0].floor.area;
    w.physics.car.chassis.body.position.set(a.position.x, a.position.y, 1);
    w.physics.car.chassis.body.velocity.set(0, 0, 0);
    w.physics.car.chassis.body.wakeUp();
  });
  await page.waitForFunction(
    () => window.application.world.sections.projects.items[0].floor.area.isIn,
  );
  await page.route("https://github.com/**", (r) =>
    r.fulfill({ status: 200, body: "Verified repository target" }),
  );
  const popupPromise = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  const popup = await popupPromise;
  expect(popup.url()).toBe("https://github.com/pengusto/penguin-patches");
  await popup.close();
  expect(audit).toEqual({ errors: [], missing: [], external: [] });
});

test("mobile touch accelerator and release keep working", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const audit = await openWorld(page);
  await page.locator("canvas.js-canvas").tap({ position: { x: 195, y: 422 } });
  await page.waitForFunction(
    () =>
      window.application?.world?.car?.chassis && window.application.world.controls.touch?.forward,
    null,
    { timeout: 10000 },
  );
  await page.waitForFunction(() => window.application.world.reveal.matcapsProgress > 0.999);
  const target = await page.evaluate(() => {
    const e = window.application.world.controls.touch.forward.$element.getBoundingClientRect();
    return {
      x: e.x + e.width / 2,
      y: e.y + e.height / 2,
      before: window.application.world.physics.car.chassis.body.position.toArray(),
    };
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: target.x, y: target.y, id: 1 }],
  });
  await page.waitForFunction(() => window.application.world.controls.actions.up === true);
  await page.waitForFunction((old) => {
    const p = window.application.world.physics.car.chassis.body.position;
    return Math.hypot(p.x - old[0], p.y - old[1]) > 0.1;
  }, target.before);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForFunction(() => window.application.world.controls.actions.up === false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => window.__THREE__)).toBe("186");
  await page.screenshot({ path: ".scratch/mobile-r186.png" });
  expect(audit).toEqual({ errors: [], missing: [], external: [] });
  await context.close();
});
