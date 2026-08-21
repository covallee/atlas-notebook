# Svelte + Vite

This template should help get you started developing with Svelte in Vite.

## Updating atlas data for a new league

Maps of Exile is the source for the map and monster datasets:
<https://mapsofexile.com/>.

The repository-root `maps.json` and `monsters.json` files are the downloaded
source snapshots. The application imports the copies in `src/lib/data/`, so
updating only the root files does not change the app.

1. Download the current league's `maps.json` and `monsters.json` from Maps of
   Exile, then replace the root-level files with the downloads.
2. Confirm both downloads are valid JSON:

   ```sh
   jq empty maps.json && jq empty monsters.json
   ```

3. Review the update, paying particular attention to new map names, removed
   maps, map connections, boss IDs, and coordinate fields:

   ```sh
   git diff --stat -- maps.json monsters.json
   git diff -- maps.json monsters.json
   ```

4. Copy the verified snapshots into the data files used by the app:

   ```sh
   cp maps.json src/lib/data/maps.json
   cp monsters.json src/lib/data/monsters.json
   ```

5. Build the app:

   ```sh
   npm run build
   ```

6. Run `npm run dev` and check the atlas visually. Confirm that newly added
   maps render at the expected coordinates, connections do not look broken,
   filters still work, and map tooltips resolve boss names. Commit the source
   snapshots and the `src/lib/data/` copies together.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Need an official Svelte framework?

Check out [SvelteKit](https://github.com/sveltejs/kit#readme), which is also powered by Vite. Deploy anywhere with its serverless-first approach and adapt to various platforms, with out of the box support for TypeScript, SCSS, and Less, and easily-added support for mdsvex, GraphQL, PostCSS, Tailwind CSS, and more.

## Technical considerations

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.

This template contains as little as possible to get started with Vite + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why include `.vscode/extensions.json`?**

Other templates indirectly recommend extensions via the README, but this file allows VS Code to prompt the user to install the recommended extension upon opening the project.

**Why enable `checkJs` in the JS template?**

It is likely that most cases of changing variable types in runtime are likely to be accidental, rather than deliberate. This provides advanced typechecking out of the box. Should you like to take advantage of the dynamically-typed nature of JavaScript, it is trivial to change the configuration.

**Why is HMR not preserving my local component state?**

HMR state preservation comes with a number of gotchas! It has been disabled by default in both `svelte-hmr` and `@sveltejs/vite-plugin-svelte` due to its often surprising behavior. You can read the details [here](https://github.com/sveltejs/svelte-hmr/tree/master/packages/svelte-hmr#preservation-of-local-state).

If you have state that's important to retain within a component, consider creating an external store which would not be replaced by HMR.

```js
// store.js
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```
