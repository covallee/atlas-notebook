/**
 * Filter definitions for the Atlas highlight panel.
 * Each entry: { id, label, color, test: (map) => boolean }
 * To add a new filter, just append a new entry here.
 */
export const FILTERS = [
  {
    id: 'linear',
    label: 'Linear',
    color: '#4fc3f7',
    test: (m) => !!m.tags?.linear,
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    color: '#81c784',
    test: (m) => !!m.tags?.outdoors,
  },
  {
    id: 'few_obstacles',
    label: 'Few Obstacles',
    color: '#fff176',
    test: (m) => !!m.tags?.few_obstacles,
  },
  {
    id: 'good_layout',
    label: 'Good Layout (≥7)',
    color: '#ffb74d',
    test: (m) => (m.rating?.layout ?? 0) >= 7,
  },
  {
    id: 'high_density',
    label: 'High Density (≥7)',
    color: '#ce93d8',
    test: (m) => (m.rating?.density ?? 0) >= 7,
  },
  {
    id: 'boss_rushable',
    label: 'Boss Rushable',
    color: '#ef9a9a',
    test: (m) => !!m.tags?.boss_rushable,
  },
  {
    id: 'boss_separated',
    label: 'Boss Separated',
    color: '#f48fb1',
    test: (m) => !!m.tags?.boss_separated,
  },
  {
    id: 'boss_phases',
    label: 'Boss Has Phases',
    color: '#ff7043',
    test: (m) => !!m.tags?.boss_phases,
  },
];
