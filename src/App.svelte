<script>
  import AtlasCanvas from './lib/components/AtlasCanvas.svelte';
  import FilterPanel from './lib/components/FilterPanel.svelte';
  import MapTooltip from './lib/components/MapTooltip.svelte';
  import Legend from './lib/components/Legend.svelte';

  let selectedMap = null;

  function handleSelectMap(map) {
    selectedMap = selectedMap?.name === map.name ? null : map;
  }
</script>

<div class="app">
  <header class="app-header">
    <span class="app-title">⚔ PoE Atlas Notebook</span>
    <span class="app-subtitle">Path of Exile — Atlas Explorer</span>
  </header>

  <div class="app-body">
    <FilterPanel />

    <div class="canvas-container">
      <AtlasCanvas onSelectMap={handleSelectMap} {selectedMap} />
      <Legend />
    </div>

    <MapTooltip map={selectedMap} onClose={() => (selectedMap = null)} />
  </div>
</div>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    background: #0d0d1a;
    color: #e0d9f0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    height: 100vh;
    overflow: hidden;
  }
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .app-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 10px 16px;
    background: #12122a;
    border-bottom: 1px solid #2a2a4a;
    flex-shrink: 0;
  }
  .app-title {
    font-size: 16px;
    font-weight: 700;
    color: #c8a96e;
    letter-spacing: 0.5px;
  }
  .app-subtitle {
    font-size: 12px;
    color: #666;
  }
  .app-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }
  .canvas-container {
    flex: 1;
    min-width: 0;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }

  @media (max-width: 700px) {
    .app-header {
      padding: 8px 12px;
    }
    .app-subtitle {
      display: none;
    }
    .app-body {
      flex-direction: column;
    }
  }
</style>
