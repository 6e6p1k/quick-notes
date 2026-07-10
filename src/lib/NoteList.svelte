<script>
  import { store, titleOf, snippetOf, formatWhen } from "./notes.svelte.js";

  let { onopen, onnew } = $props();

  let query = $state("");

  let shown = $derived(
    store.notes
      .filter((n) => {
        const q = query.trim().toLowerCase();
        return !q || n.text.toLowerCase().includes(q);
      })
      .toSorted((a, b) => b.updated - a.updated)
  );
</script>

<div class="screen">
  <header class="app-header">
    <h1 class="large-title">Notes</h1>
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
          <li class="note-item">
            <button class="note-item-btn" onclick={() => onopen(note.id)}>
              <p class="note-title">{titleOf(note)}</p>
              <p class="note-meta">
                <time>{formatWhen(note.updated)}</time>{snippetOf(note)}
              </p>
            </button>
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
