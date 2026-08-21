import { writable } from 'svelte/store';

const STORAGE_KEY = 'atlas-preferred';
export const preferencesStorageError = writable('');
export const preferencesStatus = writable('');
const STATUS_MS = 4000;
let statusTimer;

function setStatus(message) {
  preferencesStatus.set(message);
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => preferencesStatus.set(''), STATUS_MS);
}

function loadPreferred() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function createPreferencesStore() {
  const { subscribe, update } = writable(loadPreferred());

  return {
    subscribe,
    toggle(mapName) {
      update((prefs) => {
        const next = new Set(prefs);
        if (next.has(mapName)) {
          next.delete(mapName);
        } else {
          next.add(mapName);
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
          preferencesStorageError.set('');
          setStatus(next.has(mapName) ? 'Added to preferred maps.' : 'Removed from preferred maps.');
          return next;
        } catch {
          preferencesStorageError.set('Storage unavailable. Preference not saved.');
          setStatus('');
          return prefs;
        }
      });
    },
    isPreferred(prefs, mapName) {
      return prefs.has(mapName);
    },
  };
}

export const preferences = createPreferencesStore();
