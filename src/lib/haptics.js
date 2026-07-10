/* Haptic feedback, progressive-enhancement only.
   iOS 18+ Safari emits a native haptic when a label toggles an
   <input type="checkbox" switch>. Apple may remove the quirk at any time,
   so this must never be load-bearing. Android falls back to vibrate(). */

let label = null;

function ensureSwitch() {
  if (label) return label;
  label = document.createElement("label");
  label.style.cssText =
    "position:fixed;top:-100px;left:-100px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
  label.setAttribute("aria-hidden", "true");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;
  label.appendChild(input);
  document.body.appendChild(label);
  return label;
}

export function haptic() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    } else {
      ensureSwitch().click();
    }
  } catch {
    /* never let feedback break the action itself */
  }
}
