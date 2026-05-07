# Adhibit Site

Public product and support site for Adhibit.

The project is intentionally static and self-contained:

- `src/index.html` contains the page structure.
- `src/styles.css` contains the visual system and motion.
- `src/main.js` contains lightweight interaction.
- `assets/` contains optimized public screenshots and the app icon.
- `npm run build` creates `dist/index.html`, `dist/worker.js`, and `docs/index.html`.

The generated Worker file can be deployed to Cloudflare and served at:

https://adhibit.lzw-glory.top/support

No app source code, private keys, or local data should be added to this repo.
