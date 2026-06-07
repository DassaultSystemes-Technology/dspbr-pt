# Enterprise PBR WebGL Path Tracer

[Demo Viewer](https://dassaultsystemes-technology.github.io/dspbr-pt/index.html)

[Minimal Demo](https://dassaultsystemes-technology.github.io/dspbr-pt/simple.html) [[ Code ](packages/app/simple.ts)]

## Features
* Browser-based WebGL2 GPU path tracing
* MIS with IBL importance sampling
* glTF/glb loading via glTF-Transform, including GitHub/raw URL normalization and local asset caching
* TinyBVH WASM acceleration structure builds with indexed geometry upload
* [Enterprise PBR Shading Model (DSPBR)](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel) via [slang-pbr](https://github.com/bsdorra/slang-pbr)
* Public `PathtracingViewport` API for simple embedding
* Implements most of the glTF PBR material extensions.
  * [KHR_materials_anisotropy](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_anisotropy/README.md)
  * [KHR_materials_clearcoat](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md)
  * [KHR_materials_emission_strength](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md)
  * [KHR_materials_ior](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior)
  * [KHR_materials_iridescence](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_iridescence/README.md)
  * [KHR_materials_sheen](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_sheen/README.md)
  * [KHR_materials_specular](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular)
  * [KHR_materials_transmission](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_transmission/README.md)
  * [KHR_materials_dispersion](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_dispersion/README.md)
  * [KHR_materials_volume](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume)
  * [KHR_materials_diffuse_transmission (Release Candidate)](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_diffuse_transmission/README.md)

## Development

Package layout:

* `packages/lib`: renderer, loaders, shaders, public viewport API
* `packages/app`: viewer UI, camera/controller helpers, and minimal integration example

```bash
# yarn is mandatory as this project uses yarn workspaces
yarn install

# Regenerate the slang-pbr material GLSL artifact; set SLANG_PBR_ROOT for a local checkout
yarn build:slang-materials

# Builds all packages
yarn build

# Validate assembled WebGL shader variants with glslangValidator
yarn validate:shaders

# Launch the demo viewer with HMR enabled -> auto update on code change during development
yarn run dev

# Launch the same dev server and open the minimal integration example
yarn run dev:example
```
## Third-party

This project stands on a lot of excellent open source work. Thanks to the authors and maintainers of:

* [TinyBVH](https://github.com/jbikker/tinybvh), by Jacco Bikker, for the compact high-performance BVH builder and traversal code that backs the WASM acceleration structure path.
* [tinybvh-wasm](https://github.com/bsdorra/tinybvh-wasm), for the reusable TinyBVH WebAssembly bridge and browser-facing BVH builder ABI.
* [glTF Transform](https://github.com/donmccurdy/glTF-Transform), by Don McCurdy and contributors, for the glTF parsing, extension handling, and asset processing foundation.
* [meshoptimizer](https://github.com/zeux/meshoptimizer), by Arseny Kapoulkine, for mesh compression decoding support used by glTF assets.
* [Slang](https://github.com/shader-slang/slang), from the shader-slang project and its research contributors, for the shader language/toolchain used to generate the material model code.
* [slang-pbr](https://github.com/bsdorra/slang-pbr), for the reusable Enterprise PBR Slang material source used by the generated WebGL material model.
* [Tweakpane](https://github.com/cocopon/tweakpane), by Hiroki Tani and contributors, for the compact viewer control UI.
* [simple-dropzone](https://www.npmjs.com/package/simple-dropzone), for the browser drag-and-drop file loading used by the viewer.
* [Vite](https://vite.dev/) and [tsup](https://tsup.egoist.dev/) for the development server and package build workflow.
* The [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) and related sample model repositories, for the scenes that make testing and demos practical.


## License
* Source code license info in [LICENSE](LICENSE)
* Third-party notices in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

[1]: https://www.khronos.org/news/press/khronos-releases-wave-of-new-gltf-pbr-3d-material-capabilities
[2]: https://www.khronos.org/news/press/new-gltf-extensions-raise-the-bar-on-3d-asset-visual-realism
