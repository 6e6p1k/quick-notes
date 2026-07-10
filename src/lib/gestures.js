/* Touch-gesture Svelte actions. Standalone iOS web apps get no native
   back-swipe, so we provide our own, tracking the finger interactively. */

const EDGE = 28; // px from the left edge that starts a back-swipe

/* Swipe right from the left edge to dismiss the panel (iOS back gesture). */
export function swipeBack(node, { onClose }) {
  let startX = 0;
  let startY = 0;
  let t0 = 0;
  let active = false;

  function onStart(e) {
    const t = e.touches[0];
    if (t.clientX > EDGE || !node.classList.contains("open")) return;
    active = true;
    startX = t.clientX;
    startY = t.clientY;
    t0 = performance.now();
    node.style.transition = "none";
    // also stops Safari's own history gesture when running in a browser tab
    e.preventDefault();
  }

  function onMove(e) {
    if (!active) return;
    const t = e.touches[0];
    const dx = Math.max(0, t.clientX - startX);
    if (Math.abs(t.clientY - startY) > 80 && dx < 30) {
      cancel();
      return;
    }
    node.style.transform = `translateX(${dx}px)`;
    e.preventDefault();
  }

  function onEnd(e) {
    if (!active) return;
    active = false;
    const dx = Math.max(0, e.changedTouches[0].clientX - startX);
    const velocity = dx / (performance.now() - t0); // px/ms
    node.style.transition = "";
    if (dx > node.offsetWidth * 0.35 || (dx > 60 && velocity > 0.5)) {
      // release the inline transform on the next frame so the CSS
      // transition animates from the finger position to off-screen
      requestAnimationFrame(() => {
        node.style.transform = "";
        onClose();
      });
    } else {
      node.style.transform = "";
    }
  }

  function cancel() {
    active = false;
    node.style.transition = "";
    node.style.transform = "";
  }

  node.addEventListener("touchstart", onStart, { passive: false });
  node.addEventListener("touchmove", onMove, { passive: false });
  node.addEventListener("touchend", onEnd);
  node.addEventListener("touchcancel", cancel);
  return {
    destroy() {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchmove", onMove);
      node.removeEventListener("touchend", onEnd);
      node.removeEventListener("touchcancel", cancel);
    },
  };
}

const REVEAL = 88; // width of the revealed delete button

/* iOS-style swipe-to-delete: drag a row left to reveal its delete button.
   Vertical scrolling stays native (touch-action: pan-y on the row). */
export function swipeRow(node, { isOpen, setOpen }) {
  let startX = 0;
  let startY = 0;
  let base = 0;
  let intent = null; // null | "h" | "v"
  let dx = 0;

  function onStart(e) {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    base = isOpen() ? -REVEAL : 0;
    intent = null;
    dx = 0;
  }

  function onMove(e) {
    const t = e.touches[0];
    const mx = t.clientX - startX;
    const my = t.clientY - startY;
    if (intent === null) {
      if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) intent = "h";
      else if (Math.abs(my) > 8) intent = "v";
    }
    if (intent !== "h") return;
    e.preventDefault();
    dx = Math.min(0, Math.max(-REVEAL - 20, base + mx));
    node.style.transition = "none";
    node.style.transform = `translateX(${dx}px)`;
  }

  function onEnd() {
    if (intent !== "h") return;
    node.style.transition = "";
    node.style.transform = "";
    setOpen(dx < -REVEAL / 2);
    intent = null;
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
