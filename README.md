# Enterprise PBR Sample Renderer

A WebGL2 based drag & drop [glTF](https://www.khronos.org/gltf/) path-tracer which implements the [Enterprise PBR](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel) material model.

[Demo](https://dassaultsystemes-technology.github.io/dspbr-pt/)

## Quickstart

```bash
# Installs all dependencies necessary to run and develop the renderer and viewer app  
npm install --production

# Launches the viewer in a browser with attached file watcher for auto refresh on file edits.
npm run dev

```

## Material Model
The renderer supports the glTF 2.0 metallic/roughness model. The additional Enterprise PBR material features are supported as custom glTF material extensions [glTF extension proposals](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/tree/master/gltf_ext)

> :warning: transparency, transmission and volume not yet supported 

Most of our extension proposals are already covered by pull request to the offical glTF spec
* [Specular Extensions](https://github.com/KhronosGroup/glTF/pull/1719)
* [IoR Extension](https://github.com/KhronosGroup/glTF/pull/1718)
* [Sheen Extension](https://github.com/KhronosGroup/glTF/pull/1688)
* [Clearcoat Extension](https://github.com/KhronosGroup/glTF/pull/1756)
* [Transmission Extension](https://github.com/KhronosGroup/glTF/pull/1698)

Summary of the extensions and change proposal to the original core spec

https://github.com/KhronosGroup/glTF/pull/1738


> **NOTE**  
> When disabling path-tracing, the three.js native rasterizer is used as fallback. In rasterizer mode the extensions mentioned above will be ignored.  
> Please have a look at [this overview](https://k0mplex.uber.space/reports/threejs/) for comparison renderings between the two renderers for several material configurations.

## Enterprise PBR - Sample Implementation
This renderer serves as a sample implementation for Dassault Systèmes Enterprise PBR material model. Please have a look at 
[dspbr.glsl](./lib/shader/dspbr.glsl) for the full material implementation.


## Building

```bash
# Builds a distributable package of the viewer to ./dist
npm run build
```

## CLI Renderer

Command-line rendering is support via headless electron

To install all required extension please run install without the `--production` flag 


```bash
# Please note that this installs a full copy of electron with your node_modules (~+200MB)
npm install 

# Builds the cli renderer to ./dist
npm run build-headless 

```


```bash
# Renders an image via command-line
npm run render -- -- <scene_path> --ibl <hdr_path> --res <width> <height> --samples <num_samples>
```

For now, this writes the output image to ./output.png

## Renderer API Usage

```javascript

import { PathtracingRenderer } from './lib/renderer.js';

let renderer = new PathtracingRenderer(canvas, false);
renderer.loadScene(<path_to_gltf>, function () {
      renderer.useIBL(<path_to_ibl>)
      renderer.render(-1, (frame) => {
          console.log("Finished frame number:", frame);
          stats.update();
      });
  });
```

Where the interface of the render function is defined as

```javascript
 function render(num_samples, frameFinishedCB, renderingFinishedCB)
```

Please have a look at src/app.js and lib/renderer.js for more details.

## Todo

### Material
- [ ] Implement proper transparency and alpha mask (cutout) handling

### General
- [ ] Move path-tracing renderer to plain WebGL 
- [ ] Handle gltf scenes without scale normalization


## Reference 

* This project was inspired by [Three.js glTF Viewer](https://github.com/donmccurdy/three-gltf-viewer) and the official [Khronos glTF Sample Viewer](https://github.com/KhronosGroup/glTF-Sample-Viewer).
* Env maps from [HDRIHaven](https://hdrihaven.com/).
