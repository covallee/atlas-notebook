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

function createCustomTagsStore() {
  const { subscribe, update, set } = writable(load());

  return {
    subscribe,

    addTag(mapName, tag) {
      const t = tag.trim();
      if (!t) return;
      update((data) => {
        const next = { ...data };
        const existing = new Set(next[mapName] ?? []);
        existing.add(t);
        next[mapName] = [...existing];
        save(next);
        return next;
      });
    },

    removeTag(mapName, tag) {
      update((data) => {
        const next = { ...data };
        const existing = new Set(next[mapName] ?? []);
        existing.delete(tag);
        if (existing.size === 0) {
          delete next[mapName];
        } else {
          next[mapName] = [...existing];
        }
        save(next);
        return next;
      });
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
