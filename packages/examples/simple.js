import {GUI} from 'dat.gui';
import {ThreeSceneTranslator} from 'dspbr-pt';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';

import {init} from './init'

const [canvas, camera, renderer, controls, stats] = init();

const gui = new GUI();
gui.add(renderer, 'exposure').name('Display Exposure').min(0).max(10).step(0.01);
gui.add(renderer, 'tonemapping', renderer.tonemappingModes).name('Tonemapping');
gui.add(renderer, 'pixelRatio').name('Pixel Ratio').min(0.1).max(1.0);
gui.add(renderer, 'pixelRatioLowRes').name('Interaction Ratio').min(0.1).max(1.0).step(0.1);

async function main() {
  const scene_url =
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf";

  const ibl_url =
      "https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets/ibl/artist_workshop_1k.hdr";

  const ibl = await new RGBELoader().setDataType(THREE.FloatType).loadAsync(ibl_url);
  renderer.setIBL(ibl);

  const gltf = await new GLTFLoader().loadAsync(scene_url);
  gltf.scene.updateMatrixWorld();
  const pathtracingSceneData = await ThreeSceneTranslator.translateThreeScene(gltf.scene, gltf);
  await renderer.setScene(pathtracingSceneData);

  renderer.render(camera, -1, () => {
    controls.update();
    stats.update();
  })
}

main();
