# Midnight Cartographer Design System

## Principles
- **Atlas-first**: core map information must remain readable during navigation.
- **Functional color discipline**: semantic colors identify systems, not decoration.
- **Calm density**: compact information layout with clear hierarchy.

## Color Roles
- **Background indigo**: `#0d0d1a`, `#12122a`, `#1a1a2e`
- **Structure/borders**: `#2a2a4a`, `#4a3f6b`
- **Primary text**: `#e0d9f0`
- **Muted text**: `#888`, `#666`, `#aaa`
- **Preference/identity gold**: `#c8a96e`
- **Custom tag/utility cyan**: `#4dd0e1`
- **Filter wayfinding accents**: bright per-filter colors from filter definitions

## Typography & Scale
- App title: 16px bold
- Section labels: 11-13px uppercase
- Body/info text: 12-13px
- Tag chips: 11px

## Responsive Behavior
- Filter panel becomes a horizontal rail at mobile widths.
- Map tooltip becomes a bottom sheet below 700px.
- Desktop keeps full map labels visible at all zoom levels.
- Mobile uses shorthand map labels until zoomed in.

## Accessibility
- Map nodes are keyboard selectable (`Enter`/`Space`).
- Focus-visible treatment is explicit for node interaction.
- Tooltip controls expose ARIA labels.
- Tag/preference feedback is announced through an `aria-live` region.
