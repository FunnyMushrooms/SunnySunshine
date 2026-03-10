# SunnySunshine

Cybersecurity-themed static landing page.

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## GitHub Pages deployment

This repository now includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that deploys the site as a static Pages artifact.

1. In GitHub: **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually).
4. The action deploys `index.html` and `styles.css` to your Pages URL.
