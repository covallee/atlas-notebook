import { writable } from 'svelte/store';
import { FILTERS } from '../utils/filters.js';

// activeFilters: Set of filter IDs that are currently toggled on
export const activeFilters = writable(new Set());

// preferredOnly: boolean — if true, dim maps that aren't preferred
export const preferredOnly = writable(false);

export function toggleFilter(id) {
  activeFilters.update((s) => {
    const next = new Set(s);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}

/**
 * Given a map and the current active filter set, return the first
 * matching filter's color (or null if no match).
 */
export function getHighlightColor(map, active) {
  for (const f of FILTERS) {
    if (active.has(f.id) && f.test(map)) return f.color;
  }
  return null;
}
