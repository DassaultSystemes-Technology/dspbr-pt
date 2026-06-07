import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const outputDir = path.join(workspaceRoot, 'packages/lib/shader/generated/slang_materials');
const glslPath = path.join(outputDir, 'material_kernel.glsl');
const metadataPath = path.join(outputDir, 'material_kernel.codegen.json');
const energyCompensation = process.env.SLANG_PBR_ENERGY_COMPENSATION ?? 'analytic';
const rootAliasProfile = 'webgl-lean';
const materialProfiles = {
  'webgl-lean': {
    description: 'dspbr-pt WebGL lean Enterprise PBR profile: absorption-only media, no dispersion, no iridescence.',
    defines: {
      SLANG_PBR_ENABLE_VOLUME_ABSORPTION: 1,
      SLANG_PBR_ENABLE_VOLUME_SCATTERING: 0,
      SLANG_PBR_ENABLE_DISPERSION: 0,
      SLANG_PBR_ENABLE_IRIDESCENCE: 0,
    },
  },
  'webgl-full': {
    description: 'dspbr-pt WebGL full Enterprise PBR profile: all current slang-pbr optional Enterprise features enabled.',
    defines: {
      SLANG_PBR_ENABLE_VOLUME_ABSORPTION: 1,
      SLANG_PBR_ENABLE_VOLUME_SCATTERING: 1,
      SLANG_PBR_ENABLE_DISPERSION: 1,
      SLANG_PBR_ENABLE_IRIDESCENCE: 1,
    },
  },
};

function getLocalPackageRoot() {
  const candidates = [
    process.env.SLANG_PBR_ROOT,
    path.resolve(workspaceRoot, '../slang-pbr'),
    path.resolve(workspaceRoot, '../gltf-pt/vendor/slang-pbr'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const packageJsonPath = path.join(candidate, 'package.json');
    if (existsSync(packageJsonPath)) return candidate;
  }
  return null;
}

function resolvePackagePath(specifier, localPackageRoot) {
  if (localPackageRoot) {
    if (specifier === 'slang-pbr/package.json') return path.join(localPackageRoot, 'package.json');
    if (specifier === 'slang-pbr/tools/generate') return path.join(localPackageRoot, 'tools/generate.mjs');
    if (specifier === 'slang-pbr/pbr_material_kernel_smoke.slang') {
      const currentPath = path.join(localPackageRoot, 'src/pbr_material_kernel_smoke.slang');
      if (existsSync(currentPath)) return currentPath;
      return path.join(localPackageRoot, 'src/material_kernel_smoke.slang');
    }
    if (specifier === 'slang-pbr/models/enterprise/enterprise_pbr.slang') {
      const currentPath = path.join(localPackageRoot, 'src/models/enterprise/enterprise_pbr.slang');
      if (existsSync(currentPath)) return currentPath;
      return path.join(localPackageRoot, 'src/enterprise_pbr.slang');
    }
    if (specifier === 'slang-pbr/manifest') return path.join(localPackageRoot, 'src/api.manifest.json');
  }

  if (specifier === 'slang-pbr/pbr_material_kernel_smoke.slang') {
    const packageRoot = path.dirname(require.resolve('slang-pbr/package.json'));
    const currentPath = path.join(packageRoot, 'src/pbr_material_kernel_smoke.slang');
    if (existsSync(currentPath)) return currentPath;
    return path.join(packageRoot, 'src/material_kernel_smoke.slang');
  }

  try {
    return require.resolve(specifier);
  } catch (error) {
    throw new Error(
      `Could not resolve ${specifier}. Run yarn install after adding the slang-pbr dependency, ` +
      `or set SLANG_PBR_ROOT to a local slang-pbr checkout.`,
      { cause: error },
    );
  }
}

function runGenerator(generatorPath, compileSourcePath, tempDir, defines) {
  const defineArgs = Object.entries(defines).flatMap(([key, value]) => ['--define', `${key}=${value}`]);
  const result = spawnSync(process.execPath, [
    generatorPath,
    '--target', 'glsl',
    '--kind', 'include',
    '--out-dir', tempDir,
    '--compile-source', compileSourcePath,
    '--energy-compensation', energyCompensation,
    ...defineArgs,
  ], {
    cwd: workspaceRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || '');
    process.exit(result.status || 1);
  }
  if (result.stdout) process.stdout.write(result.stdout);
}

function prepareWebGlInclude(glsl) {
  return glsl
    .replace(/^#version\s+\d+\s*\n/gm, '')
    .replace(/^#extension\s+[^\n]+\n/gm, '')
    .replace(/^layout\(row_major\)\s+uniform;\n/gm, '')
    .replace(/^layout\(row_major\)\s+buffer;\n/gm, '')
    .replace(/^#line[^\n]*\n/gm, '')
    .replace(/^\s*\[\[(?:unroll|loop|flatten|branch)\]\]\s*\n/gm, '')
    .trim();
}

function profileOutputPaths(profileName) {
  const profileDir = path.join(outputDir, profileName);
  const tempDir = path.join(workspaceRoot, '.tmp/slang-pbr-materials', profileName);
  return {
    profileDir,
    tempDir,
    generatedGlslPath: path.join(tempDir, 'slang-pbr.include.glsl'),
    generatedMetadataPath: path.join(tempDir, 'slang-pbr.codegen.json'),
    glslPath: path.join(profileDir, 'material_kernel.glsl'),
    metadataPath: path.join(profileDir, 'material_kernel.codegen.json'),
  };
}

async function generateProfile(profileName, profile, generatorPath, compileSourcePath, packageJson) {
  const paths = profileOutputPaths(profileName);
  await rm(paths.tempDir, { recursive: true, force: true });
  await mkdir(paths.tempDir, { recursive: true });
  await mkdir(paths.profileDir, { recursive: true });

  runGenerator(generatorPath, compileSourcePath, paths.tempDir, profile.defines);

  const generatedGlsl = prepareWebGlInclude(await readFile(paths.generatedGlslPath, 'utf8'));
  const generatedMetadata = JSON.parse(await readFile(paths.generatedMetadataPath, 'utf8'));
  const targetPath = `packages/lib/shader/generated/slang_materials/${profileName}/material_kernel.glsl`;
  const sanitizedGeneratedMetadata = {
    ...generatedMetadata,
    targets: {
      glsl: {
        ...(generatedMetadata.targets?.glsl ?? {}),
        path: targetPath,
      },
    },
  };

  const glsl = `// AUTO-GENERATED by tools/generate_slang_materials.mjs
// Include-safe GLSL library emitted by slang-pbr for ${profileName}.
// Do not edit by hand.

${generatedGlsl.trim()}
`;
  await writeFile(paths.glslPath, glsl, 'utf8');

  const metadata = {
    version: 3,
    materialProfile: profileName,
    description: profile.description,
    package: {
      name: packageJson.name,
      version: packageJson.version,
      entry: 'slang-pbr/models/enterprise/enterprise_pbr.slang',
      manifest: 'slang-pbr/manifest',
    },
    generator: {
      command: 'slang-pbr-generate',
      module: 'slang-pbr/tools/generate',
      target: 'glsl',
      kind: 'include',
      energyCompensation,
      defines: profile.defines,
    },
    slangPbr: sanitizedGeneratedMetadata,
    targets: {
      glsl: {
        available: true,
        path: targetPath,
      },
    },
  };
  await writeFile(paths.metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(workspaceRoot, paths.glslPath)}`);
  console.log(`Wrote ${path.relative(workspaceRoot, paths.metadataPath)}`);
  return metadata;
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await rm(path.join(workspaceRoot, '.tmp/slang-pbr-materials'), { recursive: true, force: true });

  const localPackageRoot = getLocalPackageRoot();
  const generatorPath = resolvePackagePath('slang-pbr/tools/generate', localPackageRoot);
  const packageJsonPath = resolvePackagePath('slang-pbr/package.json', localPackageRoot);
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const entryPath = resolvePackagePath('slang-pbr/models/enterprise/enterprise_pbr.slang', localPackageRoot);
  const manifestPath = resolvePackagePath('slang-pbr/manifest', localPackageRoot);
  const compileSourcePath = resolvePackagePath('slang-pbr/pbr_material_kernel_smoke.slang', localPackageRoot);

  const profileMetadata = {};
  for (const [profileName, profile] of Object.entries(materialProfiles)) {
    profileMetadata[profileName] = await generateProfile(profileName, profile, generatorPath, compileSourcePath, packageJson);
  }

  const aliasPaths = profileOutputPaths(rootAliasProfile);
  const aliasMetadata = {
    ...profileMetadata[rootAliasProfile],
    materialProfile: rootAliasProfile,
    profiles: Object.fromEntries(Object.entries(profileMetadata).map(([name, metadata]) => [name, {
      description: metadata.description,
      glsl: metadata.targets.glsl.path,
      metadata: `packages/lib/shader/generated/slang_materials/${name}/material_kernel.codegen.json`,
      defines: metadata.generator.defines,
    }])),
  };
  await writeFile(glslPath, await readFile(aliasPaths.glslPath, 'utf8'), 'utf8');
  await writeFile(metadataPath, `${JSON.stringify(aliasMetadata, null, 2)}\n`, 'utf8');
  await rm(path.join(workspaceRoot, '.tmp/slang-pbr-materials'), { recursive: true, force: true });

  console.log(`Wrote ${path.relative(workspaceRoot, glslPath)}`);
  console.log(`Wrote ${path.relative(workspaceRoot, metadataPath)}`);
}

await main();
