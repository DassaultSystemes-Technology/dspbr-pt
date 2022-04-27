# Changelog
## [Ongoing]

### Added
- KHR_materials_anisotropy
- KHR_materials_iridescence
- KHR_materials_emissive_strength
- IBL importance sampling
- Multiple importance sampling IBL/BSDF
- Meshopt decoding
- glTF-Transform as scene pre-process
  - unweld, dequantize

### Changes
- Add tiled rendering to improve responsiveness
- Move materials from textures to uniform buffers
- Refactor scene data pipeline
  - Move scene translation out of the renderer core to adapter classes

## [0.3.4] - 2021-09-25
### Fixes
- Fix metal weight in spec BSDF sampling
- Add "high-performance" hint to context creation
- Fix background alpha writes
- Update ACES TMO to match three and glTF sample viewer

## [0.3.3] - 2021-09-20
### Fixes
- Fix attenuation parsing

## [0.3.2] - 2021-09-19
### Changes
- Major projects refactoring/restructuring
- Reduce npm package content to only include renderer lib
- Add index file for easy module import

## [0.3.1] - 2021-09-08
### Fixes
- Fix transmission sampling weight
- Fix specular parsing

## [0.3.0] - 2021-09-06
### Added
- [PT] Tone-mapping exposure property
- [PT] Tone-mapping techniques property
- [PT] Gamma property
- [PT] Vertex color support
- [PT] Normal map scale support
- [MAT] KHR_materials_transmission support. Includes rough and specular transmission
- [MAT] KHR_materials_translucency support
- [MAT] KHR_materials_volume support
- [MAT] Sheen visibility function property
- [App] IBL rotation property
- [App] Progress indicator for scene loading
- [App] Adjustable navigation render resolution
- [App] Save PNG button
- [App] Asset info box with
- [App] Adjustable background color
- [App] Configurable ray-offset
- Use clang format
- Add CHANGELOG

### Changed
- [PT] Port path-tracing renderer from three.js to plain WebGL
- [PT] Use a single combined geometry buffer instead of one buffer per attribute
- [PT] Optimize GPU buffer generation by removing unnecessary buffer copy operations.
- Disable default scene auto-scale on load
- Major typescript refactoring
- Extract material class to its own file
- Moved model/ibl loading functionality to it's own class
- Ported renderer and app to typescript
- Split pt/three renderer to their own classes
- Moved renderer switch logic and asset loading responsibility to application
- Cleanup/Update npm package dependencies
- Changed assets
- Update README

### Fixes
- [PT] Fix transmission sample weight
- [PT] Fix data buffer indexing issue which prevented loading of bigger glTF scenes
- [PT] Resolve node transformation parsing issue which occurred in rare cases
- [PT] Fix corrupted tangent issue which produced NaNs for several test scenes
- [MAT] KHR_materials_sheen implementation
- [MAT] Fix clearcoat/emission issues
- Proper parsing of material extension which are not supported by three.js
- Many small fixes concerning rendering stability and glTF variation robustness

## [0.2.1] - 2020-07-25
### Fixed
- Fix accumulation issues due to half precision render buffer type

## [0.2.0] - 2020-07-25
### Added
- Enterprise PBR Validation report generation
- Constant probability Russian-roulette path termination
- Filmic Tonemapping

### Changed
- New IBL loading interface
- WebGLRenderer now uses alpha channel

### Fixed
- Fix normal orientation issue
- glTF alpha blending mode support
- NaN issues on shader evaluation

[Ongoing]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.3.4...HEAD
[0.3.4]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.1.0...v0.2.0

