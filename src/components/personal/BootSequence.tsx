import { useEffect, useState } from 'react';

// A ~1.5s fake boot screen shown once per browser session when the desktop
// loads. Any key or click skips it. Pure theater — exactly the right amount
// of cheese for a terminal-themed site.
const LINES = [
  'AndrewOS BIOS v1.0.0 — garden edition',
  'memory check ............ OK',
  'detecting garden ........ /home/andrew/digital-garden',
  'mounting ~/blog ......... ok',
  'mounting ~/projects ..... ok',
  'watering seedlings ...... done',
  'starting paw daemon ..... woof',
  'starting window manager .',
];

const LINE_MS = 130;

export const BOOT_FLAG = 'garden-booted';

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (shown < LINES.length) {
      const t = setTimeout(() => setShown((n) => n + 1), LINE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFading(true), 250);
    return () => clearTimeout(t);
  }, [shown]);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(onDone, 350);
    return () => clearTimeout(t);
  }, [fading, onDone]);

  // Skip on any interaction.
  useEffect(() => {
    const skip = () => setFading(true);
    window.addEventListener('keydown', skip);
    window.addEventListener('mousedown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('mousedown', skip);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start bg-term-bg p-8 font-mono text-sm text-term-green"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 350ms ease' }}
      aria-hidden="true"
    >
      <pre className="leading-relaxed">
        {LINES.slice(0, shown).join('\n')}
        {shown < LINES.length && <span className="animate-pulse">▌</span>}
      </pre>
    </div>
  );
}
