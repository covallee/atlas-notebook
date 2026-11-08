# Atlas Notebook development instructions

- This is a Svelte 5 single-page application built with Vite. Keep application
  code in `src/` and use the existing component, store, and utility boundaries
  under `src/lib/`.
- The project uses JavaScript with `checkJs` enabled. Preserve JSDoc types and
  avoid introducing TypeScript files unless the task requires them.
- Follow the existing Svelte component style: place component-local styles in
  the component's `<style>` block and use existing Svelte 5 syntax patterns.
- State shared by multiple UI components belongs in the existing stores under
  `src/lib/stores/`; keep filtering logic in `src/lib/utils/filters.js`.
- The atlas data consumed by the application belongs in `src/lib/data/`.
  Root-level `maps.json` and `monsters.json` are source snapshots. When
  updating either dataset, run `npm run update-atlas-data` to validate and
  synchronize the matching files in `src/lib/data/`.
- Use `npm run dev` for local development and `npm run build` to validate
  production builds. There is no configured test or lint script.
- Do not commit generated `dist/` output or dependencies in `node_modules/`.
