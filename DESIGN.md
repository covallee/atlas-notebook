---
name: PoE Atlas Notebook
description: A dark, map-first interface for exploring and tracking Path of Exile Atlas maps.
colors:
  midnight: "#0d0d1a"
  panel: "#12122a"
  elevated-panel: "#1a1a2e"
  header-panel: "#16213e"
  quiet-border: "#2a2a4a"
  active-surface: "#1e1e3a"
  detail-surface: "#2d2d4e"
  accent-border: "#4a3f6b"
  map-node: "#3a3a5c"
  map-node-stroke: "#6a6a9a"
  atlas-line: "#3a3a6a"
  gold: "#c8a96e"
  primary-text: "#e0d9f0"
  secondary-text: "#b0a8c8"
  muted-text: "#888888"
  filter-cyan: "#4fc3f7"
  filter-green: "#81c784"
  filter-yellow: "#fff176"
  filter-orange: "#ffb74d"
  filter-lilac: "#ce93d8"
  filter-red: "#ef9a9a"
  filter-pink: "#f48fb1"
  filter-coral: "#ff7043"
  subtitle-muted: "#666666"
  active-violet: "#7c4dff"
  inactive-star: "#555555"
  contrast-white: "#ffffff"
  detail-lavender: "#c8b8e0"
  detail-muted: "#aaaaaa"
  tag-text: "#b0a0d0"
  tooltip-shadow: "rgba(0,0,0,0.6)"
  cyan-tag: "#4dd0e1"
  cyan-tag-hover: "#7fe3f2"
  custom-tag-surface: "#1a3a4a"
typography:
  title:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "0.5px"
  body:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
  label:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "11px"
    letterSpacing: "0.5px"
  supporting:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
  map-title:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  icon:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
rounded:
  xs: "3px"
  sm: "4px"
  control: "5px"
  panel: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "10px"
  md: "12px"
  lg: "16px"
components:
  filter-button:
    backgroundColor: "transparent"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.control}"
    padding: "5px 8px"
  filter-button-hover:
    backgroundColor: "{colors.active-surface}"
    textColor: "{colors.secondary-text}"
    rounded: "{rounded.control}"
    padding: "5px 8px"
  filter-button-active:
    backgroundColor: "{colors.active-surface}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.control}"
    padding: "5px 8px"
  tooltip:
    backgroundColor: "{colors.elevated-panel}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.panel}"
    width: "280px"
  tag:
    backgroundColor: "{colors.detail-surface}"
    textColor: "#b0a0d0"
    rounded: "{rounded.sm}"
    padding: "2px 7px"
---

# Design System: PoE Atlas Notebook

## Overview

**Creative North Star: "The Midnight Cartographer"**

This is a dark, map-first working environment for reading a dense Atlas without competing with it. Near-black indigo gives the canvas a quiet night-sky field; layered panels and thin violet borders separate tools from terrain. Gold appears sparingly as a durable marker of preference and identity, while high-chroma filter colors are reserved for the data states that need to survive a crowded map.

The interface is quietly tactical and information-dense. It favors concise labels, small controls, and directly manipulable geometry over decorative treatment. Panels establish a stable frame around the SVG Atlas; the one substantive shadow belongs to the selected map tooltip, which must visually sit above the graph because it temporarily becomes the active reading surface.

**Key Characteristics:**
- Dark indigo canvas with compact layered control surfaces.
- Sparse antique-gold emphasis for title, preference, and selected-map identity.
- Bright filter colors used as functional wayfinding, never general decoration.
- Fine violet borders and small radii for restrained spatial structure.

## Colors

The palette combines a deep indigo field with softened lavender text, a rare gold accent, and a controlled spectrum of semantic filter signals.

### Primary

- **Atlas Gold:** Used for the application title, preferred map ring, preferred-state star, and map-title emphasis. It marks durable player choice rather than general interaction.

### Secondary

- **Signal Spectrum:** The cyan, green, yellow, orange, lilac, red, pink, and coral filters distinguish map qualities and carry through node highlights and the legend.

### Neutral

- **Midnight Field:** The base Atlas canvas and page background.
- **Layered Indigo:** Panel and elevated-panel surfaces establish the header, filter rail, and tooltip hierarchy.
- **Violet Grid:** Quiet borders, active outlines, map-node strokes, and connection lines provide structure without a bright chrome effect.
- **Lavender Ink:** Primary, secondary, and muted text values maintain readable contrast without introducing pure white as the default.

**The Gold Is Earned Rule.** Reserve gold for the product identity and persistent player preference. Do not use it as a generic primary-button or hover color.

## Typography

**Display Font:** Segoe UI, with the system UI stack as fallback.  
**Body Font:** Segoe UI, with the system UI stack as fallback.

**Character:** Compact, practical system typography keeps the reading load low while the Atlas remains the visual focal point. The distinction comes from weight, case, tracking, and color rather than a separate display face.

### Hierarchy

- **Title** (700, 16px, 0.5px tracking): Application and map names; rendered in Atlas Gold.
- **Body** (400, 13px): Map detail values and panel content.
- **Supporting** (400, 12px): Filter controls, notes, and list content.
- **Map Title** (700, 14px): Selected map identity in the detail tooltip.
- **Icon** (400, 18px): The preferred-map star only.
- **Label** (400, 11px, 0.5px tracking, uppercase): Panel headings, map types, and section labels.

**The Atlas Stays Loudest Rule.** Keep UI type compact and subordinate to map geometry. Avoid oversized headlines, marketing scale, or expressive display typography.

## Layout

The interface occupies the full viewport with a fixed-height header and a three-zone workspace: a 200px filter rail, the flexible Atlas canvas, and an on-demand 280px tooltip at the right edge. The Atlas itself fills its region and owns panning and zooming. Active filter legend chips float at the bottom-left of the canvas, offset past the filter rail.

Spacing follows a tight 4px, 8px, 10px, 12px, and 16px rhythm. Controls use 5px vertical and 8px horizontal padding; major panels use 12px to 16px padding. Preserve this compact density rather than turning the rail or tooltip into a spacious card layout.

## Elevation & Depth

Depth is primarily created through tonal layering and fine borders: Midnight Field sits beneath Panel, which sits beneath Elevated Panel and the slightly bluer Header Panel. The map tooltip is the one structural exception, using a deep diffuse shadow to establish it as a temporary reading layer above the active Atlas.

### Shadow Vocabulary

- **Tooltip Lift** (`0 8px 32px rgba(0,0,0,0.6)`): Used only by the selected-map tooltip to separate inspection content from the interactive map.

**The One Raised Surface Rule.** Keep ordinary controls and panels flat. Use the tooltip shadow only when a surface must interrupt the map for focused reading.

## Shapes

The system uses gently softened utility geometry: 3px bars, 4px tags and legend chips, 5px filter controls, and 8px tooltip corners. Borders are thin (1px), low-contrast violet, and structural. Circular nodes and dots are reserved for map points and filter swatches.

## Components

### Buttons

- **Character:** Quiet, compact row controls.
- **Shape:** Soft utility corners (5px) with transparent resting states.
- **Default:** Secondary lavender text, 5px 8px padding, an inline colored dot when representing a filter.
- **Hover / Active:** Active Surface background; hover gains an Accent Border, active state uses a vivid violet outline and Primary Text.
- **Preference action:** A borderless star uses Gold only when active; a borderless close control brightens to white on hover.

### Chips

- **Style:** Filter legend chips use a translucent Midnight Field background, a Quiet Border, 4px corners, and 4px 8px padding.
- **State:** A colored circular swatch matches the selected filter; chips communicate state rather than invite direct interaction.

### Cards / Containers

- **Corner Style:** The map tooltip uses 8px corners; smaller tag and legend containers use 4px.
- **Background:** Elevated Panel for the tooltip; Header Panel for its header; Detail Surface for metadata tags and rating tracks.
- **Shadow Strategy:** Only the tooltip uses Tooltip Lift.
- **Border:** 1px Accent Border on the tooltip; 1px Quiet Border on subdued containers.
- **Internal Padding:** 12px in tooltip regions, with 10px body rhythm.

### Navigation

- **Style:** The fixed header is a single shallow Panel band with a Quiet Border beneath it.
- **Typography:** Gold 16px bold title, followed by a muted 12px descriptor.
- **Mobile treatment:** Not yet established in the incumbent implementation; preserve map-first hierarchy when responsive behavior is introduced.

### Atlas Graph

- **Geometry:** Map nodes are 7px circles with low-saturation type fills, a muted violet stroke, and shorthand labels scaled with zoom.
- **Connections:** Fine semi-transparent violet lines; they describe topology without becoming a competing visual layer.
- **State rings:** Semantic filter rings sit outside the node. Preferred maps gain a Gold ring; selected maps gain a narrow white ring. When preferred-only mode is active, non-preferred maps dim to 20% opacity.

## Do's and Don'ts

### Do:

- **Do** use Midnight Field and layered indigo surfaces to keep the Atlas visually dominant.
- **Do** reserve the signal spectrum for filters, matching node rings and legend swatches exactly.
- **Do** use Gold for the title and persisted preference states.
- **Do** keep controls concise, row-based, and visibly connected to the Atlas data they affect.
- **Do** use the 8px tooltip radius and Tooltip Lift when presenting selected-map details.

### Don't:

- **Don't** introduce bright general-purpose buttons, broad gradients, or large decorative artwork into the working canvas.
- **Don't** use Gold as a default accent for unrelated controls or transient hover states.
- **Don't** replace thin violet borders with heavy dividers or prominent card shadows.
- **Don't** expand the interface into spacious dashboard cards that reduce available Atlas territory.
