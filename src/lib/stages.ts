// Digital-garden growth stages. A page opts in via `stage:` frontmatter;
// anything else (or a typo) simply shows no badge.

export type Stage = 'seedling' | 'budding' | 'evergreen';

export const STAGES: Record<Stage, { icon: string; label: string; blurb: string }> = {
  seedling: {
    icon: '🌱',
    label: 'seedling',
    blurb: 'A fresh idea — rough, unfinished, still finding its shape.',
  },
  budding: {
    icon: '🌿',
    label: 'budding',
    blurb: 'Growing — revisited and revised now and then.',
  },
  evergreen: {
    icon: '🌲',
    label: 'evergreen',
    blurb: 'Mature and tended — reasonably complete, kept alive.',
  },
};

export function stageInfo(stage?: string) {
  const key = (stage || '').trim().toLowerCase();
  return key in STAGES ? STAGES[key as Stage] : null;
}
