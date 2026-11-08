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
    /**
     * Toggles `mapName`'s preferred state. Returns true if the change was
     * persisted, false if storage failed (e.g. private browsing, quota) —
     * in which case the in-memory state is rolled back so the star never
     * lies about what's actually saved.
     */
    toggle(mapName) {
      let ok = true;
      update((prefs) => {
        const next = new Set(prefs);
        if (next.has(mapName)) {
          next.delete(mapName);
        } else {
          next.add(mapName);
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          ok = false;
          return prefs;
        }
        return next;
      });
      return ok;
    },
    isPreferred(prefs, mapName) {
      return prefs.has(mapName);
    },
  };
}

export const preferences = createPreferencesStore();
