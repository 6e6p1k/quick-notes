/* Quick Notes — offline-first notes stored in localStorage. */

(() => {
  "use strict";

  const STORAGE_KEY = "quicknotes.v1";

  const els = {
    list: document.getElementById("note-list"),
    empty: document.getElementById("empty-state"),
    count: document.getElementById("note-count"),
    search: document.getElementById("search"),
    newBtn: document.getElementById("new-note-btn"),
    editor: document.getElementById("editor-screen"),
    text: document.getElementById("note-text"),
    date: document.getElementById("editor-date"),
    backBtn: document.getElementById("back-btn"),
    deleteBtn: document.getElementById("delete-btn"),
  };

  let notes = load();
  let activeId = null;
  let saveTimer = null;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function titleOf(note) {
    const firstLine = note.text.split("\n").find((l) => l.trim());
    return firstLine ? firstLine.trim() : "New Note";
  }

  function snippetOf(note) {
    const lines = note.text.split("\n");
    const first = lines.findIndex((l) => l.trim());
    const rest = lines
      .slice(first + 1)
      .find((l) => l.trim());
    return rest ? rest.trim() : "No additional text";
  }

  function formatWhen(ts) {
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

  function render() {
    const q = els.search.value.trim().toLowerCase();
    const shown = notes
      .filter((n) => !q || n.text.toLowerCase().includes(q))
      .sort((a, b) => b.updated - a.updated);

    els.list.innerHTML = "";
    for (const note of shown) {
      const li = document.createElement("li");
      li.className = "note-item";
      li.dataset.id = note.id;

      const title = document.createElement("p");
      title.className = "note-title";
      title.textContent = titleOf(note);

      const meta = document.createElement("p");
      meta.className = "note-meta";
      const time = document.createElement("time");
      time.textContent = formatWhen(note.updated);
      meta.append(time, snippetOf(note));

      li.append(title, meta);
      els.list.append(li);
    }

    els.empty.hidden = shown.length > 0;
    els.list.hidden = shown.length === 0;
    els.count.textContent =
      notes.length === 0 ? "No Notes" : notes.length === 1 ? "1 Note" : `${notes.length} Notes`;
  }

  function openEditor(id) {
    activeId = id;
    const note = notes.find((n) => n.id === id);
    els.text.value = note.text;
    els.date.textContent = formatWhen(note.updated);
    els.editor.classList.add("open");
    els.editor.setAttribute("aria-hidden", "false");
  }

  function closeEditor() {
    flushSave();
    // Drop notes that were created and left empty
    const note = notes.find((n) => n.id === activeId);
    if (note && !note.text.trim()) {
      notes = notes.filter((n) => n.id !== activeId);
      persist();
    }
    activeId = null;
    els.editor.classList.remove("open");
    els.editor.setAttribute("aria-hidden", "true");
    els.text.blur();
    render();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 400);
  }

  function flushSave() {
    clearTimeout(saveTimer);
    const note = notes.find((n) => n.id === activeId);
    if (!note) return;
    if (note.text !== els.text.value) {
      note.text = els.text.value;
      note.updated = Date.now();
      persist();
    }
  }

  // --- Events ---

  els.newBtn.addEventListener("click", () => {
    const note = { id: crypto.randomUUID(), text: "", created: Date.now(), updated: Date.now() };
    notes.push(note);
    persist();
    openEditor(note.id);
    els.text.focus();
  });

  els.list.addEventListener("click", (e) => {
    const item = e.target.closest(".note-item");
    if (item) openEditor(item.dataset.id);
  });

  els.backBtn.addEventListener("click", closeEditor);

  els.deleteBtn.addEventListener("click", () => {
    if (!confirm("Delete this note?")) return;
    clearTimeout(saveTimer);
    notes = notes.filter((n) => n.id !== activeId);
    persist();
    activeId = null;
    els.editor.classList.remove("open");
    els.editor.setAttribute("aria-hidden", "true");
    render();
  });

  els.text.addEventListener("input", scheduleSave);
  els.search.addEventListener("input", render);

  // Make sure nothing is lost if the app is backgrounded mid-edit
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSave();
  });

  render();

  // --- Offline support ---
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js");
    });
  }
})();
