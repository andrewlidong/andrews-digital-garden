import { useState, useEffect, useRef } from "react";
import { dropPawForDog } from "@/lib/dog";

const STAMP_DURATION = 2000;

const FALLBACK_ACCENT = "#7aa2f7";

// Stamps are painted straight from the theme's accent CSS variable (written by
// applyTheme in lib/themes.ts), so they match the active theme and recolor
// live if the user switches themes while stamps are still on screen.
const STAMP_COLOR = `var(--term-accent, ${FALLBACK_ACCENT})`;

/** Reads the current theme's accent color from the document root. */
function readAccent(): string {
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--term-accent").trim();
  return accent || FALLBACK_ACCENT;
}

/** Builds a paw-shaped cursor (16,16 hotspot) colored with the given fill.
 *  Includes little claw marks above the toes and a soft highlight on the main
 *  pad so the cursor reads as a crafted paw, not a flat blob. */
function buildPawCursor(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64"><g fill="${color}"><ellipse cx="14" cy="6" rx="1.6" ry="3.6" transform="rotate(-18 14 6)"/><ellipse cx="27" cy="2.5" rx="1.6" ry="3.6" transform="rotate(-4 27 2.5)"/><ellipse cx="41" cy="2.5" rx="1.6" ry="3.6" transform="rotate(4 41 2.5)"/><ellipse cx="53" cy="7" rx="1.6" ry="3.6" transform="rotate(16 53 7)"/><ellipse cx="32" cy="42" rx="15" ry="13"/><ellipse cx="15" cy="18" rx="7" ry="9"/><ellipse cx="28" cy="12" rx="7" ry="9"/><ellipse cx="40" cy="12" rx="7" ry="9" transform="rotate(-5 40 12)"/><ellipse cx="50" cy="18" rx="7" ry="9" transform="rotate(-10 50 18)"/></g><ellipse cx="27" cy="37" rx="5" ry="4" fill="#fff" opacity="0.3"/></svg>`;
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return `url("${uri}") 16 16, pointer`;
}

interface Stamp {
  x: number;
  y: number;
  id: number;
  rotation: number;
  fading: boolean;
}

const PawSvg = ({ size = 24, color = "#2196F3" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    {/* claw marks */}
    <g fill={color} opacity="0.85">
      <ellipse cx="13" cy="6" rx="1.7" ry="3.8" transform="rotate(-18 13 6)" />
      <ellipse cx="27" cy="2" rx="1.7" ry="3.8" transform="rotate(-4 27 2)" />
      <ellipse cx="41" cy="2" rx="1.7" ry="3.8" transform="rotate(4 41 2)" />
      <ellipse cx="54" cy="7" rx="1.7" ry="3.8" transform="rotate(16 54 7)" />
    </g>
    {/* pads */}
    <g fill={color}>
      <ellipse cx="32" cy="42" rx="15" ry="13" />
      <ellipse cx="15" cy="18" rx="7" ry="9" />
      <ellipse cx="28" cy="12" rx="7" ry="9" />
      <ellipse cx="40" cy="12" rx="7" ry="9" transform="rotate(-5 40 12)" />
      <ellipse cx="50" cy="18" rx="7" ry="9" transform="rotate(-10 50 18)" />
    </g>
    {/* soft highlight on the main pad */}
    <ellipse cx="27" cy="37" rx="5.5" ry="4.5" fill="#fff" opacity="0.32" />
  </svg>
);

export default function PawStampMode({ isActive }: { isActive: boolean }) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const isActiveRef = useRef(isActive);

  isActiveRef.current = isActive;

  useEffect(() => {
    const root = document.documentElement;
    if (!isActive) {
      document.body.classList.remove("paw-cursor-active");
      root.style.removeProperty("--paw-cursor");
      return;
    }

    document.body.classList.add("paw-cursor-active");

    // Color the cursor from the theme's accent, and keep it in sync if the
    // theme changes (applyTheme rewrites inline styles on the document root).
    const syncCursor = () => {
      root.style.setProperty("--paw-cursor", buildPawCursor(readAccent()));
    };
    syncCursor();

    const observer = new MutationObserver(syncCursor);
    observer.observe(root, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      document.body.classList.remove("paw-cursor-active");
      root.style.removeProperty("--paw-cursor");
    };
  }, [isActive]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isActiveRef.current) return;

      // Don't stamp on interactive element clicks (buttons, links, etc.)
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea, [role="button"]')) return;

      const id = Date.now() + Math.random();
      const stamp: Stamp = {
        x: e.clientX,
        y: e.clientY,
        id,
        rotation: Math.random() * 40 - 20,
        fading: false,
      };

      setStamps((prev) => [...prev, stamp]);
      dropPawForDog(stamp.x, stamp.y);

      setTimeout(() => {
        setStamps((prev) =>
          prev.map((s) => (s.id === id ? { ...s, fading: true } : s))
        );
      }, STAMP_DURATION);

      setTimeout(() => {
        setStamps((prev) => prev.filter((s) => s.id !== id));
      }, STAMP_DURATION + 600);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }}>
      {stamps.map((stamp) => (
        <div
          key={stamp.id}
          className={`absolute ${stamp.fading ? "paw-stamp-fade" : "paw-stamp"}`}
          style={{
            left: stamp.x - 30,
            top: stamp.y - 30,
            transform: `rotate(${stamp.rotation}deg)`,
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25))",
          }}
        >
          <PawSvg size={60} color={STAMP_COLOR} />
        </div>
      ))}
    </div>
  );
}
