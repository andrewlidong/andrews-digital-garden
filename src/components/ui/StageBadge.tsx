import { stageInfo } from '@/lib/stages';

// Small growth-stage chip (🌱 seedling / 🌿 budding / 🌲 evergreen).
// Renders nothing when the page has no (valid) stage. The blurb shows in a
// CSS tooltip (see .stage-badge in index.css) on hover or focus — native
// title tooltips are too slow on desktop and don't exist on touch.
export function StageBadge({ stage }: { stage?: string }) {
  const info = stageInfo(stage);
  if (!info) return null;
  return (
    <span
      tabIndex={0}
      data-blurb={info.blurb}
      aria-label={`${info.label}: ${info.blurb}`}
      className="stage-badge inline-flex items-center gap-1 rounded-md border border-term-border/60 bg-term-elevated/50 px-2 py-0.5 font-mono text-xs text-term-dim"
    >
      <span aria-hidden>{info.icon}</span>
      {info.label}
    </span>
  );
}
