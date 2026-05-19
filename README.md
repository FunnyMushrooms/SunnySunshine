# iGaming Shell CV (Vite + React)

## Why GitHub Pages showed `404` for `/src/main.jsx`
If GitHub Pages serves the raw source `index.html`, the browser tries to load `/src/main.jsx` directly, which does not exist on the published site.

This repo now auto-detects GitHub Pages base path:
- **User/Org site repo** (`<username>.github.io`) → base is `/`
- **Project repo** (`<username>/<repo>`) → base is `/<repo>/`

That prevents broken asset links after `vite build`.

## Required GitHub Pages settings
In GitHub:
1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions** (not branch deploy).
3. Push to `main` and wait for workflow **Deploy iGaming Shell CV to GitHub Pages** to finish.

## Local run
```bash
npm ci
npm run dev
```
