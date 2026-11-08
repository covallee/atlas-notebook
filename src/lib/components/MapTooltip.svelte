<script>
  import { onDestroy } from 'svelte';
  import { resolveBossNames } from '../utils/bossNames.js';
  import bossImages from '../data/bossImages.json';
  import { preferences } from '../stores/preferences.js';
  import { customTags } from '../stores/customTags.js';

  export let map = null;
  export let onClose = () => {};

  $: bosses = map
    ? (map.boss_ids ?? []).map((id) => ({
        name: resolveBossNames([id])[0],
        image: bossImages[id],
      }))
    : [];
  $: isPreferred = map ? $preferences.has(map.name) : false;
  $: userTags = map ? ($customTags[map.name] ?? []) : [];

  let newTag = '';
  let tagFeedback = null; // { kind: 'duplicate' | 'error', message }
  let undoInfo = null; // { tag }
  let starFeedback = null;

  let feedbackTimer;
  let undoTimer;
  let starTimer;

  // Switching to a different map should drop any stale transient state
  // from the previous one (undo offers, error banners, unsent draft tags).
  let lastMapName = null;
  $: if (map && map.name !== lastMapName) {
    lastMapName = map.name;
    resetTransientState();
  }

  function resetTransientState() {
    clearTimeout(feedbackTimer);
    clearTimeout(undoTimer);
    clearTimeout(starTimer);
    tagFeedback = null;
    undoInfo = null;
    starFeedback = null;
    newTag = '';
  }

  onDestroy(() => {
    clearTimeout(feedbackTimer);
    clearTimeout(undoTimer);
    clearTimeout(starTimer);
  });

  function showTagFeedback(kind, message, ms = 2600) {
    clearTimeout(feedbackTimer);
    tagFeedback = { kind, message };
    feedbackTimer = setTimeout(() => {
      tagFeedback = null;
    }, ms);
  }

  function ratingBar(value) {
    return value ? Math.round((value / 10) * 100) : 0;
  }

  function handleAddTag() {
    if (!map || !newTag.trim()) return;
    const result = customTags.addTag(map.name, newTag);
    if (result.status === 'added') {
      newTag = '';
      tagFeedback = null;
      clearTimeout(undoTimer);
      undoInfo = null;
    } else if (result.status === 'duplicate') {
      showTagFeedback('duplicate', `Already tagged "${result.tag}"`);
    } else if (result.status === 'error') {
      showTagFeedback('error', 'Could not save tag — storage unavailable');
    }
  }

  function handleTagKeydown(e) {
    if (e.key === 'Enter') handleAddTag();
  }

  function handleRemoveTag(tag) {
    const result = customTags.removeTag(map.name, tag);
    if (result.status === 'removed') {
      clearTimeout(undoTimer);
      undoInfo = { tag };
      undoTimer = setTimeout(() => {
        undoInfo = null;
      }, 5000);
    } else if (result.status === 'error') {
      showTagFeedback('error', 'Could not remove tag — storage unavailable');
    }
  }

  function handleUndoRemove() {
    if (!map || !undoInfo) return;
    customTags.addTag(map.name, undoInfo.tag);
    clearTimeout(undoTimer);
    undoInfo = null;
  }

  function handleToggleStar() {
    if (!map) return;
    const ok = preferences.toggle(map.name);
    if (!ok) {
      clearTimeout(starTimer);
      starFeedback = 'Not saved — storage unavailable';
      starTimer = setTimeout(() => {
        starFeedback = null;
      }, 3200);
    } else {
      starFeedback = null;
    }
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
          aria-label={isPreferred ? 'Remove from preferred' : 'Add to preferred'}
          on:click={handleToggleStar}
        >
          ★
        </button>
        <button class="close-btn" aria-label="Close map details" on:click={onClose}>✕</button>
      </div>
    </div>
    {#if starFeedback}
      <p class="inline-status error star-status" role="status">{starFeedback}</p>
    {/if}

    {#if map.image}
      <img class="map-image" src={map.image} alt={map.name} />
    {/if}

    <div class="tooltip-body">
      <div class="info-row">
        <span class="label">Level</span>
        <span>{[...new Set(map.levels)].join(' / ')}</span>
      </div>

      {#if bosses.length}
        <div class="info-section">
          <div class="label">Bosses</div>
          <ul class="boss-list">
            {#each bosses as boss}
              <li class="boss">
                <span>{boss.name}</span>
                {#if boss.image}
                  <img class="boss-image" src={boss.image} alt={boss.name} />
                {/if}
              </li>
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

      <!-- Custom user tags -->
      <div class="info-section">
        <div class="label">My Tags</div>
        <div class="tags">
          {#each userTags as tag}
            <span class="tag custom-tag">
              {tag}
              <button
                class="remove-tag"
                on:click={() => handleRemoveTag(tag)}
                title="Remove tag"
                aria-label={`Remove tag ${tag}`}
              >✕</button>
            </span>
          {/each}
        </div>
        <div class="tag-input-row">
          <input
            class="tag-input"
            bind:value={newTag}
            on:keydown={handleTagKeydown}
            placeholder="Add tag…"
            maxlength="32"
            aria-label="Add a custom tag"
          />
          <button class="add-tag-btn" on:click={handleAddTag} aria-label="Add tag">+</button>
        </div>
        <div aria-live="polite">
          {#if tagFeedback}
            <p class="inline-status" class:error={tagFeedback.kind === 'error'}>{tagFeedback.message}</p>
          {:else if undoInfo}
            <p class="inline-status undo-row">
              Removed "{undoInfo.tag}"
              <button class="undo-btn" on:click={handleUndoRemove}>Undo</button>
            </p>
          {/if}
        </div>
      </div>
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
    min-width: 32px;
    min-height: 32px;
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
    min-width: 32px;
    min-height: 32px;
    padding: 0 2px;
  }
  .close-btn:hover { color: #fff; }
  .star-btn:focus-visible,
  .close-btn:focus-visible {
    outline: 2px solid #c8a96e;
    outline-offset: 2px;
  }
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
  .boss {
    margin-bottom: 8px;
  }
  .boss-image {
    display: block;
    width: 100%;
    max-height: 180px;
    margin-top: 4px;
    border: 1px solid #4a3f6b;
    border-radius: 4px;
    object-fit: contain;
    background: #12122a;
  }
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
  .custom-tag {
    background: #1a3a4a;
    border-color: #4dd0e1;
    color: #4dd0e1;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .remove-tag {
    background: none;
    border: none;
    color: #4dd0e1;
    cursor: pointer;
    font-size: 11px;
    padding: 0;
    line-height: 1;
    opacity: 0.7;
  }
  .remove-tag:hover { opacity: 1; }
  .tag-input-row {
    display: flex;
    gap: 4px;
    margin-top: 4px;
  }
  .tag-input {
    flex: 1;
    background: #1a1a3a;
    border: 1px solid #4a3f6b;
    border-radius: 4px;
    color: #e0d9f0;
    font-size: 12px;
    padding: 4px 8px;
    outline: none;
  }
  .tag-input:focus { border-color: #4dd0e1; }
  .tag-input::placeholder { color: #555; }
  .add-tag-btn {
    background: #2d2d4e;
    border: 1px solid #4a3f6b;
    border-radius: 4px;
    color: #e0d9f0;
    cursor: pointer;
    font-size: 16px;
    padding: 0 10px;
    line-height: 1;
  }
  .add-tag-btn:hover { background: #3a3a6a; border-color: #4dd0e1; }

  .inline-status {
    margin: 4px 0 0;
    font-size: 11px;
    color: #b0a8c8;
    line-height: 1.4;
  }
  .inline-status.error { color: #ef9a9a; }
  .star-status {
    padding: 4px 12px 0;
    margin: 0;
  }
  .undo-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .undo-btn {
    background: none;
    border: none;
    color: #4dd0e1;
    font-size: 11px;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    min-height: 22px;
  }
  .undo-btn:hover { color: #7fe3f2; }
  .undo-btn:focus-visible {
    outline: 2px solid #4dd0e1;
    outline-offset: 2px;
  }

  @media (max-width: 700px) {
    .tooltip {
      top: auto;
      right: 12px;
      bottom: 12px;
      left: 12px;
      width: auto;
      max-height: calc(100vh - 132px);
      transform: none;
    }
    .tooltip-body {
      max-height: min(45vh, 360px);
    }
  }
</style>
