/* Note store — same localStorage key as v1, so existing notes carry over. */

const STORAGE_KEY = "quicknotes.v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export const store = $state({ notes: load() });

export function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store.notes));
}

export function createNote() {
  const note = { id: crypto.randomUUID(), text: "", created: Date.now(), updated: Date.now() };
  store.notes.push(note);
  persist();
  return note;
}

export function updateNote(id, text) {
  const note = store.notes.find((n) => n.id === id);
  if (!note || note.text === text) return;
  note.text = text;
  note.updated = Date.now();
  persist();
}

export function deleteNote(id) {
  store.notes = store.notes.filter((n) => n.id !== id);
  persist();
}

export function titleOf(note) {
  const firstLine = note.text.split("\n").find((l) => l.trim());
  return firstLine ? stripMarkdownLine(firstLine.trim()) : "New Note";
}

export function snippetOf(note) {
  const lines = note.text.split("\n");
  const first = lines.findIndex((l) => l.trim());
  const rest = lines.slice(first + 1).find((l) => l.trim());
  return rest ? stripMarkdownLine(rest.trim()) : "No additional text";
}

/* Rough single-line markdown strip for list previews */
function stripMarkdownLine(line) {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s+/, "")
    .replace(/^[-*+]\s+(\[[ xX]\]\s+)?/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/([*_])(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1");
}

export function formatWhen(ts) {
  const d = new Date(ts);
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (dayDiff === 0) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return d.toLocaleDateString(undefined, { weekday: "long" });
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
