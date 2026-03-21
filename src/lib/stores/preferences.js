import { writable } from 'svelte/store';

const STORAGE_KEY = 'atlas-preferred';

function loadPreferred() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function createPreferencesStore() {
  const { subscribe, set, update } = writable(loadPreferred());

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        return next;
      });
    },
    isPreferred(prefs, mapName) {
      return prefs.has(mapName);
    },
  };
}

export const preferences = createPreferencesStore();
