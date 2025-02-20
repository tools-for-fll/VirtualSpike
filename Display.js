// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import * as Editor from "./Editor.js";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { LDrawLoader2 } from "./LDrawLoader2.js";
import { LDrawUtils } from "three/addons/utils/LDrawUtils.js";
import { LDrawConditionalLineMaterial } from "three/addons/materials/LDrawConditionalLineMaterial.js";

import { AnaglyphEffect } from "three/addons/effects/AnaglyphEffect.js";

import { fileMap} from "./LDrawMap.js";

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
loadLEGOModel(modelFile, modelData, x, y, z, r, c = false)
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

function
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

function
updateProgressBar()
{
  $("#load_progress span")[0].innerText =
    'Loading...' + loaded + ' of ' + count;
}

export function
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
  if(true)
  {
    const environment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();
  }
  else
  {
    scene.add(new THREE.AmbientLight(0xffffff));
  }

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = 0.4 * Math.PI;

  const resizeObserver = new ResizeObserver(onContainerResize);
  resizeObserver.observe(container);

  const matImageWidth = 79.190210863472598;
  const matImageHeight = 45.177165354330709;

  var material, geometry, cube;

  material = new THREE.MeshBasicMaterial({color: 0x3f3f3f});
  geometry = new THREE.BoxGeometry(inchToLDU(93), inchToLDU(0.25),
                                   inchToLDU(45));
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, inchToLDU(0.125), 0);
  scene.add(cube);

  geometry = new THREE.BoxGeometry(inchToLDU((93 - matImageWidth) / 2),
                                   inchToLDU(0.25), inchToLDU(45));
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(inchToLDU((93 + matImageWidth) / 4), inchToLDU(0.375), 0);
  scene.add(cube);

  cube = new THREE.Mesh(geometry, material);
  cube.position.set(inchToLDU((93 + matImageWidth) / -4), inchToLDU(0.375), 0);
  scene.add(cube);

  material = new THREE.MeshBasicMaterial({color: 0x000000});
  geometry = new THREE.BoxGeometry(inchToLDU(96), inchToLDU(3), inchToLDU(1.5));
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, inchToLDU(1.5), inchToLDU(-23.25));
  scene.add(cube);

  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, inchToLDU(1.5), inchToLDU(23.25));
  scene.add(cube);

  geometry = new THREE.BoxGeometry(inchToLDU(1.5), inchToLDU(3), inchToLDU(48));
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(inchToLDU(-47.25), inchToLDU(1.5), 0);
  scene.add(cube);

  cube = new THREE.Mesh(geometry, material);
  cube.position.set(inchToLDU(47.25), inchToLDU(1.5), 0);
  scene.add(cube);

  new THREE.ImageLoader().load('models/2025/mat.jpg',
                               function (image)
                               {
                                 const texture = new THREE.CanvasTexture(image);
                                 texture.colorSpace = THREE.SRGBColorSpace;
                                 const material = new THREE.MeshBasicMaterial({map: texture});
                                 const geometry = new THREE.BoxGeometry(inchToLDU(matImageWidth), 0, inchToLDU(matImageHeight));
                                 const cube = new THREE.Mesh(geometry, material);
                                 cube.position.set(0, inchToLDU(0.5), 0);
                                 scene.add(cube);
                               });

  lDrawLoader = new LDrawLoader2();
  lDrawLoader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
  lDrawLoader.smoothNormals = true;
  lDrawLoader.setPartsLibraryPath("ldraw/");
  lDrawLoader.preloadMaterials("ldraw/LDConfig.ldr");
  lDrawLoader.setFileMap(fileMap);

  showProgressBar();

    // Mission 1 & 4
if(true)
{
  loadLEGOModel('models/2025/CoralNursery.ldr', null, inchToLDU(-36.1),
                  inchToLDU(0.125), inchToLDU(-7.45), 0);
}

  // Mission 2
if(true)
{
  loadLEGOModel('models/2025/Shark.ldr', null, inchToLDU(-35.6), 0,
                inchToLDU(-18.1), toRadians(90));
}

  // Mission 3
if(true)
{
  loadLEGOModel('models/2025/CoralReef.ldr', null, inchToLDU(-18.86), 0,
                inchToLDU(-18.98), 0);
  loadLEGOModel('models/2025/Coral1.ldr', null, inchToLDU(27.28), 0,
                inchToLDU(-5.04), toRadians(Math.random() * 360));
  if(Math.random() < 0.5)
  {
    loadLEGOModel('models/2025/Coral2.ldr', null, inchToLDU(-22.6), 0,
                  inchToLDU(0.9), toRadians(Math.random() * 360));
    loadLEGOModel('models/2025/Coral3.ldr', null, inchToLDU(-26.5), 0,
                  inchToLDU(-5.04), toRadians(Math.random() * 360));
  }
  else
  {
    loadLEGOModel('models/2025/Coral3.ldr', null, inchToLDU(-22.6), 0,
                  inchToLDU(0.9), toRadians(Math.random() * 360));
    loadLEGOModel('models/2025/Coral2.ldr', null, inchToLDU(-26.5), 0,
                  inchToLDU(-5.04), toRadians(Math.random() * 360));
  }
}

  // Mission 5
if(true)
{
  loadLEGOModel('models/2025/WreckFront.ldr', null, inchToLDU(-5), 0,
                inchToLDU(-1.5), toRadians(310));
}

  // Mission 6 & 7
if(true)
{
  loadLEGOModel('models/2025/WreckBack.ldr', null, inchToLDU(-10),
                inchToLDU(-0.95), inchToLDU(-2.4), 0);
}

  // Mission 8
if(true)
{
  loadLEGOModel('models/2025/ArtificialHabitat.ldr', null, inchToLDU(5.12), 0,
                inchToLDU(14.45), toRadians(180));
}

  // Mission 9
if(true)
{
  loadLEGOModel('models/2025/UnknownCreature.ldr', null, inchToLDU(14.33), 0,
                inchToLDU(-2.283), toRadians(225));
}

  // Mission 10
if(true)
{
  loadLEGOModel('models/2025/Submarine.ldr', null, inchToLDU(-1.855),
                inchToLDU(0.125), inchToLDU(-24.05), toRadians(45));
}

  // Mission 11
if(true)
{
  loadLEGOModel('models/2025/Sonar.ldr', null, inchToLDU(17.72), 0,
                inchToLDU(-18), toRadians(270));
}

  // Mission 12
if(true)
{
  loadLEGOModel('models/2025/Whale.ldr', null, inchToLDU(36.6),
                inchToLDU(0.125), inchToLDU(-19), toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', null, inchToLDU(30.51), 0,
                inchToLDU(-12.91),
                (Math.random() < 0.5) ? toRadians(45) : toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', null, inchToLDU(23.9), 0,
                inchToLDU(-9.96),
                (Math.random() < 0.5) ? toRadians(135) : toRadians(315));
  loadLEGOModel('models/2025/Krill.ldr', null, inchToLDU(23.54), 0,
                inchToLDU(0.9),
                (Math.random() < 0.5) ? toRadians(45) : toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', null, inchToLDU(-8.07), 0,
                inchToLDU(0.83),
                (Math.random() < 0.5) ? toRadians(45) : toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', null, inchToLDU(-23.23), 0,
                inchToLDU(-9.84),
                (Math.random() < 0.5) ? toRadians(90) : toRadians(270));
}

  // Mission 13
if(true)
{
  loadLEGOModel('models/2025/ChangeShippingLanes.ldr', null, inchToLDU(33.19),
                0, inchToLDU(-5.04), toRadians(225));
}

  // Mission 14
if(true)
{
  loadLEGOModel('models/2025/WaterSample.ldr', null, inchToLDU(-19.6),
                inchToLDU(0.125), inchToLDU(-6.93), 0);
  loadLEGOModel('models/2025/SeaBedSample.ldr', null, inchToLDU(-4.17), 0,
                inchToLDU(-20.2), 0);
  loadLEGOModel('models/2025/PlanktonSample.ldr', null, inchToLDU(37.48), 0,
                inchToLDU(-10.55), toRadians(90));
}

  // Mission 15
if(true)
{
  loadLEGOModel('models/2025/WestDock.ldr', null, inchToLDU(-17.2), 0,
                inchToLDU(19.72), 0);
  loadLEGOModel('models/2025/Ship.ldr', null, inchToLDU(-14.32),
                inchToLDU(-0.03125), inchToLDU(19.57), 0);
  loadLEGOModel('models/2025/EastDock.ldr', null, inchToLDU(17.87), 0,
                inchToLDU(19.76), toRadians(180));
}

  // Precision tokens
if(true)
{
  loadLEGOModel('models/2025/Precision.ldr', null, inchToLDU(-3.75),
                inchToLDU(2.5), inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', null, inchToLDU(-2.25),
                inchToLDU(2.5), inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', null, inchToLDU(-0.75),
                inchToLDU(2.5), inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', null, inchToLDU(0.75),
                inchToLDU(2.5), inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', null, inchToLDU(2.25),
                inchToLDU(2.5), inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', null, inchToLDU(3.75),
                inchToLDU(2.5), inchToLDU(23.25), Math.random() * 360);
}

  // Robot
if(true)
{
  loadRobot(Editor.robotModel());
}

if(count == 0)
{
  hideProgressBar();
}
else
{
  updateProgressBar();
}
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
    loadLEGOModel("models/Default.ldr", null, robotX, 0, robotY, robotR, true);
  }
  else
  {
    robotName = name;
    loadLEGOModel(null, text, robotX, 0, robotY, robotR, true);
  }
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

  if(cameraMode == 1)
  {
    var cx = robotX + (birdD * Math.cos(toRadians(180 - robotR)));
    var cy = robotY + (birdD * Math.sin(toRadians(180 - robotR)));

    controls.reset();
    camera.position.set(cx, inchToLDU(18), cy);
    camera.lookAt(robotX, 0, robotY);

    camera.updateProjectionMatrix();
  }

  if(cameraMode == 2)
  {
    var cx = robotX + (eyeX * Math.cos(toRadians(180 - robotR)));
    var cy = robotY + (eyeX * Math.sin(toRadians(180 - robotR)));
    var lx = robotX - (eyeD * Math.cos(toRadians(180 - robotR)));
    var ly = robotY - (eyeD * Math.sin(toRadians(180 - robotR)));

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