<script>
  import { FILTERS } from '../utils/filters.js';
  import { activeFilters } from '../stores/filters.js';

  const MAP_TYPES = [
    { label: 'Map', color: '#3a3a5c' },
    { label: 'Special Map', color: '#4a2060' },
    { label: 'Unique Map', color: '#5c3a00' },
  ];

  $: activeList = FILTERS.filter((f) => $activeFilters.has(f.id));
  $: activeCustomTags = [...$activeFilters]
    .filter((id) => id.startsWith('custom:'))
    .map((id) => ({ id, label: id.slice(7), color: '#4dd0e1' }));
</script>

<div class="legend">
  {#each MAP_TYPES as type}
    <div class="legend-item">
      <span class="swatch" style="background:{type.color}"></span>
      <span>{type.label}</span>
    </div>
  {/each}
  {#if activeList.length || activeCustomTags.length}
    <div class="legend-divider"></div>
    {#each activeList as f}
      <div class="legend-item">
        <span class="swatch" style="background:{f.color}"></span>
        <span>{f.label}</span>
      </div>
    {/each}
    {#each activeCustomTags as f}
      <div class="legend-item">
        <span class="swatch" style="background:{f.color}; border: 1px solid #4dd0e1"></span>
        <span>{f.label}</span>
      </div>
    {/each}
  {/if}
</div>

<style>
  .legend {
    position: absolute;
    bottom: 12px;
    left: 212px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    pointer-events: none;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(13,13,26,0.85);
    border: 1px solid #2a2a4a;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    color: #b0a8c8;
  }
  .legend-divider {
    width: 1px;
    background: #2a2a4a;
    margin: 2px 0;
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }
</style>
