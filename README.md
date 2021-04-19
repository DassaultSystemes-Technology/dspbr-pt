# Enterprise PBR Sample Renderer ([Demo](https://dassaultsystemes-technology.github.io/dspbr-pt/) |  [Validation Report](https://dassaultsystemes-technology.github.io/dspbr-pt/report/))


A WebGL2 path-tracer implementing the [Enterprise PBR Shading Model (DSPBR)](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel).

### Overview
* [x] Browser-based, unbiased[*](#Notes) GPU path-tracing 
* [x] Three.js compatibility
  * The renderer loads the three.js scene group format
  * The interface is similar to WebGLRenderer
* [x] When fed with [glTF](https://www.khronos.org/gltf/) via three.js GLTFLoader it supports most of the new [glTF](https://www.khronos.org/gltf/) PBR Next material extensions and wip extension proposals (marked as PR below).<br>
All of the mentioned extensions are implemented in terms of the Enterprise PBR specification. If you're interested in equations head over to the spec repo and check our [latest specification document](https://dassaultsystemes-technology.github.io/EnterprisePBRShadingModel/spec-2021x.md.html). If you're looking for code, [dspbr.glsl](./lib/shader/dspbr.glsl) should give you most of the relevant pieces.

  * [KHR_materials_sheen](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_sheen/README.md)
  * [KHR_materials_clearcoat](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md)
  * [KHR_materials_transmission](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_transmission/README.md)
  * [KHR_materials_specular](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular)
  * [KHR_materials_ior](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior)
  * [KHR_materials_volume](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume)
  * [KHR_materials_translucency PR](https://github.com/KhronosGroup/glTF/pull/1825)


* [x] [Validated](https://dassaultsystemes-technology.github.io/dspbr-pt/report/) against the official Dassault Systèmes Stellar renderer for the available set of validation scenes. Currently, this only covers a subset of the material features. Please see below for more info on the [validation suite](#Validation).

> ### Caveats
> The renderer serves as a fancy wrapper for the Enterprise PBR Shading Model code sample, **performance is not a priority**. Some major limiting factors are 
> * Naive single-level BVH acceleration structure which is slow and prohibits dynamic scenes.
> * Plain WebGL2 for accessibility reasons. Implied API limits and required overhead in shader complexity to make "arbitrary" scenes with texturable PBR materials work for path-tracing is insane and a major performance drag.
> * No light importance sampling. Expect a significant amount of slow-converging noise for high frequency lighting scenarios and rough materials.


## [Demo App](https://dassaultsystemes-technology.github.io/dspbr-pt/)

Drag & Drop glTF files to render your scenes. 

The demo app uses the three.js [WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer) as fallback when path-tracing is disabled. Please check the three.js [documentation](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial) for information on supported material extensions. 

> ### Notes
> * For performance reasons, the default bounce depth is set to 4. The result is therefore biased. For scenes with a complex transmission/reflection setup or major indirect light contribution, the bounce depth needs to be increased. :warning: You only want to play with this setting on a beefy GPU, otherwise a timeout is not unlikely. There's a "force IBL eval" flag which forces the integrator to evaluate IBL lighting at the end of a path without shadow test. This brings light into dark spot which would only receive light via multiple indirections otherwise. 
> * Pixel-ratio is set to 0.5 by default, which sets the render resolution to half the size of the provided canvas. If you can afford it, set it to 1.0 for a beautiful, crispy, pixel-perfect eye-candy sensation.

    

## Quickstart

```bash
# Installs all dependencies necessary to run and develop the renderer and viewer app
npm install --production

# Alternatively, if you intent to run the validation or CLI rendering (see below) omit the --production flag
# This will additionally install electron (~200MB)
npm install 

# Launch the viewer in a browser with attached file watcher for auto refresh on file edits
npm run dev
```
```bash
# Builds a distributable package of the viewer to ./dist
npm run build
```

Load glTF assets and HDR IBLs via drag & drop


## Validation
The Enterprise PBR Specification repository provides a [*Validation Suite*](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/tree/master/validation). The suite is a collection of lightweight test scenes accompanied by HDR reference renderings (generated by the Dassault Systèmes Stellar renderer). It further provides scripts to compare the output of a custom render engine to the provided grund-truth images. The suite generates an overview of the comparison result as HTML report.
The report for the current state of dspbr-pt can be found [here](https://dassaultsystemes-technology.github.io/dspbr-pt/report/)

In case you start to toy with the shaders you might want to run the validation regularly. It'll give you a good overview on which materials features were messed up by your changes ;)

```bash
# Clones the Enterprise PBR repo to the current working dir, runs the validation renderings and generates a report at ./validation/report/index.html
npm run validation

```

The validation scripts use the [CLI rendering](##CLI-Renderer) functionality as explained below. Validation render settings need to be adjusted directly in the [run_validation.py](./scripts/run_validation.py) script render call for now.

```python
# line 38
 render_call = ['npm', 'run', 'render', '--', '--', "../"+ file, '--res', '400', '400', '--samples', '512', '-b', '32', '--ibl-rotation', '180'];
```

## CLI Renderer

Command-line rendering is available via headless electron

```bash
# Builds the cli renderer to ./dist
npm run build-headless 

# Renders an image via command-line
npm run render -- -- <scene_path> --ibl <hdr_path> --res <width> <height> --samples <num_samples>

```
```bash
# Example
# Writes output image to ./output.png
npm run render -- -- "./assets/scenes/metal-roughness-0.05.gltf" --ibl "./assets/env/Footprint_Court_Env.hdr" -r 512 512 -s 32 
```


## Renderer API Usage

```javascript
import { PathtracingRenderer, PerspectiveCamera } from './lib/renderer';
import { Loader } from './lib/scene_loader';

let renderer = new PathtracingRenderer(canvas);
let camera = new PerspectiveCamera(45, canvas.width/canvas.height, 0.01, 1000);

const normalizeSceneDimension = true; 
const scenePromise = Loader.loadScene(scene_url, normalizeSceneDimension);
const iblPromise = Loader.loadIBL(ibl_url);

Promise.all([scenePromise, iblPromise]).then(([gltf, ibl]) => {
  renderer.setIBL(ibl);
  renderer.setScene(gltf).then(() => {
    renderer.render(camera, -1, (frame) => {
      controls.update();
      console.log("Finished frame number:", frame);
    })
  });
});
```
Please check [src/app.ts](src/app.ts) and [lib/renderer.ts](lib/renderer.ts) for more details.


## License
* Source code license info in [LICENSE](LICENSE)
* Provided assets are due to their own licenses. Detailed per-asset license information can be found in the [asset index file](assets/asset_index.ts)

