import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";

// lib.dom may not know about the View Transitions API yet, so describe the
// one method we use instead of relying on the global type.
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
};

export function supportsViewTransitions(): boolean {
  if (typeof document === "undefined") return false;
  if (!("startViewTransition" in document)) return false;
  if (typeof window.matchMedia !== "function") return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Drop-in replacement for react-router's `useNavigate` that wraps the route
 * change in `document.startViewTransition` where supported. The navigation
 * is flushed synchronously inside the callback so the browser snapshots the
 * old DOM, commits the new route, and crossfades between them. Falls back to
 * a plain navigation when the API is missing or reduced motion is requested.
 */
export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  return useCallback(
    (to: To, opts?: NavigateOptions) => {
      const doc = document as ViewTransitionDocument;
      if (!supportsViewTransitions() || !doc.startViewTransition) {
        navigate(to, opts);
        return;
      }
      doc.startViewTransition(() => {
        flushSync(() => navigate(to, opts));
      });
    },
    [navigate]
  );
}
