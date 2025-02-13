// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import { Axis } from "./parameters.js";

/**
 * The battery.
 */
class Battery
{
  /**
   * Gets the voltage of the battery.
   *
   * @returns Battery voltage, in mV.
   */
  voltage()
  {
    return(7200);
  }

  /**
   * Gets the current supplied by the battery.
   *
   * @returns Battery current, in mA.
   */
  current()
  {
    return(0);
  }

  /**
   * Checks whether a charger is connected via USB.
   *
   * @returns True if a charger is connected, False if not.
   */
  connected()
  {
    return(true);
  }

  /**
   * Gets the status of the battery charger, represented by one of the
   * following values.  This corresponds to the battery light indicator right
   * next to the USB port.
   *
   * 0: Not charging (light is off).
   *
   * 1: Charging (light is red).
   *
   * 2: Charging is complete (light is green).
   *
   * 3: There is a problem with the charger (light is yellow).
   *
   * @returns Status value.
   */
  status()
  {
    return(0);
  }
}

/**
 * Connectionless Bluetooth messaging.
 */
class BLE
{
  /**
   * Starts broadcasting the given data on the broadcast_channel you selected
   * when initializing the hub.
   *
   * Data may be of type int, float, str, bytes, True, or False, or a list
   * thereof.
   *
   * Choose None to stop broadcasting.  This helps improve performance when you
   * don’t need the broadcast feature, especially when observing at the same
   * time.
   *
   * The total data size is quite limited (26 bytes).  True and False take 1
   * byte each.  float takes 5 bytes.  int takes 2 to 5 bytes depending on how
   * big the number is.  str and bytes take the number of bytes in the object
   * plus one extra byte.
   *
   * When multitasking, only one task can broadcast at a time.  To broadcast
   * information from multiple tasks (or block stacks), you could use a
   * dedicated separate task that broadcast new values when one or more
   * variables change.
   *
   * @param data The value or values to be broadcast.
   */
  broadcast(data)
  {
  }

  /**
   * Retrieves the last observed data for a given channel.
   *
   * Receiving data is more reliable when the hub is not connected to a
   * computer or other devices at the same time.
   *
   * @param channel The channel to observe (0 to 255).
   *
   * @returns The received data in the same format as it was sent, or None if
   *          no recent data is available.
   */
  observe(channel)
  {
    return(null);
  }

  /**
   * Gets the average signal strength in dBm for the given channel.
   *
   * This indicates how near the broadcasting device is.  Nearby devices may
   * have a signal strength around -40 dBm, while far away devices might have a
   * signal strength around -70 dBm.
   *
   * @param channel The channel number (0 to 255).
   *
   * @returns The signal strength or -128 if there is no recent observed data.
   */
  signal_strength(channel)
  {
    return(-128);
  }

  /**
   * Gets the firmware version from the Bluetooth chip.
   *
   * @returns The firmware version from the Bluetooth chip.
   */
  version()
  {
    return("v1.4");
  }
}

/**
 * The buttons.
 */
class Buttons
{
  /**
   * Checks which buttons are currently pressed.
   *
   * @returns Set of pressed buttons.
   */
  pressed()
  {
    return([]);
  }

  /**
   * Sets the button or button combination that stops a running script.
   *
   * Normally, the center button is used to stop a running script.  You can
   * change or disable this behavior in order to use the button for other
   * purposes.
   *
   * @param button A button such as Button.CENTER, or a tuple of multiple
   *               buttons.  Choose None to disable the stop button altogether.
   *               If you do, you can still turn the hub off by holding the
   *               center button for three seconds.
   */
  set_stop_button(button)
  {
  }
}

/**
 * The light matrix display.
 */
class Display
{
  /**
   * Sets the orientation of the light matrix display.
   *
   * Only new displayed images and pixels are affected.  The existing display
   * contents remain unchanged.
   *
   * @param up Which side of the light matrix display is “up” in your design.
   *           Choose Side.TOP, Side.LEFT, Side.RIGHT, or Side.BOTTOM.
   */
  orientation(up)
  {
  }

  /**
   * Turns off all the pixels.
   */
  off()
  {
  }

  /**
   * Turns on one pixel at the specified brightness.
   *
   * @param row Vertical grid index, starting at 0 from the top.
   *
   * @param column Horizontal grid index, starting at 0 from the left.
   *
   * @param brightness Brightness of the pixel, in percent.
   */
  pixel(row, column, brightness = 100)
  {
  }

  /**
   * Displays an icon, represented by a matrix of brightness: % values.
   *
   * @param icon Matrix of intensities (brightness: %).  A 2D list is also
   *             accepted.
   */
  icon(icon)
  {
  }

  /**
   * Displays an animation made using a list of images.
   *
   * Each image has the same format as above.  Each image is shown for the
   * given interval. The animation repeats forever while the rest of your
   * program keeps running.
   *
   * @param matrices Sequence of Matrix of intensities.
   *
   * @param interval Time to display each image in the list, in ms.
   */
  animate(matrices, interval)
  {
  }

  /**
   * Displays a number in the range -99 to 99.
   *
   * A minus sign (-) is shown as a faint dot in the center of the display.
   * Numbers greater than 99 are shown as >.  Numbers less than -99 are shown
   * as <.
   *
   * @param number The number to be displayed.
   */
  number(number)
  {
  }

  /**
   * Displays a character or symbol on the light grid.  This may be any letter
   * (a–z), capital letter (A–Z) or one of the following symbols:
   *
   *     !"#$%&'()*+,-./:;<=>?@[\]^_`{|}.
   *
   * @param char The character or symbol to be displayed.
   */
  char(char)
  {
  }

  /**
   * Displays a text string, one character at a time, with a pause between each
   * character.  After the last character is shown, all lights turn off.
   *
   * @param text The text to be displayed.
   *
   * @param on For how long a character is shown, in ms.
   *
   * @param off For how long the display is off between characters, in ms.
   */
  text(text, on = 500, off = 50)
  {
  }
}

/**
 * The IMU.
 */
class IMU
{
  /**
   * Initializes the IMU.
   */
  constructor()
  {
    this._angular_velocity_threshold = 1.5;
    this._acceleration_threshold = 250;
    this._heading = 0;
  }

  /**
   * Checks if the device is calibrated and ready for use.
   *
   * This becomes True when the robot has been sitting stationary for a few
   * seconds, which allows the device to re-calibrate.  It is False if the hub
   * has just been started, or if it hasn’t had a chance to calibrate for more
   * than 10 minutes.
   *
   * @returns True if it is ready for use, False if not.
   */
  ready()
  {
    return(true);
  }

  /**
   * Checks if the device is currently stationary (not moving).
   *
   * @returns True if stationary for at least a second, False if it is moving.
   */
  stationary()
  {
    return(true);
  }

  /**
   * Checks which side of the hub currently faces upward.
   *
   * @returns Side.TOP, Side.BOTTOM, Side.LEFT, Side.RIGHT, Side.FRONT or
   *          Side.BACK.
   */
  up()
  {
    return(Side.Top);
  }

  /**
   * Gets the pitch and roll angles.  This is relative to the user-specified
   * neutral orientation.
   *
   * The order of rotation is pitch-then-roll.  This is equivalent to a
   * positive rotation along the robot y-axis and then a positive rotation
   * along the x-axis.
   *
   * @returns Tuple of pitch and roll angles in deg.
   */
  tilt()
  {
    return([0, 0]);
  }

  /**
   * Gets the acceleration of the device along a given axis in the robot
   * reference frame.
   *
   * @param axis Axis along which the acceleration should be measured.
   *
   * @returns Acceleration along the specified axis.
   */
  acceleration(axis)
  {
    return(0);
  }

  /**
   * Gets the acceleration of the device along all axes in the robot reference
   * frame.
   *
   * @returns A vector of accelerations along all axes.
   */
  acceleration()
  {
    return([0, 0, 0]);
  }

  /**
   * Gets the angular velocity of the device along a given axis in the robot
   * reference frame.
  *
   * @param axis Axis along which the angular velocity should be measured.
   *
   * @returns Angular velocity along the specified axis.
   */
  angular_velocity(axis)
  {
    return(0);
  }

  /**
   * Gets the angular velocity of the device along all axes in the robot
   * reference frame.
   *
   * @returns A vector of accelerations along all axes.
   */
  angular_velocity()
  {
    return([0, 0, 0]);
  }

  /**
   * Gets the heading angle of your robot.  A positive value means a clockwise
   * turn.
   *
   * The heading is 0 when your program starts.  The value continues to grow
   * even as the robot turns more than 180 degrees.  It does not wrap around to
   * -180 like it does in some apps.
   *
   * @returns Heading angle relative to starting orientation.
   */
  heading()
  {
    return(this._heading);
  }

  /**
   * Resets the accumulated heading angle of the robot.
   *
   * @param angle Value to which the heading should be reset.
   */
  reset_heading(angle)
  {
    if(angle === null)
    {
      this._heading = 0;
    }
    else
    {
      this._heading = angle;
    }
  }

  /**
   * Gets the rotation of the device along a given axis in the robot reference
   * frame.
   *
   * The value starts counting from 0 when you initialize this class.
   *
   * @param axis Axis along which the rotation should be measured.
   *
   * @returns The rotation angle.
   */
  rotation(axis)
  {
    if(axis === Axis.Z)
    {
      return(this._heading);
    }
    else
    {
      return(0);
    }
  }

  /**
   * Gets the three-dimensional orientation of the robot in the robot reference
   * frame.
   *
   * It returns a rotation matrix whose columns represent the X, Y, and Z axis
   * of the robot.
   *
   * @returns The rotation matrix.
   */
  orientation()
  {
    return([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  }

  /**
   * Configures the IMU settings.
   *
   * The angular_velocity_threshold and acceleration_threshold define when the
   * hub is considered stationary.  If all measurements stay below these
   * thresholds for one second, the IMU will recalibrate itself.
   *
   * In a noisy room with high ambient vibrations (such as a competition hall),
   * it is recommended to increase the thresholds slightly to give your robot
   * the chance to calibrate.  To verify that your settings are working as
   * expected, test that the stationary() method gives False if your robot is
   * moving, and True if it is sitting still for at least a second.
   *
   * @param angular_velocity_threshold The threshold for angular velocity.  The
   *                                   default value is 1.5 deg/s.
   *
   * @param acceleration_threshold The threshold for acceleration.  The default
   *                               value is 250 mm/s².
   */
  settings(angular_velocity_threshold, acceleration_threshold)
  {
    this._angular_velocity_threshold = angular_velocity_threshold;
    this._acceleration_threshold = acceleration_threshold;
  }

  /**
   * Gets the IMU settings.
   *
   * @returns The current IMU settings.
   */
  settings()
  {
    return([this._angular_velocity_threshold, this._acceleration_threshold]);
  }
}

/**
 * The hub status light.
 */
class Light
{
  /**
   * Turns on the light at the specified color.
   *
   * @param color Color of the light.
   */
  on(color)
  {
  }

  /**
   * Turns off the light.
   */
  off()
  {
  }

  /**
   * Blinks the light at a given color by turning it on and off for given
   * durations.
   *
   * The light keeps blinking indefinitely while the rest of your program keeps
   * running.
   *
   * This method provides a simple way to make basic but useful patterns.  For
   * more generic and multi-color patterns, use animate() instead.
   *
   * @param color Color of the light.
   *
   * @param duration Sequence of time values of the form [on_1, off_1, on_2,
   *                 off_2, ...].
   */
  blink(color, duration)
  {
  }

  /**
   * Animates the light with a sequence of colors, shown one by one for the
   * given interval.
   *
   * The animation runs in the background while the rest of your program keeps
   * running.  When the animation completes, it repeats.
   *
   * @param colors Sequence of Color values.
   *
   * @param interval Time between color updates, in ms.
   */
  animate(colors, interval)
  {
  }
}

/**
 * The speaker.
 */
class Speaker
{
  /**
   * Sets the speaker volume.
   *
   * @param volume Volume of the speaker in the 0-100 range.
   */
  volume(volume)
  {
  }

  /**
   * Gets the speaker volume.
   *
   * @returns Volume of the speaker in the 0-100 range.
   */
  volume()
  {
    return(100);
  }

  /**
   * Play a beep/tone.
   *
   * @param frequency Frequency of the beep in the 64-24000 Hz range.
   *
   * @param duration Duration of the beep, in ms.  If the duration is less than
   *                 0, then the method returns immediately and the frequency
   *                 play continues to play indefinitely.
   */
  beep(frequency = 500, duration = 100)
  {
  }

  /**
   * Plays a sequence of musical notes.  For example: ["C4/4", "C4/4", "G4/4",
   * "G4/4"].
   *
   * Each note is a string with the following format:
   *
   * - The first character is the name of the note, A to G or R for a rest.
   *
   * - Note names can also include an accidental # (sharp) or b (flat).  B#/Cb
   *   and E#/Fb are not allowed.
   *
   * - The note name is followed by the octave number 2 to 8.  For example C4
   *   is middle C.  The octave changes to the next number at the note C,
   *   for example, B3 is the note below middle C (C4).
   *
   * - The octave is followed by / and a number that indicates the size of the
   *   note.  For example /4 is a quarter note, /8 is an eighth note and so on.
   *
   * - This can optionally followed by a . to make a dotted note.  Dotted notes
   *   are 1-1/2 times as long as notes without a dot.
   *
   * - The note can optionally end with a _ which is a tie or a slur.  This
   *   causes there to be no pause between this note and the next note.
   *
   * @param notes A sequence of notes to be played.
   *
   * @param tempo Beats per minute. A quarter note is one beat.
   */
  play_notes(notes, tempo = 120)
  {
  }
}

/**
 * The system control.
 */
class System
{
  /**
   * Gets the hub name.  This is the name you see when connecting via
   * Bluetooth.
   *
   * @returns The hub name.
   */
  name()
  {
    return("VirtualSpike");
  }

  /**
   * Reads or writes binary data to persistent storage.
   *
   * This lets you store data that can be used the next time you run the
   * program.
   *
   * The data will be saved to flash memory when you turn the hub off normally.
   * It will not be saved if the batteries are removed while the hub is still
   * running.
   *
   * Once saved, the data will remain available even after you remove the
   * batteries.
   *
   * @param offset The offset from the start of the user storage memory, in
   *               bytes.
   *
   * @param read The number of bytes to read.  Omit this argument when writing.
   *
   * @param write The bytes to write.  Omit this argument when reading.
   *
   * @returns The bytes read if reading, otherwise None.
   */
  storage(offset, read = null, write = null)
  {
    if(read !== null)
    {
      return([]);
    }
    else
    {
      return(null);
    }
  }

  /**
   * Stops your program and shuts the hub down.
   */
  shutdown()
  {
  }

  /**
   * Finds out how and why the hub (re)booted.  This can be useful to diagnose
   * some problems.
   *
   * @returns 0 if the hub was previously powered off normally, 1 if the hub
   *          rebooted automatically, like after a firmware update, or 2 if the
   *          hub previously crashed due to a watchdog timeout, which indicates
   *          a firmware issue.
   */
  reset_reason()
  {
    return(0);
  }
}

/**
 * LEGO® SPIKE Prime Hub.
 */
class _PrimeHub
{
  /**
   * Initializes the hub.  Optionally, specify how the hub is placed in your
   * design by saying in which direction the top side (with the buttons) and
   * front side (with the USB port) are pointing.
   *
   * @param top_side The axis that passes through the top side of the hub.
   *
   * @param front_side The axis that passes through the front side of the hub.
   *
   * @param broadcast_channel A value from 0 to 255 indicating which channel
   *                          hub.ble.broadcast() will use.  Default is channel
   *                          0.
   *
   * @param observe_channels A list of channels to listen to when
   *                         hub.ble.observe() is called.  Listening to more
   *                         channels requires more memory.  Default is an
   *                         empty list (no channels).
   */
  constructor(top_side = Axis.Z, front_side = Axis.X, broadcast_channel = 0,
              observe_channels = [])
  {
  }

  /**
   * The battery.
   */
  battery = new Battery();

  /**
   * Connectionless Bluetooth messaging.
   */
  ble = new BLE();

  /**
   * The buttons.
   */
  buttons = new Buttons();

  /**
   * The light matrix display.
   */
  display = new Display();

  /**
   * The IMU.
   */
  imu = new IMU();

  /**
   * The hub status light.
   */
  light = new Light();

  /**
   * The speaker.
   */
  speaker = new Speaker();

  /**
   * The system control.
   */
  system = new System();
}

// The PrimeHub singleton.
export let _hub = new _PrimeHub();

/**
 * LEGO® SPIKE Prime Hub.
 */
export function
PrimeHub()
{
  // Return the PrimeHub singleton.
  return(_hub);
}