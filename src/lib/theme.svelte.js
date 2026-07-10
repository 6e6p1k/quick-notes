/* Theme + accent settings, persisted and applied to <html data-theme data-accent>.
   The resolved theme is always concrete ("light"/"dark") so CSS never needs
   media-query duplication, and the theme-color meta (iOS status bar) stays in sync. */

const KEY = "quicknotes.settings.v1";

export const MODES = ["system", "light", "dark"];
export const ACCENTS = {
  yellow: "#ffcc00",
  orange: "#ff9500",
  pink: "#ff2d55",
  purple: "#af52de",
  blue: "#007aff",
  green: "#34c759",
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || {};
    return {
      mode: MODES.includes(s.mode) ? s.mode : "system",
      accent: s.accent in ACCENTS ? s.accent : "yellow",
    };
  } catch {
    return { mode: "system", accent: "yellow" };
  }
}

export const settings = $state(load());

const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");

export function resolvedTheme() {
  return settings.mode === "system" ? (darkMQ.matches ? "dark" : "light") : settings.mode;
}

export function applyTheme() {
  const theme = resolvedTheme();
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.accent = settings.accent;
  localStorage.setItem(KEY, JSON.stringify({ mode: settings.mode, accent: settings.accent }));
  const bg = theme === "dark" ? "#000000" : "#f2f2f7";
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute("content", bg));
}

darkMQ.addEventListener("change", () => {
  if (settings.mode === "system") applyTheme();
});
