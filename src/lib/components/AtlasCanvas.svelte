<script>
  import { onMount } from 'svelte';
  import mapsData from '../data/maps.json';
  import MapNode from './MapNode.svelte';
  import { activeFilters, preferredOnly, getHighlightColor } from '../stores/filters.js';
  import { preferences } from '../stores/preferences.js';
  import { customTags } from '../stores/customTags.js';

  export let onSelectMap = () => {};
  export let selectedMap = null;

  // Only atlas maps with coordinates
  const atlasMaps = mapsData.filter((m) => m.atlas && m.x != null && m.y != null);

  // Build connection pairs (deduplicated)
  const connections = [];
  const seen = new Set();
  const mapByName = Object.fromEntries(atlasMaps.map((m) => [m.name, m]));
  for (const m of atlasMaps) {
    for (const connName of m.connected ?? []) {
      const key = [m.name, connName].sort().join('|');
      if (!seen.has(key) && mapByName[connName]) {
        seen.add(key);
        connections.push({ from: m, to: mapByName[connName] });
      }
    }
  }

  // SVG pan/zoom state
  const PAD = 30;
  const BG_OFFSET_Y = 30; // shift background image down to align with map nodes
  const MIN_X = Math.min(...atlasMaps.map((m) => m.x)) - PAD;
  const MAX_X = Math.max(...atlasMaps.map((m) => m.x)) + PAD;
  const MIN_Y = Math.min(...atlasMaps.map((m) => m.y)) - PAD;
  const MAX_Y = Math.max(...atlasMaps.map((m) => m.y)) + PAD;

  let vbX = MIN_X;
  let vbY = MIN_Y;
  let vbW = MAX_X - MIN_X;
  let vbH = MAX_Y - MIN_Y;
  const INIT_W = vbW;
  const INIT_H = vbH;

  $: scale = INIT_W / vbW;
  $: viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  // Pan state
  let isPanning = false;
  let panStart = { x: 0, y: 0, vbX: 0, vbY: 0 };
  let svgEl;

  function worldPoint(e) {
    const rect = svgEl.getBoundingClientRect();
    return {
      x: vbX + ((e.clientX - rect.left) / rect.width) * vbW,
      y: vbY + ((e.clientY - rect.top) / rect.height) * vbH,
      rx: (e.clientX - rect.left) / rect.width,
      ry: (e.clientY - rect.top) / rect.height,
    };
  }

  function onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    const pt = worldPoint(e);
    const newW = Math.min(Math.max(vbW * factor, 100), INIT_W * 2);
    const newH = Math.min(Math.max(vbH * factor, 100), INIT_H * 2);
    // Zoom toward cursor: keep world point under cursor stable
    vbX = pt.x - pt.rx * newW;
    vbY = pt.y - pt.ry * newH;
    vbW = newW;
    vbH = newH;
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY, vbX, vbY };
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isPanning) return;
    const rect = svgEl.getBoundingClientRect();
    const dx = ((panStart.x - e.clientX) / rect.width) * vbW;
    const dy = ((panStart.y - e.clientY) / rect.height) * vbH;
    vbX = panStart.vbX + dx;
    vbY = panStart.vbY + dy;
  }

  function onMouseUp() {
    isPanning = false;
  }
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<svg
  bind:this={svgEl}
  {viewBox}
  preserveAspectRatio="xMidYMid meet"
  class="atlas-svg"
  class:panning={isPanning}
  on:wheel={onWheel}
  on:mousedown={onMouseDown}
  role="img"
  aria-label="Path of Exile Atlas"
>
  <!-- Background image -->
  <image
    href="/atlas.webp"
    x={MIN_X}
    y={MIN_Y + BG_OFFSET_Y}
    width={MAX_X - MIN_X}
    height={MAX_Y - MIN_Y}
    preserveAspectRatio="xMidYMid meet"
  />

  <!-- Connection lines -->
  <g class="connections">
    {#each connections as { from, to }}
      <line
        x1={from.x} y1={from.y}
        x2={to.x} y2={to.y}
        stroke="#3a3a6a"
        stroke-width={1 / scale}
        opacity="0.5"
      />
    {/each}
  </g>

  <!-- Map nodes -->
  <g class="nodes">
    {#each atlasMaps as map (map.name)}
      {@const highlight = getHighlightColor(map, $activeFilters, $customTags)}
      {@const isDimmed = $preferredOnly && !$preferences.has(map.name)}
      <MapNode
        {map}
        {scale}
        highlightColor={highlight}
        dimmed={isDimmed}
        selected={selectedMap?.name === map.name}
        onSelect={onSelectMap}
      />
    {/each}
  </g>
</svg>

<style>
  .atlas-svg {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    background: #0d0d1a;
  }
  .atlas-svg.panning {
    cursor: grabbing;
  }
</style>
