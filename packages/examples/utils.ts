import { PathtracingRenderer } from 'dspbr-pt';
import { PerspectiveCamera, WasdCameraController, Vec3 } from 'dspbr-pt-viewer';

export function init(): [HTMLCanvasElement, PerspectiveCamera, PathtracingRenderer, WasdCameraController] {
  const viewport = document.getElementById('viewport')!;
  const canvas = document.createElement('canvas');
  viewport.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 0, 6);
  camera.lookAt(new Vec3(0, 0, 0));

  const renderer = new PathtracingRenderer({ canvas });
  renderer.pixelRatio = window.devicePixelRatio;

  const controls = new WasdCameraController(camera, canvas);
  controls.addEventListener('change', () => renderer.resetAccumulation());

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderer.resize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
  }, false);

  return [canvas, camera, renderer, controls];
}
