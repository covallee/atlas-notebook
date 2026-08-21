import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'atlas-custom-tags';
const UNDO_WINDOW_MS = 5000;
export const customTagStatus = writable('');
export const customTagUndo = writable(null);
let clearUndoTimer;
let clearStatusTimer;
let undoPayload = null;
customTagUndo.subscribe((value) => {
  undoPayload = value;
});

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

function persist(next) {
  try {
    save(next);
    return true;
  } catch {
    setStatus('Storage unavailable. Tag change not saved.');
    customTagUndo.set(null);
    return false;
  }
}

function scheduleUndoClear() {
  if (clearUndoTimer) clearTimeout(clearUndoTimer);
  clearUndoTimer = setTimeout(() => customTagUndo.set(null), UNDO_WINDOW_MS);
}

function setStatus(message) {
  customTagStatus.set(message);
  if (clearStatusTimer) clearTimeout(clearStatusTimer);
  clearStatusTimer = setTimeout(() => customTagStatus.set(''), UNDO_WINDOW_MS);
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
        const currentTags = next[mapName] ?? [];
        if (currentTags.some((existingTag) => existingTag.toLowerCase() === t.toLowerCase())) {
          setStatus('Already tagged.');
          return data;
        }
        next[mapName] = [...currentTags, t];
        if (!persist(next)) return data;
        setStatus(`Added "${t}".`);
        customTagUndo.set(null);
        return next;
      });
    },

    removeTag(mapName, tag) {
      update((data) => {
        const next = { ...data };
        const existing = next[mapName] ?? [];
        const removedIndex = existing.findIndex((value) => value === tag);
        if (removedIndex === -1) return data;
        const remaining = existing.filter((value) => value !== tag);
        if (remaining.length === 0) {
          delete next[mapName];
        } else {
          next[mapName] = remaining;
        }
        if (!persist(next)) return data;
        customTagUndo.set({ mapName, tag, index: removedIndex });
        scheduleUndoClear();
        setStatus(`Removed "${tag}".`);
        return next;
      });
    },

    undoRemove() {
      let undone = false;
      let restoredTag = '';
      update((data) => {
        if (!undoPayload) return data;
        const next = { ...data };
        const current = [...(next[undoPayload.mapName] ?? [])];
        const index = Math.max(0, Math.min(undoPayload.index, current.length));
        current.splice(index, 0, undoPayload.tag);
        next[undoPayload.mapName] = current;
        if (!persist(next)) return data;
        undone = true;
        restoredTag = undoPayload.tag;
        return next;
      });
      if (undone) {
        if (clearUndoTimer) clearTimeout(clearUndoTimer);
        customTagUndo.set(null);
        setStatus(`Restored "${restoredTag}".`);
      }
    },

    getTags(data, mapName) {
      return data[mapName] ?? [];
    },
  };
}

export const customTags = createCustomTagsStore();

/** Derived store: sorted list of all unique custom tags across all maps */
export const allCustomTags = derived(customTags, ($ct) => {
  const all = new Map();
  for (const tags of Object.values($ct)) {
    for (const t of tags) {
      const key = t.toLowerCase();
      if (!all.has(key)) all.set(key, t);
    }
  }
  return [...all.values()].sort((a, b) => a.localeCompare(b));
});
