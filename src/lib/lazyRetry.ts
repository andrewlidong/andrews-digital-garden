import { lazy } from 'react';

// React.lazy that survives deploys. GitHub Pages serves index.html with a
// ~10-minute cache while every deploy renames the hashed chunks, so a browser
// holding yesterday's HTML 404s when it lazily loads a route chunk — the
// first click of "blog" or a post just dies. On a chunk-load failure this
// reloads the page once (fetching fresh HTML + chunk names); a timestamp
// guard prevents reload loops when something is genuinely broken.
const RELOAD_KEY = 'chunk-reload-at';

export function lazyRetry<T extends { default: React.ComponentType<never> }>(
  factory: () => Promise<T>
) {
  return lazy(() =>
    factory().catch((err) => {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
      } catch {
        /* private mode */
      }
      if (Date.now() - last > 15_000) {
        try {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        } catch {
          /* private mode */
        }
        window.location.reload();
        // The page is reloading — keep React suspended instead of erroring.
        return new Promise<T>(() => {});
      }
      throw err;
    })
  );
}
