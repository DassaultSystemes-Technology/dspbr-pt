# dspbr-pt viewer app

Vite app for the browser viewer and the minimal integration example.

## Entrypoints

* `index.html` / `index.ts`: full viewer UI with scene list, drag-and-drop loading, Tweakpane controls, diagnostics, and loading overlays.
* `simple.html` / `simple.ts`: compact example showing how to embed the renderer through `createPathtracingViewport()`.

## Local development

From the repository root:

```bash
yarn dev
```

opens the full viewer. To open the minimal example:

```bash
yarn dev:example
```

Both pages are served by this same Vite app, so `/index.html` and `/simple.html` remain the published page names.

## Files

* `asset_index.ts`: curated scene/IBL entries for the full viewer.
* `main.css`: shared viewer UI, loading screen, diagnostics, and Tweakpane styling.
* `vite.config.ts`: app build config and local aliases to `packages/lib` and `packages/viewer`.

For renderer/library API details, see [`../lib/README.md`](../lib/README.md). For project-wide development notes, see [`../../README.md`](../../README.md).
