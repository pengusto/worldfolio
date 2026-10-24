# Pengusto Worldfolio

<a href="https://pengusto.github.io/worldfolio/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/worldfolio-banner-dark-v1.png"><source media="(prefers-color-scheme: light)" srcset="docs/assets/worldfolio-banner-light-v1.png"><img src="docs/assets/worldfolio-banner-light-v1.png" width="1200" alt="Worldfolio — Pengusto’s penguin drives an orange rover between project destinations. Open the interactive portfolio."></picture></a>

[Open the portfolio](https://pengusto.github.io/worldfolio/) · [GitHub profile](https://github.com/pengusto)

An independently hosted version of Bruno SIMON’s MIT-licensed Folio 2019, personalized through the recovered GitSkins adapter. The scene, geometry, materials, vehicle tuning, controls and eight-repository profile snapshot are retained. The original runtime displays the first six repositories as destinations. Creator attribution remains visible in the world and the original notices are included.

## Develop and build

Use Node.js 22.12 or newer and npm. The upstream npm workflow is retained; exact versions and the complete dependency graph are recorded in `package.json` and `package-lock.json`.

```sh
npm ci --ignore-scripts
npm run dev
npm run check
npm run build
npm test
npm run test:e2e
```

On a local Mac, browser tests use installed Google Chrome. In CI they use the pinned Playwright Chromium installation. Pixel comparisons run locally on the same platform as the original screenshots; hosted CI runs the driving, interaction and touch checks. `npm run check` checks JavaScript syntax; this is a JavaScript project without a separate TypeScript type-check stage.

`npm run preview -- --port 5184` serves the production build locally. Click **START**, then use arrow keys / WASD to drive, Shift for boost, Space / Ctrl to brake, R to reset, and Enter near a project board. Touch controls remain available on mobile.

## Dependency update

The source now imports Three.js **0.186.1**, GSAP **3.15.0**, Cannon **0.6.2**, dat.gui **0.7.9** and Howler **2.2.4**. The latter three are still their latest published npm versions; their engines were not substituted. Vite **8.3.5** builds the site. Three’s current loaders, controls, geometry utilities, postprocessing and Draco decoder assets come from the same pinned release.

The original deployment was a compiled r164 bundle. The application source was recovered from that exact bundle, its top-level components given readable names, and its bundled library implementations replaced by package imports. It was first rebuilt against the original library versions and compared with the released site before upgrading. This retains the GitSkins-specific board/profile adaptation rather than substituting the unmodified Bruno Simon site or an approximation. [Migration and verification details](docs/modernization.md).

## Hosting and updates

GitHub Pages uses the **GitHub Actions** publishing source. `.github/workflows/deploy.yml` installs from the lockfile, builds, verifies original asset hashes/notices, tests driving and touch, and uploads only `dist/`. The deploy job runs only for `main` after all build checks pass. A failed build/test leaves the last successful deployment online. The modernization branch builds and tests without deploying.

For another static host, upload the contents of `dist/`, keeping its structure. Relative asset paths support the existing `/worldfolio/` Pages URL. Visitors require no Node server, GitSkins API, live GitHub API, token or remote font service. Generated full license notices are included under `dist/licenses/`.

Edit **`profile.json`** and rebuild to update public profile/project information. It is embedded by `src/profile.js`; there is no second data file to synchronize. The avatar is local. The unused GitSkins service fallback and browser-wide image-source monkeypatch were removed. The same safe original-project-texture replacement is now explicit in the resource loader.

## Provenance and limits

`SOURCE.md`, `LICENSE.md`, `RECOVERY-MANIFEST.json` and `fonts/OFL.txt` (under `public/`) retain attribution, origin information and the original downloaded asset hashes. The recovery manifest describes the pre-modernization archive; it is not a manifest of the current built filenames. The original deployment remains in Git history at `fc0c594` for comparison and rollback.

The existing continuous 3D rendering, start screen and mobile layout are retained. This update does not introduce a full non-WebGL or reduced-motion alternative for the interactive world. Physical iOS/Safari acceptance remains a manual check. The profile README keeps its own GIF and reduced-motion poster, with the same portfolio URL.
