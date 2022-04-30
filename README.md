# Enterprise PBR Sample Renderer ([Demo Viewer](https://dassaultsystemes-technology.github.io/dspbr-pt/index.html))
<!-- |  [Validation Report](https://dassaultsystemes-technology.github.io/dspbr-pt/report/)) -->

A WebGL2 GPU path-tracer that runs in your browser.<br>
Features physical materials by implementing the [Enterprise PBR Shading Model (DSPBR)](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel)

[Demo Viewer (glTF drag&drop)](https://dassaultsystemes-technology.github.io/dspbr-pt/index.html)

[Minimal Demo](https://dassaultsystemes-technology.github.io/dspbr-pt/simple.html) [[ Code ](packages/examples/simple.js)]


## Features
* Browser-based, unbiased[*](#Notes) GPU path-tracing
* Implements parts of the [Enterprise PBR Shading Model (DSPBR)](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel)
  * [x] Rough Metal & Dielectrics (opaque/transparent)<br>
  Using energy preserving, multi-scattering GGX BRDF and directional albedo scaling for diffuse/sheen components
  * [x] Sheen
  * [x] Clearcoat
  * [x] Emission
  * [x] Iridescence
* Three.js scene compatibility
* Implements most of the new glTF PBR Next material extensions [1,2] and extension proposal pull requests (marked as PR below).
  * [KHR_materials_anisotropy (PR)](https://github.com/KhronosGroup/glTF/pull/2027)
  * [KHR_materials_clearcoat](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_clearcoat/README.md)
  * [KHR_materials_emission_strength (PR)](https://github.com/KhronosGroup/glTF/pull/1994)
  * [KHR_materials_ior](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior)
  * [KHR_materials_iridescence (PR)](https://github.com/KhronosGroup/glTF/pull/2027)
  * [KHR_materials_sheen](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_sheen/README.md)
  * [KHR_materials_specular](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular)
  <!-- * [KHR_materials_translucency PR](https://github.com/KhronosGroup/glTF/pull/1825) -->
  * [KHR_materials_transmission](https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_materials_transmission/README.md)
  * [KHR_materials_volume](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume)

<!-- * [Validated](https://dassaultsystemes-technology.github.io/dspbr-pt/report/) against the official Dassault Systèmes Stellar renderer for the available set of validation scenes. Currently, this only covers a subset of the material features. Please see below for more info on the [validation suite](#Validation). -->

## Development

```bash
# yarn is mandatory as this project uses yarn workspaces
yarn install

# Builds all packages
yarn build

# Launch the demo viewer with HMR enabled -> auto update on code change during development
yarn run dev
```


<!--
## Validation
The Enterprise PBR Specification repository provides a [*Validation Suite*](https://github.com/DassaultSystemes-Technology/EnterprisePBRShadingModel/tree/master/validation). The suite is a collection of lightweight test scenes accompanied by HDR reference renderings (generated by the Dassault Systèmes Stellar renderer). It further provides scripts to compare the output of a custom render engine to the provided grund-truth images. The suite generates an overview of the comparison result as HTML report.
The report for the current state of dspbr-pt can be found [here](https://dassaultsystemes-technology.github.io/dspbr-pt/report/)

```bash
# Clones the Enterprise PBR repo to the current working dir, runs the validation renderings and generates a report at ./validation/report/index.html
npm run validation
```
--->
<!--
## CLI Renderer

Command-line rendering is available via headless electron

```bash
# Builds the cli renderer to ./dist
npm run build-cli

# Renders an image via command-line
npm run render -- -- <scene_path> --ibl <hdr_path> --res <width> <height> --samples <num_samples>
```
```bash
# Example
# Writes output image to ./output.png
npm run render -- -- "./assets/scene.gltf" --ibl "./assets/ibl.hdr" -r 512 512 -s 32
``` -->



## License
* Source code license info in [LICENSE](LICENSE)

[1]: https://www.khronos.org/news/press/khronos-releases-wave-of-new-gltf-pbr-3d-material-capabilities
[2]: https://www.khronos.org/news/press/new-gltf-extensions-raise-the-bar-on-3d-asset-visual-realism
