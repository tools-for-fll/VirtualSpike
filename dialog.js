// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

export async function
alert(message)
{
  function
  worker(resolve)
  {
    function
    done()
    {
      document.removeEventListener("keydown", onKeyDown);
      resolve(undefined);
    }

    function
    close()
    {
      $("#alert").close();
      done();
    }

    function
    onKeyDown(e)
    {
      if(e.key === "Escape")
      {
        done();
      }
    }

    $("#alert #message").html(message);

    $("#alert #ok").off("click");
    $("#alert #ok").on("click", close);

    document.addEventListener("keydown", onKeyDown);

    $("#alert").showModal();
  }

  return(await new Promise((resolve) => worker(resolve)));
}

export async function
confirm(message)
{
  function
  worker(resolve)
  {
    function
    done(ret)
    {
      document.removeEventListener("keydown", onKeyDown);
      resolve(ret);
    }

    function
    close(ret)
    {
      $("#confirm").close();
      done(ret);
    }

    function
    onKeyDown(e)
    {
      if(e.key === "Escape")
      {
        done(false);
      }
    }

    $("#confirm #message").html(message);

    $("#confirm #cancel").off("click");
    $("#confirm #cancel").on("click", () => close(false));
    $("#confirm #ok").off("click");
    $("#confirm #ok").on("click", () => close(true));

    document.addEventListener("keydown", onKeyDown);

    $("#confirm").showModal();
  }

  return(await new Promise((resolve) => worker(resolve)));
}