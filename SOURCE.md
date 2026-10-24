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
