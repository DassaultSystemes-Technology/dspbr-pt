/* @license
 * Copyright 2020  Dassault Systèmes - All Rights Reserved.
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

import * as THREE from 'three/build/three.module.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SimpleTriangleBVH } from './bvh.js';

function PathtracingRenderer(parameters, settings) {
    console.time("Init Pathtracing Renderer");
    parameters = parameters || {};

    //var y_to_z_up = new THREE.Matrix4().makeRotationX(-Math.PI *0.5);

    this.settings = {
        pathtracing: true,
        debugMode: "None",
        maxBounceDepth: 1,
        useIBL: true,
        autoScaleOnImport: true,
        pixelRatio: 0.5, // this serves as a multiplier to the devcice pixel ratio, which might be > 1 for e.g. retiana displays
        autoRotate: false,
        disableDirectShadows: false
    };

    if (settings !== undefined) {
        this.settings = settings;
    }

    var clock = new THREE.Clock();

    var _this = this,
        _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas'),
        _gl = _canvas.getContext('webgl2'),
        _renderer,
        _controls,
        _camera,
        _quadCamera,
        _pathtracingScene,
        _pathTracingMesh,
        _accumBufferScene,
        _displayScene,
        _pathTracingRenderTarget,
        _accumRenderTarget,
        _pathTracingUniforms,
        _frameCount = 1,
        _glCubeIBL,
        _boundingBox,
        _pmremGenerator,
        _isRendering = false;

    let _scene = new THREE.Scene();
    let _content = null;

    this.domElement = _canvas;
    this.debugModes = ["None", "Albedo", "Metalness", "Roughness", "Normals", "Tangents", "Bitangents"];

    let texArrayList = [];
    let texArrayDict = {};
    let texArray;

    var fileLoader = new THREE.FileLoader();
    function filePromiseLoader(url, onProgress) {
        return new Promise((resolve, reject) => {
            fileLoader.load(url, resolve, onProgress, reject);
        });
    }

    var cleanupScene = function (scene) {
        console.log('Cleaning up scene data...!')

        const cleanMaterial = material => {
            console.log('dispose material!')
            material.dispose()

            // dispose textures
            for (const key of Object.keys(material)) {
                const value = material[key]
                if (value && typeof value === 'object' && 'minFilter' in value) {
                    console.log('dispose texture!')
                    value.dispose()
                }
            }
        };

        scene.traverse(object => {
            if (!object.isMesh) return

            console.log('dispose geometry!')
            object.geometry.dispose()

            if (object.material.isMaterial) {
                cleanMaterial(object.material)
            } else {
                // an array of materials
                for (const material of object.material) cleanMaterial(material)
            }
        });
    }

    this.cleanup = function () {
        texArrayDict = {};

        for (let ta in texArrayList) {
            for (let t in texArrayList[ta]) {
                texArrayList[ta][t].dispose();
            }

            _pathTracingUniforms[`u_sampler2DArray_MaterialTextures_${ta}`].value.dispose();
        }

        texArrayList = [];
        
        if (_content) {
            _scene.remove(_content);
            cleanupScene(_content);            
                 
            _scene.background = new THREE.Color(0,0,0);
            _scene.environment = new THREE.Color(0,0,0);
        }
        
        if (_glCubeIBL !== undefined)
            _glCubeIBL.dispose();
    }

    this.getContext = function () {
        return _gl;
    };

    this.getGLRenderer = function () {
        return _renderer;
    };

    this.resetAccumulation = function () {
        _frameCount = 1;
        // console.log("Reset Accumulation");
    };

    this.setPixelRatio = function(ratio) {
        _this.settings.pixelRatio = ratio;
        _this.resize(window.innerWidth, window.innerHeight);
    }

    this.toggleAutoRotate =  function(flag) {
        _controls.autoRotate = flag;
        _this.resetAccumulation();
    }

    this.toggleIBL = function (flag) {
        _this.settings.useIBL = flag;
    
        if (!flag) {
            _scene.background = undefined;
            _scene.environment = undefined;
        } else {
            _scene.background = _glCubeIBL;
            _scene.environment = _glCubeIBL;
        }

        _this.resetAccumulation();
    }

    this.stopRendering = function () {
        _isRendering = false;
    };

    this.render = function (num_samples, frameFinishedCB, renderingFinishedCB) {
        if (_camera instanceof THREE.Camera === false) {
            console.error('PathtracingRenderer.render: camera is not an instance of THREE.Camera.');
            return;
        }

        _isRendering = true;
        _this.resetAccumulation();

        function renderFrame() {
            if (!_isRendering || _renderer === undefined)
                return;

            _controls.update(clock.getDelta());
            //console.log(`Render frame ${_frameCount}`);

            if (_this.settings.pathtracing) {

                if (_pathTracingUniforms !== undefined) {
                    _pathTracingUniforms.u_mat4_ViewMatrix.value.copy(_camera.matrixWorld);
                    _pathTracingUniforms.u_vec3_CameraPosition.value.copy(_camera.position);
                    _pathTracingUniforms.u_int_FrameCount.value = _frameCount;
                    _pathTracingUniforms.u_int_DebugMode.value = _this.debugModes.indexOf(_this.settings.debugMode);
                    _pathTracingUniforms.u_bool_UseIBL.value = _this.settings.useIBL;
                    _pathTracingUniforms.u_int_MaxBounceDepth.value = _this.settings.maxBounceDepth;
                    _pathTracingUniforms.u_vec2_InverseResolution.value.set(1.0 / window.innerWidth, 1.0 / window.innerHeight);
                    let filmHeight = Math.tan(_camera.fov * 0.5 * Math.PI / 180.0) * _camera.near;
                    _pathTracingUniforms.u_float_FilmHeight.value = filmHeight; //TODO move to shader 
                    _pathTracingUniforms.u_float_FocalLength.value = _camera.near;
                    _pathTracingUniforms.u_bool_disableDirectShadows.value = _this.settings.disableDirectShadows;
                    // _pathTracingUniforms.u_float_FilmHeight.value = _camera.getFilmHeight();
                    // _pathTracingUniforms.u_float_FocalLength.value = _camera.getFocalLength();
                }

                if (_this.settings.debugMode !== "None") {

                    _renderer.setRenderTarget(_pathTracingRenderTarget);
                    _renderer.render(_pathtracingScene, _camera);

                    _renderer.setRenderTarget(_accumRenderTarget);
                    _renderer.render(_accumBufferScene, _quadCamera);

                    _renderer.setRenderTarget(null);
                    _renderer.render(_accumBufferScene, _quadCamera);

                } else {

                    _renderer.setRenderTarget(_pathTracingRenderTarget);
                    _renderer.render(_pathtracingScene, _camera);

                    // STEP 2
                    // Render(copy) the pathTracingScene output(pathTracingRenderTarget above) into screenTextureRenderTarget.
                    // This will be used as a new starting point for Step 1 above (essentially creating ping-pong buffers)
                    _renderer.setRenderTarget(_accumRenderTarget);
                    _renderer.render(_accumBufferScene, _quadCamera);

                    // STEP 3
                    // Render full screen quad with generated pathTracingRenderTarget in STEP 1 above.
                    // After the image is gamma-corrected, it will be shown on the screen as the final accumulated output
                    _renderer.setRenderTarget(null);
                    _renderer.render(_displayScene, _quadCamera);                 
                }
            } else {
                _renderer.render(_scene, _camera); // render GL view
            }

            _frameCount++;

            if (num_samples !== -1 && _frameCount >= num_samples) {
                renderingFinishedCB(); // finished rendering num_samples
                _isRendering = false;
            }

            frameFinishedCB();
            requestAnimationFrame(renderFrame); // num_samples == -1 || _frameCount < num_samples

        }

        requestAnimationFrame(renderFrame); // start render loop
    };

    function initRenderer() {
        //THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);

        _pathtracingScene = new THREE.Scene();
        _accumBufferScene = new THREE.Scene();
        _displayScene = new THREE.Scene();

        _renderer = new THREE.WebGLRenderer({ canvas: _canvas, context: _gl, powerPreference: "high-performance" });
        _renderer.setPixelRatio(_this.settings.pixelRatio*window.devicePixelRatio);
        _renderer.setSize(window.innerWidth, window.innerHeight);
        _renderer.getContext().getExtension('EXT_color_buffer_float');
        //_renderer.toneMapping = THREE.ACESFilmicToneMapping;
        _renderer.toneMapping = THREE.NoToneMapping
        _renderer.toneMappingExposure = 1.0;
        _renderer.outputEncoding = THREE.GammaEncoding;
        _renderer.physicallyCorrectLights = true;

        _pmremGenerator = new THREE.PMREMGenerator(_renderer);
        _pmremGenerator.compileEquirectangularShader();


        let aspect = window.innerWidth / window.innerHeight;
        _camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 100);
        _camera.position.set(0, 0, 3);

        _controls = new OrbitControls(_camera, _canvas);
        _controls.screenSpacePanning = true;

        _controls.addEventListener('change', function () {
            _this.resetAccumulation();
        });

        _controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        }

        _quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        _accumBufferScene.add(_quadCamera);
        _displayScene.add(_quadCamera);
        
        let quadGeometry = new THREE.PlaneBufferGeometry(2, 2);

        let renderPixelRatio =  _this.settings.pixelRatio * window.devicePixelRatio
        _pathTracingRenderTarget = new THREE.WebGLRenderTarget((window.innerWidth * renderPixelRatio), (window.innerHeight * renderPixelRatio), {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
            depthBuffer: false,
            stencilBuffer: false
        });

        let accumMaterial = new THREE.ShaderMaterial({
            uniforms: screenTextureShader.uniforms,
            vertexShader: screenTextureShader.vertexShader,
            fragmentShader: screenTextureShader.fragmentShader,
            depthWrite: false,
            depthTest: false
        });

        accumMaterial.uniforms.tex.value = _pathTracingRenderTarget.texture;

        let screenTextureMesh = new THREE.Mesh(quadGeometry, accumMaterial);
        _accumBufferScene.add(screenTextureMesh);
      
        accumMaterial.dispose();        

        let displayMaterial = new THREE.ShaderMaterial({
            uniforms: screenOutputShader.uniforms,
            vertexShader: screenOutputShader.vertexShader,
            fragmentShader: screenOutputShader.fragmentShader,
            depthWrite: false,
            depthTest: false
        });

        displayMaterial.uniforms.tex.value = _pathTracingRenderTarget.texture;

        let displayMesh = new THREE.Mesh(quadGeometry, displayMaterial);
        _displayScene.add(displayMesh);

        quadGeometry.dispose();
        displayMaterial.dispose();        

        console.timeEnd("Init Pathtracing Renderer");

        _accumRenderTarget = new THREE.WebGLRenderTarget((window.innerWidth * renderPixelRatio), (window.innerHeight * renderPixelRatio), {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: false,
            stencilBuffer: false
        });
    }

    this.resize = function (width, height) {
        let renderPixelRatio =  _this.settings.pixelRatio * window.devicePixelRatio
        _renderer.setPixelRatio(renderPixelRatio);
        _renderer.setSize(width, height);
        _pathTracingRenderTarget.setSize(width * renderPixelRatio, height * renderPixelRatio);
        _accumRenderTarget.setSize(width * renderPixelRatio, height * renderPixelRatio);
        _camera.aspect = width / height;
        _camera.updateProjectionMatrix();
        _this.resetAccumulation();
    }

    this.centerView = function () {
        let center = new THREE.Vector3();
        _boundingBox.getCenter(center);
        _controls.target = center;
        _controls.update();
        _this.resetAccumulation();
    }

    function MaterialData() {
        this.albedo = [1.0, 1.0, 1.0];
        this.metallic = 0.0;

        this.roughness = 0.0;
        this.anisotropy = 0.0;
        this.anisotropyRotation = 0.0;
        this.transparency = 0.0;

        this.cutoutOpacity = 1.0;
        this.sheen = 0.0;
        this.normalScale = 1.0;
        this.ior = 1.5;

        this.specular = 1.0;
        this.specularTint = [1.0, 1.0, 1.0];

        this.sheenRoughness = 0.0;
        this.sheenColor = [1.0, 1.0, 1.0];

        this.normalScaleClearcoat = 1.0;
        this.emission = [0.0, 0.0, 0.0];

        this.clearcoat = 0.0;
        this.clearcoatRoughness = 0.0;
        this.flakeCoverage = 0.0;
        this.flakeSize = 0.02;

        this.flakeRoughness = 0.2;
        this.flakeColor = [1.0, 1.0, 1.0];

        this.attenuationDistance = 100000.0;
        this.attenuationColor = [1.0, 1.0, 1.0];

        this.subsurfaceColor = [1.0, 1.0, 1.0];
        this.thinWalled = 0;
    };

    function TexInfo () {
        this.texArrayIdx = -1;
        this.texIdx = -1;
        this.texCoordSet = -1;
        this.pad = -1;
        this.texOffset = [0, 0]; // TODO: Where to put these? Removing them here allows to use byte type for texInfoArray.
        this.texScale = [1, 1];
    }

    function MaterialTextureInfo() {
        this.albedoMap = new TexInfo;
        this.metallicRoughnessMap = new TexInfo();
        this.normalMap = new TexInfo();
        this.emissionMap = new TexInfo();
        this.specularMap = new TexInfo();
    }
  
    function Light() {
        this.position = [1, 1, 1];
        this.type = 0;
        this.emission = [1, 1, 1];
        this.pad = 0;
    }

    function findTextureInList(tex, texList) {
        for (let i = 0; i < texList.length; i++) {
            if (tex.image.src === texList[i].image.src)
                return i;
        }

        return -1;
    }

    function parseTexture(tex) {
        let texInfo = new TexInfo(); 

        let res = [tex.image.width, tex.image.height];
        if (res in texArrayDict) {
            let texArrayIdx = texArrayDict[res];
            let texIdxInArray = findTextureInList(tex, texArrayList[texArrayIdx]);
            if (texIdxInArray < 0) {
                texArrayList[texArrayIdx].push(tex);
                texIdxInArray = texArrayList[texArrayIdx].length - 1;
            }
            texInfo.texArrayIdx = texArrayIdx;
            texInfo.texIdx = texIdxInArray;        
        } else {
            texArrayDict[res] = texArrayList.length;
            let tex_array = [tex];
            texArrayList.push(tex_array);
            texInfo.texArrayIdx = texArrayList.length - 1;
            texInfo.texIdx = 0;
        }
        
        texInfo.texOffset = [tex.offset.x, tex.offset.y];
        texInfo.texScale = [tex.repeat.x, tex.repeat.y];

        texInfo.texCoordSet = 0; // TODO Handle second uv set
        return texInfo;
    };

 
    function parseMaterial(mat, materialBuffer, materialTextureInfoBuffer) {
        let matInfo = new MaterialData();
        let matTexInfo = new MaterialTextureInfo();

        matInfo.albedo = mat.color.toArray();

        if (mat.map) {
            matTexInfo.albedoMap = parseTexture(mat.map);
        }

        matInfo.metallic = mat.metalness || 0;
        matInfo.roughness = mat.roughness || 1;

        matInfo.transparency = mat.transparent ? 1.0 - mat.opacity : 0.0;
        matInfo.cutoutOpacity = (mat.alphaTest === 0.5) ? 1.0 : 0.0

        if (mat.metalnessMap) {
            matTexInfo.metallicRoughnessMap = parseTexture(mat.metalnessMap);
        }

        if (mat.normalMap) {
            matTexInfo.normalMap = parseTexture(mat.normalMap);
            matInfo.normalScale = mat.normalScale.x;
        }

        if (mat.emissiveMap) {
            matTexInfo.emissionMap = parseTexture(mat.emissiveMap);
            matInfo.emission = mat.emissive.toArray();
        }

        if ("gltfExtensions" in mat.userData) {

            function get_param(name, obj, default_value) {
                return (name in obj) ? obj[name] : default_value;
            }

            let extensions = mat.userData.gltfExtensions;

            if ('3DS_materials_anisotropy' in extensions) {
                let ext = extensions["3DS_materials_anisotropy"];
                matInfo.anisotropy = get_param("anisotropyFactor", ext, matInfo.anisotropy);
                matInfo.anisotropyRotation = get_param("anisotropyRotationFactor", ext, matInfo.anisotropyRotation);
            }
            if ('3DS_materials_specular' in extensions) {
                let ext = extensions["3DS_materials_specular"];
                matInfo.specular = get_param("specularFactor", ext, matInfo.specular);
                matInfo.specularTint = get_param("specularColorFactor", ext, matInfo.specularTint);
            }
            if ('3DS_materials_ior' in extensions) {
                matInfo.ior = get_param("ior", extensions["3DS_materials_ior"], matInfo.ior);
            }
            if ('3DS_materials_clearcoat' in extensions) {
                let ext = extensions["3DS_materials_clearcoat"];
                matInfo.clearcoat = get_param("clearcoatFactor", ext, matInfo.clearcoat);
                matInfo.clearcoatRoughness = get_param("clearcoatRoughnessFactor", ext, matInfo.clearcoatRoughness);
            }
            if ('3DS_materials_sheen' in extensions) {
                let ext = extensions["3DS_materials_sheen"];
                matInfo.sheen = get_param("intensityFactor", ext, matInfo.sheen);
                matInfo.sheenColor = get_param("colorFactor", ext, matInfo.sheenColor);
                matInfo.sheenRoughness = get_param("roughnessFactor", ext, matInfo.sheenRoughness);
            }
        }

        materialBuffer.push(Object.values(matInfo));
        materialTextureInfoBuffer.push(Object.values(matTexInfo));
    }

    this.loadSceneFromBlobs = function (fileList, ibl_path, callback) {
        var manager = new THREE.LoadingManager();

        let blobs = {};
        for (var i = 0; i < fileList.length; i++) {
            let name = fileList[i].name;
            if (getFileExtension(fileList[i].name) !== "gltf" &&
                getFileExtension(fileList[i].name) !== "glb") {
                name = "./" + name;
            }

            blobs[name] = fileList[i];
        }

        // Initialize loading manager with URL callback.
        var objectURLs = [];
        manager.setURLModifier((url) => {
            if (url.startsWith("blob"))
                return url;

            console.log("Parsing blob resource: " + url);
            url = URL.createObjectURL(blobs[url]);
            objectURLs.push(url);
            return url;
        });

        function getFileExtension(filename) {
            return filename.split('.').pop();
        }

        for (var i = 0; i < fileList.length; i++) {
            if (getFileExtension(fileList[i].name) === "gltf" ||
                getFileExtension(fileList[i].name) === "glb")
                _this.loadScene(fileList[i].name, ibl_path, callback, manager);
        }
    }
   

    this.loadScene = function (scene_path, ibl_path, callback, manager) {
        _this.cleanup();
        _this.stopRendering();
        THREE.Cache.clear();

        console.log("GL Renderer state before load:\n", _renderer.info);

        new RGBELoader()
            .setDataType(THREE.FloatType)
            .load(ibl_path, function (texture) {
               
                _glCubeIBL = _pmremGenerator.fromEquirectangular(texture).texture;
                _pmremGenerator.dispose();

                texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;

                var loader = new GLTFLoader(manager);
                loader.load(scene_path, function (gltf) {

                    const scene = gltf.scene || gltf.scenes[0];

                    if (!scene) {
                        // Valid, but not supported by this viewer.
                        throw new Error(
                            'This model contains no scene, and cannot be viewed here. However,'
                            + ' it may contain individual 3D resources.'
                        );
                    }
    
                    var bbox = new THREE.Box3().setFromObject(scene);
                    const minValue = Math.min(bbox.min.x, Math.min(bbox.min.y, bbox.min.z));
                    const maxValue = Math.max(bbox.max.x, Math.max(bbox.max.y, bbox.max.z));
                    const deltaValue = maxValue - minValue;
                    let sceneScaleFactor = 1.0 / deltaValue;
                    // Normalize scene dimensions (needed for easy rt precision control) 
                    if (_this.settings.autoScaleOnImport) {
                        scene.scale.set(sceneScaleFactor, sceneScaleFactor, sceneScaleFactor);
                    }

                    //scene.matrixAutoUpdate = false;
                    scene.updateMatrixWorld()

                    // we need a clone where we disconnect geometry refs (see below)
                    _content = scene.clone();  
                    
                    _scene.add(_content);
                    //scene.applyMatrix4(y_to_z_up);

                    // Break reference of geometry nodes in scene copy
                    // we need this because the transforms will baked into geo for path-tracing
                    // whereas gl renderer is resolving transforms on pre-render
                    _scene.traverse((node) => {
                        if (node.isMesh) {
                            node.geometry = node.geometry.clone();
                        }
                    });

                    texture.flipY = true;
                    texture.needsUpdate = true;
                    _this.toggleIBL(_this.settings.useIBL);

                    createPathTracingScene(scene, texture).then(() => {
                        texture.dispose();

                        _this.resetAccumulation();
                        texture.dispose();

                        scene.traverse((node) => {
                            if (node.isMesh) {
                                node.geometry.dispose();
                            }
                        });

                        callback();
                    });
                });
            });

    };

    // Initializes all necessary pathtracing related data structures from three scene
    async function createPathTracingScene(scene, envMap) {
        _boundingBox = new THREE.Box3().setFromObject(scene);

        console.time("InitializingPT");

        //if (meshGroup.scene)
        //    meshGroup = meshGroup.scene;      

        let lights = [];
        let cameras = [];
        let meshes = [];
        let materialBuffer = [];
        let materialTextureInfoBuffer = [];
        let triangleMaterialMarkers = [];

        let matrixStack = [];
        let parent;

        matrixStack.push(new THREE.Matrix4());
        scene.traverse(function (child) {
            if (child.isMesh || child.isLight || child.isCamera) {
                if (parent !== undefined && parent.name !== child.parent.name) {
                    matrixStack.pop();
                    parent = undefined;
                }

                //child.matrix.premultiply(matrixStack[matrixStack.length - 1]);

                if (child.isMesh) {

                    child.geometry.applyMatrix4(child.matrixWorld);

                    if (child.material.length > 0) {
                        //for (let i = 0; i < child.material.length; i++)
                        //new MaterialObject(child.material[i], pathTracingMaterialList);
                        parseMaterial(child.material[0], materialBuffer, materialTextureInfoBuffer)
                    } else {
                        parseMaterial(child.material, materialBuffer, materialTextureInfoBuffer);
                    }

                    if (child.geometry.groups.length > 0) {
                        for (let i = 0; i < child.geometry.groups.length; i++) {
                            triangleMaterialMarkers.push((triangleMaterialMarkers.length > 0 ?
                                triangleMaterialMarkers[triangleMaterialMarkers.length - 1] : 0) +
                                child.geometry.groups[i].count / 3);
                        }
                    } else {
                        triangleMaterialMarkers.push((triangleMaterialMarkers.length > 0 ?
                            triangleMaterialMarkers[triangleMaterialMarkers.length - 1] : 0)
                            + child.geometry.index.count / 3);
                    }

                    meshes.push(child);
                }
                else if (child.isLight) {
                    console.log(child);

                    let l = new Light();
                    let pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld   );
                    l.position = pos.toArray(); // TODO clarify why                     
                    l.type = (child.type === "PointLight") ? 0 : 1;
                    l.emission = child.color.multiplyScalar(child.intensity).toArray();
                    lights.push(l);
                }
                else if (child.isCamera) {
                    console.log(child);
                    child.position.applyMatrix4(child.matrix);
                    cameras.push(child);
                }
            } else if (child.isObject3D) {
                if (parent !== undefined)
                    matrixStack.pop();

                let matrixPeek = new THREE.Matrix4().copy(matrixStack[matrixStack.length - 1]).multiply(child.matrix);
                matrixStack.push(matrixPeek);
                parent = child;
            }
        });

        var flattenedMeshList = [].concat.apply([], meshes);

        if (cameras.length > 0) { // just use camera 0 for now
            if (_camera !== undefined) {
                _camera.fov = cameras[0].fov;  
                _camera.near = cameras[0].near;
                //_camera.aspect = cameras[0].aspect;
                _camera.matrixWorld = cameras[0].matrixWorld;
                _camera.updateProjectionMatrix();
                _controls.update();
            }
        }
        await prepareDataBuffers(flattenedMeshList, envMap, lights, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers);
    };

    async function prepareDataBuffers(meshList, envMap, lightList, materialBuffer, materialTextureInfoBuffer, triangleMaterialMarkers) {
        // Gather all geometry from the mesh list that now contains loaded models
        let geoList = [];
        for (let i = 0; i < meshList.length; i++)
            geoList.push(meshList[i].geometry);

        // Merge geometry from all models into one new mesh
        let modelMesh = new THREE.Mesh(BufferGeometryUtils.mergeBufferGeometries(geoList));

        if (modelMesh.geometry.attributes.tangent === undefined)
            BufferGeometryUtils.computeTangents(modelMesh.geometry);
        if (modelMesh.geometry.index)
            modelMesh.geometry = modelMesh.geometry.toNonIndexed(); // TODO: why do we need NonIndexed geometry?

        // 9 floats per triangle
        let total_number_of_triangles = modelMesh.geometry.attributes.position.array.length / 9;

        console.log(`Loaded glTF consisting of ${total_number_of_triangles} total triangles.`);

        console.timeEnd("InitializingPT");

        console.time("BvhGeneration");
        console.log("BvhGeneration...");

        //modelMesh.geometry.rotateY(Math.PI);

        // let totalWork = new Uint32Array(total_number_of_triangles);
        var vpa = new Float32Array(modelMesh.geometry.attributes.position.array);
        if (modelMesh.geometry.attributes.normal === undefined)
            modelMesh.geometry.computeVertexNormals();

        var vna = new Float32Array(modelMesh.geometry.attributes.normal.array);
        var modelHasUVs = false;
        if (modelMesh.geometry.attributes.uv !== undefined) {
            var vuv = new Float32Array(modelMesh.geometry.attributes.uv.array);
            modelHasUVs = true;
        }

        let position_buffer = new Float32Array(total_number_of_triangles * 12);
        let normal_buffer = new Float32Array(total_number_of_triangles * 12);
        let uv_buffer = new Float32Array(total_number_of_triangles * 12);


        let materialIdx = 0;
        for (let i = 0; i < total_number_of_triangles; i++) {

            if (i >= triangleMaterialMarkers[materialIdx])
                materialIdx++;

            let vt0 = new THREE.Vector2();
            let vt1 = new THREE.Vector2();
            let vt2 = new THREE.Vector2();
            // record vertex texture coordinates (UVs)
            if (modelHasUVs) {
                vt0.set(vuv[6 * i + 0], vuv[6 * i + 1]);
                vt1.set(vuv[6 * i + 2], vuv[6 * i + 3]);
                vt2.set(vuv[6 * i + 4], vuv[6 * i + 5]);
            } else {
                vt0.set(0, 0);
                vt1.set(0, 0);
                vt2.set(0, 0);
            }

            // record vertex normals
            let vn0 = new THREE.Vector3(vna[9 * i + 0], vna[9 * i + 1], vna[9 * i + 2]).normalize();
            let vn1 = new THREE.Vector3(vna[9 * i + 3], vna[9 * i + 4], vna[9 * i + 5]).normalize();
            let vn2 = new THREE.Vector3(vna[9 * i + 6], vna[9 * i + 7], vna[9 * i + 8]).normalize();

            // record vertex positions
            let vp0 = new THREE.Vector3(vpa[9 * i + 0], vpa[9 * i + 1], vpa[9 * i + 2]);
            let vp1 = new THREE.Vector3(vpa[9 * i + 3], vpa[9 * i + 4], vpa[9 * i + 5]);
            let vp2 = new THREE.Vector3(vpa[9 * i + 6], vpa[9 * i + 7], vpa[9 * i + 8]);

            // TODO Move material index to a per triangle info data buffer
            position_buffer[12 * i + 0] = vp0.x; position_buffer[12 * i + 1] = vp0.y; position_buffer[12 * i + 2] = vp0.z; position_buffer[12 * i + 3] = materialIdx;
            position_buffer[12 * i + 4] = vp1.x; position_buffer[12 * i + 5] = vp1.y; position_buffer[12 * i + 6] = vp1.z; position_buffer[12 * i + 7] = materialIdx;
            position_buffer[12 * i + 8] = vp2.x; position_buffer[12 * i + 9] = vp2.y; position_buffer[12 * i + 10] = vp2.z; position_buffer[12 * i + 11] = materialIdx;

            normal_buffer[12 * i + 0] = vn0.x; normal_buffer[12 * i + 1] = vn0.y; normal_buffer[12 * i + 2] = vn0.z; normal_buffer[12 * i + 3] = materialIdx;
            normal_buffer[12 * i + 4] = vn1.x; normal_buffer[12 * i + 5] = vn1.y; normal_buffer[12 * i + 6] = vn1.z; normal_buffer[12 * i + 7] = materialIdx;
            normal_buffer[12 * i + 8] = vn2.x; normal_buffer[12 * i + 9] = vn2.y; normal_buffer[12 * i + 10] = vn2.z; normal_buffer[12 * i + 11] = materialIdx;

            uv_buffer[12 * i + 0] = vt0.x; uv_buffer[12 * i + 1] = vt0.y; uv_buffer[12 * i + 2] = 0; uv_buffer[12 * i + 3] = 0;
            uv_buffer[12 * i + 4] = vt1.x; uv_buffer[12 * i + 5] = vt1.y; uv_buffer[12 * i + 6] = 0; uv_buffer[12 * i + 7] = 0;
            uv_buffer[12 * i + 8] = vt2.x; uv_buffer[12 * i + 9] = vt2.y; uv_buffer[12 * i + 10] = 0; uv_buffer[12 * i + 11] = 0;
        }

        modelMesh.geometry.dispose();
        modelMesh.material.dispose();

        let rgba_stride = 4;

        let bvh = new SimpleTriangleBVH(rgba_stride);
        bvh.build(position_buffer);

        // now we need to reorder the tri data based on the bvh indices created during construction
        //!!TOOPT: do this in place   
        let triData = new Float32Array(position_buffer.length);
        let normalData = new Float32Array(normal_buffer.length);
        let uvData = new Float32Array(uv_buffer.length);

        let tangentData;
        let tangent_buffer;
        if (modelHasUVs) { // tangents will only be generated when uvs are available    
            tangent_buffer = new Float32Array(modelMesh.geometry.attributes.tangent.array);
            tangentData = new Float32Array(tangent_buffer);
        }

        for (let i = 0; i < total_number_of_triangles; i++) {
            let srcIdx = bvh.m_pTriIndices[i];
            for (let j = 0; j < (3 * rgba_stride); j++) {
                triData[i * (3 * rgba_stride) + j] = position_buffer[srcIdx * (3 * rgba_stride) + j];
                normalData[i * (3 * rgba_stride) + j] = normal_buffer[srcIdx * (3 * rgba_stride) + j];
                uvData[i * (3 * rgba_stride) + j] = uv_buffer[srcIdx * (3 * rgba_stride) + j];

                if (modelHasUVs) {                    
                    tangentData[i * (3 * rgba_stride) + j] = tangent_buffer[srcIdx * (3 * rgba_stride) + j];
                }
            }
        }

        let flatBVHData = bvh.createAndCopyToFlattenedArray_StandardFormat();

        let flatMaterialBuffer = materialBuffer.flat(Infinity);
        let flatMaterialTextureInfoBuffer = materialTextureInfoBuffer.flat(Infinity);
        let valueList = [];
        for(let i=0; i<flatMaterialTextureInfoBuffer.length; i++) {
            let texInfo = flatMaterialTextureInfoBuffer[i];
            let values = Object.values(texInfo).flat(Infinity);            
            valueList.push(values);
        }

        valueList = valueList.flat(Infinity);

        let bvhTexture = createDataTexture(flatBVHData, THREE.RGBAFormat, THREE.FloatType);
        let triangleTexture = createDataTexture(triData, THREE.RGBAFormat, THREE.FloatType);
        let normalTexture = createDataTexture(normalData, THREE.RGBAFormat, THREE.FloatType);
        let uvTexture = createDataTexture(uvData, THREE.RGBAFormat, THREE.FloatType);
        let materialTexture = createDataTexture(flatMaterialBuffer, THREE.RGBAFormat, THREE.FloatType);
        let materialInfoTexture = createDataTexture(valueList.flat(Infinity), THREE.RGBA, THREE.FloatType); // TODO can be byte type

        if(_pathTracingUniforms !== undefined ) {            
            _pathTracingUniforms["u_sampler2D_PreviousTexture"].value.dispose();
            _pathTracingUniforms["u_sampler2D_BVHData"].value.dispose();
            _pathTracingUniforms["u_sampler2D_TriangleData"].value.dispose();
            _pathTracingUniforms["u_sampler2D_NormalData"].value.dispose();
            _pathTracingUniforms["u_sampler2D_UVData"].value.dispose();
            _pathTracingUniforms["u_sampler2D_MaterialData"].value.dispose();
            _pathTracingUniforms["u_sampler2D_MaterialTexInfoData"].value.dispose();
            _pathTracingUniforms["u_samplerCube_EnvMap"].value.dispose();         
            if (modelHasUVs) {
                _pathTracingUniforms["u_sampler2D_TangentData"].value.dispose();
            }
        }

        _pathTracingUniforms = {
            u_sampler2D_PreviousTexture: { type: "t", value: _accumRenderTarget.texture },
            u_sampler2D_BVHData: { type: "t", value: bvhTexture },
            u_sampler2D_TriangleData: { type: "t", value: triangleTexture },
            u_sampler2D_NormalData: { type: "t", value: normalTexture },
            u_sampler2D_UVData: { type: "t", value: uvTexture },
            u_sampler2D_MaterialData: { type: "t", value: materialTexture },
            u_sampler2D_MaterialTexInfoData: { type: "t", value: materialInfoTexture },
            u_samplerCube_EnvMap: { type: "t", value: envMap },
            u_bool_hasTangents: { type: "b", value: false },

            u_vec2_InverseResolution: { type: "v2", value: new THREE.Vector2(1.0 / window.innerWidth, 1.0 / window.innerHeight) },
            u_int_NumTriangles: { type: "f", value: total_number_of_triangles },
            u_int_MaxTextureSize: { value: _gl.getParameter(_gl.MAX_TEXTURE_SIZE) },
            u_mat4_ViewMatrix: { type: "m4", value: new THREE.Matrix4() },
            u_vec3_CameraPosition: { type: "v3", value: new THREE.Vector3(0, -1, 0) },
            u_float_FocalLength: { type: "f", value: 0.1 },
            u_float_FilmHeight: { type: "f", value: 0.04 },
            u_int_FrameCount: { type: "f", value: 1.0 },
            u_int_DebugMode: { type: "i", value: 0 },
            u_bool_UseIBL: { type: "b", value: true },
            u_int_MaxBounceDepth: { value: 1 },
            u_bool_disableDirectShadows: { value: false }
        };

        bvhTexture.dispose();
        triangleTexture.dispose();
        normalTexture.dispose();
        uvTexture.dispose();
        materialTexture.dispose();
        materialInfoTexture.dispose();

        let tangentTexture;
        if (modelHasUVs) {
            tangentTexture = createDataTexture(tangentData, THREE.RGBAFormat, THREE.FloatType);
            _pathTracingUniforms["u_sampler2D_TangentData"] = { type: "t", value: tangentTexture };
            _pathTracingUniforms["u_bool_hasTangents"] = { value: true };
            tangentTexture.dispose();
        }

        // single pointlight as static define sufficient for now, need to reduce texture usage :/
        THREE.ShaderChunk['pathtracing_lights'] = ` `
        if (lightList.length > 0) {
            // lightTexture = createDataTexture(lightList, THREE.RGBAFormat, THREE.FloatType);
            // THREE.ShaderChunk[ 'pathtracing_lights' ] = `
            // #define HAS_LIGHTS 1
            // const uint LIGHT_SIZE = 2u;
            // uniform sampler2D u_sampler2D_LightData;
            // const int numLights = ${lightList.length};            
            //`
            //_pathTracingUniforms["u_sampler2D_LightData"] = {type: "t", value: lightTexture};

            let pos = lightList[0].position;
            let em = lightList[0].emission;
            THREE.ShaderChunk['pathtracing_lights'] = `
            #define HAS_LIGHTS 1
            const vec3 cPointLightPosition = vec3(${pos[0]}, ${pos[1]}, ${pos[2]});
            const vec3 cPointLightEmission = vec3(${em[0]}, ${em[1]}, ${em[2]});            
            `
        }

        // create texture arrays
        function getImageData(image) {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);

            return context.getImageData(0, 0, image.width, image.height);
        }

        let tex_array_shader_snippet = "";
        for (let i = 0; i < texArrayList.length; i++) {
            const texList = texArrayList[i];
            const texSize = texList[0].image.width * texList[0].image.height * 4;
            let data = new Uint8Array(texSize * texList.length);

            data.set(getImageData(texList[0].image).data);
            for (let t = 1; t < texList.length; t++) {
                data.set(getImageData(texList[t].image).data, texSize * t);
            }

            texArray = new THREE.DataTexture2DArray(data, texList[0].image.width, texList[0].image.height, texList.length);
            texArray.format = THREE.RGBAFormat;
            texArray.type = THREE.UnsignedByteType;
            texArray.wrapS = texArray.wrapT = THREE.RepeatWrapping;
            texArray.needsUpdate = true; //  if texture is already initialized.
            _pathTracingUniforms[`u_sampler2DArray_MaterialTextures_${i}`] = { value: texArray };
            texArray.dispose();

            tex_array_shader_snippet += `uniform sampler2DArray u_sampler2DArray_MaterialTextures_${i};\n`
        }

        tex_array_shader_snippet += "\n";
        tex_array_shader_snippet += "vec4 evaluateMaterialTextureValue(const in TexInfo texInfo, const in vec2 texCoord) { \n";

        for (let i = 0; i < texArrayList.length; i++) {
            tex_array_shader_snippet += `   if(texInfo.texArrayIdx == ${i}) {\n`
            tex_array_shader_snippet += `       vec2 tuv = texCoord * texInfo.texScale +  texInfo.texOffset;`
            tex_array_shader_snippet += `       return texture(u_sampler2DArray_MaterialTextures_${i}, vec3(tuv, texInfo.texIdx));\n`
            tex_array_shader_snippet += "   }\n";
        }

        //if (texArrayList.length === 0) {
            tex_array_shader_snippet += `       return vec4(1.0);\n`
        //}

        tex_array_shader_snippet += "}\n";

        THREE.ShaderChunk['pathtracing_tex_array_lookup'] = tex_array_shader_snippet;


        let pathTracingDefines = {
        };

        // load vertex and fragment shader files that are used in the pathTracing material, mesh and scene
        let vertexShader = await filePromiseLoader('./shader/pt.vert');
        let fragmentShader = await filePromiseLoader('./shader/pt.frag');

        THREE.ShaderChunk['pathtracing_rng'] = await filePromiseLoader('./shader/rng.glsl');
        THREE.ShaderChunk['pathtracing_utils'] = await filePromiseLoader('./shader/utils.glsl');
        THREE.ShaderChunk['pathtracing_material'] = await filePromiseLoader('./shader/material.glsl');
        THREE.ShaderChunk['pathtracing_dspbr'] = await filePromiseLoader('./shader/dspbr.glsl');
        THREE.ShaderChunk['pathtracing_rt_kernel'] = await filePromiseLoader('./shader/rt_kernel.glsl');

        let pathTracingMaterial = new THREE.RawShaderMaterial({
            uniforms: _pathTracingUniforms,
            defines: pathTracingDefines,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
            depthWrite: false
        });

        let pathTracingGeometry = new THREE.PlaneBufferGeometry(2, 2);
        if (_pathTracingMesh !== undefined) {
            _pathTracingMesh.material.dispose();
            _pathtracingScene.remove(_pathTracingMesh); //cleans up all chached uniform data
        }
        _pathTracingMesh = new THREE.Mesh(pathTracingGeometry, pathTracingMaterial);
        _pathtracingScene.add(_pathTracingMesh);

        pathTracingGeometry.dispose();
        pathTracingMaterial.dispose();

        _renderer.renderLists.dispose();
        console.timeEnd("BvhGeneration");

        _this.resetAccumulation();
    }

    function createDataTexture(data, format, type) {
        let maxTextureSize = _gl.getParameter(_gl.MAX_TEXTURE_SIZE);

        let num_components = 4;
        if (format === THREE.RGBFormat)
            num_components = 3;
        if (format === THREE.RGFormat)
            num_components = 2;

        let numRGBABlocks = (data.length / num_components) | 0;
        let sX = Math.min(numRGBABlocks, maxTextureSize);
        let sY = Math.max(1, ((numRGBABlocks + maxTextureSize - 1) / maxTextureSize) | 0);
        console.log("sX = " + sX + "; sY = " + sY);

        var paddedDataBuffer;
        if (type == THREE.FloatType)
            paddedDataBuffer = new Float32Array(sX * sY * num_components);
        else if (type == THREE.ByteType)
            paddedDataBuffer = new Int8Array(sX * sY * num_components);
        else if (type == THREE.UnsignedByteType)
            paddedDataBuffer = new UInt8Array(sX * sY * num_components);

        for (let i = 0; i < data.length; i++) {
            paddedDataBuffer[i] = data[i];
        }

        let tex = new THREE.DataTexture(paddedDataBuffer,
            sX,
            sY,
            format,
            type,
            THREE.Texture.DEFAULT_MAPPING,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter,
            1,
            THREE.LinearEncoding
        );

        tex.flipY = false;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;

        return tex;
    }

    var screenTextureShader = {

        uniforms: THREE.UniformsUtils.merge([
            {
                tex: { type: "t", value: null }
            }
        ]),

        vertexShader: [
            '#version 300 es',

            'precision highp float;',
            'precision highp int;',

            'void main()',
            '{',
            'gl_Position = vec4( position, 1.0 );',
            '}'

        ].join('\n'),

        fragmentShader: [
            '#version 300 es',

            'precision highp float;',
            'precision highp int;',
            'precision highp sampler2D;',

            'uniform sampler2D tex;',
            'out vec4 out_FragColor;',

            'void main()',
            '{',
            'out_FragColor = texelFetch(tex, ivec2(gl_FragCoord.xy), 0);',
            '}'

        ].join('\n')

    };

    var screenOutputShader = {

        uniforms: THREE.UniformsUtils.merge([
            {
                tex: { type: "t", value: null }
            }
        ]),

        vertexShader: [
            '#version 300 es',

            'precision highp float;',
            'precision highp int;',

            'void main()',
            '{',
            'gl_Position = vec4( position, 1.0 );',
            '}'
        ].join('\n'),

        fragmentShader: [
            '#version 300 es',

            'precision highp float;',
            'precision highp int;',
            'precision highp sampler2D;',

            'uniform sampler2D tex;',
            'out vec4 out_FragColor;',

            'void main()',
            '{',
            'vec3 pixelColor = texelFetch(tex, ivec2(gl_FragCoord.xy), 0).rgb;',
            '//pixelColor = ReinhardToneMapping(pixelColor);',
            '//pixelColor = Uncharted2ToneMapping(pixelColor);',
            '//pixelColor = OptimizedCineonToneMapping(pixelColor);',
            '//pixelColor = ACESFilmicToneMapping(pixelColor);',
            '//out_FragColor = vec4( pow(clamp(pixelColor, 0.0, 1.0), vec3(0.4545)), 1.0 );',
            'out_FragColor = clamp(vec4( pow(abs(pixelColor), vec3(0.4545)), 1.0 ), 0.0, 1.0);',
            '}'

        ].join('\n')

    };

    THREE.ShaderChunk['pathtracing_defines'] = `
        #define PI               3.14159265358979323
        #define TWO_PI           6.28318530717958648
        #define FOUR_PI          12.5663706143591729
        #define ONE_OVER_PI      0.31830988618379067
        #define ONE_OVER_TWO_PI  0.15915494309
        #define ONE_OVER_FOUR_PI 0.07957747154594767
        #define PI_OVER_TWO      1.57079632679489662
        #define ONE_OVER_THREE   0.33333333333333333
        #define E                2.71828182845904524
        #define INFINITY         1000000.0

        const float EPS_NORMAL = 0.001;
        const float EPS_COS = 0.001;
        const float EPSILON  = 1e-6;
       
        const float MINIMUM_ROUGHNESS = 0.001;
        const float TFAR_MAX = 100000.0;

        const uint MATERIAL_SIZE = 10u;
        const uint MATERIAL_TEX_INFO_SIZE = 5u;
        const uint TEX_INFO_SIZE = 2u;
    `;

    initRenderer();
}

export { PathtracingRenderer };