import { useEffect, useRef, useState } from "react";
import { DOG_EVENT, DOG_HOME_EVENT, DOG_PAW_EVENT, isDogStorageKey, loadDogEnabled } from "@/lib/dog";
import { drawFrame, FRAMES, SPRITE_SIZE, type Frame } from "@/lib/dogSprites";

// A little oneko-style dog that follows paw prints around the page. It sleeps
// on its bed (the header's paw button, marked with `data-dog-home`) until a
// paw stamp is dropped (see PawStampMode); then it perks up and runs from
// print to print, sits and wags where the trail ends, and eventually dozes
// off. Opening the terminal calls it home to sleep. It never chases the bare
// cursor.

const SCALE = 2;
const SIZE = SPRITE_SIZE * SCALE; // rendered size in CSS px
const SPEED = 140; // px per second
const ARRIVE_DISTANCE = 6; // close enough to count as standing on a print
const MAX_WAYPOINTS = 12; // forget the oldest prints if clicks pile up
const RUN_FRAME_MS = 150;
const WAG_FRAME_MS = 380;
const SLEEP_FRAME_MS = 900;
const SLEEP_AFTER_MS = 12_000;
const ALERT_MS = 320;
const HOME_SELECTOR = "[data-dog-home]";
// The header mounts lazily; wait this long for the paw before giving up and
// starting in the middle of the screen instead.
const HOME_WAIT_MS = 2000;
// How often a dog asleep on the paw re-checks that the paw hasn't moved.
const HOME_TRACK_MS = 250;

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

/** Skip the dog where it shouldn't move: reduced-motion users didn't ask for
 *  a sprite sprinting across their screen. Touch devices are fine, since he
 *  follows paw prints (taps) rather than a hovering cursor. */
function canShowDog(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
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
    const home = { x: pos.x, y: pos.y };
    const waypoints: { x: number; y: number }[] = [];
    let mode: Mode = "sleep";
    let idleSince = 0;
    let alertUntil = 0;
    let facingLeft = false;
    let lastKey = "";
    let lastTs = 0;
    let raf = 0;
    let homePoll = 0;
    let lastHomeCheck = 0;

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
    // been woken up by a paw print.
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

    const onPaw = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (!d || !Number.isFinite(d.x) || !Number.isFinite(d.y)) return;
      // A fresh print can override a trip home.
      if (mode === "homing") mode = "idle";
      waypoints.push({ x: d.x, y: d.y });
      if (waypoints.length > MAX_WAYPOINTS) waypoints.splice(0, waypoints.length - MAX_WAYPOINTS);
    };

    // Opening the terminal sends the dog back to bed, wherever it is.
    const onHome = () => {
      const h = findHome();
      if (!h) return;
      home.x = h.x;
      home.y = h.y;
      waypoints.length = 0;
      mode = "homing";
    };

    const onResize = () => {
      // Keep following the paw if the dog is curled up on it; otherwise just
      // make sure it stays on screen.
      if (atHome() && snapHome()) return;
      clampToViewport(pos);
      place();
    };

    /** Advance toward `to`; returns false if pinned against the viewport edge. */
    const moveToward = (to: { x: number; y: number }, dt: number): boolean => {
      const dx = to.x - pos.x;
      const dy = to.y - pos.y;
      const d = Math.hypot(dx, dy);
      if (d === 0) return true;
      const step = Math.min(d, SPEED * dt);
      const prevX = pos.x;
      const prevY = pos.y;
      pos.x += (dx / d) * step;
      pos.y += (dy / d) * step;
      clampToViewport(pos);
      if (Math.abs(dx) > 0.5) facingLeft = dx < 0;
      place();
      return !(dt > 0 && Math.hypot(pos.x - prevX, pos.y - prevY) < 0.01);
    };

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      // Cap dt so a backgrounded tab doesn't teleport the dog on return.
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
      lastTs = ts;

      // The bed can move without a resize (e.g. the mobile nav re-lays out
      // once the device is detected), so a dog curled up on it re-checks the
      // button's position now and then and shuffles over if it has shifted.
      if (ts - lastHomeCheck > HOME_TRACK_MS && atHome()) {
        lastHomeCheck = ts;
        const h = findHome();
        if (h && (Math.abs(h.x - home.x) > 0.5 || Math.abs(h.y - home.y) > 0.5)) snapHome();
      }

      switch (mode) {
        case "sleep":
          if (waypoints.length) {
            mode = "alert";
            alertUntil = ts + ALERT_MS;
          }
          break;
        case "alert":
          if (ts >= alertUntil) mode = "run";
          break;
        case "idle":
          if (waypoints.length) mode = "run";
          else if (ts - idleSince > SLEEP_AFTER_MS) mode = "sleep";
          break;
        case "run": {
          // Step onto each print in turn, dropping any we can't reach.
          while (waypoints.length) {
            const wp = waypoints[0];
            const d = Math.hypot(wp.x - pos.x, wp.y - pos.y);
            if (d <= ARRIVE_DISTANCE) {
              waypoints.shift();
              continue;
            }
            if (!moveToward(wp, dt)) waypoints.shift();
            break;
          }
          if (!waypoints.length) {
            mode = "idle";
            idleSince = ts;
          }
          break;
        }
        case "homing": {
          const hd = Math.hypot(home.x - pos.x, home.y - pos.y);
          if (hd <= 2) {
            pos.x = home.x;
            pos.y = home.y;
            clampToViewport(pos);
            place();
            mode = "sleep";
            break;
          }
          // If home is off-screen and we're stuck on the edge, just sleep here.
          if (!moveToward(home, dt)) mode = "sleep";
          break;
        }
      }

      if (mode === "run" || mode === "homing") {
        const to = mode === "homing" ? home : (waypoints[0] ?? pos);
        const mx = to.x - pos.x;
        const my = to.y - pos.y;
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
    window.addEventListener(DOG_PAW_EVENT, onPaw);
    window.addEventListener(DOG_HOME_EVENT, onHome);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (homePoll) window.clearInterval(homePoll);
      window.removeEventListener(DOG_PAW_EVENT, onPaw);
      window.removeEventListener(DOG_HOME_EVENT, onHome);
      window.removeEventListener("resize", onResize);
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
