import monsters from '../data/monsters.json';

/**
 * Resolve a list of boss_ids to human-readable display names.
 * Falls back to the raw ID if not found in monsters.json.
 */
export function resolveBossNames(bossIds = []) {
  return bossIds.map((id) => monsters[id] ?? id.split('/').pop());
}
