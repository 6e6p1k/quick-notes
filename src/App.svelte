<script>
  import { createNote } from "./lib/notes.svelte.js";
  import { applyTheme } from "./lib/theme.svelte.js";
  import { haptic } from "./lib/haptics.js";
  import NoteList from "./lib/NoteList.svelte";
  import Editor from "./lib/Editor.svelte";
  import Settings from "./lib/Settings.svelte";

  let activeId = $state(null);
  let settingsOpen = $state(false);

  applyTheme();

  function newNote() {
    haptic();
    activeId = createNote().id;
  }

  // "New Note" app shortcut (manifest) lands on ./?new=1
  if (new URLSearchParams(location.search).has("new")) {
    history.replaceState(null, "", location.pathname);
    activeId = createNote().id;
  }
</script>

<NoteList
  onopen={(id) => (activeId = id)}
  onnew={newNote}
  onsettings={() => (settingsOpen = true)}
/>
<Editor noteId={activeId} onclose={() => (activeId = null)} />
<Settings open={settingsOpen} onclose={() => (settingsOpen = false)} />
