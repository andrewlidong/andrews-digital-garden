// Contextual actions for the command palette. Pages register what they can
// do while mounted (copy permalink, close all windows, …) and the palette
// lists them at the top. Module-level store + useSyncExternalStore so the
// palette, which lives outside every page in App.tsx, needs no provider.

import { useEffect, useRef, useSyncExternalStore } from 'react';

export type PaletteAction = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

let actions: PaletteAction[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function unregister(id: string) {
  if (!actions.some((a) => a.id === id)) return;
  actions = actions.filter((a) => a.id !== id);
  emit();
}

/** Re-registering an existing id updates it in place, keeping list order. */
export function registerPaletteAction(action: PaletteAction): () => void {
  const at = actions.findIndex((a) => a.id === action.id);
  actions = at === -1 ? [...actions, action] : actions.map((a, i) => (i === at ? action : a));
  emit();
  return () => unregister(action.id);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePaletteActions(): PaletteAction[] {
  return useSyncExternalStore(subscribe, () => actions, () => actions);
}

/**
 * Register an action for as long as the calling component is mounted (pass
 * null to register nothing). Label/hint changes update in place; the latest
 * `run` is always called, so callers can pass inline closures.
 */
export function useRegisterPaletteAction(action: PaletteAction | null): void {
  const runRef = useRef(action?.run);
  runRef.current = action?.run;
  const { id, label, hint } = action ?? {};
  useEffect(() => {
    if (!id || !label) return;
    registerPaletteAction({ id, label, hint, run: () => runRef.current?.() });
  }, [id, label, hint]);
  useEffect(() => {
    if (!id) return;
    return () => unregister(id);
  }, [id]);
}
