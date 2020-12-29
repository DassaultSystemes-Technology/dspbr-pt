# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- [PT] UV debug mode
- [PT] KHR_materials_transmission support. Includes rough and specular transmission 
- [PT] KHR_materials_translucency support 
- [PT] KHR_materials_volume (refraction only) support 
- [PT] Tonemapping exposure property
- [PT] Tonemapping techniques property
- [PT] IBL rotation property
- [PT] Gamma property
- [PT] Sheen visibility function property
- [PT] Vertex color support
- [App] Progress indicator for scene loading 
- [App] Adjustable navigation render resolution 
- [App] Save PNG button
- [App] Asset info box with 
- Use clang format
- Add CHANGELOG

### Changed
- [PT] Ported pt renderer from three.js to plain WebGL
- [PT] Use a single combined geometry buffer instead of one buffer per attribute 
- [PT] Optimized GPU buffer generation by removing unnecessary buffer copy operations.
- Extract material class to its own file
- Moved model/ibl loading functionality to it's own class
- Ported renderer and app to typescript
- Split pt/three renderer to their own classes
- Moved renderer switch logic and asset loading responsibility to application
- Cleanup/Update npm package dependencies
- Changed assets
- Update README

### Fixes
- [PT] Fixed data buffer indexing issue which prevented loading of bigger glTF scenes
- [PT] Resolved node transformation parsing issue which occurred in rare cases 
- [PT] Fixed corrupted tangent issue which produced NaNs for several test scenes
- [PT] KHR_materials_sheen implementation
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

[Unreleased]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/DassaultSystemes-Technology/dspbr-pt/compare/v0.1.0...v0.2.0

