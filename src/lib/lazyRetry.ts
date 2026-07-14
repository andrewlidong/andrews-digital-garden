import { createElement, lazy } from 'react';

// React.lazy that survives deploys. GitHub Pages serves index.html with a
// ~10-minute cache while every deploy renames the hashed chunks, so a browser
// holding yesterday's HTML 404s when it lazily loads a route chunk — the
// first click of "blog" or a post just dies. On a chunk-load failure this
// reloads the page once (fetching fresh HTML + chunk names). If the reload
// happened recently and the chunk STILL fails (e.g. the CDN is mid-deploy and
// serving stale HTML), render a small notice instead of a blank screen.
const RELOAD_KEY = 'chunk-reload-at';

// Deliberately self-contained styling: if chunks are failing, the theme CSS
// may be unavailable too.
function StaleNotice() {
  return createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: '#1a1b26',
        color: '#c8d3f5',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '14px',
        padding: '24px',
        textAlign: 'center',
      },
    },
    createElement('div', null, 'the garden just redeployed and your browser has a stale copy.'),
    createElement(
      'button',
      {
        onClick: () => window.location.reload(),
        style: {
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #414868',
          background: '#24283b',
          color: '#82aaff',
          fontFamily: 'inherit',
          fontSize: '14px',
          cursor: 'pointer',
        },
      },
      'reload'
    ),
    createElement(
      'div',
      { style: { color: '#565f89', fontSize: '12px' } },
      'if it persists, wait a minute — the deploy is still settling'
    )
  );
}

export function lazyRetry<T extends { default: React.ComponentType<never> }>(
  factory: () => Promise<T>
) {
  return lazy(() =>
    factory().catch(() => {
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
      // Reloaded recently and still failing: show a notice, never a black page.
      return { default: StaleNotice } as unknown as T;
    })
  );
}
