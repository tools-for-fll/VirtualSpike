// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

let editor;

let buffers = [];

export function
init()
{
  editor = ace.edit("ace_editor");
  editor.setOption("showGutter", true);
  editor.setKeyboardHandler("ace/keyboard/emacs");
  editor.setTheme("ace/theme/gob");

  addBuffer(null);

  $("#editor .nav .add").on("click", addBuffer);
}

export function
focus()
{
  editor.focus();
}

export function
newBuffer(name, text)
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
  newTab.find(".close").on("click", closeBuffer);

  buffers[name] = ace.createEditSession(text);

  buffers[name].setMode("ace/mode/python");
  buffers[name].setUseSoftTabs(true);
  buffers[name].on("change", function(delta)
                             {
                               editBuffer(newTab);
                             });

  restoreBuffer(name);
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

function
saveBuffer()
{
  let name = $("#editor .nav li.active .name").text();

  if(name != "")
  {
    buffers[name] = editor.getSession();
  }
}

function
restoreBuffer(name)
{
  editor.setSession(buffers[name]);
  editor.focus();
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
}

function
editBuffer(tab)
{
  tab.find("button i").removeClass("fa-close").addClass("fa-circle");
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
      newBuffer(name + ".py", "# Type your code here!");

      break;
    }
  }

  if(e != null)
  {
    e.stopPropagation();
  }
}