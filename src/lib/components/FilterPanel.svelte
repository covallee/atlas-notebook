<script>
  import { FILTERS } from '../utils/filters.js';
  import { activeFilters, preferredOnly, toggleFilter } from '../stores/filters.js';
  import { allCustomTags } from '../stores/customTags.js';

  function handleFilterClick(id) {
    toggleFilter(id);
  }
</script>

<aside class="filter-panel">
  <h2>Filters</h2>

  <div class="filter-group">
    <label class="filter-item preferred-toggle">
      <input type="checkbox" bind:checked={$preferredOnly} />
      <span class="dot" style="background:#c8a96e"></span>
      Preferred Only
    </label>
  </div>

  <hr />

  <div class="filter-group">
    {#each FILTERS as filter}
      {@const active = $activeFilters.has(filter.id)}
      <button
        class="filter-item"
        class:active
        on:click={() => handleFilterClick(filter.id)}
        title={filter.label}
      >
        <span class="dot" style="background:{active ? filter.color : '#3a3a5c'}"></span>
        {filter.label}
      </button>
    {/each}
  </div>

  {#if $allCustomTags.length}
    <hr />
    <h2>My Tags</h2>
    <div class="filter-group">
      {#each $allCustomTags as tag}
        {@const id = `custom:${tag}`}
        {@const active = $activeFilters.has(id)}
        <button
          class="filter-item"
          class:active
          on:click={() => handleFilterClick(id)}
        >
          <span class="dot" style="background:{active ? '#4dd0e1' : '#1a3a4a'}; border: 1px solid #4dd0e1"></span>
          {tag}
        </button>
      {/each}
    </div>
  {/if}
</aside>

<style>
  .filter-panel {
    width: 200px;
    flex-shrink: 0;
    background: #12122a;
    border-right: 1px solid #2a2a4a;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  }
  h2 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
    margin: 0 0 4px;
  }
  hr {
    border: none;
    border-top: 1px solid #2a2a4a;
    margin: 4px 0;
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid transparent;
    border-radius: 5px;
    padding: 5px 8px;
    color: #b0a8c8;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-color 0.15s;
  }
  .filter-item:hover {
    background: #1e1e3a;
    border-color: #4a3f6b;
  }
  .filter-item.active {
    background: #1e1e3a;
    border-color: #7c4dff;
    color: #e0d9f0;
  }
  .preferred-toggle {
    cursor: pointer;
    user-select: none;
  }
  .preferred-toggle input {
    display: none;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-block;
  }
  @media (max-width: 700px) {
    .filter-panel {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #2a2a4a;
      padding: 8px;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
    }
    h2,
    hr {
      display: none;
    }
    .filter-group {
      flex-direction: row;
      gap: 6px;
      flex-shrink: 0;
    }
    .filter-item {
      white-space: nowrap;
      padding: 5px 10px;
    }
  }
</style>
