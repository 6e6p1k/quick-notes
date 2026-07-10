# Quick Notes

A tiny, offline-first notes PWA designed to feel at home on iPhone. No frameworks, no build step — just HTML, CSS, and JavaScript.

## Features

- **Installable** — add it to your Home Screen from Safari (Share → *Add to Home Screen*) and it launches full-screen like a native app.
- **Offline** — a service worker precaches the app shell, so it opens instantly with no connection.
- **Private** — notes live in `localStorage` on your device and never leave it.
- Create, edit, search, and delete notes with autosave, relative timestamps, and automatic dark mode.

## iPhone-specific details

- `viewport-fit=cover` + `env(safe-area-inset-*)` padding so content clears the Dynamic Island and home indicator.
- `apple-mobile-web-app-status-bar-style: black-translucent` for edge-to-edge standalone rendering.
- 180×180 `apple-touch-icon` (opaque PNG — iOS applies its own corner mask).
- `100dvh` layout and 17px inputs so iOS Safari never zooms on focus.
- System font stack (`-apple-system`) and iOS-style large-title header, search field, and blurred toolbars.

## Deployment

Pushes to `main` (or the development branch) run `.github/workflows/deploy.yml`, which publishes the site to the `gh-pages` branch, served by GitHub Pages.

## Development

No tooling needed — serve the folder with any static server:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000.
