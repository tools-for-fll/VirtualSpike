// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import "./jquery.js";
import * as Config from "./Config.js";
import * as Display from "./Display.js";
import * as Editor from "./Editor.js";
import * as dialog from "./dialog.js";
import * as sim from "./sim.js";
import * as hubs from "./pybricks/hubs.js";
import * as parameters from "./pybricks/parameters.js";
import * as pupdevices from "./pybricks/pupdevices.js";
import * as robotics from "./pybricks/robotics.js";
import * as tools from "./pybricks/tools.js";
import * as umath from "./micropython/umath.js";

let deviceType = [];
let deviceView = [];

let hsizerDown = false;
let hRatio = 0.75;
let vsizerDown = false;
let vRatio = 0.5;
let vRatioSave = undefined;

let interp = null;

let execution = null;

let context = null;

const scope =
{
  __name__: "__main__",
  print: consolePrint,
  range: range,
  simDone: simDone
};

$(init);

function
init()
{
  $("#btn_import").on("click", btnImport);
  $("#btn_export").on("click", btnExport);
  $("#btn_playpause").on("click", btnPlayPause);
  $("#btn_reset").on("click", btnReset);
  $("#btn_random").on("click", btnRandom);
  $("#btn_overhead").on("click", Display.setCameraOverhead);
  $("#btn_perspective").on("click", Display.setCameraPerspective);
  $("#btn_follow").on("click", Display.setCameraBirdsEye);
  $("#btn_robot").on("click", Display.setCameraRobot);
  $("#btn_2d").on("click", Display.setView2D);
  $("#btn_3d").on("click", Display.setView3D);
  $("#btn_showcode").on("click", btnShowCode);
  $("#btn_config").on("click", btnConfig);
  $("#btn_fullscreen").on("click", btnFullscreen);
  $("#btn_about").on("click", btnAbout);

  $(".frame #vsizer").on("mousedown", onMouseDownVsizer);
  $(".frame #hsizer").on("mousedown", onMouseDownHsizer);
  $(document).on("mousemove", onMouseMove);
  $(document).on("mouseup", onMouseUp);
  $(document).on("click", onMouseUp);

  $(".porta").on("click", () => btnPortView(parameters.Port.A));
  $(".portb").on("click", () => btnPortView(parameters.Port.B));
  $(".portc").on("click", () => btnPortView(parameters.Port.C));
  $(".portd").on("click", () => btnPortView(parameters.Port.D));
  $(".porte").on("click", () => btnPortView(parameters.Port.E));
  $(".portf").on("click", () => btnPortView(parameters.Port.F));

  Config.init();

  Editor.init();
  Editor.robotReset(btnReset);

  btnReset();

  Display.setStepFunction(step);
  Display.init();
  Display.setCameraOverhead();

  interp = window.jspython.jsPython();

  const availablePackages =
  {
    "pybricks.hubs": hubs,
    "pybricks.parameters": parameters,
    "pybricks.pupdevices": pupdevices,
    "pybricks.robotics": robotics,
    "pybricks.tools": tools,
    umath
  };
  interp.registerPackagesLoader((packageName) =>
                                {
                                  return(availablePackages[packageName]);
                                });

  $(window).on("blur", onBlur);
  $(window).on("focus", onFocus);
  $(document).on("keydown", onKeyDown);
  $(window).on("resize", onResize);

  $(window).on(Display.CollisionWallStart, onCollisionWallStart);
  $(window).on(Display.CollisionWallEnd, onCollisionWallEnd);
  $(window).on(Display.CollisionModelStart, onCollisionModelStart);
  $(window).on(Display.CollisionModelEnd, onCollisionModelEnd);
  $(window).on(Display.CollisionGamePieceStart, onCollisionGamePieceStart);
  $(window).on(Display.CollisionGamePieceEnd, onCollisionGamePieceEnd);

  onResize();
}

/**
 * Updates the state of the robot based on execution of the robot script.
 */
function
step()
{
  // Update the state of the robot simulator.
  sim.step();

  // Update the gyro sensor in the status line.
  if(hubs._hub !== null)
  {
    let html = hubs._hub.imu.heading().toFixed(0) + " &deg;";
    $("#status .gyro span:eq(1)").html(html);
  }

  // Loop through the ports.
  for(let port = parameters.Port.A; port <= parameters.Port.F; port++)
  {
    let classId = ".port" + ("abcdef".substring(port, port + 1));
    let portName = "ABCDEF".substring(port, port + 1);
    let type = deviceType[port];
    let html;

    // See if the device type on this port has changed.
    if(pupdevices.deviceType[port] != type)
    {
      let img;

      // Update the device type for this port.
      type = deviceType[port] = pupdevices.deviceType[port];

      // Reset the device view for this port.
      deviceView[port] = 0;

      // Get the device image based on the device type.
      if(type === pupdevices.DeviceType.ColorSensor)
      {
        img = "images/ColorSensor.png";
      }
      else if(type === pupdevices.DeviceType.ForceSensor)
      {
        img = "images/ForceSensor.png";
      }
      else if(type === pupdevices.DeviceType.Motor)
      {
        img = "images/Motor.png";
      }
      else if(type === pupdevices.DeviceType.UltrasonicSensor)
      {
        img = "images/UltrasonicSensor.png";
      }
      else
      {
        img = "";
      }

      // Update the device display on the status line.
      if(img === "")
      {
        $(classId).html("<span>" + portName + ":");
      }
      else
      {
        $(classId).html("<span>" + portName + ":</span><img src='" + img +
                        "' /><span></span>");
      }
    }

    // See if this port has a color sensor attached.
    if(type === pupdevices.DeviceType.ColorSensor)
    {
      // Get the updated value of the color sensor, based on the display mode.
      if(deviceView[port] === 0)
      {
        html = pupdevices.devicesUsed[port].reflection() + " rfl";
      }
      else if(deviceView[port] === 1)
      {
        html = pupdevices.devicesUsed[port].ambient() + " amb";
      }
      else
      {
        let hsv = pupdevices.devicesUsed[port].hsv(true);
        html = hsv[0] + "," + hsv[1] + "," + hsv[2];
      }

      // Update the color sensor value for this port on the status line.
      $(classId + " span:eq(1)").html(html);
    }

    // Otherwise, see if this is a force sensor.
    else if(type === pupdevices.DeviceType.ForceSensor)
    {
      // Get the updated value of the force sensor, based on the display mode.
      if(deviceView[port] === 0)
      {
        html = pupdevices.devicesUsed[port].force() + " N";
      }
      else if(deviceView[port] === 1)
      {
        html = pupdevices.devicesUsed[port].distance() + " mm";
      }
      else if(deviceView[port] === 2)
      {
        html = (pupdevices.devicesUsed[port].pressed() ? "true" : "false") +
               " p";
      }
      else
      {
        html = (pupdevices.devicesUsed[port].touched() ? "true" : "false") +
               " t";
      }

      // Update the force sensor value for this port on the status line.
      $(classId + " span:eq(1)").html(html);
    }

    // Otherwise, see if this is a motor.
    else if(type === pupdevices.DeviceType.Motor)
    {
      // Get the updated value of the motor, based on the display mode.
      if(deviceView[port] === 0)
      {
        html = pupdevices.devicesUsed[port].angle().toFixed(0) + " &deg;";
      }
      else
      {
        html = (pupdevices.devicesUsed[port].angle() / 360.0).toFixed(3);
      }

      // Update the motor value for this port on the status line.
      $(classId + " span:eq(1)").html(html);
    }

    // Otherwise, see if this is an ultrasonic sensor.
    else if(type === pupdevices.DeviceType.UltrasonicSensor)
    {
      // Get the updated value of the ultrasonic sensor, based on the display
      // mode.
      html = pupdevices.devicesUsed[port].distance() + " mm";

      // Update the motor value for this port on the status line.
      $(classId + " span:eq(1)").html(html);
    }
  }
}

function
consolePrint(...args)
{
  const output = $("#console #output");

  let string = "";
  for(let i = 0; i < args.length; i++)
  {
    string += " " + args[i];
  }
  string += "<br>";

  output.append(string);

  output.scrollTop(output.get(0).scrollHeight);
}

function
range(start, end = NaN, step = 1)
{
  let arr = [];
  const isStopNaN = isNaN(end);
  end = isStopNaN ? start : end;
  start = isStopNaN ? 0 : start;

  console.log("start: " + start + " end: " + end + " step: " + step);

  if(step > 0)
  {
    for(let i = start; i < end; i += step)
    {
      arr.push(i);
    }
  }
  else
  {
    for(let i = start; i > end; i += step)
    {
      arr.push(i);
    }
  }

  return(arr);
}

function
btnImport()
{
  let fr, fileName;

  function
  fileRead()
  {
    Editor.newBuffer(fileName.name, fr.result);
  }

  function
  fileSelected()
  {
    fileName = this.files[0];

    if(Editor.bufferExists(fileName.name))
    {
      console.log("file already exists");
    }
    else
    {
      fr = new FileReader();
      fr.onload = fileRead;
      fr.readAsText(fileName);
    }
  }

  const link = document.createElement("input");
  link.type = "file";
  link.accept = ".py";
  link.addEventListener("change", fileSelected);
  link.click();
}

function
btnExport()
{
  const fileName = Editor.bufferName();
  const fileContents = Editor.bufferContents();

  const blob = new Blob([fileContents], { type: "file/plain" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  link.click();

  URL.revokeObjectURL(blob);

  Editor.bufferSaved();
}

async function
btnPlayPause()
{
  let button = $("#btn_playpause i");

  if(button.hasClass("fa-pause"))
  {
    $("#btn_playpause i").removeClass("fa-pause").addClass("fa-play");
    sim.pause();
  }
  else
  {
    $("#btn_playpause i").removeClass("fa-play").addClass("fa-pause");

    if(execution === null)
    {
      Editor.bufferAnnotation();

      let source = Editor.bufferContents() + "\nsimDone()";

      sim.reset(false);

      source = source.replace(/\ndef /g, "\nasync def ");

      execution = interp.evaluate(source, scope, "", "main.jspy",
                                  (ctx) => context = ctx).catch((error) =>
      {
        const msg = error.message;
        const colon1 = msg.indexOf(":");
        const colon2 = msg.indexOf(":", colon1 + 1);

        const paren1 = msg.indexOf("(", colon1 + 2);
        const line = parseInt(msg.substr(paren1 + 1));

        const comma = msg.indexOf(",", paren1 + 1);
        const column = parseInt(msg.substr(comma + 1));

        Editor.bufferAnnotation(line, column, msg.substr(colon2 + 2));

        dialog.alert(Editor.bufferName() + "(" + line + "," + column + "): " +
                     msg.substr(colon2 + 2));

        $("#btn_playpause i").removeClass("fa-pause").addClass("fa-play");
      });

      await execution;

      execution = null;

      context = null;
    }
    else
    {
      sim.resume();
    }
  }
}

function
simDone()
{
  $("#btn_playpause i").removeClass("fa-pause").addClass("fa-play");
}

function
btnReset()
{
  if(context)
  {
    context.cancellationToken.cancel = true;
  }

  sim.reset(false);

  $("#btn_playpause i").removeClass("fa-pause").addClass("fa-play");
}

function
btnRandom()
{
  console.log("random");
}

function
btnShowCode()
{
  if(vRatioSave === undefined)
  {
    if(vRatio === 1)
    {
      vRatio = 0.5;
    }
    else
    {
      vRatioSave = vRatio;
      vRatio = 1;
    }
    onResize();
  }
  else
  {
    vRatio = vRatioSave;
    vRatioSave = undefined;
    onResize();
    Editor.focus();
  }
}

function
btnConfig()
{
  Config.show();
}

function
btnFullscreen()
{
  if(!document.fullscreenElement)
  {
    document.documentElement.requestFullscreen();
  }
  else
  {
    document.exitFullscreen();
  }
}

function
btnAbout()
{
  function
  showLicense(license, filename)
  {
    function
    closeLicense()
    {
      $(license).close();
    }

    function
    show()
    {
      $(license + " button").off("click");
      $(license + " button").on("click", closeLicense);

      $(license).showModal();
    }

    function
    done(text)
    {
      $("body").append(text);
      show();
    }

    function
    fail()
    {
      console.log("Failed to load " + filename + "!");
    }

    function
    load()
    {
      $.get("licenses/" + filename).done(done).fail(fail);
    }

    if($(license).length !== 0)
    {
      show();
    }
    else
    {
      load();
    }
  }

  function
  close()
  {
    $("#about").close();
  }

  $("#about #btn_license").off("click").
    on("click", () => showLicense("#license", "license.html"));
  $("#about #btn_three").off("click").
    on("click", () => showLicense("#three_license", "threejs.html"));
  $("#about #btn_meshbvh").off("click").
    on("click", () => showLicense("#meshbvh_license", "meshbvhjs.html"));
  $("#about #btn_ace").off("click").
    on("click", () => showLicense("#ace_license", "ace.html"));
  $("#about #btn_jspython").off("click").
    on("click", () => showLicense("#jspython_license", "jspython.html"));
  $("#about #btn_ldraw").off("click").
    on("click", () => showLicense("#ldraw_license", "ldraw.html"));
  $("#about #btn_jquery").off("click").
    on("click", () => showLicense("#jquery_license", "jquery.html"));
  $("#about #btn_fontawesome").off("click").
    on("click", () => showLicense("#fontawesome_license", "fontawesome.html"));
  $("#about button").off("click").on("click", close);

  $("#about").showModal();
}

function
btnPortView(port)
{
  if(deviceType[port] === pupdevices.DeviceType.ColorSensor)
  {
    deviceView[port]++;
    if(deviceView[port] === 3)
    {
      deviceView[port] = 0;
    }
  }
  else if(deviceType[port] === pupdevices.DeviceType.ForceSensor)
  {
    deviceView[port] = (deviceView[port] + 1) & 3;
  }
  else if(deviceType[port] === pupdevices.DeviceType.Motor)
  {
    deviceView[port] ^= 1;
  }
  else if(deviceType[port] === pupdevices.DeviceType.UltrasonicSensor)
  {
  }
}

function
onCollisionWallStart()
{
  let button = $("#btn_playpause i");

  $("#c_wall").css("display", "grid");

  if(Config.pauseOnWallCollision() && button.hasClass("fa-pause"))
  {
    btnPlayPause();
  }
}

function
onCollisionWallEnd()
{
  $("#c_wall").css("display", "none");
}

function
onCollisionModelStart()
{
  let button = $("#btn_playpause i");

  $("#c_model").css("display", "grid");

  if(Config.pauseOnModelCollision() && button.hasClass("fa-pause"))
  {
    btnPlayPause();
  }
}

function
onCollisionModelEnd()
{
  $("#c_model").css("display", "none");
}

function
onCollisionGamePieceStart()
{
  let button = $("#btn_playpause i");

  $("#c_game_piece").css("display", "grid");

  if(Config.pauseOnGamePieceCollision() && button.hasClass("fa-pause"))
  {
    btnPlayPause();
  }
}

function
onCollisionGamePieceEnd()
{
  $("#c_game_piece").css("display", "none");
}

function
onKeyDown(e)
{
  let update = false;

  if(e.target !== $("body")[0])
  {
    return;
  }

  if(execution !== null)
  {
    return;
  }

  let [ x, y, r ] = Editor.robotStartPosition();
  let delta;

  if(e.shiftKey === true)
  {
    delta = 0.01;
  }
  else if(e.altKey === true)
  {
    delta = 0.1;
  }
  else
  {
    delta = 1.0;
  }

  // Left arrow
  if(e.which === 37)
  {
    if((e.shiftKey === true) && (e.altKey === true))
    {
      if(x > 46.5)
      {
        x = 93 - x;
        update = true;
      }
    }
    else
    {
      x -= delta;
      update = true;
    }
  }

  // Rigth arrow
  if(e.which === 39)
  {
    if((e.shiftKey === true) && (e.altKey === true))
    {
      if(x < 46.5)
      {
        x = 93 - x;
        update = true;
      }
    }
    else
    {
      x += delta;
      update = true;
    }
  }

  // Up arrow
  if(e.which === 38)
  {
    y += delta;
    update = true;
  }

  // Down arrow
  if(e.which === 40)
  {
    y -= delta;
    update = true;
  }

  // Comma
  if(e.which === 188)
  {
    r += delta * 10;
    update = true;
  }

  // Period
  if(e.which === 190)
  {
    r -= delta * 10;
    update = true;
  }

  if(update)
  {
    if(r > 180)
    {
      r -= 360;
    }
    if(r <= -180)
    {
      r += 360;
    }

    if(Display.setRobotPosition(x, y, r))
    {
      Editor.robotStartPosition(x, y, r);
      sim.reset(true);
    }
  }
}

function
onMouseDownVsizer(e)
{
  vsizerDown = true;
}

function
onMouseDownHsizer(e)
{
  hsizerDown = true;
}

function
onMouseMove(e)
{
  if(vsizerDown)
  {
    let div = $(".frame #content");

    let width = e.clientX - div[0].offsetLeft - 6;
    if(width < 0)
    {
      width = 0;
    }
    if(width > (div[0].offsetWidth - 12))
    {
      width = div[0].offsetWidth - 12;
    }

    vRatio = width / (div[0].offsetWidth - 12);

    div.css("grid-template-columns", `${width}px 12px 1fr`);

    e.stopPropagation();

    vRatioSave = undefined;
  }

  if(hsizerDown)
  {
    let div = $(".frame #dev");

    let height = e.clientY - div[0].offsetTop - 6;
    if(height < 0)
    {
      height = 0;
    }
    if(height > (div[0].offsetHeight - 12))
    {
      height = div[0].offsetHeight - 12;
    }

    hRatio = height / (div[0].offsetHeight - 12);

    div.css("grid-template-rows", `${height}px 12px 1fr`);

    e.stopPropagation();
  }
}

function
onMouseUp(e)
{
  vsizerDown = false;
  hsizerDown = false;
}

function
onBlur()
{
  let button = $("#btn_playpause i");

  if(button.hasClass("fa-pause"))
  {
    button.addClass("blur-pause");
    btnPlayPause();
  }
}

function
onFocus()
{
  let button = $("#btn_playpause i");

  if(button.hasClass("blur-pause"))
  {
    button.removeClass("blur-pause");
    btnPlayPause();
  }
}

function
onResize()
{
  let div = $(".frame #content");

  let width = parseInt((div[0].offsetWidth - 12) * vRatio);

  div.css("grid-template-columns", `${width}px 12px 1fr`);

  div = $(".frame #dev");

  let height = parseInt((div[0].offsetHeight - 12) * hRatio);

  div.css("grid-template-rows", `${height}px 12px 1fr`);
}