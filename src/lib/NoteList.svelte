<script>
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { store, deleteNote, titleOf, snippetOf, formatWhen } from "./notes.svelte.js";
  import { swipeRow } from "./gestures.js";
  import { haptic } from "./haptics.js";

  let { onopen, onnew, onsettings } = $props();

  let query = $state("");
  let revealedId = $state(null); // row whose delete button is swiped open

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = (ms) => (reduceMotion ? 0 : ms);

  let shown = $derived(
    store.notes
      .filter((n) => {
        const q = query.trim().toLowerCase();
        return !q || n.text.toLowerCase().includes(q);
      })
      .toSorted((a, b) => b.updated - a.updated)
  );

  function openNote(id) {
    if (revealedId !== null) {
      revealedId = null; // first tap just dismisses the revealed delete button
      return;
    }
    onopen(id);
  }

  function removeNote(id) {
    haptic();
    revealedId = null;
    deleteNote(id);
  }

  function setRevealed(id, open) {
    if (open) haptic();
    revealedId = open ? id : revealedId === id ? null : revealedId;
  }
</script>

<div class="screen list-screen">
  <header class="app-header">
    <div class="title-row">
      <h1 class="large-title">Notes</h1>
      <button class="icon-btn" id="settings-btn" aria-label="Settings" onclick={onsettings}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2zm0 1.7a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM10.6 2h2.8a.9.9 0 0 1 .88.72l.37 1.82c.55.22 1.07.52 1.54.89l1.76-.6a.9.9 0 0 1 1.07.4l1.4 2.43a.9.9 0 0 1-.19 1.13l-1.39 1.22a7.2 7.2 0 0 1 0 1.78l1.39 1.22a.9.9 0 0 1 .19 1.13l-1.4 2.43a.9.9 0 0 1-1.07.4l-1.76-.6c-.47.37-.99.67-1.54.89l-.37 1.82a.9.9 0 0 1-.88.72h-2.8a.9.9 0 0 1-.88-.72l-.37-1.82a7.2 7.2 0 0 1-1.54-.89l-1.76.6a.9.9 0 0 1-1.07-.4l-1.4-2.43a.9.9 0 0 1 .19-1.13l1.39-1.22a7.2 7.2 0 0 1 0-1.78L3.83 10.8a.9.9 0 0 1-.19-1.13l1.4-2.43a.9.9 0 0 1 1.07-.4l1.76.6c.47-.37.99-.67 1.54-.89l.37-1.82A.9.9 0 0 1 10.66 2z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    <div class="search-wrap">
      <svg class="search-icon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.64 3.64a.9.9 0 0 1-1.27 1.27l-3.64-3.64A5.5 5.5 0 1 1 8.5 3zm0 1.8a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4z" fill="currentColor"/>
      </svg>
      <input type="search" id="search" placeholder="Search" autocomplete="off" aria-label="Search notes" bind:value={query}>
    </div>
  </header>

  <main class="note-list-wrap">
    {#if shown.length > 0}
      <ul class="note-list">
        {#each shown as note (note.id)}
          <li
            class="note-item"
            animate:flip={{ duration: dur(250) }}
            transition:fade={{ duration: dur(150) }}
          >
            <button class="row-delete" tabindex={revealedId === note.id ? 0 : -1}
              onclick={() => removeNote(note.id)}>Delete</button>
            <div
              class="note-row"
              class:revealed={revealedId === note.id}
              use:swipeRow={{
                isOpen: () => revealedId === note.id,
                setOpen: (open) => setRevealed(note.id, open),
                onFullSwipe: () => removeNote(note.id),
                onArm: haptic,
              }}
            >
              <button class="note-item-btn" onclick={() => openNote(note.id)}>
                <p class="note-title">{titleOf(note)}</p>
                <p class="note-meta">
                  <time>{formatWhen(note.updated)}</time>{snippetOf(note)}
                </p>
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="empty-state" id="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-title">No Notes</p>
        <p class="empty-sub">Tap the button below to write your first note.</p>
      </div>
    {/if}
  </main>

  <footer class="toolbar">
    <span class="note-count" id="note-count">
      {store.notes.length === 0 ? "No Notes" : store.notes.length === 1 ? "1 Note" : `${store.notes.length} Notes`}
    </span>
    <button class="compose-btn" id="new-note-btn" aria-label="New note" onclick={onnew}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.7 3.7a2.4 2.4 0 0 1 3.4 0l1.2 1.2a2.4 2.4 0 0 1 0 3.4l-9.6 9.6a2 2 0 0 1-.9.51l-3.9 1.06a.75.75 0 0 1-.92-.92l1.06-3.9a2 2 0 0 1 .51-.9l9.15-9.15zM14.9 6.7l2.4 2.4 1.6-1.6a.9.9 0 0 0 0-1.27l-1.13-1.13a.9.9 0 0 0-1.27 0l-1.6 1.6z" fill="currentColor"/>
      </svg>
    </button>
  </footer>
</div>
