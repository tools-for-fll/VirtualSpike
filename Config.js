// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import * as dialog from "./dialog.js";
import * as Display from "./Display.js";
import * as Editor from "./Editor.js";

const storage = window.localStorage;

function
loadRobotList()
{
  function
  newOption(name)
  {
    let html = `<option value="${name}">${name}</option>`;

    $("#config #robot_select").append(html);
  }

  let names = [];

  for(let idx = 0; idx < storage.length; idx++)
  {
    let key = storage.key(idx);

    if(key.substring(0, 6) !== "robot/")
    {
      continue;
    }

    names.push(key.substring(6));
  }

  names.sort();

  $("#config #robot_select").empty();

  newOption("Default");

  for(let idx = 0; idx < names.length; idx++)
  {
    newOption(names[idx]);
  }

  $("#config #robot_delete").attr("disabled", "disabled");

  let robot = storage.getItem("config/robot");
  if(robot !== null)
  {
    $("#config #robot_select").val(robot);
    if(robot !== "Default")
    {
      $("#config #robot_delete").removeAttr("disabled");
    }
  }
}

export function
init()
{
  loadRobotList();

  let season = storage.getItem("config/season");
  if(season !== null)
  {
    $("#config #season_select").val(season);
  }

  let robot = storage.getItem("config/robot");
  if(robot !== null)
  {
    Editor.robotDefaultModel(robot);
  }

  const c_wall = storage.getItem("config/pause_wall");
  if((c_wall === null) || (c_wall === "0"))
  {
    $("#config #c_wall_yes").removeClass("selected");
    $("#config #c_wall_no").addClass("selected");
  }
  else
  {
    $("#config #c_wall_yes").addClass("selected");
    $("#config #c_wall_no").removeClass("selected");
  }

  const c_model = storage.getItem("config/pause_model");
  if((c_model === null) || (c_model === "1"))
  {
    $("#config #c_model_yes").addClass("selected");
    $("#config #c_model_no").removeClass("selected");
  }
  else
  {
    $("#config #c_model_yes").removeClass("selected");
    $("#config #c_model_no").addClass("selected");
  }

  const c_game_piece = storage.getItem("config/pause_game_piece");
  if((c_game_piece === null) || (c_game_piece === "0"))
  {
    $("#config #c_game_piece_yes").removeClass("selected");
    $("#config #c_game_piece_no").addClass("selected");
  }
  else
  {
    $("#config #c_game_piece_yes").addClass("selected");
    $("#config #c_game_piece_no").removeClass("selected");
  }

  $("#config #season_select").on("change", selectSeason);
  $("#config #robot_select").on("change", selectRobot);
  $("#config #robot_delete").on("click", deleteRobot);
  $("#config #robot_upload").on("click", uploadRobot);
  $("#config #c_wall_yes").on("click", onWallClick);
  $("#config #c_wall_no").on("click", onWallClick);
  $("#config #c_model_yes").on("click", onModelClick);
  $("#config #c_model_no").on("click", onModelClick);
  $("#config #c_game_piece_yes").on("click", onGamePieceClick);
  $("#config #c_game_piece_no").on("click", onGamePieceClick);
  $("#config #config_done").on("click", close);
}

export function
show()
{
  $("#config").showModal();
}

function
close()
{
  $("#config").close();
}

async function
selectSeason()
{
  let season = $("#config #season_select").val();

  storage.setItem("config/season", season);

  Display.showProgressBar();

  await Display.loadField(season);

  Display.reloadRobot(Editor.robotModel());

  Display.updateProgressBar();
}

function
selectRobot()
{
  let robot = $("#config #robot_select").val();

  storage.setItem("config/robot", robot);

  Display.loadRobot(robot);

  Editor.robotDefaultModel(robot);

  Editor.robotModel(robot);

  if(robot === "Default")
  {
    $("#config #robot_delete").attr("disabled", "disabled");
  }
  else
  {
    $("#config #robot_delete").removeAttr("disabled");
  }
}

async function
deleteRobot()
{
  let robot = $("#config #robot_select").val();

  if(await dialog.confirm(`Are you sure you want to delete ${robot}?`) ===
     false)
  {
    return;
  }

  storage.removeItem(`robot/${robot}`);

  storage.setItem("config/robot", "Default");

  Editor.robotDefaultModel("Default");

  Display.deleteRobot(robot);

  loadRobotList();
}

function
uploadRobot()
{
  async function
  loaded(file, text)
  {
    if(text.substring(0, 6) !== "0 FILE")
    {
      await dialog.alert("This doesn't appear to be an LDraw file!");
    }
    else
    {
      let name = file.name;

      if(name.substring(name.length - 4) === ".ldr")
      {
        name = name.substring(0, name.length - 4);
      }

      if(storage.getItem(`robot/${name}`) !== null)
      {
        if(await dialog.confirm(`Robot ${name} already exists; overwrite?`) ===
           false)
        {
          return;
        }
      }

      storage.setItem(`robot/${name}`, text);

      storage.setItem("config/robot", name);

      Display.loadRobot(name);

      Editor.robotDefaultModel(name);

      Editor.robotModel(name);

      loadRobotList();
    }
  }

  function
  selected()
  {
    let file = $("#config #robot_file")[0].files[0];
    let fr = new FileReader();
    fr.onload = function ()
    {
      loaded(file, fr.result);
    };
    fr.readAsText(file);
  }

  // Disable the change handler for the file select, if it exists.
  $("#config #robot_file").off("change");

  // Reset the value of the file select.
  $("#config #robot_file").val("");

  // Set the change handler for the file select.
  $("#config #robot_file").on("change", selected);

  // Click on the file select, triggering the file selector dialog.
  $("#config #robot_file").trigger("click");
}

function
onWallClick()
{
  if($("#config #c_wall_yes").hasClass("selected"))
  {
    $("#config #c_wall_yes").removeClass("selected");
    $("#config #c_wall_no").addClass("selected");
    storage.setItem("config/pause_wall", "0");
  }
  else
  {
    $("#config #c_wall_yes").addClass("selected");
    $("#config #c_wall_no").removeClass("selected");
    storage.setItem("config/pause_wall", "1");
  }
}

function
onModelClick()
{
  if($("#config #c_model_yes").hasClass("selected"))
  {
    $("#config #c_model_yes").removeClass("selected");
    $("#config #c_model_no").addClass("selected");
    storage.setItem("config/pause_model", "0");
  }
  else
  {
    $("#config #c_model_yes").addClass("selected");
    $("#config #c_model_no").removeClass("selected");
    storage.setItem("config/pause_model", "1");
  }
}

function
onGamePieceClick()
{
  if($("#config #c_game_piece_yes").hasClass("selected"))
  {
    $("#config #c_game_piece_yes").removeClass("selected");
    $("#config #c_game_piece_no").addClass("selected");
    storage.setItem("config/pause_game_piece", "0");
  }
  else
  {
    $("#config #c_game_piece_yes").addClass("selected");
    $("#config #c_game_piece_no").removeClass("selected");
    storage.setItem("config/pause_game_piece", "1");
  }
}

export function
getSeason()
{
  let item = storage.getItem("config/season");
  if(item !== null)
  {
    return(item);
  }

  return($("#config #season_select").val());
}

export function
pauseOnWallCollision()
{
  return($("#config #c_wall_yes").hasClass("selected"));
}

export function
pauseOnModelCollision()
{
  return($("#config #c_model_yes").hasClass("selected"));
}

export function
pauseOnGamePieceCollision()
{
  return($("#config #c_game_piece_yes").hasClass("selected"));
}