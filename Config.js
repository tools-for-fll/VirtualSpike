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

  $("#config #season_select").on("change", selectSeason);
  $("#config #robot_select").on("change", selectRobot);
  $("#config #robot_delete").on("click", deleteRobot);
  $("#config #robot_upload").on("click", uploadRobot);
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

function
selectSeason()
{
  storage.setItem("config/season", $("#config #season_select").val());
  // XYZZY
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