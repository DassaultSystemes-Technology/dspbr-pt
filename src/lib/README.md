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


* [x] [Validated](https://dassaultsystemes-technology.github.io/dspbr-pt/report/) against the official Dassault Systèmes Stellar renderer for the available set of validation scenes. Currently, this only covers a subset of the material features. 

> ### Caveats
> The renderer serves as a fancy wrapper for the Enterprise PBR Shading Model code sample, **performance is not a priority**. Some major limiting factors are 
> * Naive single-level BVH acceleration structure which is slow and prohibits dynamic scenes.
> * Plain WebGL2 for accessibility reasons. Implied API limits and required overhead in shader complexity to make "arbitrary" scenes with texturable PBR materials work for path-tracing is insane and a major performance drag.
> * No light importance sampling. Expect a significant amount of slow-converging noise for high frequency lighting scenarios and rough materials.


## Installation

```bash
npm install dspbr-pt
```

## Example

```javascript
import { PathtracingRenderer, PerspectiveCamera, Loader} from 'dspbr-pt';

let renderer = new PathtracingRenderer(canvas);
let camera = new PerspectiveCamera(45, canvas.width/canvas.height, 0.01, 1000);

const normalizeSceneDimension = true; 
const scenePromise = Loader.loadScene(scene_url, normalizeSceneDimension);
const iblPromise = Loader.loadIBL(ibl_url);

Promise.all([scenePromise, iblPromise]).then(([gltf, ibl]) => {
  renderer.setIBL(ibl);
  renderer.setScene(gltf.scene, gltf).then(() => {
    renderer.render(camera, -1, (frame) => {
      controls.update();
      console.log("Finished frame number:", frame);
    })
  });
});
```

For more details, please check the [viewer implementation](src/app.ts) and the [renderer interface](lib/renderer.ts).


## License
* Source code license info in [LICENSE](LICENSE)
