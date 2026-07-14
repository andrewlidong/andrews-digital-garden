import { useEffect, useState } from 'react';
import { getSeeds, plantSeed, hasPlanted, rememberPlanted } from '@/lib/seeds';

// "Plant a seed" — a tiny community mechanic: visitors water the garden by
// planting one seed per page. Seed counts feed the page's growth stage.
// Hidden entirely when the counter service is unreachable.
export function SeedPlanter({
  filePath,
  onSeeds,
}: {
  filePath: string;
  onSeeds?: (count: number) => void;
}) {
  const [seeds, setSeeds] = useState<number | null>(null);
  const [planted, setPlanted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSeeds(null);
    setPlanted(hasPlanted(filePath));
    getSeeds(filePath).then((count) => {
      if (cancelled || count === null) return;
      setSeeds(count);
      onSeeds?.(count);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  if (seeds === null) return null;

  const plant = async () => {
    if (planted || busy) return;
    setBusy(true);
    const count = await plantSeed(filePath);
    setBusy(false);
    if (count === null) return;
    setPlanted(true);
    rememberPlanted(filePath);
    setSeeds(count);
    onSeeds?.(count);
  };

  return (
    <button
      type="button"
      onClick={plant}
      disabled={planted || busy}
      title={
        planted
          ? 'You planted a seed here. Thank you for watering the garden!'
          : 'Plant a seed — help this page grow'
      }
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs transition-all ${
        planted
          ? 'cursor-default border-term-green/50 bg-term-elevated/60 text-term-green'
          : 'border-term-border/70 bg-term-elevated/40 text-term-dim hover:border-term-accent/60 hover:text-term-accent active:scale-95'
      }`}
    >
      <span aria-hidden>🌱</span>
      {seeds} {seeds === 1 ? 'seed' : 'seeds'}
      {!planted && <span className="text-term-faint">· plant one</span>}
      {planted && <span aria-hidden>✓</span>}
    </button>
  );
}
