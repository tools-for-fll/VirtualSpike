// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

let editor;

let buffers = [];

let robotResetHandler = null;

/*
let defaultText = `# start_position: 15.5 8.5 45
# left_wheel: A
# right_wheel: E
# wheel_diameter: 56
# wheel_track: 112

from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

hub = PrimeHub()`;
*/
let defaultText = `# start_position: 72.9 4.24 90
# left_wheel: A
# right_wheel: E
# wheel_diameter: 56
# wheel_track: 112

from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch
import umath

KP_GYRO = 3.0
"""
The kP for driving straight with the gyro sensor.
"""

KD_GYRO = 0.3
"""
The kD for driving straight with the gyro sensor.
"""

WHEEL_DIAMETER_MM = 56
"""
The diameter of the drive wheels, in millimeters.
"""

WHEEL_WIDTH_MM = 14 * 8
"""
The width of the drive base, in millimeters.
"""

HUB = PrimeHub()
"""
The object for accessing the Spike Prime hub.
"""

DRIVE_L = Motor(Port.A, Direction.COUNTERCLOCKWISE)
"""
The left drive motor.
"""

DRIVE_R = Motor(Port.E, Direction.CLOCKWISE)
"""
The right drive motor.
"""

DRIVE = DriveBase(DRIVE_L, DRIVE_R, WHEEL_DIAMETER_MM, WHEEL_WIDTH_MM)
"""
The drive base, using the gyro to maintain the heading while driving and set
the heading while turning.
"""

def inches_to_mm(inches: Number) -> Number:
    """
    Converts from inches to millimeters.

    Parameters
    ----------

    inches: Number

    The number of inches to be converted.

    Returns
    -------

    The number of millimeters corresponding to the provided number of inches.
    """
    return inches * 25.4

def convert_inches_to_degrees(inches: Number) -> Number:
    """
    Converts inches of travel to degrees of wheel rotation.

    Parameters
    ----------

    inches: Number

    The number of inches of travel.

    Returns
    -------

    The number of degrees of rotation.
    """
    return (inches * 25.4 * 360) / (umath.pi * WHEEL_DIAMETER_MM)

def convert_degrees_to_inches(degrees: Number) -> Number:
    """
    Converts degrees of wheel rotation to inches of travel.

    Parameters
    ----------

    degrees: Number

    The number of degrees of rotation.

    Returns
    -------

    The number of inches of travel.
    """
    return (degrees * umath.pi * WHEEL_DIAMETER_MM) / (25.4 * 360)

def get_position_degrees() -> Number:
    """
    Gets the drive position in degrees.

    Returns
    -------

    The number of degrees of travel.
    """
    return (DRIVE_L.angle() + DRIVE_R.angle()) / 2

def get_position_inches() -> Number:
    """
    Gets the drive position in inches.

    Returns
    -------

    The number of inches of travel.
    """
    return convert_degrees_to_inches(get_position_degrees())

def __steer(power: Number, steering: Number) -> None:
    """
    Starts the drive motors running at a fixed speed.

    Parameters
    ----------

    power: Number

    The power of the fastest motor.

    steering: Number

    How much to steer the robot to the left (negative values) or to the right
    (positive values).  This ranges from -100 to 100.
    """
    if steering <= 0:
        left = (power * (50 + steering)) / 50
        right = power
    else:
        left = power
        right = (power * (50 - steering)) / 50
    DRIVE_L.dc(left)
    DRIVE_R.dc(right)

def stop() -> None:
    """
    Stops the drive train, holding the current position.
    """
    DRIVE_L.hold()
    DRIVE_R.hold()

def __angle_wrap(angle: Number) -> Number:
    """
    Wraps an angle to be between -180 and 180 degrees.

    Parameters
    ----------

    angle: Number

    The angle to wrap.

    Returns
    -------

    The input angle wrapped to be between -180 and 180 degrees.
    """
    while angle > 180:
        angle = angle - 360
    while angle < -180:
        angle = angle + 360
    return angle

def __gyro_delta(angle: Number) -> Number:
    """
    Computes the difference between the current heading and the reference angle.

    Parameters
    ----------

    angle: Number

    The reference angle.

    Returns
    -------

    The difference between the current heading and the reference angles.
    """
    return __angle_wrap(angle - HUB.imu.heading())

def gyro_kernel_reset() -> list[Number]:
    """
    Resets the state of the gyro kernel PID controller, preparing it to start
    fresh.
    """
    # Reset the PID controller state.
    return [0, 0]

def gyro_kernel(state: list[Number], angle: Number, power: Number = 50,
                kP: Number = 0.0, kI: Number = 0.0, kD: Number = 0.0,
                iReset: bool = False) -> None:
    """
    The inner kernel for the drive straight with the gyro algorithm.

    Parameters
    ----------

    angle: Number

    The direction the robot should travel.

    power: Number = 50

    The power to drive the robot.

    kP: Number = 0.0

    How aggressively the robot should respond to error.

    kI: Number = 0.0

    How aggressively the robot should respond to the accumulation of error over
    time.

    kD: Number = 0.0

    How much dampening should be applied based on the rate of change of the
    error.

    iReset: bool = false

    If the accumulation of error should be reset to zero when the error is zero.
    """
    # Compute the current error.
    error = __gyro_delta(angle)

    # Add the current error to the accumulator.
    #state[1] += error

    # Reset the gyro accumulator if requsted and the error is zero.
    #if error == 0 and iReset:
    #    state[1] = 0

    # Compute the change in error.
    #delta = error - state[0]

    # Start the robot moving in the direction given by the PID controller.
    #__steer(power, (error * kP) + (state[1] * kI) + (delta * kD))
    __steer(power, error * kP)

    # Save the current error for the next iteration of the loop.
    #state[0] = error

def gyro_drive_distance(angle: Number, distance: Number,
                        power: Number = 50) -> None:
    """
    Drives straight with the gyro for a distance specified in inches.

    Parameters
    ----------

    angle: Number

    The direction the robot should travel.

    distance: Number

    The distance in inches that the robot should travel.

    power: Number = 50

    The power to drive the robot.
    """
    if power == null:
        power = 50

    # Make sure the angle of travel is between -180 and 180.
    angle = __angle_wrap(angle)

    # Get the starting position of the robot.
    start = get_position_degrees()

    # Determine how far the robot needs to travel.
    distanceDegrees = convert_inches_to_degrees(distance)

    # Reset the gyro_kernel PID controller.
    state = gyro_kernel_reset()

    # See if the robot is driving forward or backwards.
    if distanceDegrees < 0:
        # Loop until the robot has driven the desired distance backwards.
        while (get_position_degrees() - start) > distanceDegrees:
            # Run an iteration of the gyro drive straight kernel.
            gyro_kernel(state, angle, 0 - power, 0 - KP_GYRO, 0, 0 - KD_GYRO)
    else:
        # Loop until the robot has driven the desired distance forward.
        while (get_position_degrees() - start) < distanceDegrees:
            # Run an iteration of the gyro drive straight kernel.
            gyro_kernel(state, angle, power, KP_GYRO, 0, KD_GYRO)

    # The desired distance has been covered, so stop the robot.
    stop()

def gyro_spin(angle: Number, direction: int = 0) -> None:
    """
    Spins the robot in place with the gyro, a single iteration.

    Parameters
    ----------

    angle: Number

    The desired heading after the spin.

    direction: int = 0

    The direction that the robot should turn.  If zero, it turns the shortest
    direction; if less than zero it turns to the left, and if greater than zero
    it turns to the right.
    """
    # Get the heading delta, which corresponds to how far the robot needs to
    # spin to reach the desired heading.
    angle = __gyro_delta(angle)

    # If a left (counter-clockwise) spin direction has been requested, and the
    # heading delta would make the robot spin to the right (clockwise), update
    # the delta to make the robot spin to the left instead.
    if (direction < 0) and (angle > 0):
        angle = angle - 360

    # If a right (clockwise) spin direction has been requested, and the heading
    # delta would make the robot spin to the left (counter-clockwise), update
    # the delta to make the robot spin to the right instead.
    if (direction > 0) and (angle < 0):
        angle = angle + 360

    # Perform a turn of the desired amount.
    DRIVE.turn(angle)

def m_sweeper() -> None:
    """
    A mission that sweeps all the frame games pieces from the table.  Starting
    from the blue launch area, the following game pieces are collected and
    returned to the blue home:

    * 3 Krill (two from the right side of the table and one from the left side)

    * 3 Reef Segments

    * The Water Sample

    The only one that actually scores during this is the Water Sample, which is
    moved outside of the Water Sample area (scoring 5 points).

    This takes ~18 seconds to run.
    """
    # Uncomment these lines to time the run.
    sw = StopWatch()
    sw.reset()
    sw.resume()

    # Square the robot against the wall so that it starts the mission
    # perpendicular to the wall/field.
    #wall_square(angle = 0)

    # Move the arms out of the way.
    #left_arm_to_angle(180, 0)
    #right_arm_to_angle(180, 0)

    # Drive away from the wall.
    gyro_drive_distance(0, 5)

    # Turn towards the first krill and drive until it is in the collector.
    gyro_spin(-10)
    gyro_drive_distance(-10, 8)

    # Turn towards the first reef segment and drive until it is in the
    # collector.
    gyro_spin(10)
    gyro_drive_distance(10,  6)

    # Turn towards the second krill and drive until it is in the collector.
    gyro_spin(-10)
    gyro_drive_distance(-10,  9)


    gyro_spin(-85)
    gyro_drive_distance(-85,  36)
    gyro_spin(-120)
    gyro_drive_distance(-120,  6)
    gyro_spin(-80)
    gyro_drive_distance(-80,  4)

    # Turn towards the water sample on the other side of the table and drive
    # until it is in the collector.
    #gyro_spin(-90)
    #gyro_drive_distance(-90,  43)

    # Turn towards the third krill and drive until it is in the collector.
    gyro_spin(-120)
    gyro_drive_distance(-120,  5)

    # Turn towards the second reef segment and drive until it is in the
    # collector.
    gyro_spin(-180)
    gyro_drive_distance(-180,  8)

    # Turn towards the third reef segment and drive until it is in the
    # collector, and continue into the red home area.
    gyro_spin(-135)
    gyro_drive_distance(-135,  16)

    # Uncomment these lines to time the run.
    sw.pause()
    print(sw.time() / 1000)

m_sweeper()`;

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
  let button = tab.find("button i");

  if(button.hasClass("fa-close"))
  {
    tab.find("button i").removeClass("fa-close").addClass("fa-circle");
  }
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
      newBuffer(name + ".py", defaultText);

      break;
    }
  }

  if(e != null)
  {
    e.stopPropagation();
  }
}