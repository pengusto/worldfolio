# Folio 2019 source attribution

This built runtime is adapted from [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019), an MIT-licensed Three.js and Cannon.js portfolio experience by Bruno SIMON.

GitSkins preserves the original interactive world, car controls, project-board interaction, loading flow, and visual language. The GitSkins adapter adds:

- GitHub profile, avatar, bio, stats, and links loaded from the current username.
- GitHub repositories rendered as project-board artwork and interactive links.
- A generated contribution activity texture for the information area.
- A lightweight profile HUD so the generated portfolio remains identifiable and usable without relying on the original owner's content.
- A saved public-profile snapshot so previews, exports, and published pages stay deterministic.

The runtime does not include the source owner's analytics, tutorial links, personal branding, or project data. The original MIT license and attribution remain included.

The generated runtime is served from this directory so nested template paths work in local and production builds.

## Buildable source and dependency modernization

On 24 October 2026 the recovered application was reconstructed as readable source in `src/Runtime.js`. Third-party bundled implementations were removed in favor of pinned package imports, and the runtime was migrated from Three.js r164 to r186 with the current GSAP release. Geometry, sounds, shaders, profile-board generation and vehicle tuning are retained. `docs/modernization.md` records baseline provenance, migration changes, tests and limitations. Original library and creator notices are included in every build by `scripts/prepare-notices.mjs`.
