<script>
  import { FILTERS } from '../utils/filters.js';
  import { activeFilters } from '../stores/filters.js';

  $: activeList = FILTERS.filter((f) => $activeFilters.has(f.id));
</script>

{#if activeList.length}
  <div class="legend">
    {#each activeList as f}
      <div class="legend-item">
        <span class="swatch" style="background:{f.color}"></span>
        <span>{f.label}</span>
      </div>
    {/each}
  </div>
{/if}

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
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }
</style>
