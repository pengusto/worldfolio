# Pengusto Worldfolio

[Open the interactive portfolio](https://pengusto.github.io/worldfolio/) · [GitHub profile](https://github.com/pengusto)

This is the actual built Worldfolio runtime served by GitSkins, personalized with the public Pengusto data embedded in the owner-supplied Portfolio OS ZIP. It is not the earlier custom island prototype and not an official downloaded Worldfolio ZIP.

The official Worldfolio manifest returned HTTP 503 on 24 October 2026 with `The Folio 2019 export assets are temporarily unavailable.` The public template assets were available. They were downloaded without credentials or access-control changes and verified locally.

## Run

From this folder:

```sh
python3 -m http.server 5181 --bind 127.0.0.1
```

Open <http://127.0.0.1:5181/?username=pengusto>, click **START**, and drive with the arrow keys or WASD. Press Enter near a project board. The **Details** button opens the profile HUD. A static server is required; opening `index.html` as a local file is insufficient.

## Self-host

Upload this entire folder to a static host. There is no build step, GitSkins API requirement, backend or bearer token. Keep the directory structure, `profile-data.js`, licenses and visible creator credit. The working runtime includes local geometry, sounds, Draco decoder, avatar and Comic Neue font.

GitHub Pages serves the repository root from the `main` branch at <https://pengusto.github.io/worldfolio/>. `.nojekyll` keeps the already-built files intact. Publish changes by committing the updated static files to `main`; there is no package installation or compile step.

The bundle and model files are unmodified. Local changes are limited to embedding the supplied profile through the runtime's existing `window.gitskinsFolioData` interface, defaulting the URL username to `pengusto`, keeping the visible Bruno SIMON attribution, and serving the avatar and font locally. This follows the same profile-injection mechanism found in GitSkins' public export implementation.

The stored profile contains eight repositories; the unchanged Worldfolio runtime renders the first six as project destinations. The statistics are an export-time snapshot. It is not a live GitHub feed.

## Provenance and maintenance

- `SOURCE.md` and `LICENSE.md`: notices supplied with GitSkins' public runtime.
- `RECOVERY-MANIFEST.json`: origin URLs, sizes and SHA-256 checksums for recovered template files.
- `profile.json`: local reference data; the runtime uses the copy embedded in `profile-data.js`.
- `fonts/OFL.txt`: license for the local Comic Neue font.

After editing `profile.json`, update the data assignment in `profile-data.js` as well. Preserve the URL-default setup before that assignment. No credential is needed to serve the site.

This is a faithful runtime recovery, not an accessibility or performance redesign. The original runtime's continuous animation, full-scene rendering and initial 3D start screen remain. A complete non-WebGL/reduced-motion fallback and physical iOS/Safari acceptance have not been added or certified.
