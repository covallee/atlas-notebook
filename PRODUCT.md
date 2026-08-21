# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Path of Exile players who want to track preferred maps and bosses while planning Atlas map runs.

## Product Purpose

Atlas Notebook makes the Atlas easier to inspect at a glance through an interactive map graph. Players can filter the map network and open details for individual maps so they can identify useful runs without manually cross-referencing disconnected information.

## Positioning

An interactive, filterable Atlas graph that brings map relationships and per-map details into the same view.

## Operating Context

Players use the notebook while planning or reviewing Atlas map runs. The current app presents a navigable Atlas canvas, filter controls, map-detail tooltips, a legend, and locally bundled map and monster data.

## Capabilities and Constraints

- Filter Atlas maps, including a preferred-only view.
- Select maps to inspect their details.
- Show map connections, legend information, and boss-related data.
- Preserve the application as a web-based Svelte and Vite project.
- Preserve the accuracy and attribution needs of bundled Path of Exile reference data; some map records include external PoE Wiki image URLs.

## Brand Commitments

- Product name: PoE Atlas Notebook.
- Product descriptor: Path of Exile - Atlas Explorer.

## Evidence on Hand

- Map catalog: `src/lib/data/maps.json`.
- Monster catalog: `src/lib/data/monsters.json`.
- Atlas, filter, tooltip, and legend components: `src/lib/components/`.
- No independent testimonials, customer claims, benchmarks, pricing, or licensing evidence is present in the repository and future work must not invent it.

## Product Principles

- Make Atlas relationships legible before adding more information.
- Keep planning controls and map facts in the same working view.
- Let players reduce visual noise quickly to focus on preferred maps and bosses.
- Treat game-reference data as factual content rather than marketing copy.
