# Worldfolio README artwork

The README banner is a project illustration, not a screenshot of the running world. It depicts Pengusto’s penguin driving an orange rover past abstract project destinations. The portfolio’s actual scene and its existing README demo remain separate.

## Assets and provenance

Both PNGs are 2172 × 724 pixels (3:1), generated on 2026-10-24 using the built-in image generation tool. They live under `docs/assets/` and are not bundled into the portfolio’s `dist/` runtime.

| Asset | Generation |
| --- | --- |
| `worldfolio-banner-dark-v1.png` | New Worldfolio scene using Pengusto’s existing penguin as the character reference. |
| `worldfolio-banner-light-v1.png` | Colour and lighting edit of the dark banner, preserving its composition, character, vehicle and title. |

Character reference: [Pengusto’s existing profile artwork](https://github.com/pengusto/pengusto/blob/main/assets/profile-banner-purple.png), SHA-256 `f4890e514ee39fd4199f7c5426e98de2bb037a548136882d2b5b9ef0b521b1e7`. The supplied banner skill’s `penguin-dark.png` is the same image. The reference supplies the compact dark-plum penguin, cream face/belly, oval eyes, orange beak and tactile illustration quality; its island scene was not reused. Existing reference artwork and third-party assets retain their original rights and notices.

Generation direction: a wide banner with the exact title **Worldfolio** on the left and the penguin driving a small coral-orange off-road rover on a terracotta track on the right. Abstract geometric signposts evoke project destinations without inventing repository names, metrics or features. The dark artwork uses a deep plum background, an ivory title and lavender accents. The light edit keeps the same scene with pale ivory/lavender surroundings, a dark plum title and soft daylight.

Final asset SHA-256:

```text
1093cc4f35cf01938b1e9dc8632cbf58246b973a74475b58d0f31343566f9b22  worldfolio-banner-dark-v1.png
8d6f24dd088d58d24fe6d1344a5f360bc2716185efbf3e362b62c98c5a5d4a05  worldfolio-banner-light-v1.png
```

## README delivery

The linked `picture` uses real light/dark images selected with `prefers-color-scheme`; its fallback is the light asset. The whole image links to the live portfolio. Linked inline HTML stays on one line so GitHub’s Markdown parser keeps the picture inside its anchor. One responsive composition is used for both desktop and mobile; no small subtitle needs a separate mobile asset.

Verified with GitHub’s Markdown rendering API, then with that rendered HTML and the actual assets in local Chrome at 320, 390 and 1440 px in both themes. All six views selected the correct image, retained the portfolio link, loaded at the original aspect ratio and had no horizontal page overflow. The title and penguin remained readable at 320 px. The local preview checks layout and theme selection; it does not reproduce all of GitHub’s page chrome.
