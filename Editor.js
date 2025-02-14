// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

let defaultPosition = [ 15.5, 8.5, 45 ];

let defaultLeftMotor = "A";

let defaultRightMotor = "E";

let defaultWheelDiameter = 56;

let defaultWheelTrack = 112;

let editor;

let storage = window.localStorage;

let buffers = [];

let bufferTimer = null;

let robotResetHandler = null;

let defaultText = `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

hub = PrimeHub()

left = Motor(Port.A)
right = Motor(Port.E)

drive = DriveBase(left, right, 56, 112)

drive.straight(400)
drive.turn(180)
drive.straight(400)
drive.turn(180)`;

export function
init()
{
  editor = ace.edit("ace_editor");
  editor.setOption("showGutter", true);
  editor.setKeyboardHandler("ace/keyboard/emacs");
  editor.setTheme("ace/theme/gob");

  let restored = false;
  for(let idx = 0; idx < storage.length; idx++)
  {
    let key = storage.key(idx);

    if(key.substring(0, 7) === "editor/")
    {
      let name = key.substring(7);

      newBuffer(name, null, storage.getItem(key));

      restored = true;
    }
  }

  if(!restored)
  {
    addBuffer(null);
  }

  $("#editor .nav .add").on("click", addBuffer);

  $(window).on("visibilitychange", saveBuffer);
}

export function
robotReset(handler)
{
  robotResetHandler = handler;
}

export function
focus()
{
  editor.focus();
}

export function
newBuffer(name, text, json = null)
{
  name = name.substring(0, name.length - 3);
  let html = '<li class="active">' +
             '  <span class="name" contenteditable="true" data-name="' + name +
             '">' + name + '</span><span>.py</span>' +
             '  <button class="close"><i class="fa fa-close"></i></button>' +
             '</li>';

  saveBuffer();

  $("#editor .nav li").removeClass("active");

  let add = $("#editor .nav li .add").parent();

  add.before(html);

  let newTab = add.prev();

  newTab.find(".name").parent().on("click", selectBuffer);
  newTab.find(".name").on("focusout", editName);
  newTab.find(".name").on("keydown", editName);
  newTab.find(".close").on("click", closeBuffer);

  if(text !== null)
  {
    buffers[name] = ace.createEditSession(text, "ace/mode/python");
  }
  else
  {
    buffers[name] = ace.EditSession.fromJSON(json);
    buffers[name].setUndoManager(new ace.UndoManager());
  }

  buffers[name].setUseSoftTabs(true);
  buffers[name].on("change", manipulateBuffer);
  buffers[name].on("changeScrollLeft", manipulateBuffer);
  buffers[name].on("changeScrollTop", manipulateBuffer);
  buffers[name].selection.on("changeSelection", manipulateBuffer);
  buffers[name].selection.on("changeCursor", manipulateBuffer);

  restoreBuffer(name);
  saveBuffer(name);
}

export function
bufferName()
{
  return($("#editor .nav li.active span").text());
}

export function
bufferContents()
{
  return(editor.session.getValue());
}

export function
bufferSaved()
{
  $("#editor .nav li.active button i").removeClass("fa-circle").
    addClass("fa-close");
}

export function
bufferExists(name)
{
  let tabs = $("#editor .nav li");

  for(let i = 0; i < (tabs.length - 1); i++)
  {
    if(tabs.eq(i).find("span").text() == name)
    {
      return(true);
    }
  }

  return(false);
}

export function
robotStartPosition(...args)
{
  let ret, idx, tokens;

  // The default starting position.
  ret = defaultPosition;

  if(args.length === 0)
  {
    // Get the contents of the current editor buffer.
    let source = bufferContents();

    // See if the starting position comment exists in the source.
    idx = source.indexOf("# start_position: ");
    if(idx !== -1)
    {
      // Parse the starting position comment.
      tokens = source.substring(idx + 18).
                 match(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/);
      if(tokens !== null)
      {
        // The comment was parsed successfully, get the position of the robot
        // from the values in the comment.
        ret = [ parseFloat(tokens[1]), parseFloat(tokens[3]),
                parseFloat(tokens[5]) ];
      }
    }

    // Return the robot position.
    return(ret);
  }
  else
  {
    // Update the starting position from the supplied values.
    ret[0] = args[0];
    if(args.length > 1)
    {
      ret[1] = args[1];
    }
    if(args.length > 2)
    {
      ret[2] = args[2];
    }

    let str = `# start_position: ${ret[0].toFixed(2)} ${ret[1].toFixed(2)} ` +
              `${ret[2].toFixed(0)}`;

    editor.find(/^# start_position.*$/);
    editor.replace(str);
  }
}

export function
robotLeftMotor()
{
  let ret, idx, tokens;

  // By default, there is no left motor to return.
  ret = -1;

  // Get the contents of the current editor buffer.
  let source = bufferContents();

  // See if the left motor comment exists in the source.
  idx = source.indexOf("# left_wheel: ");
  if(idx !== -1)
  {
    // Parse the left motor comment.
    tokens = source.substring(idx + 14).match(/([A-Fa-f])/);
    if(tokens !== null)
    {
      // The comment was parsed successfully, so get the index of the left
      // motor.
      ret = tokens[1].toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
    }
  }

  // Return the left motor.
  return(ret);
}

export function
robotRightMotor()
{
  let ret, idx, tokens;

  // By default, there is no right motor to return.
  ret = -1;

  // Get the contents of the current editor buffer.
  let source = bufferContents();

  // See if the right motor comment exists in the source.
  idx = source.indexOf("# right_wheel: ");
  if(idx !== -1)
  {
    // Parse the right motor comment.
    tokens = source.substring(idx + 15).match(/([A-Fa-f])/);
    if(tokens !== null)
    {
      // The comment was parsed successfully, so get the index of the right
      // motor.
      ret = tokens[1].toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
    }
  }

  // Return the right motor.
  return(ret);
}

export function
robotWheelDiameter()
{
  let ret, idx, tokens;

  // The default wheel diameter.
  ret = defaultWheelDiameter;

  // Get the contents of the current editor buffer.
  let source = bufferContents();

  // See if the wheel diameter comment exists in the source.
  idx = source.indexOf("# wheel_diameter: ");
  if(idx !== -1)
  {
    // Parse the wheel diameter comment.
    tokens = source.substring(idx + 18).match(/(\d+(\.\d+)?)/);
    if(tokens !== null)
    {
      // The comment was parsed successfully, so get the wheel diameter.
      ret = parseFloat(tokens[1]);
    }
  }

  // Return the wheel diameter.
  return(ret);
}

export function
robotWheelTrack()
{
  let ret, idx, tokens;

  // The default wheel track.
  ret = defaultWheelTrack;

  // Get the contents of the current editor buffer.
  let source = bufferContents();

  // See if the wheel tracxk comment exists in the source.
  idx = source.indexOf("# wheel_track: ");
  if(idx !== -1)
  {
    // Parse the wheel track comment.
    tokens = source.substring(idx + 15).match(/(\d+(\.\d+)?)/);
    if(tokens !== null)
    {
      // The comment was parse successfully, so get the wheel track.
      ret = parseFloat(tokens[1]);
    }
  }

  // Return the wheel track.
  return(ret);
}

function
saveBuffer()
{
  let name = $("#editor .nav li.active .name").text();

  if(name != "")
  {
    buffers[name] = editor.getSession();

    storage.setItem("editor/" + name + ".py",
                    JSON.stringify(editor.getSession().toJSON()));
  }
}

function
restoreBuffer(name)
{
  editor.setSession(buffers[name]);
  editor.focus();
  if(robotResetHandler != null)
  {
    robotResetHandler();
  }
}

function
selectBuffer(e)
{
  let elem = $(e.target);

  if(elem.prop("nodeName").toLowerCase() == "span")
  {
    elem = elem.parent();
  }

  if(elem.hasClass("active"))
  {
    return;
  }

  saveBuffer();

  $("#editor .nav li").removeClass("active");

  elem.addClass("active");

  restoreBuffer(elem.find("span:eq(0)").text());

  e.stopPropagation();
}

function
closeBuffer(e)
{
  let tab = $(e.target).parent();
  if(tab.hasClass("close"))
  {
    tab = tab.parent();
  }

  let name = tab.find(".name").text();
  let prev = tab.prev();
  let next = tab.next();
  let isActive = tab.hasClass("active");

  function
  cancel()
  {
    $("#discard_changes").close();
  }

  function
  discard()
  {
    delete buffers[name];

    storage.removeItem(`editor/${name}.py`);

    tab.remove();

    if(isActive)
    {
      if(prev.length != 0)
      {
        prev.addClass("active");
        restoreBuffer(prev.find(".name").text());
      }
      else if(next.next().length != 0)
      {
        next.addClass("active");
        restoreBuffer(next.find(".name").text());
      }
      else
      {
        addBuffer(e);
      }
    }

    cancel();
  }

  if(tab.find("i").hasClass("fa-circle"))
  {
    $("#discard_changes #discard_changes_yes").off("click")
    $("#discard_changes #discard_changes_yes").on("click", discard);
    $("#discard_changes #discard_changes_no").off("click")
    $("#discard_changes #discard_changes_no").on("click", cancel);
    $("#discard_changes").showModal();
  }
  else
  {
    discard();
  }

  e.stopPropagation();
}

function
editName(e)
{
  if(e.type === "keydown")
  {
    if(e.key === "Enter")
    {
      editor.focus();
      e.stopPropagation();
      return(false);
    }

    return(true);
  }

  let oldName = $(e.target).data("name");
  let newName = $(e.target).text();

  if(newName == oldName)
  {
    return;
  }

  if(buffers[newName] != undefined)
  {
    window.alert("buffer name already exists!");
  }

  $(e.target).data("name", newName);

  buffers[newName] = buffers[oldName];

  delete buffers[oldName];

  storage.removeItem(`editor/${oldName}.py`);

  storage.setItem(`editor/${newName}.py`,
                  JSON.stringify(buffers[newName].toJSON()));
}

function
addBuffer(e)
{
  let tabs = $("#editor .nav li");

  for(let i = 0; ; i++)
  {
    let name = "main" + ((i == 0) ? "" : i);
    let j;

    for(j = 0; j < (tabs.length - 1); j++)
    {
      if(tabs.eq(j).find(".name").text() == name)
      {
        break;
      }
    }

    if(j == (tabs.length - 1))
    {
      let text = "";
      text += `# start_position: ${defaultPosition[0].toFixed(2)} ${defaultPosition[1].toFixed(2)} ${defaultPosition[2].toFixed(0)}\n`;
      text += `# left_wheel: ${defaultLeftMotor}\n`;
      text += `# right_wheel: ${defaultRightMotor}\n`;
      text += `# wheel_diameter: ${defaultWheelDiameter}\n`;
      text += `# wheel_track: ${defaultWheelTrack}\n`;
      text += "\n";
      text += defaultText;

      newBuffer(name + ".py", text);

      break;
    }
  }

  if(e != null)
  {
    e.stopPropagation();
  }
}

function
bufferTimeout()
{
  saveBuffer();

  bufferTimer = null;
}

function
manipulateBuffer()
{
  if(bufferTimer !== null)
  {
    clearTimeout(bufferTimer);
  }

  bufferTimer = setTimeout(bufferTimeout, 5000);
}