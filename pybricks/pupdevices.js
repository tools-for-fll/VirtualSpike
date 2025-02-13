// Copyright (c) 2025 Brian Kircher
//
// Open Source Software: you can modify and/or share it under the terms of the
// BSD license file in the root directory of this project.

import { Direction, Port, Stop } from "./parameters.js";
import { wait } from "./tools.js";
import * as sim from "../sim.js";

/**
 * The device types, used to track what is populated in each port of the hub
 * (accoridng to the code).
 */
class _DeviceType
{
  ColorSensor = 1;
  ForceSensor = 2;
  Motor = 3;
  UltrasonicSensor = 4;
}

/**
 * The device types.
 */
export let DeviceType = new _DeviceType();

/**
 * The types of the devices connected to each port of the hub.
 */
export let deviceType = [];

/**
 * The object used to access the device connected to each port of the hub.
 */
export let devicesUsed = [];

/**
 * The LEGO® SPIKE Color Sensor's built-in lights.
 */
class _ColorSensor_Light
{
  /**
   * Turns on the lights at the specified brightness.
   *
   * @param brightness Use a single value to set the brightness of all lights
   *                   at the same time.  Use an array of three values to set
   *                   the brightness of each light individually.
   */
  on(brightness)
  {
  }

  /**
   * Turns off all the lights.
   */
  off()
  {
  }
}

/**
 * LEGO® SPIKE Color Sensor.
 */
class _ColorSensor
{
  /**
   * LEGO® SPIKE Color Sensor.
   *
   * @param port Port to which the sensor is connected.
   */
  constructor(port)
  {
    // Throw an error if this is an invalid or already used port.
    if(port > Port.F)
    {
      throw InvalidPort;
    }
    if(devicesUsed[port] !== undefined)
    {
      throw PortAlreadyInUse;
    }

    // Save information about the device attached to this port.
    deviceType[port] = DeviceType.ColorSensor;
    devicesUsed[port] = this;
  }

  /**
   * Scans the color of a surface or an external light source.
   *
   * You choose which colors are detected using the detectable_colors() method.
   * By default, it detects Color.RED, Color.YELLOW, Color.GREEN, Color.BLUE,
   * Color.WHITE, or Color.NONE.
   *
   * @param surface Choose true to scan the color of objects and surfaces.
   *                Choose false to scan the color of screens and other
   *                external light sources.
   *
   * @returns Detected color.
   */
  color(surface = true)
  {
    return(null);
  }

  /**
   * Measures how much a surface reflects the light emitted by the sensor.
   *
   * @returns Measured reflection, ranging from 0% (no reflection) to 100%
   *          (high reflection).
   */
  reflection()
  {
    return(0);
  }

  /**
   * Measures the ambient light intensity.
   *
   * @returns Ambient light intensity, ranging from 0% (dark) to 100% (bright).
   */
  ambient()
  {
    return(0);
  }

  /**
   * Scans the color of a surface or an external light source.
   *
   * This method is similar to color(), but it gives the full range of hue,
   * saturation and brightness values, instead of rounding it to the nearest
   * detectable color.
   *
   * @param surface Choose true to scan the color of objects and surfaces.
   *                Choose false to scan the color of screens and other
   *                external light sources.
   *
   * @returns Measured color.  The color is described by a hue (0–359), a
   *          saturation (0–100), and a brightness value (0–100).
   */
  hsv(surface = true)
  {
    return([ 0, 0, 0 ]);
  }

  /**
   * Configures which colors the color() method should detect.
   *
   * Specify only colors that you wish to detect in your application.  This
   * way, the full-color measurements are rounded to the nearest desired color,
   * and other colors are ignored.  This improves reliability.
   *
   * @param colors List of Color objects: the colors that you want to detect.
   *               You can pick standard colors such as Color.MAGENTA, or
   *               provide your own colors like Color(h=348, s=96, v=40) for
   *               even better results.  You measure your own colors with the
   *               hsv() method.
   */
  detectable_colors(colors)
  {
  }

  /**
   * Gets which colors the color() method should detect.
   *
   * @returns A list of color objects.
   */
  detectable_colors()
  {
    return(null);
  }

  /**
   * The built-in lights;
   */
  lights = new _ColorSensor_Light();
}

/**
 * LEGO® SPIKE Color Sensor.
 *
 * @param port Port to which the sensor is connected.
 *
 * @returns The object for controlling the color sensor.
 */
export function
ColorSensor(port)
{
  return(new _ColorSensor(port));
}

/**
 * LEGO® SPIKE Force Sensor.
 */
class _ForceSensor
{
  /**
   * LEGO® SPIKE Force Sensor.
   *
   * @param port Port to which the sensor is connected.
   */
  constructor(port)
  {
    // Throw an error if this is an invalid or already used port.
    if(port > Port.F)
    {
      throw InvalidPort;
    }
    if(devicesUsed[port] !== undefined)
    {
      throw PortAlreadyInUse;
    }

    // Save information about the device attached to this port.
    deviceType[port] = DeviceType.ForceSensor;
    devicesUsed[port] = this;
  }

  /**
   * Measures the force exerted on the sensor.
   *
   * @returns Measured force (up to approximately 10.00 N).
   */
  force()
  {
    return(0);
  }

  /**
   * Measures by how much the sensor button has moved.
   *
   * @returns Movement up to approximately 8.00 mm.
   */
  distance()
  {
    return(0);
  }

  /**
   * Checks if the sensor button is pressed.
   *
   * @param force Minimum force to be considered pressed, in N.
   *
   * @returns True if the sensor is pressed, False if it is not.
   */
  pressed(force = 3)
  {
    return(false);
  }

  /**
   * Checks if the sensor is touched.
   *
   * This is similar to pressed(), but it detects slight movements of the
   * button even when the measured force is still considered zero.
   *
   * @returns True if the sensor is touched or pressed, False if it is not.
   */
  touched()
  {
    return(false);
  }
}

/**
 * LEGO® SPIKE Force Sensor.
 *
 * @param port Port to which the sensor is connected.
 *
 * @returns The object for controlling the force sensor.
 */
export function
ForceSensor(port)
{
  return(new _ForceSensor(port));
}

/**
 * The control settings.
 */
class _Motor_Control
{
  /**
   * The default control settings.
   */
  constructor()
  {
    this._limit_speed = 1000;
    this._limit_acceleration = 2000;
    this._limit_torque = 199;
    this._kp = 15117;
    this._ki = 7558;
    this._kd = 1889;
    this._integral_deadzone = 8;
    this._integral_rate = 15;
    this._target_tolerance_speed = 50;
    this._target_tolerance_position = 11;
    this._stall_tolerance_speed = 20;
    this._stall_tolerance_time = 200;
  }

  /**
   * Configures the maximum speed, acceleration, and torque.
   *
   * The new acceleration and speed limit will become effective when you give a
   * new motor command.  Ongoing maneuvers are not affected.
   *
   * @param speed Maximum speed, in deg/s or mm/s.  All speed commands will be
   *              capped to this value.
   *
   * @param acceleration Slope of the speed curve when accelerating or
   *                     decelerating, in deg/s² or mm/s². Use a tuple to set
   *                     acceleration and deceleration separately. If one value
   *                     is given, it is used for both.
   *
   * @param torque Maximum feedback torque during control, in mNm.
   */
  limits(speed, acceleration, torque)
  {
    this._limit_speed = speed;
    this._limit_acceleration = acceleration;
    this._limit_torque = torque;
  }

  /**
   * Returns the maximum speed, acceleration, and torque.
   *
   * @returns An array with the maximum speed, acceleration, and torque.
   */
  limits()
  {
    return([ this._limit_speed, this._limit_acceleration,
             this._limit_torque ]);
  }

  /**
   * Sets the PID values for position and speed control.
   *
   * @param kp Proportional position control constant.  It is the feedback
   *           torque per degree of error: µNm/deg.
   *
   * @param ki Integral position control constant.  It is the feedback torque
   *           per accumulated degree of error: µNm/(deg s).
   *
   * @param kd Derivative position (or proportional speed) control constant.
   *           It is the feedback torque per unit of speed: µNm/(deg/s).
   *
   * @param integral_deadzone Zone around the target where the error integral
   *                          does not accumulate errors, in deg or mm.
   *
   * @param integral_rate Maximum rate at which the error integral is allowed
   *                      to grow, in deg/s or mm/s.
   */
  pid(kp, ki, kd, integral_deadzone, integral_rate)
  {
    this._kp = kp;
    this._ki = ki;
    this._kd = kd;
    this._integral_deadzone = integral_deadzone;
    this._integral_rate = integral_rate;
  }

  /**
   * Gets the PID values for position and speed control.
   *
   * @returns An array with the kp, ki, kd, integral_deadzone, and
   *          integral_rate.
   */
  pid()
  {
    return([ this._kp, this._ki, this._kd, this._integral_deadzone,
             this._integral_rate ]);
  }

  /**
   * sets the tolerances that say when a maneuver is done.
   *
   * @param speed Allowed deviation from zero speed before motion is considered
   *              complete, in deg/s or mm/s.
   *
   * @param position Allowed deviation from the target before motion is
   *                 considered complete, in deg or mm.
   */
  target_tolerances(speed, position)
  {
    this._target_tolerance_speed = speed;
    this._target_tolerance_position = position;
  }

  /**
   * Gets the tolerances that say when a maneuver is done.
   *
   * @returns An array with the speed and position.
   */
  target_tolerances()
  {
    return([ this._target_tolerance_speed, this._target_tolerance_position ]);
  }

  /**
   * Sets stalling tolerances.
   *
   * @param speed If the controller cannot reach this speed, in deg/s or mm/s,
   *              for some time even with maximum actuation, it is stalled.
   *
   * @param time How long, ms, the controller has to be below this minimum
   *             speed before we say it is stalled.
   */
  stall_tolerances(speed, time)
  {
    this._stall_tolerance_speed = speed;
    this._stall_tolerance_time = time;
  }

  /**
   * Gets stalling tolerances.
   *
   * @returns An array with the speed and time.
   */
  stall_tolerances()
  {
    return([ this._stall_tolerance_speed, this._stall_tolerance_time ]);
  }

  /**
   * Number of degrees that the motor turns to complete one degree at the
   * output of the gear train.  This is the gear ratio determined from the
   * gears argument when initializing the motor.
   */
  scale = 1000;
}

/**
 * The motor model.
 */
class _Motor_Model
{
  /**
   * Gets the estimated angle, speed, current, and stall state of the motor,
   * using a simulation model that mimics the real motor.  These estimates are
   * updated faster than the real measurements, which can be useful when
   * building your own PID controllers.
   *
   * For most applications it is better to used the measured angle, speed,
   * load, and stall state instead.
   *
   * @returns Array with the estimated angle (deg), speed (deg/s), current
   *          (mA), and stall state (True or False).
   */
  state()
  {
    return([ 0, 0, 0, false ]);
  }

  /**
   * Sets model settings as a tuple of integers.  This method is mainly used to
   * debug the motor model class.  Changing these settings should not be needed
   * in user programs.
   *
   * @param values Array with model settings.
   */
  settings(values)
  {
  }

  /**
   * Gets model settings as a tuple of integers.  This method is mainly used to
   * debug the motor model class.  Changing these settings should not be needed
   * in user programs.
   *
   * @returns Array with model settings.
   */
  settings()
  {
    return([ 20000, 2000, 2412, 75, 45, 315, 20000, 500 ]);
  }
}

/**
 * LEGO® Powered Up motor with rotation sensors.
 */
class _Motor
{
  // The various run modes of a motor.
  modeIdle = 0;
  modeRun = 1;
  modeDC = 2;
  modeRunTime = 3;
  modeRunAngle = 4;
  modeTrackTarget = 5;

  /**
   * LEGO® Powered Up motor with rotation sensors.
   *
   * @param port Port to which the motor is connected.
   *
   * @param positive_direction Which direction the motor should turn when you
   *                           give a positive speed value or angle.
   *
   * @param gears List of gears linked to the motor.  The gear connected to the
   *              motor comes first and the gear connected to the output comes
   *              last.
   *
   *              For example: [12, 36] represents a gear train with a 12-tooth
   *              gear connected to the motor and a 36-tooth gear connected to
   *              the output.  Use a list of lists for multiple gear trains,
   *              such as [[12, 36], [20, 16, 40]].
   *
   *              When you specify a gear train, all motor commands and
   *              settings are automatically adjusted to account for the
   *              resulting gear ratio.  The motor direction remains unchanged
   *              by this.
   *
   * @param reset_angle Choose True to reset the rotation sensor value to the
   *                    absolute marker angle (between -180 and 179).  Choose
   *                    False to keep the current value, so your program knows
   *                    where it left off last time.
   *
   * @param profile Precision profile.  This is the approximate position
   *                tolerance in degrees that is acceptable in your
   *                application.  A lower value gives more precise but more
   *                erratic movement; a higher value gives less precise but
   *                smoother movement.  If no value is given, a suitable
   *                profile for this motor type will be selected automatically
   *                (about 11 degrees).
   */
  constructor(port, positive_direction, gears, reset_angle, profile)
  {
    // Throw an error if this is an invalid or already used port.
    if(port > Port.F)
    {
      throw InvalidPort;
    }
    if(devicesUsed[port] !== undefined)
    {
      throw PortAlreadyInUse;
    }

    // Save information about the device attached to this port.
    deviceType[port] = DeviceType.Motor;
    devicesUsed[port] = this;

    // Initialize this motor.
    this._port = port;
    this._positive_direction = positive_direction;
    this._angle = 0;
    this._max_voltage = 9000;

    // If a gear train was supplied, compute and save the scaling factor.
    if(gears !== null)
    {
      let ratio;

      if(!Array.isArray(gears))
      {
        throw TypeError("'gears' isn't a tuple or list");
      }

      if(!Array.isArray(gears[0]))
      {
        ratio = gears[gears.length - 1] / gears[0];
      }
      else
      {
        ratio = 1;
        for(let i = 0; i < gears.length; i++)
        {
          if(!Array.isArray(gears[i]))
          {
            throw TypeError("'gears' isn't a list of tuples");
          }
          ratio *= gears[i][gears[i].length - 1] / gears[i][0];
        }
      }

      this.control.scale = Math.floor(ratio * 1000);
    }

    // The motor starts in idle mode.
    this._mode = this.modeIdle;
    this._speed = 0;
    this._time = 0;
    this._rotation_angle = 0;
    this._delta = 0;
  }

  /**
   * Gets the rotation angle of the motor.
   *
   * @returns Motor angle, in deg.
   */
  angle()
  {
    return(this._angle);
  }

  /**
   * Sets the accumulated rotation angle of the motor to a desired value.
   *
   * If you don’t specify an angle, the absolute angle will be used if your
   * motor supports it.
   *
   * @param angle Value to which the angle should be reset, in deg.
   */
  reset_angle(angle = null)
  {
    if(angle === null)
    {
      this._angle = 0;
    }
    else
    {
      this._angle = angle;
    }
  }

  /**
   * Gets the speed of the motor.
   *
   * The speed is measured as the change in the motor angle during the given
   * time window.  A short window makes the speed value more responsive to
   * motor movement, but less steady.  A long window makes the speed value less
   * responsive, but more steady.
   *
   * @param window The time window used to determine the speed, in ms.
   *
   * @returns Motor speed, in deg/s.
   */
  speed(window = 100)
  {
    return(0);
  }

  /**
   * Estimates the load that holds back the motor when it tries to move.
   *
   * @returns The load torque, in mNm.
   */
  load()
  {
    return(0);
  }

  /**
   * Checks if the motor is currently stalled.
   *
   * It is stalled when it cannot reach the target speed or position, even with
   * the maximum actuation signal.
   *
   * @returns True if the motor is stalled, False if not.
   */
  stalled()
  {
    return(false);
  }

  /**
   * Stops the motor and lets it spin freely.
   *
   * The motor gradually stops due to friction.
   */
  stop()
  {
    if(this._mode !== this.modeIdle)
    {
      this._mode = this.modeIdle;
      sim.sendEvent(sim.portEvent(this._port));
    }
  }

  /**
   * Passively brakes the motor.
   *
   * The motor stops due to friction, plus the voltage that is generated while
   * the motor is still moving.
   */
  brake()
  {
    if(this._mode !== this.modeIdle)
    {
      this._mode = this.modeIdle;
      sim.sendEvent(sim.portEvent(this._port));
    }
  }

  /**
   * Stops the motor and actively holds it at its current angle.
   */
  hold()
  {
    if(this._mode !== this.modeIdle)
    {
      this._mode = this.modeIdle;
      sim.sendEvent(sim.portEvent(this._port));
    }
  }

  /**
   * Runs the motor at a constant speed.
   *
   * The motor accelerates to the given speed and keeps running at this speed
   * until you give a new command.
   *
   * @param speed Speed of the motor, in deg/s.
   */
  async run(speed)
  {
    // Save the details for this run mode.
    this._mode = this.modeRun;
    this._speed = speed;

    // Wait for a millisecond, allowing the Javascript thread to do other
    // things.  This is needed in the case that this is being used inside a
    // user-defined control loop that might otherwise not wait, which would
    // lock up the entire Javascript engine, and therefore the entire web app.
    await wait(1);
  }

  /**
   * Rotates the motor at a given duty cycle (also known as “power”).
   *
   * @param duty The duty cycle (-100.0 to 100).
   */
  async dc(duty)
  {
    // Save the details for this run mode.
    this._mode = this.modeDC;
    this._speed = Math.pow(Math.abs(duty) / 100, 0.375) * duty * 10;

    // Wait for a millisecond, allowing the Javascript thread to do other
    // things.  This is needed in the case that this is being used inside a
    // user-defined control loop that might otherwise not wait, which would
    // lock up the entire Javascript engine, and therefore the entire web app.
    await wait(1);
  }

  /**
   * Runs the motor at a constant speed for a given amount of time.
   *
   * The motor accelerates to the given speed, keeps running at this speed, and
   * then decelerates.  The total maneuver lasts for exactly the given amount
   * of time.
   *
   * @param speed Speed of the motor, in deg/s.
   *
   * @param time Duration of the maneuver, in ms.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param wait Wait for the maneuver to complete before continuing with the
   *             rest of the program.
   */
  async run_time(speed, time, then = Stop.HOLD, wait = true)
  {
    // Save the details for this run mode.
    this._mode = this.modeRunTime;
    this._speed = speed;
    this._time = time;

    // If requested, wait until the maneuver is complete.
    if(wait)
    {
      await sim.waitForEvent(sim.portEvent(this._port));
    }
  }

  /**
   * Runs the motor at a constant speed by a given angle.
   *
   * @param speed Speed of the motor, in deg/s.
   *
   * @param rotation_angle Angle by which the motor should rotate, in deg.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param wait Wait for the maneuver to complete before continuing with the
   *             rest of the program.
   */
  async run_angle(speed, rotation_angle, then = Stop.HOLD, wait = true)
  {
    // Save the details for this run mode.
    this._mode = this.modeRunAngle;
    this._speed = Math.abs(speed);
    this._rotation_angle = rotation_angle;

    // If requested, wait until the maneuver is complete.
    if(wait)
    {
      await sim.waitForEvent(sim.portEvent(this._port));
    }
  }

  /**
   * Runs the motor at a constant speed towards a given target angle.
   *
   * The direction of rotation is automatically selected based on the target
   * angle.  It does not matter if speed is positive or negative.
   *
   * @param speed Speed of the motor, in deg/s.
   *
   * @param target_angle Angle that the motor should rotate to, in deg.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param wait Wait for the motor to reach the target before continuing with
   *             the rest of the program.
   */
  async run_target(speed, target_angle, then = Stop.HOLD, wait = true)
  {
    // Save the details for this run mode.
    this._mode = this.modeRunAngle;
    this._speed = Math.abs(speed);
    this._rotation_angle = target_angle - this._angle;

    // If requested, wait until the maneuver is complete.
    if(wait)
    {
      await sim.waitForEvent(sim.portEvent(this._port));
    }
  }

  /**
   * Runs the motor at a constant speed until it stalls.
   *
   * @param speed Speed of the motor, in deg/s.
   *
   * @param then What to do after coming to a standstill.
   *
   * @param duty_limit Duty cycle limit during this command.  This is useful to
   *                   avoid applying the full motor torque to a geared or
   *                   lever mechanism.  If it is None, the duty limit won’t be
   *                   changed during this command.
   *
   * @returns Angle at which the motor becomes stalled.
   */
  run_until_stalled(speed, then = Stop.COAST, duty_limit = null)
  {
    return(this._angle);
  }

  /**
   * Tracks a target angle.  This is similar to run_target(), but the usual
   * smooth acceleration is skipped: it will move to the target angle as fast
   * as possible.  This method is useful if you want to continuously change the
   * target angle.
   *
   * @param target_angle Target angle that the motor should rotate to, in deg.
   */
  track_target(target_angle)
  {
    // Save the details for this run mode.
    this._mode = this.modeTrackTarget;
    this._rotation_angle = target_angle;
  }

  /**
   * Checks if an ongoing command or maneuver is done.
   *
   * @returns True if the command is done, False if not.
   */
  done()
  {
    return(this._mode === this.modeIdle);
  }

  /**
   * Configures motor settings.
   *
   * @param max_voltage Maximum voltage applied to the motor during all motor
   *                    commands, in mV.
   */
  settings(max_voltage)
  {
    this._max_voltage = max_voltage;
  }

  /**
   * Gets the motor settings.
   *
   * @returns The maximum voltage applied to the motor during all motor
   *          commands, in mV.
   */
  settings()
  {
    return([ this._max_voltage, ]);
  }

  /**
   * Closes the motor object so you can call Motor again to initialize a new
   * object.
   *
   * This allows advanced users to change properties such as gearing in the
   * middle of the program, which can be useful for removeable attachments.
   */
  close()
  {
    deviceType[port] = undefined;
    devicesUsed[port] = undefined;
  }

  /**
   * The control settings.
   */
  control = new _Motor_Control();

  /**
   * The motor model.
   */
  model = new _Motor_Model();
}

/**
 * LEGO® Powered Up motor with rotation sensors.
 *
 * @param port Port to which the motor is connected.
 *
 * @param positive_direction Which direction the motor should turn when you
 *                           give a positive speed value or angle.
 *
 * @param gears List of gears linked to the motor.  The gear connected to the
 *              motor comes first and the gear connected to the output comes
 *              last.
 *
 *              For example: [12, 36] represents a gear train with a 12-tooth
 *              gear connected to the motor and a 36-tooth gear connected to
 *              the output.  Use a list of lists for multiple gear trains, such
 *              as [[12, 36], [20, 16, 40]].
 *
 *              When you specify a gear train, all motor commands and settings
 *              are automatically adjusted to account for the resulting gear
 *              ratio.  The motor direction remains unchanged by this.
 *
 * @param reset_angle Choose True to reset the rotation sensor value to the
 *                    absolute marker angle (between -180 and 179).  Choose
 *                    False to keep the current value, so your program knows
 *                    where it left off last time.
 *
 * @param profile Precision profile.  This is the approximate position
 *                tolerance in degrees that is acceptable in your application.
 *                A lower value gives more precise but more erratic movement;
 *                a higher value gives less precise but smoother movement.  If
 *                no value is given, a suitable profile for this motor type
 *                will be selected automatically (about 11 degrees).
 *
 * @returns The object for controlling the motor.
 */
export function
Motor(port, positive_direction = Direction.CLOCKWISE, gears = null,
      reset_angle = true, profile = null)
{
  return(new _Motor(port, positive_direction, gears, reset_angle, profile));
}

/**
 * The LEGO® SPIKE Ultrasonic Sensor's built-in lights.
 */
class _UltrasonicSensor_Light
{
  /**
   * Turns on the lights at the specified brightness.
   *
   * @param brightness Use a single value to set the brightness of all lights
   *                   at the same time.  Use an array of four values to set
   *                   the brightness of each light individually.
   */
  on(brightness)
  {
  }

  /**
   * Turns off all the lights.
   */
  off()
  {
  }
}

/**
 * LEGO® SPIKE Ultrasonic Sensor.
 */
class _UltrasonicSensor
{
  /**
   * LEGO® SPIKE Ultrasonic Sensor.
   *
   * @param port Port to which the sensor is connected.
   */
  constructor(port)
  {
    // Throw an error if this is an invalid or already used port.
    if(port > Port.F)
    {
      throw InvalidPort;
    }
    if(devicesUsed[port] !== undefined)
    {
      throw PortAlreadyInUse;
    }

    // Save information about the device attached to this port.
    deviceType[port] = DeviceType.UltrasonicSensor;
    devicesUsed[port] = this;
  }

  /**
   * Measures the distance between the sensor and an object using ultrasonic
   * sound waves.
   *
   * @returns Measured distance. If no valid distance was measured, it returns
   *          2000 mm.
   */
  distance()
  {
    return(2000);
  }

  /**
   * Checks for the presence of other ultrasonic sensors by detecting
   * ultrasonic sounds.
   *
   * @returns True if ultrasonic sounds are detected, False if not.
   */
  presence()
  {
    return(false);
  }

  /**
   * The built-in lights;
   */
  lights = new _UltrasonicSensor_Light();
}

/**
 * LEGO® SPIKE Ultrasonic Sensor.
 *
 * @param port Port to which the sensor is connected.
 *
 * @returns The object for controlling the ultrasonic sensor.
 */
export function
UltrasonicSensor(port)
{
  return(new _UltrasonicSensor(port));
}