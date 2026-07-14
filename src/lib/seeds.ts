// Community seeds: visitors can "plant a seed" on any garden page, and a
// page's growth stage rises with the seeds it has collected. Counts live in
// counterapi.dev (a tiny public counter service — no accounts, CORS open),
// keyed per page. The author's `stage:` frontmatter acts as a floor: seeds
// can raise a page's stage above it but never below.
//
// Everything degrades gracefully: if the counter service is unreachable the
// UI falls back to the frontmatter stage and simply hides seed counts.

import type { Stage } from '@/lib/stages';

const API = 'https://api.counterapi.dev/v1';
const NAMESPACE = 'andrewlidong-xyz-garden';
const PLANTED_KEY = 'garden-seeds-planted';

// Seeds needed to reach each stage.
export const STAGE_THRESHOLDS: Array<{ stage: Stage; seeds: number }> = [
  { stage: 'evergreen', seeds: 25 },
  { stage: 'budding', seeds: 5 },
  { stage: 'seedling', seeds: 0 },
];

const ORDER: Stage[] = ['seedling', 'budding', 'evergreen'];

export function stageFromSeeds(count: number): Stage {
  for (const { stage, seeds } of STAGE_THRESHOLDS) {
    if (count >= seeds) return stage;
  }
  return 'seedling';
}

/** The higher of the author's floor stage and the seed-derived stage. */
export function effectiveStage(floor: string | undefined, seeds: number | null): string | undefined {
  const seedStage = seeds === null ? undefined : stageFromSeeds(seeds);
  const a = ORDER.indexOf((floor || '') as Stage);
  const b = ORDER.indexOf((seedStage || '') as Stage);
  const best = Math.max(a, b);
  return best === -1 ? undefined : ORDER[best];
}

function seedKey(filePath: string): string {
  return filePath
    .replace(/^\/files\//, '')
    .replace(/\.(md|markdown)$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
}

async function counterFetch(path: string, zeroOnMissing = false): Promise<number | null> {
  try {
    const res = await fetch(`${API}/${NAMESPACE}/${path}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      // The service answers 400 "record not found" for counters that have
      // never been incremented — that's just a page with no seeds yet.
      return zeroOnMissing && (res.status === 400 || res.status === 404) ? 0 : null;
    }
    const data = await res.json();
    return typeof data.count === 'number' ? data.count : null;
  } catch {
    return null;
  }
}

/** Current seed count for a page, or null if the service is unreachable. */
export function getSeeds(filePath: string): Promise<number | null> {
  return counterFetch(`${seedKey(filePath)}/`, true);
}

/** Plant a seed. Returns the new count, or null on failure. */
export function plantSeed(filePath: string): Promise<number | null> {
  return counterFetch(`${seedKey(filePath)}/up`);
}

// One seed per page per browser — an honor-system guard, which is plenty
// for a personal garden.
function plantedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(PLANTED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function hasPlanted(filePath: string): boolean {
  return plantedSet().has(seedKey(filePath));
}

export function rememberPlanted(filePath: string): void {
  try {
    const set = plantedSet();
    set.add(seedKey(filePath));
    localStorage.setItem(PLANTED_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage unavailable (private browsing etc.) — planting still counts.
  }
}
