// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { LDrawLoader2 } from './LDrawLoader2.js';
import { LDrawUtils } from 'three/addons/utils/LDrawUtils.js';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';

import { AnaglyphEffect } from 'three/addons/effects/AnaglyphEffect.js';

let container;

let camera, scene, renderer, effect, controls;

let lDrawLoader;

let count = 0, loaded = 0;

let cameraMode = 0;

let view3D = false;

let birdD = inchToLDU(18);

let eyeX = inchToLDU(3);

let eyeY = inchToLDU(5);

let eyeD = inchToLDU(18);

let robot = null, robotX, robotY, robotR;

let stepFn;

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
loadLEGOModel(model, x, y, z, r, c = false)
{
  count++;
  lDrawLoader.load(model, function (group)
                          {
                            group = LDrawUtils.mergeObject(group);

                            group.position.x = x;
                            group.position.y = y + inchToLDU(0.5);
                            group.position.z = z;
                            group.rotation.x = Math.PI;
                            group.rotation.y = r;

                            group.scale.x = 0.1;
                            group.scale.y = 0.1;
                            group.scale.z = 0.1;

                            scene.add(group);

                            if(c)
                            {
                              robot = group;
                            }

                            loaded++;
                            updateProgressBar();
                            if(loaded == count)
                            {
                              hideProgressBar();
                            }
                          });
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
  if(robot != null)
  {
    stepFn();
  }

  if((robot == null) || (cameraMode == 0))
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
}

function
hideProgressBar()
{
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

  showProgressBar();

    // Mission 1 & 4
if(true)
{
  loadLEGOModel('models/2025/CoralNursery.ldr', inchToLDU(-36.1),
                  inchToLDU(0.125), inchToLDU(-7.45), 0);
}

  // Mission 2
if(true)
{
  loadLEGOModel('models/2025/Shark.ldr', inchToLDU(-35.6), 0, inchToLDU(-18.1),
                toRadians(90));
}

  // Mission 3
if(true)
{
  loadLEGOModel('models/2025/CoralReef.ldr', inchToLDU(-18.86), 0,
                inchToLDU(-18.98), 0);
  loadLEGOModel('models/2025/Coral1.ldr', inchToLDU(27.28), 0, inchToLDU(-5.04),
                toRadians(Math.random() * 360));
  if(Math.random() < 0.5)
  {
    loadLEGOModel('models/2025/Coral2.ldr', inchToLDU(-22.6), 0, inchToLDU(0.9),
                  toRadians(Math.random() * 360));
    loadLEGOModel('models/2025/Coral3.ldr', inchToLDU(-26.5), 0,
                  inchToLDU(-5.04), toRadians(Math.random() * 360));
  }
  else
  {
    loadLEGOModel('models/2025/Coral3.ldr', inchToLDU(-22.6), 0, inchToLDU(0.9),
                  toRadians(Math.random() * 360));
    loadLEGOModel('models/2025/Coral2.ldr', inchToLDU(-26.5), 0,
                  inchToLDU(-5.04), toRadians(Math.random() * 360));
  }
}

  // Mission 5
if(true)
{
  loadLEGOModel('models/2025/WreckFront.ldr', inchToLDU(-5), 0, inchToLDU(-1.5),
                toRadians(310));
}

  // Mission 6 & 7
if(true)
{
  loadLEGOModel('models/2025/WreckBack.ldr', inchToLDU(-10), inchToLDU(-0.95),
                inchToLDU(-2.4), 0);
}

  // Mission 8
if(true)
{
  loadLEGOModel('models/2025/ArtificialHabitat.ldr', inchToLDU(5.12), 0,
                inchToLDU(14.45), toRadians(180));
}

  // Mission 9
if(true)
{
  loadLEGOModel('models/2025/UnknownCreature.ldr', inchToLDU(14.33), 0,
                inchToLDU(-2.283), toRadians(225));
}

  // Mission 10
if(true)
{
  loadLEGOModel('models/2025/Submarine.ldr', inchToLDU(-1.855),
                inchToLDU(0.125), inchToLDU(-24.05), toRadians(45));
}

  // Mission 11
if(true)
{
  loadLEGOModel('models/2025/Sonar.ldr', inchToLDU(17.72), 0, inchToLDU(-18),
                toRadians(270));
}

  // Mission 12
if(true)
{
  loadLEGOModel('models/2025/Whale.ldr', inchToLDU(36.6), inchToLDU(0.125),
                inchToLDU(-19), toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', inchToLDU(30.51), 0, inchToLDU(-12.91),
                (Math.random() < 0.5) ? toRadians(45) : toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', inchToLDU(23.9), 0, inchToLDU(-9.96),
                (Math.random() < 0.5) ? toRadians(135) : toRadians(315));
  loadLEGOModel('models/2025/Krill.ldr', inchToLDU(23.54), 0, inchToLDU(0.9),
                (Math.random() < 0.5) ? toRadians(45) : toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', inchToLDU(-8.07), 0, inchToLDU(0.83),
                (Math.random() < 0.5) ? toRadians(45) : toRadians(225));
  loadLEGOModel('models/2025/Krill.ldr', inchToLDU(-23.23), 0, inchToLDU(-9.84),
                (Math.random() < 0.5) ? toRadians(90) : toRadians(270));
}

  // Mission 13
if(true)
{
  loadLEGOModel('models/2025/ChangeShippingLanes.ldr', inchToLDU(33.19), 0,
                inchToLDU(-5.04), toRadians(225));
}

  // Mission 14
if(true)
{
  loadLEGOModel('models/2025/WaterSample.ldr', inchToLDU(-19.6),
                inchToLDU(0.125), inchToLDU(-6.93), 0);
  loadLEGOModel('models/2025/SeaBedSample.ldr', inchToLDU(-4.17), 0,
                inchToLDU(-20.2), 0);
  loadLEGOModel('models/2025/PlanktonSample.ldr', inchToLDU(37.48), 0,
                inchToLDU(-10.55), toRadians(90));
}

  // Mission 15
if(true)
{
  loadLEGOModel('models/2025/WestDock.ldr', inchToLDU(-17.2), 0,
                inchToLDU(19.72), 0);
  loadLEGOModel('models/2025/Ship.ldr', inchToLDU(-14.32), inchToLDU(-0.03125),
                inchToLDU(19.57), 0);
  loadLEGOModel('models/2025/EastDock.ldr', inchToLDU(17.87), 0,
                inchToLDU(19.76), toRadians(180));
}

  // Precision tokens
if(true)
{
  loadLEGOModel('models/2025/Precision.ldr', inchToLDU(-3.75), inchToLDU(2.5),
                inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', inchToLDU(-2.25), inchToLDU(2.5),
                inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', inchToLDU(-0.75), inchToLDU(2.5),
                inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', inchToLDU(0.75), inchToLDU(2.5),
                inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', inchToLDU(2.25), inchToLDU(2.5),
                inchToLDU(23.25), Math.random() * 360);
  loadLEGOModel('models/2025/Precision.ldr', inchToLDU(3.75), inchToLDU(2.5),
                inchToLDU(23.25), Math.random() * 360);
}

  // Robot
çif(true)
{
  loadLEGOModel('models/SpikeRobot.ldr', robotX, 0, robotY, robotR, true);
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
  robotX = inchToLDU(x);
  robotY = inchToLDU(y);
  robotR = r;

  if(robot != null)
  {
    robot.position.x = robotX;
    robot.position.z = robotY;
    robot.rotation.y = toRadians(robotR);
  }

  if(cameraMode == 1)
  {
    var cx = robotX + (birdD * Math.sin(toRadians(-robotR)));
    var cy = robotY + (birdD * Math.cos(toRadians(-robotR)));

    controls.reset();
    camera.position.set(cx, inchToLDU(18), cy);
    camera.lookAt(robotX, 0, robotY);

    camera.updateProjectionMatrix();
  }

  if(cameraMode == 2)
  {
    var cx = robotX + (eyeX * Math.sin(toRadians(-robotR)));
    var cy = robotY + (eyeX * Math.cos(toRadians(-robotR)));
    var lx = robotX - (eyeD * Math.sin(toRadians(-robotR)));
    var ly = robotY - (eyeD * Math.cos(toRadians(-robotR)));

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
