/* Touch-gesture Svelte actions, tuned to iOS conventions:
   - outcomes are decided by momentum projection (where the finger *would*
     land given its velocity), not raw distance
   - overshoot is rubber-banded instead of hard-clamped
   - release animations get a duration derived from the remaining distance
   Standalone iOS web apps get no native back-swipe, so we provide our own. */

const EDGE = 28; // px from the left edge that starts a back-swipe
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)"; // iOS-like ease-out
const PROJECT_MS = 180; // how far ahead momentum projection looks

/* Where would the finger land if released now? (fluid-interfaces projection) */
function project(position, velocity) {
  return position + velocity * PROJECT_MS;
}

/* Release-animation duration proportional to distance left to travel */
function releaseDuration(remaining, velocity) {
  const v = Math.max(Math.abs(velocity), 0.4); // px/ms floor keeps it snappy
  return Math.min(Math.max(Math.abs(remaining) / v, 160), 340);
}

/* Track velocity from the last few touch samples (finger can pause mid-drag) */
function makeVelocityTracker() {
  let samples = [];
  return {
    add(x) {
      const now = performance.now();
      samples.push({ x, t: now });
      samples = samples.filter((s) => now - s.t < 100);
    },
    get() {
      if (samples.length < 2) return 0;
      const a = samples[0];
      const b = samples[samples.length - 1];
      return b.t === a.t ? 0 : (b.x - a.x) / (b.t - a.t); // px/ms
    },
  };
}

/* Swipe right from the left edge to dismiss the panel (iOS back gesture).
   The list screen underneath gets native-style parallax: it sits at -30%
   with a dim overlay and follows the drag back to 0. */
export function swipeBack(node, { onClose }) {
  let startX = 0;
  let startY = 0;
  let active = false;
  let width = 0;
  let tracker = null;

  const under = () => document.querySelector(".list-screen");

  function setDrag(dx) {
    const p = Math.min(dx / width, 1); // 0 = fully open, 1 = dismissed
    node.style.transform = `translateX(${dx}px)`;
    const u = under();
    if (u) {
      u.style.transform = `translateX(${-0.3 * width * (1 - p)}px)`;
      u.style.setProperty("--dim", String(1 - p));
    }
  }

  function settle(toClosed, dx, velocity) {
    const remaining = toClosed ? width - dx : dx;
    const ms = releaseDuration(remaining, velocity);
    const u = under();
    for (const el of [node, u]) {
      if (!el) continue;
      el.style.transition = `transform ${ms}ms ${EASE}`;
    }
    if (u) u.style.transition += `, --dim ${ms}ms linear`;
    requestAnimationFrame(() => {
      node.style.transform = "";
      if (u) {
        u.style.transform = "";
        u.style.removeProperty("--dim");
      }
      if (toClosed) onClose();
      setTimeout(() => {
        node.style.transition = "";
        if (u) u.style.transition = "";
      }, ms + 50);
    });
  }

  function onStart(e) {
    const t = e.touches[0];
    if (t.clientX > EDGE || !node.classList.contains("open")) return;
    active = true;
    startX = t.clientX;
    startY = t.clientY;
    width = node.offsetWidth;
    tracker = makeVelocityTracker();
    tracker.add(t.clientX);
    node.style.transition = "none";
    const u = under();
    if (u) u.style.transition = "none";
    // also stops Safari's own history gesture when running in a browser tab
    e.preventDefault();
  }

  function onMove(e) {
    if (!active) return;
    const t = e.touches[0];
    tracker.add(t.clientX);
    const dx = Math.max(0, t.clientX - startX);
    if (Math.abs(t.clientY - startY) > 80 && dx < 30) {
      active = false;
      settle(false, dx, 0);
      return;
    }
    setDrag(dx);
    e.preventDefault();
  }

  function onEnd(e) {
    if (!active) return;
    active = false;
    const dx = Math.max(0, e.changedTouches[0].clientX - startX);
    const velocity = tracker.get();
    const shouldClose = project(dx, velocity) > width * 0.5 && dx > 20;
    settle(shouldClose, dx, velocity);
  }

  function onCancel() {
    if (!active) return;
    active = false;
    settle(false, 0, 0);
  }

  node.addEventListener("touchstart", onStart, { passive: false });
  node.addEventListener("touchmove", onMove, { passive: false });
  node.addEventListener("touchend", onEnd);
  node.addEventListener("touchcancel", onCancel);
  return {
    destroy() {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchmove", onMove);
      node.removeEventListener("touchend", onEnd);
      node.removeEventListener("touchcancel", onCancel);
    },
  };
}

const REVEAL = 88; // resting width of the revealed delete button

/* iOS-style swipe actions: drag left to reveal Delete; keep dragging past
   ~55% of the row and it becomes a full swipe that deletes directly.
   Vertical scrolling stays native (touch-action: pan-y on the row). */
export function swipeRow(node, { isOpen, setOpen, onFullSwipe, onArm }) {
  let startX = 0;
  let startY = 0;
  let base = 0;
  let intent = null; // null | "h" | "v"
  let dx = 0;
  let width = 0;
  let armed = false; // past the full-swipe threshold
  let tracker = null;

  const fullThreshold = () => -width * 0.55;

  function onStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    base = isOpen() ? -REVEAL : 0;
    intent = null;
    dx = base;
    width = node.offsetWidth;
    armed = false;
    tracker = makeVelocityTracker();
    tracker.add(t.clientX);
  }

  function onMove(e) {
    const t = e.touches[0];
    tracker.add(t.clientX);
    const mx = t.clientX - startX;
    const my = t.clientY - startY;
    if (intent === null) {
      if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) intent = "h";
      else if (Math.abs(my) > 8) intent = "v";
    }
    if (intent !== "h") return;
    e.preventDefault();
    // 1:1 tracking the whole way, like iOS full-swipe actions — the red
    // underlay stretches with the row; the threshold decides the outcome
    dx = Math.max(-width, Math.min(0, base + mx));
    const nowArmed = dx <= fullThreshold();
    if (nowArmed !== armed) {
      armed = nowArmed;
      onArm?.(); // haptic tick as the full-swipe action arms/disarms
    }
    node.style.transition = "none";
    node.style.transform = `translateX(${dx}px)`;
  }

  function onEnd() {
    if (intent !== "h") return;
    intent = null;
    const velocity = tracker.get();
    const projected = project(dx, velocity);

    if (projected <= fullThreshold()) {
      // full swipe: carry the row off-screen, then delete
      const ms = releaseDuration(width + dx, velocity);
      node.style.transition = `transform ${ms}ms ${EASE}`;
      node.style.transform = `translateX(${-width}px)`;
      // leave the row off-screen; the deletion outro removes the element
      setTimeout(onFullSwipe, ms);
      return;
    }

    node.style.transition = "";
    node.style.transform = "";
    setOpen(projected < -REVEAL / 2);
  }

  node.addEventListener("touchstart", onStart, { passive: true });
  node.addEventListener("touchmove", onMove, { passive: false });
  node.addEventListener("touchend", onEnd);
  node.addEventListener("touchcancel", onEnd);
  return {
    destroy() {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchmove", onMove);
      node.removeEventListener("touchend", onEnd);
      node.removeEventListener("touchcancel", onEnd);
    },
  };
}
