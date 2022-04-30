import {GUI} from 'dat.gui';
import {ThreeSceneTranslator} from 'dspbr-pt';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';

import {init, setIBLInfo, setSceneInfo} from './utils'

const [canvas, camera, renderer, controls, stats] = init();

const gui = new GUI();
gui.add(renderer, 'exposure').name('Display Exposure').min(0).max(10).step(0.01);
gui.add(renderer, 'tonemapping', renderer.tonemappingModes).name('Tonemapping');
gui.add(renderer, 'pixelRatio').name('Pixel Ratio').min(0.1).max(1.0);
gui.add(renderer, 'pixelRatioLowRes').name('Interaction Ratio').min(0.1).max(1.0).step(0.1);

const iblInfo = {
  "name" : "Artist Workshop",
  "url" :
      "https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets/ibl/artist_workshop_1k.hdr",
  "credit" :
      "by Oliksiy Yakovlyev from <a href=\"hdrihaven.com\">hdrihaven.com</a> <a href=\"https://creativecommons.org/publicdomain/zero/1.0/\">(CC0)</a>",
  "intensity" : 1.5
};

const sceneInfo = {
  "name" : "Damaged Helmet",
  "url" :
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf",
  "credit" :
      "Official <a href=\"https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/DamagedHelmet\">glTF Sample Model</a> (Original: Battle Damaged Sci-fi Helmet - PBR by <a href\"https://sketchfab.com/theblueturtle_\">theblueturtle_</a>, on <a href\"https://sketchfab.com/models/b81008d513954189a063ff901f7abfe4\">Sketchfab</a>.)"
};

async function main() {
  const scene_url =
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf";

  const ibl_url =
      "https://raw.githubusercontent.com/DassaultSystemes-Technology/dspbr-pt/main/assets/ibl/artist_workshop_1k.hdr";

  const ibl = await new RGBELoader().setDataType(THREE.FloatType).loadAsync(iblInfo.url);
  document.getElementById("ibl-info").innerHTML = `IBL: ${iblInfo.name}`;
  document.getElementById("ibl-info").innerHTML += ` - ${iblInfo.credit}`;

  renderer.setIBL(ibl);
  renderer.exposure = iblInfo.intensity;

  const gltf = await new GLTFLoader().loadAsync(sceneInfo.url);
  gltf.scene.updateMatrixWorld();
  const pathtracingSceneData = await ThreeSceneTranslator.translateThreeScene(gltf.scene, gltf);
  await renderer.setScene(pathtracingSceneData);

  document.getElementById("scene-info").innerHTML = `Scene: ${sceneInfo.name}`;
  document.getElementById("scene-info").innerHTML += ` - ${sceneInfo.credit}`;

  renderer.render(camera, -1, () => {
    controls.update();
    stats.update();
  })
}

main();
