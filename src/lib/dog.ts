// Persistence and signalling for the paw-print-following dog. Enabled by
// default; toggled from the terminal with `dog`. A window event keeps the
// current tab in sync, and the `storage` event handles other tabs.

const STORAGE_KEY = "garden-dog";
export const DOG_EVENT = "garden-dog-change";
/** Sends the dog back to its bed (the header's paw button). */
export const DOG_HOME_EVENT = "garden-dog-home";
/** A paw print was dropped at `detail.{x,y}` (viewport px); the dog goes there. */
export const DOG_PAW_EVENT = "garden-dog-paw";

export function callDogHome(): void {
  window.dispatchEvent(new Event(DOG_HOME_EVENT));
}

export function dropPawForDog(x: number, y: number): void {
  window.dispatchEvent(new CustomEvent(DOG_PAW_EVENT, { detail: { x, y } }));
}

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
