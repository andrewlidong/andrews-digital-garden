import { useState, useEffect, useRef } from "react";

const STAMP_DURATION = 2000;

interface Stamp {
  x: number;
  y: number;
  id: number;
  rotation: number;
  fading: boolean;
}

const PawSvg = ({ size = 24, color = "#2196F3" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="42" rx="14" ry="12" />
    <ellipse cx="16" cy="18" rx="7" ry="9" />
    <ellipse cx="28" cy="12" rx="7" ry="9" />
    <ellipse cx="40" cy="12" rx="7" ry="9" transform="rotate(-5 40 12)" />
    <ellipse cx="50" cy="18" rx="7" ry="9" transform="rotate(-10 50 18)" />
  </svg>
);

export default function PawStampMode({ isActive }: { isActive: boolean }) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const isActiveRef = useRef(isActive);

  isActiveRef.current = isActive;

  useEffect(() => {
    if (isActive) {
      document.body.classList.add("paw-cursor-active");
    } else {
      document.body.classList.remove("paw-cursor-active");
    }
    return () => document.body.classList.remove("paw-cursor-active");
  }, [isActive]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isActiveRef.current) return;

      const id = Date.now() + Math.random();
      const stamp: Stamp = {
        x: e.clientX,
        y: e.clientY,
        id,
        rotation: Math.random() * 40 - 20,
        fading: false,
      };

      setStamps((prev) => [...prev, stamp]);

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
            left: stamp.x - 25,
            top: stamp.y - 25,
            transform: `rotate(${stamp.rotation}deg)`,
          }}
        >
          <PawSvg size={50} />
        </div>
      ))}
    </div>
  );
}
