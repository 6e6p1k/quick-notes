<script>
  import { fade, fly } from "svelte/transition";
  import { settings, applyTheme, MODES, ACCENTS } from "./theme.svelte.js";
  import { haptic } from "./haptics.js";

  let { open, onclose } = $props();

  const modeLabels = { system: "System", light: "Light", dark: "Dark" };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = (ms) => (reduceMotion ? 0 : ms);

  function setMode(mode) {
    settings.mode = mode;
    applyTheme();
    haptic();
  }

  function setAccent(accent) {
    settings.accent = accent;
    applyTheme();
    haptic();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="sheet-backdrop" onclick={onclose} transition:fade={{ duration: dur(200) }}></div>
  <div class="sheet" role="dialog" aria-label="Settings" transition:fly={{ y: 340, duration: dur(320) }}>
    <div class="sheet-handle"></div>
    <h2 class="sheet-title">Settings</h2>

    <p class="sheet-label">Appearance</p>
    <div class="segmented" role="radiogroup" aria-label="Appearance">
      {#each MODES as mode (mode)}
        <button
          class="segment"
          class:selected={settings.mode === mode}
          role="radio"
          aria-checked={settings.mode === mode}
          onclick={() => setMode(mode)}
        >
          {modeLabels[mode]}
        </button>
      {/each}
    </div>

    <p class="sheet-label">Accent Color</p>
    <div class="swatches" role="radiogroup" aria-label="Accent color">
      {#each Object.entries(ACCENTS) as [name, color] (name)}
        <button
          class="swatch"
          class:selected={settings.accent === name}
          style="--swatch: {color}"
          role="radio"
          aria-checked={settings.accent === name}
          aria-label={name}
          onclick={() => setAccent(name)}
        ></button>
      {/each}
    </div>

    <button class="sheet-done" onclick={onclose}>Done</button>
  </div>
{/if}
