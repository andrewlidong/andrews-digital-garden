import { useEffect, useRef, useState } from 'react';

// The tetris-one-thousand client draws its board at a fixed 16px cell size
// (~640px tall plus chrome), which clips inside a small window. Rather than
// fight the game's layout, render the iframe at a comfortable design size and
// uniformly scale it to fit whatever the window is — the full board (and where
// your piece is dropping) is always visible, letterboxed when needed.
const BASE_W = 1080;
const BASE_H = 900;

export function TetrisFrame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setScale(Math.min(r.width / BASE_W, r.height / BASE_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full items-center justify-center overflow-hidden bg-black"
    >
      {scale > 0 && (
        <iframe
          src="https://tetris-one-thousand.onrender.com/"
          title="Tetris One Thousand — massively multiplayer Tetris"
          className="border-0"
          allow="fullscreen"
          style={{
            width: BASE_W,
            height: BASE_H,
            flex: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        />
      )}
    </div>
  );
}
