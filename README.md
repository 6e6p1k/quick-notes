# Quick Notes

A tiny, offline-first notes PWA with Markdown, designed to feel at home on iPhone. Built with Svelte 5 + Vite.

## Features

- **Markdown** — notes render as formatted Markdown (headings, bold/italic, lists, task lists, code, quotes, links, tables). Open a note to read it rendered; tap it (or the pencil button) to edit the source. Output is sanitized with DOMPurify.
- **Installable** — add it to your Home Screen from Safari (Share → *Add to Home Screen*) and it launches full-screen like a native app.
- **Offline** — a Workbox service worker (via `vite-plugin-pwa`) precaches the app, so it opens instantly with no connection.
- **Private** — notes live in `localStorage` on your device (same key as v1, so v1 notes carry over) and never leave it.
- Create, edit, search, and delete notes with autosave, relative timestamps, and automatic dark mode.

## Stack

- [Svelte 5](https://svelte.dev) + [Vite](https://vite.dev) — compiles away to a very small bundle; no virtual DOM.
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) — generates the manifest and Workbox service worker.
- [marked](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify) — Markdown parsing with XSS-safe output.

## iPhone-specific details

- `viewport-fit=cover` + `env(safe-area-inset-*)` padding so content clears the Dynamic Island and home indicator.
- `apple-mobile-web-app-status-bar-style: black-translucent` for edge-to-edge standalone rendering.
- 180×180 `apple-touch-icon` (opaque PNG — iOS applies its own corner mask).
- `100dvh` layout and 17px inputs so iOS Safari never zooms on focus.
- System font stack (`-apple-system`) and iOS-style large-title header, search field, and blurred toolbars.

## Development

```sh
npm install
npm run dev      # dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Deployment

Pushes to `main` (or the development branch) run `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to the `gh-pages` branch, served by GitHub Pages.
