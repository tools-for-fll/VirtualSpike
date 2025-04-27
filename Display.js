// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import * as Config from "./Config.js";
import * as Editor from "./Editor.js";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { LDrawLoader2 } from "./LDrawLoader2.js";
import { LDrawUtils } from "three/addons/utils/LDrawUtils.js";
import { LDrawConditionalLineMaterial } from "three/addons/materials/LDrawConditionalLineMaterial.js";

import { AnaglyphEffect } from "three/addons/effects/AnaglyphEffect.js";

import { fileMap } from "./LDrawMap.js";

let container = null;

let camera = null;

let scene = null;

let renderer = null;

let effect = null;

let controls = null;

let lDrawLoader = null;

let loadQueue = [];

let count = 0;

let loaded = 0;

let cameraMode = 0;

let cameraR = undefined;

let view3D = false;

let birdD = inchToLDU(18);

let eyeX = inchToLDU(3);

let eyeY = inchToLDU(5);

let eyeD = inchToLDU(18);

let robotName = null;

let robot = null;

let robotX = 0;

let robotY = 0;

let robotR = 0;

let stepFn = null;

function
toRadians(angle)
{
  return((angle * Math.PI) / 180);
}

function
inchToLDU(inch)
{
  return((inch * 0.0254) / 0.004);
}

function
lduToInch(ldu)
{
  return((ldu * 0.004) / 0.0254);
}

function
loadLEGOModel(modelFile, modelData, x, y, z, r, rz = undefined, c = false)
{
  let item;

  function
  loadNext()
  {
    item = loadQueue.shift();
    if(item.modelFile !== null)
    {
      lDrawLoader.load(item.modelFile, loadDone);
    }
    else
    {
      lDrawLoader.parse(item.modelData, loadDone);
    }
  }

  function
  loadDone(group)
  {
    group = LDrawUtils.mergeObject(group);

    group.position.x = item.x;
    group.position.y = item.y + inchToLDU(0.5);
    group.position.z = item.z;
    group.rotation.x = Math.PI;
    group.rotation.y = item.r;

    if(item.rz !== undefined)
    {
      group.rotation.z = item.rz;
    }

    group.scale.x = 0.1;
    group.scale.y = 0.1;
    group.scale.z = 0.1;

    scene.add(group);

    if(item.c)
    {
      robot = group;
    }

    loaded++;
    updateProgressBar();
    if(loaded == count)
    {
      let map = lDrawLoader.getFileMap();
      let keys = Reflect.ownKeys(map);

      if(keys.length != 1)
      {
        keys.sort();

        let string = "";

        for(let i = 0; i < keys.length; i++)
        {
          if(keys[i] !== "length")
          {
            string += "fileMap[\"" + keys[i] + "\"] = \"" + map[keys[i]] +
                      "\";\n";
          }
        }

        console.log(string);
      }

      hideProgressBar();
    }
    else
    {
      loadNext();
    }
  }

  count++;

  loadQueue.push({
                   modelFile: modelFile,
                   modelData: modelData,
                   x: x,
                   y: y,
                   z: z,
                   r: r,
                   rz: rz,
                   c: c
                 });

  if(count == 1)
  {
    loadNext();
  }
}

function
onContainerResize(entries)
{
  var width = entries[0].contentBoxSize[0].inlineSize;
  var height = entries[0].contentBoxSize[0].blockSize;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  effect.setSize(width, height);
  renderer.setSize(width, height);
}

function
animate()
{
  if((robot !== null) && (stepFn !== null))
  {
    stepFn();
  }

  if((robot === null) || (cameraMode === 0))
  {
    controls.update();
  }

  render();
}

function
render()
{
  if(view3D)
  {
    effect.render(scene, camera);
  }
  else
  {
    renderer.render(scene, camera);
  }
}

export function
showProgressBar()
{
  $("#load_progress span")[0].innerText = 'Loading...';
  $("#load_progress")[0].showModal();
  $("window").trigger("resize");
  //console.log("Start: " + Date.now());
}

function
hideProgressBar()
{
  //console.log("End: " + Date.now());
  $("#load_progress")[0].close();
}

export function
updateProgressBar()
{
  $("#load_progress span")[0].innerText =
    'Loading...' + loaded + ' of ' + count;
}

export async function
loadField(name)
{
  let material, geometry, cube;

  let loader = new THREE.FileLoader();
  const text = await loader.loadAsync(`models/${name}/field.json`);
  const json = JSON.parse(text);

  count = 0;
  loaded = 0;

  for(let idx = scene.children.length - 1; idx >= 0; idx--)
  {
    scene.remove(scene.children[idx]);
  }

  if(json.mat !== undefined)
  {
    let matImageWidth = json.mat.width;
    let matImageHeight = json.mat.height;

    material = new THREE.MeshBasicMaterial({color: 0x3f3f3f});
    geometry = new THREE.BoxGeometry(inchToLDU(93), inchToLDU(0.25),
                                     inchToLDU(45));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, inchToLDU(0.125), 0);
    scene.add(cube);

    geometry = new THREE.BoxGeometry(inchToLDU((93 - matImageWidth) / 2),
                                     inchToLDU(0.25), inchToLDU(45));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(inchToLDU((93 + matImageWidth) / 4), inchToLDU(0.375),
                      0);
    scene.add(cube);

    cube = new THREE.Mesh(geometry, material);
    cube.position.set(inchToLDU((93 + matImageWidth) / -4), inchToLDU(0.375),
                      0);
    scene.add(cube);

    material = new THREE.MeshBasicMaterial({color: 0x000000});
    geometry = new THREE.BoxGeometry(inchToLDU(96), inchToLDU(3),
                                     inchToLDU(1.5));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, inchToLDU(1.5), inchToLDU(-23.25));
    scene.add(cube);

    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, inchToLDU(1.5), inchToLDU(23.25));
    scene.add(cube);

    geometry = new THREE.BoxGeometry(inchToLDU(1.5), inchToLDU(3),
                                     inchToLDU(48));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(inchToLDU(-47.25), inchToLDU(1.5), 0);
    scene.add(cube);

    cube = new THREE.Mesh(geometry, material);
    cube.position.set(inchToLDU(47.25), inchToLDU(1.5), 0);
    scene.add(cube);

    function
    loaded(image)
    {
      const texture = new THREE.CanvasTexture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({map: texture});
      const geometry = new THREE.BoxGeometry(inchToLDU(matImageWidth), 0,
                                             inchToLDU(matImageHeight));
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, inchToLDU(0.5), 0);
      scene.add(cube);
    }

    new THREE.ImageLoader().load(`models/${name}/${json.mat.filename}`,
                                 loaded);
  }
  else
  {
    material = new THREE.MeshBasicMaterial({color: 0x3f3f3f});
    geometry = new THREE.BoxGeometry(inchToLDU(93), inchToLDU(0.5),
                                     inchToLDU(45));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, inchToLDU(0.25), 0);
    scene.add(cube);

    material = new THREE.MeshBasicMaterial({color: 0x000000});
    geometry = new THREE.BoxGeometry(inchToLDU(96), inchToLDU(3),
                                     inchToLDU(1.5));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, inchToLDU(1.5), inchToLDU(-23.25));
    scene.add(cube);

    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, inchToLDU(1.5), inchToLDU(23.25));
    scene.add(cube);

    geometry = new THREE.BoxGeometry(inchToLDU(1.5), inchToLDU(3),
                                     inchToLDU(48));
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(inchToLDU(-47.25), inchToLDU(1.5), 0);
    scene.add(cube);

    cube = new THREE.Mesh(geometry, material);
    cube.position.set(inchToLDU(47.25), inchToLDU(1.5), 0);
    scene.add(cube);
  }

  if(json.models !== undefined)
  {
    for(let idx = 0; idx < json.models.length; idx++)
    {
      let model = json.models[idx];

      if(model.skip === true)
      {
        continue;
      }

      let x = inchToLDU(model.x);
      let y = inchToLDU(model.y);
      let z = inchToLDU(model.z);
      let r;
      let rz = undefined;

      if(Array.isArray(model.r))
      {
        r = Math.floor(Math.random() * model.r.length);
        r = toRadians(model.r[r]);
      }
      else if(model.r === "random")
      {
        r = toRadians(Math.floor(Math.random() * 360));
      }
      else
      {
        r = toRadians(model.r);
      }

      if(model.rz !== undefined)
      {
        rz = toRadians(model.rz);
      }

      loadLEGOModel(`models/${name}/${model.filename}`, null, x, y, z, r, rz);
    }
  }
}

export async function
init()
{
  container = $("#field")[0];

  var width = container.clientWidth;
  var height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.position.set(0, 300, 300);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animate);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  effect = new AnaglyphEffect(renderer);
  effect.setSize(width, height);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x808080);
  const environment = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(environment).texture;
  environment.dispose();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = 0.4 * Math.PI;

  const resizeObserver = new ResizeObserver(onContainerResize);
  resizeObserver.observe(container);

  lDrawLoader = new LDrawLoader2();
  lDrawLoader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
  lDrawLoader.smoothNormals = true;
  lDrawLoader.setPartsLibraryPath("ldraw/");
  lDrawLoader.preloadMaterials("ldraw/LDConfig.ldr");
  lDrawLoader.setFileMap(fileMap);

  showProgressBar();

  await loadField(Config.getSeason());

  loadRobot(Editor.robotModel());

  updateProgressBar();
}

export function
loadRobot(name)
{
  if(robotName === name)
  {
    return;
  }

  if(scene === null)
  {
    return;
  }

  if(robot !== null)
  {
    scene.remove(robot);
    robot = null;
  }

  if(count === loaded)
  {
    count = 0;
    loaded = 0;
  }

  let text = window.localStorage.getItem(`robot/${name}`);
  if(text === null)
  {
    robotName = "Default";
    loadLEGOModel("models/Default.ldr", null, robotX, 0, robotY, robotR,
                  undefined, true);
  }
  else
  {
    robotName = name;
    loadLEGOModel(null, text, robotX, 0, robotY, robotR, undefined, true);
  }
}

export function
reloadRobot(name)
{
  robotName = null;
  loadRobot(name);
}

export function
deleteRobot(name)
{
  if(robotName === name)
  {
    loadRobot("Default");
  }
}

export function
setStepFunction(step)
{
  stepFn = step;
}

export function
setView2D()
{
  view3D = false;
}

export function
setView3D()
{
  view3D = true;
}

export function
setCameraPerspective()
{
  cameraMode = 0;
  controls.reset();
  camera.position.set(0, 350, 350);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

export function
setCameraOverhead()
{
  cameraMode = 0;
  controls.reset();
  camera.position.set(0, 450, 0);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

export function
setCameraBirdsEye()
{
  cameraMode = 1;
}

export function
setCameraRobot()
{
  cameraMode = 2;
}

export function
setRobotPosition(x, y, r)
{
  x = x - 46.5;
  y = 22.5 - y;

  robotX = inchToLDU(x);
  robotY = inchToLDU(y);
  robotR = r;

  if(robot != null)
  {
    robot.position.x = robotX;
    robot.position.z = robotY;
    robot.rotation.y = toRadians(90 - robotR);
  }

  if((cameraMode == 1) || (cameraMode == 2))
  {
    if((cameraR == undefined) || (Math.abs(cameraR - (180 - robotR)) > 1))
    {
      cameraR = 180 - robotR;
    }
  }

  if(cameraMode == 1)
  {
    var cx = robotX + (birdD * Math.cos(toRadians(cameraR)));
    var cy = robotY + (birdD * Math.sin(toRadians(cameraR)));

    controls.reset();
    camera.position.set(cx, inchToLDU(18), cy);
    camera.lookAt(robotX, 0, robotY);

    camera.updateProjectionMatrix();
  }

  if(cameraMode == 2)
  {
    var cx = robotX + (eyeX * Math.cos(toRadians(cameraR)));
    var cy = robotY + (eyeX * Math.sin(toRadians(cameraR)));
    var lx = robotX - (eyeD * Math.cos(toRadians(cameraR)));
    var ly = robotY - (eyeD * Math.sin(toRadians(cameraR)));

    controls.reset();
    camera.position.set(cx, eyeY, cy);
    camera.lookAt(lx, 0, ly);

    camera.updateProjectionMatrix();
  }
}

export function
setBirdsEyePosition(d)
{
  birdD = inchToLDU(d);
}

export function
setRobotEyePosition(x, y, d)
{
  eyeX = inchToLDU(x);
  eyeY = inchToLDU(y);
  eyeD = inchToLDU(d);
}