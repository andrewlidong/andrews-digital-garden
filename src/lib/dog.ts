// Persistence for the cursor-chasing dog. Enabled by default; toggled from the
// terminal with `dog`. A window event keeps the current tab in sync, and the
// `storage` event handles other tabs.

const STORAGE_KEY = "garden-dog";
export const DOG_EVENT = "garden-dog-change";

export function loadDogEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setDogEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Private mode / storage disabled: the toggle still works for this tab.
  }
  window.dispatchEvent(new CustomEvent(DOG_EVENT, { detail: enabled }));
}

export function toggleDog(): boolean {
  const next = !loadDogEnabled();
  setDogEnabled(next);
  return next;
}

export function isDogStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}
