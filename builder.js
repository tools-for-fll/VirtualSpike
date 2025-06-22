// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import "./jquery.js";
import * as Display from "./Display.js";
import * as dialog from "./dialog.js";

// The time at which the mouse button was pressed.  Used, along with
// `mouseUpTime`, to determine if a mouse click should select a field model
// (where longer presses are instead used to adjust the viewport and not
// select/unsleect a field model).
let mouseDownTime = 0;

// The time at which the mouse button was released.  Used, along wit
// `mouseDownTime`, to determine if a mouse click should select a field model
// (where longer presses are instead used to adjust the viewport and not
// select/unsleect a field model).
let mouseUpTime = 0;

// The structure that describes the field (mat and models).  This is
// stringified to produce the final output.
let json;

// The mapping of model ids to the index of the model in the `json` structure.
let mapping = [];

// The UUID of the currently selected model.
let selected = null;

// The ID to use for the next file input; this is incremented for each file
// input created.
let fileInputId = 0;

// The file input on the load mat dialog.
let matInput = null;

class FileInput
{
  constructor(element, accept = null)
  {
    this.id = fileInputId++;
    this.accept = accept;
    this.file = null;

    let html = `<span id="fileinput_${this.id}">` +
                 `<button>Choose File</button>` +
                 `<span style="margin-left: 0.25em">No file chosen</span>` +
               `</span>`;

    element.html(html);

    $(`#fileinput_${this.id} button`).on("click",
                                         (event) => this._onClick(event));
  }

  function
  _onSelect(event)
  {
    this.file = event.target.files[0];

    $(`#fileinput_${this.id} span`).text(this.file.name);
  }

  function
  _onClick(event)
  {
    const link = document.createElement("input");
    link.type = "file";
    if(this.accept !== null)
    {
      link.accept = this.accept;
    }
    $(link).on("change", (event) => this._onSelect(event));
    link.click();
  }

  function
  isValid()
  {
    return(this.file !== null);
  }

  function
  reset()
  {
    $(`#fileinput_${this.id} span`).text("No file chosen");
    this.file = null;
  }

  function
  filename()
  {
    return(this.isValid() ? this.file.name : null);
  }

  function
  readAsText()
  {
    function
    onLoad(obj)
    {
      obj.resolve(obj.fr.result);
    }

    function
    start(obj, resolve)
    {
      if(obj.file === null)
      {
        resolve(null);
      }

      obj.resolve = resolve;

      obj.fr = new FileReader();
      obj.fr.onload = () => onLoad(obj);
      obj.fr.readAsText(obj.file);
    }

    return(new Promise((resolve) => start(this, resolve)));
  }

  function
  readAsDataURL()
  {
    function
    onLoad(obj)
    {
      obj.resolve(obj.fr.result);
    }

    function
    start(obj, resolve)
    {
      if(obj.file === null)
      {
        obj.resolve(null);
      }

      obj.resolve = resolve;

      obj.fr = new FileReader();
      obj.fr.onload = () => onLoad(obj);
      obj.fr.readAsDataURL(obj.file);
    }

    return(new Promise((resolve) => start(this, resolve)));
  }
}

// Initializes the application.
function
init()
{
  json = {};
  json.year = 0;
  json.mat = {};
  json.models = [];

  $("#controls #btn_import").on("click", btnImport);
  $("#controls #btn_export").on("click", btnExport);
  $("#controls #btn_overhead").on("click", Display.setCameraOverhead);
  $("#controls #btn_perspective").on("click", Display.setCameraPerspective);
  $("#controls #btn_reset").on("click", btnReset);
  $("#controls #btn_mat").on("click", btnMat);
  $("#controls #btn_model").on("click", btnModel);
  $("#footer #comment input").on("change", commentChanged);
  $("#footer #game_piece input").on("change", gamePieceChanged);

  Display.init(false);
  Display.setCameraOverhead();

  $("#field").on("mousedown", onMouseDown);
  $("#field").on("mouseup", onMouseUp);
  $("#field").on("click", onClick);
  $(document).on("keydown", onKeyDown);
}

// Call the init function after the DOM is fully loaded.
$(init);

function
btnImport()
{
  let fr, fileName, fileId;

  let files = [];

  let inputs = [];

  async function
  load()
  {
    if(json.mat !== undefined)
    {
      if(!inputs[-1].isValid())
      {
        dialog.alert(`${files[-1]} not selected!`);
        return;
      }
    }

    for(let i = 0; i < files.length; i++)
    {
      if(!inputs[i].isValid())
      {
        dialog.alert(`${files[i]} not selected!`);
        return;
      }
    }

    $("#load_file").close();

    $("#loading").showModal();

    Display.modelsClear();

    mapping = [];

    if(json.mat !== undefined)
    {
      const img = document.createElement("img");
      img.src = await inputs[-1].readAsDataURL();

      Display.loadMat(img, json.mat.width, json.mat.height);
    }

    for(let i = 0; i < json.models.length; i++)
    {
      let j = files.indexOf(json.models[i].filename);

      let model = await Display.modelLoad(await inputs[j].readAsText(),
                                          json.models[i].x, json.models[i].y,
                                          json.models[i].z, json.models[i].r,
                                          0, json.models[i].game_piece, false);

      mapping[model] = i;
    }

    $("#loading").close();
  }

  async function
  cancel()
  {
    $("#load_file").close();
  }

  function
  jsonRead()
  {
    json = [];
    json = JSON.parse(fr.result);

    if(json.mat !== undefined)
    {
      files[-1] = json.mat.filename;
    }

    let fn = [];
    if(json.models !== undefined)
    {
      for(let i = 0; i < json.models.length; i++)
      {
        if(fn.indexOf(json.models[i].filename) === -1)
        {
          fn[fn.length] = json.models[i].filename;
        }
      }

      fn.sort();

      for(let i = 0; i < fn.length; i++)
      {
        files[i] = fn[i];
      }
    }

    let html = "";
    html += `<table>`;
    if(files[-1] !== null)
    {
      html += `<tr id="tr_mat"><td>${files[-1]}</td><td></td></tr>`;
    }

    for(let i = 0; i < files.length; i++)
    {
      html += `<tr id="tr_${i}"><td>${files[i]}</td><td></td></tr>`
    }
    html += `</table>`;

    $("#load_file #files").html(html);

    if(files[-1] !== null)
    {
      inputs[-1] = new FileInput($("#tr_mat").children().eq(1), "image/*");
    }
    for(let i = 0; i < files.length; i++)
    {
      inputs[i] = new FileInput($(`#tr_${i}`).children().eq(1), ".ldr");
    }

    $("#load_file #btn_load").off("click");
    $("#load_file #btn_load").on("click", load);
    $("#load_file #btn_cancel").off("click");
    $("#load_file #btn_cancel").on("click", cancel);

    $("#load_file").showModal();
    $("#load_file").scrollTop(0);
  }

  function
  jsonSelected()
  {
    fileName = this.files[0];

    fr = new FileReader();
    fr.onload = jsonRead;
    fr.readAsText(fileName);
  }

  const link = document.createElement("input");
  link.type = "file";
  link.accept = ".json";
  link.addEventListener("change", jsonSelected);
  link.click();
}

function
btnExport()
{
  let output = JSON.stringify(json, null, 4);

  let link = document.createElement("a");
  link.href = "data:text/json;base64," + window.btoa(output);
  link.download = "field.json";
  link.click();
}

function
btnReset()
{
  Display.loadMat(null, 0, 0);
  Display.modelsClear();

  json = {};
  json.year = 0;
  json.mat = {};
  json.models = [];

  mapping = [];
}

function
btnMat()
{
  async function
  load()
  {
    if(!matInput.isValid())
    {
      dialog.alert("A mat image file must be selected!");
      return;
    }

    let width = $("#load_mat #mat_width").val();
    if(width === "")
    {
      dialog.alert("The mat width must be specfiied!");
      return;
    }

    let height = $("#load_mat #mat_height").val();
    if(height === "")
    {
      dialog.alert("The mat height must be specified!");
      return;
    }

    const img = document.createElement("img");
    img.src = await matInput.readAsDataURL();

    json.mat.filename = matInput.filename();
    json.mat.width = parseFloat(width);
    json.mat.height = parseFloat(height);
    json.mat.position = "sc";

    Display.loadMat(img, json.mat.width, json.mat.height);

    $("#load_mat").close();
  }

  function
  cancel()
  {
    $("#load_mat").close();
  }

  if(matInput === null)
  {
    matInput = new FileInput($("#mat_file_input"), "image/*");
  }
  else
  {
    matInput.reset();
  }

  $("#load_mat #mat_width").val("");
  $("#load_mat #mat_height").val("");

  $("#load_mat #btn_load").off("click");
  $("#load_mat #btn_load").on("click", load);
  $("#load_mat #btn_cancel").off("click");
  $("#load_mat #btn_cancel").on("click", cancel);

  $("#load_mat").showModal();
  $("#load_mat").scrollTop(0);
}

function
btnModel()
{
  let fr, file;

  async function
  read()
  {
    let model = await Display.modelLoad(fr.result, 0, 0, 0, 0, 0, false, true);

    let [ x, y, z, rx, ry, rz ] = Display.modelGetPosition(model);

    let idx = json.models.length;

    json.models[idx] = {};
    json.models[idx].comment = "model";
    json.models[idx].skip = false;
    json.models[idx].filename = file.name;
    json.models[idx].x = parseFloat(x.toFixed(2));
    json.models[idx].y = parseFloat(z.toFixed(2));
    json.models[idx].z = parseFloat(y.toFixed(2));
    json.models[idx].r = parseFloat(rz.toFixed(1));

    mapping[model] = idx;
  }

  function
  selected()
  {
    file = this.files[0];

    fr = new FileReader();
    fr.onload = read;
    fr.readAsText(file);
  }

  const link = document.createElement("input");
  link.type = "file";
  link.accept = ".ldr";
  link.addEventListener("change", selected);
  link.click();
}

function
commentChanged()
{
  let i = mapping[selected];

  json.models[i].comment = $("#footer #comment input").val();
}

function
gamePieceChanged()
{
  let i = mapping[selected];

  if($("#footer #game_piece input").is(":checked"))
  {
    json.models[i].game_piece = true;
  }
  else
  {
    delete json.models[i].game_piece;
  }
}

function
onMouseDown(e)
{
  mouseDownTime = Date.now();
}

function
onMouseUp(e)
{
  mouseUpTime = Date.now();
}

function
onClick(e)
{
  if((mouseUpTime - mouseDownTime) < 250)
  {
    selected = Display.modelSelect(e.offsetX, e.offsetY);

    if(selected)
    {
      $("#footer").removeClass("disable");
      $("#footer input").prop("disabled", "");

      let i = mapping[selected];

      $("#footer #filename").text(json.models[i].filename);
      $("#footer #comment input").val(json.models[i].comment);
      if(json.models[i].game_piece === true)
      {
        $("#footer #game_piece input").prop("checked", true);
      }
      else
      {
        $("#footer #game_piece input").prop("checked", false);
      }
    }
    else
    {
      $("#footer").addClass("disable");
      $("#footer input").prop("disabled", "disabled");

      $("#footer #filename").text("<None Selected>");
      $("#footer #comment input").val("");
      $("#footer #game_piece input").prop("checked", false);
    }
  }
}

function
onKeyDown(e)
{
  let update = false;
  let precision = false;

  if(e.target !== $("body")[0])
  {
    return;
  }

  let data = Display.modelGetPosition();
  if(data === null)
  {
    return;
  }

  let [ x, y, z, rx, ry, rz ] = data;
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

  // See if the left arrow key was pressed.
  if(e.which === 37)
  {
    x -= delta;
    update = true;
  }

  // See if the right arrow key was pressed.
  if(e.which === 39)
  {
    x += delta;
    update = true;
  }

  // See if the up arrow key was pressed.
  if(e.which === 38)
  {
    y -= delta;
    update = true;
  }

  // See if the down arrow key was pressed.
  if(e.which === 40)
  {
    y += delta;
    update = true;
  }

  // See if the "a" key was pressed.
  if(e.which === 65)
  {
    z += delta;
    update = true;
  }

  // See if the "z" key was pressed.
  if(e.which === 90)
  {
    z -= delta;
    update = true;
  }

  // See if the "," key was pressed.
  if(e.which === 188)
  {
    rz -= delta * 10;
    update = true;
  }

  // See if the "." key was pressed.
  if(e.which === 190)
  {
    rz += delta * 10;
    update = true;
  }

  // See if the delete key was pressed.
  if(e.which === 8)
  {
    let i = mapping[selected];

    delete mapping[selected];
    for(const key in mapping)
    {
      if(mapping[key] > i)
      {
        mapping[key]--;
      }
    }

    json.models.splice(i, 1);

    Display.modelDelete();
  }

  // See if Alt-shift-P was pressed.
  if((e.which === 80) && (e.altKey === true) && (e.shiftKey === true) &&
     (e.ctrlKey === false))
  {
    x = -3.75;
    y = 23.25;
    z += 2.5
    update = true;
    precision = true;
  }

  if(update)
  {
    if(rz > 180)
    {
      rz -= 360;
    }
    if(rz <= -180)
    {
      rz += 360;
    }

    let model = Display.modelSetPosition(x, y, z, rx, ry, rz);
    if(model !== null)
    {
      let idx = mapping[model];

      json.models[idx].x = parseFloat(x.toFixed(2));
      json.models[idx].y = parseFloat(z.toFixed(2));
      json.models[idx].z = parseFloat(y.toFixed(2));
      json.models[idx].r = parseFloat(rz.toFixed(1));

      if(precision)
      {
        for(let i = 1; i < 6; i++)
        {
          let uuid_new = Display.modelDuplicate();

          mapping[uuid_new] = json.models.length;

          json.models[json.models.length] = {...json.models[idx]};
          json.models[json.models.length - 1].x = x + (1.5 * i);

          Display.modelSetPosition(x + (1.5 * i), y, z, rx, ry, rz, uuid_new);
        }
      }
    }
  }
}