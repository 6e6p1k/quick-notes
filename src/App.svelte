<script>
  import { createNote } from "./lib/notes.svelte.js";
  import NoteList from "./lib/NoteList.svelte";
  import Editor from "./lib/Editor.svelte";

  let activeId = $state(null);
</script>

<NoteList onopen={(id) => (activeId = id)} onnew={() => (activeId = createNote().id)} />
<Editor noteId={activeId} onclose={() => (activeId = null)} />
