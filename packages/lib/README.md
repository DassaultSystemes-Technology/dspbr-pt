# dspbr-pt

This package contains the renderer, scene/IBL loaders, shader code, TinyBVH WASM adapter, and the public `PathtracingViewport` integration API. See the repository [README](../../README.md) for the viewer app, development workflow and broader project context.

## Usage

```ts
import { createPathtracingViewport } from 'dspbr-pt';

const viewport = createPathtracingViewport({
  canvas,
  settings: {
    pixelRatio: Math.min(window.devicePixelRatio, 1),
    interactionPixelRatio: 0.5,
    exposure: 1.5,
    useIBL: true,
    showBackground: true,
  },
});

viewport.setLookAtCamera({
  position: { x: 0, y: 0, z: 6 },
  target: { x: 0, y: 0, z: 0 },
});

await viewport.loadIblFromUrl(iblUrl);
await viewport.loadSceneFromUrl(sceneUrl);
viewport.start();
```

## Exports

* `PathtracingViewport` / `createPathtracingViewport`: high-level embedding API.
* `PathtracingRenderer`: lower-level WebGL2 renderer.
* `PathtracingSceneData`: CPU scene data container.
* `loadSceneFromUrl()` / `loadSceneFromBlobs()`: glTF/glb scene loaders.
* `loadIblFromUrl()` / `loadIblFromBlob()`: HDR environment loaders.
* `normalizeExternalAssetUrl()`: helper for direct asset URLs and GitHub `blob`/`raw` links.

## License

See [LICENSE](../../LICENSE).
