/* @license
 * Copyright 2020  Dassault Syst�mes - All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "core-js/stable";
import 'regenerator-runtime/runtime'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'dat.gui';
import scene_index from '../assets/scenes/scene_index.js';
import ibl_index from '../assets/env/ibl_index.js';
import { PathtracingRenderer } from '../lib/renderer.js';

if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

var container, canvas, stats, gui;
var renderer, scene, envMap;

//var y_to_z_up = new THREE.Matrix4().makeRotationX(-Math.PI *0.5);
var state = {
    Scene: Object.values(scene_index)[0],
    IBL: Object.values(ibl_index)[0],
    isRendering: false,
}

initApp();
initMenu();
//animate();

function initApp() {
    container = document.createElement('div');
    document.body.appendChild(container);
    canvas = document.createElement('canvas');
    container.appendChild(canvas);

    renderer = new PathtracingRenderer({ "canvas": canvas });
    renderer.enableControls(true);
    renderer.loadScene(state.Scene, state.IBL, function () {
        renderer.render(-1, () => {
            stats.update();
        });
    });

    //gui.domElement.classList.remove("hidden");		

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.cursor = "default";
    stats.domElement.style.webkitUserSelect = "none";
    stats.domElement.style.MozUserSelect = "none";
    container.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

    canvas.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    canvas.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();

        renderer.loadSceneFromBlobs(e.dataTransfer.files, state.IBL, function () {
            renderer.render(-1, () => {
                stats.update();
            });
        });
    });
}

function initMenu() {
    if (gui)
        return;

    gui = new GUI();
    gui.domElement.classList.add("hidden");

    gui.add(state, "Scene", scene_index).onChange(function (value) {
        console.log(`Loading ${value}`);
        renderer.loadScene(value, state.IBL, function () {
            renderer.render(-1, () => {
                stats.update();
            });
        });
    });

    gui.add(state, "IBL", ibl_index).onChange(function (value) {
        console.log(`Loading ${value}`);
        renderer.loadScene(state.Scene, value, function () {
            renderer.render(-1, () => {
                stats.update();
            });
        });
    });

    gui.add(renderer.settings, 'pathtracing').onChange(function (value) {
        renderer.resetAccumulation();
    });

    gui.add(renderer.settings, 'disableDirectShadows').onChange(function (value) {
        renderer.resetAccumulation();
    });

    gui.add(renderer.settings, 'maxBounceDepth').min(0).max(5).step(1).onChange(function (value) {
        renderer.resetAccumulation();
    });
    gui.add(renderer.settings, 'debugMode', renderer.debugModes).onChange(function (value) {
        renderer.resetAccumulation();
    });
    gui.add(renderer.settings, 'autoScaleOnImport');

    gui.add(renderer.settings, 'useIBL').onChange(function (value) {
        renderer.toggleIBL(value);
    });

    gui.add(renderer.settings, 'autoRotate').onChange(function (value) {
        renderer.toggleAutoRotate(value);
    });

    gui.add(renderer.settings, 'pixelRatio').min(0.1).max(1.0).onChange(function (value) {
        // resize updates all rendertarget taking into account current pixelRatio
        renderer.resize(window.innerWidth, window.innerHeight);
    });

    var obj = {
        reload: function () {
            renderer.loadScene(state.Scene, state.IBL, function () {
                renderer.render(-1, () => {
                    stats.update();
                });
            });
            console.log("Reload")
        }
    };
    gui.add(obj, 'reload');

    var obj = {
        centerView: function () {
            renderer.centerView();
            console.log("center view")
        }
    };
    gui.add(obj, 'centerView');
}

// TODO
function onWindowResize() {
    console.log("resizing", window.innerWidth, window.innerHeight);
    renderer.resize(window.innerWidth, window.innerHeight);
}
