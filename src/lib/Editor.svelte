<script>
  import { tick, untrack } from "svelte";
  import { store, updateNote, deleteNote, formatWhen, titleOf } from "./notes.svelte.js";
  import { renderMarkdown } from "./markdown.js";
  import { swipeBack } from "./gestures.js";
  import { haptic } from "./haptics.js";

  let { noteId, onclose } = $props();

  const canShare = typeof navigator.share === "function";

  let text = $state("");
  let preview = $state(false);
  let textarea = $state(null);
  let lastId = null;
  let saveTimer = null;

  let note = $derived(store.notes.find((n) => n.id === noteId));
  let html = $derived(preview ? renderMarkdown(text) : "");

  // Initialize local state when a different note is opened
  $effect(() => {
    const id = noteId;
    if (id && id !== lastId) {
      lastId = id;
      const n = untrack(() => store.notes.find((x) => x.id === id));
      text = n ? n.text : "";
      // Existing notes open rendered; new (empty) notes open in the editor
      preview = text.trim().length > 0;
      if (!preview) tick().then(() => textarea?.focus());
    }
    if (!id) lastId = null;
  });

  // Never lose an edit if the app is backgrounded mid-typing
  $effect(() => {
    const flushIfHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", flushIfHidden);
    return () => document.removeEventListener("visibilitychange", flushIfHidden);
  });

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 400);
  }

  function flush() {
    clearTimeout(saveTimer);
    if (noteId) updateNote(noteId, text);
  }

  function close() {
    flush();
    if (noteId && !text.trim()) deleteNote(noteId); // drop notes left empty
    onclose();
  }

  async function togglePreview() {
    flush();
    preview = !preview;
    if (!preview) {
      await tick();
      textarea?.focus();
    }
  }

  function editFromPreview(event) {
    if (event.target.closest("a")) return; // let links work
    togglePreview();
  }

  function remove() {
    if (!confirm("Delete this note?")) return;
    haptic();
    clearTimeout(saveTimer);
    deleteNote(noteId);
    onclose();
  }

  function share() {
    flush();
    const note = store.notes.find((n) => n.id === noteId);
    if (!note) return;
    navigator.share({ title: titleOf(note), text: note.text }).catch(() => {});
  }

  function swipeClose() {
    // same bookkeeping as tapping "Notes", triggered by the edge swipe
    close();
  }
</script>

<div
  class="screen editor-screen"
  class:open={noteId !== null}
  aria-hidden={noteId === null}
  use:swipeBack={{ onClose: swipeClose }}
>
  <header class="editor-header">
    <button class="back-btn" id="back-btn" onclick={close}>
      <svg viewBox="0 0 12 20" aria-hidden="true">
        <path d="M10.5 1.5 2.5 10l8 8.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Notes
    </button>
    <div class="header-actions">
      {#if canShare}
        <button class="toggle-btn" id="share-btn" aria-label="Share note" onclick={share}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.8a.85.85 0 0 1 .6.25l3.5 3.5a.85.85 0 0 1-1.2 1.2l-2.05-2.04V14a.85.85 0 0 1-1.7 0V4.71L9.1 6.75a.85.85 0 1 1-1.2-1.2l3.5-3.5a.85.85 0 0 1 .6-.25zM6 9.15h2a.85.85 0 0 1 0 1.7H6.85a.15.15 0 0 0-.15.15v9.2c0 .08.07.15.15.15h10.3a.15.15 0 0 0 .15-.15V11a.15.15 0 0 0-.15-.15H16a.85.85 0 0 1 0-1.7h2A1.85 1.85 0 0 1 19 11v9.2A1.85 1.85 0 0 1 17.15 22H6.85A1.85 1.85 0 0 1 5 20.2V11A1.85 1.85 0 0 1 6 9.15z" fill="currentColor"/>
          </svg>
        </button>
      {/if}
      <button class="toggle-btn" id="preview-btn" onclick={togglePreview}
        aria-label={preview ? "Edit note" : "Preview note"}>
        {#if preview}
          <!-- pencil: switch to editing -->
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.7 3.7a2.4 2.4 0 0 1 3.4 0l1.2 1.2a2.4 2.4 0 0 1 0 3.4l-9.6 9.6a2 2 0 0 1-.9.51l-3.9 1.06a.75.75 0 0 1-.92-.92l1.06-3.9a2 2 0 0 1 .51-.9l9.15-9.15zM14.9 6.7l2.4 2.4 1.6-1.6a.9.9 0 0 0 0-1.27l-1.13-1.13a.9.9 0 0 0-1.27 0l-1.6 1.6z" fill="currentColor"/>
          </svg>
        {:else}
          <!-- eye: switch to preview -->
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5c4.9 0 8.9 3.2 10.4 6.6a1 1 0 0 1 0 .8C20.9 15.8 16.9 19 12 19s-8.9-3.2-10.4-6.6a1 1 0 0 1 0-.8C3.1 8.2 7.1 5 12 5zm0 2C8.2 7 4.9 9.4 3.6 12 4.9 14.6 8.2 17 12 17s7.1-2.4 8.4-5C19.1 9.4 15.8 7 12 7zm0 1.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z" fill="currentColor"/>
          </svg>
        {/if}
      </button>
      <button class="delete-btn" id="delete-btn" aria-label="Delete note" onclick={remove}>
        <svg viewBox="0 0 22 24" aria-hidden="true">
          <path d="M8 2.5A1.5 1.5 0 0 1 9.5 1h3A1.5 1.5 0 0 1 14 2.5V4h5.25a.85.85 0 0 1 0 1.7h-1.1l-1.02 15.3A2.6 2.6 0 0 1 14.54 23H7.46a2.6 2.6 0 0 1-2.59-2L3.85 5.7h-1.1a.85.85 0 0 1 0-1.7H8V2.5zm1.7.2V4h2.6V2.7H9.7zM8.6 8.4a.8.8 0 0 1 .85.75l.5 9a.8.8 0 0 1-1.6.09l-.5-9a.8.8 0 0 1 .75-.84zm4.8 0a.8.8 0 0 1 .75.84l-.5 9a.8.8 0 1 1-1.6-.09l.5-9a.8.8 0 0 1 .85-.75z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </header>

  <p class="editor-date">{note ? formatWhen(note.updated) : ""}</p>

  {#if preview}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="markdown-body" id="note-preview" onclick={editFromPreview}>
      {@html html}
    </div>
  {:else}
    <textarea id="note-text" placeholder="Start writing…  Markdown works: # heading, **bold**, - list"
      autocapitalize="sentences" bind:value={text} bind:this={textarea} oninput={scheduleSave}></textarea>
  {/if}
</div>
