# Third-Party Notices

This repository is Apache-2.0 licensed. Some committed generated artifacts and
runtime code are redistributed or derived from third-party projects with their
own notice requirements.

## TinyBVH and tinybvh-wasm

- TinyBVH project: https://github.com/jbikker/tinybvh
- TinyBVH author: Jacco Bikker
- TinyBVH license: MIT
- tinybvh-wasm project: https://github.com/bsdorra/tinybvh-wasm
- tinybvh-wasm license: Apache-2.0
- Use: the committed WebAssembly BVH builder in
  `packages/lib/bvh/generated/tinybvh_builder.js` contains TinyBVH-derived code.

TinyBVH's MIT notice must be preserved when redistributing generated artifacts
that contain TinyBVH-derived code.

MIT License

Copyright (c) 2024 Jacco Bikker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## slang-pbr Generated Material Code

- Project: https://github.com/bsdorra/slang-pbr
- License: Apache-2.0
- Use: `packages/lib/shader/generated/slang_materials/**` contains GLSL
  generated from slang-pbr material sources.

`slang-pbr` implements material behavior from public specifications and
reference implementations:

- Slang shader language/toolchain: https://github.com/shader-slang/slang,
  Apache-2.0.
- OpenPBR: https://academysoftwarefoundation.github.io/OpenPBR/ and
  https://github.com/AcademySoftwareFoundation/OpenPBR, Apache-2.0.
- Adobe openpbr-bsdf reference: https://github.com/adobe/openpbr-bsdf,
  Apache-2.0.
- Dassault Systemes Enterprise PBR Shading Model:
  https://dassaultsystemes-technology.github.io/EnterprisePBRShadingModel/spec-2025x.md,
  CC-BY-SA 4.0.

Required acknowledgement: this project uses generated code from `slang-pbr`,
which implements DSPBR, the Dassault Systemes Enterprise PBR Shading Model.
