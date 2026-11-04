import { useEffect, useRef, useState } from "react";
import { DOG_EVENT, isDogStorageKey, loadDogEnabled } from "@/lib/dog";
import { drawFrame, FRAMES, SPRITE_SIZE, type Frame } from "@/lib/dogSprites";

// A little oneko-style dog that chases the cursor around the page. It runs
// toward the pointer, settles a short distance away, wags for a while, and
// eventually curls up and sleeps until the cursor wanders off again. Its bed
// is the header's paw button (marked with `data-dog-home`): it starts there,
// and clicking the paw calls it back.

const SCALE = 2;
const SIZE = SPRITE_SIZE * SCALE; // rendered size in CSS px
const SPEED = 140; // px per second
const STOP_DISTANCE = 44; // settle this far from the cursor so it never covers it
const WAKE_DISTANCE = 72; // hysteresis: don't chase tiny cursor jitters
const RUN_FRAME_MS = 150;
const WAG_FRAME_MS = 380;
const SLEEP_FRAME_MS = 900;
const SLEEP_AFTER_MS = 12_000;
const ALERT_MS = 320;
const HOME_SELECTOR = "[data-dog-home]";
// The header mounts lazily; wait this long for the paw before giving up and
// starting in the middle of the screen instead.
const HOME_WAIT_MS = 2000;

type Mode = "sleep" | "alert" | "idle" | "run" | "homing";

/** Where the dog curls up: just below the paw button, centered on it. */
function findHome(): { x: number; y: number } | null {
  const el = document.querySelector(HOME_SELECTOR);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left + r.width / 2, y: r.bottom + SIZE / 2 - 6 };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Skip the dog where it can't be enjoyed or shouldn't move: touch-only
 *  devices have no cursor to chase, and reduced-motion users didn't ask for a
 *  sprite sprinting across their screen. */
function canShowDog(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  return true;
}

function readAccent(): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--term-accent").trim();
  return v || "#82aaff";
}

function useDogEnabled(): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => loadDogEnabled());

  useEffect(() => {
    const sync = () => setEnabled(loadDogEnabled());
    const onStorage = (e: StorageEvent) => {
      if (isDogStorageKey(e.key)) sync();
    };
    window.addEventListener(DOG_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(DOG_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return enabled;
}

export function CursorDog() {
  const enabled = useDogEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !canShowDog()) return;
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };
    const home = { x: pos.x, y: pos.y };
    let hasTarget = false;
    let mode: Mode = "sleep";
    let idleSince = 0;
    let alertUntil = 0;
    let facingLeft = false;
    let lastKey = "";
    let lastTs = 0;
    let raf = 0;
    let homePoll = 0;

    const place = () => {
      const x = Math.round(pos.x - SIZE / 2);
      const y = Math.round(pos.y - SIZE / 2);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const clampToViewport = (p: { x: number; y: number }) => {
      p.x = clamp(p.x, SIZE / 2, window.innerWidth - SIZE / 2);
      p.y = clamp(p.y, SIZE / 2, window.innerHeight - SIZE / 2);
    };

    const atHome = () =>
      (mode === "sleep" || mode === "idle") &&
      Math.abs(pos.x - home.x) < 2 &&
      Math.abs(pos.y - home.y) < 2;

    /** Teleport to the paw (used on mount and when the layout shifts). */
    const snapHome = (): boolean => {
      const h = findHome();
      if (!h) return false;
      home.x = h.x;
      home.y = h.y;
      pos.x = h.x;
      pos.y = h.y;
      clampToViewport(pos);
      place();
      return true;
    };

    // The header is lazy-loaded, so the paw may not exist yet on mount. Poll
    // briefly and move the dog there once it shows up, unless it has already
    // been woken up by the cursor.
    if (!snapHome()) {
      const started = performance.now();
      homePoll = window.setInterval(() => {
        if (mode !== "sleep" || performance.now() - started > HOME_WAIT_MS) {
          window.clearInterval(homePoll);
          homePoll = 0;
          return;
        }
        if (snapHome()) {
          window.clearInterval(homePoll);
          homePoll = 0;
        }
      }, 100);
    }

    // Redraw only when the visible frame actually changes; moving the dog is
    // just a transform update on the container.
    const render = (
      key: string,
      frame: Frame,
      mirror: boolean,
      decorate?: (c: CanvasRenderingContext2D) => void,
    ) => {
      if (key === lastKey) return;
      lastKey = key;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      drawFrame(ctx, frame, SCALE, mirror);
      decorate?.(ctx);
    };

    const drawZs = (phase: number, mirror: boolean) => (c: CanvasRenderingContext2D) => {
      c.fillStyle = readAccent();
      c.font = "bold 7px monospace";
      c.textBaseline = "alphabetic";
      for (let i = 0; i <= phase; i++) {
        const x = mirror ? 7 - i * 3 : 22 + i * 3;
        c.fillText("z", x, 12 - i * 4);
      }
    };

    const drawBang = (mirror: boolean) => (c: CanvasRenderingContext2D) => {
      c.fillStyle = readAccent();
      c.font = "bold 9px monospace";
      c.textBaseline = "alphabetic";
      c.fillText("!", mirror ? 5 : 25, 8);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      hasTarget = true;
    };

    const onResize = () => {
      // Keep following the paw if the dog is curled up on it; otherwise just
      // make sure it stays on screen.
      if (atHome() && snapHome()) return;
      clampToViewport(pos);
      place();
    };

    // Clicking the paw calls the dog back to bed, wherever it is.
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element) || !t.closest(HOME_SELECTOR)) return;
      const h = findHome();
      if (!h) return;
      home.x = h.x;
      home.y = h.y;
      mode = "homing";
    };

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      // Cap dt so a backgrounded tab doesn't teleport the dog on return.
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
      lastTs = ts;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const far = hasTarget && dist > WAKE_DISTANCE;

      switch (mode) {
        case "sleep":
          if (far) {
            mode = "alert";
            alertUntil = ts + ALERT_MS;
          }
          break;
        case "alert":
          if (ts >= alertUntil) mode = "run";
          break;
        case "idle":
          if (far) mode = "run";
          else if (ts - idleSince > SLEEP_AFTER_MS) mode = "sleep";
          break;
        case "run": {
          if (dist <= STOP_DISTANCE) {
            mode = "idle";
            idleSince = ts;
            break;
          }
          const step = Math.min(dist - STOP_DISTANCE + 1, SPEED * dt);
          pos.x = clamp(pos.x + (dx / dist) * step, SIZE / 2, window.innerWidth - SIZE / 2);
          pos.y = clamp(pos.y + (dy / dist) * step, SIZE / 2, window.innerHeight - SIZE / 2);
          if (Math.abs(dx) > 0.5) facingLeft = dx < 0;
          place();
          break;
        }
        case "homing": {
          const hx = home.x - pos.x;
          const hy = home.y - pos.y;
          const hd = Math.hypot(hx, hy);
          if (hd <= 2) {
            pos.x = home.x;
            pos.y = home.y;
            clampToViewport(pos);
            place();
            mode = "sleep";
            // Don't immediately bolt after a cursor that happens to be sitting
            // where it was left; wait for it to move again.
            hasTarget = false;
            break;
          }
          const step = Math.min(hd, SPEED * dt);
          const prevX = pos.x;
          const prevY = pos.y;
          pos.x = pos.x + (hx / hd) * step;
          pos.y = pos.y + (hy / hd) * step;
          clampToViewport(pos);
          if (Math.abs(hx) > 0.5) facingLeft = hx < 0;
          place();
          // Pinned against the viewport edge (home is off-screen): give up and
          // sleep where we are instead of running on the spot forever.
          if (dt > 0 && Math.hypot(pos.x - prevX, pos.y - prevY) < 0.01) {
            mode = "sleep";
            hasTarget = false;
          }
          break;
        }
      }

      if (mode === "run" || mode === "homing") {
        const mx = mode === "homing" ? home.x - pos.x : dx;
        const my = mode === "homing" ? home.y - pos.y : dy;
        const i = Math.floor(ts / RUN_FRAME_MS) % 2;
        if (Math.abs(my) > Math.abs(mx) * 1.6) {
          const up = my < 0;
          render(`${up ? "up" : "down"}${i}`, (up ? FRAMES.runUp : FRAMES.runDown)[i], false);
        } else {
          render(`side${i}${facingLeft}`, FRAMES.runSide[i], facingLeft);
        }
      } else if (mode === "sleep") {
        const beat = Math.floor(ts / SLEEP_FRAME_MS);
        const i = beat % 2;
        const phase = beat % 3;
        render(`sleep${i}${phase}${facingLeft}`, FRAMES.sleep[i], facingLeft, drawZs(phase, facingLeft));
      } else if (mode === "alert") {
        render(`alert${facingLeft}`, FRAMES.sit[0], facingLeft, drawBang(facingLeft));
      } else {
        // Wag in bursts so the sit isn't a metronome.
        const wagging = Math.floor(ts / 2400) % 2 === 0;
        const i = wagging ? Math.floor(ts / WAG_FRAME_MS) % 2 : 0;
        render(`sit${i}${facingLeft}`, FRAMES.sit[i], facingLeft);
      }
    };

    place();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("click", onClick, true);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (homePoll) window.clearInterval(homePoll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick, true);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 select-none"
      style={{ width: SIZE, height: SIZE, zIndex: 9999, willChange: "transform" }}
    >
      <canvas ref={canvasRef} style={{ width: SIZE, height: SIZE, display: "block" }} />
    </div>
  );
}
