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

const CUSTOM_TAG_COLOR = '#4dd0e1';

/**
 * Given a map, the current active filter set, and the customTags data,
 * return the first matching filter's color (or null if no match).
 */
export function getHighlightColor(map, active, customTagsData = {}) {
  // Check built-in filters first
  for (const f of FILTERS) {
    if (active.has(f.id) && f.test(map)) return f.color;
  }
  // Check active custom tag filters (id format: "custom:TagName")
  const mapTags = new Set(customTagsData[map.name] ?? []);
  for (const id of active) {
    if (id.startsWith('custom:')) {
      const tag = id.slice(7);
      if (mapTags.has(tag)) return CUSTOM_TAG_COLOR;
    }
  }
  return null;
}
