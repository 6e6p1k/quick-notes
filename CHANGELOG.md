# Changelog

All notable changes to Quick Notes. Versions are also marked as git tags.

## [2.1.2] — 2026-07-10

Gesture feel overhaul, based on iOS "fluid interfaces" conventions.

### Changed
- **Back-swipe** now decides open/close by *momentum projection* (where the
  finger would land given its velocity) instead of raw distance thresholds,
  and the release animation duration is derived from the remaining distance —
  fast flicks finish fast, gentle releases settle gently.
- **Parallax**: the notes list behind the editor now sits at −30% with a dim
  overlay (like a native navigation stack) and is dragged back in sync by the
  back-swipe. The editor casts an edge shadow for depth.
- **Swipe-to-delete**: the row now tracks the finger 1:1 past the Delete
  button (the red underlay stretches with it); keep pulling past ~55% of the
  row and it arms a **full swipe** (with a haptic tick) that deletes directly,
  carrying the row off-screen — same as Mail/Notes.
- Velocity is measured over the last 100 ms of touch samples, so pausing
  mid-drag doesn't inherit stale momentum.

## [2.1.0] — 2026-07-10

Deeper iOS integration: gestures, theming, animations, haptics.

### Added
- Edge-swipe from the left to close the editor (standalone iOS web apps have
  no native back-swipe).
- iOS-style swipe-to-delete on note rows.
- Settings sheet: System/Light/Dark appearance + six iOS accent colors,
  persisted on-device; status-bar `theme-color` kept in sync; anti-flash
  inline theme script.
- Press-state animations on all controls, animated list reordering,
  `prefers-reduced-motion` support.
- Haptic feedback (iOS 18+ switch-toggle technique, progressive enhancement).
- Share button (Web Share API), `interactive-widget=resizes-content`,
  manifest "New Note" shortcut.

## [2.0.0] — 2026-07-10

Framework migration + Markdown.

### Changed
- Rebuilt as a Svelte 5 + Vite app (was vanilla JS); `vite-plugin-pwa`
  (Workbox) now generates the manifest and service worker.
- Notes render as Markdown (marked + DOMPurify, GFM task lists); editor
  gained an edit/preview toggle. Existing notes open rendered.
- Same `localStorage` key as v1, so existing notes carry over.

## [1.0.0] — 2026-07-10

Initial release: vanilla HTML/CSS/JS offline-first notes PWA with iOS-first
design (safe areas, standalone meta tags, dark mode, apple-touch-icon),
localStorage persistence, and GitHub Pages deployment via Actions.
