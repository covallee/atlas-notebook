import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'atlas-custom-tags';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const MAX_TAG_LENGTH = 32;

function createCustomTagsStore() {
  const { subscribe, update, set } = writable(load());

  /** Persists `next`, returns true on success, false if storage is unavailable/full. */
  function persist(next) {
    try {
      save(next);
      return true;
    } catch {
      return false;
    }
  }

  return {
    subscribe,

    /**
     * Adds `tag` to `mapName`, case-insensitively deduped.
     * Returns { status: 'added' | 'duplicate' | 'empty' | 'error', tag }
     * so callers can give the user reassurance or a reason nothing changed.
     */
    addTag(mapName, tag) {
      const t = (tag ?? '').trim().slice(0, MAX_TAG_LENGTH);
      if (!t) return { status: 'empty' };

      let result = { status: 'added', tag: t };
      update((data) => {
        const existing = data[mapName] ?? [];
        const dupe = existing.find((x) => x.toLowerCase() === t.toLowerCase());
        if (dupe) {
          result = { status: 'duplicate', tag: dupe };
          return data;
        }
        const next = { ...data, [mapName]: [...existing, t] };
        if (!persist(next)) {
          result = { status: 'error', tag: t };
          return data;
        }
        return next;
      });
      return result;
    },

    /**
     * Removes `tag` from `mapName`.
     * Returns { status: 'removed' | 'missing' | 'error', tag } so callers
     * can offer an undo affordance or surface a storage failure.
     */
    removeTag(mapName, tag) {
      let result = { status: 'removed', tag };
      update((data) => {
        const existing = data[mapName] ?? [];
        if (!existing.includes(tag)) {
          result = { status: 'missing', tag };
          return data;
        }
        const filtered = existing.filter((x) => x !== tag);
        const next = { ...data };
        if (filtered.length === 0) {
          delete next[mapName];
        } else {
          next[mapName] = filtered;
        }
        if (!persist(next)) {
          result = { status: 'error', tag };
          return data;
        }
        return next;
      });
      return result;
    },

    getTags(data, mapName) {
      return data[mapName] ?? [];
    },
  };
}

export const customTags = createCustomTagsStore();

/** Derived store: sorted list of all unique custom tags across all maps */
export const allCustomTags = derived(customTags, ($ct) => {
  const all = new Set();
  for (const tags of Object.values($ct)) {
    for (const t of tags) all.add(t);
  }
  return [...all].sort();
});
