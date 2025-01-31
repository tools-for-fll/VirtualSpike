// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import "./jquery.js";
import * as Display from "./Display.js";
import * as Editor from "./Editor.js";

let startX, startY, startR;

let robotS, robotX, robotY, robotR;

let robotMode = 0;

$("document").ready(init);

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
  $("#btn_config").on("click", btnConfig);
  $("#btn_about").on("click", btnAbout);
  $("#btn_showcode").on("click", btnShowCode);

  startX = 27.4;
  startY = 18.25;
  startR = 0;

  robotS = 0;
  robotX = startX;
  robotY = startY;
  robotR = startR;

  Display.setRobotPosition(robotX, robotY, robotR);
  Display.setStepFunction(step);
  Display.init();
  Display.setCameraOverhead();

  Editor.init();

  $(document).on("keyup", onKeyUp);
}

function
step()
{
  if(robotMode == 0)
  {
  }
  else if(robotS == 0)
  {
    robotY -= 0.1;
    if(robotY <= -10)
    {
      robotR = 360;
      robotS = 1;
    }
  }
  else if(robotS == 1)
  {
    robotR -= 3;
    if(robotR == 270)
    {
      robotS = 2;
    }
  }
  else if(robotS == 2)
  {
    robotX -= 0.1;
    if(robotX <= -25)
    {
      robotS = 3;
    }
  }
  else if(robotS == 3)
  {
    robotR -= 3;
    if(robotR == 180)
    {
      robotS = 4;
    }
  }
  else if(robotS == 4)
  {
    robotY += 0.1;
    if(robotY > 9)
    {
      robotS = 5;
    }
  }
  else if(robotS == 5)
  {
    robotR -= 3;
    if(robotR == 90)
    {
      robotS = 6;
    }
  }
  else if(robotS == 6)
  {
    robotX += 0.1;
    if(robotX > 25)
    {
      robotS = 7;
    }
  }
  else if(robotS == 7)
  {
    robotR -= 3;
    if(robotR == 0)
    {
      robotS = 0;
    }
  }

  Display.setRobotPosition(robotX, robotY, robotR);
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

function
btnPlayPause()
{
  robotMode ^= 1;

  if(robotMode == 0)
  {
    $("#btn_playpause i").removeClass("fa-pause").addClass("fa-play");
  }
  else
  {
    $("#btn_playpause i").removeClass("fa-play").addClass("fa-pause");
  }
}

function
btnReset()
{
  robotS = 0;
  robotX = startX;
  robotY = startY;
  robotR = startR;
  robotMode = 0;
  Display.setRobotPosition(robotX, robotY, robotR);
  $("#btn_playpause i").removeClass("fa-pause").addClass("fa-play");
}

function
btnRandom()
{
  console.log("random");
}

function
btnConfig()
{
  console.log("config");
}

function
btnAbout()
{
  function
  showLicense(license)
  {
    function
    closeLicense()
    {
      $(license).close();
    }

    $(license + " button").off("click");
    $(license + " button").on("click", closeLicense);

    $(license).showModal();
  }

  function
  close()
  {
    $("#about").close();
  }

  $("#about #btn_license").off("click");
  $("#about #btn_license").on("click", () => showLicense("#license"));
  $("#about #btn_three").off("click");
  $("#about #btn_three").on("click", () => showLicense("#three_license"));
  $("#about #btn_ace").off("click");
  $("#about #btn_ace").on("click", () => showLicense("#ace_license"));
  $("#about #btn_ldraw").off("click");
  $("#about #btn_ldraw").on("click", () => showLicense("#ldraw_license"));
  $("#about #btn_jquery").off("click");
  $("#about #btn_jquery").on("click", () => showLicense("#jquery_license"));
  $("#about button").off("click");
  $("#about button").on("click", close);

  $("#about").showModal();
}

function
btnShowCode()
{
  if($(".frame").hasClass("show-editor"))
  {
    $(".frame").removeClass("show-editor");
  }
  else
  {
    $(".frame").addClass("show-editor");
    Editor.focus();
  }
}

function
onKeyUp(e)
{
  // See if Ctrl-Shift-F was pressed.
  if(((e.key == 'f') || (e.key == 'F')) && (e.ctrlKey == true) &&
     (e.shiftKey == true))
  {
    // Toggle the full screen state of the window.
    if(!document.fullscreenElement)
    {
      document.documentElement.requestFullscreen();
    }
    else
    {
      document.exitFullscreen();
    }

    // Do not allow this key event to further propagated.
    e.stopPropagation();
  }

  // See if Ctrl-Shift-C was pressed.
  if(((e.key == 'c') || (e.key == 'C')) && (e.ctrlKey == true) &&
     (e.shiftKey == true))
  {
    // Toggle the code window.
    btnShowCode();

    // Do not allow this key event to further propagated.
    e.stopPropagation();
  }
}