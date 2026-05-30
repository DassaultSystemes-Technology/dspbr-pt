import { Pane } from 'tweakpane';
import { loadSceneFromUrl, loadIblFromUrl } from 'dspbr-pt';
import { init } from './utils';

const [, camera, renderer] = init();

const pane = new Pane({ title: 'dspbr-pt' });
pane.addBinding(renderer, 'exposure',    { label: 'Exposure',    min: 0, max: 10, step: 0.01 });
pane.addBinding(renderer, 'tonemapping', { label: 'Tonemapping', options: Object.fromEntries(renderer.tonemappingModes.map(m => [m, m])) });
pane.addBinding(renderer, 'pixelRatio',  { label: 'Pixel Ratio', min: 0.1, max: 1.0 });

const iblUrl =
  'https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets/ibl/artist_workshop_1k.hdr';
const sceneUrl =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf';

async function main() {
  const ibl = await loadIblFromUrl(iblUrl);
  renderer.setIBL(ibl);
  renderer.useIBL = true;
  renderer.showBackground = true;
  renderer.exposure = 1.5;

  const { scene } = await loadSceneFromUrl(sceneUrl);
  await renderer.setScene(scene);

  renderer.render(camera, -1, () => {}, () => {});
}

main();
