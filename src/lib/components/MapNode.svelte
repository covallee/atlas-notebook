<script>
  import { preferences } from '../stores/preferences.js';

  export let map;
  export let scale = 1;
  export let highlightColor = null;
  export let dimmed = false;
  export let selected = false;
  export let onSelect = () => {};

  const RADIUS = 7;
  const UNIQUE_MAP_RADIUS = 5;

  $: isPreferred = $preferences.has(map.name);

  // Node fill color by map type
  const TYPE_COLORS = {
    'map': '#3a3a5c',
    'special map': '#4a2060',
    'unique map': '#5c3a00',
  };
  $: baseFill = TYPE_COLORS[map.type] ?? '#3a3a5c';
  $: radius = map.type === 'unique map' ? UNIQUE_MAP_RADIUS : RADIUS;
  $: labelFontSize = map.type === 'unique map' ? 7 : 9;
</script>

<g
  class="map-node"
  class:dimmed
  transform="translate({map.x},{map.y})"
  on:click={() => onSelect(map)}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && onSelect(map)}
  aria-label={map.name}
>
  <!-- Highlight ring -->
  {#if highlightColor}
    <circle
      r={radius + 4}
      fill="none"
      stroke={highlightColor}
      stroke-width="2"
      opacity="0.85"
    />
  {/if}

  <!-- Selection ring -->
  {#if selected}
    <circle
      r={radius + 6}
      fill="none"
      stroke="#ffffff"
      stroke-width="1.5"
      opacity="0.9"
    />
  {/if}

  <!-- Preferred gold ring -->
  {#if isPreferred}
    <circle
      r={radius + 2}
      fill="none"
      stroke="#c8a96e"
      stroke-width="2"
      opacity="0.95"
    />
  {/if}

  <!-- Main node circle -->
  <circle
    r={radius}
    fill={baseFill}
    stroke={highlightColor ?? (isPreferred ? '#c8a96e' : '#6a6a9a')}
    stroke-width="1"
  />

  <!-- Name label (always visible, scaled down) -->
  <text
    dy={radius + 9}
    text-anchor="middle"
    font-size={labelFontSize / scale}
    fill="#c8c8e8"
    pointer-events="none"
  >{map.name}</text>
</g>

<style>
  .map-node {
    cursor: pointer;
  }
  .map-node.dimmed {
    opacity: 0.2;
  }
  .map-node:hover circle:last-of-type {
    filter: brightness(1.6);
  }
</style>
