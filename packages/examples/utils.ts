import * as THREE from 'three';
import { PathtracingRenderer } from 'dspbr-pt';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module.js';


export function init() {
  const viewport = document.getElementById("viewport");
  const canvas = document.createElement('canvas');
  viewport.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);

  const renderer = new PathtracingRenderer({ canvas: canvas });
  renderer.pixelRatio = 1.0 * window.devicePixelRatio;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer.resize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, false);

  const controls = new OrbitControls(camera, canvas);
  controls.screenSpacePanning = true;
  controls.enableDamping = false;
  controls.rotateSpeed = 2.0;
  controls.panSpeed = 2.0;

  camera.position.set(0.0, 0.0, 6.0);
  camera.lookAt(new THREE.Vector3());
  camera.updateMatrixWorld();
  controls.update();

  controls.addEventListener('change', () => {
    camera.updateMatrixWorld();
    renderer.resetAccumulation();
  });

  // controls.addEventListener('start', () => { renderer.setLowResRenderMode(true); });
  // controls.addEventListener('end', () => { renderer.setLowResRenderMode(false); });

  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.DOLLY
  }

  const stats = new Stats();
  viewport.appendChild(stats.domElement);
  return [canvas, camera, renderer, controls, stats];
}
