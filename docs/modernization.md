# Runtime modernization — 24 October 2026

## Baseline and source recovery

The released baseline is `fc0c594`, bundle `assets/index-B3T5AeNX.js`, Three.js r164 / GSAP 3.12.5. Its advertised public source map returned 404. A local source reference from `brunosimon/folio-2019` at `540f13573a6da282eae942a4c67335b97cd18970` identifies the original components and MIT provenance, but lacks the GitSkins-specific profile/board adapter.

Application statements were therefore recovered directly from the deployed bundle, separated from third-party implementations, assigned readable component names and formatted into `src/Runtime.js`. Their original shaders, world placement, geometry, vehicle dimensions, steering, suspension, acceleration, braking and input behavior are retained. No minified Three.js, GSAP, Cannon, dat.gui or Howler implementation remains in application source. Addons are imported from the same Three.js package as the renderer.

The source was first rebuilt with Three 0.164.1 and GSAP 3.12.5, then verified against the released images and deterministic vehicle trace. Only after that comparison were the current packages installed. `npm outdated --json` returned `{}` after the direct dependency upgrade. npm reported no known audit vulnerabilities in the installed dependency graph at verification time.

## Versions

| Package | Old runtime | Current pin |
| --- | --- | --- |
| Three.js | r164 | 0.186.1 / r186 |
| GSAP | 3.12.5 | 3.15.0 |
| Cannon | 0.6.2 | 0.6.2, current published release |
| dat.gui | 0.7.9 | 0.7.9, current published release |
| Howler | 2.2.4 | 2.2.4, current published release |
| Vite | Previously supplied compiled output | 8.3.5 |
| Playwright | No test source in deployment | 1.64.1 |

Upstream npm tooling is retained. Replacing Cannon with a different physics engine or dat.gui with another UI library would be a separate change, not a version update, and was not needed here. Their old release numbers do not imply a newer release was skipped.

## Required adaptations

A first-touch start race was reproduced in the old released version: the synthetic mouse event could arrive before the frame-based hover raycast. The migrated source resolves a short single-finger canvas tap synchronously on touch end and prevents its duplicate synthetic mouse event. Drag, long-press and multi-touch gestures do not activate areas. This fixes the tested first tap without changing vehicle physics or steering. The held-touch browser test starts without a mouse-hover warm-up to protect that case.

- TransformControls is a Controls instance in modern Three.js. Its scene helper is obtained with `getHelper()`; the helper, rather than the controller object, is added to the scene and shown/hidden. Both vehicle and shadow debug helpers are adapted. The browser tests fail on console errors, including the removed Object3D interface.
- Draco uses the decoder assets shipped with current Three.js. The old forced-JS decoder setting and obsolete static release call are removed. Vite resolves and packages current loader/decoder resources locally.
- `profile.json` is the single profile source, imported before application initialization. The unused GitSkins API fallback is removed. No new profile facts were added.
- The original image-prototype safety patch is replaced by the equivalent explicit project-floor-texture rule in the image loader. It still substitutes the safe local black texture before the original-owner project artwork can load, without modifying all browser images.
- Static URLs and the local font are passed through Vite. The existing manifest now points to an icon that exists at a project Pages URL. No scene models, sounds or font bytes were changed.
- Full dependency notices and original attribution files are copied into the deployment during `prebuild`.

## Verification gates

`tests/fixtures/released-driving.json` was captured from the released r164 site **before** deployment. A clean physics world uses fixed 1/60-second steps to settle the vehicle and then accelerate, turn left, brake, reverse and boost. Vehicle options and gravity must match exactly; sampled positions, velocities, quaternions, steering and speed must match to eight decimal places. This isolates driving behavior from renderer-dependent frame rates.

The original start-screen and car screenshots were also captured before updating the site. Local screenshot checks use the same Chrome/OS/software renderer. Small anti-aliasing tolerance is allowed (0.3% start screen, 2% scene). These baselines must not be regenerated from the updated site merely to make an upgrade pass. The capture route explicitly requires r164. Local visual review remains a release gate; CI skips platform-specific pixel comparisons.

Browser checks cover real WASD/arrow driving, six repository URLs, Enter opening the correct repository, profile Details/Escape and mobile held-touch acceleration/release. Page errors, console errors, missing resources and external resource requests fail the checks. Source tests verify the original model/sound/font hashes and keep creator notices and credentials out of the built artifact. JavaScript syntax and Vite module resolution are checked; no TypeScript type-check claim is made.

## Publishing and rollback

The feature branch is built/tested without a deployment. Once local verification passes, hosted CI must also pass. Pages is changed from legacy branch-root publishing to the Actions artifact so source files and dependencies are not mistaken for the finished website. `main` deploys only `dist/` after successful checks. The URL and profile README link remain unchanged.

To roll back, restore the previous static deployment commit `fc0c594` and the previous Pages source (`main`, `/`, legacy), or revert to a known successful modern source commit and dispatch the workflow. Do not publish source HTML directly: it requires a Vite build.

The original recovered archive is retained outside the publishing checkout as additional evidence. Temporary extraction tools are not part of the build. Physical iOS/Safari acceptance and a non-WebGL/reduced-motion world redesign remain outside this dependency update.

Lesson: when upgrading a recovered compiled site, establish a working source rebuild and capture released visual/physics baselines first. Preserve behavior through explicit migration checks instead of replacing libraries inside an opaque minified bundle.

## Primary references

- <https://github.com/mrdoob/three.js/wiki/Migration-Guide>
- <https://registry.npmjs.org/three/latest>
- <https://registry.npmjs.org/gsap/latest>
- <https://vite.dev/guide/static-deploy.html#github-pages>

## Local result

The complete local run passed on 24 October 2026: JavaScript syntax checks, production build, all three source/asset tests, all four browser tests, the two released screenshot comparisons and the fixed-step driving fixture. The final browser suite took 42 seconds. The touch case includes a first tap without a mouse hover and actual held touch input. No missing resources, page/console errors or external resource requests were observed. The desktop reference and mobile screenshot were visually reviewed. The production bundle retains Vite's size warning (about 1.23 MB before gzip); no performance improvement is claimed by the version update.
