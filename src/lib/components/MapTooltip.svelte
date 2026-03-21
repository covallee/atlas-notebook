<script>
  import { resolveBossNames } from '../utils/bossNames.js';
  import { preferences } from '../stores/preferences.js';

  export let map = null;
  export let onClose = () => {};

  $: bossNames = map ? resolveBossNames(map.boss_ids) : [];
  $: isPreferred = map ? $preferences.has(map.name) : false;

  function ratingBar(value) {
    return value ? Math.round((value / 10) * 100) : 0;
  }
</script>

{#if map}
  <div class="tooltip">
    <div class="tooltip-header">
      <div class="tooltip-title">
        <span class="map-name">{map.name}</span>
        <span class="map-type">{map.type}</span>
      </div>
      <div class="tooltip-actions">
        <button
          class="star-btn"
          class:active={isPreferred}
          title={isPreferred ? 'Remove from preferred' : 'Add to preferred'}
          on:click={() => preferences.toggle(map.name)}
        >
          ★
        </button>
        <button class="close-btn" on:click={onClose}>✕</button>
      </div>
    </div>

    {#if map.image}
      <img class="map-image" src={map.image} alt={map.name} />
    {/if}

    <div class="tooltip-body">
      <div class="info-row">
        <span class="label">Level</span>
        <span>{[...new Set(map.levels)].join(' / ')}</span>
      </div>

      {#if bossNames.length}
        <div class="info-section">
          <div class="label">Bosses</div>
          <ul class="boss-list">
            {#each bossNames as name}
              <li>{name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if Object.keys(map.rating ?? {}).length}
        <div class="info-section">
          <div class="label">Ratings</div>
          {#each Object.entries(map.rating) as [key, val]}
            <div class="rating-row">
              <span class="rating-label">{key}</span>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width:{ratingBar(val)}%"></div>
              </div>
              <span class="rating-val">{val}/10</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if Object.keys(map.tags ?? {}).filter((k) => map.tags[k]).length}
        <div class="info-section">
          <div class="label">Tags</div>
          <div class="tags">
            {#each Object.entries(map.tags).filter(([, v]) => v) as [tag]}
              <span class="tag">{tag.replace(/_/g, ' ')}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if map.info?.boss}
        <div class="info-section">
          <div class="label">Boss Notes</div>
          <p class="info-text">{map.info.boss}</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 280px;
    background: #1a1a2e;
    border: 1px solid #4a3f6b;
    border-radius: 8px;
    color: #e0d9f0;
    font-size: 13px;
    z-index: 100;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }
  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 12px 8px;
    background: #16213e;
    border-bottom: 1px solid #4a3f6b;
  }
  .map-name {
    font-weight: 700;
    font-size: 14px;
    color: #c8a96e;
    display: block;
  }
  .map-type {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .tooltip-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  .star-btn {
    background: none;
    border: none;
    color: #555;
    font-size: 18px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
  }
  .star-btn.active { color: #c8a96e; }
  .close-btn {
    background: none;
    border: none;
    color: #888;
    font-size: 14px;
    cursor: pointer;
    padding: 0 2px;
  }
  .close-btn:hover { color: #fff; }
  .map-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
  .tooltip-body {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 60vh;
    overflow-y: auto;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
  }
  .info-section { display: flex; flex-direction: column; gap: 5px; }
  .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #888;
  }
  .boss-list {
    margin: 0;
    padding-left: 16px;
    color: #c8b8e0;
  }
  .boss-list li { margin-bottom: 2px; }
  .rating-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rating-label {
    width: 60px;
    text-transform: capitalize;
    color: #aaa;
    font-size: 12px;
  }
  .rating-bar-bg {
    flex: 1;
    height: 6px;
    background: #2d2d4e;
    border-radius: 3px;
    overflow: hidden;
  }
  .rating-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #7c4dff, #c8a96e);
    border-radius: 3px;
    transition: width 0.3s;
  }
  .rating-val { font-size: 11px; color: #aaa; width: 30px; text-align: right; }
  .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    background: #2d2d4e;
    border: 1px solid #4a3f6b;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 11px;
    color: #b0a0d0;
    text-transform: capitalize;
  }
  .info-text { margin: 0; color: #b0a0d0; font-size: 12px; line-height: 1.5; }
</style>
