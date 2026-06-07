import { Pane } from 'tweakpane';
import { createPathtracingViewport } from 'dspbr-pt';
import { PerspectiveCamera } from './perspective_camera';
import { Vec3 } from './math';
import { WasdCameraController } from './wasd_camera_controller';

const settings = {
  exposure: 1.5,
  toneMapping: 'None',
  pixelRatio: Math.min(window.devicePixelRatio, 1),
  interactionPixelRatio: 0.1,
  sampleLimit: 512,
};

const root = document.getElementById('viewport')!;
const canvas = document.createElement('canvas');
root.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 6);
camera.lookAt(new Vec3(0, 0, 0));

const viewport = createPathtracingViewport({
  canvas,
  settings: {
    pixelRatio: settings.pixelRatio,
    interactionPixelRatio: settings.interactionPixelRatio,
  },
});
viewport.setCamera(camera);

const controls = new WasdCameraController(camera, canvas);
controls.addEventListener('change', () => viewport.resetAccumulation());
controls.addEventListener('start', () => viewport.setInteractionMode(true));
controls.addEventListener('end', () => viewport.setInteractionMode(false));

window.addEventListener('resize', () => {
  viewport.resize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
}, false);

const pane = new Pane({ title: 'dspbr-pt' });
pane.addBinding(settings, 'exposure', { label: 'Exposure', min: 0, max: 10, step: 0.01 })
  .on('change', ev => viewport.setSettings({ exposure: ev.value }));
pane.addBinding(settings, 'toneMapping', {
  label: 'Tonemapping',
  options: Object.fromEntries(viewport.renderer.tonemappingModes.map(m => [m, m])),
}).on('change', ev => viewport.setSettings({ toneMapping: ev.value }));
pane.addBinding(settings, 'pixelRatio', { label: 'Pixel Ratio', min: 0.1, max: 1.0 })
  .on('change', ev => viewport.setSettings({ pixelRatio: ev.value }));
pane.addBinding(settings, 'interactionPixelRatio', { label: 'Interaction Ratio', min: 0.1, max: 1.0 })
  .on('change', ev => viewport.setSettings({ interactionPixelRatio: ev.value }));
pane.addBinding(settings, 'sampleLimit', { label: 'Sample Limit', min: 1, max: 4096, step: 1 });

const iblUrl =
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/artist_workshop_2k.hdr';
const sceneUrl =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf';

async function main() {
  viewport.setSettings({
    exposure: settings.exposure,
    toneMapping: settings.toneMapping,
    pixelRatio: settings.pixelRatio,
    interactionPixelRatio: settings.interactionPixelRatio,
    useIBL: true,
    showBackground: true,
  });

  await viewport.loadIblFromUrl(iblUrl);
  await viewport.loadSceneFromUrl(sceneUrl);
  viewport.start(settings.sampleLimit);
}

main();
